import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { sqlite } from "@/lib/drizzle";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { setSession } from "@/lib/auth";

export const runtime = "nodejs";

const db = drizzle(sqlite);

const Body = z.object({
  handle: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6).max(100),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid" }, { status: 400 });

  const { handle, password } = parsed.data;

  const existing = db.select().from(users).where(eq(users.handle, handle)).get();
  if (existing) return NextResponse.json({ ok: false, error: "Handle taken" }, { status: 409 });

  const id = nanoid(12);
  const passwordHash = await bcrypt.hash(password, 10);

  const adminHandle = (process.env.ADMIN_HANDLE || "").trim();
  const role = adminHandle && handle.toLowerCase() === adminHandle.toLowerCase() ? "admin" : "seller";

  db.insert(users)
    .values({
      id,
      createdAt: new Date(),
      handle,
      passwordHash,
      role,
    })
    .run();

  await setSession({ uid: id, role: role === "admin" ? "admin" : "seller", handle });
  return NextResponse.json({ ok: true });
}
