import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ ok: true, user: null });
  return NextResponse.json({ ok: true, user: sess });
}
