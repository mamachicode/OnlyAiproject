"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

function safeCallbackUrl(value: string | null) {
  if (!value) return "/dashboard";
  if (!value.startsWith("/")) return "/dashboard";
  if (value.startsWith("//")) return "/dashboard";
  return value;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [signupHref, setSignupHref] = useState("/signup");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callbackUrl = safeCallbackUrl(params.get("callbackUrl"));

    if (callbackUrl !== "/dashboard") {
      setSignupHref(`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const params = new URLSearchParams(window.location.search);
    const callbackUrl = safeCallbackUrl(params.get("callbackUrl"));

    const result = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl,
    });

    if (result?.error) {
      setError("Invalid email or password");
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
              href={signupHref}
              className="rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm font-bold hover:bg-white/15"
            >
              Sign up
            </Link>
          </nav>

          <div className="flex flex-1 items-center justify-center py-16">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-pink-950/30 backdrop-blur-xl"
            >
              <p className="text-sm font-semibold text-pink-300">
                Account login
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight">
                Welcome back.
              </h1>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Log in to subscribe, unlock creators, or manage your creator dashboard.
              </p>

              {error && (
                <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-200">
                  {error}
                </div>
              )}

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

                <div>
                  <label className="block text-sm font-bold text-zinc-300">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Your password"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-zinc-600"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4 text-center font-black text-white shadow-xl shadow-pink-500/20"
                  type="submit"
                >
                  Log in
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-zinc-500">
                New to OnlyAi?{" "}
                <Link href={signupHref} className="font-bold text-pink-300">
                  Create an account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
