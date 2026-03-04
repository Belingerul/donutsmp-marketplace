import OfferChatClient from "./ui";
import { getOffer } from "@/lib/offersStore";
import { loadMessages } from "@/lib/messagesStore";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function OfferPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = (await searchParams) || {};
  const tRaw = sp.t;
  const t = Array.isArray(tRaw) ? tRaw[0] : tRaw || "";

  const offer = await getOffer(id);
  if (!offer) return <div className="p-6 text-zinc-200">Offer not found.</div>;

  const sess = await getSession();
  const isAdmin = !!sess && sess.role === "admin";
  const isSeller = !!t && t === offer.sellerToken;

  if (!isSeller && !isAdmin) {
    return <div className="p-6 text-zinc-200">Forbidden.</div>;
  }

  const messages = await loadMessages(id);

  return (
    <OfferChatClient
      offerId={id}
      token={isSeller ? t : ""}
      mode={isAdmin ? "admin" : "seller"}
      initialMessages={messages}
    />
  );
}
