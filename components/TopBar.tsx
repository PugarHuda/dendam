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
        <div className="handle" title="Your identity — your memory is stored per-handle on Walrus">
          <span style={{ color: "var(--muted)" }}>@</span>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="your handle"
            spellCheck={false}
            maxLength={40}
            aria-label="Your handle"
          />
        </div>
        <nav className="nav">
          <Link href="/chat" className={active === "chat" ? "active" : ""}>
            Face off
          </Link>
          <Link
            href="/dossier"
            className={active === "dossier" ? "active" : ""}
          >
            The File
          </Link>
          <Link href="/grup" className={active === "grup" ? "active" : ""}>
            Hot Seat
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
