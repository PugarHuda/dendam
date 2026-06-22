// Custom Dendam icon set — playful, chunky line icons (no emoji).
// All draw at a 24-unit viewBox; `size` scales, color via stroke/fill props.

type IconProps = { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  style: { display: "block", flex: "none" as const },
  "aria-hidden": true,
});

// Recall — magnifier with a yellow lens, hunting through the past.
export function IconRecall({ size = 26 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="10.5" cy="10.5" r="6.5" fill="#FFC83D" stroke="#241046" strokeWidth="2" />
      <circle cx="10.5" cy="10.5" r="3" fill="#fff" stroke="#241046" strokeWidth="1.4" />
      <path d="M15.5 15.5 L20 20" stroke="#241046" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

// Respond — a speech bubble with three dots, mid clap-back.
export function IconRespond({ size = 26 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path
        d="M4 6.5 C4 5 5 4 6.5 4 H17.5 C19 4 20 5 20 6.5 V13.5 C20 15 19 16 17.5 16 H10 L6 19.5 V16 H6.5 C5 16 4 15 4 13.5 Z"
        fill="#7C3AED" stroke="#241046" strokeWidth="2" strokeLinejoin="round"
      />
      <circle cx="9" cy="10" r="1.3" fill="#fff" />
      <circle cx="12" cy="10" r="1.3" fill="#fff" />
      <circle cx="15" cy="10" r="1.3" fill="#fff" />
    </svg>
  );
}

// Remember — two chain links, one violet, locked together forever.
export function IconRemember({ size = 26 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="3.5" y="8.5" width="11" height="7" rx="3.5" fill="#7C3AED" stroke="#241046" strokeWidth="2" />
      <rect x="9.5" y="8.5" width="11" height="7" rx="3.5" fill="#FFEFC2" stroke="#241046" strokeWidth="2" />
    </svg>
  );
}

// Hot Seat — a flame, yellow outer, coral inner.
export function IconFlame({ size = 26 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path
        d="M12 2.5 C14.5 6 17 7.5 17 12.5 C17 16.5 14.8 19.5 12 19.5 C9.2 19.5 7 16.5 7 12.5 C7 9.5 8.5 8 9 6.5 C10 8 10.5 8.5 11 9 C10.5 6 11 4 12 2.5 Z"
        fill="#FFC83D" stroke="#241046" strokeWidth="2" strokeLinejoin="round"
      />
      <path d="M12 11 C13.2 12.5 13.5 13.5 13.5 14.8 C13.5 16.3 12.8 17.3 12 17.3 C11.2 17.3 10.5 16.3 10.5 14.8 C10.5 13.5 11.2 12.5 12 11 Z" fill="#FF5470" />
    </svg>
  );
}

// The File — a folder, violet.
export function IconFolder({ size = 26 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path
        d="M3.5 6.5 C3.5 5.4 4.4 4.5 5.5 4.5 H9.5 L11.5 6.8 H18.5 C19.6 6.8 20.5 7.7 20.5 8.8 V16.5 C20.5 17.6 19.6 18.5 18.5 18.5 H5.5 C4.4 18.5 3.5 17.6 3.5 16.5 Z"
        fill="#7C3AED" stroke="#241046" strokeWidth="2" strokeLinejoin="round"
      />
      <path d="M3.5 10 H20.5" stroke="#241046" strokeWidth="1.6" opacity=".5" />
    </svg>
  );
}

// Auto-roast — a gavel (rotated 45°), yellow head.
export function IconGavel({ size = 26 }: IconProps) {
  return (
    <svg {...base(size)}>
      <g transform="rotate(45 12 12)">
        <rect x="6" y="6.5" width="9" height="5.5" rx="1.4" fill="#FFC83D" stroke="#241046" strokeWidth="2" />
        <rect x="10" y="11.5" width="2.4" height="8" rx="1.2" fill="#7C3AED" stroke="#241046" strokeWidth="2" />
      </g>
      <path d="M4 21 H12" stroke="#241046" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

// Rooms — a stadium / arena oval.
export function IconStadium({ size = 26 }: IconProps) {
  return (
    <svg {...base(size)}>
      <ellipse cx="12" cy="12" rx="9" ry="6" fill="#7C3AED" stroke="#241046" strokeWidth="2" />
      <ellipse cx="12" cy="12" rx="4.2" ry="2.6" fill="#FFEFC2" stroke="#241046" strokeWidth="1.6" />
      <path d="M12 9.4 V14.6 M7.8 12 H16.2" stroke="#241046" strokeWidth="1.3" opacity=".55" />
    </svg>
  );
}

// Hall of Shame — a crown, yellow.
export function IconCrown({ size = 26 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path
        d="M4 17 L5 8 L9 12 L12 6 L15 12 L19 8 L20 17 Z"
        fill="#FFC83D" stroke="#241046" strokeWidth="2" strokeLinejoin="round"
      />
      <path d="M4.5 17 H19.5" stroke="#241046" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export const ICONS = {
  recall: IconRecall,
  respond: IconRespond,
  remember: IconRemember,
  flame: IconFlame,
  folder: IconFolder,
  gavel: IconGavel,
  stadium: IconStadium,
  crown: IconCrown,
} as const;
