import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubmissionForm } from "@/components/voice/submission-form";
import { TrackingWidget } from "@/components/voice/tracking-widget";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "صدای مردم",
  description: "خبر، عکس، ویدیو یا گزارش خود را برای مدار مردم ارسال کنید و وضعیت آن را پیگیری نمایید.",
  path: "/voice",
});

export default function VoicePage() {
  return (
    <div className="container-page max-w-2xl py-8">
      <Breadcrumb items={[{ label: "صدای مردم", href: "/voice" }]} />

      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">صدای مردم</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          هر آنچه در اطراف خود می‌بینید، مدار مردم می‌شنود. خبر، عکس یا گزارش خود را با ما در میان بگذارید.
        </p>
      </header>

      <Tabs defaultValue="submit">
        <TabsList>
          <TabsTrigger value="submit">ارسال گزارش</TabsTrigger>
          <TabsTrigger value="track">پیگیری وضعیت</TabsTrigger>
        </TabsList>
        <TabsContent value="submit">
          <SubmissionForm />
        </TabsContent>
        <TabsContent value="track">
          <TrackingWidget />
        </TabsContent>
      </Tabs>
    </div>
  );
}
