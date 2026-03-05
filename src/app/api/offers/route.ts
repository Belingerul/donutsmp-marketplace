import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { getSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { isEvmAddress, isSolanaAddress } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// NOTE: Keep seller form minimal.
const MIN_M = 175;

const OfferCreate = z.object({
  description: z.string().min(1).max(500), // e.g. "250M"
  priceUsd: z.number().int().min(0).max(1_000_000), // cents
  payoutChain: z.enum(["solana", "ethereum"]),
  payoutAddr: z.string().min(10).max(120),
});

export async function POST(req: Request) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "unknown";
  const rl = rateLimit(`offer:${sess.uid}:${ip}`, { capacity: 5, refillPerSec: 0.1 }); // burst 5, ~1 per 10s
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = OfferCreate.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const v = parsed.data;

  // Validate payout address format
  const addrOk = v.payoutChain === "ethereum" ? isEvmAddress(v.payoutAddr) : isSolanaAddress(v.payoutAddr);
  if (!addrOk) {
    return NextResponse.json({ ok: false, error: "Invalid payout address" }, { status: 400 });
  }

  // Enforce minimum amount from description like "250M"
  const m = /^\s*(\d{1,6})\s*M\s*$/i.exec(v.description);
  if (!m) return NextResponse.json({ ok: false, error: "Invalid amount format" }, { status: 400 });
  const amountM = Number(m[1]);
  if (!Number.isFinite(amountM) || amountM < MIN_M) {
    return NextResponse.json({ ok: false, error: `Minimum is ${MIN_M}M` }, { status: 400 });
  }

  // lock: one active offer per user (until admin deletes it)
  const active = await prisma.activeOffer.findUnique({ where: { userId: sess.uid } });
  if (active) {
    return NextResponse.json(
      { ok: false, error: "You already have an active offer. Open Chat." },
      { status: 409 }
    );
  }

  // lock: one active offer per payout address (basic spam protection)
  const existing = await prisma.offer.findFirst({
    where: { payoutAddr: v.payoutAddr, status: "submitted" },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { ok: false, error: "This wallet already has an active offer." },
      { status: 409 }
    );
  }

  const sellerToken = nanoid(24);

  const offer = await prisma.offer.create({
    data: {
      id: nanoid(12),
      sellerId: sess.uid,
      status: "submitted",
      description: `${amountM}M`,
      priceUsd: v.priceUsd,
      payoutChain: v.payoutChain,
      payoutAddr: v.payoutAddr,
      sellerToken,
    },
    select: { id: true, sellerToken: true },
  });

  await prisma.activeOffer.create({
    data: {
      userId: sess.uid,
      offerId: offer.id,
      sellerToken: offer.sellerToken,
    },
  });

  return NextResponse.json({ ok: true, offer });
}
