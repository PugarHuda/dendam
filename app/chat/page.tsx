"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { HANDLE_KEY, TopBar, initialHandle } from "@/components/TopBar";

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
  type RecallItem = { t: string; k: string; w: boolean };
  const [recalledMap, setRecalledMap] = useState<Record<string, number>>({});
  const [recalledItems, setRecalledItems] = useState<Record<string, RecallItem[]>>({});
  const [openRecall, setOpenRecall] = useState<Record<string, boolean>>({});
  const pendingRecalled = useRef<number | null>(null);
  const pendingItems = useRef<RecallItem[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setHandle(initialHandle());
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
      // Capture how many memories grounded this reply; attach it to the
      // assistant message once it finishes (below) so the recall is visible.
      const r = res.headers.get("x-dendam-recalled");
      pendingRecalled.current = r == null ? null : parseInt(r, 10);
      const items = res.headers.get("x-dendam-recalled-items");
      try {
        pendingItems.current = items ? JSON.parse(decodeURIComponent(items)) : [];
      } catch {
        pendingItems.current = [];
      }
    },
    onFinish(message) {
      if (pendingRecalled.current != null) {
        const n = pendingRecalled.current;
        const its = pendingItems.current;
        setRecalledMap((m) => ({ ...m, [message.id]: n }));
        if (its.length) setRecalledItems((m) => ({ ...m, [message.id]: its }));
      }
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
            <p className="hint" style={{ marginTop: 22 }}>
              New here? <b>1.</b> Make a call &nbsp;·&nbsp; <b>2.</b> Dendam saves it
              to Walrus Memory &nbsp;·&nbsp; <b>3.</b> Come back later — it remembers,
              and roasts you when you&rsquo;re wrong.
            </p>
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
                {!isUser && recalledMap[m.id] > 0 && (
                  <>
                    <button
                      className="recall-chip"
                      onClick={() => setOpenRecall((o) => ({ ...o, [m.id]: !o[m.id] }))}
                      title="Show the memories Dendam used for this reply"
                    >
                      📂 pulled {recalledMap[m.id]}{" "}
                      {recalledMap[m.id] === 1 ? "memory" : "memories"} from your file
                      {recalledItems[m.id]?.length ? (openRecall[m.id] ? " ▲" : " ▼") : ""}
                    </button>
                    {openRecall[m.id] && recalledItems[m.id]?.length > 0 && (
                      <div className="recall-list">
                        {recalledItems[m.id].map((it, j) => (
                          <div key={j} className="recall-item">
                            <span className={`tag kind`}>{it.k}</span>
                            <span>{it.t}</span>
                            {it.w && <span className="tag wrong">‼️</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                <div className="who">{isUser ? "You" : "Dendam"}</div>
                <span>{msgText(m)}</span>
                {streamingHere && <span className="caret" />}
                {!isUser && !streamingHere && msgText(m).trim() && (
                  <a
                    className="roast-share"
                    href={`/roast?by=${encodeURIComponent(handle || "anon")}&text=${encodeURIComponent(
                      msgText(m).slice(0, 280),
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    🔥 Share this roast
                  </a>
                )}
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
