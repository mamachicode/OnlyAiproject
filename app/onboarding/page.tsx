'use client';

import { useRouter } from "next/navigation";

export default function Onboarding() {
  const router = useRouter();

  async function choose(isNsfw: boolean) {
    await fetch("/api/user/set-lane", {
      method: "POST",
      body: JSON.stringify({ isNsfw }),
      headers: { "Content-Type": "application/json" }
    });
    router.push("/onboarding/pricing");
  }

  return (
    <div className="max-w-lg mx-auto mt-20 text-center">
      <h1 className="text-3xl mb-6 font-semibold">
        Choose Your Creator Category
      </h1>

      <p className="text-neutral-400 mb-10">
        All subscriptions are processed securely through CCBill.
      </p>

      <div className="flex gap-6 justify-center">
        <button
          onClick={() => choose(false)}
          className="bg-neutral-800 hover:bg-neutral-700 p-6 rounded-lg w-44 transition"
        >
          General Audience
        </button>

        <button
          onClick={() => choose(true)}
          className="bg-neutral-800 hover:bg-neutral-700 p-6 rounded-lg w-44 transition"
        >
          Adult (18+)
        </button>
      </div>
    </div>
  );
}
