// Minimal, demo-grade content guard for the PUBLIC room chat.
//
// This is NOT a substitute for real moderation — a production app would use a
// moderation API plus accounts/auth. It exists so the shared, persistent room
// chat (and Dendam's auto-reaction to it, which is shown to others) can't
// trivially be turned into a hate-speech vector: it blocks the most obvious
// slurs/abuse on the way IN (user posts) and on the way OUT (Dendam's reply).

// A short, conservative blocklist of unambiguous slurs / strong abuse, matched
// at a word boundary (case-insensitive, tolerant of a couple of leet swaps).
// Leading \b avoids the classic false positives (e.g. "Scunthorpe" → cunt,
// "snigger" → nigg, "cocoon" → coon).
const PATTERNS = [
  "\\bn[i1]gg",
  "\\bf[a4]gg",
  "\\bret[a4]rd",
  "\\bk[i1]ke\\b",
  "\\bch[i1]nk\\b",
  "\\btr[a4]nny",
  "\\bw[e3]tback",
  "\\bcoon\\b",
  "\\bcunt",
  "\\bspic\\b",
  "\\bgook\\b",
];
const RE = new RegExp("(" + PATTERNS.join("|") + ")", "i");

export function isAbusive(text: string | undefined | null): boolean {
  return !!text && RE.test(text);
}

// Replace a blocked reply with a safe, in-character deflection so a steered
// Dendam can never emit a slur into the room.
export const SAFE_DEFLECTION =
  "Nice try — I only roast football takes, not people. Bring me a prediction.";
