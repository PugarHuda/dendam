import type { Metadata } from "next";
import Link from "next/link";
import { ROOMS, resolveRoom } from "@/lib/rooms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Match Rooms — Dendam",
  description:
    "Prediction rooms per World Cup 2026 match. Drop your call, Dendam stirs the room, winner takes the (mock) pool.",
};

function RoomHeader() {
  return (
    <header className="topbar">
      <Link href="/" className="brand" style={{ textDecoration: "none" }}>
        <span className="brand-emblem" aria-hidden>🔥</span>
        <div className="brand-text">
          <h1 style={{ color: "var(--ink)" }}>
            Dendam<span className="dot">.</span>
          </h1>
          <small>the World Cup 2026 rival that never forgets</small>
        </div>
      </Link>
      <nav className="nav">
        <Link href="/chat">💬 Chat</Link>
        <Link href="/dossier">📂 Memory</Link>
        <Link href="/room" className="active">🏟️ Rooms</Link>
      </nav>
    </header>
  );
}

export default async function RoomsPage() {
  const rooms = await Promise.all(
    ROOMS.map(async (r) => ({ room: r, res: await resolveRoom(r) })),
  );

  return (
    <div className="shell">
      <RoomHeader />

      <h2 className="page-title">
        🏟️ Match Rooms{" "}
        <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 15 }}>
          — predict per match, win the pool
        </span>
      </h2>
      <p className="hint" style={{ marginTop: 0 }}>
        One room per match. Drop your call, Dendam stirs everyone using what they
        said, and when the result lands the winner takes the pool.{" "}
        <b>Prizes are a mock-up</b> (no real funds move) — the predictions,
        though, are really stored on Walrus.{" "}
        <a href="/grup">🏆 Hall of Shame →</a> ranks who&rsquo;s been most wrong.
      </p>

      <div className="dossier-grid" style={{ marginTop: 16 }}>
        {rooms.map(({ room, res }) => (
          <Link
            key={room.id}
            href={`/room/${encodeURIComponent(room.id)}`}
            className="grudge"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <b style={{ fontSize: 17 }}>
                {room.teamA} <span style={{ color: "var(--muted)" }}>vs</span> {room.teamB}
              </b>
              <span className="tag kind">🏆 {room.poolWal} WAL</span>
            </div>
            <div className="meta">
              <span className="tag">{room.stage}</span>
              <span>{room.date}</span>
              <span>· {room.players.length} in</span>
              {res.result ? (
                <span className="tag wrong">full time</span>
              ) : (
                <span className="tag ok">open</span>
              )}
            </div>
          </Link>
        ))}
      </div>

      <footer className="footer">
        <span>Memory on Walrus · Sui Mainnet</span>
        <span>
          <a href="https://github.com/PugarHuda/dendam" target="_blank" rel="noreferrer">Source</a> · #Walrus
        </span>
      </footer>
    </div>
  );
}
