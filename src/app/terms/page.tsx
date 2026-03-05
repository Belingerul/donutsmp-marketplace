export const dynamic = "force-static";

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-[#05060a] text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/60 p-6 sm:p-8">
          <div className="text-3xl font-extrabold">Terms</div>
          <div className="mt-4 space-y-3 text-sm text-zinc-300 leading-relaxed">
            <p>
              This website is an intake form for sellers to submit offers. By using it you agree to the rules below.
            </p>
            <p>
              1) We may reject any offer at our discretion.
              <br />
              2) Payouts are manual and happen only after confirmation in chat.
              <br />
              3) Do not submit anything illegal or anything that violates a game/server’s rules.
              <br />
              4) We are not responsible for losses caused by wrong wallet addresses provided by the seller.
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
