import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  // SSR is required so current liturgical/content updates do not require a rebuild.
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default nextConfig;
