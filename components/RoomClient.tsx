"use client";

import { useEffect, useState } from "react";
import { initialHandle } from "@/components/TopBar";

type Player = { handle: string; prediction: string };
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

export function RoomClient({ room, resolution }: { room: Room; resolution: Resolution }) {
  const [players, setPlayers] = useState<Player[]>(room.players);
  const [me, setMe] = useState("");
  const [pred, setPred] = useState("");
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);
  const [provos, setProvos] = useState<string[]>([]);
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

  async function join() {
    const handle = me.trim().replace(/^@/, "");
    const prediction = pred.trim();
    if (!handle || !prediction) return;
    setBusy(true);
    // Optimistic: show the call immediately; the Walrus write happens in the bg.
    setPlayers((p) => [...p.filter((x) => x.handle !== handle), { handle, prediction }]);
    setJoined(true);
    try {
      await fetch("/api/room/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handle, match: room.id, prediction }),
      });
    } catch {
      /* the optimistic entry stays; the write is best-effort */
    } finally {
      setBusy(false);
    }
  }

  async function stir() {
    const handles = players.map((p) => p.handle).slice(0, 12);
    if (handles.length < 2) return;
    setStirring(true);
    setProvos([]);
    try {
      const res = await fetch("/api/kompor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handles }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setProvos((data.provocations || []).map((p: { line: string }) => p.line));
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

      {/* status */}
      <p className="hint" style={{ marginTop: 14 }}>
        {open ? (
          <>
            🟢 <b>Open</b> — drop your call before kickoff. {players.length} in the room.
          </>
        ) : (
          <>
            🏁 <b>Full time:</b> {resolution.score} ·{" "}
            {resolution.winners.length > 0 ? (
              <>
                winner(s): {resolution.winners.map((w) => "@" + w).join(", ")} — split{" "}
                <b>{payoutEach.toFixed(2)} WAL</b> each (mock).
              </>
            ) : (
              "nobody called it. The pool rolls over (mock)."
            )}
          </>
        )}
      </p>

      {/* join form (open rooms) */}
      {open && !joined && (
        <div className="room-join">
          <div className="handle" style={{ minWidth: 120 }}>
            <span style={{ color: "var(--muted)" }}>@</span>
            <input
              value={me}
              onChange={(e) => setMe(e.target.value)}
              placeholder="your nickname"
              maxLength={40}
              aria-label="Your nickname"
            />
          </div>
          <input
            className="room-pred"
            value={pred}
            onChange={(e) => setPred(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && join()}
            placeholder={`Your call for ${room.teamA} vs ${room.teamB}…`}
            aria-label="Your prediction"
          />
          <button className="btn sm" onClick={join} disabled={busy || !me.trim() || !pred.trim()}>
            {busy ? "Joining…" : `Stake ${room.stakeWal} WAL & join`}
          </button>
        </div>
      )}
      {joined && (
        <p className="hint" style={{ color: "var(--accent-soft)" }}>
          ✓ You&rsquo;re in — staked {room.stakeWal} WAL (mock). Your call is saved on
          Walrus and now lives in your File too.
        </p>
      )}

      {/* players */}
      <div className="dossier-grid" style={{ marginTop: 14 }}>
        {players.map((p) => {
          const won = resolution.winners.includes(p.handle.toLowerCase());
          return (
            <div key={p.handle} className={`grudge ${won ? "" : ""}`} style={won ? { borderLeftColor: "var(--green)" } : undefined}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <b>@{p.handle}</b>
                {!open && won && <span className="tag ok">🏆 won {payoutEach.toFixed(2)} WAL</span>}
              </div>
              <div style={{ marginTop: 4 }}>&ldquo;{p.prediction}&rdquo;</div>
            </div>
          );
        })}
      </div>

      {/* actions */}
      <div className="cta-row" style={{ justifyContent: "flex-start", marginTop: 18 }}>
        <button className="btn" onClick={stir} disabled={stirring || players.length < 2}>
          {stirring ? "Dendam is pouring fuel…" : "🔥 Dendam, stir the room"}
        </button>
        {!open && iWon && (
          <button className="btn ghost" onClick={() => setClaimed(true)} disabled={claimed}>
            {claimed ? `✓ Claimed ${payoutEach.toFixed(2)} WAL (mock)` : `💰 Claim ${payoutEach.toFixed(2)} WAL`}
          </button>
        )}
      </div>

      {provos.length > 0 && (
        <div className="dossier-grid" style={{ marginTop: 14 }}>
          {provos.map((l, i) => (
            <div key={i} className="msg-row assistant" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="avatar dendam" aria-hidden>🔥</div>
              <div className="msg assistant" style={{ maxWidth: "100%" }}>
                <div className="who">Dendam</div>
                <span>{l}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
