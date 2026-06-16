"use client";

import { useEffect, useState } from "react";
import { HANDLE_KEY, TopBar } from "@/components/TopBar";

export default function GrupPage() {
  const [handle, setHandle] = useState("anon");
  const [members, setMembers] = useState("");
  const [topic, setTopic] = useState("");
  const [lines, setLines] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(HANDLE_KEY);
    if (saved) setHandle(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem(HANDLE_KEY, handle);
  }, [handle]);

  // Prefill the roster with the current handle + a couple of slots.
  useEffect(() => {
    if (!members && handle && handle !== "anon") setMembers(handle + ", ");
  }, [handle, members]);

  async function panasin() {
    const handles = members
      .split(/[,\n]/)
      .map((s) => s.trim().replace(/^@/, ""))
      .filter(Boolean);
    if (handles.length < 2) {
      setErr("Masukkan minimal 2 handle (pisahkan dengan koma).");
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
        setErr(data.error || "gagal");
        return;
      }
      setTopic(data.topic || "");
      setLines((data.provocations || []).map((p: { line: string }) => p.line));
    } catch {
      setErr("Koneksi gagal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="shell">
      <TopBar handle={handle} setHandle={setHandle} active="grup" />

      <h2 style={{ marginBottom: 4 }}>🔥 Ruang Kompor</h2>
      <p className="hint" style={{ marginTop: 0 }}>
        Masukkan handle anggota grup. Dendam akan mengadu mereka berdasarkan
        prediksi & hinaan yang <b>benar-benar tersimpan</b> di memori
        masing-masing.
      </p>

      <div className="handle" style={{ width: "100%", marginTop: 8 }}>
        <input
          style={{ width: "100%" }}
          value={members}
          onChange={(e) => setMembers(e.target.value)}
          placeholder="mis: hud, andi, budi"
          spellCheck={false}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <button className="send" onClick={panasin} disabled={busy}>
          {busy ? "Dendam lagi nyiapin bensin…" : "🔥 Panasin grup"}
        </button>
      </div>

      {err && (
        <p className="hint" style={{ color: "var(--accent)" }}>
          {err}
        </p>
      )}

      {topic && (
        <p className="hint">
          Bahan kompor: <b>{topic}</b>
        </p>
      )}

      <div className="dossier-grid" style={{ marginTop: 14 }}>
        {lines.map((l, i) => (
          <div key={i} className="grudge">
            <div>{l}</div>
          </div>
        ))}
      </div>

      <p className="hint">
        Tip: biar makin panas, suruh tiap anggota ngobrol dulu di{" "}
        <a href="/">Lawan</a> supaya Dendam punya amunisi tentang mereka.
        Kompor yang dibuat juga disimpan ke memori tiap anggota.
      </p>
    </div>
  );
}
