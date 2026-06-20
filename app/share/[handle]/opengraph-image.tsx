import { ImageResponse } from "next/og";
import { emptyStats, statsForHandle, type HandleStats } from "@/lib/stats";

export const runtime = "nodejs";
export const alt = "A Dendam file";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#f6f8fa";
const INK = "#1a1d26";
const MUTED = "#5c6478";
const MINT = "#14b8a6";
const MINT_DK = "#0d9488";
const AMBER = "#d97706";
const LINE = "#e3e6ec";

function Tile({ n, label, color }: { n: number; label: string; color?: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        background: "#ffffff",
        border: `1px solid ${LINE}`,
        borderRadius: 18,
        padding: "22px 24px",
      }}
    >
      <div style={{ display: "flex", fontSize: 60, fontWeight: 800, color: color ?? INK, lineHeight: 1 }}>
        {n}
      </div>
      <div style={{ display: "flex", fontSize: 21, color: MUTED, marginTop: 8, textTransform: "uppercase", letterSpacing: 1 }}>
        {label}
      </div>
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ handle: string }> }) {
  const { handle: raw } = await params;
  const handle = decodeURIComponent(raw).trim().replace(/^@/, "") || "anon";

  let s: HandleStats;
  try {
    s = await statsForHandle(handle);
  } catch {
    s = emptyStats(handle);
  }

  const accuracy = s.accuracy === null ? "—" : `${Math.round(s.accuracy * 100)}%`;
  const quote = s.topLine && s.topLine.length > 120 ? s.topLine.slice(0, 117) + "…" : s.topLine;

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
          padding: "56px 64px",
          fontFamily: "sans-serif",
          borderTop: `10px solid ${MINT}`,
        }}
      >
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 800, color: INK }}>
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
              border: `1px solid #b7e6df`,
              color: MINT_DK,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            <div style={{ display: "flex", width: 11, height: 11, borderRadius: 999, background: MINT }} />
            {s.network === "mainnet" ? "WALRUS MAINNET" : "WALRUS MEMORY"}
          </div>
        </div>

        {/* title */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", fontSize: 30, color: MUTED }}>Dendam has a file on</div>
          <div style={{ display: "flex", fontSize: 78, fontWeight: 900, letterSpacing: -2, color: INK }}>
            @{handle}
            <span style={{ color: MINT_DK }}>.</span>
          </div>
        </div>

        {/* body: stats or empty */}
        {s.total === 0 ? (
          <div style={{ display: "flex", fontSize: 34, color: MUTED, maxWidth: 980 }}>
            …actually, nothing yet. The file is empty — go make a World Cup 2026 call,
            and live with it.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", gap: 16 }}>
              <Tile n={s.total} label="memories" />
              <Tile n={s.predictions} label="predictions" />
              <Tile n={s.wrong} label="wrong calls" color={AMBER} />
              <Tile n={s.insults} label="insults" color={MINT_DK} />
            </div>
            {quote ? (
              <div style={{ display: "flex", fontSize: 27, color: INK, fontStyle: "italic" }}>
                &ldquo;{quote}&rdquo;
              </div>
            ) : (
              <div style={{ display: "flex", fontSize: 26, color: MUTED }}>
                Verdict accuracy so far: {accuracy}
              </div>
            )}
          </div>
        )}

        {/* footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 24, color: MUTED, fontWeight: 700 }}>
          <div style={{ display: "flex" }}>It remembers. Then it roasts.</div>
          <div style={{ display: "flex" }}>dendam.vercel.app&nbsp;&nbsp;·&nbsp;&nbsp;#Walrus</div>
        </div>
      </div>
    ),
    size,
  );
}
