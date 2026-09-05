import type { Metadata } from "next";
import { Vazirmatn, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE_NAME, SITE_SLOGAN, SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | ${SITE_SLOGAN}`, template: `%s | ${SITE_NAME}` },
  description:
    "مدار مردم، رسانه‌ای مستقل و مردمی است که اخبار، تحلیل و داده‌های مرتبط با جامعه، اقتصاد و زندگی روزمره ایرانیان را با زبانی ساده و قابل اعتماد روایت می‌کند.",
  openGraph: {
    title: `${SITE_NAME} | ${SITE_SLOGAN}`,
    description: "خبر از دل جامعه.",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    locale: "fa_IR",
    type: "website",
  },
  alternates: {
    canonical: SITE_URL,
    types: { "application/rss+xml": `${SITE_URL}/rss.xml` },
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${vazirmatn.variable} ${inter.variable} font-vazir`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
