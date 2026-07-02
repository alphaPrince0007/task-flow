import type { NextConfig } from "next";

/**
 * Next.js configuration.
 *
 * Security headers are applied globally here (defense-in-depth alongside the
 * per-request headers set in middleware). swagger-ui-react is transpiled so its
 * ESM build works inside the App Router.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["swagger-ui-react"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
