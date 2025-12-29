'use client';

import { useRouter } from "next/navigation";

export default function Onboarding() {
  const router = useRouter();

  async function choose(isNsfw:boolean) {
    await fetch("/api/user/set-lane", {
      method: "POST",
      body: JSON.stringify({ isNsfw }),
      headers: { "Content-Type": "application/json" }
    });
    router.push("/onboarding/pricing");
  }

  return (
    <div className="max-w-lg mx-auto mt-20 text-center text-white">
      <h1 className="text-3xl mb-6">Choose your creator lane</h1>

      <div className="flex gap-6 justify-center">
        <button onClick={()=>choose(false)} className="bg-blue-600 p-6 rounded w-40">
          SFW Creator<br/>Stripe
        </button>

        <button onClick={()=>choose(true)} className="bg-red-600 p-6 rounded w-40">
          NSFW Creator<br/>CCBill
        </button>
      </div>
    </div>
  );
}
