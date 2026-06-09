import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default nextConfig;
