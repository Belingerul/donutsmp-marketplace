import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const Body = z.object({
  handle: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6).max(100),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimit(`signup:${ip}`, { capacity: 5, refillPerSec: 0.05 }); // burst 5, ~1 per 20s
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, error: "Too many attempts" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const json = await req.json().catch(() => null);
    const parsed = Body.safeParse(json);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid" }, { status: 400 });

    const { handle, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { handle } });
    if (existing) return NextResponse.json({ ok: false, error: "Handle taken" }, { status: 409 });

    const id = nanoid(12);
    const passwordHash = await bcrypt.hash(password, 10);

    const adminHandle = (process.env.ADMIN_HANDLE || "").trim();
    const role = adminHandle && handle.toLowerCase() === adminHandle.toLowerCase() ? "admin" : "seller";

    await prisma.user.create({
      data: {
        id,
        createdAt: new Date(),
        handle,
        passwordHash,
        role,
      },
    });

    await setSession({ uid: id, role: role === "admin" ? "admin" : "seller", handle });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: "Server error", detail: msg }, { status: 500 });
  }
}
