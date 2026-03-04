import { promises as fs } from "fs";
import path from "path";

export type ChatMsg = {
  id: string;
  at: string;
  from: "seller" | "admin";
  text: string;
};

const DATA_DIR = path.join(process.cwd(), "data");

export async function loadMessages(offerId: string): Promise<ChatMsg[]> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const p = path.join(DATA_DIR, `chat_${offerId}.json`);
  try {
    const raw = await fs.readFile(p, "utf8");
    const arr = JSON.parse(raw) as ChatMsg[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function appendMessage(offerId: string, msg: ChatMsg): Promise<void> {
  const arr = await loadMessages(offerId);
  arr.push(msg);
  const p = path.join(DATA_DIR, `chat_${offerId}.json`);
  await fs.writeFile(p, JSON.stringify(arr, null, 2), "utf8");
}

export async function deleteChat(offerId: string): Promise<void> {
  const p = path.join(DATA_DIR, `chat_${offerId}.json`);
  try {
    await fs.unlink(p);
  } catch {
    // ignore
  }
}
