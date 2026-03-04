import AdminClient, { type OfferRow } from "./AdminClient";
import { loadOffers } from "@/lib/offersStore";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const sess = await getSession();
  if (!sess || sess.role !== "admin") {
    return (
      <main className="min-h-dvh bg-black text-zinc-100">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="text-xl font-bold">Admin</div>
          <div className="mt-2 text-sm text-zinc-400">Sign in as admin.</div>
        </div>
      </main>
    );
  }

  const offers = (await loadOffers()) as unknown as OfferRow[];
  offers.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return <AdminClient initialToken={""} initialOffers={offers} />;
}
