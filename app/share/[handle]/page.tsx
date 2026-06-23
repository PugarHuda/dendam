import type { Metadata } from "next";
import Link from "next/link";
import { emptyStats, statsForHandle, type HandleStats } from "@/lib/stats";
import { ShareButton } from "@/components/ShareButton";
import { GrudgeBall } from "@/components/Logo";
import { IconFolder, IconFlame, IconCrown } from "@/components/Icons";
import { EXPLORER_URL, shortHandle, SITE, tweetIntent } from "@/lib/links";

const C = {
  cream: "#FBF6EE",
  ink: "#241046",
  violet: "#7C3AED",
  deep: "#2E1065",
  yellow: "#FFC83D",
  coral: "#FF5470",
  muted: "#9A86C0",
};

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
  const title = `@${shortHandle(s.handle)}'s Dendam file`;
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

  const h = shortHandle(s.handle);
  const tagline = s.total === 0 ? "case still open" : s.wrong > 0 ? "certified World Cup fraud" : "suspiciously quiet so far";

  return (
    <div style={{ minHeight: "100vh", background: C.cream }}>
      {/* LIGHT PUBLIC HEADER */}
      <header style={{ maxWidth: 880, margin: "0 auto", padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <GrudgeBall size={38} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, letterSpacing: -0.5, color: C.ink }}>Dendam</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: s.network === "local" ? "#FFE0E6" : "#E4F7EE", border: `2px solid ${s.network === "local" ? "#FFC2CE" : "#BCE9D3"}`, color: s.network === "local" ? "#C63752" : "#1F8A5B", fontWeight: 800, fontSize: 12, padding: "7px 14px", borderRadius: 30 }}>
          <span style={{ width: 8, height: 8, background: s.network === "local" ? "#C63752" : "#1F8A5B", borderRadius: "50%" }} /> {netLabel ? `${netLabel} · ` : ""}public file · read-only
        </div>
      </header>

      {/* SHARE CARD */}
      <main style={{ maxWidth: 880, margin: "0 auto", padding: "6px 28px 20px" }}>
        <div style={{ background: "#fff", border: `2.5px solid ${C.ink}`, borderRadius: 32, padding: 38, boxShadow: "0 16px 0 #EDE3FF", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -30, width: 160, height: 160, background: "#EDE3FF", borderRadius: "46% 54% 43% 57% / 55% 45% 55% 45%" }} aria-hidden />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 14 }}>
              <IconFlame size={16} /> Dendam has a file on
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
              <GrudgeBall size={74} />
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(40px,7vw,54px)", letterSpacing: -1.5, color: C.ink, margin: 0 }}>@{h}</h1>
              <div style={{ fontFamily: "var(--font-script)", fontWeight: 700, fontSize: 20, color: C.coral, textAlign: "right", maxWidth: 160, lineHeight: 1.05, marginLeft: "auto" }}>{tagline}</div>
            </div>

            {s.total === 0 ? (
              <p style={{ fontWeight: 600, fontSize: 16, color: "#4A3570", margin: "22px 0 24px", lineHeight: 1.5 }}>The file on @{h} is empty — Dendam has nothing yet. Go make a World Cup 2026 call, and live with it.</p>
            ) : (
              <>
                {/* stat tiles */}
                <div className="mx-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, margin: "26px 0 24px" }}>
                  <div style={{ background: "#EDE3FF", borderRadius: 18, padding: "16px 18px" }}><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, color: C.violet, lineHeight: 1 }}>{s.predictions}</div><div style={{ fontWeight: 700, fontSize: 12, color: "#5B21B6", marginTop: 5 }}>predictions</div></div>
                  <div style={{ background: "#FFEFC2", borderRadius: 18, padding: "16px 18px" }}><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, color: "#B9821A", lineHeight: 1 }}>{s.wrong}</div><div style={{ fontWeight: 700, fontSize: 12, color: "#8A5E0E", marginTop: 5 }}>busted</div></div>
                  <div style={{ background: "#FFE0E6", borderRadius: 18, padding: "16px 18px" }}><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, color: C.coral, lineHeight: 1 }}>{accuracy}</div><div style={{ fontWeight: 700, fontSize: 12, color: "#C63752", marginTop: 5 }}>accuracy</div></div>
                  <div style={{ background: C.cream, border: "2px solid #ECE2D3", borderRadius: 18, padding: "16px 18px" }}><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, color: C.ink, lineHeight: 1 }}>{s.insults}</div><div style={{ fontWeight: 700, fontSize: 12, color: C.muted, marginTop: 5 }}>insults thrown</div></div>
                </div>

                {/* on the record */}
                {s.topLine && (
                  <div style={{ background: C.ink, borderRadius: 22, padding: "24px 26px", position: "relative", overflow: "hidden", marginBottom: 24 }}>
                    <div style={{ position: "absolute", top: -20, right: 18, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 90, color: "#3A1980", lineHeight: 1 }}>&ldquo;</div>
                    <div style={{ position: "relative", zIndex: 2 }}>
                      <div style={{ fontWeight: 800, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.yellow, marginBottom: 10 }}>On the record</div>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 24, lineHeight: 1.3, color: "#fff", margin: "0 0 12px" }}>&ldquo;{s.topLine}&rdquo;</p>
                      {s.wrong > 0 && (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <span style={{ background: C.coral, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, letterSpacing: 0.5, padding: "4px 12px", borderRadius: 8, transform: "rotate(-3deg)" }}>WRONG</span>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "#C4A8FF" }}>Reality checked. Filed forever.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* CTAs */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <Link href={`/dossier?handle=${enc}`} className="lx-press" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: C.violet, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, padding: "14px 24px", borderRadius: 40, boxShadow: `0 6px 0 ${C.deep}` }}>
                <IconFolder size={19} /> See the full file
              </Link>
              <Link href={`/chat?handle=${enc}`} className="lx-ghost-ink" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: C.ink, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, padding: "14px 22px", borderRadius: 40, border: `2.5px solid ${C.ink}` }}>Start your own beef →</Link>
              <a href={tweetIntent(`${SITE}/share/${enc}`, s.handle)} target="_blank" rel="noreferrer" className="lx-press" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginLeft: "auto", background: C.ink, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, padding: "14px 22px", borderRadius: 40 }}>𝕏 Post my file</a>
              <ShareButton url={`/share/${enc}`} title={`@${s.handle}'s Dendam file`} text={`Dendam has a file on @${s.handle}. 🔥⚽`} className="dx-sharebtn-lg" label="Copy link" />
            </div>
          </div>
        </div>

        {/* provenance + related */}
        <p style={{ fontWeight: 600, fontSize: 14, color: C.muted, margin: "24px 0 16px", lineHeight: 1.55 }}>
          Every memory is stored on Walrus Memory and tied to a <a href={EXPLORER_URL} target="_blank" rel="noreferrer" style={{ color: C.ink, fontWeight: 800 }}>MemWalAccount object on Sui ↗</a> — not a chat log. Make your call, and live with it.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/group" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: "2px solid #E4D8C8", color: C.ink, fontWeight: 800, fontSize: 13.5, padding: "9px 16px", borderRadius: 30 }}>
            <IconCrown size={16} /> See the Hall of Shame
          </Link>
        </div>

        {/* FOOTER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", padding: "34px 4px 48px" }}>
          <p style={{ fontWeight: 800, fontSize: 13, color: "#8A77AD", margin: 0 }}>Memory on Walrus · Sui Mainnet</p>
          <a href="https://github.com/PugarHuda/dendam" target="_blank" rel="noreferrer" style={{ fontWeight: 800, fontSize: 13, color: C.violet, margin: 0 }}>Source · #Walrus</a>
        </div>
      </main>
    </div>
  );
}
