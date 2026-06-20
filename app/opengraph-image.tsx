import { ImageResponse } from "next/og";

// Social share card — generated at build, wired into og:image + twitter:image
// automatically by Next's file convention. Matches the flat light Walrus-mint UI.
export const alt = "Dendam — the World Cup 2026 rival that never forgets";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#f6f8fa";
const INK = "#1a1d26";
const MUTED = "#5c6478";
const MINT = "#14b8a6";
const MINT_DK = "#0d9488";
const LINE = "#e3e6ec";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          padding: "64px 72px",
          fontFamily: "sans-serif",
          borderTop: `10px solid ${MINT}`,
        }}
      >
        {/* top: brand + live pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                display: "flex",
                width: 64,
                height: 64,
                borderRadius: 18,
                background: "#ffffff",
                border: `1px solid ${LINE}`,
                alignItems: "center",
                justifyContent: "center",
                fontSize: 34,
              }}
            >
              D
            </div>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 800, color: INK }}>
              Dendam
              <span style={{ color: MINT }}>.</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 20px",
              borderRadius: 999,
              background: "rgba(20,184,166,0.10)",
              border: `1px solid #b7e6df`,
              color: MINT_DK,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            <div style={{ display: "flex", width: 12, height: 12, borderRadius: 999, background: MINT }} />
            LIVE ON WALRUS MAINNET
          </div>
        </div>

        {/* middle: headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 92,
              fontWeight: 900,
              letterSpacing: -3,
              lineHeight: 1.02,
              color: INK,
            }}
          >
            <div style={{ display: "flex" }}>Make your call.</div>
            <div style={{ display: "flex", color: MINT_DK }}>Live with it.</div>
          </div>
          <div style={{ display: "flex", maxWidth: 920, fontSize: 30, color: MUTED, lineHeight: 1.4 }}>
            A World Cup 2026 rival AI that remembers every prediction, hot take, and
            insult on Walrus Memory — then throws it back the moment you&rsquo;re wrong.
          </div>
        </div>

        {/* bottom: before/after + url */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 26,
          }}
        >
          <div style={{ display: "flex", color: INK, fontWeight: 600 }}>
            Day 1 it knows nothing.&nbsp;
            <span style={{ color: MINT_DK }}>Day 5 it has a FILE on you.</span>
          </div>
          <div style={{ display: "flex", color: MUTED, fontWeight: 700 }}>
            dendam.vercel.app&nbsp;&nbsp;·&nbsp;&nbsp;#Walrus
          </div>
        </div>
      </div>
    ),
    size,
  );
}
