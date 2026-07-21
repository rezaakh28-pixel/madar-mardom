import type { MetadataRoute } from "next";
import { ARTICLES, AUTHORS, CATEGORIES, SPECIAL_CASES } from "@/lib/mock-data";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/news`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/voice`, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/special-cases`, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.filter((c) => c.slug !== "voice").map((c) => ({
    url: `${SITE_URL}/${c.slug}`,
    changeFrequency: "hourly",
    priority: 0.7,
  }));

  const articleRoutes: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${SITE_URL}/news/${a.slug}`,
    lastModified: a.updatedAt ?? a.publishedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const authorRoutes: MetadataRoute.Sitemap = AUTHORS.map((a) => ({
    url: `${SITE_URL}/author/${a.username}`,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  const specialCaseRoutes: MetadataRoute.Sitemap = SPECIAL_CASES.map((sc) => ({
    url: `${SITE_URL}/special-cases/${sc.slug}`,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes, ...authorRoutes, ...specialCaseRoutes];
}
