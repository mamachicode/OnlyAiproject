import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Become a Creator</h1>
        <p className="text-neutral-400 mb-8">
          Choose your creator lane first. Fans do not choose a lane — creators do.
        </p>

        <ul className="space-y-3 text-neutral-300 mb-8">
          <li>• SFW creators can only publish safe content</li>
          <li>• NSFW creators must confirm 18+ before continuing</li>
          <li>• Monetization starts with SFW first</li>
        </ul>

        <Link
          href="/onboarding/type"
          className="inline-block rounded-lg bg-pink-600 px-6 py-3 font-semibold hover:opacity-90 transition"
        >
          Continue
        </Link>
      </div>
    </div>
  );
}
