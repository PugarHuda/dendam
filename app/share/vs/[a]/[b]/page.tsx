import type { Metadata } from "next";
import Link from "next/link";
import { biggerFraud, emptyStats, statsForHandle, type HandleStats } from "@/lib/stats";
import { ShareButton } from "@/components/ShareButton";
import { shortHandle, SITE, tweetIntentVs } from "@/lib/links";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ a: string; b: string }> };

function clean(raw: string): string {
  return decodeURIComponent(raw).trim().replace(/^@/, "") || "anon";
}

async function load(raw: string): Promise<HandleStats> {
  const handle = clean(raw);
  try {
    return await statsForHandle(handle);
  } catch {
    return emptyStats(handle);
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { a: ra, b: rb } = await params;
  const [a, b] = [shortHandle(clean(ra)), shortHandle(clean(rb))];
  const title = `@${a} vs @${b} — Dendam head-to-head`;
  const description = `Who's the bigger World Cup 2026 fraud, @${a} or @${b}? Dendam keeps the receipts.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

function PlayerCard({ s, loser }: { s: HandleStats; loser: boolean }) {
  const accuracy = s.accuracy === null ? "—" : `${Math.round(s.accuracy * 100)}%`;
  return (
    <div className="grudge" style={loser ? { borderLeftColor: "var(--accent-2)" } : undefined}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <b style={{ fontSize: 18, wordBreak: "break-all" }}>@{shortHandle(s.handle)}</b>
        {loser && <span className="tag wrong">bigger fraud</span>}
      </div>
      <div className="meta" style={{ marginTop: 12 }}>
        <span className="tag wrong">{s.wrong} wrong</span>
        <span className="tag ok">{s.correct} correct</span>
        <span className="tag">{s.predictions} predictions</span>
        <span className="tag kind">{s.insults} insults</span>
      </div>
      <p className="hint" style={{ marginTop: 10 }}>
        Verdict accuracy: <b style={{ color: "var(--ink)" }}>{accuracy}</b>
      </p>
    </div>
  );
}

export default async function VsPage({ params }: Params) {
  const { a: ra, b: rb } = await params;
  const [sa, sb] = await Promise.all([load(ra), load(rb)]);
  const enc = (h: string) => encodeURIComponent(h);
  const loser = biggerFraud(sa, sb);
  const shareUrl = `${SITE}/share/vs/${enc(sa.handle)}/${enc(sb.handle)}`;

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
          <Link href="/grup">Hot Seat</Link>
        </nav>
      </div>

      <h2 className="page-title" style={{ marginTop: 14, fontSize: 28 }}>
        <span style={{ color: "var(--accent-soft)" }}>@{shortHandle(sa.handle)}</span> vs{" "}
        <span style={{ color: "var(--accent-soft)" }}>@{shortHandle(sb.handle)}</span>
      </h2>
      <p className="hint" style={{ marginTop: 0 }}>
        {loser
          ? `Dendam's verdict: @${shortHandle(loser.handle)} is losing the bragging war.`
          : "Dendam's verdict: dead even — both equally full of it."}
      </p>

      <div className="ba-grid" style={{ marginTop: 8 }}>
        <PlayerCard s={sa} loser={loser?.handle === sa.handle} />
        <PlayerCard s={sb} loser={loser?.handle === sb.handle} />
      </div>

      <div className="cta-row" style={{ justifyContent: "flex-start", marginTop: 24 }}>
        <a className="btn" href={tweetIntentVs(shareUrl, sa.handle, sb.handle)} target="_blank" rel="noreferrer">
          𝕏 Post the matchup
        </a>
        <Link className="btn ghost" href={`/share/${enc(sa.handle)}`}>@{shortHandle(sa.handle, 16)}&rsquo;s file</Link>
        <Link className="btn ghost" href={`/share/${enc(sb.handle)}`}>@{shortHandle(sb.handle, 16)}&rsquo;s file</Link>
        <ShareButton url={`/share/vs/${enc(sa.handle)}/${enc(sb.handle)}`} title={`@${sa.handle} vs @${sb.handle}`} />
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
