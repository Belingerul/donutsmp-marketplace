import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { getOffer } from "@/lib/offersStore";
import { appendMessage, loadMessages, type ChatMsg } from "@/lib/messagesStore";
import { tgNotify } from "@/lib/telegram";

export const runtime = "nodejs";

function isSellerToken(offer: { sellerToken: string }, token: string): boolean {
  return !!token && token === offer.sellerToken;
}

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const t = url.searchParams.get("t") || "";

  const offer = await getOffer(id);
  if (!offer) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  // Allow admin via session, seller via token
  const sess = await (await import("@/lib/auth")).getSession();
  const isAdmin = !!sess && sess.role === "admin";
  const isSeller = isSellerToken(offer, t);
  if (!isAdmin && !isSeller) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const messages = await loadMessages(id);
  return NextResponse.json({ ok: true, messages });
}

const Body = z.object({
  t: z.string().optional(),
  text: z.string().min(1).max(1500),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid" }, { status: 400 });

  const offer = await getOffer(id);
  if (!offer) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const sess = await (await import("@/lib/auth")).getSession();
  const isAdmin = !!sess && sess.role === "admin";
  const isSeller = isSellerToken(offer, parsed.data.t || "");

  const who: "seller" | "admin" | null = isAdmin ? "admin" : isSeller ? "seller" : null;
  if (!who) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const msg: ChatMsg = {
    id: nanoid(10),
    at: new Date().toISOString(),
    from: who,
    text: parsed.data.text,
  };

  await appendMessage(id, msg);

  // Notify admin (avoid dumping huge messages)
  const preview = msg.text.length > 200 ? msg.text.slice(0, 200) + "…" : msg.text;
  await tgNotify(
    `💬 New message (${msg.from})\n` +
      `Offer: ${id}\n` +
      `From: ${msg.from}\n` +
      `Text: ${preview}`
  );

  return NextResponse.json({ ok: true });
}
