"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { shortAddress } from "@/lib/authShared";

// App-wide identity = the signed-in wallet address (or null for a guest).
// Backed by the httpOnly session cookie via /api/auth/me; WalletControl updates
// it after sign-in / sign-out. Any client component can read it with
// useIdentity() to gate features behind a connected wallet.
//
// `username` is a DISPLAY name only — editable, stored per wallet address in
// localStorage. Ownership / namespace always stays the verified address, so
// renaming yourself never changes (or risks) which File you control.
type Identity = {
  address: string | null;
  loading: boolean;
  username: string;
  allowGuest: boolean;
  setAddress: (a: string | null) => void;
  setUsername: (name: string) => void;
  refresh: () => void;
};

const nameKey = (addr: string) => `dendam:name:${addr}`;

const IdentityCtx = createContext<Identity>({
  address: null,
  loading: true,
  username: "",
  allowGuest: false,
  setAddress: () => {},
  setUsername: () => {},
  refresh: () => {},
});

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsernameState] = useState("");
  const [allowGuest, setAllowGuest] = useState(false);

  const refresh = useCallback(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setAddress(d?.address ?? null);
        setAllowGuest(!!d?.allowGuest);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Load the saved display name when the wallet changes (default: short addr).
  useEffect(() => {
    if (!address) {
      setUsernameState("");
      return;
    }
    try {
      const saved = localStorage.getItem(nameKey(address));
      setUsernameState(saved && saved.trim() ? saved : shortAddress(address));
    } catch {
      setUsernameState(shortAddress(address));
    }
  }, [address]);

  const setUsername = useCallback(
    (name: string) => {
      const trimmed = name.slice(0, 40);
      setUsernameState(trimmed);
      if (address) {
        try {
          localStorage.setItem(nameKey(address), trimmed);
        } catch {
          /* ignore */
        }
      }
    },
    [address],
  );

  return (
    <IdentityCtx.Provider
      value={{ address, loading, username, allowGuest, setAddress, setUsername, refresh }}
    >
      {children}
    </IdentityCtx.Provider>
  );
}

export function useIdentity() {
  return useContext(IdentityCtx);
}
