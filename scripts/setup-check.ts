/* eslint-disable no-console */
// Quick preflight: verifies which memory backend is active and, if MemWal
// is configured, does a round-trip remember -> recall against Walrus.
//   npm run check:memory
import { getMemoryStore, namespaceFor } from "../lib/memory";

async function main() {
  const store = getMemoryStore();
  console.log(`\nDendam memory backend: ${store.backend.toUpperCase()}`);

  if (store.backend === "local") {
    console.log(
      "→ Running on the LOCAL dev store. For the hackathon submission you MUST set\n" +
        "  MEMWAL_DELEGATE_KEY / MEMWAL_ACCOUNT_ID / MEMWAL_SERVER_URL so memory lives on Walrus Mainnet.",
    );
  } else {
    console.log(`  accountId: ${process.env.MEMWAL_ACCOUNT_ID}`);
    console.log(`  agentId  : ${process.env.MEMWAL_AGENT_ID ?? "(set MEMWAL_AGENT_ID for the form)"}`);
  }

  const ns = namespaceFor("setup-check");
  const stamp = `preflight memory check kind=fact`;
  console.log("\n→ remember()…");
  await store.remember(ns, { text: stamp, kind: "fact" });
  console.log("→ recall()…");
  const got = await store.recall(ns, "preflight memory check", 5);
  console.log(`  recalled ${got.length} record(s):`);
  for (const r of got) console.log(`   - ${r.text}`);

  console.log(got.length > 0 ? "\n✅ round-trip OK\n" : "\n⚠️ recall returned nothing\n");
}

main().catch((e) => {
  console.error("\n❌ setup check failed:\n", e);
  process.exit(1);
});
