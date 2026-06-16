"use client";

import { useCallback, useEffect, useState } from "react";
import { HANDLE_KEY, TopBar } from "@/components/TopBar";

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

export default function DossierPage() {
  const [handle, setHandle] = useState("anon");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [verdicts, setVerdicts] = useState<Verdict[]>([]);
  const [backend, setBackend] = useState("");
  const [loading, setLoading] = useState(false);
  const [reconciling, setReconciling] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(HANDLE_KEY);
    if (saved) setHandle(saved);
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
      setBackend(m.backend ?? "");
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

  return (
    <div className="shell">
      <TopBar handle={handle} setHandle={setHandle} active="dossier" />

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {backend && (
          <span className={`badge ${backend === "memwal" ? "live" : "local"}`}>
            {backend === "memwal" ? "● Walrus Mainnet" : "● Local (dev)"}
          </span>
        )}
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
            {wrong}
          </div>
          <div className="l">wrong calls</div>
        </div>
        <div className="stat">
          <div className="n" style={{ color: "var(--accent)" }}>
            {insults}
          </div>
          <div className="l">insults at Dendam</div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
        <button
          className="send"
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
          {results.length} match results recorded
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
                <span className={`tag ${v.status === "wrong" ? "wrong" : "kind"}`}>
                  {v.status === "wrong" ? "‼️ WRONG" : "✓ nailed it"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && <p className="hint">Opening the grudge file…</p>}
      {!loading && memories.length === 0 && (
        <div className="empty">
          @{handle || "anon"}&rsquo;s file is empty. Dendam has nothing on you
          yet.
          <br />
          Head to <a href="/">Face off</a> and start making predictions.
        </div>
      )}

      <h3 style={{ marginTop: 28, marginBottom: 0 }}>Memory file</h3>
      <div className="dossier-grid">
        {memories.map((m) => (
          <div key={m.id} className={`grudge ${m.wasWrong ? "wrong" : ""}`}>
            <div>{m.text}</div>
            <div className="meta">
              <span className="tag kind">{KIND_LABEL[m.kind] ?? m.kind}</span>
              {m.team && <span className="tag">{m.team}</span>}
              {m.wasWrong && <span className="tag wrong">‼️ meleset</span>}
              {m.createdAt && <span>{m.createdAt.slice(0, 10)}</span>}
            </div>
          </div>
        ))}
      </div>

      {results.length > 0 && (
        <>
          <h3 style={{ marginTop: 28, marginBottom: 0 }}>Scoreboard (real results)</h3>
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
    </div>
  );
}
