import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleCard } from "@/components/news/article-card";
import { SPECIAL_CASES, getSpecialCaseBySlug } from "@/lib/mock-data";
import { buildPageMetadata } from "@/lib/seo";
import { formatJalali } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return SPECIAL_CASES.map((sc) => ({ slug: sc.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const specialCase = getSpecialCaseBySlug(slug);
  if (!specialCase) return {};
  return buildPageMetadata({
    title: specialCase.title,
    description: specialCase.summary,
    path: `/special-cases/${specialCase.slug}`,
  });
}

export default async function SpecialCasePage({ params }: PageProps) {
  const { slug } = await params;
  const specialCase = getSpecialCaseBySlug(slug);
  if (!specialCase) notFound();

  const nonEmptySections = specialCase.sections.filter((s) => s.articles.length > 0);
  const defaultTab = nonEmptySections[0]?.kind ?? "NEWS";

  return (
    <div className="container-page max-w-5xl py-8">
      <Breadcrumb
        items={[
          { label: "پرونده‌های ویژه", href: "/special-cases" },
          { label: specialCase.title, href: `/special-cases/${specialCase.slug}` },
        ]}
      />

      <div className="relative mb-6 aspect-[21/9] w-full overflow-hidden rounded-xl">
        <Image
          src={specialCase.coverImage.url}
          alt={specialCase.coverImage.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-navy-900/90 to-transparent p-6">
          <h1 className="text-balance text-2xl font-extrabold text-white sm:text-3xl">{specialCase.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/80">{specialCase.summary}</p>
          <span className="mt-2 text-xs text-white/60">پیگیری از {formatJalali(specialCase.startedAt)}</span>
        </div>
      </div>

      {nonEmptySections.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          محتوای این پرونده به‌زودی منتشر می‌شود.
        </p>
      ) : (
        <Tabs defaultValue={defaultTab}>
          <TabsList>
            {nonEmptySections.map((section) => (
              <TabsTrigger key={section.kind} value={section.kind}>
                {section.label} ({section.articles.length})
              </TabsTrigger>
            ))}
          </TabsList>
          {nonEmptySections.map((section) => (
            <TabsContent key={section.kind} value={section.kind}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
