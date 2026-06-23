"use client";

import { useEffect, useState } from "react";
import { HANDLE_KEY, TopBar, initialHandle } from "@/components/TopBar";
import { GrudgeBall } from "@/components/Logo";
import { IconCrown, IconFlame } from "@/components/Icons";

type Row = {
  handle: string;
  predictions: number;
  wrong: number;
  correct: number;
  insults: number;
  accuracy: number | null;
};

function parseHandles(raw: string): string[] {
  return raw
    .split(/[,\n]/)
    .map((s) => s.trim().replace(/^@/, ""))
    .filter(Boolean);
}

const C = {
  cream: "#FBF6EE",
  ink: "#241046",
  violet: "#7C3AED",
  yellow: "#FFC83D",
  coral: "#FF5470",
  body: "#4A3570",
  muted: "#8A77AD",
};

const AVATAR_BG = ["#7C3AED", "#FFC83D", "#FF5470", "#241046", "#B9821A", "#9A86C0"];
const initialsOf = (h: string) => h.replace(/^@/, "").slice(0, 2).toUpperCase();

// Crown SVG used on the biggest-fraud feature.
function CrownMark({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" style={{ width: size, height: size }} aria-hidden>
      <path d="M7 36 L10 15 L19 25 L24 11 L29 25 L38 15 L41 36 Z" fill="#FFC83D" stroke="#241046" strokeWidth="3" strokeLinejoin="round" />
      <line x1="10" y1="40.5" x2="38" y2="40.5" stroke="#241046" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

export default function GrupPage() {
  const [handle, setHandle] = useState("anon");
  const [members, setMembers] = useState("");
  const [topic, setTopic] = useState("");
  const [lines, setLines] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setHandle(initialHandle());
  }, []);
  useEffect(() => {
    localStorage.setItem(HANDLE_KEY, handle);
  }, [handle]);

  useEffect(() => {
    if (!members && handle && handle !== "anon") setMembers(handle + ", ");
  }, [handle, members]);

  async function loadBoard() {
    const handles = parseHandles(members);
    if (handles.length < 1) return;
    setLoadingBoard(true);
    setErr("");
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handles }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(
          res.status === 429
            ? "Slow down a moment — too many requests."
            : "Couldn't tally the board just now. Try again.",
        );
        return;
      }
      setRows(data.rows ?? []);
    } catch {
      setErr("Couldn't tally the board just now. Try again.");
    } finally {
      setLoadingBoard(false);
    }
  }

  async function stirItUp() {
    const handles = parseHandles(members);
    if (handles.length < 2) {
      setErr("Enter at least 2 handles (comma-separated).");
      return;
    }
    setErr("");
    setBusy(true);
    setLines([]);
    setTopic("");
    try {
      const res = await fetch("/api/instigate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handles }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(
          res.status === 429
            ? "Slow down a moment — too many requests."
            : data.error === "need_at_least_2_handles"
              ? "Enter at least 2 handles."
              : "Dendam couldn't stir it up just now. Try again.",
        );
        return;
      }
      setTopic(data.topic || "");
      setLines((data.provocations || []).map((p: { line: string }) => p.line));
      loadBoard(); // refresh standings after stirring
    } catch {
      setErr("Connection failed.");
    } finally {
      setBusy(false);
    }
  }

  const ranked = [...rows].sort((a, b) => b.wrong - a.wrong);
  const maxWrong = Math.max(1, ...ranked.map((r) => r.wrong));
  const king = ranked[0];
  const accPct = (r: Row) => (r.accuracy === null ? null : Math.round(r.accuracy * 100));

  return (
    <div style={{ minHeight: "100vh", background: C.cream }}>
      <TopBar handle={handle} setHandle={setHandle} active="group" />

      {/* HEADER */}
      <header style={{ maxWidth: 1080, margin: "0 auto", padding: "18px 28px 4px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FFE0E6", border: "2px solid #FFC2CE", borderRadius: 30, padding: "7px 15px", fontWeight: 800, fontSize: 12, letterSpacing: 0.5, color: "#C63752", marginBottom: 16 }}>
          <IconCrown size={16} /> Computed purely from stored memory
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(38px,6vw,52px)", letterSpacing: -1.5, color: C.ink, margin: 0 }}>
          The <span style={{ fontFamily: "var(--font-script)", fontWeight: 700, color: C.coral, fontSize: "clamp(46px,7vw,64px)" }}>Hall of Shame</span>
        </h1>
        <p style={{ fontWeight: 600, fontSize: 16, color: C.body, margin: "12px auto 0", maxWidth: 560 }}>Ranked by how often the file caught your group being confidently, loudly wrong about the World Cup 2026.</p>
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "22px 28px 56px" }}>
        {/* STIR THE GROUP (Hot Seat input) */}
        <div style={{ background: "#fff", border: `2.5px solid ${C.ink}`, borderRadius: 24, padding: "22px 24px", marginBottom: 26, boxShadow: "0 6px 0 #EDE3FF" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
            <IconFlame size={22} />
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 21, color: C.ink, margin: 0 }}>The Hot Seat</h2>
          </div>
          <p style={{ fontWeight: 600, fontSize: 14, color: C.body, margin: "0 0 14px" }}>Enter a few nicknames that have chatted with Dendam. <strong style={{ color: C.ink }}>Stir it up</strong> makes Dendam provoke them using what each one actually said — then tally the board below.</p>
          <div style={{ display: "flex", gap: 10, alignItems: "center", background: C.cream, border: "2px solid #E4D8C8", borderRadius: 16, padding: "4px 6px 4px 16px", marginBottom: 12 }}>
            <span style={{ color: C.violet, fontWeight: 800 }}>@</span>
            <input
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14.5, color: C.ink, minWidth: 0 }}
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              placeholder="e.g. hud, andi, budi"
              spellCheck={false}
              aria-label="Group handles"
            />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={stirItUp} disabled={busy} className="lx-press" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.violet, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, border: "none", padding: "12px 22px", borderRadius: 30, cursor: "pointer", boxShadow: "0 5px 0 #2E1065", opacity: busy ? 0.6 : 1 }}>
              <IconFlame size={18} /> {busy ? "Pouring fuel…" : "Stir it up"}
            </button>
            <button onClick={loadBoard} disabled={loadingBoard} className="mx-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: `2.5px solid ${C.ink}`, color: C.ink, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, padding: "11px 20px", borderRadius: 30, cursor: "pointer" }}>
              <IconCrown size={18} /> {loadingBoard ? "Tallying…" : "Tally the board"}
            </button>
            <a href="/room" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginLeft: "auto", alignSelf: "center", fontWeight: 800, fontSize: 12.5, color: C.violet }}>Match Rooms → win the pool</a>
          </div>
          {err && <p style={{ fontWeight: 700, fontSize: 13, color: C.coral, margin: "12px 0 0" }}>{err}</p>}
          {topic && <p style={{ fontWeight: 700, fontSize: 13, color: C.muted, margin: "12px 0 0" }}>Today&rsquo;s fuel: <b style={{ color: C.ink }}>{topic}</b></p>}
          {lines.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
              {lines.map((l, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ flex: "none", marginTop: 2 }}><GrudgeBall size={30} /></span>
                  <div style={{ background: "#F5EFFF", border: "2px solid #E2D3FA", borderRadius: "4px 16px 16px 16px", padding: "11px 15px", fontWeight: 600, fontSize: 13.5, lineHeight: 1.5, color: C.ink }}>{l}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BIGGEST FRAUD feature */}
        {king && (
          <div style={{ background: C.ink, borderRadius: 28, padding: "30px 32px", marginBottom: 26, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 26, flexWrap: "wrap" }}>
            <div style={{ position: "absolute", top: -40, right: -20, width: 160, height: 160, background: C.violet, borderRadius: "46% 54% 43% 57% / 55% 45% 55% 45%", opacity: 0.5 }} aria-hidden />
            <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 92, height: 92, borderRadius: "42% 58% 53% 47% / 47% 42% 58% 53%", background: C.coral, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, border: "3px solid #fff" }}>{initialsOf(king.handle)}</div>
                <span style={{ position: "absolute", top: -22, left: "50%", transform: "translateX(-50%) rotate(-6deg)" }}><CrownMark size={40} /></span>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: C.yellow, marginBottom: 6 }}>👑 Reigning fraud</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 38, color: "#fff", lineHeight: 1 }}>@{king.handle}</div>
                <p style={{ fontFamily: "var(--font-script)", fontWeight: 700, fontSize: 22, color: "#C4A8FF", margin: "6px 0 0" }}>{king.wrong} wrong call{king.wrong === 1 ? "" : "s"} · {accPct(king) === null ? "unproven" : `${accPct(king)}% accurate`} · still talking</p>
              </div>
            </div>
            <a href={`/share/${encodeURIComponent(king.handle)}`} className="lx-press" style={{ position: "relative", zIndex: 2, marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 8, background: C.yellow, color: C.ink, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, padding: "13px 22px", borderRadius: 40 }}>Open the file →</a>
          </div>
        )}

        {/* LEADERBOARD */}
        {ranked.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 30 }}>
            {ranked.map((r, i) => {
              const rankColor = i === 0 ? C.coral : i === 1 ? C.violet : C.muted;
              const barColor = i === 0 ? C.coral : i < 3 ? C.violet : "#C9AFFF";
              const ap = accPct(r);
              return (
                <a key={r.handle} href={`/share/${encodeURIComponent(r.handle)}`} className="hos-row" style={{ display: "flex", alignItems: "center", gap: 18, background: i === 0 ? "#FFE0E6" : "#fff", border: `2px solid ${i === 0 ? "#FFC2CE" : "#ECE2D3"}`, borderRadius: 20, padding: "15px 22px" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: rankColor, width: 42, textAlign: "center", flex: "none" }}>{String(i + 1).padStart(2, "0")}</div>
                  <div style={{ width: 46, height: 46, flex: "none", borderRadius: "42% 58% 53% 47% / 47% 42% 58% 53%", background: AVATAR_BG[i % AVATAR_BG.length], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>{initialsOf(r.handle)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19, color: C.ink }}>@{r.handle}</span>
                      {i === 0 && <IconCrown size={19} />}
                      <span style={{ fontWeight: 700, fontSize: 12, color: "#9A86C0", marginLeft: 4 }}>{ap === null ? "unproven" : `${ap}% accurate`}</span>
                    </div>
                    <div style={{ height: 8, background: "#fff", borderRadius: 10, overflow: "hidden", marginTop: 7, border: i === 0 ? "1px solid #FFC2CE" : "1px solid #ECE2D3" }}>
                      <div style={{ width: `${(r.wrong / maxWrong) * 100}%`, height: "100%", background: barColor, borderRadius: 10 }} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right", whiteSpace: "nowrap", flex: "none" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 23, color: rankColor, lineHeight: 1 }}>{r.wrong}</div>
                    <div style={{ fontWeight: 700, fontSize: 11.5, color: C.muted }}>times wrong</div>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* HEAD TO HEAD */}
        {ranked.length >= 2 && (
          <div style={{ background: "#EDE3FF", border: "2px solid #D6C2FF", borderRadius: 24, padding: "26px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>⚔️</span>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, color: C.ink, margin: 0 }}>Head-to-head</h2>
            </div>
            <p style={{ fontWeight: 600, fontSize: 14, color: "#5B4A78", margin: "0 0 18px" }}>Settle it. Pit two files against each other and let Dendam crown the bigger World Cup fraud.</p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "2px solid #E4D8C8", borderRadius: 16, padding: "10px 16px" }}>
                <div style={{ width: 34, height: 34, borderRadius: "42% 58% 53% 47% / 47% 42% 58% 53%", background: AVATAR_BG[0], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13 }}>{initialsOf(ranked[0].handle)}</div>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, color: C.ink }}>@{ranked[0].handle}</span>
              </div>
              <span style={{ fontFamily: "var(--font-script)", fontWeight: 700, fontSize: 26, color: C.coral }}>vs</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "2px solid #E4D8C8", borderRadius: 16, padding: "10px 16px" }}>
                <div style={{ width: 34, height: 34, borderRadius: "53% 47% 42% 58% / 58% 53% 47% 42%", background: AVATAR_BG[1], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13 }}>{initialsOf(ranked[1].handle)}</div>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, color: C.ink }}>@{ranked[1].handle}</span>
              </div>
              <a href={`/share/vs/${encodeURIComponent(ranked[0].handle)}/${encodeURIComponent(ranked[1].handle)}`} className="lx-press" style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 8, background: C.ink, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, padding: "13px 22px", borderRadius: 40 }}>Who&rsquo;s the bigger fraud? →</a>
            </div>
          </div>
        )}

        {ranked.length === 0 && (
          <p style={{ textAlign: "center", fontWeight: 700, fontSize: 13.5, color: C.muted, margin: "8px 0 0" }}>
            Tip: have each member chat in <a href="/chat" style={{ color: C.violet, fontWeight: 800 }}>Chat</a> first so Dendam has ammo — then tally the board.
          </p>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: "2px solid #EFE6D7" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <p style={{ fontWeight: 800, fontSize: 13, color: C.muted, margin: 0 }}>Memory on Walrus · Sui Mainnet</p>
          <a href="https://github.com/PugarHuda/dendam" target="_blank" rel="noreferrer" style={{ fontWeight: 800, fontSize: 13, color: C.violet, margin: 0 }}>Source · #Walrus</a>
        </div>
      </footer>
    </div>
  );
}
