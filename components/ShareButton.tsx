"use client";

import { useState } from "react";

// Copy-link / native-share button. Uses the Web Share API on mobile, falls
// back to clipboard on desktop. `url` may be relative (resolved to absolute
// against the current origin at click time).
export function ShareButton({
  url,
  title,
  text,
  className = "btn ghost",
  label = "🔗 Copy / share link",
}: {
  url: string;
  title: string;
  text?: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    const full =
      typeof window !== "undefined"
        ? new URL(url, window.location.origin).href
        : url;

    // Prefer the native share sheet where available (mobile).
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url: full });
        return;
      } catch {
        // user cancelled or it failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // last resort: do nothing visible (clipboard blocked)
    }
  }

  return (
    <button className={className} onClick={onClick} type="button">
      {copied ? "✓ Link copied!" : label}
    </button>
  );
}
