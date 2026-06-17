/* eslint-disable no-console */
//
// One-shot Walrus Memory credential setup — no dashboard clicking.
//
//   1) generates an Ed25519 delegate key
//   2) creates your MemWalAccount on-chain (or reuses MEMWAL_ACCOUNT_ID)
//   3) registers the delegate key on that account
//   4) writes MEMWAL_* into .env.local (merged) and prints them
//
// Requires your OWNER Sui private key (bech32 `suiprivkey1...`) with a little
// SUI for gas. Provide it via env or in .env.local:
//
//   SUI_PRIVATE_KEY=suiprivkey1...   npm run setup:memwal
//
// Options (env):
//   SUI_NETWORK=mainnet|testnet   (default: mainnet)
//   MEMWAL_ACCOUNT_ID=0x...       (skip account creation, reuse an existing one)
//   DENDAM_LABEL="vercel-prod"    (delegate key label; default "dendam")
//
import { promises as fs } from "node:fs";
import path from "node:path";

// Official on-chain IDs (docs.wal.app — memwal::account contract overview).
const NETS = {
  mainnet: {
    packageId:
      "0xcee7a6fd8de52ce645c38332bde23d4a30fd9426bc4681409733dd50958a24c6",
    registryId:
      "0x0da982cefa26864ae834a8a0504b904233d49e20fcc17c373c8bed99c75a7edd",
    relayer: "https://relayer.memory.walrus.xyz",
  },
  testnet: {
    packageId:
      "0xcf6ad755a1cdff7217865c796778fabe5aa399cb0cf2eba986f4b582047229c6",
    registryId:
      "0xe80f2feec1c139616a86c9f71210152e2a7ca552b20841f2e192f99f75864437",
    relayer: "https://relayer-staging.memory.walrus.xyz",
  },
} as const;

const ENV_FILE = path.join(process.cwd(), ".env.local");

// Tiny .env.local loader (no dotenv dependency).
async function loadEnvLocal(): Promise<void> {
  let text: string;
  try {
    text = await fs.readFile(ENV_FILE, "utf8");
  } catch {
    return;
  }
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const [, k, v] = m;
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

// Merge MEMWAL_* updates into .env.local, preserving everything else.
async function mergeEnvLocal(updates: Record<string, string>): Promise<void> {
  let text = "";
  try {
    text = await fs.readFile(ENV_FILE, "utf8");
  } catch {
    /* new file */
  }
  for (const [k, v] of Object.entries(updates)) {
    const re = new RegExp(`^\\s*${k}\\s*=.*$`, "m");
    if (re.test(text)) text = text.replace(re, `${k}=${v}`);
    else text += (text.endsWith("\n") || text === "" ? "" : "\n") + `${k}=${v}\n`;
  }
  await fs.writeFile(ENV_FILE, text, "utf8");
}

async function main() {
  await loadEnvLocal();

  const network = process.env.SUI_NETWORK === "testnet" ? "testnet" : "mainnet";
  const net = NETS[network];
  const suiPrivateKey = process.env.SUI_PRIVATE_KEY?.trim();
  const label = process.env.DENDAM_LABEL?.trim() || "dendam";

  if (!suiPrivateKey || !suiPrivateKey.startsWith("suiprivkey1")) {
    console.error(
      "\n❌ Missing SUI_PRIVATE_KEY (bech32 `suiprivkey1...`).\n" +
        "   Export your OWNER Sui wallet key and re-run, e.g.:\n" +
        "   SUI_PRIVATE_KEY=suiprivkey1... npm run setup:memwal\n" +
        "   (Tip: `sui keytool export --key-identity <address>` prints it. Keep it secret.)\n",
    );
    process.exit(1);
  }

  console.log(`\nWalrus Memory setup · network=${network}`);

  const { createAccount, addDelegateKey, generateDelegateKey } = await import(
    "@mysten-incubation/memwal/account"
  );

  // MemWal v0.0.7 auto-constructs an old `SuiClient` from `@mysten/sui/client`,
  // which no longer exists in @mysten/sui v2.6+ (the JSON-RPC client moved to
  // `@mysten/sui/jsonRpc` as `SuiJsonRpcClient`). So we build it and pass it in.
  const { SuiJsonRpcClient, getJsonRpcFullnodeUrl }: any = await import(
    "@mysten/sui/jsonRpc"
  );
  const suiClient = new SuiJsonRpcClient({
    url: getJsonRpcFullnodeUrl(network),
  });

  // 1) delegate keypair
  console.log("→ generating delegate key…");
  const delegate = await generateDelegateKey();

  // 2) account (reuse or create)
  let accountId = process.env.MEMWAL_ACCOUNT_ID?.trim();
  if (accountId && accountId.startsWith("0x")) {
    console.log(`→ using existing account ${accountId}`);
  } else {
    console.log("→ creating MemWalAccount on-chain (needs SUI for gas)…");
    try {
      const acc = await createAccount({
        packageId: net.packageId,
        registryId: net.registryId,
        suiPrivateKey,
        suiNetwork: network,
        suiClient,
      });
      accountId = acc.accountId;
      console.log(`  created ${accountId} (owner ${acc.owner})`);
    } catch (e: any) {
      console.error(
        "\n❌ createAccount failed. Each Sui address can own only ONE account.\n" +
          "   If you already created one (e.g. via the dashboard), re-run with it set:\n" +
          "   MEMWAL_ACCOUNT_ID=0x... SUI_PRIVATE_KEY=suiprivkey1... npm run setup:memwal\n" +
          `   Underlying error: ${e?.message ?? e}\n`,
      );
      process.exit(1);
    }
  }

  // 3) register the delegate key on the account
  console.log("→ registering delegate key on-chain…");
  const reg = await addDelegateKey({
    packageId: net.packageId,
    accountId: accountId!,
    publicKey: delegate.publicKey,
    label,
    suiPrivateKey,
    suiNetwork: network,
    suiClient,
  });

  // 4) output + persist
  const env = {
    MEMWAL_DELEGATE_KEY: delegate.privateKey,
    MEMWAL_ACCOUNT_ID: accountId!,
    MEMWAL_SERVER_URL: net.relayer,
    MEMWAL_AGENT_ID: reg.publicKey, // hex public key — goes into the Airtable form
  };
  await mergeEnvLocal(env);

  console.log("\n✅ Done. Wrote these to .env.local (gitignored):\n");
  console.log(`MEMWAL_ACCOUNT_ID   = ${env.MEMWAL_ACCOUNT_ID}`);
  console.log(`MEMWAL_AGENT_ID     = ${env.MEMWAL_AGENT_ID}   ← put this in the Airtable form`);
  console.log(`MEMWAL_SERVER_URL   = ${env.MEMWAL_SERVER_URL}`);
  console.log(`MEMWAL_DELEGATE_KEY = ${env.MEMWAL_DELEGATE_KEY.slice(0, 10)}… (secret, kept full in .env.local)`);
  console.log(
    "\nNext:\n" +
      "  • Verify locally:  npm run check:memory   (badge should read ● Walrus Mainnet)\n" +
      "  • Push to Vercel:  see DEPLOY.md Path 0 (vercel env add MEMWAL_*) then redeploy\n",
  );
}

main().catch((e) => {
  console.error("\n❌ setup:memwal failed:\n", e);
  process.exit(1);
});
