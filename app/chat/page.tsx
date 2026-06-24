"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { HANDLE_KEY, TopBar, initialHandle } from "@/components/TopBar";
import { WelcomeModal } from "@/components/WelcomeModal";
import { GrudgeBall } from "@/components/Logo";
import { IconFolder } from "@/components/Icons";
import { useIdentity } from "@/components/Identity";
import { WalletControl } from "@/components/WalletControl";

const SUGGESTIONS = [
  "Argentina wins it all, Brazil won't escape the group 😎",
  "Mbappé outscores Messi this tournament, easy.",
  "VAR is ruining football — scrap it.",
  "Honestly? You're just a bot who knows nothing about football.",
];

const C = {
  cream: "#FBF6EE",
  ink: "#241046",
  violet: "#7C3AED",
  yellow: "#FFC83D",
  muted: "#9A86C0",
  green: "#1F8A5B",
  body: "#4A3570",
};

// Small green "saved on Walrus" check used on bot messages.
function SavedOnWalrus() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 11.5, color: C.green, margin: "7px 0 0 2px", whiteSpace: "nowrap" }}>
      <svg viewBox="0 0 48 48" style={{ width: 14, height: 14, flex: "none" }} aria-hidden>
        <circle cx="24" cy="24" r="18" fill="none" stroke={C.green} strokeWidth="3.4" />
        <path d="M16 24.5 L22 30 L33 18" fill="none" stroke={C.green} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      saved on Walrus
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

  const { address: walletAddr, loading: authLoading, allowGuest, refresh: refreshAuth } = useIdentity();
  const signedIn = !!walletAddr;
  const canChat = signedIn || allowGuest; // guests chat by nickname when allowed

  useEffect(() => {
    setHandle(initialHandle());
  }, []);
  useEffect(() => {
    localStorage.setItem(HANDLE_KEY, handle);
  }, [handle]);

  const { messages, setMessages, input, handleInputChange, handleSubmit, append, status } =
    useChat({
    api: "/api/chat",
    body: { handle },
    onResponse(res) {
      // Session expired / not signed in → re-check identity so the connect
      // gate reappears instead of leaving the user stuck.
      if (res.status === 401) {
        refreshAuth();
        return;
      }
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

  // Conversations are kept PER HANDLE in sessionStorage (key dendam:chat:<h>),
  // so the thread belongs to whoever you're talking as. Switching the nickname
  // swaps to that handle's own thread — your old conversation isn't lost, it's
  // restored when you switch back (so no destructive "are you sure?" needed).
  const activeHandle = useRef<string>("");
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Swap threads when the (debounced) handle changes — debounced so editing a
  // nickname character-by-character doesn't thrash the visible thread.
  useEffect(() => {
    const h = (handle || "anon").trim().toLowerCase() || "anon";
    const key = (x: string) => `dendam:chat:${x}`;
    // First resolve: adopt this handle's thread immediately.
    if (activeHandle.current === "") {
      activeHandle.current = h;
      try {
        const s = sessionStorage.getItem(key(h));
        const arr = s ? JSON.parse(s) : [];
        if (Array.isArray(arr) && arr.length) setMessages(arr);
      } catch {
        /* ignore */
      }
      return;
    }
    if (activeHandle.current === h) return;
    const t = setTimeout(() => {
      const prev = activeHandle.current;
      try {
        sessionStorage.setItem(key(prev), JSON.stringify(messagesRef.current));
      } catch {
        /* ignore */
      }
      let next: typeof messages = [];
      try {
        const s = sessionStorage.getItem(key(h));
        if (s) next = JSON.parse(s);
      } catch {
        /* ignore */
      }
      activeHandle.current = h;
      setMessages(next);
    }, 450);
    return () => clearTimeout(t);
  }, [handle, setMessages]);

  // Persist the live thread under whichever handle it currently belongs to.
  useEffect(() => {
    if (!activeHandle.current) return;
    try {
      sessionStorage.setItem(`dendam:chat:${activeHandle.current}`, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages]);

  useEffect(() => {
    // Page-level scroll (sticky composer sits below the thread).
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  // Auto-grow the composer textarea.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
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

  const showIntro = messages.length === 0;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.cream }}>
      <WelcomeModal />
      <TopBar handle={handle} setHandle={setHandle} active="chat" />

      <main className="cx-main" ref={scroller} style={{ flex: 1, width: "100%", maxWidth: 720, margin: "0 auto", padding: "8px 24px 0", display: "flex", flexDirection: "column" }}>
        {!canChat && !authLoading && (
          <div style={{ display: "grid", placeItems: "center", textAlign: "center", padding: "36px 18px 28px" }}>
            <div style={{ maxWidth: 440, background: "#fff", border: `2.5px solid ${C.ink}`, borderRadius: 26, padding: "34px 30px", boxShadow: "0 8px 0 #EDE3FF" }}>
              <div style={{ marginBottom: 14 }}><GrudgeBall size={56} /></div>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, letterSpacing: -0.5, color: C.ink, margin: "0 0 8px" }}>
                Connect your wallet to start the beef
              </h2>
              <p style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.55, color: C.body, margin: "0 0 20px" }}>
                Your File belongs to your wallet — so no one can read it or put words in your mouth by guessing a nickname. Connect &amp; sign (no gas, no transaction) to begin.
              </p>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <WalletControl />
              </div>
            </div>
          </div>
        )}

        {canChat && (
        <>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 10 }}>
          {showIntro && (
            <BotBubble>
              Drop your World Cup 2026 predictions. I remember every one — and throw it back the moment you&rsquo;re wrong.
            </BotBubble>
          )}

          {messages.map((m) => {
            const isUser = m.role === "user";
            const streamingHere = !isUser && status === "streaming" && m.id === lastId;
            const text = msgText(m);
            if (isUser) {
              return (
                <div key={m.id} style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ maxWidth: "78%", background: C.violet, color: "#fff", borderRadius: "18px 4px 18px 18px", padding: "13px 17px", fontWeight: 600, fontSize: 15, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{text}</div>
                </div>
              );
            }
            return (
              <BotBubble key={m.id}>
                {recalledMap[m.id] > 0 && (
                  <div style={{ marginBottom: 7 }}>
                    <button
                      onClick={() => setOpenRecall((o) => ({ ...o, [m.id]: !o[m.id] }))}
                      title="Show the memories Dendam used for this reply"
                      style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#EDE3FF", border: "1.5px solid #D6C2FF", color: "#5B21B6", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 11.5, padding: "5px 11px", borderRadius: 20, whiteSpace: "nowrap", cursor: recalledItems[m.id]?.length ? "pointer" : "default" }}
                    >
                      <IconFolder size={14} /> pulled {recalledMap[m.id]} {recalledMap[m.id] === 1 ? "memory" : "memories"} from your file
                      {recalledItems[m.id]?.length ? (openRecall[m.id] ? " ▲" : " ▼") : ""}
                    </button>
                    {openRecall[m.id] && recalledItems[m.id]?.length > 0 && (
                      <div className="recall-list">
                        {recalledItems[m.id].map((it, j) => (
                          <div key={j} className="recall-item">
                            <span className="tag kind">{it.k}</span>
                            <span>{it.t}</span>
                            {it.w && <span className="tag wrong">‼️</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <span>{text}</span>
                {streamingHere && <span className="caret" />}
                {!streamingHere && text.trim() && (
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <SavedOnWalrus />
                    <a
                      className="roast-share"
                      style={{ margin: "7px 0 0" }}
                      href={`/roast?by=${encodeURIComponent(handle || "anon")}&text=${encodeURIComponent(text.slice(0, 280))}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      🔥 Share this roast
                    </a>
                  </div>
                )}
              </BotBubble>
            );
          })}

          {status === "submitted" && (
            <BotBubble>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span className="typing" aria-hidden>
                  <i />
                  <i />
                  <i />
                </span>
                <span style={{ color: "var(--muted)", fontSize: 13 }}>digging up your file…</span>
              </span>
            </BotBubble>
          )}
        </div>

        {/* quick prompts */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9, margin: "22px 0 16px" }}>
          <p style={{ width: "100%", fontWeight: 800, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: C.muted, margin: "0 0 2px" }}>Try a take →</p>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => append({ role: "user", content: s })}
              disabled={busy}
              className="cx-prompt"
              style={{ background: "#fff", border: "2px solid #E4D8C8", borderRadius: 30, padding: "9px 15px", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13.5, color: "#3B2168", cursor: "pointer" }}
            >
              {s}
            </button>
          ))}
        </div>
        </>
        )}
      </main>

      {/* sticky input */}
      <div style={{ position: "sticky", bottom: 0, background: "linear-gradient(#FBF6EE00,#FBF6EE 22%)", padding: "16px 24px 14px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, alignItems: "center", background: "#fff", border: `2.5px solid ${canChat ? C.ink : "#E4D8C8"}`, borderRadius: 40, padding: "7px 7px 7px 20px", boxShadow: "0 6px 0 #EDE3FF", opacity: canChat ? 1 : 0.7 }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              rows={1}
              disabled={!canChat}
              placeholder={canChat ? "Type your prediction / opinion / trash talk… (any language)" : "Connect your wallet to chat…"}
              aria-label="Message Dendam"
              className="cx-input"
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", resize: "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, color: C.ink, minWidth: 0, maxHeight: 120, lineHeight: 1.5, paddingTop: 6, cursor: canChat ? "text" : "not-allowed" }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  (e.currentTarget.form as HTMLFormElement).requestSubmit();
                }
              }}
            />
            <button
              className="lx-press"
              type="submit"
              disabled={!canChat || busy || !input.trim()}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, background: C.violet, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, border: "none", padding: "12px 22px", borderRadius: 34, cursor: "pointer", flex: "none", opacity: !canChat || busy || !input.trim() ? 0.5 : 1 }}
            >
              Send <span>→</span>
            </button>
          </form>
          <p style={{ textAlign: "center", fontWeight: 700, fontSize: 12.5, color: C.muted, margin: "11px 0 6px" }}>
            {canChat ? (
              <>Tip: come back over several days — see what sticks in <a href="/dossier" style={{ color: C.violet, fontWeight: 800 }}>The File</a>. Real memory on Walrus{network === "local" ? " (dev)" : ""}, not a chat log.{!signedIn && allowGuest ? " Connect a wallet to truly own it." : ""}</>
            ) : (
              <>🔒 Your File is wallet-owned — connect above to chat. Browsing <a href="/dossier" style={{ color: C.violet, fontWeight: 800 }}>The File</a> stays open to everyone.</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// Bot message row: grudge-ball avatar + "Dendam" label + white tail bubble.
function BotBubble({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
      <span style={{ flex: "none", marginTop: 2 }}>
        <GrudgeBall size={36} />
      </span>
      <div style={{ maxWidth: "80%" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "#7C3AED", margin: "0 0 5px 2px" }}>Dendam</div>
        <div style={{ background: "#fff", border: "2px solid #ECE2D3", borderRadius: "4px 18px 18px 18px", padding: "13px 17px", fontWeight: 600, fontSize: 15, lineHeight: 1.5, color: "#241046", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
