import Link from "next/link";

// The "grudge-ball" mark — a football drawn as a smug, glaring face.
export function GrudgeBall({
  size = 40,
  onDark = false,
}: {
  size?: number;
  onDark?: boolean;
}) {
  const line = onDark ? "#FBF6EE" : "#241046";
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ flex: "none", display: "block" }} aria-hidden>
      <circle cx="50" cy="51" r="45" fill="#7C3AED" stroke={line} strokeWidth="4.5" />
      <path d="M50 18 L62 27 L57 41 L43 41 L38 27 Z" fill={line} />
      <path
        d="M14 49 L24 44 L30 53 M86 49 L76 44 L70 53 M34 90 L38 80 M66 90 L62 80"
        stroke={line}
        strokeWidth="3.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M22 47 Q33 40 43 49" stroke="#FFC83D" strokeWidth="6.5" fill="none" strokeLinecap="round" />
      <path d="M78 47 Q67 40 57 49" stroke="#FFC83D" strokeWidth="6.5" fill="none" strokeLinecap="round" />
      <ellipse cx="37" cy="60" rx="7.5" ry="8.5" fill="#fff" />
      <ellipse cx="63" cy="60" rx="7.5" ry="8.5" fill="#fff" />
      <circle cx="39" cy="62.5" r="3.6" fill="#241046" />
      <circle cx="65" cy="62.5" r="3.6" fill="#241046" />
      <path d="M38 81 Q49 78 61 71" stroke="#241046" strokeWidth="3.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// App-icon variant: the mark inside an ink squircle.
export function AppIcon({ size = 38 }: { size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        flex: "none",
        background: "#241046",
        borderRadius: size * 0.3,
        display: "grid",
        placeItems: "center",
      }}
      aria-hidden
    >
      <GrudgeBall size={size * 0.74} onDark />
    </span>
  );
}

// Brand lockup: mark + "Dendam" wordmark (+ optional tagline). Links home.
export function Brand({
  tagline = "the World Cup 2026 rival that never forgets",
  href = "/",
}: {
  tagline?: string | null;
  href?: string;
}) {
  return (
    <Link href={href} className="dx-brand" style={{ textDecoration: "none" }}>
      <AppIcon size={40} />
      <span className="dx-brand-text">
        <span className="dx-wordmark">Dendam<span style={{ color: "var(--violet)" }}>.</span></span>
        {tagline && <span className="dx-tagline">{tagline}</span>}
      </span>
    </Link>
  );
}
