import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { requireAdminPage } from "@/src/lib/adminGuard";

export const dynamic = "force-dynamic";

export default async function PrivateNsfwReviewPage() {
  const admin = await requireAdminPage("/nsfw");

  const creator = await prisma.creator.findFirst({
    where: {
      OR: [
        {
          handle: {
            equals: "demolitionbaby",
            mode: "insensitive",
          },
        },
        {
          user: {
            username: {
              equals: "demolitionbaby",
              mode: "insensitive",
            },
          },
        },
      ],
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  const publicHandle =
    creator?.handle ||
    creator?.user.username ||
    "demolitionbaby";

  const isMasterAccount =
    Boolean(creator) && admin.userId === creator?.userId;

  return (
    <main className="min-h-screen bg-[#080309] px-6 py-16 text-white">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-red-300">
          OnlyAi private review
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          Adult-lane processor review
        </h1>

        <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-400">
          This private area is under development and is available only to
          authorized OnlyAi administrators and authorized payment-processor
          reviewers. It is not publicly launched and no live adult checkout is
          available.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={`/nsfw/creator/${encodeURIComponent(publicHandle)}`}
            className="rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-center text-sm font-black text-white hover:bg-white/10"
          >
            Open private storefront
          </Link>

          {isMasterAccount ? (
            <Link
              href="/admin/nsfw/upload"
              className="rounded-full border border-red-400/30 bg-red-500/15 px-5 py-3 text-center text-sm font-black text-red-100 hover:bg-red-500/25"
            >
              Upload private content
            </Link>
          ) : null}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <section className="rounded-3xl border border-red-400/20 bg-red-500/10 p-6">
            <h2 className="text-xl font-black">Review status</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-red-100/80">
              <li>Private and excluded from search indexing</li>
              <li>No public navigation or creator access</li>
              <li>Adult-processor integration not yet activated</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-black">Compliance review</h2>
            <div className="mt-4 flex flex-col gap-3 text-sm font-bold">
              <Link
                href="/nsfw/prohibited-content"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 hover:bg-white/10"
              >
                Prohibited Content Policy
              </Link>

              <Link
                href="/nsfw/dmca"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 hover:bg-white/10"
              >
                DMCA and Takedown Process
              </Link>
            </div>
          </section>
        </div>

        <div className="mt-8 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-6 text-sm leading-7 text-amber-100/85">
          <p className="font-black text-amber-100">
            No public adult subscriptions are available.
          </p>
          <p className="mt-2">
            Processor-specific checkout, logos, webhooks, and public creator
            discovery will remain disabled until underwriting and compliance
            review are complete.
          </p>
        </div>
      </section>
    </main>
  );
}
