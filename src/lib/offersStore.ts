import { prisma } from "@/lib/prisma";

export type OfferStatus = "submitted" | "rejected";

export type OfferRow = {
  id: string;
  sellerToken: string;
  createdAt: string;
  updatedAt: string;
  status: OfferStatus;
  description: string;
  priceUsd: number;
  payoutChain: "solana" | "ethereum";
  payoutAddr: string;
  tgOfferMsgId?: number | null;
  adminNote?: string | null;
};

export async function loadOffers(): Promise<OfferRow[]> {
  const offers = await prisma.offer.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      sellerToken: true,
      createdAt: true,
      updatedAt: true,
      status: true,
      description: true,
      priceUsd: true,
      payoutChain: true,
      payoutAddr: true,
      tgOfferMsgId: true,
    },
  });

  return offers.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    status: (o.status === "rejected" ? "rejected" : "submitted") as OfferStatus,
    payoutChain: o.payoutChain === "ethereum" ? "ethereum" : "solana",
  }));
}

export async function getOffer(id: string): Promise<OfferRow | null> {
  const o = await prisma.offer.findUnique({
    where: { id },
    select: {
      id: true,
      sellerToken: true,
      createdAt: true,
      updatedAt: true,
      status: true,
      description: true,
      priceUsd: true,
      payoutChain: true,
      payoutAddr: true,
      tgOfferMsgId: true,
    },
  });
  if (!o) return null;
  return {
    ...o,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    status: (o.status === "rejected" ? "rejected" : "submitted") as OfferStatus,
    payoutChain: o.payoutChain === "ethereum" ? "ethereum" : "solana",
  };
}

export async function updateOffer(
  id: string,
  patch: Partial<Pick<OfferRow, "status" | "adminNote">>
): Promise<OfferRow | null> {
  const updated = await prisma.offer
    .update({
      where: { id },
      data: {
        status: patch.status,
      },
      select: {
        id: true,
        sellerToken: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        description: true,
        priceUsd: true,
        payoutChain: true,
        payoutAddr: true,
        tgOfferMsgId: true,
      },
    })
    .catch(() => null);

  if (!updated) return null;
  return {
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    status: (updated.status === "rejected" ? "rejected" : "submitted") as OfferStatus,
    payoutChain: updated.payoutChain === "ethereum" ? "ethereum" : "solana",
  };
}

export async function deleteOffer(id: string): Promise<boolean> {
  const ok = await prisma.offer
    .delete({
      where: { id },
    })
    .then(() => true)
    .catch(() => false);
  return ok;
}
