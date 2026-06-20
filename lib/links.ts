// Public, shareable links used across the UI. The MemWalAccount id is a
// public on-chain object — safe to ship to the client. This is the proof
// that Dendam's memory really lives on Walrus Mainnet, so we link to it
// from the share page and dossier.
export const MEMWAL_ACCOUNT =
  "0xe2f6e4a535e0c4179098e6701b9026798b0e17c4622aa0585a14a80a64ca168e";

export const EXPLORER_URL = `https://suiscan.xyz/mainnet/object/${MEMWAL_ACCOUNT}`;

export const REPO_URL = "https://github.com/PugarHuda/dendam";

export const SITE = "https://dendam.vercel.app";

// Build a pre-filled X/Twitter compose link for a handle's public file.
export function tweetIntent(shareUrl: string, handle: string): string {
  const text = `Dendam has a file on @${handle} 🔥⚽ It remembers every World Cup 2026 take — then roasts you the moment you're wrong.`;
  return tweetUrl(text, shareUrl);
}

// Compose link for a head-to-head rivalry card.
export function tweetIntentVs(shareUrl: string, a: string, b: string): string {
  const text = `@${a} vs @${b}: who's the bigger World Cup 2026 fraud? Dendam keeps the receipts. 🔥⚽`;
  return tweetUrl(text, shareUrl);
}

function tweetUrl(text: string, url: string): string {
  const params = new URLSearchParams({ text, url, hashtags: "Walrus" });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}
