import { NextResponse } from "next/server";
import { loadOffers } from "@/lib/offersStore";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const sess = await (await import("@/lib/auth")).getSession();
  if (!sess || sess.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const offers = await loadOffers();
  offers.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return NextResponse.json({ ok: true, offers });
}
