export const dynamic = "force-static";

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-[#05060a] text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/60 p-6 sm:p-8">
          <div className="text-3xl font-extrabold">Privacy</div>
          <div className="mt-4 space-y-3 text-sm text-zinc-300 leading-relaxed">
            <p>
              We store the minimum data needed to run the service: your handle, hashed password, offers, and chat messages.
            </p>
            <p>
              We do not sell your data. Admins can view your offers and chat history for support and payouts.
            </p>
            <p>
              If you want your account deleted, contact the admin.
            </p>
          </div>

          <a className="mt-8 inline-flex h-12 items-center rounded-2xl border border-zinc-800 bg-black/40 px-6 text-sm font-semibold" href="/">
            Back
          </a>
        </div>
      </div>
    </main>
  );
}
