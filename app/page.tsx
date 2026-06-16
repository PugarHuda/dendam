"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { HANDLE_KEY, TopBar } from "@/components/TopBar";

export default function ChatPage() {
  const [handle, setHandle] = useState("anon");
  const [backend, setBackend] = useState<string>("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(HANDLE_KEY);
    if (saved) setHandle(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem(HANDLE_KEY, handle);
  }, [handle]);

  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: "/api/chat",
    body: { handle },
    onResponse(res) {
      const b = res.headers.get("x-dendam-backend");
      if (b) setBackend(b);
    },
  });

  useEffect(() => {
    scroller.current?.scrollTo({ top: 1e9, behavior: "smooth" });
  }, [messages]);

  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="shell">
      <TopBar handle={handle} setHandle={setHandle} active="chat" />

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {backend && (
          <span className={`badge ${backend === "memwal" ? "live" : "local"}`}>
            {backend === "memwal" ? "● Walrus Mainnet" : "● Local (dev)"}
          </span>
        )}
        <span className="badge">memori per @{handle || "anon"}</span>
      </div>

      <div className="chat" ref={scroller}>
        {messages.length === 0 && (
          <div className="empty">
            Lempar prediksimu soal Piala Dunia 2026. Dendam akan mengingatnya —
            dan menagihmu kalau meleset.
            <br />
            <span style={{ fontSize: 13 }}>
              Coba: &ldquo;Argentina pasti juara, Brasil mah lewat.&rdquo;
            </span>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`msg ${m.role}`}>
            <div className="who">{m.role === "user" ? "Kamu" : "Dendam"}</div>
            {m.parts?.map((p, i) =>
              p.type === "text" ? <span key={i}>{p.text}</span> : null,
            ) ?? <span>{(m as { content?: string }).content}</span>}
          </div>
        ))}
        {busy && (
          <div className="msg assistant">
            <div className="who">Dendam</div>
            <span style={{ color: "var(--muted)" }}>lagi nyari catatan lamamu…</span>
          </div>
        )}
      </div>

      <form className="composer" onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Tulis prediksi / opini / trash talk-mu…"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              (e.currentTarget.form as HTMLFormElement).requestSubmit();
            }
          }}
        />
        <button className="send" type="submit" disabled={busy || !input.trim()}>
          Kirim
        </button>
      </form>
      <p className="hint">
        Tip: ngobrol beberapa hari berturut-turut. Lihat hasilnya di{" "}
        <a href="/dossier">Buku Dendam</a> — itu memori asli yang tersimpan di
        Walrus.
      </p>
    </div>
  );
}
