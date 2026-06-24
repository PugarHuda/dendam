"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AppIcon } from "@/components/Logo";
import { IconRespond, IconFolder, IconStadium, IconCrown } from "@/components/Icons";
import { WalletControl } from "@/components/WalletControl";
import { useIdentity } from "@/components/Identity";
import { shortAddress } from "@/lib/authShared";

type Tab = "chat" | "dossier" | "room" | "group";

const TABS: { key: Tab; href: string; label: string; title: string; Icon: (p: { size?: number }) => React.ReactElement }[] = [
  { key: "chat", href: "/chat", label: "Chat", title: "Chat with Dendam (face off)", Icon: IconRespond },
  { key: "dossier", href: "/dossier", label: "Memory", title: "Everything Dendam remembers about you (The File)", Icon: IconFolder },
  { key: "room", href: "/room", label: "Rooms", title: "Match rooms — chat & predict per game", Icon: IconStadium },
  { key: "group", href: "/group", label: "Shame", title: "Hall of Shame — the group leaderboard", Icon: IconCrown },
];

export function TopBar({
  handle,
  setHandle,
  active,
}: {
  handle: string;
  setHandle: (h: string) => void;
  active: Tab;
}) {
  // When a wallet is signed in, identity = the wallet address (the File points
  // at the wallet's namespace and the nickname input is locked). On sign-out we
  // restore the last guest nickname.
  const { address: walletAddr, username, setUsername } = useIdentity();
  const guestHandle = useRef(handle);
  useEffect(() => {
    if (!walletAddr) guestHandle.current = handle;
  }, [handle, walletAddr]);
  useEffect(() => {
    if (walletAddr) setHandle(walletAddr);
    else setHandle(guestHandle.current || "anon");
    // Only react to wallet sign-in/out, not to nickname keystrokes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddr]);

  return (
    <div className="dx-topbar">
      <Link href="/" className="dx-brand" style={{ textDecoration: "none" }}>
        <AppIcon size={38} />
        <span className="dx-wordmark">
          Dendam<span style={{ color: "var(--violet)" }}>.</span>
        </span>
      </Link>
      <div className="dx-topbar-right">
        {walletAddr ? (
          <div className="dx-handle-wrap">
            <div className="dx-handle dx-handle-edit" title={`Edit your display name — your File stays owned by ${walletAddr}`}>
              <span className="dx-handle-at">@</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your name"
                spellCheck={false}
                maxLength={40}
                aria-label="Your display name (your File stays tied to your wallet)"
              />
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden style={{ flex: "none", opacity: 0.55 }}>
                <path d="M4 20h4L18.5 9.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4Z" stroke="var(--violet)" strokeWidth="2" strokeLinejoin="round" />
                <path d="M13.5 6.5l4 4" stroke="var(--violet)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="dx-handle-hint">✏️ rename anytime · 🔗 {shortAddress(walletAddr)}</span>
          </div>
        ) : (
          <div className="dx-handle-wrap">
            <div
              className="dx-handle"
              title="Your nickname = your identity. Dendam saves your memory under it, so use the same one to be remembered. Connect a wallet to lock it to you."
            >
              <span className="dx-handle-at">@</span>
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="your nickname"
                spellCheck={false}
                maxLength={40}
                aria-label="Your nickname — your memory is saved under it"
              />
            </div>
            <span className="dx-handle-hint">new nickname = new File</span>
          </div>
        )}
        <WalletControl />
        <nav className="dx-tabs">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              className={`dx-tab${active === t.key ? " active" : ""}`}
              title={t.title}
            >
              <t.Icon size={18} />
              <span>{t.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

// Shared localStorage-backed handle hook.
export const HANDLE_KEY = "dendam:handle";

// Resolve the handle to start with: a `?handle=` URL param wins (handy for
// sharing a link straight to someone's File / a demo handle), then the
// last-used handle from localStorage, then the "anon" default.
export function initialHandle(): string {
  if (typeof window === "undefined") return "anon";
  const fromUrl = new URLSearchParams(window.location.search).get("handle");
  const h = (fromUrl ?? localStorage.getItem(HANDLE_KEY) ?? "")
    .trim()
    .replace(/^@/, "");
  return h || "anon";
}
