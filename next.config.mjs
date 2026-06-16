/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // MemWal + its Sui/Seal/Walrus peer deps are server-only native-ish packages.
  // Keep them external to the server bundle so Next doesn't try to bundle them.
  serverExternalPackages: [
    "@mysten-incubation/memwal",
    "@mysten/sui",
    "@mysten/seal",
    "@mysten/walrus",
  ],
};

export default nextConfig;
