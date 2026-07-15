import Link from "next/link";
import { requireAdminPage } from "@/src/lib/adminGuard";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function DisabledNsfwCheckoutReviewPage({
  params,
}: PageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);

  await requireAdminPage(
    `/nsfw/subscribe/${encodeURIComponent(decodedUsername)}`
  );

  return (
    <main className="min-h-screen bg-[#080309] px-6 py-16 text-white">
      <section className="mx-auto max-w-3xl">
        <Link
          href={`/nsfw/creator/${encodeURIComponent(decodedUsername)}`}
          className="text-sm font-bold text-zinc-400 hover:text-white"
        >
          ← Back to private creator preview
        </Link>

        <p className="mt-10 text-sm font-black uppercase tracking-[0.35em] text-red-300">
          Processor-review placeholder
        </p>

        <h1 className="mt-4 text-4xl font-black">
          Adult checkout is disabled
        </h1>

        <div className="mt-8 rounded-3xl border border-amber-400/25 bg-amber-400/10 p-6">
          <p className="font-black text-amber-100">
            No payment can be submitted from this page.
          </p>

          <p className="mt-3 text-sm leading-7 text-amber-100/75">
            OnlyAi will not activate adult subscription checkout until an adult
            payment processor has approved the platform and the final
            processor-specific integration has been reviewed.
          </p>
        </div>

        <div className="mt-6 rounded-3xl border border-red-500/25 bg-red-500/10 p-6 text-sm leading-7 text-red-100/80">
          Stripe is restricted to OnlyAi&apos;s SFW lane and cannot be used for
          adult subscriptions.
        </div>
      </section>
    </main>
  );
}
