"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { HANDLE_KEY, TopBar } from "@/components/TopBar";

const SUGGESTIONS = [
  "Argentina wins it all, Brazil won't escape the group 😎",
  "Mbappé outscores Messi this tournament, easy.",
  "VAR is ruining football — scrap it.",
  "Honestly? You're just a bot who knows nothing about football.",
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

export default function ChatPage() {
  const [handle, setHandle] = useState("anon");
  const [network, setNetwork] = useState<string>("");
  const scroller = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(HANDLE_KEY);
    if (saved) setHandle(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem(HANDLE_KEY, handle);
  }, [handle]);

  const { messages, input, handleInputChange, handleSubmit, append, status } =
    useChat({
    api: "/api/chat",
    body: { handle },
    onResponse(res) {
      const n = res.headers.get("x-dendam-network");
      if (n) setNetwork(n);
    },
  });

  useEffect(() => {
    scroller.current?.scrollTo({ top: 1e9, behavior: "smooth" });
  }, [messages, status]);

  // Auto-grow the composer textarea.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }, [input]);

  const busy = status === "submitted" || status === "streaming";
  const lastId = messages.length ? messages[messages.length - 1].id : null;

  function msgText(m: (typeof messages)[number]): string {
    return (
      m.parts
        ?.map((p) => (p.type === "text" ? p.text : ""))
        .join("") ??
      (m as { content?: string }).content ??
      ""
    );
  }

  return (
    <div className="shell">
      <TopBar handle={handle} setHandle={setHandle} active="chat" />

      <div className="badge-row">
        <NetworkBadge network={network} />
        <span className="badge">memory for @{handle || "anon"}</span>
      </div>

      <div className="chat" ref={scroller}>
        {messages.length === 0 && (
          <div className="empty">
            <div className="big">🔥</div>
            Drop your World Cup 2026 predictions. Dendam remembers every one —
            and throws it back the moment you&rsquo;re wrong.
            <div className="chips">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="chip"
                  onClick={() => append({ role: "user", content: s })}
                  disabled={busy}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => {
          const isUser = m.role === "user";
          const streamingHere =
            !isUser && status === "streaming" && m.id === lastId;
          return (
            <div key={m.id} className={`msg-row ${m.role}`}>
              <div
                className={`avatar ${isUser ? "you" : "dendam"}`}
                aria-hidden
              >
                {isUser ? "🧑" : "🔥"}
              </div>
              <div className={`msg ${m.role}`}>
                <div className="who">{isUser ? "You" : "Dendam"}</div>
                <span>{msgText(m)}</span>
                {streamingHere && <span className="caret" />}
              </div>
            </div>
          );
        })}

        {status === "submitted" && (
          <div className="msg-row assistant">
            <div className="avatar dendam" aria-hidden>
              🔥
            </div>
            <div className="msg assistant">
              <div className="who">Dendam</div>
              <span className="typing" aria-label="digging up your old takes">
                <i />
                <i />
                <i />
              </span>
            </div>
          </div>
        )}
      </div>

      <form className="composer" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          placeholder="Type your prediction / opinion / trash talk… (any language)"
          aria-label="Message Dendam"
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
        <a href="/dossier">The File</a> — real memory stored on Walrus, not a
        chat log.
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
