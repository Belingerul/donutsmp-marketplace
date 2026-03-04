import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { sqlite } from "@/lib/drizzle";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { setSession } from "@/lib/auth";

export const runtime = "nodejs";

const db = drizzle(sqlite);

const Body = z.object({
  handle: z.string().min(3).max(32),
  password: z.string().min(1).max(100),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid" }, { status: 400 });

  const { handle, password } = parsed.data;
  const u = db.select().from(users).where(eq(users.handle, handle)).get();
  if (!u) return NextResponse.json({ ok: false, error: "Bad credentials" }, { status: 401 });

  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) return NextResponse.json({ ok: false, error: "Bad credentials" }, { status: 401 });

  const adminHandle = (process.env.ADMIN_HANDLE || "").trim();
  const role = (u.role === "admin" || (adminHandle && u.handle.toLowerCase() === adminHandle.toLowerCase())) ? "admin" : "seller";
  await setSession({ uid: u.id, role, handle: u.handle });
  return NextResponse.json({ ok: true, role });
}
