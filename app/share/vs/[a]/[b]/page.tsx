import type { Metadata } from "next";
import Link from "next/link";
import { biggerFraud, emptyStats, statsForHandle, type HandleStats } from "@/lib/stats";
import { ShareButton } from "@/components/ShareButton";
import { GrudgeBall } from "@/components/Logo";
import { shortHandle, SITE, tweetIntentVs } from "@/lib/links";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ a: string; b: string }> };

const C = {
  cream: "#FBF6EE",
  ink: "#241046",
  violet: "#7C3AED",
  deep: "#2E1065",
  yellow: "#FFC83D",
  coral: "#FF5470",
  muted: "#9A86C0",
};
const AV = ["#7C3AED", "#FFC83D", "#FF5470", "#241046", "#B9821A", "#9A86C0"];
const avColor = (h: string) => AV[[...h].reduce((a, c) => a + c.charCodeAt(0), 0) % AV.length];
const initials = (h: string) => h.replace(/^@/, "").slice(0, 2).toUpperCase();

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
  const h = shortHandle(s.handle);
  return (
    <div style={{ flex: "1 1 260px", background: loser ? "#FFE0E6" : "#fff", border: `2.5px solid ${loser ? "#FFC2CE" : "#ECE2D3"}`, borderRadius: 24, padding: 24, position: "relative", boxShadow: loser ? "0 6px 0 #FFC2CE" : "0 2px 0 #ECE2D3" }}>
      {loser && <div style={{ position: "absolute", top: 16, right: -4, transform: "rotate(8deg)", background: C.coral, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, letterSpacing: 0.5, padding: "4px 12px", borderRadius: 8 }}>BIGGER FRAUD</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, flex: "none", borderRadius: "42% 58% 53% 47% / 47% 42% 58% 53%", background: avColor(s.handle), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>{initials(s.handle)}</div>
        <b style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: C.ink, wordBreak: "break-all" }}>@{h}</b>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Tile n={s.wrong} l="wrong calls" color={C.coral} bg="#FFE0E6" />
        <Tile n={s.correct} l="nailed it" color="#1F8A5B" bg="#E4F7EE" />
        <Tile n={s.predictions} l="predictions" color={C.violet} bg="#EDE3FF" />
        <Tile n={s.insults} l="insults" color={C.ink} bg={C.cream} />
      </div>
      <p style={{ fontWeight: 700, fontSize: 13, color: C.muted, margin: "14px 0 0" }}>Verdict accuracy: <b style={{ color: C.ink }}>{accuracy}</b></p>
    </div>
  );
}

function Tile({ n, l, color, bg }: { n: number; l: string; color: string; bg: string }) {
  return (
    <div style={{ background: bg, borderRadius: 14, padding: "12px 14px" }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color, lineHeight: 1 }}>{n}</div>
      <div style={{ fontWeight: 700, fontSize: 11.5, color: C.muted, marginTop: 4 }}>{l}</div>
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
    <div style={{ minHeight: "100vh", background: C.cream }}>
      {/* LIGHT PUBLIC HEADER */}
      <header style={{ maxWidth: 880, margin: "0 auto", padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <GrudgeBall size={38} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, letterSpacing: -0.5, color: C.ink }}>Dendam</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FFE0E6", border: "2px solid #FFC2CE", color: "#C63752", fontWeight: 800, fontSize: 12, padding: "7px 14px", borderRadius: 30 }}>⚔️ head-to-head · read-only</div>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "6px 28px 20px" }}>
        {/* verdict heading */}
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <p style={{ fontWeight: 800, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, margin: "0 0 8px" }}>Dendam&rsquo;s verdict</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(30px,5vw,44px)", letterSpacing: -1, color: C.ink, margin: 0 }}>
            {loser ? <>@{shortHandle(loser.handle)} is the <span style={{ fontFamily: "var(--font-script)", color: C.coral, fontSize: "1.25em" }}>bigger fraud</span></> : <>dead <span style={{ fontFamily: "var(--font-script)", color: C.coral, fontSize: "1.25em" }}>even</span> — both full of it</>}
          </h1>
        </div>

        {/* matchup */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <PlayerCard s={sa} loser={loser?.handle === sa.handle} />
          <span style={{ fontFamily: "var(--font-script)", fontWeight: 700, fontSize: 36, color: C.coral, flex: "none" }}>vs</span>
          <PlayerCard s={sb} loser={loser?.handle === sb.handle} />
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 26 }}>
          <a href={tweetIntentVs(shareUrl, sa.handle, sb.handle)} target="_blank" rel="noreferrer" className="lx-press" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.ink, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, padding: "14px 24px", borderRadius: 40, boxShadow: `0 6px 0 ${C.violet}` }}>𝕏 Post the matchup</a>
          <Link href={`/share/${enc(sa.handle)}`} className="lx-ghost-ink" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: C.ink, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, padding: "13px 20px", borderRadius: 40, border: `2.5px solid ${C.ink}` }}>@{shortHandle(sa.handle, 16)}&rsquo;s file</Link>
          <Link href={`/share/${enc(sb.handle)}`} className="lx-ghost-ink" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: C.ink, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, padding: "13px 20px", borderRadius: 40, border: `2.5px solid ${C.ink}` }}>@{shortHandle(sb.handle, 16)}&rsquo;s file</Link>
          <ShareButton url={`/share/vs/${enc(sa.handle)}/${enc(sb.handle)}`} title={`@${sa.handle} vs @${sb.handle}`} className="dx-sharebtn-lg" label="Copy link" />
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
