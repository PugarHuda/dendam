"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider, createNetworkConfig } from "@mysten/dapp-kit";
import { IdentityProvider } from "@/components/Identity";
import { UsernamePrompt } from "@/components/UsernamePrompt";

// Sui dApp-kit providers. Mainnet only (that's where Dendam's memory lives).
const { networkConfig } = createNetworkConfig({
  mainnet: { url: "https://fullnode.mainnet.sui.io:443", network: "mainnet" },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider autoConnect>
          <IdentityProvider>
            {children}
            <UsernamePrompt />
          </IdentityProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
