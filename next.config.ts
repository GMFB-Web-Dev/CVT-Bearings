import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    agentUpgrade: "security",
  },
  // Keep the legacy URL working for browsers that cached the old / -> /home redirect.
  rewrites: async () => [{ source: "/home", destination: "/" }],
  redirects: async () => [
    { source: "/about", destination: "/about-us", permanent: true },
    { source: "/help", destination: "/general-info", permanent: true },
    { source: "/shipping-returns", destination: "/shipping-and-returns", permanent: true },
    { source: "/orders-payments", destination: "/orders-and-payments", permanent: true },
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "media.gmfb.co.nz", pathname: "/media/**" },
      { protocol: "https", hostname: "media.gmfb.co.nz", pathname: "/product-media/**" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
