import Link from "next/link";

const ACCOUNT_ID =
  "0xe2f6e4a535e0c4179098e6701b9026798b0e17c4622aa0585a14a80a64ca168e";
const EXPLORER = `https://suiscan.xyz/mainnet/object/${ACCOUNT_ID}`;
const REPO = "https://github.com/PugarHuda/dendam";

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
          <Link href="/room" title="Prediction rooms per match">🏟️ Rooms</Link>
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
          A football rival for the World Cup 2026 that <b>remembers</b> every
          prediction you make — stored on Walrus — and throws it back the moment
          you&rsquo;re wrong.
        </p>
        <div className="cta-row">
          <Link href="/chat?handle=demo" className="btn">
            🔥 Try the demo
          </Link>
          <Link href="/chat" className="btn ghost">
            Start fresh
          </Link>
        </div>
        <div className="howto">
          <span className="howto-step"><b>1</b> Make a call</span>
          <span className="howto-arrow" aria-hidden>→</span>
          <span className="howto-step"><b>2</b> It&rsquo;s saved on Walrus</span>
          <span className="howto-arrow" aria-hidden>→</span>
          <span className="howto-step"><b>3</b> Come back — it roasts your misses</span>
        </div>
      </section>

      {/* ── The one insight: before / after ──────── */}
      <section>
        <div className="section-head">
          <h3>Day 1 it knows nothing. Day N it has a file.</h3>
          <span className="count">that&rsquo;s the whole point</span>
        </div>
        <div className="ba-grid">
          <div className="ba-card">
            <div className="ba-tag">DAY 1 · memory empty</div>
            <div className="msg-row assistant">
              <div className="avatar dendam" aria-hidden>🔥</div>
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
              <div className="avatar dendam" aria-hidden>🔥</div>
              <div className="msg assistant">
                <div className="who">Dendam</div>
                <span>
                  I remember you crowned Argentina champions and wrote off Brazil
                  like they were done. Brazil just knocked them out. Still feeling
                  clever?
                </span>
              </div>
            </div>
          </div>
        </div>
        <p className="hint" style={{ textAlign: "center", marginTop: 14 }}>
          Same handle, days apart — no reminder. It also auto-roasts when real
          results land, and a <b>Hot Seat</b> mode pits your group against each
          other.
        </p>
      </section>

      {/* ── Proof + close ────────────────────────── */}
      <section className="proof">
        <p>
          This isn&rsquo;t a chat log. Every memory is encrypted and stored on{" "}
          <b>Walrus Mainnet</b>, tied to a <code>MemWalAccount</code> on Sui — so
          &ldquo;it remembers&rdquo; is genuinely verifiable.
        </p>
        <div className="cta-row" style={{ justifyContent: "center" }}>
          <Link href="/chat?handle=demo" className="btn">
            🔥 See it remember you
          </Link>
          <a className="btn ghost" href={EXPLORER} target="_blank" rel="noreferrer">
            Verify on Sui ↗
          </a>
        </div>
      </section>

      <footer className="footer">
        <span>Memory on Walrus · Sui Mainnet</span>
        <span>
          <a href={REPO} target="_blank" rel="noreferrer">Source</a> · #Walrus
        </span>
      </footer>
    </div>
  );
}
