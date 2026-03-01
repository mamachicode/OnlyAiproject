import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Become an Adult Creator
      </h1>

      <p className="text-neutral-400 text-center max-w-md mb-8">
        OnlyAI is an 18+ subscription platform. All creators must be 18 years
        or older and publish adult content in compliance with our Terms of
        Service and CCBill requirements.
      </p>

      <div className="bg-neutral-900 p-6 rounded-xl max-w-md w-full text-center mb-6">
        <p className="text-sm text-neutral-300 mb-4">
          By continuing, you confirm that:
        </p>

        <ul className="text-sm text-neutral-400 space-y-2 text-left">
          <li>• You are 18 years of age or older</li>
          <li>• You will only upload legal adult content</li>
          <li>• You agree to our Terms and 2257 compliance policy</li>
        </ul>
      </div>

      <Link
        href="/onboarding/pricing"
        className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
      >
        Continue to Pricing
      </Link>
    </main>
  );
}
