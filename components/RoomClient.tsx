"use client";

import { useEffect, useRef, useState } from "react";
import { initialHandle } from "@/components/TopBar";
import { GrudgeBall } from "@/components/Logo";

const RC = {
  cream: "#FBF6EE",
  ink: "#241046",
  violet: "#7C3AED",
  yellow: "#FFC83D",
  coral: "#FF5470",
  muted: "#9A86C0",
};
const TEAM_COLOR: Record<string, { bg: string; color: string }> = {
  Brazil: { bg: "#FFC83D", color: "#241046" },
  Argentina: { bg: "#7C3AED", color: "#fff" },
  France: { bg: "#241046", color: "#fff" },
  Spain: { bg: "#FF5470", color: "#fff" },
};
const teamCol = (n: string) => TEAM_COLOR[n] ?? { bg: "#7C3AED", color: "#fff" };
const AV = ["#7C3AED", "#FFC83D", "#FF5470", "#241046", "#B9821A", "#9A86C0"];
const avColor = (h: string) => AV[[...h].reduce((a, c) => a + c.charCodeAt(0), 0) % AV.length];
const initials = (h: string) => h.replace(/^@/, "").slice(0, 2).toUpperCase();

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
  const [roomErr, setRoomErr] = useState("");
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
    const text = msg.trim().slice(0, 280);
    if (!handle || !text || posting) return;
    setPosting(true);
    setRoomErr("");
    const optimistic = { handle, text };
    const next = [...chat, optimistic];
    setChat(next);
    setMsg("");

    // persist to Walrus; if it's rejected (e.g. content guard), pull it back.
    let accepted = true;
    try {
      const res = await fetch("/api/room/post", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ roomId: room.id, handle, message: text }),
      });
      if (!res.ok) {
        accepted = false;
        setChat((c) => c.filter((m) => m !== optimistic));
        const data = await res.json().catch(() => ({}));
        setRoomErr(
          data?.error === "keep_it_clean"
            ? "Keep it about football — that one didn't fly."
            : res.status === 429
              ? "Slow down a sec — too many messages."
              : "Couldn't send that. Try again.",
        );
      }
    } catch {
      /* network blip — keep the optimistic message */
    }

    // Dendam jumps in automatically — but only on accepted, non-trivial posts
    // (skip "ok"/"lol" so we don't spend an LLM call on noise).
    if (accepted && text.replace(/[^a-z0-9]/gi, "").length >= 3) {
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
      }
    }
    setPosting(false);
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
    return (
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        {isDendam ? (
          <span style={{ flex: "none", marginTop: 2 }}><GrudgeBall size={32} /></span>
        ) : (
          <div style={{ width: 32, height: 32, flex: "none", borderRadius: "42% 58% 53% 47% / 47% 42% 58% 53%", background: avColor(m.handle), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, marginTop: 2 }}>{initials(m.handle)}</div>
        )}
        <div style={{ maxWidth: "84%" }}>
          <div style={{ fontFamily: isDendam ? "var(--font-display)" : "var(--font-body)", fontWeight: isDendam ? 600 : 800, fontSize: 12, color: isDendam ? RC.violet : RC.ink, margin: "0 0 4px 2px" }}>
            {isDendam ? <>Dendam <span style={{ fontWeight: 700, color: RC.muted }}>· stirring</span></> : "@" + m.handle}
          </div>
          <div style={{ background: isDendam ? "#F5EFFF" : RC.cream, border: `2px solid ${isDendam ? "#E2D3FA" : "#ECE2D3"}`, borderRadius: "4px 16px 16px 16px", padding: "11px 15px", fontWeight: 600, fontSize: 13.5, lineHeight: 1.5, color: RC.ink, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.text}</div>
        </div>
      </div>
    );
  }

  const tA = teamCol(room.teamA);
  const tB = teamCol(room.teamB);

  return (
    <div style={{ background: "#fff", border: `2.5px solid ${RC.ink}`, borderRadius: 28, overflow: "hidden", boxShadow: "0 12px 0 #EDE3FF" }}>
      {/* panel header (dark) */}
      <div style={{ background: RC.ink, padding: "20px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <div style={{ width: 42, height: 42, borderRadius: "42% 58% 53% 47% / 47% 42% 58% 53%", background: tA.bg, color: tA.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, border: "2px solid #fff" }}>{room.teamA.slice(0, 3).toUpperCase()}</div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, color: "#fff", lineHeight: 1 }}>{room.teamA} vs {room.teamB}</div>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#C4A8FF", marginTop: 3 }}>{room.stage} · {room.date} · {players.length} in the room</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: "53% 47% 42% 58% / 58% 53% 47% 42%", background: tB.bg, color: tB.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, border: "2px solid #fff" }}>{room.teamB.slice(0, 3).toUpperCase()}</div>
        </div>
        {!open ? (
          <div style={{ display: "flex", alignItems: "center", gap: 9, background: RC.yellow, borderRadius: 30, padding: "7px 16px", whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: RC.ink }}>{resolution.score}</span>
            <span style={{ fontWeight: 800, fontSize: 10.5, letterSpacing: 0.8, color: "#5A3F08" }}>FULL TIME</span>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#E4F7EE", borderRadius: 30, padding: "7px 16px", whiteSpace: "nowrap" }}>
            <span style={{ width: 8, height: 8, background: "#1F8A5B", borderRadius: "50%" }} />
            <span style={{ fontWeight: 800, fontSize: 11, letterSpacing: 0.6, color: "#1F8A5B" }}>OPEN · LIVE</span>
          </div>
        )}
      </div>

      {/* panel body (2-col) */}
      <div className="rmx-body" style={{ display: "grid", gridTemplateColumns: "1fr 300px" }}>
        {/* chat */}
        <div className="rmx-chat" style={{ padding: "22px 26px", borderRight: "2px solid #F0E6D6" }}>
          <p style={{ fontWeight: 800, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: RC.muted, margin: "0 0 16px" }}>Room chat · Dendam is in here</p>
          <div ref={msgsRef} style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: 380, overflowY: "auto" }}>
            {chat.length === 0 && (
              <div style={{ color: RC.muted, fontWeight: 600, fontSize: 13.5, lineHeight: 1.5 }}>
                No messages yet — say something about {room.teamA} vs {room.teamB}. Dendam&rsquo;s listening.
              </div>
            )}
            {chat.map((m, i) => <Bubble key={i} m={m} />)}
            {dendamTyping && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ flex: "none", marginTop: 2 }}><GrudgeBall size={32} /></span>
                <div style={{ background: "#F5EFFF", border: "2px solid #E2D3FA", borderRadius: "4px 16px 16px 16px", padding: "11px 15px" }}>
                  <span className="typing" aria-label="Dendam is typing"><i /><i /><i /></span>
                </div>
              </div>
            )}
          </div>
          {/* composer */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16, background: RC.cream, border: "2px solid #E4D8C8", borderRadius: 30, padding: "5px 5px 5px 14px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", color: RC.violet, fontWeight: 800, fontSize: 13.5 }} title="Your nickname in this room">
              @
              <input value={me} onChange={(e) => setMe(e.target.value)} placeholder="you" maxLength={40} aria-label="Your nickname" style={{ width: 56, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 13.5, color: RC.ink }} />
            </span>
            <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && post()} placeholder="Message the room…" aria-label="Message the room" maxLength={280} style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: RC.ink, minWidth: 0 }} />
            <button onClick={post} disabled={posting || !me.trim() || !msg.trim()} className="lx-press" style={{ background: RC.violet, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, border: "none", padding: "9px 18px", borderRadius: 30, cursor: "pointer", flex: "none", opacity: posting || !me.trim() || !msg.trim() ? 0.5 : 1 }}>{posting ? "…" : "Send"}</button>
          </div>
          {roomErr && <p style={{ color: RC.coral, fontWeight: 700, fontSize: 12.5, margin: "8px 0 0" }} role="alert">⚠️ {roomErr}</p>}
        </div>

        {/* on the record + pool */}
        <div style={{ padding: "22px 22px", background: RC.cream }}>
          <p style={{ fontWeight: 800, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: RC.muted, margin: "0 0 12px" }}>On the record</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {players.map((p) => {
              const won = resolution.winners.includes(p.handle.toLowerCase());
              return (
                <div key={p.handle} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: `2px solid ${won ? "#BCE9D3" : "#ECE2D3"}`, borderRadius: 14, padding: "9px 12px" }}>
                  <div style={{ width: 26, height: 26, flex: "none", borderRadius: "42% 58% 53% 47% / 47% 42% 58% 53%", background: avColor(p.handle), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10 }}>{initials(p.handle)}</div>
                  <span style={{ fontWeight: 800, fontSize: 12.5, color: RC.ink }}>@{p.handle}</span>
                  {!open && won && <span style={{ marginLeft: "auto", fontWeight: 800, fontSize: 11, color: "#1F8A5B" }}>won {payoutEach.toFixed(2)}</span>}
                </div>
              );
            })}
          </div>

          {open && !joined && (
            <div style={{ marginBottom: 16 }}>
              <input value={pred} onChange={(e) => setPred(e.target.value)} onKeyDown={(e) => e.key === "Enter" && join()} placeholder={`Your call for this match…`} aria-label="Your prediction" style={{ width: "100%", border: "2px solid #E4D8C8", borderRadius: 14, padding: "10px 13px", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: RC.ink, outline: "none", marginBottom: 8 }} />
              <button onClick={join} disabled={busy || !me.trim() || !pred.trim()} className="lx-press" style={{ width: "100%", background: RC.ink, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, border: "none", padding: 11, borderRadius: 14, cursor: "pointer", opacity: busy || !me.trim() || !pred.trim() ? 0.5 : 1 }}>{busy ? "Locking…" : `Stake ${room.stakeWal} WAL & lock it`}</button>
            </div>
          )}
          {joined && <p style={{ fontWeight: 700, fontSize: 12, color: "#1F8A5B", margin: "0 0 16px", lineHeight: 1.4 }}>✓ Call locked — staked {room.stakeWal} WAL (mock). Saved on Walrus and in your File.</p>}

          {/* prize pool */}
          <div style={{ background: RC.ink, borderRadius: 18, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: "#C4A8FF" }}>Prize pool</span>
              <span style={{ fontWeight: 800, fontSize: 9.5, color: "#FFB3C0", background: "rgba(255,84,112,.2)", padding: "2px 7px", borderRadius: 12 }}>MOCK</span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: RC.yellow, lineHeight: 1 }}>{room.poolWal} WAL</div>
            <p style={{ fontWeight: 700, fontSize: 11.5, lineHeight: 1.45, color: "#C9B8EC", margin: "10px 0 0" }}>
              {open ? <>Pool locks at kickoff. Winning side splits {room.poolWal} WAL ({room.stakeWal} to enter).</> : resolution.winners.length > 0 ? <>{resolution.winners.map((w) => "@" + w).join(", ")} split {payoutEach.toFixed(2)} WAL each.</> : "Nobody called it — pool rolls over."}
            </p>
            {!open && iWon && (
              <button onClick={() => setClaimed(true)} disabled={claimed} className="lx-press" style={{ width: "100%", marginTop: 12, background: RC.yellow, color: RC.ink, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, border: "none", padding: 11, borderRadius: 14, cursor: "pointer", opacity: claimed ? 0.6 : 1 }}>{claimed ? `✓ Claimed ${payoutEach.toFixed(2)} WAL` : `Claim ${payoutEach.toFixed(2)} WAL`}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
