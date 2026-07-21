import type { Metadata } from "next";
import { CategoryPage } from "@/components/category/category-page";
import { getCategoryBySlug } from "@/lib/mock-data";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  const category = getCategoryBySlug("society")!;
  return buildPageMetadata({
    title: category.title,
    description: category.description ?? category.title,
    path: "/society",
  });
}

export default function Page() {
  return <CategoryPage slug="society" />;
}
