"use client";

import * as React from "react";
import Link from "next/link";
import { Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deletePublishedArticleAction } from "@/app/dashboard/articles-actions";
import { getCategoryBySlug } from "@/lib/mock-data";
import { formatFa, formatJalali } from "@/lib/utils";

export interface PublishedArticleItem {
  id: string;
  slug: string;
  title: string;
  categorySlug: string;
  authorName: string;
  publishedAt: string | null;
  viewCount: number;
}

export function AllArticlesList({ articles, basePath }: { articles: PublishedArticleItem[]; basePath: string }) {
  const [items, setItems] = React.useState(articles);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);

  async function handleDelete(id: string) {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    setBusyId(id);
    await deletePublishedArticleAction(id);
    setItems((prev) => prev.filter((a) => a.id !== id));
    setBusyId(null);
    setConfirmId(null);
  }

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        هنوز خبری منتشر نشده است.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border text-right text-xs text-muted-foreground">
            <th className="p-3 font-medium">عنوان</th>
            <th className="p-3 font-medium">دسته‌بندی</th>
            <th className="p-3 font-medium">نویسنده</th>
            <th className="p-3 font-medium">تاریخ انتشار</th>
            <th className="p-3 font-medium">بازدید</th>
            <th className="p-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {items.map((article) => (
            <tr key={article.id} className="border-b border-border last:border-0">
              <td className="p-3 font-medium text-foreground">{article.title}</td>
              <td className="p-3">
                <Badge variant="outline">{getCategoryBySlug(article.categorySlug)?.title ?? article.categorySlug}</Badge>
              </td>
              <td className="p-3 text-xs text-muted-foreground">{article.authorName}</td>
              <td className="p-3 text-xs text-muted-foreground">
                {article.publishedAt ? formatJalali(article.publishedAt) : "—"}
              </td>
              <td className="p-3 font-numeral text-xs text-muted-foreground">{formatFa(article.viewCount)}</td>
              <td className="p-3">
                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="ghost" className="gap-1" asChild>
                    <Link href={`/news/${article.slug}`} target="_blank">
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1" asChild>
                    <Link href={`${basePath}/${article.id}`}>
                      <Pencil className="h-3.5 w-3.5" />
                      ویرایش
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant={confirmId === article.id ? "destructive" : "ghost"}
                    className="gap-1"
                    disabled={busyId === article.id}
                    onClick={() => handleDelete(article.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {confirmId === article.id ? "مطمئنید؟" : ""}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
