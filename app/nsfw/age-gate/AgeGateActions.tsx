"use client";

import { useState } from "react";

type AgeGateActionsProps = {
  returnTo: string;
};

export default function AgeGateActions({
  returnTo,
}: AgeGateActionsProps) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  async function confirmAge() {
    if (confirming) return;

    setConfirming(true);
    setError("");

    try {
      const response = await fetch(
        "/api/nsfw/age-confirmation",
        {
          method: "POST",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error || "Age confirmation could not be saved."
        );
      }

      window.location.assign(returnTo);
    } catch (confirmationError) {
      setError(
        confirmationError instanceof Error
          ? confirmationError.message
          : "Age confirmation could not be saved."
      );
      setConfirming(false);
    }
  }

  return (
    <div className="mt-8 space-y-4">
      {error ? (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-bold text-red-100">
          {error}
        </div>
      ) : null}

      <button
        type="button"
        disabled={confirming}
        onClick={confirmAge}
        className="w-full rounded-2xl bg-gradient-to-r from-red-500 to-purple-600 px-6 py-4 text-base font-black text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {confirming
          ? "Confirming..."
          : "I confirm I am at least 18 years old"}
      </button>

      <button
        type="button"
        disabled={confirming}
        onClick={() => window.location.assign("/")}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-base font-black text-zinc-200 hover:bg-white/[0.08] disabled:opacity-60"
      >
        Leave adult area
      </button>
    </div>
  );
}
