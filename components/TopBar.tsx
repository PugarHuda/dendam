"use client";

import Link from "next/link";
import { AppIcon } from "@/components/Logo";
import { IconRespond, IconFolder, IconStadium, IconCrown } from "@/components/Icons";

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
  return (
    <div className="dx-topbar">
      <Link href="/" className="dx-brand" style={{ textDecoration: "none" }}>
        <AppIcon size={38} />
        <span className="dx-wordmark">
          Dendam<span style={{ color: "var(--violet)" }}>.</span>
        </span>
      </Link>
      <div className="dx-topbar-right">
        <div className="dx-handle-wrap">
          <div
            className="dx-handle"
            title="Your nickname = your identity. Dendam saves your memory under it, so use the same one to be remembered."
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
