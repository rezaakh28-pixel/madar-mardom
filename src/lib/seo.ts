import type { Metadata } from "next";
import type { Author, NewsArticle } from "@/types";

export const SITE_NAME = "مدار مردم";
export const SITE_SLOGAN = "خبر از دل جامعه";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://madaremardom.ir";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

interface BasePageSeoInput {
  title: string;
  description: string;
  path: string; // e.g. "/economy"
  imageUrl?: string;
  keywords?: string[];
}

/** Generic Next.js `Metadata` builder for any public page. */
export function buildPageMetadata({
  title,
  description,
  path,
  imageUrl = DEFAULT_OG_IMAGE,
  keywords = [],
}: BasePageSeoInput): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = path === "/" ? `${SITE_NAME} | ${SITE_SLOGAN}` : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.length ? keywords : undefined,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      locale: "fa_IR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  };
}

/** Metadata builder specialized for a news article page, including `article` OG type. */
export function buildArticleMetadata(article: NewsArticle): Metadata {
  const url = `${SITE_URL}/news/${article.slug}`;
  const description = article.seo?.description ?? article.lead.slice(0, 155);
  const title = article.seo?.title ?? article.title;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    keywords: article.seo?.keywords ?? article.tags,
    alternates: { canonical: url },
    authors: [{ name: article.author.name }],
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: article.coverImage.url,
          width: article.coverImage.width,
          height: article.coverImage.height,
          alt: article.coverImage.alt,
        },
      ],
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      authors: [article.author.name],
      tags: article.tags,
      locale: "fa_IR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [article.coverImage.url],
    },
  };
}

/** JSON-LD `NewsArticle` schema — render with `<script type="application/ld+json">`. */
export function articleJsonLd(article: NewsArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.lead,
    image: [article.coverImage.url],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: [
      {
        "@type": "Person",
        name: article.author.name,
        url: `${SITE_URL}/author/${article.author.username}`,
      },
    ],
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/news/${article.slug}`,
    },
    keywords: article.tags.join(", "),
  };
}

/** JSON-LD `Person` schema for an author page. */
export function authorJsonLd(author: Author) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    jobTitle: author.title,
    url: `${SITE_URL}/author/${author.username}`,
    image: author.avatarUrl,
    description: author.bio,
  };
}

/** JSON-LD `BreadcrumbList` schema for a trail of { label, href } items. */
export function breadcrumbJsonLd(items: Array<{ label: string; href: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${SITE_URL}${item.href}`,
    })),
  };
}
