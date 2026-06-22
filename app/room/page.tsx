import type { Metadata } from "next";
import Link from "next/link";
import { ROOMS, resolveRoom } from "@/lib/rooms";
import { AppIcon } from "@/components/Logo";
import { IconRespond, IconFolder, IconStadium, IconCrown } from "@/components/Icons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Match Rooms — Dendam",
  description:
    "Prediction rooms per World Cup 2026 match. Drop your call, Dendam stirs the room, winner takes the (mock) pool.",
};

// Server-rendered nav (no handle state here) matching the shared TopBar look.
const NAV = [
  { href: "/chat", label: "Chat", Icon: IconRespond, active: false },
  { href: "/dossier", label: "Memory", Icon: IconFolder, active: false },
  { href: "/room", label: "Rooms", Icon: IconStadium, active: true },
  { href: "/group", label: "Shame", Icon: IconCrown, active: false },
];

function RoomHeader() {
  return (
    <div className="dx-topbar">
      <Link href="/" className="dx-brand" style={{ textDecoration: "none" }}>
        <AppIcon size={38} />
        <span className="dx-wordmark">
          Dendam<span style={{ color: "var(--violet)" }}>.</span>
        </span>
      </Link>
      <nav className="dx-tabs">
        {NAV.map((t) => (
          <Link key={t.href} href={t.href} className={`dx-tab${t.active ? " active" : ""}`}>
            <t.Icon size={18} />
            <span>{t.label}</span>
          </Link>
        ))}
      </nav>
    </div>
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
        <a href="/group">🏆 Hall of Shame →</a> ranks who&rsquo;s been most wrong.
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
