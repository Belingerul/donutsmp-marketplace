import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { clearActiveOffer, getActiveOffer, setActiveOffer } from "@/lib/activeOfferStore";
import { getOffer } from "@/lib/offersStore";

export const runtime = "nodejs";

export async function GET() {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ ok: true, link: null });

  const link = await getActiveOffer(sess.uid);
  if (!link) return NextResponse.json({ ok: true, link: null });

  // If offer was deleted, clear stale link.
  const offer = await getOffer(link.offerId);
  if (!offer) {
    await clearActiveOffer(sess.uid);
    return NextResponse.json({ ok: true, link: null });
  }

  return NextResponse.json({ ok: true, link });
}

const Body = z.object({
  offerId: z.string().min(3),
  sellerToken: z.string().min(3),
});

export async function POST(req: Request) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid" }, { status: 400 });

  await setActiveOffer(sess.uid, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  await clearActiveOffer(sess.uid);
  return NextResponse.json({ ok: true });
}
