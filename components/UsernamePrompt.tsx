"use client";

import { useEffect, useState } from "react";
import { useIdentity } from "@/components/Identity";
import { shortAddress } from "@/lib/authShared";

// Shown once, right after a wallet's first sign-in, nudging the user to pick a
// display username (so their roasts aren't signed 0x1234…). Dismissed or saved,
// it won't nag again for that address.
export function UsernamePrompt() {
  const { address, setUsername } = useIdentity();
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState("");

  useEffect(() => {
    if (!address) {
      setOpen(false);
      return;
    }
    try {
      const named = localStorage.getItem(`dendam:name:${address}`);
      const prompted = localStorage.getItem(`dendam:name-prompted:${address}`);
      if (!named && !prompted) {
        setVal("");
        setOpen(true);
      }
    } catch {
      /* ignore */
    }
  }, [address]);

  function done(save: boolean) {
    if (address) {
      try {
        localStorage.setItem(`dendam:name-prompted:${address}`, "1");
      } catch {
        /* ignore */
      }
    }
    if (save && val.trim()) setUsername(val.trim());
    setOpen(false);
  }

  if (!open || !address) return null;

  return (
    <div className="modal-overlay" onClick={() => done(false)}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Pick a username"
      >
        <div className="modal-emblem" aria-hidden>🎭</div>
        <h3>You&rsquo;re in. Pick a username.</h3>
        <p>
          So your roasts aren&rsquo;t signed <b>{shortAddress(address)}</b>. Your File stays
          owned by your wallet either way — this is just a display name, and you can change it
          anytime from the top bar.
        </p>
        <div className="dx-handle" style={{ margin: "4px 0 18px" }}>
          <span className="dx-handle-at">@</span>
          <input
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && done(true)}
            placeholder="your name"
            spellCheck={false}
            maxLength={40}
            aria-label="Choose a username"
          />
        </div>
        <div className="modal-actions">
          <button className="btn" type="button" onClick={() => done(true)} disabled={!val.trim()}>
            Save username
          </button>
          <button className="btn ghost" type="button" onClick={() => done(false)}>
            Keep {shortAddress(address)}
          </button>
        </div>
      </div>
    </div>
  );
}
