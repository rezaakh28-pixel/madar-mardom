import { AdsManager } from "@/components/dashboard/ads-manager";
import { getAllAds } from "@/lib/ads";

export default async function AdminAdsPage() {
  let ads: Awaited<ReturnType<typeof getAllAds>> = [];
  let dbError = false;

  try {
    ads = await getAllAds();
  } catch {
    dbError = true;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-extrabold text-foreground">تبلیغات</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          تبلیغات فعال، در همین ترتیب، در باکس «تبلیغات» زیر «پربازدیدترین‌ها» در صفحه اصلی سایت نمایش داده می‌شوند.
        </p>
      </header>

      {dbError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          اتصال به پایگاه‌داده برقرار نیست.
        </p>
      ) : (
        <AdsManager ads={ads} />
      )}
    </div>
  );
}
