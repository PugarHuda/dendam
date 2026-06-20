"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HANDLE_KEY, TopBar, initialHandle } from "@/components/TopBar";

type Memory = {
  id: string;
  text: string;
  kind: string;
  team?: string;
  wasWrong?: boolean;
  createdAt: string;
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

  useEffect(() => {
    setHandle(initialHandle());
  }, []);
  useEffect(() => {
    localStorage.setItem(HANDLE_KEY, handle);
  }, [handle]);

  const load = useCallback(async (h: string) => {
    setLoading(true);
    try {
      const [mRes, rRes] = await Promise.all([
        fetch(`/api/memories?handle=${encodeURIComponent(h)}`),
        fetch(`/api/results`),
      ]);
      const m = await mRes.json();
      const r = await rRes.json();
      setMemories(m.memories ?? []);
      setNetwork(m.network ?? "");
      setResults(r.results ?? []);
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
    try {
      const res = await fetch(`/api/reconcile`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handle: handle || "anon" }),
      });
      const data = await res.json();
      setVerdicts(data.verdicts ?? []);
      await load(handle || "anon"); // refresh stats with new verdict memories
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

  const shown = useMemo(
    () => (filter === "all" ? memories : memories.filter((m) => m.kind === filter)),
    [memories, filter],
  );

  const countFor = (key: string) =>
    key === "all" ? memories.length : memories.filter((m) => m.kind === key).length;

  return (
    <div className="shell">
      <TopBar handle={handle} setHandle={setHandle} active="dossier" />

      <div className="badge-row">
        <NetworkBadge network={network} />
        <span className="badge">file on @{handle || "anon"}</span>
      </div>

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
          Head to <a href="/chat">Face off</a> and start making predictions.
        </div>
      )}

      {!loading && memories.length > 0 && (
        <>
          <div className="section-head">
            <h3>Memory file</h3>
            <span className="count">{shown.length} shown</span>
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
        <code>MemWalAccount</code> object on Sui. This is exactly what Dendam
        reads before clapping back at you.
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
