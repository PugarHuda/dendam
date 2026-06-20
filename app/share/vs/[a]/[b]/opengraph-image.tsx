import { ImageResponse } from "next/og";
import { biggerFraud, emptyStats, statsForHandle, type HandleStats } from "@/lib/stats";

export const runtime = "nodejs";
export const alt = "A Dendam head-to-head";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#f6f8fa";
const INK = "#1a1d26";
const MUTED = "#5c6478";
const MINT = "#14b8a6";
const MINT_DK = "#0d9488";
const AMBER = "#d97706";
const LINE = "#e3e6ec";

function clean(raw: string): string {
  return decodeURIComponent(raw).trim().replace(/^@/, "") || "anon";
}

async function load(raw: string): Promise<HandleStats> {
  try {
    return await statsForHandle(clean(raw));
  } catch {
    return emptyStats(clean(raw));
  }
}

function Column({ s, loser }: { s: HandleStats; loser: boolean }) {
  const accuracy = s.accuracy === null ? "—" : `${Math.round(s.accuracy * 100)}%`;
  const Row = (label: string, value: string, color?: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: 28 }}>
      <div style={{ display: "flex", color: MUTED }}>{label}</div>
      <div style={{ display: "flex", color: color ?? INK, fontWeight: 800 }}>{value}</div>
    </div>
  );
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        gap: 16,
        background: "#ffffff",
        border: `1px solid ${loser ? "#f0d49a" : LINE}`,
        borderTop: `6px solid ${loser ? AMBER : MINT}`,
        borderRadius: 20,
        padding: "28px 30px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 40, fontWeight: 900, color: INK, letterSpacing: -1 }}>
          @{s.handle}
        </div>
        {loser && (
          <div style={{ display: "flex", fontSize: 22, fontWeight: 700, color: AMBER, marginTop: 4 }}>
            bigger fraud
          </div>
        )}
      </div>
      {Row("wrong calls", String(s.wrong), AMBER)}
      {Row("predictions", String(s.predictions))}
      {Row("insults", String(s.insults), MINT_DK)}
      {Row("accuracy", accuracy)}
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ a: string; b: string }> }) {
  const { a: ra, b: rb } = await params;
  const [sa, sb] = await Promise.all([load(ra), load(rb)]);
  const loser = biggerFraud(sa, sb);

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
          padding: "48px 56px",
          fontFamily: "sans-serif",
          borderTop: `10px solid ${MINT}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800, color: INK }}>
            Dendam<span style={{ color: MINT }}>.</span> head-to-head
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
            WALRUS MAINNET
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "stretch", gap: 22 }}>
          <Column s={sa} loser={loser?.handle === sa.handle} />
          <div style={{ display: "flex", alignItems: "center", fontSize: 56, fontWeight: 900, color: MUTED }}>
            vs
          </div>
          <Column s={sb} loser={loser?.handle === sb.handle} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 24, color: MUTED, fontWeight: 700 }}>
          <div style={{ display: "flex" }}>
            {loser ? `@${loser.handle} is losing the bragging war.` : "Dead even — both equally full of it."}
          </div>
          <div style={{ display: "flex" }}>dendam.vercel.app&nbsp;&nbsp;·&nbsp;&nbsp;#Walrus</div>
        </div>
      </div>
    ),
    size,
  );
}
