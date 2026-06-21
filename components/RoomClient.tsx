"use client";

import { useEffect, useState } from "react";
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
  const [stirring, setStirring] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const h = initialHandle();
    if (h && h !== "anon") setMe(h);
  }, []);

  const open = !resolution.resolved;
  const payoutEach =
    resolution.winners.length > 0 ? room.poolWal / resolution.winners.length : 0;
  const iWon = !!me && resolution.winners.includes(me.trim().toLowerCase());

  async function post() {
    const handle = me.trim().replace(/^@/, "");
    const text = msg.trim();
    if (!handle || !text) return;
    setPosting(true);
    setChat((c) => [...c, { handle, text }]);
    setMsg("");
    try {
      await fetch("/api/room/post", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ roomId: room.id, handle, message: text }),
      });
    } catch {
      /* optimistic entry stays; the write is best-effort */
    } finally {
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

  async function weighIn() {
    const handles = players.map((p) => p.handle).slice(0, 12);
    if (handles.length < 2) return;
    setStirring(true);
    try {
      const res = await fetch("/api/kompor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handles }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const lines: string[] = (data.provocations || []).map((p: { line: string }) => p.line);
        setChat((c) => [...c, ...lines.map((l) => ({ handle: "Dendam", text: l }))]);
      }
    } catch {
      /* ignore */
    } finally {
      setStirring(false);
    }
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
          <>🟢 <b>Open</b> — {players.length} predicting. Talk it out below.</>
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

      {/* ── Room chat ───────────────────────────── */}
      <div className="section-head" style={{ marginTop: 22 }}>
        <h3>💬 Room chat</h3>
        <span className="count">everyone in this match · saved on Walrus</span>
      </div>

      {chat.length === 0 ? (
        <p className="hint" style={{ marginTop: 0 }}>
          No messages yet — be the first to talk trash about {room.teamA} vs {room.teamB}.
        </p>
      ) : (
        <div className="room-chat">
          {chat.map((m, i) => {
            const isDendam = m.handle.toLowerCase() === "dendam";
            return (
              <div key={i} className={`msg-row ${isDendam ? "" : "user"}`}>
                <div className={`avatar ${isDendam ? "dendam" : "you"}`} aria-hidden>
                  {isDendam ? "🔥" : "🧑"}
                </div>
                <div className={`msg ${isDendam ? "assistant" : "user"}`}>
                  <div className="who">{isDendam ? "Dendam" : "@" + m.handle}</div>
                  <span>{m.text}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="room-join" style={{ marginTop: 12 }}>
        <div className="handle" style={{ minWidth: 110 }}>
          <span style={{ color: "var(--muted)" }}>@</span>
          <input
            value={me}
            onChange={(e) => setMe(e.target.value)}
            placeholder="nickname"
            maxLength={40}
            aria-label="Your nickname"
          />
        </div>
        <input
          className="room-pred"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && post()}
          placeholder="Say something to the room…"
          aria-label="Message the room"
        />
        <button className="btn sm" onClick={post} disabled={posting || !me.trim() || !msg.trim()}>
          {posting ? "…" : "Send"}
        </button>
      </div>
      <div className="cta-row" style={{ justifyContent: "flex-start", marginTop: 10 }}>
        <button className="btn ghost sm" onClick={weighIn} disabled={stirring || players.length < 2}>
          {stirring ? "Dendam is pouring fuel…" : "🔥 Dendam, weigh in"}
        </button>
        <span className="hint" style={{ margin: 0 }}>
          Async — refresh to see others&rsquo; posts. Real chat, on Walrus.
        </span>
      </div>

      {/* ── Calls (predictions) ─────────────────── */}
      <div className="section-head" style={{ marginTop: 24 }}>
        <h3>📣 The calls</h3>
        <span className="count">who&rsquo;s backing whom</span>
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
            {busy ? "Joining…" : `Stake ${room.stakeWal} WAL & lock it`}
          </button>
        </div>
      )}
      {joined && (
        <p className="hint" style={{ color: "var(--accent-soft)" }}>
          ✓ Call locked — staked {room.stakeWal} WAL (mock). It&rsquo;s saved on Walrus
          and now lives in your File too.
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
