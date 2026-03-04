"use client";

import { useState } from "react";

export default function SignIn() {
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, password }),
      });
      const j: unknown = await r.json();
      const data = j as { ok?: boolean; error?: string };
      if (!r.ok || !data.ok) throw new Error(data.error || "Login failed");
      window.location.href = "/";
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-[#05060a] text-zinc-100">
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/60 p-6">
          <div className="text-3xl font-extrabold">Sign in</div>
          <div className="mt-1 text-sm text-zinc-400">
            Handle 3–16 characters. Password 6–32 characters.
          </div>

          <div className="mt-6 grid gap-3">
            <input className="h-14 rounded-2xl border border-zinc-800 bg-black/40 px-4" placeholder="Handle (3–16 chars)" value={handle} onChange={(e) => setHandle(e.target.value)} />
            <input className="h-14 rounded-2xl border border-zinc-800 bg-black/40 px-4" placeholder="Password (6–32 chars)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={login} disabled={loading} className="h-14 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 px-6 text-base font-semibold disabled:opacity-60">
              {loading ? "…" : "Sign in"}
            </button>
            {err ? <div className="text-sm text-red-300">{err}</div> : null}
            <a className="text-sm text-zinc-400 underline" href="/signup">Create account</a>
          </div>
        </div>
      </div>
    </main>
  );
}
