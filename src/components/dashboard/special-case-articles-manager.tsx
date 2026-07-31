"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { assignArticleToCaseAction } from "@/app/dashboard/special-case-actions";
import { getCategoryBySlug } from "@/lib/mock-data";

export interface ArticlePoolItem {
  id: string;
  title: string;
  categorySlug: string;
}

export function SpecialCaseArticlesManager({
  specialCaseId,
  assigned,
  available,
}: {
  specialCaseId: string;
  assigned: ArticlePoolItem[];
  available: ArticlePoolItem[];
}) {
  const [assignedList, setAssignedList] = React.useState(assigned);
  const [availableList, setAvailableList] = React.useState(available);
  const [query, setQuery] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function handleAssign(article: ArticlePoolItem) {
    setBusyId(article.id);
    await assignArticleToCaseAction(article.id, specialCaseId);
    setAssignedList((prev) => [...prev, article]);
    setAvailableList((prev) => prev.filter((a) => a.id !== article.id));
    setBusyId(null);
  }

  async function handleUnassign(article: ArticlePoolItem) {
    setBusyId(article.id);
    await assignArticleToCaseAction(article.id, null);
    setAvailableList((prev) => [...prev, article]);
    setAssignedList((prev) => prev.filter((a) => a.id !== article.id));
    setBusyId(null);
  }

  const filteredAvailable = availableList.filter((a) => a.title.includes(query));

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="mb-3 text-sm font-bold text-foreground">اخبار این پرونده ({assignedList.length})</h3>
        {assignedList.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            هنوز خبری به این پرونده اضافه نشده است.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {assignedList.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{getCategoryBySlug(a.categorySlug)?.title ?? a.categorySlug}</Badge>
                  <span className="text-sm font-medium text-foreground">{a.title}</span>
                </div>
                <Button size="sm" variant="ghost" className="gap-1.5" disabled={busyId === a.id} onClick={() => handleUnassign(a)}>
                  <X className="h-3.5 w-3.5" />
                  حذف از پرونده
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-sm font-bold text-foreground">افزودن خبر به پرونده</h3>
        <Input placeholder="جست‌وجوی عنوان خبر…" value={query} onChange={(e) => setQuery(e.target.value)} className="mb-3" />
        <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
          {filteredAvailable.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              خبری یافت نشد.
            </p>
          ) : (
            filteredAvailable.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{getCategoryBySlug(a.categorySlug)?.title ?? a.categorySlug}</Badge>
                  <span className="text-sm font-medium text-foreground">{a.title}</span>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5" disabled={busyId === a.id} onClick={() => handleAssign(a)}>
                  <Plus className="h-3.5 w-3.5" />
                  افزودن
                </Button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
