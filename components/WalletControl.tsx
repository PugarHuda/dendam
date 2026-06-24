"use client";

import { useCallback, useState } from "react";
import {
  ConnectButton,
  useCurrentAccount,
  useDisconnectWallet,
  useSignPersonalMessage,
} from "@mysten/dapp-kit";
import { loginMessage, shortAddress } from "@/lib/authShared";
import { useIdentity } from "@/components/Identity";

// Wallet sign-in control (option 1: wallet = identity).
//  - not connected  → ConnectButton (dapp-kit modal)
//  - connected      → "Sign in" (sign a personal message, verified server-side)
//  - signed in      → address pill + "Sign out"
// Reads/writes the shared identity context so the whole app reacts to sign-in.
export function WalletControl() {
  const account = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const { mutate: disconnect } = useDisconnectWallet();
  const { address: addr, setAddress } = useIdentity();

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const signIn = useCallback(async () => {
    if (!account) return;
    setBusy(true);
    setErr("");
    try {
      const issuedAt = new Date().toISOString();
      const message = loginMessage(account.address, issuedAt);
      const { signature } = await signPersonalMessage({
        message: new TextEncoder().encode(message),
      });
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address: account.address, issuedAt, signature }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(
          data?.error === "stale_message"
            ? "Signature expired — try again."
            : "Sign-in failed.",
        );
        return;
      }
      setAddress(data.address);
    } catch {
      setErr("Sign-in cancelled.");
    } finally {
      setBusy(false);
    }
  }, [account, signPersonalMessage, setAddress]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setAddress(null);
    try {
      disconnect();
    } catch {
      /* ignore */
    }
  }, [disconnect, setAddress]);

  if (addr) {
    return (
      <div className="dx-wallet">
        <span className="dx-wallet-pill" title={addr}>
          <span className="dx-wallet-dot" /> {shortAddress(addr)}
        </span>
        <button className="dx-wallet-out" onClick={signOut}>
          Sign out
        </button>
      </div>
    );
  }
  if (account) {
    return (
      <div className="dx-wallet">
        <button className="dx-wallet-signin" onClick={signIn} disabled={busy}>
          {busy ? "Signing…" : "Sign in"}
        </button>
        {err && <span className="dx-wallet-err">{err}</span>}
      </div>
    );
  }
  return (
    <span className="dx-connect">
      <ConnectButton connectText="Connect wallet" />
    </span>
  );
}
