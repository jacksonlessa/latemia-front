import { existsSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

const monorepoRoot = path.join(__dirname, "..");
const isLateMiaMonorepo = existsSync(
  path.join(monorepoRoot, "latemia-back", "package.json"),
);

const nextConfig: NextConfig = {
  ...(isLateMiaMonorepo ? { outputFileTracingRoot: monorepoRoot } : {}),
};

export default nextConfig;
