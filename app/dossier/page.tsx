"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HANDLE_KEY, TopBar, initialHandle } from "@/components/TopBar";
import { ShareButton } from "@/components/ShareButton";
import { IconFolder, IconRecall, IconFlame, IconGavel, IconStadium } from "@/components/Icons";
import { useIdentity } from "@/components/Identity";
import { shortAddress } from "@/lib/authShared";
import { EXPLORER_URL, walrusBlobUrl } from "@/lib/links";

const C = {
  cream: "#FBF6EE",
  ink: "#241046",
  violet: "#7C3AED",
  yellow: "#FFC83D",
  coral: "#FF5470",
  body: "#4A3570",
  muted: "#8A77AD",
  green: "#1F8A5B",
};

// Memory-card badge colors by kind (handoff palette).
const BADGE: Record<string, { bg: string; color: string }> = {
  prediction: { bg: "#241046", color: "#fff" },
  result: { bg: "#7C3AED", color: "#fff" },
  insult: { bg: "#FF5470", color: "#fff" },
  hot_take: { bg: "#FFC83D", color: "#241046" },
  fact: { bg: "#E7E0F3", color: "#5B21B6" },
  favorite: { bg: "#EDE3FF", color: "#5B21B6" },
};

// Small chain-link "on Walrus" inline link.
function OnWalrus({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 12, color: C.violet, whiteSpace: "nowrap" }} title="View the Walrus blob this memory is stored in">
      <svg viewBox="0 0 48 48" style={{ width: 14, height: 14, flex: "none" }} aria-hidden>
        <g fill="none" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round">
          <path d="M20 28 l8 -8" />
          <path d="M16 23 l-4 4 a6 6 0 0 0 8.5 8.5 l4 -4" />
          <path d="M32 25 l4 -4 a6 6 0 0 0 -8.5 -8.5 l-4 4" />
        </g>
      </svg>
      on Walrus ↗
    </a>
  );
}

type Memory = {
  id: string;
  text: string;
  kind: string;
  team?: string;
  wasWrong?: boolean;
  createdAt: string;
  blobId?: string;
};

type MatchResult = {
  id: string;
  date: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  stage?: string;
};

type Verdict = {
  prediction: string;
  status: "correct" | "wrong" | "pending";
  roast: string;
};

const KIND_LABEL: Record<string, string> = {
  prediction: "prediction",
  result: "verdict",
  insult: "insult",
  favorite: "favorite",
  hot_take: "hot take",
  fact: "fact",
};

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "prediction", label: "Predictions" },
  { key: "result", label: "Verdicts" },
  { key: "insult", label: "Insults" },
  { key: "hot_take", label: "Hot takes" },
  { key: "favorite", label: "Teams" },
];

export default function DossierPage() {
  const { address: walletAddr, username } = useIdentity();
  const [handle, setHandle] = useState("anon");
  // Viewing your own wallet File? Show your display name instead of 0x…
  const ownFile = !!walletAddr && handle === walletAddr;
  const displayHandle = ownFile ? username || shortAddress(walletAddr) : handle || "anon";
  const [memories, setMemories] = useState<Memory[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [verdicts, setVerdicts] = useState<Verdict[]>([]);
  const [network, setNetwork] = useState("");
  const [loading, setLoading] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const [filter, setFilter] = useState("all");
  const [err, setErr] = useState("");
  const [askQuery, setAskQuery] = useState("");
  const [askResults, setAskResults] = useState<Memory[] | null>(null);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    setHandle(initialHandle());
  }, []);
  useEffect(() => {
    localStorage.setItem(HANDLE_KEY, handle);
  }, [handle]);

  const load = useCallback(async (h: string) => {
    setLoading(true);
    setErr("");
    try {
      const [mRes, rRes] = await Promise.all([
        fetch(`/api/memories?handle=${encodeURIComponent(h)}`),
        fetch(`/api/results`),
      ]);
      const m = await mRes.json().catch(() => ({}));
      const r = await rRes.json().catch(() => ({}));
      // /api/memories returns 200 with an `error` field when the relayer
      // fails — surface it so an empty file isn't mistaken for "no memory".
      if (!mRes.ok || m?.error) {
        setErr(
          mRes.status === 429
            ? "Slow down a moment — too many requests."
            : "Couldn't reach Walrus memory just now. Try again in a sec.",
        );
      }
      setMemories(m.memories ?? []);
      setNetwork(m.network ?? "");
      setResults(r.results ?? []);
    } catch {
      setErr("Couldn't reach Walrus memory just now. Try again in a sec.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(handle || "anon"), 300);
    return () => clearTimeout(t);
  }, [handle, load]);

  const reconcile = useCallback(async () => {
    setReconciling(true);
    setVerdicts([]);
    setErr("");
    try {
      const res = await fetch(`/api/reconcile`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handle: handle || "anon" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(
          res.status === 429
            ? "Slow down a moment — too many requests."
            : "Dendam couldn't reach the results just now. Try again.",
        );
        return;
      }
      setVerdicts(data.verdicts ?? []);
      await load(handle || "anon"); // refresh stats with new verdict memories
    } catch {
      setErr("Dendam couldn't reach the results just now. Try again.");
    } finally {
      setReconciling(false);
    }
  }, [handle, load]);

  const predictions = memories.filter((m) => m.kind === "prediction");
  const wrong = memories.filter((m) => m.wasWrong).length;
  const insults = memories.filter((m) => m.kind === "insult").length;
  const resolved = memories.filter(
    (m) => m.kind === "result" && m.wasWrong !== undefined,
  );
  const correct = resolved.filter((m) => m.wasWrong === false).length;
  const accuracy =
    resolved.length > 0
      ? Math.round((correct / resolved.length) * 100)
      : null;

  const shown = useMemo(() => {
    const filtered =
      filter === "all" ? memories : memories.filter((m) => m.kind === filter);
    // Timeline order: newest first. Stable sort keeps undated memories in
    // their original order at the end (Walrus doesn't always return a date).
    return [...filtered].sort((a, b) =>
      (b.createdAt || "").localeCompare(a.createdAt || ""),
    );
  }, [memories, filter]);

  function exportFile() {
    const payload = JSON.stringify(
      { handle: handle || "anon", network, source: "https://dendam.vercel.app", count: memories.length, memories },
      null,
      2,
    );
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `dendam-file-${handle || "anon"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function ask() {
    const q = askQuery.trim();
    if (!q) return;
    setAsking(true);
    setAskResults(null);
    setErr("");
    try {
      const res = await fetch("/api/recall", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handle: handle || "anon", query: q }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(res.status === 429 ? "Slow down a moment — too many requests." : "Recall failed — try again.");
        return;
      }
      setAskResults(data.memories ?? []);
    } catch {
      setErr("Recall failed — try again.");
    } finally {
      setAsking(false);
    }
  }

  // Insights computed from the file — order-independent so they're robust even
  // when Walrus doesn't return per-memory timestamps.
  const insights = useMemo(() => {
    const teamCount = new Map<string, number>();
    for (const m of memories) if (m.team) teamCount.set(m.team, (teamCount.get(m.team) ?? 0) + 1);
    const topTeam = [...teamCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    // % of predictions proven wrong. `wrong` counts wasWrong across all memory
    // kinds (incl. verdicts), so clamp to 100 to avoid a nonsensical >100%.
    const bustRate =
      predictions.length > 0
        ? Math.min(100, Math.round((wrong / predictions.length) * 100))
        : null;
    return { topTeam, bustRate };
  }, [memories, predictions.length, wrong]);

  // Grudge of the day: Dendam resurfaces an old busted call/insult unprompted.
  // Rotates once per calendar day so it feels alive without being random.
  const grudgeOfDay = useMemo(() => {
    const pool = memories.filter(
      (m) => m.wasWrong || m.kind === "insult" || m.kind === "prediction",
    );
    if (pool.length === 0) return null;
    const day = Math.floor(Date.now() / 86_400_000);
    return pool[day % pool.length];
  }, [memories]);

  const countFor = (key: string) =>
    key === "all" ? memories.length : memories.filter((m) => m.kind === key).length;

  const latestResult = results[0];

  return (
    <div style={{ minHeight: "100vh", background: C.cream }}>
      <TopBar handle={handle} setHandle={setHandle} active="dossier" />

      {/* HEADER */}
      <header style={{ maxWidth: 1080, margin: "0 auto", padding: "14px 28px 8px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 560 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <IconFolder size={30} />
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 34, letterSpacing: -1, color: C.ink, margin: 0, whiteSpace: "nowrap" }}>The File</h1>
              <span style={{ background: "#EDE3FF", color: C.violet, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, padding: "5px 15px", borderRadius: 30 }}>on @{displayHandle}</span>
              {ownFile && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--green-bg)", border: "1.5px solid var(--green-border)", color: "var(--green)", fontWeight: 800, fontSize: 11.5, padding: "4px 10px", borderRadius: 30 }} title={walletAddr ?? undefined}>🔗 {walletAddr ? shortAddress(walletAddr) : ""}</span>
              )}
            </div>
            <p style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.55, color: C.body, margin: "10px 0 0" }}>
              The exact memory Dendam reads before every reply. Encrypted on Walrus, keyed to a MemWalAccount on Sui — change the handle (top-right) to read anyone&rsquo;s file.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
            {network && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: network === "local" ? "#FFE0E6" : "#E4F7EE", border: `2px solid ${network === "local" ? "#FFC2CE" : "#BCE9D3"}`, color: network === "local" ? "#C63752" : C.green, fontWeight: 800, fontSize: 12.5, padding: "8px 14px", borderRadius: 30 }}>
                <span style={{ width: 9, height: 9, background: network === "local" ? "#C63752" : C.green, borderRadius: "50%" }} /> {network === "mainnet" ? "Walrus Mainnet" : network === "testnet" ? "Walrus Testnet" : "Local (dev)"}
              </div>
            )}
            <ShareButton
              url={`/share/${encodeURIComponent(handle || "anon")}`}
              title={`@${handle || "anon"}'s Dendam file`}
              text={`Dendam has a file on @${handle || "anon"}. 🔥⚽`}
              className="dx-sharebtn"
              label="Share file"
            />
          </div>
        </div>
      </header>

      {err && (
        <p className="hint" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 28px", color: C.coral }} role="alert">
          ⚠️ {err}
        </p>
      )}

      {/* BODY GRID */}
      <main className="mx-grid" style={{ maxWidth: 1080, margin: "0 auto", padding: "18px 28px 48px", display: "grid", gridTemplateColumns: "1fr 318px", gap: 26, alignItems: "start" }}>
        {/* LEFT */}
        <div>
          {/* stats */}
          <div className="mx-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
            {[
              { n: memories.length, l: "total memories", color: C.ink, bg: "#fff", border: "#ECE2D3", lc: C.muted },
              { n: predictions.length, l: "predictions logged", color: C.violet, bg: "#fff", border: "#ECE2D3", lc: C.muted },
              { n: accuracy === null ? "—" : `${accuracy}%`, l: "accuracy", color: C.coral, bg: "#FFE0E6", border: "#FFC2CE", lc: "#C63752" },
              { n: insults, l: "insults at Dendam", color: C.ink, bg: "#fff", border: "#ECE2D3", lc: C.muted },
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, border: `2px solid ${s.border}`, borderRadius: 18, padding: 16 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, color: s.color, lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontWeight: 700, fontSize: 12.5, color: s.lc, marginTop: 5 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* insight strip */}
          {(insights.topTeam || insights.bustRate !== null) && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#EDE3FF", border: "2px solid #D6C2FF", borderRadius: 16, padding: "11px 16px", marginBottom: 20, fontWeight: 700, fontSize: 13.5, color: "#5B21B6" }}>
              <IconRecall size={18} />
              <span>
                {insights.topTeam && <>Pet subject: <strong style={{ color: C.ink }}>{insights.topTeam}</strong>. </>}
                {insights.bustRate !== null && <>{insights.bustRate}% of your logged predictions have already been busted.</>}
              </span>
            </div>
          )}

          {/* grudge of the day */}
          {grudgeOfDay && (
            <div style={{ background: C.ink, borderRadius: 24, padding: "26px 28px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -30, right: -20, width: 120, height: 120, background: C.violet, borderRadius: "42% 58% 53% 47% / 47% 42% 58% 53%", opacity: 0.45 }} aria-hidden />
              <div style={{ position: "relative", zIndex: 2 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: C.yellow, marginBottom: 12 }}>
                  <IconFlame size={18} /> Grudge of the day
                </div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 23, lineHeight: 1.32, color: "#fff", margin: "0 0 10px" }}>&ldquo;{grudgeOfDay.text}&rdquo;</p>
                <p style={{ fontFamily: "var(--font-script)", fontWeight: 700, fontSize: 22, color: "#C4A8FF", margin: 0 }}>Dendam hasn&rsquo;t forgotten this one. 👀 won&rsquo;t either.</p>
              </div>
            </div>
          )}

          {/* ask the file */}
          {memories.length > 0 && (
            <div style={{ background: "#fff", border: `2.5px solid ${C.ink}`, borderRadius: 22, padding: "20px 22px", marginBottom: 26, boxShadow: "0 6px 0 #EDE3FF" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 13 }}>
                <IconRecall size={22} />
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: C.ink, lineHeight: 1 }}>Ask the file</div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: C.muted, marginTop: 3 }}>live semantic recall on Walrus — not a keyword log</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 9 }}>
                <input
                  value={askQuery}
                  onChange={(e) => setAskQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && ask()}
                  placeholder="e.g. what did I say about Brazil?"
                  aria-label="Ask Dendam's memory"
                  className="mx-ask-input"
                  style={{ flex: 1, border: "2px solid #E4D8C8", borderRadius: 30, padding: "11px 16px", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: C.ink, outline: "none", minWidth: 0 }}
                />
                <button onClick={ask} disabled={asking || !askQuery.trim()} className="lx-press" style={{ background: C.violet, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, border: "none", padding: "11px 22px", borderRadius: 30, cursor: "pointer", flex: "none", opacity: asking || !askQuery.trim() ? 0.5 : 1 }}>
                  {asking ? "Recalling…" : "Recall"}
                </button>
              </div>
              {askResults && (
                <div style={{ marginTop: 14, background: "#F5EFFF", border: "1.5px dashed #C9AFFF", borderRadius: 14, padding: "13px 16px" }}>
                  <div style={{ fontWeight: 800, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.violet, marginBottom: 6 }}>
                    {askResults.length === 0 ? "Nothing surfaced" : "Top match in your file"}
                  </div>
                  {askResults.length === 0 ? (
                    <p style={{ fontWeight: 600, fontSize: 14, color: C.body, margin: 0 }}>Nothing relevant surfaced for that. Try other words.</p>
                  ) : (
                    askResults.slice(0, 3).map((m) => (
                      <p key={m.id} style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.5, color: C.ink, margin: "0 0 6px" }}>{m.text}</p>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* memory file header */}
          {memories.length > 0 && (
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, marginBottom: 14 }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, letterSpacing: -0.5, color: C.ink, margin: 0 }}>Memory file</h2>
                <p style={{ fontWeight: 700, fontSize: 12.5, color: C.muted, margin: "3px 0 0" }}>{shown.length} shown · newest first</p>
              </div>
              <button onClick={exportFile} className="mx-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#fff", border: "2px solid #E4D8C8", color: C.ink, fontWeight: 800, fontSize: 13, padding: "8px 14px", borderRadius: 30, cursor: "pointer" }} title="Download this file as JSON">
                <svg viewBox="0 0 48 48" style={{ width: 15, height: 15, flex: "none" }} aria-hidden><g stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none"><line x1="24" y1="8" x2="24" y2="30" /><path d="M15 22 L24 31 L33 22" /><path d="M10 38 H38" /></g></svg>
                Export
              </button>
            </div>
          )}

          {/* filter tabs */}
          {memories.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {FILTERS.map((f) => {
                const c = countFor(f.key);
                if (f.key !== "all" && c === 0) return null;
                const active = filter === f.key;
                return (
                  <button key={f.key} onClick={() => setFilter(f.key)} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: active ? C.violet : "#fff", border: `2px solid ${active ? C.violet : "#E4D8C8"}`, color: active ? "#fff" : C.ink, fontWeight: 800, fontSize: 13, padding: "8px 14px", borderRadius: 30, cursor: "pointer" }}>
                    {f.label} <span style={{ background: active ? "rgba(255,255,255,.22)" : "#EDE3FF", color: active ? "#fff" : "#5B21B6", fontSize: 11, padding: "1px 8px", borderRadius: 20 }}>{c}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* loading / empty / cards */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="skeleton" /><div className="skeleton" /><div className="skeleton" />
            </div>
          )}

          {!loading && memories.length === 0 && (
            <div style={{ background: "#fff", border: "2px dashed #E4D8C8", borderRadius: 18, padding: "40px 24px", textAlign: "center", color: C.muted, lineHeight: 1.6 }}>
              <div style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}><IconFolder size={34} /></div>
              @{handle || "anon"}&rsquo;s file is empty. Dendam has nothing on you yet.
              <br />
              Head to <a href="/chat" style={{ color: C.violet, fontWeight: 800 }}>Chat</a> and start making predictions.
            </div>
          )}

          {!loading && memories.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {shown.map((m) => {
                const b = BADGE[m.kind] ?? BADGE.fact;
                return (
                  <div key={m.id} style={{ background: "#fff", border: "2px solid #ECE2D3", borderRadius: 18, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9, flexWrap: "wrap" }}>
                      <span style={{ background: b.bg, color: b.color, fontWeight: 800, fontSize: 10.5, letterSpacing: 0.8, textTransform: "uppercase", padding: "4px 10px", borderRadius: 20 }}>{KIND_LABEL[m.kind] ?? m.kind}</span>
                      {m.team && <span style={{ border: "1.5px solid #E4D8C8", color: "#5B4A78", fontWeight: 800, fontSize: 11, padding: "3px 9px", borderRadius: 20 }}>{m.team}</span>}
                      {m.wasWrong && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: C.coral, color: "#fff", fontWeight: 800, fontSize: 10.5, letterSpacing: 0.8, padding: "4px 9px", borderRadius: 20 }}>WRONG CALL</span>}
                      {m.createdAt && <span style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, marginLeft: "auto" }}>{m.createdAt.slice(0, 10)}</span>}
                    </div>
                    <p style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.5, color: C.ink, margin: "0 0 11px" }}>{m.text}</p>
                    {m.blobId && <OnWalrus href={walrusBlobUrl(m.blobId)} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="mx-side" style={{ display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: 18 }}>
          {/* hold me to it */}
          <div style={{ background: C.yellow, borderRadius: 22, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
              <IconGavel size={24} />
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19, color: C.ink, margin: 0, whiteSpace: "nowrap" }}>Hold me to it</h3>
            </div>
            <p style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.5, color: "#5A3F08", margin: "0 0 14px" }}>Match my stored predictions against real results and stamp the wrong ones — permanently.</p>
            <button onClick={reconcile} disabled={reconciling || results.length === 0} className="mx-darkbtn" style={{ width: "100%", background: C.ink, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, border: "none", padding: 13, borderRadius: 30, cursor: "pointer", opacity: reconciling || results.length === 0 ? 0.55 : 1 }}>
              {reconciling ? "Dendam is judging…" : verdicts.length > 0 ? "Verdict filed ✓" : "Run reconcile"}
            </button>
            <p style={{ fontWeight: 700, fontSize: 11.5, color: "#7A5A12", margin: "11px 0 0", textAlign: "center" }}>{results.length} result{results.length === 1 ? "" : "s"} recorded · {wrong} wrong call{wrong === 1 ? "" : "s"} so far</p>
          </div>

          {/* scoreboard */}
          {latestResult && (
            <div style={{ background: "#fff", border: "2px solid #ECE2D3", borderRadius: 22, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <IconStadium size={20} />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: C.ink, margin: 0 }}>Scoreboard</h3>
                <span style={{ fontWeight: 700, fontSize: 11, color: C.muted, marginLeft: "auto" }}>real results</span>
              </div>
              <div style={{ background: C.cream, border: "2px solid #F0E6D6", borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: C.ink }}>
                  <span>{latestResult.teamA}</span>
                  <span style={{ background: C.ink, color: "#fff", fontSize: 15, padding: "2px 12px", borderRadius: 8 }}>{latestResult.scoreA} – {latestResult.scoreB}</span>
                  <span>{latestResult.teamB}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, fontWeight: 700, fontSize: 11.5, color: C.muted }}>
                  <span>{latestResult.stage ?? "Match"}</span><span>{latestResult.date}</span>
                </div>
              </div>
              {wrong > 0 && <p style={{ fontWeight: 700, fontSize: 12, lineHeight: 1.5, color: "#C63752", margin: "12px 0 0" }}>↳ Busted {wrong} prediction{wrong === 1 ? "" : "s"} the moment results landed.</p>}
            </div>
          )}

          {/* provenance */}
          <div style={{ background: "#EDE3FF", border: "2px solid #D6C2FF", borderRadius: 22, padding: "18px 20px" }}>
            <p style={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1.55, color: "#5B21B6", margin: "0 0 12px" }}>Everything here is stored encrypted on Walrus Memory and tied to a MemWalAccount object on Sui. This is exactly what Dendam reads before clapping back.</p>
            <a href={EXPLORER_URL} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 12.5, color: C.ink }}>Verify on Sui explorer ↗</a>
          </div>
        </aside>
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
