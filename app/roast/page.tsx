import type { Metadata } from "next";
import Link from "next/link";
import { ShareButton } from "@/components/ShareButton";
import { GrudgeBall } from "@/components/Logo";
import { IconFolder } from "@/components/Icons";
import { SITE, shortHandle, tweetIntentRoast } from "@/lib/links";

const C = {
  cream: "#FBF6EE",
  ink: "#241046",
  violet: "#7C3AED",
  deep: "#2E1065",
  yellow: "#FFC83D",
  muted: "#9A86C0",
};

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
    <div style={{ minHeight: "100vh", background: C.cream }}>
      {/* LIGHT PUBLIC HEADER */}
      <header style={{ maxWidth: 760, margin: "0 auto", padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <GrudgeBall size={38} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, letterSpacing: -0.5, color: C.ink }}>Dendam</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFE0E6", border: "2px solid #FFC2CE", color: "#C63752", fontWeight: 800, fontSize: 12, padding: "7px 14px", borderRadius: 30 }}>🔥 a roast for @{shortHandle(by)}</div>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "6px 28px 20px" }}>
        {/* roast quote card (dark) */}
        <div style={{ background: C.ink, borderRadius: 28, padding: "44px 40px", position: "relative", overflow: "hidden", boxShadow: "0 14px 0 #EDE3FF", border: `2.5px solid ${C.ink}` }}>
          <div style={{ position: "absolute", top: -30, right: -24, width: 150, height: 150, background: C.violet, borderRadius: "46% 54% 43% 57% / 55% 45% 55% 45%", opacity: 0.45 }} aria-hidden />
          <div style={{ position: "absolute", top: 4, left: 26, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 110, color: "#3A1980", lineHeight: 1 }} aria-hidden>&ldquo;</div>
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <GrudgeBall size={40} onDark />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "#fff" }}>Dendam <span style={{ fontWeight: 700, color: "#C4A8FF", fontSize: 13 }}>· on @{shortHandle(by)}</span></span>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(22px,3.4vw,28px)", lineHeight: 1.34, color: "#fff", margin: 0 }}>{text}</p>
            <p style={{ fontFamily: "var(--font-script)", fontWeight: 700, fontSize: 22, color: C.yellow, margin: "18px 0 0" }}>— filed forever on Walrus.</p>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
          <a href={tweetIntentRoast(pageUrl)} target="_blank" rel="noreferrer" className="lx-press" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.violet, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, padding: "14px 24px", borderRadius: 40, boxShadow: `0 6px 0 ${C.deep}` }}>𝕏 Post this roast</a>
          <Link href={`/chat?handle=${enc}`} className="lx-ghost-ink" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: C.ink, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, padding: "14px 22px", borderRadius: 40, border: `2.5px solid ${C.ink}` }}>Get roasted too →</Link>
          <Link href={`/share/${enc}`} className="dx-sharebtn-lg" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><IconFolder size={18} /> See the file</Link>
          <ShareButton url={pageUrl} title={`Dendam roasted @${by}`} className="dx-sharebtn-lg" label="Copy link" />
        </div>

        <p style={{ fontWeight: 600, fontSize: 14, color: C.muted, margin: "22px 0 0", lineHeight: 1.55 }}>
          Dendam stores every prediction on Walrus Memory, then throws it back when you&rsquo;re wrong. Make your call, and live with it.
        </p>

        {/* FOOTER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", padding: "34px 4px 48px" }}>
          <p style={{ fontWeight: 800, fontSize: 13, color: "#8A77AD", margin: 0 }}>Memory on Walrus · Sui Mainnet</p>
          <a href="https://github.com/PugarHuda/dendam" target="_blank" rel="noreferrer" style={{ fontWeight: 800, fontSize: 13, color: C.violet, margin: 0 }}>Source · #Walrus</a>
        </div>
      </main>
    </div>
  );
}
