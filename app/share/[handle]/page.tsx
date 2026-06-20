import type { Metadata } from "next";
import Link from "next/link";
import { emptyStats, statsForHandle, type HandleStats } from "@/lib/stats";
import { ShareButton } from "@/components/ShareButton";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ handle: string }> };

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
  const { handle: raw } = await params;
  const s = await load(raw);
  const title = `@${s.handle}'s Dendam file`;
  const acc = s.accuracy === null ? "" : ` · ${Math.round(s.accuracy * 100)}% accuracy`;
  const description =
    s.total === 0
      ? `Dendam has nothing on @${s.handle}… yet. Make a World Cup 2026 call and live with it.`
      : `${s.total} memories · ${s.predictions} predictions · ${s.wrong} wrong calls · ${s.insults} insults${acc}. Dendam never forgets.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "profile" },
    twitter: { card: "summary_large_image", title, description },
  };
}

function networkLabel(network: string): string | null {
  if (network === "mainnet") return "Walrus Mainnet";
  if (network === "testnet") return "Walrus Testnet";
  if (network === "local") return "Local (dev)";
  return null;
}

export default async function SharePage({ params }: Params) {
  const { handle: raw } = await params;
  const s = await load(raw);
  const enc = encodeURIComponent(s.handle);
  const netLabel = networkLabel(s.network);
  const accuracy = s.accuracy === null ? "—" : `${Math.round(s.accuracy * 100)}%`;

  return (
    <div className="shell">
      <div className="topbar">
        <Link href="/" className="brand" style={{ textDecoration: "none" }}>
          <span className="brand-emblem" aria-hidden>
            🔥
          </span>
          <div className="brand-text">
            <h1 style={{ color: "var(--ink)" }}>
              Dendam<span className="dot">.</span>
            </h1>
            <small>the World Cup 2026 rival that never forgets</small>
          </div>
        </Link>
        <nav className="nav">
          <Link href="/chat">Face off</Link>
        </nav>
      </div>

      <div className="badge-row">
        {netLabel && (
          <span className={`badge ${s.network === "local" ? "local" : "live"}`}>
            {netLabel}
          </span>
        )}
        <span className="badge">the file on @{s.handle}</span>
      </div>

      <h2 className="page-title" style={{ marginTop: 14, fontSize: 28 }}>
        Dendam has a file on <span style={{ color: "var(--accent-soft)" }}>@{s.handle}</span>.
      </h2>

      {s.total === 0 ? (
        <p className="hint" style={{ fontSize: 15 }}>
          …actually, nothing yet. The file is empty. Go make a call — and live with it.
        </p>
      ) : (
        <>
          <div className="stat-row">
            <div className="stat">
              <div className="n">{s.total}</div>
              <div className="l">total memories</div>
            </div>
            <div className="stat">
              <div className="n">{s.predictions}</div>
              <div className="l">predictions logged</div>
            </div>
            <div className="stat">
              <div className="n" style={{ color: "var(--accent-2)" }}>
                {s.wrong}
              </div>
              <div className="l">wrong calls</div>
            </div>
            <div className="stat">
              <div className="n" style={{ color: "var(--accent)" }}>
                {s.insults}
              </div>
              <div className="l">insults at Dendam</div>
            </div>
          </div>

          <p className="hint" style={{ marginTop: 12 }}>
            Verdict accuracy so far: <b style={{ color: "var(--ink)" }}>{accuracy}</b>
            {s.accuracy !== null && ` (${s.correct} right, ${s.wrong} wrong)`}.
          </p>

          {s.topLine && (
            <div className="grudge" style={{ marginTop: 14 }}>
              <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 6 }}>
                On the record
              </div>
              <div>&ldquo;{s.topLine}&rdquo;</div>
            </div>
          )}
        </>
      )}

      <div className="cta-row" style={{ justifyContent: "flex-start", marginTop: 24 }}>
        <Link className="btn" href={`/chat?handle=${enc}`}>
          🔥 Face off with Dendam
        </Link>
        <Link className="btn ghost" href={`/dossier?handle=${enc}`}>
          See the full File
        </Link>
        <ShareButton
          url={`/share/${enc}`}
          title={`@${s.handle}'s Dendam file`}
          text={`Dendam has a file on @${s.handle}. 🔥⚽`}
        />
      </div>

      <p className="hint">
        Every memory is stored on Walrus Memory and tied to a MemWalAccount object
        on Sui — not a chat log. Make your call, and live with it.
      </p>

      <footer className="footer">
        <span>Memory on Walrus · Sui Mainnet</span>
        <span>
          <a href="https://github.com/PugarHuda/dendam" target="_blank" rel="noreferrer">
            Source
          </a>{" "}
          · #Walrus
        </span>
      </footer>
    </div>
  );
}
