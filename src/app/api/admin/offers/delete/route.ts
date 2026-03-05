import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteOffer, getOffer } from "@/lib/offersStore";
import { deleteChat } from "@/lib/messagesStore";
import { clearActiveOfferByOfferId } from "@/lib/activeOfferStore";
import { tgDelete, tgNotify } from "@/lib/telegram";

export const runtime = "nodejs";

const Body = z.object({
  id: z.string().min(3),
});

export async function POST(req: Request) {
  const sess = await (await import("@/lib/auth")).getSession();
  if (!sess || sess.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const before = await getOffer(parsed.data.id);

  const ok = await deleteOffer(parsed.data.id);
  if (ok) {
    await deleteChat(parsed.data.id);
    await clearActiveOfferByOfferId(parsed.data.id);

    // Remove the original "new offer" Telegram message if we have it.
    if (before?.tgOfferMsgId) {
      await tgDelete(before.tgOfferMsgId);
    } else {
      await tgNotify(`✅ Offer deleted (done)\nOffer ID: ${parsed.data.id}`);
    }
  }
  return NextResponse.json({ ok });
}
