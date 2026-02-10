import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex items-center justify-center px-6 py-24">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          OnlyAI
        </h1>

        <p className="text-lg text-neutral-300">
          A subscription platform for AI-driven and creator-managed adult content.
        </p>

        <p className="text-neutral-400">
          Creators publish premium AI and original content.
          Fans subscribe for access to exclusive material.
          Secure recurring billing powered by CCBill.
        </p>

        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg bg-white text-black font-semibold hover:opacity-90 transition"
          >
            Sign In
          </Link>

          <Link
            href="/onboarding"
            className="px-6 py-3 rounded-lg border border-neutral-700 hover:border-white transition"
          >
            Become a Creator
          </Link>
        </div>

        <div className="pt-10 text-sm text-neutral-500">
          18+ Only • All billing managed securely through CCBill
        </div>
      </div>
    </div>
  );
}
