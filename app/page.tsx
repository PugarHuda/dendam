import Link from "next/link";

const ACCOUNT_ID =
  "0xe2f6e4a535e0c4179098e6701b9026798b0e17c4622aa0585a14a80a64ca168e";
const EXPLORER = `https://suiscan.xyz/mainnet/object/${ACCOUNT_ID}`;

const FEATURES: { icon: string; title: string; body: string }[] = [
  {
    icon: "🎯",
    title: "Memory as a weapon",
    body: "Every wrong prediction becomes ammo. Dendam doesn't log your takes — it weaponizes them.",
  },
  {
    icon: "⚖️",
    title: "Auto-roast on results",
    body: "When real match scores land, Dendam matches them against your calls and roasts the ones you blew.",
  },
  {
    icon: "🔥",
    title: "Hot Seat instigator",
    body: "Feed it your group's handles and it pits everyone against each other using their real stored takes.",
  },
  {
    icon: "🏆",
    title: "Hall of Shame",
    body: "A live leaderboard of who's been most wrong — computed purely from memory.",
  },
  {
    icon: "🌍",
    title: "Speaks your language",
    body: "Defaults to English, mirrors whatever you type (Indonesian, Spanish…), shrugs off typos & slang.",
  },
  {
    icon: "🔒",
    title: "Real on-chain memory",
    body: "Encrypted on Walrus Mainnet, tied to a MemWalAccount object on Sui. Verifiable, not a chat log.",
  },
];

const STEPS: { n: string; title: string; body: string }[] = [
  {
    n: "1",
    title: "Recall",
    body: "Before replying, Dendam pulls what it knows about you from Walrus — past predictions, insults, favourite teams.",
  },
  {
    n: "2",
    title: "Respond",
    body: "Those memories are injected into its persona. It confronts your contradictions and dredges up old claims.",
  },
  {
    n: "3",
    title: "Remember",
    body: "It distils the exchange into durable memories and writes them back to Walrus for next time.",
  },
];

export default function LandingPage() {
  return (
    <div className="shell landing">
      <header className="topbar">
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
          <Link href="/chat" title="Chat with Dendam (Face off)">💬 Chat</Link>
          <Link href="/dossier" title="What Dendam remembers about you (The File)">📂 Memory</Link>
          <Link href="/grup" title="Pit your group against each other (Hot Seat)">🔥 Group</Link>
        </nav>
      </header>

      {/* ── Hero ─────────────────────────────────── */}
      <section className="hero">
        <span className="badge live">Live on Walrus Mainnet</span>
        <h2 className="hero-title">
          Make your call.
          <br />
          <span className="grad">Live with it.</span>
        </h2>
        <p className="hero-sub">
          Dendam is a grudge-holding football rival for the FIFA World Cup 2026.
          Every prediction, hot take, and bit of trash talk you throw at it is
          stored on <b>Walrus Memory</b> — then thrown right back the moment
          you&rsquo;re wrong.
        </p>
        <div className="cta-row">
          <Link href="/chat?handle=demo" className="btn">
            🔥 Try the demo — it already remembers
          </Link>
          <Link href="/chat" className="btn ghost">
            Start fresh
          </Link>
          <Link href="/share/demo" className="btn ghost">
            See a live File
          </Link>
        </div>
        <div className="howto">
          <span className="howto-step"><b>1</b> Make a call</span>
          <span className="howto-arrow" aria-hidden>→</span>
          <span className="howto-step"><b>2</b> Dendam saves it on Walrus</span>
          <span className="howto-arrow" aria-hidden>→</span>
          <span className="howto-step"><b>3</b> Come back — it roasts your misses</span>
        </div>
        <p className="hero-hook">
          New here? Hit <b>Try the demo</b> to skip the wait and see it remember
          you right now.
        </p>
      </section>

      {/* ── Before / after ───────────────────────── */}
      <section>
        <div className="section-head">
          <h3>The before / after</h3>
          <span className="count">why memory matters</span>
        </div>
        <div className="ba-grid">
          <div className="ba-card">
            <div className="ba-tag">DAY 1 · memory empty</div>
            <div className="msg-row assistant">
              <div className="avatar dendam" aria-hidden>
                🔥
              </div>
              <div className="msg assistant">
                <div className="who">Dendam</div>
                <span>
                  First time I&rsquo;m hearing you, huh? No record of you yet —
                  so go on, make a call and I&rsquo;ll remember every word.
                </span>
              </div>
            </div>
          </div>
          <div className="ba-card hot">
            <div className="ba-tag hot">DAY N · it remembers everything</div>
            <div className="msg-row assistant">
              <div className="avatar dendam" aria-hidden>
                🔥
              </div>
              <div className="msg assistant">
                <div className="who">Dendam</div>
                <span>
                  I remember you crowned Argentina champions and wrote off
                  Brazil like they were done. Brazil just knocked them out.
                  Still feeling clever?
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────── */}
      <section>
        <div className="section-head">
          <h3>How it works</h3>
          <span className="count">a 3-step loop on Walrus</span>
        </div>
        <div className="steps">
          {STEPS.map((s) => (
            <div key={s.n} className="step">
              <div className="step-n">{s.n}</div>
              <div className="step-title">{s.title}</div>
              <p className="step-body">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────── */}
      <section>
        <div className="section-head">
          <h3>What makes it sting</h3>
          <span className="count">feature set</span>
        </div>
        <div className="feat-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feat">
              <div className="feat-icon" aria-hidden>
                {f.icon}
              </div>
              <div className="feat-title">{f.title}</div>
              <p className="feat-body">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Built on Walrus ──────────────────────── */}
      <section className="walrus-card">
        <h3 style={{ margin: "0 0 8px" }}>🦭 Built on Walrus Memory</h3>
        <p className="hint" style={{ marginTop: 0 }}>
          Dendam&rsquo;s memory runs 100% on Walrus Memory (Mainnet). Each
          memory is embedded, encrypted, and stored on Walrus, tied to a{" "}
          <code>MemWalAccount</code> object on Sui — so &ldquo;the agent
          remembers&rdquo; is genuinely verifiable, not a UI trick.
        </p>
        <div className="cta-row" style={{ marginTop: 14 }}>
          <a className="btn ghost sm" href={EXPLORER} target="_blank" rel="noreferrer">
            🔎 View the MemWalAccount on Sui
          </a>
          <a
            className="btn ghost sm"
            href="https://github.com/PugarHuda/dendam"
            target="_blank"
            rel="noreferrer"
          >
            ⌨️ Source code
          </a>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────── */}
      <section className="final-cta">
        <h3>Got a hot take for the World Cup?</h3>
        <p className="hint" style={{ marginTop: 4, marginBottom: 16 }}>
          Make it. Dendam will be waiting with the receipts.
        </p>
        <Link href="/chat" className="btn">
          🔥 Face off now
        </Link>
      </section>

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
