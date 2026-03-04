import { getSession } from "@/lib/auth";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const sess = await getSession();
  if (!sess) {
    return (
      <main className="min-h-dvh bg-[#05060a] text-zinc-100">
        <div className="mx-auto max-w-md px-4 py-12">
          <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/60 p-6">
            <div className="text-2xl font-extrabold">Not signed in</div>
            <div className="mt-2 text-sm text-zinc-400">Go to Sign in.</div>
            <a className="mt-4 inline-flex h-12 items-center rounded-2xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 px-5 font-semibold" href="/signin">Sign in</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#05060a] text-zinc-100">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-12">
        <div className="relative overflow-hidden rounded-[28px] border border-zinc-800 bg-gradient-to-b from-zinc-950/80 to-black/40 p-6 sm:p-7">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-fuchsia-600/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">@{sess.handle}</div>
              <div className="mt-1 text-sm text-zinc-400">{sess.role === "admin" ? "Admin" : "Seller"} profile</div>
            </div>
            <div className="h-12 w-12 rounded-2xl border border-zinc-800 bg-black/35 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21a8 8 0 10-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 13a5 5 0 100-10 5 5 0 000 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="text-xs text-zinc-500">Reputation</div>
              <div className="mt-1 text-2xl font-extrabold">0</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="text-xs text-zinc-500">Deals</div>
              <div className="mt-1 text-2xl font-extrabold">0</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="text-xs text-zinc-500">Total earned</div>
              <div className="mt-1 text-2xl font-extrabold">$0</div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Link className="h-12 inline-flex items-center rounded-2xl border border-zinc-800 bg-black/40 px-6 text-sm font-semibold" href="/">Back</Link>
            <form action="/api/auth/logout" method="post">
              <button className="h-12 inline-flex items-center rounded-2xl bg-gradient-to-r from-fuchsia-600/20 to-cyan-500/10 border border-zinc-800 px-6 text-sm font-semibold">
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
