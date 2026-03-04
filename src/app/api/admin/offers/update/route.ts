import { NextResponse } from "next/server";
import { z } from "zod";
import { updateOffer } from "@/lib/offersStore";

export const runtime = "nodejs";

const Body = z.object({
  id: z.string().min(3),
  status: z.enum(["submitted", "rejected"]).optional(),
  adminNote: z.string().max(1000).optional().nullable(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const sess = await (await import("@/lib/auth")).getSession();
  if (!sess || sess.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const updated = await updateOffer(parsed.data.id, {
    status: parsed.data.status,
    adminNote: parsed.data.adminNote ?? undefined,
  });

  if (!updated) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, offer: updated });
}
