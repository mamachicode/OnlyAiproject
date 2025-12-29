'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function CreateAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup(e:any) {
    e.preventDefault();

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" }
    });

    if (res.ok) {
      await signIn("credentials", { email, password, callbackUrl: "/onboarding" });
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 rounded bg-black text-white">
      <h1 className="text-2xl mb-4">Create Account</h1>

      <form onSubmit={handleSignup}>
        <input
          className="w-full p-2 mb-3 text-black"
          placeholder="Email"
          required
          onChange={e=>setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-2 mb-3 text-black"
          placeholder="Password"
          required
          onChange={e=>setPassword(e.target.value)}
        />

        <button className="w-full bg-pink-600 p-2 rounded">
          Create Account
        </button>
      </form>
    </div>
  );
}
