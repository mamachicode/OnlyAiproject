"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07050d] text-white">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.25),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(147,51,234,0.28),_transparent_36%)]" />

        <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-4xl font-black tracking-tight">
              Only<span className="text-pink-400">Ai</span>
            </Link>

            <Link
              href="/login"
              className="rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm font-bold hover:bg-white/15"
            >
              Log in
            </Link>
          </nav>

          <div className="flex flex-1 items-center justify-center py-16">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-pink-950/30 backdrop-blur-xl"
            >
              <p className="text-sm font-semibold text-pink-300">
                Password help
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight">
                Reset your password.
              </h1>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Enter your account email and we’ll send you a secure reset link.
              </p>

              {sent ? (
                <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-semibold text-emerald-200">
                  If an account exists for that email, a reset link has been sent.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-zinc-300">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-zinc-600"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4 text-center font-black text-white shadow-xl shadow-pink-500/20 disabled:opacity-60"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send reset link"}
                  </button>
                </div>
              )}

              <p className="mt-6 text-center text-sm text-zinc-500">
                Remember your password?{" "}
                <Link href="/login" className="font-bold text-pink-300">
                  Log in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
