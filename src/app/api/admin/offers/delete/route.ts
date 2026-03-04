import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteOffer } from "@/lib/offersStore";
import { deleteChat } from "@/lib/messagesStore";
import { clearActiveOfferByOfferId } from "@/lib/activeOfferStore";

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

  const ok = await deleteOffer(parsed.data.id);
  if (ok) {
    await deleteChat(parsed.data.id);
    await clearActiveOfferByOfferId(parsed.data.id);
  }
  return NextResponse.json({ ok });
}
