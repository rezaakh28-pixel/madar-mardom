# مدار مردم (Madar-e Mardom)

خبر از دل جامعه — یک اسکلت production-grade برای یک رسانه مستقل خبری/اجتماعی فارسی، ساخته‌شده با Next.js 15 (App Router)، TypeScript، Tailwind CSS، Shadcn UI و Prisma.

## شروع سریع (Getting started)

```bash
# 1. نصب وابستگی‌ها
npm install

# 2. متغیرهای محیطی را کپی و تنظیم کنید
cp .env.example .env

# 3. اتصال Prisma به PostgreSQL (اختیاری — سایت فعلاً با mock data کار می‌کند)
npx prisma generate
npx prisma db push

# 4. اجرای سرور توسعه
npm run dev
```

Site is fully functional against typed mock data (`src/lib/mock-data.ts`) with **no database required** to explore the UI. Connect PostgreSQL + Prisma when you're ready to persist real content.

## Stack

- **Next.js 15** (App Router, Server Components, Server Actions)
- **TypeScript**, strict mode
- **Tailwind CSS** + **Shadcn-style UI primitives** (Radix under the hood)
- **Prisma** + **PostgreSQL** (schema in `prisma/schema.prisma`, not yet wired to routes — see below)
- RTL-first (`<html dir="rtl" lang="fa">`), mobile-first responsive, light/dark theme via `next-themes`
- Vazirmatn (Persian) + Inter (Latin/numerals) via `next/font/google`

## Folder structure

```
src/
├── app/
│   ├── layout.tsx                 # root layout — fonts, RTL, ThemeProvider
│   ├── globals.css                # brand color tokens (light + dark), base styles
│   ├── sitemap.ts / robots.ts     # generated SEO files
│   ├── rss.xml/route.ts           # RSS feed
│   ├── api/voice/{submit,track}/  # Voice of People API routes
│   ├── (public)/                  # public-facing site
│   │   ├── layout.tsx             # navbar + footer shell
│   │   ├── page.tsx                # home
│   │   ├── news/page.tsx           # news index
│   │   ├── news/[slug]/page.tsx    # article page
│   │   ├── author/[username]/page.tsx
│   │   ├── economy|society|politics|provinces|world|analysis|notes|reports|data|video|podcast|infographic/page.tsx
│   │   │                           # ^ all generated from the shared <CategoryPage> component
│   │   ├── special-cases/page.tsx  and special-cases/[slug]/page.tsx
│   │   ├── voice/page.tsx          # submission + tracking
│   │   ├── about/page.tsx, contact/page.tsx
│   └── (dashboard)/                # internal panels, gated by RBAC
│       ├── layout.tsx              # sidebar + topbar, reads session
│       ├── reporter/               # article creation + AI-assist
│       ├── editor/                 # review queue, approve/reject/schedule
│       └── admin/                  # stats + user/role management
├── components/
│   ├── ui/                         # Button, Card, Badge, Tabs, Input, Select, Avatar, DropdownMenu…
│   ├── layout/                     # Navbar, Footer, Breadcrumb, ThemeToggle
│   ├── home/                       # HeroNews, PulseOfSociety, NewsSection, MostVisited, Newsletter
│   ├── news/                       # ArticleCard, ShareButtons, RelatedArticles, AuthorCard
│   ├── category/                   # shared CategoryPage template
│   ├── voice/                      # SubmissionForm, TrackingWidget
│   └── dashboard/                  # Sidebar, ArticleForm, ReviewQueue, UserTable, StatCard
├── lib/
│   ├── db.ts                       # Prisma client singleton
│   ├── mock-data.ts                # typed mock data — swap for Prisma queries later (see comments)
│   ├── ai.ts                       # AI abstraction layer (stubs — see below)
│   ├── seo.ts                      # Metadata / OpenGraph / JSON-LD helpers
│   ├── auth.ts                     # RBAC + mock session (swap for NextAuth — see comments)
│   ├── rate-limit.ts               # in-memory fixed-window limiter
│   ├── logger.ts                   # structured logger
│   └── utils.ts                    # cn(), Persian number/date formatting
├── types/index.ts                  # NewsArticle, Author, SpecialCase, PulseItem, etc.
└── middleware.ts                   # RBAC gate for /dashboard/*, rate limiting for sensitive POSTs

prisma/schema.prisma                # User, Article, Category, SpecialCase, VoiceSubmission, PulseSnapshot
```

## Design system

Brand tokens live in `tailwind.config.ts` (`navy`, `orange`, `surface`, `ink`) and are re-expressed as HSL CSS variables in `src/app/globals.css` for light/dark theming. The one deliberately expressive element is **"نبض جامعه" (Pulse of Society)**: a small live-data grid with a subtle animated ECG-style sweep in its header, echoing the literal meaning of "pulse." Everything else is intentionally restrained — a calm reading surface for long-form journalism.

## What's mocked vs. real

| Area | Status | Where to plug in the real thing |
|---|---|---|
| Content (articles, authors, pulse data) | Typed mock data | `src/lib/mock-data.ts` — every function's signature already matches the Prisma query it should become (see inline comments) |
| Auth / sessions | Working demo login (`/login`) — pick a role, no real password/account | `src/lib/auth.ts` + `src/app/login/` — swap for NextAuth's `auth()` and a real `Credentials`/OAuth provider |
| RBAC on `/dashboard/*` | Enforced in `middleware.ts` via the `mm_role` cookie set at `/login` | Replace the cookie read with `getToken()` from `next-auth/jwt` once NextAuth is wired up |
| AI features (summarize, suggest title/tags/category, TTS, dedupe, SEO gen) | Deterministic stubs with real function signatures | `src/lib/ai.ts` — swap each function body for a real model call |
| Voice of People submissions | In-memory store (`src/lib/voice-store.ts`) | Swap for `db.voiceSubmission.*` once Prisma is connected |
| Captcha | Visual placeholder checkbox | Wire a real widget (e.g. Cloudflare Turnstile) in `submission-form.tsx` + verify the token server-side in `api/voice/submit/route.ts` |
| Image / file uploads | **Working** — `src/app/api/upload/route.ts` uploads to Vercel Blob | One-time setup on Vercel: **Storage tab → Create Database → Blob → Connect to Project** (auto-adds `BLOB_READ_WRITE_TOKEN` and redeploys) |

## Notes on RTL

The whole app is RTL by default (`dir="rtl"` on `<html>`). When you add an English locale later, prefer Tailwind's **logical** spacing utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`, `text-start`, `text-end`) over physical ones (`pl-*`, `pr-*`) so both directions render correctly without duplicated classes.

## Scripts

```bash
npm run dev          # start dev server
npm run build         # production build
npm run lint           # eslint
npm run db:generate    # prisma generate
npm run db:push        # push schema to the database
npm run db:studio      # Prisma Studio
```
