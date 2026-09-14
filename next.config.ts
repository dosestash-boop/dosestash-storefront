import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "admin.dosestash.com",
      },
      {
        protocol: "https",
        hostname: "pub-c0a7c3c85f4b4174b152f02dfcf3a35a.r2.dev",
      },
    ],
  },
};

export default nextConfig;
