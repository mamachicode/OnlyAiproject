"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not create account.");
        setLoading(false);
        return;
      }

      const login = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (login?.error) {
        router.push("/login");
        return;
      }

      router.push("/dashboard/settings");
      router.refresh();
    } catch (err) {
      setError("Something went wrong. Try again.");
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
            <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-pink-950/30 backdrop-blur-xl">
              <p className="text-sm font-semibold text-pink-300">
                Creator signup
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight">
                Create your OnlyAi page.
              </h1>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Start your private creator membership. You can upload posts and set pricing from the dashboard.
              </p>

              {error && (
                <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-300">
                    Email
                  </label>
                  <input
                    type="email"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-zinc-600"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-300">
                    Creator handle
                  </label>
                  <div className="mt-2 flex overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                    <span className="flex items-center px-4 font-black text-zinc-500">
                      @
                    </span>
                    <input
                      className="w-full bg-transparent px-4 py-4 text-white outline-none placeholder:text-zinc-600"
                      placeholder="yourname"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    Lowercase letters, numbers, and underscores only.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-300">
                    Password
                  </label>
                  <input
                    type="password"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-zinc-600"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4 text-center font-black text-white shadow-xl shadow-pink-500/20 disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Create creator account"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-zinc-500">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-pink-300">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
