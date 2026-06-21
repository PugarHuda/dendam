"use client";

import { useEffect, useState } from "react";
import { HANDLE_KEY, TopBar, initialHandle } from "@/components/TopBar";

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

const RANK_CLASS = ["gold", "silver", "bronze"];
const RANK_MEDAL = ["🥇", "🥈", "🥉"];

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
      const res = await fetch("/api/kompor", {
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

  const maxWrong = Math.max(1, ...rows.map((r) => r.wrong));

  return (
    <div className="shell">
      <TopBar handle={handle} setHandle={setHandle} active="grup" />

      <h2 className="page-title">🔥 The Hot Seat <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 15 }}>— group mode</span></h2>
      <p className="hint" style={{ marginTop: 0 }}>
        Enter a few nicknames (comma-separated) that have already chatted with
        Dendam. Then <b>🔥 Stir it up</b> makes Dendam provoke them using what
        each one <b>actually said</b>, and <b>🏆 Hall of Shame</b> ranks who&rsquo;s
        been most wrong.
      </p>
      <p className="hint" style={{ marginTop: 6 }}>
        Want a prediction contest per match instead?{" "}
        <a href="/room">🏟️ Match Rooms →</a> — drop a call, winner takes the pool.
      </p>

      <div className="handle" style={{ width: "100%", marginTop: 10 }}>
        <span style={{ color: "var(--muted)" }}>@</span>
        <input
          style={{ width: "100%" }}
          value={members}
          onChange={(e) => setMembers(e.target.value)}
          placeholder="e.g. hud, andi, budi"
          spellCheck={false}
          aria-label="Group handles"
        />
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="btn" onClick={stirItUp} disabled={busy}>
          {busy ? "Dendam is pouring fuel…" : "🔥 Stir it up"}
        </button>
        <button className="btn ghost" onClick={loadBoard} disabled={loadingBoard}>
          {loadingBoard ? "Tallying…" : "🏆 Hall of Shame"}
        </button>
      </div>

      {err && (
        <p className="hint" style={{ color: "var(--accent-2)" }}>
          {err}
        </p>
      )}

      {topic && (
        <p className="hint">
          Today&rsquo;s fuel: <b style={{ color: "var(--ink)" }}>{topic}</b>
        </p>
      )}

      <div className="dossier-grid" style={{ marginTop: 14 }}>
        {lines.map((l, i) => (
          <div key={i} className="msg-row assistant" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="avatar dendam" aria-hidden>
              🔥
            </div>
            <div className="msg assistant" style={{ maxWidth: "100%" }}>
              <div className="who">Dendam</div>
              <span>{l}</span>
            </div>
          </div>
        ))}
      </div>

      {rows.length > 0 && (
        <>
          <div className="section-head">
            <h3>🏆 Hall of Shame</h3>
            <span className="count">most wrong calls first</span>
          </div>
          <div className="dossier-grid">
            {rows.map((r, i) => (
              <div
                key={r.handle}
                className={`grudge ${r.wrong > 0 ? "wrong" : ""}`}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className={`rank ${RANK_CLASS[i] ?? ""}`}>
                      {RANK_MEDAL[i] ?? i + 1}
                    </span>
                    <b>@{r.handle}</b>
                  </div>
                  <span style={{ color: "var(--muted)", fontSize: 13 }}>
                    {r.accuracy === null
                      ? "no verdicts yet"
                      : `${Math.round(r.accuracy * 100)}% accuracy`}
                  </span>
                </div>
                <div className="acc-bar" title={`${r.wrong} wrong calls`}>
                  <span style={{ width: `${(r.wrong / maxWrong) * 100}%` }} />
                </div>
                <div className="meta">
                  <span className="tag wrong">{r.wrong} wrong</span>
                  <span className="tag ok">{r.correct} correct</span>
                  <span className="tag">{r.predictions} predictions</span>
                  <span className="tag kind">{r.insults} insults</span>
                </div>
              </div>
            ))}
          </div>
          {rows.length >= 2 && (
            <p className="hint">
              <a
                href={`/share/vs/${encodeURIComponent(rows[0].handle)}/${encodeURIComponent(rows[1].handle)}`}
              >
                🆚 Share the head-to-head
              </a>{" "}
              — @{rows[0].handle} vs @{rows[1].handle} as a card.
            </p>
          )}
        </>
      )}

      <p className="hint">
        Tip: have each member chat in <a href="/chat">💬 Chat</a> first so Dendam
        has ammo on them. The instigation it creates is also saved to each
        member&rsquo;s memory.
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
