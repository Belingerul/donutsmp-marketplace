"use client";

import { useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";

export default function Home() {
  const MIN_M = 175;
  const [amountM, setAmountM] = useState<number | "">(MIN_M);
  const [payoutChain, setPayoutChain] = useState<"solana" | "ethereum">("solana");
  const [payoutAddr, setPayoutAddr] = useState("");

  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "sending" }
    | { kind: "ok"; id: string; chatUrl?: string }
    | { kind: "err"; msg: string }
  >({ kind: "idle" });

  const [chatUrl, setChatUrl] = useState<string>("");
  const [authed, setAuthed] = useState(false);

  // Restore chat link after refresh.
  useEffect(() => {
    (async () => {
      try {
        const meR = await fetch("/api/auth/me", { cache: "no-store" });
        const meJ: unknown = await meR.json();
        const me = meJ as { ok?: boolean; user?: unknown | null };
        setAuthed(!!me?.user);

        const saved = localStorage.getItem("pm_chatUrl") || "";
        if (saved) setChatUrl(saved);

        // If logged in, prefer server-linked offer
        if (me?.user) {
          const r = await fetch("/api/me/active-offer", { cache: "no-store" });
          const j: unknown = await r.json();
          const data = j as { link?: { offerId?: string; sellerToken?: string } | null };
          const link = data?.link;
          if (link && typeof link.offerId === "string" && typeof link.sellerToken === "string") {
            const u = new URL(window.location.href);
            u.pathname = `/offer/${link.offerId}`;
            u.searchParams.set("t", link.sellerToken);
            const url = u.toString();
            localStorage.setItem("pm_chatUrl", url);
            setChatUrl(url);
          }
        }
      } catch {
        setAuthed(false);
      }
    })();
  }, []);

  // If admin deletes the offer, automatically unlock seller UI (no logout needed)
  useEffect(() => {
    if (!authed || !chatUrl) return;
    const id = setInterval(async () => {
      try {
        const r = await fetch("/api/me/active-offer", { cache: "no-store" });
        const j: unknown = await r.json();
        const data = j as { link?: { offerId?: string; sellerToken?: string } | null };
        const link = data?.link;
        if (!link) {
          localStorage.removeItem("pm_chatUrl");
          setChatUrl("");
          setStatus({ kind: "idle" });
        }
      } catch {
        // ignore
      }
    }, 2500);
    return () => clearInterval(id);
  }, [authed, chatUrl]);

  async function submit() {
    setStatus({ kind: "sending" });
    try {
      const m0 = typeof amountM === "number" ? amountM : 0;
      const m = Math.max(MIN_M, m0);
      const priceUsd = Math.max(0, Math.round((m / 250) * 5 * 100)); // cents
      const description = `${m}M`;

      if (!authed) throw new Error("Sign in to submit an offer.");
      if (chatUrl) throw new Error("You already have an active offer. Open Chat.");

      const r = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          priceUsd,
          payoutChain,
          payoutAddr,
        }),
      });
      const j: unknown = await r.json();
      const data = j as { ok?: boolean; error?: string; offer?: { id: string; sellerToken?: string } };
      if (!r.ok || !data.ok || !data.offer?.id) throw new Error(data?.error || "Request failed");

      let nextChatUrl = "";
      if (data.offer.sellerToken) {
        const u = new URL(window.location.href);
        u.pathname = `/offer/${data.offer.id}`;
        u.searchParams.set("t", data.offer.sellerToken);
        nextChatUrl = u.toString();

        // Persist on this device
        localStorage.setItem("pm_chatUrl", nextChatUrl);

        // Persist to account if logged in (best-effort)
        fetch("/api/me/active-offer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offerId: data.offer.id, sellerToken: data.offer.sellerToken }),
        }).catch(() => null);
      }

      setChatUrl(nextChatUrl);
      setStatus({ kind: "ok", id: data.offer.id, chatUrl: nextChatUrl || undefined });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatus({ kind: "err", msg });
    }
  }

  return (
    <main className="min-h-dvh bg-[#05060a] text-zinc-100 flex items-stretch sm:items-center">
      <div className="mx-auto w-full max-w-4xl lg:max-w-6xl 2xl:max-w-7xl px-2 sm:px-4 py-3 sm:py-6">
        <div className="relative overflow-hidden rounded-[28px] border border-zinc-800 bg-gradient-to-b from-zinc-950/80 to-black/40 p-4 sm:p-6 lg:p-8 min-h-[calc(100dvh-1.5rem)] sm:min-h-0 lg:min-h-[calc(100vh-3rem)] flex flex-col">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-fuchsia-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
          <SiteHeader />


          <div className="mt-8 flex-1 flex flex-col justify-center">
            <div className="mt-4 text-center text-xs text-zinc-500">
              <a className="underline" href="/terms">Terms</a> • <a className="underline" href="/privacy">Privacy</a>
            </div>
            <div className="grid gap-4 lg:gap-6 lg:grid-cols-2 lg:items-start">
            <label className="grid gap-1">
              <span className="text-sm lg:text-base font-semibold text-zinc-200">Your payout wallet</span>
              <input
                className="h-14 lg:h-16 rounded-2xl border border-zinc-800 bg-black/40 px-4 font-mono text-sm sm:text-base lg:text-lg"
                value={payoutAddr}
                onChange={(e) => setPayoutAddr(e.target.value)}
                placeholder={payoutChain === "solana" ? "Solana address" : "0x... Ethereum address"}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-sm lg:text-base font-semibold text-zinc-200">Chain</span>
                <select
                  className="h-14 lg:h-16 rounded-2xl border border-zinc-800 bg-black/40 px-4 text-base lg:text-lg"
                  value={payoutChain}
                  onChange={(e) => setPayoutChain(e.target.value === "ethereum" ? "ethereum" : "solana")}
                >
                  <option value="solana">Solana</option>
                  <option value="ethereum">Ethereum</option>
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-sm lg:text-base font-semibold text-zinc-200">Amount (M) — min {MIN_M}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  className="h-14 lg:h-16 rounded-2xl border border-zinc-800 bg-black/40 px-4 text-base lg:text-lg"
                  value={amountM}
                  step={50}
                  min={0}
                  placeholder="175"
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") return setAmountM("");
                    const n = Math.max(0, Math.round(Number(raw)));
                    setAmountM(Number.isFinite(n) ? n : "");
                  }}
                  onBlur={() => {
                    const v = typeof amountM === "number" ? amountM : 0;
                    if (v < MIN_M) setAmountM(MIN_M);
                  }}
                />
              </label>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black/35 p-4 lg:p-6 text-base lg:text-lg text-zinc-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-zinc-400">Rate:</span>
                <span className="font-semibold text-zinc-100">250M = $5</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">You’ll receive:</span>
                <span className="font-bold text-zinc-100 text-lg lg:text-2xl">
                  ${(((typeof amountM === "number" ? amountM : 0) / 250) * 5).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 lg:gap-4">
              <button
                onClick={submit}
                disabled={status.kind === "sending" || !!chatUrl || !authed}
                className="h-14 lg:h-16 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 px-8 text-base lg:text-lg font-semibold shadow-[0_10px_30px_rgba(168,85,247,0.18)] disabled:opacity-60"
              >
                {!!chatUrl
                  ? "Offer active"
                  : !authed
                    ? "Sign in to submit"
                    : status.kind === "sending"
                      ? "Submitting…"
                      : "Submit"}
              </button>

              <a
                href={(status.kind === "ok" && status.chatUrl) || chatUrl ? (status.kind === "ok" && status.chatUrl ? status.chatUrl : chatUrl) : "#"}
                onClick={(e) => {
                  const ok = (status.kind === "ok" && status.chatUrl) || chatUrl;
                  if (!ok) e.preventDefault();
                }}
                className={[
                  "h-14 lg:h-16 rounded-2xl border border-zinc-800 px-6 text-base lg:text-lg font-semibold inline-flex items-center justify-center transition",
                  (status.kind === "ok" && status.chatUrl) || chatUrl
                    ? "bg-gradient-to-r from-cyan-500/25 to-fuchsia-600/25 text-zinc-100 shadow-[0_10px_30px_rgba(34,211,238,0.12)]"
                    : "bg-black/25 text-zinc-500 opacity-70",
                ].join(" ")}
              >
                Chat
              </a>
            </div>

            {status.kind === "ok" ? (
              <div className="mt-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
                Submitted. Offer id: <span className="font-mono">{status.id}</span>
                {status.chatUrl ? (
                  <div className="mt-2 text-xs text-emerald-200/90">Open chat to confirm details.</div>
                ) : null}
              </div>
            ) : null}
            {status.kind === "err" ? (
              <div className="mt-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm">
                {status.msg}
              </div>
            ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
