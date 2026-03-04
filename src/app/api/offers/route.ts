import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { addOffer, findActiveOfferByPayoutAddr, type OfferRow } from "@/lib/offersStore";
import { getSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { isEvmAddress, isSolanaAddress } from "@/lib/validators";

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

  // lock: one active offer per payout address (until admin deletes it)
  const existing = await findActiveOfferByPayoutAddr(v.payoutAddr);
  if (existing) {
    return NextResponse.json(
      {
        ok: false,
        error: "You already have an active offer. Wait until it is deleted.",
        offerId: existing.id,
      },
      { status: 409 }
    );
  }

  const now = new Date().toISOString();
  const sellerToken = nanoid(24);
  const offer: OfferRow = {
    id: nanoid(12),
    sellerToken,
    createdAt: now,
    updatedAt: now,
    status: "submitted",
    description: `${amountM}M`,
    priceUsd: v.priceUsd,
    payoutChain: v.payoutChain,
    payoutAddr: v.payoutAddr,
    adminNote: null,
  };

  await addOffer(offer);
  return NextResponse.json({ ok: true, offer: { id: offer.id, sellerToken } });
}
