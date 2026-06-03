import { existsSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

const monorepoRoot = path.join(__dirname, "..");
const isLateMiaMonorepo = existsSync(
  path.join(monorepoRoot, "latemia-back", "package.json"),
);

const nextConfig: NextConfig = {
  ...(isLateMiaMonorepo ? { outputFileTracingRoot: monorepoRoot } : {}),
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/array/:path*',
        destination: 'https://us-assets.i.posthog.com/array/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
