import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ShareButtons } from "@/components/news/share-buttons";
import { RelatedArticles } from "@/components/news/related-articles";
import { AuthorCard } from "@/components/news/author-card";
import { Badge } from "@/components/ui/badge";
import { getArticleBySlug, getRelatedArticles } from "@/lib/content";
import { SITE_URL, buildArticleMetadata, articleJsonLd } from "@/lib/seo";
import { formatFa, formatJalali, textToSafeHtml } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug).catch(() => null);
  if (!article) return {};
  return buildArticleMetadata(article);
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug).catch(() => null);
  if (!article) notFound();

  const related = await getRelatedArticles(article, 3).catch(() => []);
  const url = `${SITE_URL}/news/${article.slug}`;

  return (
    <article className="container-page max-w-3xl py-8">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(article)) }}
      />

      <Breadcrumb
        items={[
          { label: article.category.title, href: `/${article.category.slug}` },
          { label: article.title, href: `/news/${article.slug}` },
        ]}
      />

      <header className="mb-6 flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          {article.category.title}
        </Badge>
        {article.deck && <p className="text-sm font-medium text-secondary">{article.deck}</p>}
        <h1 className="text-balance text-2xl font-extrabold leading-snug text-foreground sm:text-3xl">
          {article.title}
        </h1>
        <p className="text-balance text-base leading-relaxed text-muted-foreground">{article.lead}</p>

        <div className="flex flex-wrap items-center gap-3 border-y border-border py-3 text-xs text-muted-foreground">
          <span>نویسنده: {article.author.name}</span>
          <span aria-hidden>·</span>
          <span>انتشار: {formatJalali(article.publishedAt)}</span>
          {article.updatedAt && (
            <>
              <span aria-hidden>·</span>
              <span>به‌روزرسانی: {formatJalali(article.updatedAt)}</span>
            </>
          )}
          <span aria-hidden>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatFa(article.readingMinutes)} دقیقه مطالعه
          </span>
        </div>
      </header>

      <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-lg">
        <Image
          src={article.coverImage.url}
          alt={article.coverImage.alt}
          fill
          priority
          sizes="(min-width: 1024px) 768px, 100vw"
          className="object-cover"
        />
      </div>
      {article.coverImage.caption && (
        <p className="mb-8 -mt-4 text-center text-xs text-muted-foreground">{article.coverImage.caption}</p>
      )}

      {article.videoUrl && (
        <div className="mb-8 aspect-video w-full overflow-hidden rounded-lg bg-navy-900">
          <video controls className="h-full w-full" src={article.videoUrl} />
        </div>
      )}

      {article.audioUrl && (
        <audio controls className="mb-8 w-full" src={article.audioUrl}>
          مرورگر شما از پخش صوت پشتیبانی نمی‌کند.
        </audio>
      )}

      {/* Reporters/editors write body as plain text; textToSafeHtml() escapes it and wraps
          paragraphs before this ever reaches dangerouslySetInnerHTML. */}
      <div
        className="prose prose-neutral max-w-none prose-headings:font-extrabold prose-a:text-primary"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: textToSafeHtml(article.body) }}
      />

      {article.gallery && article.gallery.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {article.gallery.map((image) => (
            <div key={image.url} className="relative aspect-square overflow-hidden rounded-md">
              <Image src={image.url} alt={image.alt} fill sizes="200px" className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        {article.tags.map((tag) => (
          <Link key={tag} href={`/tag/${tag}`}>
            <Badge variant="outline" className="hover:border-primary hover:text-primary">
              #{tag}
            </Badge>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <AuthorCard author={article.author} />
        <ShareButtons url={url} title={article.title} />
      </div>

      <RelatedArticles articles={related} />
    </article>
  );
}
