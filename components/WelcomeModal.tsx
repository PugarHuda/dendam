"use client";

import { useEffect, useState } from "react";

const KEY = "dendam:intro-seen";

// One-time welcome shown on the first visit to the chat, so a newcomer
// immediately understands the loop and what the nickname is for. Suppressed
// when the user arrives with an explicit ?handle= (they already made a choice,
// e.g. clicked "Try the demo").
export function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const arrivedWithHandle = new URLSearchParams(window.location.search).has("handle");
      if (!localStorage.getItem(KEY) && !arrivedWithHandle) setOpen(true);
      else localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  function close() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={close}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to Dendam"
      >
        <div className="modal-emblem" aria-hidden>🔥</div>
        <h3>Meet Dendam — the rival that never forgets.</h3>
        <p>
          Throw it your World Cup 2026 predictions and hot takes. It stores them
          on Walrus, then throws them back the moment you&rsquo;re wrong.
        </p>
        <ol className="modal-steps">
          <li><b>1</b> Make a call in the chat below</li>
          <li><b>2</b> Dendam saves it under your <b>nickname</b> (top-right box)</li>
          <li><b>3</b> Come back any time — it remembers and roasts your misses</li>
        </ol>
        <div className="modal-actions">
          <a className="btn" href="/chat?handle=demo">🔥 See it work (demo)</a>
          <button className="btn ghost" type="button" onClick={close}>
            Start fresh
          </button>
        </div>
      </div>
    </div>
  );
}
