"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not reset password.");
        setLoading(false);
        return;
      }

      setDone(true);
      setTimeout(() => router.push("/login"), 1200);
    } catch (err) {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-pink-950/30 backdrop-blur-xl"
    >
      <p className="text-sm font-semibold text-pink-300">Account security</p>

      <h1 className="mt-3 text-4xl font-black tracking-tight">
        Set a new password.
      </h1>

      <p className="mt-3 text-sm leading-6 text-zinc-400">
        Choose a new password for your OnlyAi account.
      </p>

      {!token && (
        <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-200">
          Reset link is missing or invalid.
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-200">
          {error}
        </div>
      )}

      {done && (
        <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-semibold text-emerald-200">
          Password updated. Redirecting to login...
        </div>
      )}

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-bold text-zinc-300">
            New password
          </label>
          <input
            type="password"
            placeholder="Minimum 8 characters"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-zinc-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={!token || done}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-300">
            Confirm password
          </label>
          <input
            type="password"
            placeholder="Confirm your password"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-zinc-600"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={!token || done}
          />
        </div>

        <button
          className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4 text-center font-black text-white shadow-xl shadow-pink-500/20 disabled:opacity-60"
          type="submit"
          disabled={loading || !token || done}
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Back to{" "}
        <Link href="/login" className="font-bold text-pink-300">
          login
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
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
            <Suspense fallback={<div className="text-zinc-400">Loading...</div>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
