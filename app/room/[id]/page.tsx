import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoom, resolveRoom, roomNamespace } from "@/lib/rooms";
import { getMemoryStore } from "@/lib/memory";
import { RoomClient } from "@/components/RoomClient";

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
    <div className="shell">
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
          <Link href="/room">🏟️ Rooms</Link>
          <Link href="/chat">💬 Chat</Link>
        </nav>
      </header>

      <p className="hint" style={{ marginBottom: 4 }}>
        <Link href="/room">← all rooms</Link>
      </p>
      <h2 className="page-title" style={{ marginTop: 0 }}>
        {room.teamA} <span style={{ color: "var(--muted)" }}>vs</span> {room.teamB}
        <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 15 }}>
          {" "}— {room.stage} · {room.date}
        </span>
      </h2>

      <RoomClient room={room} resolution={resolution} initialChat={chat} />

      <p className="hint" style={{ marginTop: 22 }}>
        Predictions in this room are stored on Walrus Memory (they show up in each
        player&rsquo;s <Link href="/dossier">File</Link> too). The pool, stake, and
        payouts are a mock-up of the concept — no real funds move.
      </p>

      <footer className="footer">
        <span>Memory on Walrus · Sui Mainnet</span>
        <span>
          <a href="https://github.com/PugarHuda/dendam" target="_blank" rel="noreferrer">Source</a> · #Walrus
        </span>
      </footer>
    </div>
  );
}
