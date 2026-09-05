import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

// Re-check the database at most once per minute for every page under this
// layout (home, category pages, article pages, tag pages, etc). Without
// this, a scheduled article never becomes visible on its own once its
// publish time arrives — the cached page just keeps serving what it looked
// like before, since nothing ever tells Next.js to re-render it. Explicit
// actions (publishing now, editing, etc.) already call `revalidatePath`
// for instant updates; this covers the "time alone made it due" case.
export const revalidate = 60;

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
