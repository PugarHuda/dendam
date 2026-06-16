"use client";

import { useEffect, useState } from "react";
import { HANDLE_KEY, TopBar } from "@/components/TopBar";

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
    const saved = localStorage.getItem(HANDLE_KEY);
    if (saved) setHandle(saved);
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
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handles }),
      });
      const data = await res.json();
      setRows(data.rows ?? []);
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
      const res = await fetch("/api/kompor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handles }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "failed");
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

  return (
    <div className="shell">
      <TopBar handle={handle} setHandle={setHandle} active="grup" />

      <h2 style={{ marginBottom: 4 }}>🔥 The Hot Seat</h2>
      <p className="hint" style={{ marginTop: 0 }}>
        Add your group&rsquo;s handles. Dendam pits them against each other
        using the predictions &amp; insults <b>actually stored</b> in each
        member&rsquo;s memory.
      </p>

      <div className="handle" style={{ width: "100%", marginTop: 8 }}>
        <input
          style={{ width: "100%" }}
          value={members}
          onChange={(e) => setMembers(e.target.value)}
          placeholder="e.g. hud, andi, budi"
          spellCheck={false}
        />
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="send" onClick={stirItUp} disabled={busy}>
          {busy ? "Dendam is pouring fuel…" : "🔥 Stir it up"}
        </button>
        <button
          className="send"
          style={{ background: "var(--panel-2)" }}
          onClick={loadBoard}
          disabled={loadingBoard}
        >
          {loadingBoard ? "Tallying…" : "🏆 Hall of Shame"}
        </button>
      </div>

      {err && (
        <p className="hint" style={{ color: "var(--accent)" }}>
          {err}
        </p>
      )}

      {topic && (
        <p className="hint">
          Today&rsquo;s fuel: <b>{topic}</b>
        </p>
      )}

      <div className="dossier-grid" style={{ marginTop: 14 }}>
        {lines.map((l, i) => (
          <div key={i} className="grudge">
            <div>{l}</div>
          </div>
        ))}
      </div>

      {rows.length > 0 && (
        <>
          <h3 style={{ marginTop: 28, marginBottom: 8 }}>
            🏆 Hall of Shame{" "}
            <span className="hint" style={{ fontWeight: 400 }}>
              (most wrong calls first)
            </span>
          </h3>
          <div className="dossier-grid">
            {rows.map((r, i) => (
              <div
                key={r.handle}
                className={`grudge ${r.wrong > 0 ? "wrong" : ""}`}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <b>
                    #{i + 1} @{r.handle}
                  </b>
                  <span style={{ color: "var(--muted)" }}>
                    {r.accuracy === null
                      ? "no verdicts yet"
                      : `${Math.round(r.accuracy * 100)}% accuracy`}
                  </span>
                </div>
                <div className="meta">
                  <span className="tag wrong">{r.wrong} wrong</span>
                  <span className="tag">{r.correct} correct</span>
                  <span className="tag">{r.predictions} predictions</span>
                  <span className="tag kind">{r.insults} insults</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="hint">
        Tip: have each member chat in <a href="/">Face off</a> first so Dendam
        has ammo on them. The instigation it creates is also saved to each
        member&rsquo;s memory.
      </p>
    </div>
  );
}
