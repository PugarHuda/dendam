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

const TEAM: Record<string, { bg: string; color: string }> = {
  Brazil: { bg: "#FFC83D", color: "#241046" },
  Argentina: { bg: "#7C3AED", color: "#fff" },
  France: { bg: "#241046", color: "#fff" },
  Spain: { bg: "#FF5470", color: "#fff" },
};
const teamStyle = (name: string) => TEAM[name] ?? { bg: "#7C3AED", color: "#fff" };
const teamCode = (name: string) => name.slice(0, 3).toUpperCase();

function TeamBadge({ name, away = false }: { name: string; away?: boolean }) {
  const t = teamStyle(name);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ width: 52, height: 52, margin: "0 auto 7px", borderRadius: away ? "53% 47% 42% 58% / 58% 53% 47% 42%" : "42% 58% 53% 47% / 47% 42% 58% 53%", background: t.bg, color: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, border: "2.5px solid #241046" }}>{teamCode(name)}</div>
      <div style={{ fontWeight: 800, fontSize: 12.5, color: "#241046" }}>{name}</div>
    </div>
  );
}

export default async function RoomsPage() {
  const rooms = await Promise.all(
    ROOMS.map(async (r) => ({ room: r, res: await resolveRoom(r) })),
  );

  return (
    <div style={{ minHeight: "100vh", background: "#FBF6EE" }}>
      <RoomHeader />

      {/* HEADER */}
      <header style={{ maxWidth: 1080, margin: "0 auto", padding: "14px 28px 4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <IconStadium size={34} />
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 34, letterSpacing: -1, color: "#241046", margin: 0, whiteSpace: "nowrap" }}>Match Rooms</h1>
          <span style={{ fontFamily: "var(--font-script)", fontWeight: 700, color: "#7C3AED", fontSize: 30, lineHeight: 1, whiteSpace: "nowrap" }}>predict, win the pool</span>
        </div>
        <p style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.55, color: "#4A3570", maxWidth: 680, margin: "12px 0 0" }}>
          One room per match. Drop your call, Dendam stirs everyone using what they said, and when the result lands the winner takes the pool. The predictions are really stored on Walrus — the prizes are a <strong style={{ color: "#241046" }}>mock-up</strong> (no real funds move).
        </p>
        <Link href="/group" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FFE0E6", border: "2px solid #FFC2CE", borderRadius: 30, padding: "7px 14px", marginTop: 14, fontWeight: 800, fontSize: 12.5, color: "#C63752" }}>
          <IconCrown size={16} /> Hall of Shame → ranks who&rsquo;s been most wrong
        </Link>
      </header>

      {/* ROOM CARDS */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 28px 56px" }}>
        <div className="rm-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {rooms.map(({ room, res }) => {
            const ft = !!res.result;
            return (
              <Link key={room.id} href={`/room/${encodeURIComponent(room.id)}`} className="rm-card" style={{ background: "#fff", border: "2.5px solid #ECE2D3", borderRadius: 24, padding: 20, textDecoration: "none", color: "inherit", boxShadow: "0 2px 0 #ECE2D3", display: "block" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 18 }}>
                  <span style={{ fontWeight: 800, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: "#8A77AD" }}>{room.stage}</span>
                  <span style={{ background: ft ? "#241046" : "#E4F7EE", color: ft ? "#fff" : "#1F8A5B", fontWeight: 800, fontSize: 10.5, letterSpacing: 0.8, padding: "4px 10px", borderRadius: 20 }}>{ft ? "Full time" : "Open"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 18 }}>
                  <TeamBadge name={room.teamA} />
                  <div style={{ fontFamily: "var(--font-script)", fontWeight: 700, fontSize: 24, color: "#9A86C0" }}>vs</div>
                  <TeamBadge name={room.teamB} away />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "#fff", border: "2px solid #F0E6D6", borderRadius: 30, padding: 8, marginBottom: 12 }}>
                  <IconCrown size={18} />
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "#241046" }}>{room.poolWal} WAL</span>
                  <span style={{ fontWeight: 800, fontSize: 9.5, letterSpacing: 0.5, color: "#C63752", background: "#FFE0E6", padding: "2px 7px", borderRadius: 12 }}>MOCK</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 700, fontSize: 11.5, color: "#8A77AD" }}>
                  <span>{room.date}</span><span>{room.players.length} in</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "2px solid #EFE6D7" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <p style={{ fontWeight: 800, fontSize: 13, color: "#8A77AD", margin: 0 }}>Memory on Walrus · Sui Mainnet</p>
          <a href="https://github.com/PugarHuda/dendam" target="_blank" rel="noreferrer" style={{ fontWeight: 800, fontSize: 13, color: "#7C3AED", margin: 0 }}>Source · #Walrus</a>
        </div>
      </footer>
    </div>
  );
}
