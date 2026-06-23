import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoom, resolveRoom, roomNamespace } from "@/lib/rooms";
import { getMemoryStore } from "@/lib/memory";
import { RoomClient } from "@/components/RoomClient";
import { AppIcon } from "@/components/Logo";
import { IconRespond, IconFolder, IconStadium, IconCrown } from "@/components/Icons";

const NAV = [
  { href: "/chat", label: "Chat", Icon: IconRespond, active: false },
  { href: "/dossier", label: "Memory", Icon: IconFolder, active: false },
  { href: "/room", label: "Rooms", Icon: IconStadium, active: true },
  { href: "/group", label: "Shame", Icon: IconCrown, active: false },
];

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const room = getRoom(decodeURIComponent(id));
  if (!room) return { title: "Match Room — Dendam" };
  return {
    title: `${room.teamA} vs ${room.teamB} — Dendam Match Room`,
    description: `Predict ${room.teamA} vs ${room.teamB}. Dendam stirs the room; winner takes the ${room.poolWal} WAL pool (mock).`,
  };
}

export default async function RoomPage({ params }: Params) {
  const { id } = await params;
  const room = getRoom(decodeURIComponent(id));
  if (!room) notFound();

  // Room chat lives on Walrus (shared across users). A relayer hiccup just
  // means it starts empty — posting still works.
  const store = getMemoryStore();
  let chat: { handle: string; text: string }[] = [];
  try {
    const msgs = await store.list(roomNamespace(room.id), 50);
    chat = msgs.map((m) => ({ handle: m.team || "anon", text: m.text }));
  } catch {
    /* start empty */
  }

  const r = await resolveRoom(room);
  const resolution = {
    winnerTeam: r.winnerTeam,
    winners: r.winners,
    resolved: !!r.result,
    score: r.result
      ? `${r.result.teamA} ${r.result.scoreA}-${r.result.scoreB} ${r.result.teamB}`
      : undefined,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FBF6EE" }}>
      <div className="dx-topbar">
        <Link href="/" className="dx-brand" style={{ textDecoration: "none" }}>
          <AppIcon size={38} />
          <span className="dx-wordmark">Dendam<span style={{ color: "var(--violet)" }}>.</span></span>
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

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "8px 28px 56px" }}>
        <p style={{ margin: "0 0 14px" }}>
          <Link href="/room" style={{ fontWeight: 800, fontSize: 13, color: "var(--violet)" }}>← all rooms</Link>
        </p>

        <RoomClient room={room} resolution={resolution} initialChat={chat} />

        <p style={{ fontWeight: 700, fontSize: 12.5, color: "#8A77AD", margin: "22px 0 0", textAlign: "center", lineHeight: 1.5 }}>
          Predictions in this room are stored on Walrus Memory (they show up in each player&rsquo;s <Link href="/dossier" style={{ color: "var(--violet)", fontWeight: 800 }}>File</Link> too). The pool, stake, and payouts are a mock-up — no real funds move.
        </p>
      </main>

      <footer style={{ borderTop: "2px solid #EFE6D7" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <p style={{ fontWeight: 800, fontSize: 13, color: "#8A77AD", margin: 0 }}>Memory on Walrus · Sui Mainnet</p>
          <a href="https://github.com/PugarHuda/dendam" target="_blank" rel="noreferrer" style={{ fontWeight: 800, fontSize: 13, color: "#7C3AED", margin: 0 }}>Source · #Walrus</a>
        </div>
      </footer>
    </div>
  );
}
