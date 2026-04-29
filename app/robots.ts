import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/agent-teams/"],
      },
    ],
    sitemap: "https://gourmet-portal.vercel.app/sitemap.xml",
  };
}
