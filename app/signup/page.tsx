"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function safeCallbackUrl(value: string | null) {
  if (!value) return "";
  if (!value.startsWith("/")) return "";
  if (value.startsWith("//")) return "";
  return value;
}

export default function SignupPage() {
  const router = useRouter();

  const [accountType, setAccountType] = useState<"fan" | "creator">("fan");
  const [loginHref, setLoginHref] = useState("/login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callbackUrl = safeCallbackUrl(params.get("callbackUrl"));

    if (callbackUrl) {
      setLoginHref(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, []);

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
        router.push(loginHref);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const callbackUrl = safeCallbackUrl(params.get("callbackUrl"));

      if (accountType === "creator") {
        router.push("/dashboard/settings");
      } else if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        router.push("/account");
      }

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
              href={loginHref}
              className="rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm font-bold hover:bg-white/15"
            >
              Log in
            </Link>
          </nav>

          <div className="flex flex-1 items-center justify-center py-16">
            <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-pink-950/30 backdrop-blur-xl">
              <p className="text-sm font-semibold text-pink-300">
                Create account
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight">
                Join OnlyAi.
              </h1>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Create a fan account to subscribe and unlock creators, or choose creator mode to start your own page.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-black/20 p-2">
                <button
                  type="button"
                  onClick={() => setAccountType("fan")}
                  className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                    accountType === "fan"
                      ? "bg-white text-black"
                      : "text-zinc-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  Fan
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("creator")}
                  className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                    accountType === "creator"
                      ? "bg-white text-black"
                      : "text-zinc-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  Creator
                </button>
              </div>

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
                    {accountType === "creator" ? "Creator handle" : "Username"}
                  </label>
                  <div className="mt-2 flex overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                    <span className="flex items-center px-4 font-black text-zinc-500">
                      @
                    </span>
                    <input
                      className="w-full bg-transparent px-4 py-4 text-white outline-none placeholder:text-zinc-600"
                      placeholder={accountType === "creator" ? "yourcreatorname" : "yourusername"}
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
                  {loading
                    ? "Creating account..."
                    : accountType === "creator"
                      ? "Create creator account"
                      : "Create fan account"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-zinc-500">
                Already have an account?{" "}
                <Link href={loginHref} className="font-bold text-pink-300">
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
