import type { NextConfig } from "next";
import path from "path";

const apiOrigin = (process.env.NEXT_PUBLIC_API_URL ?? "https://sao-jorge-api.talles-f1e.workers.dev").replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  // SSR is required so current liturgical/content updates do not require a rebuild.
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  outputFileTracingRoot: path.join(__dirname, '../../'),
  async rewrites() {
    return [
      {
        source: "/api/catechesis-platform/:path*",
        destination: `${apiOrigin}/api/catechesis-platform/:path*`,
      },
    ];
  },
};

export default nextConfig;
