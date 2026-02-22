"use client";

import { useRouter } from "next/navigation";

export default function AgeGatePage() {
  const router = useRouter();

  const confirmAge = () => {
    document.cookie =
      "age_verified=true; path=/; max-age=31536000; SameSite=Lax";
    router.push("/nsfw");
  };

  const exitSite = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold mb-6">18+ Age Verification</h1>

      <p className="max-w-xl text-neutral-400 mb-6">
        This website contains adult-oriented material. You must be at least
        18 years of age (or the legal age in your jurisdiction) to enter.
        By proceeding, you confirm that you are legally permitted to view
        adult content.
      </p>

      <div className="space-y-4">
        <button
          onClick={confirmAge}
          className="w-72 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:opacity-90 transition"
        >
          I AM 18+ — ENTER SITE
        </button>

        <button
          onClick={exitSite}
          className="w-72 px-6 py-3 border border-neutral-600 rounded-lg text-neutral-300 hover:bg-neutral-800 transition"
        >
          EXIT
        </button>
      </div>
    </div>
  );
}
