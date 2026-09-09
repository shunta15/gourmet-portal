import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async redirects() {
    return [
      // Redirect www.machinowa.tokyo to primary domain (301 Permanent)
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.machinowa.tokyo" }],
        destination: "https://machinowa.tokyo/:path*",
        permanent: true,
      },
      // Redirect gourmet-portal.vercel.app to primary domain (301 Permanent)
      {
        source: "/:path*",
        has: [{ type: "host", value: "gourmet-portal.vercel.app" }],
        destination: "https://machinowa.tokyo/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
