"use client";

import { useRouter } from "next/navigation";

export default function AgeGatePage() {
  const router = useRouter();

  const confirmAge = () => {
    document.cookie = "age_verified=true; path=/; max-age=31536000; SameSite=Lax";
    router.push("/nsfw");
  };

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-4xl font-bold">Age Verification</h1>

      <p>
        OnlyAI contains adult-oriented content. Access is restricted to individuals 18 years or older.
      </p>

      <ul className="list-disc pl-6 space-y-1">
        <li>You are at least 18 years old.</li>
        <li>You are legally permitted to view adult content.</li>
        <li>You will not allow minors to access this platform.</li>
      </ul>

      <button
        onClick={confirmAge}
        className="mt-6 px-6 py-3 bg-black text-white rounded"
      >
        I am 18+ — Enter
      </button>
    </div>
  );
}
