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
  prediction: "prediksi",
  result: "vonis",
  insult: "hinaan",
  favorite: "favorit",
  hot_take: "hot take",
  fact: "fakta",
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
        <span className="badge">berkas @{handle || "anon"}</span>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="n">{memories.length}</div>
          <div className="l">total memori</div>
        </div>
        <div className="stat">
          <div className="n">{predictions.length}</div>
          <div className="l">prediksi tercatat</div>
        </div>
        <div className="stat">
          <div className="n" style={{ color: "var(--accent-2)" }}>
            {wrong}
          </div>
          <div className="l">prediksi meleset</div>
        </div>
        <div className="stat">
          <div className="n" style={{ color: "var(--accent)" }}>
            {insults}
          </div>
          <div className="l">hinaan ke Dendam</div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
        <button
          className="send"
          onClick={reconcile}
          disabled={reconciling || results.length === 0}
          title={
            results.length === 0
              ? "Belum ada hasil pertandingan yang tercatat"
              : "Cocokkan prediksimu dengan hasil nyata"
          }
        >
          {reconciling ? "Dendam lagi mikir…" : "⚖️ Tagih prediksiku"}
        </button>
        <span className="hint" style={{ margin: 0 }}>
          {results.length} hasil pertandingan tercatat
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
                  {v.status === "wrong" ? "‼️ MELESET" : "✓ tepat"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && <p className="hint">Membuka berkas dendam…</p>}
      {!loading && memories.length === 0 && (
        <div className="empty">
          Berkas @{handle || "anon"} masih kosong. Dendam belum punya bahan.
          <br />
          Pergi ke <a href="/">Lawan</a> dan mulai bikin prediksi.
        </div>
      )}

      <h3 style={{ marginTop: 28, marginBottom: 0 }}>Berkas memori</h3>
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
          <h3 style={{ marginTop: 28, marginBottom: 0 }}>Papan skor (hasil nyata)</h3>
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
        Semua catatan di atas disimpan terenkripsi di Walrus Memory dan terikat
        ke objek <code>MemWalAccount</code> di Sui. Inilah yang Dendam baca
        sebelum membalasmu.
      </p>
    </div>
  );
}
