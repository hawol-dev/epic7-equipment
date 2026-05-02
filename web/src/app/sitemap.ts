import type { MetadataRoute } from "next";
import { heroes, enums } from "@/lib/data";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://epic7-equipment.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,        lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/heroes`,  lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/sets`,    lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/help`,    lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const heroRoutes: MetadataRoute.Sitemap = heroes.map((h) => ({
    url: `${BASE}/hero/${h.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: h.has_data ? 0.8 : 0.5,
  }));

  return [...staticRoutes, ...heroRoutes];
}
