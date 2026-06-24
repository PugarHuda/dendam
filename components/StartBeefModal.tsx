"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIdentity } from "@/components/Identity";
import { WalletControl } from "@/components/WalletControl";

// Choice shown when you click "Start the beef": play instantly as a guest, or
// connect a Sui wallet for true ownership. Spells out the difference + the
// benefit of each so the trade-off is obvious.
export function StartBeefModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { address } = useIdentity();

  // If they connect + sign in from inside the modal, take them straight to chat.
  useEffect(() => {
    if (open && address) router.push("/chat");
  }, [open, address, router]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card sb-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Start the beef">
        <div className="modal-emblem" aria-hidden>🔥</div>
        <h3>How do you want to start the beef?</h3>
        <p>
          Either way, your predictions are stored on <b>Walrus</b> and thrown
          back when you&rsquo;re wrong. The only difference is <b>who owns the File</b>.
        </p>

        <div className="sb-grid">
          {/* Guest */}
          <div className="sb-opt">
            <div className="sb-opt-head">
              <span className="sb-opt-ic sb-ic-guest" aria-hidden>⚡</span>
              <div>
                <h4>Play as guest</h4>
                <span className="sb-tag">fastest</span>
              </div>
            </div>
            <ul className="sb-list">
              <li className="ok">Start in one click — just a nickname</li>
              <li className="ok">Memory saved on Walrus right away</li>
              <li className="ok">Upgrade to a wallet any time</li>
              <li className="no">Anyone using the same nickname shares the File</li>
            </ul>
            <button className="btn sb-btn" type="button" onClick={() => router.push("/chat")}>
              Chat as guest →
            </button>
          </div>

          {/* Wallet */}
          <div className="sb-opt sb-opt-wallet">
            <div className="sb-opt-head">
              <span className="sb-opt-ic sb-ic-wallet" aria-hidden>🔗</span>
              <div>
                <h4>Connect Sui wallet</h4>
                <span className="sb-tag sb-tag-violet">truly yours</span>
              </div>
            </div>
            <ul className="sb-list">
              <li className="ok">Your File is owned by your wallet</li>
              <li className="ok">No one can read or fake it via a nickname</li>
              <li className="ok">True on-chain ownership, verifiable</li>
              <li className="no">Needs a Sui wallet + a gasless signature</li>
            </ul>
            <div className="sb-wallet-slot"><WalletControl /></div>
          </div>
        </div>

        <button className="sb-skip" type="button" onClick={onClose}>Maybe later</button>
      </div>
    </div>
  );
}
