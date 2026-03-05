type TgSendMessageResp = { ok: true; result: { message_id: number } } | { ok: false; description?: string };

export async function tgNotify(text: string): Promise<number | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN || "";
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID || "";
  if (!token || !chatId) return null;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });
    const j = (await r.json()) as TgSendMessageResp;
    if ((j as any).ok && (j as any).result?.message_id) return (j as any).result.message_id as number;
    return null;
  } catch {
    return null;
  }
}

export async function tgDelete(messageId: number): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN || "";
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID || "";
  if (!token || !chatId) return false;

  const url = `https://api.telegram.org/bot${token}/deleteMessage`;
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
    });
    const j = (await r.json()) as { ok?: boolean };
    return !!j?.ok;
  } catch {
    return false;
  }
}
