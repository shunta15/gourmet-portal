import type { MetadataRoute } from "next";
import { RESTAURANTS, REGIONS, FEATURES } from "@/lib/data";
import { SCENES } from "@/lib/scenes";

const BASE = "https://gourmet-portal.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    {
      url: `${BASE}/feature`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE}/search`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const restaurants: MetadataRoute.Sitemap = RESTAURANTS.map((r) => ({
    url: `${BASE}/restaurant/${r.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const regions: MetadataRoute.Sitemap = Object.keys(REGIONS).map((k) => ({
    url: `${BASE}/region/${k}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const features: MetadataRoute.Sitemap = FEATURES.map((f) => ({
    url: `${BASE}/feature/${f.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const scenes: MetadataRoute.Sitemap = SCENES.map((s) => ({
    url: `${BASE}/scene/${s.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...restaurants, ...regions, ...features, ...scenes];
}
