import { prisma } from "@/lib/prisma";

export type ChatMsg = {
  id: string;
  at: string;
  from: "seller" | "admin";
  text: string;
};

export async function loadMessages(offerId: string): Promise<ChatMsg[]> {
  const msgs = await prisma.message.findMany({
    where: { offerId },
    orderBy: { createdAt: "asc" },
    select: { id: true, createdAt: true, from: true, text: true },
  });

  return msgs.map((m) => ({
    id: m.id,
    at: m.createdAt.toISOString(),
    from: m.from === "admin" ? "admin" : "seller",
    text: m.text,
  }));
}

export async function appendMessage(offerId: string, msg: ChatMsg): Promise<void> {
  await prisma.message.create({
    data: {
      id: msg.id,
      offerId,
      from: msg.from,
      text: msg.text,
      createdAt: new Date(msg.at),
    },
  });
}

export async function deleteChat(offerId: string): Promise<void> {
  await prisma.message.deleteMany({ where: { offerId } });
}
