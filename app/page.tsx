"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { HANDLE_KEY, TopBar } from "@/components/TopBar";

export default function ChatPage() {
  const [handle, setHandle] = useState("anon");
  const [network, setNetwork] = useState<string>("");
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
      const n = res.headers.get("x-dendam-network");
      if (n) setNetwork(n);
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
        {network && (
          <span className={`badge ${network === "local" ? "local" : "live"}`}>
            {network === "mainnet"
              ? "● Walrus Mainnet"
              : network === "testnet"
                ? "● Walrus Testnet"
                : "● Local (dev)"}
          </span>
        )}
        <span className="badge">memory for @{handle || "anon"}</span>
      </div>

      <div className="chat" ref={scroller}>
        {messages.length === 0 && (
          <div className="empty">
            Drop your World Cup 2026 predictions. Dendam will remember them —
            and call you out when you&rsquo;re wrong.
            <br />
            <span style={{ fontSize: 13 }}>
              Try: &ldquo;Argentina wins it all, Brazil won&rsquo;t make it
              out of the group.&rdquo;
            </span>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`msg ${m.role}`}>
            <div className="who">{m.role === "user" ? "You" : "Dendam"}</div>
            {m.parts?.map((p, i) =>
              p.type === "text" ? <span key={i}>{p.text}</span> : null,
            ) ?? <span>{(m as { content?: string }).content}</span>}
          </div>
        ))}
        {busy && (
          <div className="msg assistant">
            <div className="who">Dendam</div>
            <span style={{ color: "var(--muted)" }}>digging up your old takes…</span>
          </div>
        )}
      </div>

      <form className="composer" onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Type your prediction / opinion / trash talk… (any language)"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              (e.currentTarget.form as HTMLFormElement).requestSubmit();
            }
          }}
        />
        <button className="send" type="submit" disabled={busy || !input.trim()}>
          Send
        </button>
      </form>
      <p className="hint">
        Tip: come back over several days. See what sticks in{" "}
        <a href="/dossier">The File</a> — that&rsquo;s real memory stored on
        Walrus.
      </p>
    </div>
  );
}
