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
        <small>rival Piala Dunia 2026 yang nggak pernah lupa</small>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="handle" title="Identitasmu — memorimu disimpan per-handle di Walrus">
          <span style={{ color: "var(--muted)" }}>@</span>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="handle-mu"
            spellCheck={false}
          />
        </div>
        <nav className="nav">
          <Link href="/" className={active === "chat" ? "active" : ""}>
            Lawan
          </Link>
          <Link
            href="/dossier"
            className={active === "dossier" ? "active" : ""}
          >
            Buku Dendam
          </Link>
          <Link href="/grup" className={active === "grup" ? "active" : ""}>
            Ruang Kompor
          </Link>
        </nav>
      </div>
    </div>
  );
}

// Shared localStorage-backed handle hook.
export const HANDLE_KEY = "dendam:handle";
