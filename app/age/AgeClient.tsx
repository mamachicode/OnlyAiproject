"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function AgeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/nsfw";

  function confirm() {
    document.cookie = "age_verified=true; path=/; max-age=31536000; SameSite=Lax";
    router.push(next);
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full border border-neutral-800 bg-neutral-950 rounded-2xl p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">18+ Age Confirmation</h1>

        <p className="text-neutral-400 mb-6">
          You must be at least 18 years old to continue.
        </p>

        <button
          onClick={confirm}
          className="w-full bg-pink-600 py-3 rounded-lg font-semibold hover:opacity-90 transition"
        >
          I am 18 or older
        </button>
      </div>
    </div>
  );
}
