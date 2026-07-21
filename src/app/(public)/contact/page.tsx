import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ContactForm } from "@/components/contact/contact-form";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "تماس با ما",
  description: "راه‌های ارتباط با تیم تحریریه مدار مردم.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="container-page grid max-w-4xl grid-cols-1 gap-10 py-8 sm:grid-cols-[1fr_1.2fr]">
      <div>
        <Breadcrumb items={[{ label: "تماس با ما", href: "/contact" }]} />
        <h1 className="mb-4 text-2xl font-extrabold text-foreground sm:text-3xl">تماس با ما</h1>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          برای ارسال اخبار و گزارش‌های مردمی، از صفحه «صدای مردم» استفاده کنید. برای سایر موضوعات، از راه‌های زیر با ما در ارتباط باشید.
        </p>

        <div className="flex flex-col gap-4 text-sm">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-secondary" />
            <span dir="ltr">info@madaremardom.ir</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-secondary" />
            <span>تهران، ایران</span>
          </div>
        </div>
      </div>

      <ContactForm />
    </div>
  );
}
