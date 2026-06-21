"use client";

import Link from "next/link";

export function TopBar({
  handle,
  setHandle,
  active,
}: {
  handle: string;
  setHandle: (h: string) => void;
  active: "chat" | "dossier" | "grup";
}) {
  return (
    <div className="topbar">
      <Link href="/" className="brand" style={{ textDecoration: "none" }}>
        <span className="brand-emblem" aria-hidden>
          🔥
        </span>
        <div className="brand-text">
          <h1 style={{ color: "var(--ink)" }}>
            Dendam<span className="dot">.</span>
          </h1>
          <small>the World Cup 2026 rival that never forgets</small>
        </div>
      </Link>
      <div className="topbar-right">
        <div className="handle" title="Your nickname = your identity. Dendam saves your memory under it, so use the same one to be remembered.">
          <span style={{ color: "var(--muted)" }}>@</span>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="your nickname"
            spellCheck={false}
            maxLength={40}
            aria-label="Your nickname — your memory is saved under it"
          />
        </div>
        <nav className="nav">
          <Link href="/chat" className={active === "chat" ? "active" : ""} title="Chat with Dendam">
            💬 Face off
          </Link>
          <Link
            href="/dossier"
            className={active === "dossier" ? "active" : ""}
            title="Everything Dendam remembers about you"
          >
            📂 The File
          </Link>
          <Link href="/grup" className={active === "grup" ? "active" : ""} title="Pit your group against each other">
            🔥 Hot Seat
          </Link>
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
