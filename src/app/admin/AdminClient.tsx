"use client";

import { useState } from "react";

export type OfferRow = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  description: string;
  priceUsd: number;
  payoutChain: string;
  payoutAddr: string;
  adminNote?: string | null;
};

function usd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function AdminClient({
  initialOffers,
}: {
  initialToken: string;
  initialOffers: OfferRow[];
}) {
  const [offers, setOffers] = useState<OfferRow[]>(initialOffers);
  const [err, setErr] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch(`/api/admin/offers`, { cache: "no-store" });
      const j: unknown = await r.json();
      const data = j as { ok?: boolean; error?: string; offers?: OfferRow[] };
      if (!r.ok || !data.ok) throw new Error(data.error || "Forbidden");
      setOffers(data.offers || []);
    } catch (e: unknown) {
      setOffers([]);
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function saveOffer(o: OfferRow, patch: Partial<Pick<OfferRow, "status" | "adminNote">>) {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch(`/api/admin/offers/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: o.id, ...patch }),
      });
      const j: unknown = await r.json();
      const data = j as { ok?: boolean; error?: string };
      if (!r.ok || !data.ok) throw new Error(data.error || "Save failed");
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function deleteOne(o: OfferRow) {
    const ok = confirm(`Delete offer ${o.id}?`);
    if (!ok) return;

    setLoading(true);
    setErr("");
    try {
      const r = await fetch(`/api/admin/offers/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: o.id }),
      });
      const j: unknown = await r.json();
      const data = j as { ok?: boolean; error?: string };
      if (!r.ok || !data.ok) throw new Error(data.error || "Delete failed");
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="min-h-dvh bg-[#07070a] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-2xl font-extrabold">Admin</div>
            <div className="text-sm text-zinc-400">Approve/reject offers and delete when done.</div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
          <div className="text-xs text-zinc-400">Admin</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={() => load()}
              className="h-11 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 px-5 text-sm font-semibold"
            >
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
          {err ? <div className="mt-2 text-sm text-red-300">{err}</div> : null}
        </div>

        <div className="mt-6 grid gap-3">
          {offers.map((o) => (
            <div key={o.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold">{o.description}</div>
                <div className="text-sm font-bold">{usd(o.priceUsd)}</div>
              </div>

              <div className="mt-1 text-xs text-zinc-400">
                {o.payoutChain} • <span className="text-zinc-200 font-semibold">{o.status}</span>
              </div>

              <div className="mt-2 text-xs">
                Payout addr: <span className="font-mono break-all text-zinc-200">{o.payoutAddr}</span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => saveOffer(o, { status: o.status === "rejected" ? "submitted" : "rejected" })}
                  className="h-11 rounded-2xl border border-zinc-800 bg-black/40 px-4 text-sm text-zinc-200"
                >
                  {o.status === "rejected" ? "Unreject" : "Reject"}
                </button>

                <button
                  onClick={() => deleteOne(o)}
                  className="h-11 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 text-sm text-red-200"
                >
                  Delete (done)
                </button>

                <a
                  className="ml-auto h-11 inline-flex items-center rounded-2xl border border-zinc-800 bg-black/40 px-4 text-sm"
                  href={`/offer/${o.id}`}
                >
                  Chat
                </a>
                <div className="text-[11px] text-zinc-600">id: {o.id}</div>
              </div>
            </div>
          ))}

          {!offers.length && !err ? (
            <div className="text-sm text-zinc-500">No offers yet.</div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
