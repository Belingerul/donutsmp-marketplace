"use client";

import { useEffect, useState } from "react";

type Me = { uid: string; role: "seller" | "admin"; handle: string };

export default function SiteHeader({
  title = "DonutSMP Marketplace",
  subtitle = "Make money playing — instant payment",
}: {
  title?: string;
  subtitle?: string;
}) {
  const [me, setMe] = useState<Me | null>(null);

  async function loadMe() {
    try {
      const r = await fetch("/api/auth/me", { cache: "no-store" });
      const j = (await r.json()) as { ok: boolean; user: Me | null };
      if (j?.ok) setMe(j.user);
    } catch {
      // ignore
    }
  }

  async function logout() {
    try {
      localStorage.removeItem("pm_chatUrl");
    } catch {}
    await fetch("/api/me/active-offer", { method: "DELETE" }).catch(() => null);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    window.location.href = "/";
  }

  // Load session info once. (lint rule is strict; use async IIFE)
  useEffect(() => {
    (async () => {
      await loadMe();
    })();
  }, []);

  return (
    <div className="rounded-3xl border border-zinc-800/80 bg-black/20 p-5 sm:p-6">
      {/* Row 1: title + auth buttons */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 pt-1">
          <div className="text-[34px] leading-[1.0] sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent break-words">
            {title}
          </div>
        </div>

        <div className="shrink-0">
          {me ? (
            <div className="flex flex-col items-end gap-2">
              <a
                href="/profile"
                aria-label="Profile"
                className="h-12 w-12 inline-flex items-center justify-center rounded-2xl border border-zinc-800 bg-black/40 text-zinc-200 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                title={me.handle}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21a8 8 0 10-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 13a5 5 0 100-10 5 5 0 000 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </a>
              <button
                onClick={logout}
                className="h-11 inline-flex items-center rounded-2xl border border-zinc-800 bg-black/40 px-4 text-sm text-zinc-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-2">
              <a
                href="/signup"
                className="h-11 inline-flex items-center rounded-2xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 px-4 text-sm font-semibold"
              >
                Sign up
              </a>
              <a
                href="/signin"
                className="h-11 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-fuchsia-600/20 to-cyan-500/10 border border-zinc-800 px-4 text-sm font-semibold text-zinc-100"
              >
                Sign in
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: the blue message, directly below the auth buttons (right aligned) */}
      {subtitle ? (
        <div className="mt-2 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-zinc-800 bg-gradient-to-r from-fuchsia-600/15 to-cyan-500/10 px-3.5 py-2.5 text-[14px] font-semibold text-zinc-100 max-w-full">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.35)]" />
            <span className="truncate sm:whitespace-nowrap">{subtitle}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
