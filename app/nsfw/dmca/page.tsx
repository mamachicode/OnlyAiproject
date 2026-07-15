import Link from "next/link";
import { requireAdminPage } from "@/src/lib/adminGuard";

export const dynamic = "force-dynamic";

export default async function PrivateDmcaPolicyPage() {
  await requireAdminPage("/nsfw/dmca");

  return (
    <main className="min-h-screen bg-[#080309] px-6 py-16 text-white">
      <section className="mx-auto max-w-4xl">
        <Link
          href="/nsfw"
          className="text-sm font-bold text-zinc-400 hover:text-white"
        >
          ← Back to private NSFW review
        </Link>

        <p className="mt-10 text-sm font-black uppercase tracking-[0.35em] text-red-300">
          Copyright and rights protection
        </p>

        <h1 className="mt-4 text-4xl font-black">
          DMCA and Takedown Process
        </h1>

        <p className="mt-5 text-sm leading-7 text-zinc-400">
          OnlyAi reviews copyright, likeness, consent, and unauthorized-content
          complaints. Content may be restricted or removed while a report is
          investigated.
        </p>

        <div className="mt-8 space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-sm leading-7 text-zinc-300">
          <section>
            <h2 className="text-xl font-black text-white">
              Submit a complaint
            </h2>

            <p className="mt-2">
              Send requests to:
            </p>

            <p className="mt-2 text-lg font-black text-red-200">
              support@weareonlyai.com
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              Information to include
            </h2>

            <ul className="mt-2 space-y-2">
              <li>Your full legal name and contact information</li>
              <li>The specific content or URL being reported</li>
              <li>A description of the copyrighted work or protected likeness</li>
              <li>Evidence that you own or are authorized to act for the rights holder</li>
              <li>A good-faith statement that the disputed use is unauthorized</li>
              <li>A statement that the information provided is accurate</li>
              <li>Your physical or electronic signature</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              Likeness and consent complaints
            </h2>

            <p className="mt-2">
              A person depicted or imitated without authorization may report
              face swaps, deepfakes, cloned likenesses, non-consensual intimate
              imagery, impersonation, or other unauthorized portrayals through
              the same support address.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              Review and removal
            </h2>

            <p className="mt-2">
              OnlyAi may temporarily restrict access while reviewing a
              complaint, request supporting documentation, remove confirmed
              violations, and take action against repeat infringers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              Business address
            </h2>

            <p className="mt-2">
              OnlyAi&apos;s formal notice address will be added after the
              business-address agreement has been finalized.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
