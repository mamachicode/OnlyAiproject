import Link from "next/link";
import { requireAdminPage } from "@/src/lib/adminGuard";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function PrivateNsfwCreatorReviewPage({
  params,
}: PageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);

  await requireAdminPage(
    `/nsfw/creator/${encodeURIComponent(decodedUsername)}`
  );

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
          Private creator preview
        </p>

        <h1 className="mt-4 text-4xl font-black">
          @{decodedUsername}
        </h1>

        <div className="mt-8 rounded-3xl border border-red-400/20 bg-red-500/10 p-6">
          <p className="font-black text-red-100">
            This creator storefront is not public.
          </p>
          <p className="mt-3 text-sm leading-7 text-red-100/75">
            This route is reserved for OnlyAi administration and authorized
            processor review. Adult creator profiles, posts, discovery, and
            subscriptions have not been activated.
          </p>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-black">Required launch controls</h2>

          <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-400">
            <li>Creator identity and age verification</li>
            <li>Documented consent and content rights</li>
            <li>Only clearly adult subjects aged 18 or older</li>
            <li>No identifiable real-person portrayal without authorization</li>
            <li>No deepfakes, face swaps, or non-consensual likeness use</li>
            <li>Manual OnlyAi approval before public visibility</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
