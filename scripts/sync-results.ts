// Pull the live football-data.org feed and persist new FINISHED matches to
// Walrus (real data → on-chain). Requires FOOTBALL_DATA_TOKEN + MEMWAL_* (or a
// local backend) in the environment. Usage: npm run sync:results
import { syncResults } from "../lib/sportsapi";

(async () => {
  if (!process.env.FOOTBALL_DATA_TOKEN) {
    console.log("⚠️  FOOTBALL_DATA_TOKEN not set — nothing to fetch. (Get a free one at football-data.org.)");
  }
  const { fetched, stored } = await syncResults();
  console.log(`✅ Fetched ${fetched} finished matches; stored ${stored} new result(s) on Walrus.`);
  process.exit(0);
})().catch((err) => {
  console.error("sync failed:", err);
  process.exit(1);
});
