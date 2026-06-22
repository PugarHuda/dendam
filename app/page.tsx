import Link from "next/link";
import { GrudgeBall, AppIcon } from "@/components/Logo";
import { IconRecall, IconRespond, IconRemember, IconFlame, IconFolder, IconGavel } from "@/components/Icons";

const ACCOUNT_ID =
  "0xe2f6e4a535e0c4179098e6701b9026798b0e17c4622aa0585a14a80a64ca168e";
const EXPLORER = `https://suiscan.xyz/mainnet/object/${ACCOUNT_ID}`;

const STEPS = [
  { n: "1", Icon: IconRecall, title: "Recall", body: "I dig up every dumb take you've ever made. Walrus remembers so I can ruin your afternoon with receipts." },
  { n: "2", Icon: IconRespond, title: "Respond", body: "I clap back in character — and quote your past self word for word, in your language, typos and all." },
  { n: "3", Icon: IconRemember, title: "Remember", body: "Tonight's roast is distilled into permanent grudges, written back to Walrus. The blockchain never forgets either." },
];

const FEATURES = [
  { tone: "violet-light", Icon: IconFlame, title: "The Hot Seat", sub: "group instigator", body: "Drop your group's handles. I pit each other and quote what they ACTUALLY said — cross-user beef, sourced from real memory." },
  { tone: "violet", Icon: IconFolder, title: "The File", sub: "your record public", body: "Every prediction, hot take and insult on a public, link-shareable file — each one a real blob on Walrus you can verify." },
  { tone: "yellow", Icon: IconGavel, title: "Auto-roast", sub: "the bill comes due", body: "The moment a real result lands, I match it to your call and stamp the wrong ones WRONG. Automatically. Forever." },
];

function Squiggle({ color = "var(--coral)" }: { color?: string }) {
  return (
    <svg className="dx-squiggle" viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden>
      <path d="M2 9 Q26 2 50 8 T98 8 T146 8 T198 6" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="dx-page">
      {/* ── Nav ───────────────────────────────────── */}
      <header className="dx-nav">
        <Link href="/" className="dx-brand" style={{ textDecoration: "none" }}>
          <AppIcon size={40} />
          <span className="dx-wordmark">Dendam<span style={{ color: "var(--violet)" }}>.</span></span>
        </Link>
        <nav className="dx-nav-links">
          <a href="#how">How it works</a>
          <Link href="/dossier">The File</Link>
          <a href="#features">Hot Seat</a>
          <Link href="/group">Hall of Shame</Link>
        </nav>
        <Link href="/chat" className="dx-btn dx-btn-ink">Start the beef →</Link>
      </header>

      {/* ── Hero ──────────────────────────────────── */}
      <section className="dx-hero">
        <div className="dx-hero-l">
          <span className="dx-eyebrow"><span aria-hidden>🔥</span> Grudge-holding AI rival · World Cup 2026</span>
          <h1 className="dx-h1">
            Run your mouth.
            <span className="dx-script-wrap">
              <span className="dx-script">I&rsquo;ll make you eat it.</span>
              <Squiggle />
            </span>
          </h1>
          <p className="dx-lead">
            Make your 2026 predictions and hot takes. Dendam stores every one on
            <b> Walrus Memory</b> — then throws it back in your face the second you&rsquo;re wrong.
          </p>
          <div className="dx-cta-row">
            <Link href="/chat?handle=demo" className="dx-btn dx-btn-violet">Start the beef →</Link>
            <Link href="/dossier" className="dx-btn dx-btn-ghost">📂 Open The File</Link>
          </div>
          <p className="dx-micro">0 takes forgiven · ∞ remembered</p>
        </div>

        <div className="dx-hero-r">
          <span className="dx-blob dx-blob-violet" aria-hidden />
          <span className="dx-blob dx-blob-yellow" aria-hidden />
          <div className="dx-hero-ball"><GrudgeBall size={150} /></div>
          <span className="dx-chip dx-chip-1">#cope</span>
          <span className="dx-chip dx-chip-2">#fraud</span>
          <span className="dx-chip dx-chip-3">#toldyouso</span>
          <span className="dx-stamp">HOLDS A GRUDGE<small>since day one</small></span>
        </div>
      </section>

      {/* ── Memory loop (dark band) ───────────────── */}
      <section id="how" className="dx-loop">
        <span className="dx-eyebrow dx-eyebrow-on-dark">The memory loop</span>
        <h2 className="dx-h2 dx-h2-on-dark">
          I don&rsquo;t keep score. <span className="dx-script dx-script-yellow">I keep a file.</span>
        </h2>
        <p className="dx-loop-sub">Every run is the same three-step loop — and it all lives on Walrus Mainnet, not in some cache I can conveniently forget.</p>
        <div className="dx-steps">
          {STEPS.map((s) => (
            <div key={s.n} className="dx-step">
              <span className="dx-step-n">{s.n}</span>
              <span className="dx-icon-badge"><s.Icon size={28} /></span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────── */}
      <section id="features" className="dx-section">
        <h2 className="dx-h2">
          Three ways I make your takes <span className="dx-script">your problem.</span>
        </h2>
        <div className="dx-feat-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className={`dx-feat dx-feat-${f.tone}`}>
              <span className="dx-icon-badge"><f.Icon size={28} /></span>
              <div className="dx-feat-sub">{f.sub}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer CTA ────────────────────────────── */}
      <section className="dx-section">
        <div className="dx-footer-cta">
          <h2 className="dx-h2 dx-h2-on-dark" style={{ margin: 0 }}>Dendam already has a file on you.</h2>
          <p>It&rsquo;s on Walrus Mainnet, tied to a MemWalAccount on Sui — verifiable, not a chat log.</p>
          <div className="dx-cta-row" style={{ justifyContent: "center" }}>
            <Link href="/chat?handle=demo" className="dx-btn dx-btn-yellow">Start the beef →</Link>
            <a className="dx-btn dx-btn-ghost-dark" href={EXPLORER} target="_blank" rel="noreferrer">Verify on Sui ↗</a>
          </div>
        </div>
      </section>

      <footer className="dx-foot">
        <span className="dx-foot-brand"><GrudgeBall size={26} /> Dendam</span>
        <span className="dx-badge-live">● Memory live on Walrus Mainnet</span>
        <span className="dx-foot-meta">Built for Walrus Sessions · S4 · <a href="https://github.com/PugarHuda/dendam" target="_blank" rel="noreferrer">Source</a></span>
      </footer>
    </div>
  );
}
