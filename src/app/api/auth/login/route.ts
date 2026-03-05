import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/auth";

export const runtime = "nodejs";

const Body = z.object({
  handle: z.string().min(3).max(32),
  password: z.string().min(1).max(100),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = Body.safeParse(json);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid" }, { status: 400 });

    const { handle, password } = parsed.data;
    const u = await prisma.user.findUnique({ where: { handle } });
    if (!u) return NextResponse.json({ ok: false, error: "Bad credentials" }, { status: 401 });

    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) return NextResponse.json({ ok: false, error: "Bad credentials" }, { status: 401 });

    const adminHandle = (process.env.ADMIN_HANDLE || "").trim();
    const role = (u.role === "admin" || (adminHandle && u.handle.toLowerCase() === adminHandle.toLowerCase())) ? "admin" : "seller";
    await setSession({ uid: u.id, role, handle: u.handle });
    return NextResponse.json({ ok: true, role });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: "Server error", detail: msg }, { status: 500 });
  }
}
