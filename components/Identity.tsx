"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

// App-wide identity = the signed-in wallet address (or null for a guest).
// Backed by the httpOnly session cookie via /api/auth/me; WalletControl updates
// it after sign-in / sign-out. Any client component can read it with
// useIdentity() to gate features behind a connected wallet.
type Identity = {
  address: string | null;
  loading: boolean;
  setAddress: (a: string | null) => void;
  refresh: () => void;
};

const IdentityCtx = createContext<Identity>({
  address: null,
  loading: true,
  setAddress: () => {},
  refresh: () => {},
});

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setAddress(d?.address ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <IdentityCtx.Provider value={{ address, loading, setAddress, refresh }}>
      {children}
    </IdentityCtx.Provider>
  );
}

export function useIdentity() {
  return useContext(IdentityCtx);
}
