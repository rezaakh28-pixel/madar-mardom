import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleCard } from "@/components/news/article-card";
import { getArticlesByAuthor, getAuthorByUsername } from "@/lib/content";
import { buildPageMetadata, authorJsonLd } from "@/lib/seo";
import { ROLE_LABELS_FA } from "@/lib/auth";
import { formatFa } from "@/lib/utils";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const author = await getAuthorByUsername(username).catch(() => null);
  if (!author) return {};
  return buildPageMetadata({
    title: author.name,
    description: author.bio,
    path: `/author/${author.username}`,
  });
}

export default async function AuthorPage({ params }: PageProps) {
  const { username } = await params;
  const author = await getAuthorByUsername(username).catch(() => null);
  if (!author) notFound();

  const articles = await getArticlesByAuthor(username).catch(() => []);
  const news = articles.filter((a) => a.kind === "NEWS" || a.kind === "REPORT");
  const analysis = articles.filter((a) => a.kind === "ANALYSIS" || a.kind === "NOTE");

  return (
    <div className="container-page max-w-4xl py-8">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorJsonLd(author)) }}
      />

      <Breadcrumb items={[{ label: author.name, href: `/author/${author.username}` }]} />

      <header className="mb-8 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-right">
        <Avatar className="h-24 w-24">
          <AvatarImage src={author.avatarUrl} alt={author.name} />
          <AvatarFallback className="text-2xl">{author.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h1 className="text-xl font-extrabold text-foreground sm:text-2xl">{author.name}</h1>
            <Badge>{ROLE_LABELS_FA[author.role]}</Badge>
          </div>
          <p className="text-sm font-medium text-secondary">{author.title}</p>
          {author.bio && <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{author.bio}</p>}
          <p className="font-numeral text-xs text-muted-foreground">
            {formatFa(author.articleCount)} مطلب منتشرشده
          </p>
        </div>
      </header>

      <Tabs defaultValue="news">
        <TabsList>
          <TabsTrigger value="news">اخبار ({formatFa(news.length)})</TabsTrigger>
          <TabsTrigger value="analysis">تحلیل ({formatFa(analysis.length)})</TabsTrigger>
        </TabsList>
        <TabsContent value="news">
          {news.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">هنوز خبری منتشر نشده است.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {news.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="analysis">
          {analysis.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">هنوز تحلیلی منتشر نشده است.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {analysis.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
