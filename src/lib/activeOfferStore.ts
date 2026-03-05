import { prisma } from "@/lib/prisma";

export type ActiveOfferLink = { offerId: string; sellerToken: string };

export async function setActiveOffer(userId: string, link: ActiveOfferLink) {
  await prisma.activeOffer.upsert({
    where: { userId },
    create: { userId, offerId: link.offerId, sellerToken: link.sellerToken },
    update: { offerId: link.offerId, sellerToken: link.sellerToken },
  });
}

export async function getActiveOffer(userId: string): Promise<ActiveOfferLink | null> {
  const row = await prisma.activeOffer.findUnique({
    where: { userId },
    select: { offerId: true, sellerToken: true },
  });
  return row ? { offerId: row.offerId, sellerToken: row.sellerToken } : null;
}

export async function clearActiveOffer(userId: string) {
  await prisma.activeOffer.delete({ where: { userId } }).catch(() => null);
}

export async function clearActiveOfferByOfferId(offerId: string) {
  await prisma.activeOffer.deleteMany({ where: { offerId } });
}
