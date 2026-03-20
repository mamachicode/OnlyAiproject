'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Pricing() {
  const [username, setUsername] = useState("");
  const [price, setPrice] = useState(10);
  const [error, setError] = useState("");
  const router = useRouter();

  async function save() {
    setError("");

    const res = await fetch("/api/user/set-profile", {
      method: "POST",
      body: JSON.stringify({ username, price }),
      headers: { "Content-Type": "application/json" }
    });

    const text = await res.text();

    if (!res.ok) {
      setError(text);
      return;
    }

    router.push("/creator");
  }

  return (
    <div className="max-w-md mx-auto mt-20 text-white px-4">
      <h1 className="text-3xl font-bold mb-2">
        Become a Creator
      </h1>

      <p className="text-neutral-400 mb-6">
        Set your public username and monthly subscription price.
      </p>

      {error && (
        <div className="mb-4 text-red-500 text-sm">{error}</div>
      )}

      {/* Username */}
      <div className="mb-4">
        <label className="text-sm text-neutral-400 mb-1 block">
          Public Username
        </label>
        <input
          className="w-full p-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:outline-none focus:border-pink-500"
          placeholder="yourname"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
      </div>

      {/* Price */}
      <div className="mb-6">
        <label className="text-sm text-neutral-400 mb-1 block">
          Monthly Price (USD)
        </label>

        <div className="flex items-center bg-neutral-900 border border-neutral-700 rounded-lg focus-within:border-pink-500">
          <span className="px-3 text-neutral-400">$</span>

          <input
            type="number"
            min="1"
            className="w-full p-3 bg-transparent focus:outline-none"
            value={price}
            onChange={e => setPrice(parseInt(e.target.value) || 0)}
          />

          <span className="px-3 text-neutral-500 text-sm">
            / month
          </span>
        </div>
      </div>

      <button
        onClick={save}
        className="w-full bg-pink-600 p-3 rounded-lg font-semibold hover:opacity-90 transition"
      >
        Continue
      </button>
    </div>
  );
}
