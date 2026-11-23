import type { NextConfig } from "next";

// TD-27: Cache Components disabled — every page is per-user and dynamic; the
// documented previous caching model is used (no implicit caching of DB reads).
const nextConfig: NextConfig = {
  cacheComponents: false,
  serverExternalPackages: ["playwright", "playwright-core", "exceljs"],
  poweredByHeader: false,
  // The Excel template is read at runtime; include it in serverless bundles (e.g., Vercel).
  outputFileTracingIncludes: { "/projects/**": ["./assets/**"] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
