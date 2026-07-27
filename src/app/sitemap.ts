import type { MetadataRoute } from "next";
import { CATEGORIES, SPECIAL_CASES } from "@/lib/mock-data";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const specialCaseRoutes: MetadataRoute.Sitemap = SPECIAL_CASES.map((sc) => ({
    url: `${SITE_URL}/special-cases/${sc.slug}`,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  let articleRoutes: MetadataRoute.Sitemap = [];
  let authorRoutes: MetadataRoute.Sitemap = [];

  try {
    const [articles, authors] = await Promise.all([
      db.article.findMany({
        where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
        select: { slug: true, updatedAt: true },
      }),
      db.user.findMany({ where: { approvalStatus: "APPROVED" }, select: { username: true } }),
    ]);

    articleRoutes = articles.map((a) => ({
      url: `${SITE_URL}/news/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "daily",
      priority: 0.8,
    }));

    authorRoutes = authors.map((a) => ({
      url: `${SITE_URL}/author/${a.username}`,
      changeFrequency: "weekly",
      priority: 0.4,
    }));
  } catch {
    // Database not connected yet — sitemap still returns the static routes above.
  }

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes, ...authorRoutes, ...specialCaseRoutes];
}
