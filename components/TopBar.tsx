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
      <div className="brand">
        <h1>
          Dendam<span className="dot">.</span>
        </h1>
        <small>the World Cup 2026 rival that never forgets</small>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="handle" title="Your identity — your memory is stored per-handle on Walrus">
          <span style={{ color: "var(--muted)" }}>@</span>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="your handle"
            spellCheck={false}
          />
        </div>
        <nav className="nav">
          <Link href="/" className={active === "chat" ? "active" : ""}>
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
