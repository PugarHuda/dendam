"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HANDLE_KEY, TopBar, initialHandle } from "@/components/TopBar";
import { ShareButton } from "@/components/ShareButton";
import { EXPLORER_URL, walrusBlobUrl } from "@/lib/links";

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

function NetworkBadge({ network }: { network: string }) {
  if (!network) return null;
  const label =
    network === "mainnet"
      ? "Walrus Mainnet"
      : network === "testnet"
        ? "Walrus Testnet"
        : "Local (dev)";
  return (
    <span className={`badge ${network === "local" ? "local" : "live"}`}>
      {label}
    </span>
  );
}

export default function DossierPage() {
  const [handle, setHandle] = useState("anon");
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

  return (
    <div className="shell">
      <TopBar handle={handle} setHandle={setHandle} active="dossier" />

      <h2 className="page-title" style={{ marginBottom: 2 }}>
        📂 The File{" "}
        <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 15 }}>
          — what Dendam remembers about you
        </span>
      </h2>
      <p className="hint" style={{ margin: "0 0 14px" }}>
        This is the memory Dendam reads before every reply. Type a different
        nickname (top-right) to view anyone&rsquo;s file.
      </p>

      <div className="badge-row">
        <NetworkBadge network={network} />
        <span className="badge">file on @{handle || "anon"}</span>
        <a
          className="badge"
          href={`/share/${encodeURIComponent(handle || "anon")}`}
          style={{ cursor: "pointer" }}
          title="Open the public, shareable card of this file"
        >
          📣 Share
        </a>
        <ShareButton
          url={`/share/${encodeURIComponent(handle || "anon")}`}
          title={`@${handle || "anon"}'s Dendam file`}
          text={`Dendam has a file on @${handle || "anon"}. 🔥⚽`}
          className="badge"
          label="🔗 Copy link"
        />
      </div>

      {err && (
        <p className="hint" style={{ color: "var(--accent-2)" }} role="alert">
          ⚠️ {err}
        </p>
      )}

      <div className="stat-row">
        <div className="stat">
          <div className="n">{memories.length}</div>
          <div className="l">total memories</div>
        </div>
        <div className="stat">
          <div className="n">{predictions.length}</div>
          <div className="l">predictions logged</div>
        </div>
        <div className="stat">
          <div className="n" style={{ color: "var(--accent-2)" }}>
            {accuracy === null ? "—" : `${accuracy}%`}
          </div>
          <div className="l">accuracy</div>
        </div>
        <div className="stat">
          <div className="n" style={{ color: "var(--accent)" }}>
            {insults}
          </div>
          <div className="l">insults at Dendam</div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button
          className="btn"
          onClick={reconcile}
          disabled={reconciling || results.length === 0}
          title={
            results.length === 0
              ? "No match results recorded yet"
              : "Match your predictions against the real results"
          }
        >
          {reconciling ? "Dendam is judging…" : "⚖️ Hold me to it"}
        </button>
        <span className="hint" style={{ margin: 0 }}>
          {results.length} match result{results.length === 1 ? "" : "s"} recorded ·{" "}
          {wrong} wrong call{wrong === 1 ? "" : "s"} so far
        </span>
      </div>

      {(insights.topTeam || insights.bustRate !== null) && (
        <p className="hint" style={{ marginTop: 12 }}>
          {insights.topTeam && (
            <>Pet subject: <b style={{ color: "var(--ink)" }}>{insights.topTeam}</b>. </>
          )}
          {insights.bustRate !== null && (
            <>
              <b style={{ color: "var(--accent-2)" }}>{insights.bustRate}%</b> of your
              logged predictions have been busted.
            </>
          )}
        </p>
      )}

      {grudgeOfDay && (
        <div className="grudge wrong" style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: "var(--accent-2)", marginBottom: 6 }}>
            🔥 Grudge of the day
          </div>
          <div>&ldquo;{grudgeOfDay.text}&rdquo;</div>
          <div className="meta">
            <span className="tag kind">{KIND_LABEL[grudgeOfDay.kind] ?? grudgeOfDay.kind}</span>
            {grudgeOfDay.wasWrong && <span className="tag wrong">‼️ still wrong</span>}
            <span style={{ color: "var(--muted)" }}>Dendam hasn&rsquo;t forgotten this one.</span>
          </div>
        </div>
      )}

      {verdicts.length > 0 && (
        <div className="dossier-grid" style={{ marginTop: 14 }}>
          {verdicts.map((v, i) => (
            <div key={i} className={`grudge ${v.status === "wrong" ? "wrong" : ""}`}>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>
                &ldquo;{v.prediction}&rdquo;
              </div>
              <div style={{ marginTop: 6 }}>{v.roast}</div>
              <div className="meta">
                <span className={`tag ${v.status === "wrong" ? "wrong" : "ok"}`}>
                  {v.status === "wrong" ? "‼️ WRONG" : "✓ nailed it"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="dossier-grid" style={{ marginTop: 24 }}>
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      )}

      {!loading && memories.length === 0 && (
        <div className="empty">
          <div className="big">🗂️</div>
          @{handle || "anon"}&rsquo;s file is empty. Dendam has nothing on you
          yet.
          <br />
          Head to <a href="/chat">💬 Chat</a> and start making predictions.
        </div>
      )}

      {!loading && memories.length > 0 && (
        <>
          <div className="section-head">
            <h3>Ask the file</h3>
            <span className="count">live semantic recall on Walrus</span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div className="handle" style={{ flex: 1, minWidth: 220 }}>
              <span style={{ color: "var(--muted)" }}>🔎</span>
              <input
                style={{ width: "100%" }}
                value={askQuery}
                onChange={(e) => setAskQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ask()}
                placeholder="e.g. what did I say about Brazil?"
                aria-label="Ask Dendam's memory"
              />
            </div>
            <button className="btn sm" onClick={ask} disabled={asking || !askQuery.trim()}>
              {asking ? "Recalling…" : "Recall"}
            </button>
          </div>
          {askResults && (
            <div className="dossier-grid" style={{ marginTop: 12 }}>
              {askResults.length === 0 ? (
                <p className="hint" style={{ margin: 0 }}>
                  Nothing relevant surfaced for that. Try other words.
                </p>
              ) : (
                askResults.map((m) => (
                  <div key={m.id} className={`grudge ${m.wasWrong ? "wrong" : ""}`}>
                    <div>{m.text}</div>
                    <div className="meta">
                      <span className="tag kind">{KIND_LABEL[m.kind] ?? m.kind}</span>
                      {m.team && <span className="tag">{m.team}</span>}
                      {m.wasWrong && <span className="tag wrong">‼️ wrong</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="section-head">
            <h3>Memory file</h3>
            <span className="count">{shown.length} shown · newest first</span>
            <button
              className="badge"
              onClick={exportFile}
              style={{ cursor: "pointer", marginLeft: "auto" }}
              title="Download this file as JSON (your data, your memory)"
            >
              ⬇ Export
            </button>
          </div>

          <div className="chips" style={{ justifyContent: "flex-start" }}>
            {FILTERS.map((f) => {
              const c = countFor(f.key);
              if (f.key !== "all" && c === 0) return null;
              return (
                <button
                  key={f.key}
                  className={`filter-chip ${filter === f.key ? "on" : ""}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label} {c > 0 && <span style={{ opacity: 0.6 }}>· {c}</span>}
                </button>
              );
            })}
          </div>

          <div className="dossier-grid">
            {shown.map((m) => (
              <div key={m.id} className={`grudge ${m.wasWrong ? "wrong" : ""}`}>
                <div>{m.text}</div>
                <div className="meta">
                  <span className="tag kind">{KIND_LABEL[m.kind] ?? m.kind}</span>
                  {m.team && <span className="tag">{m.team}</span>}
                  {m.wasWrong && <span className="tag wrong">‼️ wrong</span>}
                  {m.createdAt && <span>{m.createdAt.slice(0, 10)}</span>}
                  {m.blobId && (
                    <a
                      href={walrusBlobUrl(m.blobId)}
                      target="_blank"
                      rel="noreferrer"
                      title="View the Walrus blob this memory is stored in"
                    >
                      ⛓ on Walrus ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {results.length > 0 && (
        <>
          <div className="section-head">
            <h3>Scoreboard</h3>
            <span className="count">real results</span>
          </div>
          <div className="dossier-grid">
            {results.map((r) => (
              <div key={r.id} className="grudge" style={{ borderLeftColor: "var(--green)" }}>
                <div>
                  <b>{r.teamA}</b> {r.scoreA} – {r.scoreB} <b>{r.teamB}</b>
                </div>
                <div className="meta">
                  {r.stage && <span className="tag">{r.stage}</span>}
                  <span>{r.date}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="hint">
        Everything above is stored encrypted on Walrus Memory and tied to a{" "}
        <a href={EXPLORER_URL} target="_blank" rel="noreferrer">
          <code>MemWalAccount</code> object on Sui ↗
        </a>
        . This is exactly what Dendam reads before clapping back at you.
      </p>

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
