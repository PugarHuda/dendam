import { getAllResults } from "./sportsapi";
import { winnerOf, type MatchResult } from "./results";

// Match Rooms — a prediction room per World Cup 2026 match. People drop a
// prediction (stored on Walrus, like everything else), Dendam stirs the room,
// and when the real result lands a winner is decided.
//
// ⚠️ The crypto prize pool / stake / payouts here are a MOCK-UP for the demo —
// amounts are display-only and no funds ever move. (Real escrow/payouts would
// be a separate, post-hackathon build with its own legal + on-chain work.)

export interface RoomPlayer {
  handle: string;
  prediction: string;
  pick: string; // the team they're backing to win (used for scoring)
}

export interface MatchRoom {
  id: string; // matches a MatchResult id once the game is played
  teamA: string;
  teamB: string;
  stage: string;
  date: string; // ISO
  poolWal: number; // mock prize pool (WAL)
  stakeWal: number; // mock entry stake (WAL)
  players: RoomPlayer[]; // seeded participants (the current user can add theirs)
}

export const ROOMS: MatchRoom[] = [
  {
    id: "WC2026-BRA-ARG-QF",
    teamA: "Brazil",
    teamB: "Argentina",
    stage: "Quarter-final",
    date: "2026-07-04",
    poolWal: 2.4,
    stakeWal: 0.3,
    players: [
      { handle: "demo", prediction: "Argentina lift it, Brazil are done.", pick: "Argentina" },
      { handle: "ta", prediction: "Brazil edge Argentina in a tight one.", pick: "Brazil" },
      { handle: "sol", prediction: "Argentina win 3-0, easy.", pick: "Argentina" },
      { handle: "kontiki", prediction: "Brazil by two, Argentina collapse.", pick: "Brazil" },
    ],
  },
  {
    id: "WC2026-FRA-ESP-SF",
    teamA: "France",
    teamB: "Spain",
    stage: "Semi-final",
    date: "2026-07-08",
    poolWal: 1.8,
    stakeWal: 0.2,
    players: [
      { handle: "demo", prediction: "France through, Mbappé scores twice.", pick: "France" },
      { handle: "ta", prediction: "Spain win it on penalties.", pick: "Spain" },
      { handle: "rafa", prediction: "Spain 2-1, tiki-taka still works.", pick: "Spain" },
    ],
  },
  {
    id: "WC2026-FINAL",
    teamA: "Winner SF1",
    teamB: "Winner SF2",
    stage: "Final",
    date: "2026-07-19",
    poolWal: 5.0,
    stakeWal: 0.5,
    players: [
      { handle: "demo", prediction: "Whoever beats Brazil takes the trophy.", pick: "Brazil" },
    ],
  },
];

export function getRoom(id: string): MatchRoom | undefined {
  return ROOMS.find((r) => r.id === id);
}

export interface RoomResolution {
  result: MatchResult | null;
  winnerTeam: string | "draw" | null;
  // handles whose prediction named the winning team (mock-grade scoring)
  winners: string[];
}

// Resolve a room against the real results feed (the bundled seed already has
// Brazil 2-1 Argentina). Scoring is intentionally simple for the mock: a
// prediction "wins" if it names the team that actually won.
export async function resolveRoom(room: MatchRoom): Promise<RoomResolution> {
  const results = await getAllResults();
  const result = results.find((r) => r.id === room.id) ?? null;
  if (!result) return { result: null, winnerTeam: null, winners: [] };
  const w = winnerOf(result);
  // A player wins if the team they backed actually won.
  const winners =
    w === "draw"
      ? []
      : room.players
          .filter((p) => p.pick.toLowerCase() === w.toLowerCase())
          .map((p) => p.handle);
  return { result, winnerTeam: w, winners };
}
