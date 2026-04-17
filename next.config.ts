import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pub-8f5fcb136dea4b40a0ab2b4891e0d4ac.r2.dev" },
    ],
  },
};

export default nextConfig;
