import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // sharp (used in src/app/api/upload/route.ts to normalize uploaded images)
  // ships a native binary — it must run as-is in the serverless function,
  // not get pulled into the webpack bundle, or it fails at runtime on Vercel.
  serverExternalPackages: ["sharp"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
