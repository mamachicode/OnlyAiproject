'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Pricing() {
  const [username, setUsername] = useState("");
  const [price, setPrice] = useState(10);
  const router = useRouter();

  async function save() {
    const res = await fetch("/api/user/set-profile", {
      method: "POST",
      body: JSON.stringify({ username, price }),
      headers: { "Content-Type": "application/json" }
    });

    if (res.ok) router.push("/creator");
  }

  return (
    <div className="max-w-md mx-auto mt-20 text-white">
      <h1 className="text-2xl mb-4">Set your creator profile</h1>

      <input
        className="w-full p-2 mb-3 text-white bg-neutral-900 border border-neutral-700 rounded"
        placeholder="Public username"
        onChange={e => setUsername(e.target.value)}
      />

      <input
        type="number"
        className="w-full p-2 mb-3 text-white bg-neutral-900 border border-neutral-700 rounded"
        value={price}
        onChange={e => setPrice(parseInt(e.target.value))}
      />

      <button
        onClick={save}
        className="w-full bg-pink-600 p-2 rounded font-semibold hover:opacity-90 transition"
      >
        Continue
      </button>
    </div>
  );
}
