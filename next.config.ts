import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vercel's Hobby plan caps Image Optimization at 5,000 source-image
    // transformations/month — once hit, every <Image> request 402s
    // (OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED) until the next billing
    // cycle, which is what was breaking images sitewide. `unoptimized`
    // makes next/image request the original Blob URL directly instead of
    // routing it through that (quota-limited, paid-tier) optimizer — no
    // more cap to hit, permanently. This trades away Next's automatic
    // resizing/AVIF-WebP conversion, but the upload route (src/app/api/
    // upload/route.ts) already normalizes and re-encodes every uploaded
    // image with sharp, so what's stored in Blob is already a single,
    // reasonably-sized, broadly-compatible file — there's little left for
    // the optimizer to usefully add.
    unoptimized: true,
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
