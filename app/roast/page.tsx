import type { Metadata } from "next";
import Link from "next/link";
import { ShareButton } from "@/components/ShareButton";
import { SITE, shortHandle, tweetIntentRoast } from "@/lib/links";

export const runtime = "nodejs";

type Search = { searchParams: Promise<{ by?: string; text?: string }> };

function clean(by?: string): string {
  return (by || "anon").trim().replace(/^@/, "").slice(0, 40) || "anon";
}
function roastText(text?: string): string {
  return (text || "").replace(/\s+/g, " ").trim().slice(0, 280);
}
function cardUrl(by: string, text: string): string {
  return `/api/roast-card?by=${encodeURIComponent(by)}&text=${encodeURIComponent(text)}`;
}

export async function generateMetadata({ searchParams }: Search): Promise<Metadata> {
  const sp = await searchParams;
  const by = clean(sp.by);
  const text = roastText(sp.text);
  const title = `Dendam roasted @${shortHandle(by)}`;
  const description = text || "Make your World Cup 2026 call and live with it.";
  const images = [cardUrl(by, text)];
  return {
    title,
    description,
    openGraph: { title, description, images, type: "website" },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function RoastPage({ searchParams }: Search) {
  const sp = await searchParams;
  const by = clean(sp.by);
  const text =
    roastText(sp.text) ||
    "Make your call. I'll remember every word — and throw it back when it falls apart.";
  const pageUrl = `${SITE}/roast?by=${encodeURIComponent(by)}&text=${encodeURIComponent(text)}`;
  const enc = encodeURIComponent(by);

  return (
    <div className="shell">
      <div className="topbar">
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
          <Link href="/room">🏟️ Rooms</Link>
        </nav>
      </div>

      <div className="badge-row">
        <span className="badge">🔥 a roast for @{shortHandle(by)}</span>
      </div>

      <blockquote className="roast-quote">
        <span className="roast-mark">&ldquo;</span>
        <p>{text}</p>
        <footer>— Dendam, on @{shortHandle(by)}</footer>
      </blockquote>

      <div className="cta-row" style={{ justifyContent: "flex-start", marginTop: 22 }}>
        <a className="btn" href={tweetIntentRoast(pageUrl)} target="_blank" rel="noreferrer">
          𝕏 Post this roast
        </a>
        <ShareButton url={pageUrl} title={`Dendam roasted @${by}`} label="🔗 Copy link" />
        <Link className="btn ghost" href={`/chat?handle=${enc}`}>Get roasted too</Link>
        <Link className="btn ghost" href={`/share/${enc}`}>See the file</Link>
      </div>

      <p className="hint">
        Dendam stores every prediction on Walrus Memory, then throws it back when
        you&rsquo;re wrong. Make your call, and live with it.
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
