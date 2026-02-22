'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: any) {
    e.preventDefault();

    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/nsfw"
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white relative">

      <div className="absolute top-6 right-6 text-xs bg-neutral-800 px-3 py-1 rounded-full border border-neutral-700">
        18+ Adults Only
      </div>

      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">

        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold">Sign In</h1>
          <p className="text-sm text-neutral-400 mt-2">
            Secure member access • Adult subscription platform
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            className="w-full p-3 mb-4 bg-white text-black rounded-lg focus:outline-none"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="w-full p-3 mb-6 bg-white text-black rounded-lg focus:outline-none"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />

          <button className="w-full bg-pink-600 hover:bg-pink-500 transition p-3 rounded-lg font-medium">
            Sign In
          </button>

          <p className="text-xs text-neutral-500 mt-4 text-center">
            By continuing, you agree to our{" "}
            <a href="/legal/terms" className="underline hover:text-white">Terms</a>{" "}
            and{" "}
            <a href="/legal/privacy" className="underline hover:text-white">Privacy Policy</a>.
          </p>
        </form>

      </div>
    </div>
  );
}
