import { db } from "@/lib/db";

export interface AdBanner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  order: number;
}

function mapAd(ad: {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  order: number;
}): AdBanner {
  return {
    id: ad.id,
    title: ad.title,
    imageUrl: ad.imageUrl,
    linkUrl: ad.linkUrl,
    isActive: ad.isActive,
    order: ad.order,
  };
}

/** Public — active ads only, in display order. Used by the homepage "تبلیغات" box. */
export async function getActiveAds(): Promise<AdBanner[]> {
  const ads = await db.advertisement.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return ads.map(mapAd);
}

/** Admin panel — every ad, active or not. */
export async function getAllAds(): Promise<AdBanner[]> {
  const ads = await db.advertisement.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  return ads.map(mapAd);
}

export interface CreateAdInput {
  title: string;
  imageUrl: string;
  linkUrl: string;
}

export async function createAd(input: CreateAdInput) {
  const highest = await db.advertisement.aggregate({ _max: { order: true } });
  return db.advertisement.create({
    data: {
      title: input.title,
      imageUrl: input.imageUrl,
      linkUrl: input.linkUrl,
      order: (highest._max.order ?? 0) + 1,
    },
  });
}

export async function setAdActive(id: string, isActive: boolean) {
  await db.advertisement.update({ where: { id }, data: { isActive } });
}

export async function deleteAd(id: string) {
  await db.advertisement.delete({ where: { id } });
}

/** Swaps `order` with the previous/next ad so the admin can reorder the stack with up/down buttons. */
export async function reorderAd(id: string, direction: "up" | "down") {
  const ads = await db.advertisement.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  const index = ads.findIndex((a) => a.id === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= ads.length) return;

  const current = ads[index]!;
  const neighbor = ads[swapIndex]!;

  await db.$transaction([
    db.advertisement.update({ where: { id: current.id }, data: { order: neighbor.order } }),
    db.advertisement.update({ where: { id: neighbor.id }, data: { order: current.order } }),
  ]);
}
