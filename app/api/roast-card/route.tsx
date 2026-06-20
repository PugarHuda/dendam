import { ImageResponse } from "next/og";

export const runtime = "nodejs";

// Social card for a single Dendam roast. Driven by query params (text + by),
// which is why this is an API route returning an ImageResponse rather than the
// file-convention opengraph-image (that only sees route params, not the query).
const BG = "#f6f8fa";
const INK = "#1a1d26";
const MUTED = "#5c6478";
const MINT = "#14b8a6";
const MINT_DK = "#0d9488";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const by = (searchParams.get("by") || "anon").replace(/^@/, "").slice(0, 28);
  let text = (searchParams.get("text") || "").replace(/\s+/g, " ").trim().slice(0, 280);
  if (!text) text = "Make your call. I'll remember every word — and throw it back when it falls apart.";
  // Scale the quote down a touch for long roasts so it always fits.
  const fontSize = text.length > 180 ? 40 : text.length > 110 ? 48 : 58;

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
          padding: "60px 70px",
          fontFamily: "sans-serif",
          borderTop: `10px solid ${MINT}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800, color: INK }}>
            Dendam<span style={{ color: MINT }}>.</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 18px",
              borderRadius: 999,
              background: "rgba(20,184,166,0.10)",
              border: "1px solid #b7e6df",
              color: MINT_DK,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            <div style={{ display: "flex", width: 11, height: 11, borderRadius: 999, background: MINT }} />
            THE RIVAL THAT NEVER FORGETS
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 120, lineHeight: 1, color: MINT, fontWeight: 900, height: 70 }}>
            &ldquo;
          </div>
          <div style={{ display: "flex", fontSize, fontWeight: 800, color: INK, lineHeight: 1.25, letterSpacing: -0.5 }}>
            {text}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 24 }}>
          <div style={{ display: "flex", color: MINT_DK, fontWeight: 700 }}>— Dendam, on @{by}</div>
          <div style={{ display: "flex", color: MUTED, fontWeight: 700 }}>dendam.vercel.app&nbsp;&nbsp;·&nbsp;&nbsp;#Walrus</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
