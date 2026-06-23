"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GrudgeBall } from "@/components/Logo";
import {
  IconFlame,
  IconFolder,
  IconGavel,
  IconRecall,
  IconRespond,
  IconRemember,
  IconCrown,
} from "@/components/Icons";

const ACCOUNT_ID =
  "0xe2f6e4a535e0c4179098e6701b9026798b0e17c4622aa0585a14a80a64ca168e";
const EXPLORER = `https://suiscan.xyz/mainnet/object/${ACCOUNT_ID}`;
const C = {
  cream: "#FBF6EE",
  ink: "#241046",
  violet: "#7C3AED",
  deep: "#2E1065",
  yellow: "#FFC83D",
  coral: "#FF5470",
  body: "#4A3570",
  muted: "#8A77AD",
};
const BLOB = "42% 58% 53% 47% / 47% 42% 58% 53%";

// Underline squiggle under a script accent.
function Squiggle({ color = C.coral }: { color?: string }) {
  return (
    <svg
      viewBox="0 0 400 24"
      preserveAspectRatio="none"
      style={{ position: "absolute", left: 0, bottom: -9, width: "100%", height: 15, overflow: "visible" }}
      aria-hidden
    >
      <path d="M4,14 C90,4 150,20 210,11 C270,3 340,16 396,9" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// "On Walrus ↗" link chip (chain-link icon).
function OnWalrus({ color = C.violet }: { color?: string }) {
  return (
    <a href={EXPLORER} target="_blank" rel="noreferrer" style={{ fontWeight: 800, fontSize: 12.5, color }}>
      <svg viewBox="0 0 48 48" style={{ width: 14, height: 14, verticalAlign: -2, display: "inline-block" }} aria-hidden>
        <g fill="none" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round">
          <path d="M20 28 l8 -8" />
          <path d="M16 23 l-4 4 a6 6 0 0 0 8.5 8.5 l4 -4" />
          <path d="M32 25 l4 -4 a6 6 0 0 0 -8.5 -8.5 l-4 4" />
        </g>
      </svg>{" "}
      on Walrus ↗
    </a>
  );
}

const STEPS = [
  { n: "1", Icon: IconRecall, r: "40% 60% 55% 45% / 50% 45% 55% 50%", title: "Recall", body: "I dig up every dumb take you've ever filed. Walrus remembers so I can ruin your afternoon with receipts." },
  { n: "2", Icon: IconRespond, r: "55% 45% 40% 60% / 50% 55% 45% 50%", title: "Respond", body: "I clap back in character — and quote your past self at your present self. In your language, typos and all." },
  { n: "3", Icon: IconRemember, r: "48% 52% 60% 40% / 45% 50% 50% 55%", title: "Remember", body: "Tonight's nonsense gets distilled into permanent grudges, written on-chain. No takebacks. No editing history." },
];

const SHAME = [
  { rank: "01", initials: "BD", handle: "@budi", wrong: 41, pct: "100%", isKing: true, bg: "#FFE0E6", border: "#FFC2CE", avatarBg: "#FF5470", rankColor: "#FF5470", barColor: "#FF5470" },
  { rank: "02", initials: "HD", handle: "@hud", wrong: 38, pct: "92%", isKing: false, bg: "#fff", border: "#F0E6D6", avatarBg: "#7C3AED", rankColor: "#7C3AED", barColor: "#7C3AED" },
  { rank: "03", initials: "SR", handle: "@sarah", wrong: 27, pct: "66%", isKing: false, bg: "#fff", border: "#F0E6D6", avatarBg: "#B9821A", rankColor: "#B9821A", barColor: "#FFC83D" },
  { rank: "04", initials: "RY", handle: "@reyhan", wrong: 19, pct: "46%", isKing: false, bg: "#fff", border: "#F0E6D6", avatarBg: "#7C3AED", rankColor: "#5B21B6", barColor: "#C9AFFF" },
  { rank: "05", initials: "AN", handle: "@ani", wrong: 12, pct: "29%", isKing: false, bg: "#fff", border: "#F0E6D6", avatarBg: "#9A86C0", rankColor: "#8A77AD", barColor: "#C9AFFF" },
];

// Reveal-on-scroll: add `.is-in` when an element with [data-reveal] enters view.
function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function LandingPage() {
  const [busted, setBusted] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyT = useRef<ReturnType<typeof setTimeout> | null>(null);
  useReveal();

  function copyLink() {
    try {
      navigator.clipboard?.writeText("https://dendam.vercel.app/share/hud");
    } catch {}
    setCopied(true);
    if (copyT.current) clearTimeout(copyT.current);
    copyT.current = setTimeout(() => setCopied(false), 1800);
  }

  const stamp = (
    <div style={{ position: "absolute", top: 14, right: -6, transform: "rotate(11deg)", border: `3px solid ${C.coral}`, color: C.coral, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: 1, padding: "3px 12px", borderRadius: 6, opacity: 0.92 }}>
      WRONG
    </div>
  );

  return (
    <div style={{ overflow: "hidden", width: "100%", background: C.cream }}>
      {/* ============ NAV ============ */}
      <nav style={{ maxWidth: 1200, margin: "0 auto", padding: "26px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <GrudgeBall size={44} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 25, letterSpacing: -0.5, color: C.ink }}>Dendam</span>
        </Link>
        <div className="lx-navlinks" style={{ display: "flex", alignItems: "center", gap: 30, fontWeight: 700, fontSize: 15, color: "#3B2168" }}>
          <a href="#how">How it works</a>
          <Link href="/dossier">The File</Link>
          <a href="#features">Hot Seat</a>
          <a href="#shame">Hall of Shame</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/chat" className="lx-signin" style={{ fontWeight: 800, fontSize: 15, color: C.ink }}>Sign in</Link>
          <Link href="/chat" className="lx-press" style={{ background: C.ink, color: "#fff", fontWeight: 800, fontSize: 15, padding: "12px 22px", borderRadius: 40, whiteSpace: "nowrap", boxShadow: `0 6px 0 ${C.violet}` }}>Start the beef</Link>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <header style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "40px 32px 90px" }}>
        <svg viewBox="0 0 200 200" className="anim-floaty" style={{ position: "absolute", top: 30, right: "38%", width: 120, opacity: 0.55 }} aria-hidden>
          <path fill="#E7D9FF" d="M44,-58C58,-49,71,-37,75,-22C79,-7,74,11,65,26C56,41,42,53,26,60C10,67,-8,69,-26,63C-44,57,-62,43,-69,25C-76,7,-72,-15,-61,-31C-50,-47,-32,-57,-13,-63C6,-69,25,-67,44,-58Z" transform="translate(100 100)" />
        </svg>
        <div className="anim-floaty2" style={{ position: "absolute", top: 120, left: -40, width: 90, height: 90, background: C.yellow, borderRadius: BLOB }} aria-hidden />

        <div className="lx-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 40, alignItems: "center" }}>
          {/* left copy */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#EDE3FF", color: "#5B21B6", fontWeight: 800, fontSize: 13.5, padding: "9px 16px", borderRadius: 40, marginBottom: 26, border: "2px solid #D6C2FF" }}>
              <IconFlame size={17} /> Grudge-holding AI rival · World Cup 2026
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(46px,7.4vw,72px)", lineHeight: 0.98, letterSpacing: -2, margin: "0 0 22px", color: C.ink }}>
              Run your<br />mouth.
              <span style={{ display: "block", position: "relative", width: "max-content", maxWidth: "100%", marginTop: 14 }}>
                <span style={{ fontFamily: "var(--font-script)", fontWeight: 700, color: C.violet, fontSize: "clamp(38px,5.5vw,50px)", lineHeight: 0.9, whiteSpace: "nowrap" }}>I&rsquo;ll make you eat it.</span>
                <Squiggle />
              </span>
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, fontWeight: 600, color: C.body, maxWidth: 480, margin: "0 0 32px" }}>
              Dendam stores every prediction, hot take, and insult you throw about the World Cup 2026 on <strong style={{ color: C.ink }}>Walrus Memory</strong> — then throws it back in your face the second you&rsquo;re wrong.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <Link href="/chat?handle=demo" className="lx-press" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: C.violet, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, padding: "17px 30px", borderRadius: 48, boxShadow: `0 7px 0 ${C.deep}` }}>
                Start the beef <span>→</span>
              </Link>
              <Link href="/dossier" className="lx-ghost-ink" style={{ display: "inline-flex", alignItems: "center", gap: 9, color: C.ink, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, padding: "17px 26px", borderRadius: 48, border: `2.5px solid ${C.ink}` }}>
                <IconFolder size={21} /> Open The File
              </Link>
            </div>
            <p style={{ fontFamily: "var(--font-script)", fontWeight: 600, fontSize: 23, color: C.muted, margin: "20px 0 0" }}>0 takes forgiven · ∞ remembered</p>
          </div>

          {/* right visual */}
          <div className="lx-hero-visual" style={{ position: "relative", zIndex: 1, minHeight: 440 }}>
            <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", width: 330, height: 360, background: C.violet, borderRadius: "46% 54% 43% 57% / 55% 45% 55% 45%" }} aria-hidden />
            <div style={{ position: "absolute", top: 55, left: "42%", width: 300, height: 330, background: C.yellow, borderRadius: "54% 46% 57% 43% / 45% 55% 45% 55%", opacity: 0.9 }} aria-hidden />
            <div style={{ position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)", width: 300, height: 360, display: "grid", placeItems: "center" }}>
              <div className="anim-floaty"><GrudgeBall size={210} /></div>
            </div>

            {/* floating chips */}
            <div className="anim-cope" style={{ position: "absolute", top: 6, right: -6, background: C.ink, color: "#fff", fontWeight: 800, fontSize: 14, padding: "9px 15px", borderRadius: 30, boxShadow: "0 5px 14px rgba(46,16,101,.3)" }}>#cope</div>
            <div className="anim-fraud" style={{ position: "absolute", top: 150, right: -30, background: C.coral, color: "#fff", fontWeight: 800, fontSize: 14, padding: "9px 15px", borderRadius: 30 }}>#fraud</div>
            <div className="anim-told" style={{ position: "absolute", bottom: 36, left: -26, background: "#fff", color: C.violet, fontWeight: 800, fontSize: 14, padding: "9px 15px", borderRadius: 30, boxShadow: "0 5px 14px rgba(124,58,237,.22)" }}>#toldyouso</div>

            {/* rubber-stamp seal */}
            <div className="anim-wobble" style={{ position: "absolute", bottom: -6, right: 6, width: 104, height: 104, border: `3px dashed ${C.ink}`, borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", background: C.yellow }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, lineHeight: 1, color: C.ink }}>HOLDS A<br />GRUDGE</span>
              <span style={{ fontFamily: "var(--font-script)", fontWeight: 700, fontSize: 16, color: C.violet, marginTop: 3 }}>since day one</span>
            </div>
            {/* squiggle arrow */}
            <svg viewBox="0 0 120 90" style={{ position: "absolute", bottom: 60, left: -66, width: 104, overflow: "visible" }} aria-hidden>
              <path d="M110,8 C70,2 18,18 30,52 C36,70 60,72 70,60" stroke={C.violet} strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M62,72 L72,58 L80,74" stroke={C.violet} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </header>

      {/* ============ HOW IT WORKS — MEMORY LOOP ============ */}
      <section id="how" style={{ background: C.deep, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, left: -30, width: 140, height: 140, background: C.violet, borderRadius: BLOB, opacity: 0.5 }} aria-hidden />
        <div style={{ position: "absolute", bottom: -50, right: "6%", width: 110, height: 110, background: C.yellow, borderRadius: "50%", opacity: 0.25 }} aria-hidden />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 32px 84px", position: "relative", zIndex: 2 }}>
          <div data-reveal className="lx-rise-target" style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 54px" }}>
            <p style={{ fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", fontSize: 13, color: "#C4A8FF", margin: "0 0 14px" }}>The memory loop</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(34px,5vw,48px)", lineHeight: 1.05, letterSpacing: -1, color: "#fff", margin: 0 }}>
              I don&rsquo;t keep score. <span style={{ fontFamily: "var(--font-script)", fontWeight: 700, color: C.yellow, fontSize: "clamp(42px,6vw,60px)" }}>I keep a file.</span>
            </h2>
            <p style={{ color: "#C9B8EC", fontWeight: 600, fontSize: 17, margin: "18px 0 0" }}>Every chat runs the same three-step loop — and it all lives on Walrus Mainnet, not in some cache I can conveniently forget.</p>
          </div>
          <div className="lx-3col" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22, alignItems: "stretch" }}>
            {STEPS.map((s, i) => (
              <div key={s.n} data-reveal className="lx-rise-target" style={{ background: "#3A1980", border: "2px solid #4C2398", borderRadius: 26, padding: "30px 26px", position: "relative", transitionDelay: `${i * 90}ms` }}>
                <div style={{ position: "absolute", top: -18, right: 22, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 56, color: C.yellow, opacity: 0.85, lineHeight: 1 }}>{s.n}</div>
                <div style={{ width: 54, height: 54, background: "#fff", borderRadius: s.r, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  <s.Icon size={30} />
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 23, color: "#fff", margin: "0 0 9px" }}>{s.title}</h3>
                <p style={{ color: "#CDBDEE", fontWeight: 600, fontSize: 15, lineHeight: 1.55, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section id="features" style={{ maxWidth: 1200, margin: "0 auto", padding: "84px 32px 40px", position: "relative" }}>
        <div data-reveal className="lx-rise-target" style={{ marginBottom: 44 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(34px,4.6vw,46px)", lineHeight: 1.04, letterSpacing: -1, color: C.ink, margin: 0 }}>
            Three ways I make<br />your takes <span style={{ fontFamily: "var(--font-script)", fontWeight: 700, color: C.violet, fontSize: "clamp(42px,5.8vw,58px)" }}>your problem.</span>
          </h2>
        </div>
        <div className="lx-3col" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, alignItems: "stretch" }}>
          {/* Hot Seat */}
          <div data-reveal className="lx-rise-target" style={{ background: "#EDE3FF", borderRadius: 30, padding: "30px 28px 32px", position: "relative", overflow: "hidden", minHeight: 300 }}>
            <svg viewBox="0 0 120 120" style={{ position: "absolute", top: -10, right: -10, width: 120, opacity: 0.5 }} aria-hidden>
              <path d="M10,40 Q40,10 70,40 T110,50" stroke="#C9AFFF" strokeWidth="9" fill="none" strokeLinecap="round" />
              <path d="M14,68 Q44,40 74,68 T108,72" stroke="#C9AFFF" strokeWidth="9" fill="none" strokeLinecap="round" />
            </svg>
            <div style={{ width: 54, height: 54, background: "#fff", borderRadius: BLOB, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(124,58,237,.18)", marginBottom: 80 }}><IconFlame size={30} /></div>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 25, color: C.ink, margin: "0 0 4px" }}>The Hot Seat</h3>
            <p style={{ fontFamily: "var(--font-script)", fontWeight: 700, fontSize: 24, color: C.violet, margin: "0 0 12px" }}>group instigator</p>
            <p style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.55, color: C.body, margin: 0 }}>Drop your group&rsquo;s handles. I pit you against each other and quote one fraud&rsquo;s take straight at another. Chaos — sourced from real memory.</p>
          </div>
          {/* The File */}
          <div data-reveal className="lx-rise-target" style={{ background: C.violet, borderRadius: 30, padding: "30px 28px 32px", position: "relative", overflow: "hidden", minHeight: 300, transitionDelay: "90ms" }}>
            <svg viewBox="0 0 120 120" style={{ position: "absolute", bottom: -14, right: -6, width: 130, opacity: 0.4 }} aria-hidden>
              <circle cx="60" cy="60" r="50" stroke="#fff" strokeWidth="7" fill="none" />
              <circle cx="60" cy="60" r="33" stroke="#fff" strokeWidth="7" fill="none" />
              <circle cx="60" cy="60" r="16" stroke="#fff" strokeWidth="7" fill="none" />
            </svg>
            <div style={{ width: 54, height: 54, background: "#fff", borderRadius: "55% 45% 40% 60% / 50% 55% 45% 50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(0,0,0,.18)", marginBottom: 80 }}><IconFolder size={30} /></div>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 25, color: "#fff", margin: "0 0 4px" }}>The File</h3>
            <p style={{ fontFamily: "var(--font-script)", fontWeight: 700, fontSize: 24, color: C.yellow, margin: "0 0 12px" }}>your record, public</p>
            <p style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.55, color: "#EADDFF", margin: 0 }}>Predictions, insults, accuracy — all of it. Every card links to its Walrus blob. Receipts you physically cannot delete.</p>
          </div>
          {/* Auto-roast */}
          <div data-reveal className="lx-rise-target" style={{ background: C.yellow, borderRadius: 30, padding: "30px 28px 32px", position: "relative", overflow: "hidden", minHeight: 300, transitionDelay: "180ms" }}>
            <div style={{ position: "absolute", top: 18, right: 18, display: "grid", gridTemplateColumns: "repeat(4,7px)", gap: 7, opacity: 0.55 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <i key={i} style={{ width: 7, height: 7, background: C.ink, borderRadius: "50%", display: "block" }} />
              ))}
            </div>
            <div style={{ width: 54, height: 54, background: "#fff", borderRadius: "48% 52% 60% 40% / 45% 50% 50% 55%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(46,16,101,.18)", marginBottom: 80 }}><IconGavel size={30} /></div>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 25, color: C.ink, margin: "0 0 4px" }}>Auto-roast</h3>
            <p style={{ fontFamily: "var(--font-script)", fontWeight: 700, fontSize: 24, color: C.violet, margin: "0 0 12px" }}>the kill shot</p>
            <p style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.55, color: "#4A2E00", margin: 0 }}>The moment a real result lands, I match it to your prediction and stamp the wrong ones <strong>WRONG</strong> — permanently, on Walrus.</p>
          </div>
        </div>
      </section>

      {/* ============ THE FILE PREVIEW ============ */}
      <section id="file" style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 32px 40px" }}>
        <div data-reveal className="lx-rise-target" style={{ background: "#fff", border: `2.5px solid ${C.ink}`, borderRadius: 34, padding: 38, boxShadow: "0 18px 0 #EDE3FF", position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
            <div>
              <p style={{ fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", fontSize: 12, color: "#9A86C0", margin: "0 0 6px" }}>
                <IconFolder size={15} /> The File on
              </p>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 42, letterSpacing: -1, color: C.ink, margin: 0 }}>@hud</h2>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-script)", fontWeight: 700, fontSize: 22, color: C.coral, marginBottom: 4 }}>accuracy of a coin flip… but worse</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 220, height: 14, background: "#EDE3FF", borderRadius: 20, overflow: "hidden" }}>
                  <div style={{ width: "23%", height: "100%", background: "linear-gradient(90deg,#FF5470,#FFC83D)", borderRadius: 20 }} />
                </div>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: C.ink }}>23%</span>
              </div>
            </div>
          </div>

          <div className="lx-3col" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
            <div style={{ background: "#EDE3FF", borderRadius: 20, padding: "18px 22px" }}><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 34, color: C.violet, lineHeight: 1 }}>12</div><div style={{ fontWeight: 700, fontSize: 14, color: "#5B21B6", marginTop: 5 }}>predictions on file</div></div>
            <div style={{ background: "#FFEFC2", borderRadius: 20, padding: "18px 22px" }}><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 34, color: "#B9821A", lineHeight: 1 }}>9</div><div style={{ fontWeight: 700, fontSize: 14, color: "#8A5E0E", marginTop: 5 }}>busted by reality</div></div>
            <div style={{ background: "#FFE0E6", borderRadius: 20, padding: "18px 22px" }}><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 34, color: C.coral, lineHeight: 1 }}>31</div><div style={{ fontWeight: 700, fontSize: 14, color: "#C63752", marginTop: 5 }}>insults thrown at me</div></div>
          </div>

          <div className="lx-2col" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
            {/* busted prediction */}
            <div style={{ background: C.cream, border: "2px solid #F0E6D6", borderRadius: 20, padding: "20px 22px", position: "relative", overflow: "hidden" }}>
              <span style={{ display: "inline-block", background: C.ink, color: "#fff", fontWeight: 800, fontSize: 11, letterSpacing: 1, padding: "5px 11px", borderRadius: 30, marginBottom: 12 }}>PREDICTION</span>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 19, color: C.ink, margin: "0 0 10px", lineHeight: 1.3 }}>&ldquo;Argentina wins it all, easy. Bookmark this.&rdquo;</p>
              <p style={{ fontWeight: 700, fontSize: 13.5, color: "#C63752", margin: "0 0 14px" }}>↳ Out in the quarters. Filed under <em>delusion</em>.</p>
              <OnWalrus />
              {stamp}
            </div>
            {/* hot take */}
            <div style={{ background: C.cream, border: "2px solid #F0E6D6", borderRadius: 20, padding: "20px 22px" }}>
              <span style={{ display: "inline-block", background: C.violet, color: "#fff", fontWeight: 800, fontSize: 11, letterSpacing: 1, padding: "5px 11px", borderRadius: 30, marginBottom: 12 }}>HOT TAKE</span>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 19, color: C.ink, margin: "0 0 10px", lineHeight: 1.3 }}>&ldquo;Mbappé is washed and overrated, actually.&rdquo;</p>
              <p style={{ fontWeight: 700, fontSize: 13.5, color: "#7C5B12", margin: "0 0 14px" }}>↳ Noted. We&rsquo;ll revisit this in July.</p>
              <OnWalrus />
            </div>
            {/* insult */}
            <div style={{ background: C.cream, border: "2px solid #F0E6D6", borderRadius: 20, padding: "20px 22px" }}>
              <span style={{ display: "inline-block", background: C.coral, color: "#fff", fontWeight: 800, fontSize: 11, letterSpacing: 1, padding: "5px 11px", borderRadius: 30, marginBottom: 12 }}>INSULT</span>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 19, color: C.ink, margin: "0 0 10px", lineHeight: 1.3 }}>&ldquo;You&rsquo;re just a chatbot, you&rsquo;ll forget this by tomorrow lol&rdquo;</p>
              <p style={{ fontWeight: 700, fontSize: 13.5, color: "#5B21B6", margin: "0 0 14px" }}>↳ It&rsquo;s tomorrow. The file says otherwise.</p>
              <OnWalrus />
            </div>
            {/* pending → bustable (interactive) */}
            <div style={{ background: C.ink, borderRadius: 20, padding: "20px 22px", position: "relative", overflow: "hidden" }}>
              <span style={{ display: "inline-block", background: C.yellow, color: C.ink, fontWeight: 800, fontSize: 11, letterSpacing: 1, padding: "5px 11px", borderRadius: 30, marginBottom: 12 }}>PREDICTION</span>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 19, color: "#fff", margin: "0 0 14px", lineHeight: 1.3 }}>&ldquo;Indonesia goes through the group stage. Trust.&rdquo;</p>
              {!busted ? (
                <div>
                  <p style={{ fontFamily: "var(--font-script)", fontWeight: 700, fontSize: 21, color: "#C4A8FF", margin: "0 0 14px" }}>status: pending… for now 👀</p>
                  <button onClick={() => setBusted(true)} className="lx-press" style={{ background: C.coral, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, border: "none", padding: "12px 20px", borderRadius: 36, cursor: "pointer", boxShadow: "0 5px 0 #B3243E", display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <IconGavel size={18} /> Hold me to it
                  </button>
                </div>
              ) : (
                <div className="lx-rise">
                  <p style={{ fontWeight: 700, fontSize: 13.5, color: "#FFB3C0", margin: "0 0 14px" }}>↳ Reality checked. Stamped and stored on-chain. No takebacks.</p>
                  <OnWalrus color={C.yellow} />
                  <div style={{ position: "absolute", top: 16, right: -4, transform: "rotate(11deg)", border: `3px solid ${C.coral}`, color: C.coral, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: 1, padding: "3px 12px", borderRadius: 6 }}>WRONG</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============ HALL OF SHAME ============ */}
      <section id="shame" style={{ maxWidth: 1200, margin: "0 auto", padding: "70px 32px 40px" }}>
        <div data-reveal className="lx-rise-target" style={{ textAlign: "center", marginBottom: 44 }}>
          <p style={{ fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", fontSize: 13, color: "#9A86C0", margin: "0 0 12px" }}>
            <IconCrown size={17} /> Computed purely from stored memory
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(34px,5vw,48px)", letterSpacing: -1, color: C.ink, margin: 0 }}>
            The <span style={{ fontFamily: "var(--font-script)", fontWeight: 700, color: C.coral, fontSize: "clamp(42px,6vw,60px)" }}>Hall of Shame</span>
          </h2>
          <p style={{ fontWeight: 600, fontSize: 17, color: C.body, margin: "14px 0 0" }}>Ranked by how often the file caught you being confidently wrong.</p>
        </div>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
          {SHAME.map((row, i) => (
            <div key={row.rank} data-reveal className="lx-rise-target" style={{ display: "flex", alignItems: "center", gap: 18, background: row.bg, border: `2px solid ${row.border}`, borderRadius: 22, padding: "16px 22px", transitionDelay: `${i * 70}ms` }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, color: row.rankColor, width: 44, textAlign: "center" }}>{row.rank}</div>
              <div style={{ width: 48, height: 48, borderRadius: BLOB, background: row.avatarBg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>{row.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19, color: C.ink }}>{row.handle}</span>
                  {row.isKing && <IconCrown size={20} />}
                </div>
                <div style={{ height: 8, background: "#fff", borderRadius: 10, overflow: "hidden", marginTop: 7 }}>
                  <div style={{ width: row.pct, height: "100%", background: row.barColor, borderRadius: 10 }} />
                </div>
              </div>
              <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: row.rankColor, lineHeight: 1 }}>{row.wrong}</div>
                <div style={{ fontWeight: 700, fontSize: 12, color: C.muted }}>times wrong</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FOOTER / SHARE CTA ============ */}
      <section style={{ maxWidth: 1200, margin: "48px auto 0", padding: "0 32px 60px" }}>
        <div data-reveal className="lx-rise-target" style={{ background: C.violet, borderRadius: 36, padding: "64px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div className="anim-floaty" style={{ position: "absolute", top: -30, left: "8%", width: 120, height: 120, background: C.yellow, borderRadius: BLOB, opacity: 0.85 }} aria-hidden />
          <div className="anim-floaty2" style={{ position: "absolute", bottom: -40, right: "6%", width: 150, height: 150, background: C.deep, borderRadius: "54% 46% 57% 43% / 45% 55% 45% 55%", opacity: 0.6 }} aria-hidden />
          <div style={{ position: "relative", zIndex: 2 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(38px,5.6vw,54px)", lineHeight: 1.02, letterSpacing: -1.5, color: "#fff", margin: "0 0 10px" }}>
              Dendam already has<br />a <span style={{ fontFamily: "var(--font-script)", fontWeight: 700, color: C.yellow, fontSize: "clamp(46px,6.6vw,66px)" }}>file on you.</span>
            </h2>
            <p style={{ fontWeight: 700, fontSize: 18, color: "#E7DAFF", margin: "0 0 34px" }}>Make your call about the World Cup 2026. Then live with it.</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link href="/chat?handle=demo" className="lx-press" style={{ background: C.yellow, color: C.ink, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, padding: "17px 32px", borderRadius: 48, boxShadow: `0 7px 0 ${C.deep}` }}>Start the beef →</Link>
              <a href={EXPLORER} target="_blank" rel="noreferrer" className="lx-press" style={{ background: C.ink, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, padding: "17px 26px", borderRadius: 48 }}>Verify on Sui ↗</a>
              <button onClick={copyLink} className="lx-press" style={{ position: "relative", background: "transparent", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, padding: "17px 26px", borderRadius: 48, border: "2.5px solid #fff", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 9 }}>
                <svg viewBox="0 0 48 48" style={{ width: 19, height: 19, flex: "none" }} aria-hidden>
                  <rect x="9" y="9" width="20" height="20" rx="4.5" fill="none" stroke="currentColor" strokeWidth="3.4" />
                  <rect x="19" y="19" width="20" height="20" rx="4.5" fill="none" stroke="currentColor" strokeWidth="3.4" />
                </svg>{" "}
                Copy link
                {copied && <span style={{ position: "absolute", top: -34, left: "50%", transform: "translateX(-50%)", background: C.ink, color: C.yellow, fontWeight: 800, fontSize: 13, padding: "6px 12px", borderRadius: 20, whiteSpace: "nowrap" }}>Copied! 📋</span>}
              </button>
            </div>
          </div>
        </div>

        {/* footer strip */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap", padding: "36px 8px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <GrudgeBall size={36} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: C.ink }}>Dendam</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, background: "#E4F7EE", border: "2px solid #BCE9D3", color: "#1F8A5B", fontWeight: 800, fontSize: 13, padding: "8px 16px", borderRadius: 30 }}>
            <span style={{ width: 9, height: 9, background: "#1F8A5B", borderRadius: "50%", display: "inline-block" }} /> Memory live on Walrus Mainnet
          </div>
          <p style={{ fontWeight: 700, fontSize: 13.5, color: C.muted, margin: 0 }}>Built for Walrus Sessions · S4 · World Cup 2026</p>
        </div>
      </section>
    </div>
  );
}
