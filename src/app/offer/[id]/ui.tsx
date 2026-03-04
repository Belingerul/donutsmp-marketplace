"use client";

import { useEffect, useRef, useState } from "react";

type ChatMsg = { id: string; at: string; from: "seller" | "admin"; text: string };

export default function OfferChatClient({
  offerId,
  token,
  mode,
  initialMessages,
}: {
  offerId: string;
  token: string;
  mode: "seller" | "admin";
  initialMessages: ChatMsg[];
}) {
  const [messages, setMessages] = useState<ChatMsg[]>(initialMessages);
  const [text, setText] = useState("");
  const [err, setErr] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  async function refresh(showError = false) {
    try {
      const url = token ? `/api/chat/${offerId}?t=${encodeURIComponent(token)}` : `/api/chat/${offerId}`;
      const r = await fetch(url, { cache: "no-store" });
      const j = (await r.json()) as { ok: boolean; messages?: ChatMsg[]; error?: string };
      if (!r.ok || !j.ok) throw new Error(j.error || "Failed");
      setMessages(j.messages || []);
    } catch (e: unknown) {
      if (showError) setErr(e instanceof Error ? e.message : String(e));
    }
  }

  async function send() {
    const v = text.trim();
    if (!v) return;
    setLoading(true);
    setErr("");
    try {
      const r = await fetch(`/api/chat/${offerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(token ? { t: token, text: v } : { text: v }),
      });
      const j = (await r.json()) as { ok: boolean; error?: string };
      if (!r.ok || !j.ok) throw new Error(j.error || "Failed");
      setText("");
      await refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <main className="min-h-dvh bg-[#05060a] text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/60 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-2xl font-extrabold">Chat</div>
              <div className="text-sm text-zinc-400">Offer: {offerId} • You are: {mode}</div>
            </div>
            <button
              onClick={() => refresh(true)}
              className="h-10 rounded-2xl border border-zinc-800 bg-black/40 px-4 text-sm"
            >
              Refresh
            </button>
          </div>

          <div className="mt-4 h-[55vh] overflow-auto rounded-2xl border border-zinc-800 bg-black/30 p-3">
            <div className="space-y-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.from === mode
                      ? "ml-auto max-w-[85%] rounded-2xl bg-gradient-to-r from-fuchsia-600/30 to-cyan-500/20 border border-zinc-700 p-3"
                      : "mr-auto max-w-[85%] rounded-2xl border border-zinc-800 bg-zinc-950/40 p-3"
                  }
                >
                  <div className="text-[11px] text-zinc-400">{m.from} • {new Date(m.at).toLocaleString()}</div>
                  <div className="mt-1 text-sm whitespace-pre-wrap">{m.text}</div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              className="h-12 flex-1 rounded-2xl border border-zinc-800 bg-black/40 px-4"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Message"
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
            />
            <button
              onClick={send}
              disabled={loading}
              className="h-12 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 px-5 text-sm font-semibold disabled:opacity-60"
            >
              Send
            </button>
          </div>
          {err ? <div className="mt-2 text-sm text-red-300">{err}</div> : null}
        </div>
      </div>
    </main>
  );
}
