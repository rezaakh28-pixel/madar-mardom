# مدار مردم (Madar-e Mardom)

خبر از دل جامعه — یک اسکلت production-grade برای یک رسانه مستقل خبری/اجتماعی فارسی، ساخته‌شده با Next.js 15 (App Router)، TypeScript، Tailwind CSS، Shadcn UI و Prisma.

## شروع سریع (Getting started)

```bash
# 1. نصب وابستگی‌ها
npm install

# 2. متغیرهای محیطی را کپی و تنظیم کنید (به‌خصوص AUTH_SECRET و ADMIN_USERNAME/ADMIN_PASSWORD)
cp .env.example .env

# 3. اتصال Prisma به PostgreSQL و ساخت جداول
npx prisma generate
npx prisma db push

# 4. ساخت حساب مدیر اولیه (از روی ADMIN_USERNAME/ADMIN_PASSWORD در .env)
npx prisma db seed

# 5. اجرای سرور توسعه
npm run dev
```

Public content (articles, authors, pulse data) is fully functional against typed mock data (`src/lib/mock-data.ts`) with **no database required**. **Accounts and login are real** and require a connected Postgres database — see "Authentication" below.

## Stack

- **Next.js 15** (App Router, Server Components, Server Actions)
- **TypeScript**, strict mode
- **Tailwind CSS** + **Shadcn-style UI primitives** (Radix under the hood)
- **Prisma** + **PostgreSQL** — used for real user accounts (see below); article/category content is still mock data
- Real authentication: signed session cookies (HMAC via Web Crypto, works on both Node and Edge), bcrypt-hashed passwords — no third-party auth service required
- RTL-first (`<html dir="rtl" lang="fa">`), mobile-first responsive, light/dark theme via `next-themes`
- Vazirmatn (Persian) + Inter (Latin/numerals) via `next/font/google`

## Content workflow

Articles are real, database-backed content now (`Article` model in `prisma/schema.prisma`), with a full reporter → editor → public pipeline:

1. **Reporter** writes an article in `/dashboard/reporter` and either saves it as a draft or sends it for review (`saveArticleAction` in `src/app/dashboard/reporter/actions.ts` — creates a real `Article` row with status `PENDING_REVIEW`).
2. **Editor** sees it immediately in `/dashboard/editor` — filtered to their assigned beat(s) (an editor can be assigned multiple sections from the admin panel). From there they can:
   - **Edit** the title/deck/lead/body/category before publishing.
   - **انتشار فوری (Publish now)** — goes live immediately.
   - **زمان‌بندی انتشار (Schedule)** — pick a date/time with the Jalali (Persian calendar) picker; the article publishes itself automatically once that time passes (public queries only return articles whose `publishedAt` is in the past — no cron job needed).
   - **رد کردن (Reject)**.
3. **Public site** reads only `PUBLISHED` articles whose `publishedAt` has passed (`src/lib/content.ts`), across the home page, category pages, the article page (which also increments a real view counter), and the author page.

An editor assigned the "اقتصاد" (economy) beat also gets a **ویرایش نبض جامعه** section in their panel to update the Pulse of Society numbers — the same form the admin panel uses (`src/components/dashboard/pulse-edit-form.tsx`).

## Authentication

There are three account types, each created a different way — by design, none of them can create themselves the "wrong" way:

| Role | How the account is created | Who approves it |
|---|---|---|
| **مدیر (Admin)** | Seeded once from `ADMIN_USERNAME` / `ADMIN_PASSWORD` in your environment, via `npx prisma db seed`. There is no admin sign-up page. | — |
| **سردبیر (Editor)** | Created directly by an admin, from the admin panel (`/dashboard/admin` → "افزودن سردبیر جدید"). The admin sets the username/password and assigns a **بخش خبری** (news section) — the editor's panel and review queue are filtered to that section. | Created already-approved by the admin |
| **خبرنگار (Reporter)** | Self-registers at `/register` with a username/password. | Must be approved by an admin in the admin panel before they can log in |

Everyone logs in at `/login` with their real username and password. Sessions are an HMAC-signed cookie (`mm_session`) valid for 8 hours — see `src/lib/signed-cookie.ts`, `src/lib/session.ts`, and `src/app/login/actions.ts`.

**Required setup for any of this to work:**

1. **Connect a Postgres database.** On Vercel: Project → **Storage** tab → **Connect Database** → choose **Prisma** (Prisma Postgres) from the Marketplace providers. It pairs naturally with this project since we already use Prisma as the ORM, and it only needs one environment variable. This automatically sets `DATABASE_URL` — no manual copying needed. (Vercel's own "Vercel Postgres" product was discontinued in Dec 2024 in favor of Marketplace providers like this — if you see Neon, Supabase, or Nile listed too, any of them would technically work since they're all Postgres, but Prisma Postgres is the simplest match for this project.)
2. **Set `AUTH_SECRET`** in your environment (Vercel: Settings → Environment Variables) — any long random string, e.g. from `openssl rand -base64 32`. This signs session cookies; changing it logs everyone out.
3. **Set `ADMIN_USERNAME` and `ADMIN_PASSWORD`** in your environment — these are only read once, by the seed script, to create the first admin account.
4. **Push the schema and seed the admin**, once, from your own machine with those same environment variables available locally (easiest way: install the Vercel CLI, run `vercel link` then `vercel env pull .env` in the project folder to pull all the values above from Vercel automatically), then run:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
5. Redeploy (or it'll already be live if you did this after connecting the database).

Until steps 1–4 are done, `/login` and `/register` will show a clear Persian error instead of crashing — the rest of the site (all public pages) works regardless.

## Folder structure

```
src/
├── app/
│   ├── layout.tsx                 # root layout — fonts, RTL, ThemeProvider
│   ├── globals.css                # brand color tokens (light + dark), base styles
│   ├── sitemap.ts / robots.ts     # generated SEO files
│   ├── rss.xml/route.ts           # RSS feed
│   ├── login/                     # real username/password login (page.tsx + actions.ts)
│   ├── register/                  # reporter self-registration (page.tsx + actions.ts + submitted/)
│   ├── api/upload/                # file upload route (Vercel Blob)
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
│   └── dashboard/                  # internal panels, gated by RBAC (NOT a route group — "dashboard" is intentionally a real URL segment)
│       ├── layout.tsx              # sidebar + topbar, reads real session
│       ├── pulse-actions.ts        # shared pulse-update action (admin, or editor with "economy" as a beat)
│       ├── reporter/               # article creation + AI-assist -> creates a real PENDING_REVIEW Article
│       ├── editor/                 # review queue (edit/publish-now/schedule/reject), filtered to the editor's beat(s)
│       └── admin/                  # real stats, pending-reporter approval, editor create/edit/delete (multi-beat), user table, pulse editing
├── components/
│   ├── ui/                         # Button, Card, Badge, Tabs, Input, Select, Avatar, DropdownMenu…
│   ├── layout/                     # Navbar, Footer, Breadcrumb, ThemeToggle
│   ├── home/                       # HeroNews, PulseOfSociety, NewsSection, MostVisited, Newsletter
│   ├── news/                       # ArticleCard, ShareButtons, RelatedArticles, AuthorCard
│   ├── category/                   # shared CategoryPage template
│   ├── voice/                      # SubmissionForm, TrackingWidget
│   ├── login/, register/           # LoginForm, RegisterForm
│   ├── shared/                     # FileUpload (used by reporter cover image + voice attachments)
│   └── dashboard/                  # Sidebar, ArticleForm, ReviewQueue (+ inline edit), JalaliDateTimePicker, PendingReporters, CreateEditorForm, EditorsManager, BeatCheckboxGroup, PulseEditForm, UserTable, StatCard
├── lib/
│   ├── db.ts                       # Prisma client singleton
│   ├── content.ts                  # real article queries + reporter/editor workflow (create, edit, publish, schedule)
│   ├── pulse.ts                    # real "نبض جامعه" queries + admin/economy-editor edit support
│   ├── mock-data.ts                # CATEGORIES (fixed list) + SPECIAL_CASES (not migrated yet, starts empty)
│   ├── slugify.ts                  # URL slug generator for new articles (keeps Persian script)
│   ├── ai.ts                       # AI abstraction layer (stubs — see below)
│   ├── seo.ts                      # Metadata / OpenGraph / JSON-LD helpers
│   ├── auth.ts                     # client-safe RBAC helpers (hasRole, ROLE_LABELS_FA) — no server-only imports
│   ├── session.ts                  # server-only: reads/verifies the real session (uses next/headers)
│   ├── signed-cookie.ts            # HMAC session signing (Web Crypto — works on Node + Edge)
│   ├── passwords.ts                # bcrypt hashing
│   ├── rate-limit.ts               # in-memory fixed-window limiter
│   ├── logger.ts                   # structured logger
│   └── utils.ts                    # cn(), Persian number/date formatting, HTML-escaping
├── types/index.ts                  # NewsArticle, Author, SpecialCase, PulseItem, etc.
└── middleware.ts                   # RBAC gate for /dashboard/*, rate limiting for sensitive POSTs

prisma/
├── schema.prisma                   # User (approval workflow + multi-section editor beats), Article (plain categorySlug, no Category table), PulseItem, SpecialCase, VoiceSubmission
└── seed.ts                         # creates the initial admin account from ADMIN_USERNAME/ADMIN_PASSWORD
```

## Design system

Brand tokens live in `tailwind.config.ts` (`navy`, `orange`, `surface`, `ink`) and are re-expressed as HSL CSS variables in `src/app/globals.css` for light/dark theming. The one deliberately expressive element is **"نبض جامعه" (Pulse of Society)**: a small live-data grid with a subtle animated ECG-style sweep in its header, echoing the literal meaning of "pulse." Everything else is intentionally restrained — a calm reading surface for long-form journalism.

## What's mocked vs. real

| Area | Status | Where to plug in the real thing |
|---|---|---|
| Content (articles) | **Real** — reporters submit, editors review/edit/publish, public pages read from the database. See "Content workflow" below. | `src/lib/content.ts` |
| "نبض جامعه" (Pulse of Society) | **Real** — editable from the admin panel, or by an editor whose beat includes "economy". Starts as placeholders ("—") until someone fills in real numbers. | `src/lib/pulse.ts` |
| Categories (site sections) | Fixed, curated list — not database content, deliberately | `src/lib/mock-data.ts` (`CATEGORIES`) |
| پرونده‌های ویژه (Special Cases) | Not migrated yet — starts empty | `src/lib/mock-data.ts` (`SPECIAL_CASES`) |
| Accounts, login, registration, RBAC | **Real** — Postgres-backed, bcrypt-hashed passwords, signed session cookies. See "Authentication" above. | Optional upgrade path to NextAuth is noted in comments in `src/lib/session.ts` if you outgrow this |
| AI features (summarize, suggest title/tags/category, TTS, dedupe, SEO gen) | Deterministic stubs with real function signatures | `src/lib/ai.ts` — swap each function body for a real model call |
| Voice of People submissions | In-memory store (`src/lib/voice-store.ts`) | Swap for `db.voiceSubmission.*` once you want these persisted long-term |
| Captcha | Visual placeholder checkbox | Wire a real widget (e.g. Cloudflare Turnstile) in `submission-form.tsx` + verify the token server-side in `api/voice/submit/route.ts` |
| Image / file uploads | **Real** — `src/app/api/upload/route.ts` uploads to Vercel Blob | One-time setup on Vercel: **Storage tab → Create Database → Blob → Connect to Project** (auto-adds `BLOB_READ_WRITE_TOKEN` and redeploys) |

## Notes on RTL

The whole app is RTL by default (`dir="rtl"` on `<html>`). When you add an English locale later, prefer Tailwind's **logical** spacing utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`, `text-start`, `text-end`) over physical ones (`pl-*`, `pr-*`) so both directions render correctly without duplicated classes.

## Scripts

```bash
npm run dev          # start dev server
npm run build         # production build
npm run lint           # eslint
npm run db:generate    # prisma generate
npm run db:push        # push schema to the database
npm run db:seed         # create/update the initial admin account
npm run db:studio      # Prisma Studio
```
