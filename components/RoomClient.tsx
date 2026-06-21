"use client";

import { useEffect, useRef, useState } from "react";
import { initialHandle } from "@/components/TopBar";

type Player = { handle: string; prediction: string };
type ChatMsg = { handle: string; text: string };
type Room = {
  id: string;
  teamA: string;
  teamB: string;
  stage: string;
  date: string;
  poolWal: number;
  stakeWal: number;
  players: Player[];
};
type Resolution = {
  winnerTeam: string | "draw" | null;
  winners: string[];
  resolved: boolean;
  score?: string;
};

export function RoomClient({
  room,
  resolution,
  initialChat,
}: {
  room: Room;
  resolution: Resolution;
  initialChat: ChatMsg[];
}) {
  const [players, setPlayers] = useState<Player[]>(room.players);
  const [chat, setChat] = useState<ChatMsg[]>(initialChat);
  const [me, setMe] = useState("");
  const [pred, setPred] = useState("");
  const [msg, setMsg] = useState("");
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);
  const [posting, setPosting] = useState(false);
  const [dendamTyping, setDendamTyping] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const msgsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = initialHandle();
    if (h && h !== "anon") setMe(h);
  }, []);

  // Keep the thread scrolled to the newest message.
  useEffect(() => {
    msgsRef.current?.scrollTo({ top: 1e9, behavior: "smooth" });
  }, [chat, dendamTyping]);

  // Lightweight "live": poll the room's Walrus thread so other people's posts
  // show up without a manual refresh. Merge only what's new; never drop local
  // optimistic posts or Dendam's lines.
  useEffect(() => {
    let alive = true;
    async function poll() {
      try {
        const res = await fetch(`/api/memories?handle=${encodeURIComponent("room-" + room.id)}`);
        const data = await res.json().catch(() => ({}));
        const incoming: ChatMsg[] = (data?.memories || []).map(
          (m: { team?: string; text: string }) => ({ handle: m.team || "anon", text: m.text }),
        );
        if (!alive || incoming.length === 0) return;
        setChat((cur) => {
          const seen = new Set(cur.map((m) => m.handle.toLowerCase() + "|" + m.text));
          const fresh = incoming.filter((m) => !seen.has(m.handle.toLowerCase() + "|" + m.text));
          return fresh.length ? [...cur, ...fresh] : cur;
        });
      } catch {
        /* next tick retries */
      }
    }
    const t = setInterval(poll, 12000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [room.id]);

  const open = !resolution.resolved;
  const payoutEach = resolution.winners.length > 0 ? room.poolWal / resolution.winners.length : 0;
  const iWon = !!me && resolution.winners.includes(me.trim().toLowerCase());

  async function post() {
    const handle = me.trim().replace(/^@/, "");
    const text = msg.trim();
    if (!handle || !text || posting) return;
    setPosting(true);
    const next = [...chat, { handle, text }];
    setChat(next);
    setMsg("");
    // persist to Walrus (best-effort, in the background)
    fetch("/api/room/post", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ roomId: room.id, handle, message: text }),
    }).catch(() => {});
    // Dendam automatically jumps in — no button.
    setDendamTyping(true);
    try {
      const res = await fetch("/api/room/dendam", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teamA: room.teamA, teamB: room.teamB, messages: next.slice(-8) }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.line) setChat((c) => [...c, { handle: "Dendam", text: data.line }]);
    } catch {
      /* Dendam stays quiet on error */
    } finally {
      setDendamTyping(false);
      setPosting(false);
    }
  }

  async function join() {
    const handle = me.trim().replace(/^@/, "");
    const prediction = pred.trim();
    if (!handle || !prediction) return;
    setBusy(true);
    setPlayers((p) => [...p.filter((x) => x.handle !== handle), { handle, prediction }]);
    setJoined(true);
    try {
      await fetch("/api/room/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handle, match: room.id, prediction }),
      });
    } catch {
      /* best-effort */
    } finally {
      setBusy(false);
    }
  }

  function Bubble({ m }: { m: ChatMsg }) {
    const isDendam = m.handle.toLowerCase() === "dendam";
    const isMe = !!me && m.handle.toLowerCase() === me.trim().toLowerCase();
    const side = isMe ? "user" : "";
    const bubble = isDendam ? "assistant" : isMe ? "user" : "peer";
    return (
      <div className={`msg-row ${side}`}>
        <div className={`avatar ${isDendam ? "dendam" : "you"}`} aria-hidden>
          {isDendam ? "🔥" : "🧑"}
        </div>
        <div className={`msg ${bubble}`}>
          <div className="who">{isDendam ? "Dendam" : "@" + m.handle}</div>
          <span>{m.text}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* mock prize banner */}
      <div className="prize-banner">
        <div>
          <div className="prize-amount">🏆 {room.poolWal} WAL pool</div>
          <div className="prize-sub">winner takes all · {room.stakeWal} WAL to enter</div>
        </div>
        <span className="prize-mock" title="No real funds move — this is a demo of the concept">
          MOCK PRIZES (demo)
        </span>
      </div>

      <p className="hint" style={{ marginTop: 14 }}>
        {open ? (
          <>🟢 <b>Open</b> — {players.length} predicting. Jump in the chat.</>
        ) : (
          <>
            🏁 <b>Full time:</b> {resolution.score} ·{" "}
            {resolution.winners.length > 0 ? (
              <>
                winner(s): {resolution.winners.map((w) => "@" + w).join(", ")} — split{" "}
                <b>{payoutEach.toFixed(2)} WAL</b> each (mock).
              </>
            ) : (
              "nobody called it — pool rolls over (mock)."
            )}
          </>
        )}
      </p>

      {/* ── Room chat (real chat-room look) ─────── */}
      <div className="section-head" style={{ marginTop: 20 }}>
        <h3>💬 Room chat</h3>
        <span className="count">🟢 live · {room.teamA} vs {room.teamB} · on Walrus</span>
      </div>

      <div className="chatroom">
        <div className="chatroom-msgs" ref={msgsRef}>
          {chat.length === 0 && (
            <div className="chatroom-empty">
              No messages yet — say something about {room.teamA} vs {room.teamB}. Dendam&rsquo;s listening.
            </div>
          )}
          {chat.map((m, i) => (
            <Bubble key={i} m={m} />
          ))}
          {dendamTyping && (
            <div className="msg-row">
              <div className="avatar dendam" aria-hidden>🔥</div>
              <div className="msg assistant">
                <div className="who">Dendam</div>
                <span className="typing" aria-label="Dendam is typing">
                  <i /><i /><i />
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="chatroom-composer">
          <span className="chatroom-as" title="Your nickname in this room">
            @
            <input
              value={me}
              onChange={(e) => setMe(e.target.value)}
              placeholder="you"
              maxLength={40}
              aria-label="Your nickname"
            />
          </span>
          <input
            className="chatroom-input"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && post()}
            placeholder="Message the room…"
            aria-label="Message the room"
            maxLength={280}
          />
          <button className="btn sm" onClick={post} disabled={posting || !me.trim() || !msg.trim()}>
            {posting ? "…" : "Send"}
          </button>
        </div>
      </div>

      {/* ── Calls (predictions) ─────────────────── */}
      <div className="section-head" style={{ marginTop: 24 }}>
        <h3>📣 The calls</h3>
        <span className="count">who&rsquo;s backing whom · winner takes the pool</span>
      </div>
      {open && !joined && (
        <div className="room-join">
          <input
            className="room-pred"
            value={pred}
            onChange={(e) => setPred(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && join()}
            placeholder={`Your official call for ${room.teamA} vs ${room.teamB}…`}
            aria-label="Your prediction"
          />
          <button className="btn sm" onClick={join} disabled={busy || !me.trim() || !pred.trim()}>
            {busy ? "Locking…" : `Stake ${room.stakeWal} WAL & lock it`}
          </button>
        </div>
      )}
      {joined && (
        <p className="hint" style={{ color: "var(--accent-soft)" }}>
          ✓ Call locked — staked {room.stakeWal} WAL (mock). It&rsquo;s saved on Walrus and now lives in your File too.
        </p>
      )}

      <div className="dossier-grid" style={{ marginTop: 12 }}>
        {players.map((p) => {
          const won = resolution.winners.includes(p.handle.toLowerCase());
          return (
            <div key={p.handle} className="grudge" style={won ? { borderLeftColor: "var(--green)" } : undefined}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <b>@{p.handle}</b>
                {!open && won && <span className="tag ok">🏆 won {payoutEach.toFixed(2)} WAL</span>}
              </div>
              <div style={{ marginTop: 4 }}>&ldquo;{p.prediction}&rdquo;</div>
            </div>
          );
        })}
      </div>

      {!open && iWon && (
        <div className="cta-row" style={{ justifyContent: "flex-start", marginTop: 16 }}>
          <button className="btn" onClick={() => setClaimed(true)} disabled={claimed}>
            {claimed ? `✓ Claimed ${payoutEach.toFixed(2)} WAL (mock)` : `💰 Claim ${payoutEach.toFixed(2)} WAL`}
          </button>
        </div>
      )}
    </>
  );
}
