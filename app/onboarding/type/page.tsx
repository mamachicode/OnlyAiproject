"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatorTypePage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function chooseLane(classification: "SFW" | "NSFW") {
    setError("");

    const res = await fetch("/api/user/set-lane", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ classification }),
    });

    const text = await res.text();

    if (!res.ok) {
      setError(text || "Failed to set creator lane");
      return;
    }

    if (classification === "NSFW") {
      router.push("/age?next=/onboarding/pricing");
      return;
    }

    router.push("/onboarding/pricing");
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">Choose your creator lane</h1>
        <p className="text-neutral-400 mb-10">
          Fans do not choose a lane. Only creators do.
        </p>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-950 p-4 text-red-300">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <button
            onClick={() => chooseLane("SFW")}
            className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 text-left hover:border-pink-500 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">SFW Creator</h2>
            <p className="text-neutral-400">
              Safe-for-work content only. This lane is for Stripe monetization first.
            </p>
          </button>

          <button
            onClick={() => chooseLane("NSFW")}
            className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 text-left hover:border-pink-500 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">NSFW Creator (18+)</h2>
            <p className="text-neutral-400">
              Adult content allowed. You must pass the age gate before continuing.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
