import Link from "next/link";

const ACCOUNT_ID =
  "0xe2f6e4a535e0c4179098e6701b9026798b0e17c4622aa0585a14a80a64ca168e";
const EXPLORER = `https://suiscan.xyz/mainnet/object/${ACCOUNT_ID}`;
const REPO = "https://github.com/PugarHuda/dendam";

const FEATURES: { color: string; icon: string; title: string; body: string }[] = [
  {
    color: "violet",
    icon: "🧠",
    title: "Memory as a weapon",
    body: "Every prediction, hot take, and insult is stored on Walrus — then weaponised the moment you're wrong.",
  },
  {
    color: "mint",
    icon: "⚖️",
    title: "Auto-roast on results",
    body: "When real World Cup scores land, Dendam matches them to your calls and roasts the ones you blew.",
  },
  {
    color: "peach",
    icon: "🏟️",
    title: "Match Rooms",
    body: "A room per match where everyone predicts and chats. Dendam stirs the pot; the winner takes the (mock) pool.",
  },
];

export default function LandingPage() {
  return (
    <div className="shell landing playful">
      <header className="topbar">
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
          <Link href="/chat" title="Chat with Dendam">💬 Chat</Link>
          <Link href="/dossier" title="What Dendam remembers about you">📂 Memory</Link>
          <Link href="/room" title="Match rooms — chat & predict per game">🏟️ Rooms</Link>
        </nav>
      </header>

      {/* ── Hero ─────────────────────────────────── */}
      <section className="phero">
        <span className="phero-blob b1" aria-hidden />
        <span className="phero-blob b2" aria-hidden />
        <span className="pstar s1" aria-hidden>⭐</span>
        <span className="pstar s2" aria-hidden>⚽</span>
        <span className="pstar s3" aria-hidden>🔥</span>

        <div className="phero-text">
          <span className="pill-badge">● Live on Walrus Mainnet</span>
          <h2 className="phero-title">
            The World Cup rival that <mark className="hl-mint">remembers</mark> everything
            and <mark className="hl-peach">roasts</mark> you for it.
          </h2>
          <p className="phero-sub">
            Drop your 2026 predictions and hot takes. Dendam stores every one on
            <b> Walrus Memory</b>, then throws them right back the moment you&rsquo;re wrong.
          </p>
          <div className="phero-cta">
            <Link href="/chat?handle=demo" className="pbtn">🔥 Try the demo</Link>
            <Link href="/chat" className="pbtn ghost">Start fresh</Link>
          </div>
          <div className="phero-steps">
            <b>1</b> Make a call&nbsp;&nbsp;·&nbsp;&nbsp;<b>2</b> Saved on Walrus&nbsp;&nbsp;·&nbsp;&nbsp;<b>3</b> Roasted later
          </div>
        </div>

        <div className="phero-card">
          <div className="pcard-inner">
            <div className="pbub dendam">
              <b>🔥 Dendam</b>
              <span>First time I&rsquo;m hearing you — make a call and I&rsquo;ll remember every word.</span>
            </div>
            <div className="pbub you">
              <span>Argentina win it all, Brazil&rsquo;s done 😎</span>
            </div>
            <div className="pbub dendam">
              <span>Bold. I&rsquo;ll hold you to that when Brazil knock them out.</span>
            </div>
          </div>
          <span className="pcard-tag">saved ✓ on Walrus</span>
        </div>
      </section>

      {/* ── Features ─────────────────────────────── */}
      <section>
        <h3 className="psection-title">What makes Dendam sting</h3>
        <p className="psection-sub">Memory that works against you — and a whole crew to share the pain.</p>
        <div className="pfeat-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className={`pfeat ${f.color}`}>
              <div className="pfeat-icon" aria-hidden>{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Before / after ───────────────────────── */}
      <section>
        <h3 className="psection-title">Day 1 it knows nothing. Day N it has a file.</h3>
        <p className="psection-sub">Same nickname, days apart — no reminder needed.</p>
        <div className="ba-grid" style={{ marginTop: 20 }}>
          <div className="ba-card">
            <div className="ba-tag">DAY 1 · memory empty</div>
            <div className="pbub dendam" style={{ maxWidth: "100%" }}>
              <b>🔥 Dendam</b>
              <span>First time I&rsquo;m hearing you, huh? No record of you yet — so go on, make a call.</span>
            </div>
          </div>
          <div className="ba-card hot">
            <div className="ba-tag hot">DAY N · it remembers everything</div>
            <div className="pbub dendam" style={{ maxWidth: "100%" }}>
              <b>🔥 Dendam</b>
              <span>You crowned Argentina champions and wrote off Brazil. Brazil just knocked them out. Still feeling clever?</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Proof + CTA ──────────────────────────── */}
      <section>
        <div className="pcta-card">
          <span className="pstar s4" aria-hidden>🦭</span>
          <h3>Real memory, not a chat log.</h3>
          <p>
            Every memory is encrypted and stored on <b>Walrus Mainnet</b>, tied to a
            MemWalAccount on Sui — so &ldquo;it remembers&rdquo; is genuinely verifiable.
          </p>
          <div className="phero-cta" style={{ justifyContent: "center" }}>
            <Link href="/chat?handle=demo" className="pbtn light">🔥 See it remember you</Link>
            <a className="pbtn ghost-light" href={EXPLORER} target="_blank" rel="noreferrer">Verify on Sui ↗</a>
          </div>
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
