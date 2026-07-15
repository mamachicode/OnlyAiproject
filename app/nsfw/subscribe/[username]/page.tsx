// @ts-nocheck
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { requireAdminPage } from "@/src/lib/adminGuard";

export default async function PrivateNsfwSubscribePage({
  params,
}) {
  const resolvedParams = await Promise.resolve(params);

  const username = String(resolvedParams?.username || "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();

  await requireAdminPage(
    `/nsfw/subscribe/${encodeURIComponent(username)}`
  );

  const creator = await prisma.creator.findFirst({
    where: {
      OR: [
        {
          handle: {
            equals: username,
            mode: "insensitive",
          },
        },
        {
          user: {
            username: {
              equals: username,
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
          nsfwPrice: true,
        },
      },
    },
  });

  if (!creator) {
    notFound();
  }

  const handle =
    creator.handle || creator.user.username;

  const priceDollars = Number(
    creator.user.nsfwPrice || 10
  );

  const price = (
    Number.isFinite(priceDollars) && priceDollars > 0
      ? priceDollars
      : 10
  ).toFixed(2);

  return (
    <main className="min-h-screen bg-[#07050d] text-white">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-20">
        <Link
          href="/nsfw"
          className="mb-10 text-4xl font-black tracking-tight"
        >
          Only<span className="text-red-400">Ai</span>
        </Link>

        <p className="mb-5 inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-300">
          Private 18+ membership
        </p>

        <h1 className="text-5xl font-black tracking-tight md:text-7xl">
          Subscribe to @{handle}
        </h1>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-sm font-semibold text-zinc-500">
            Monthly access
          </p>

          <p className="mt-3 text-5xl font-black">
            ${price}
          </p>

          <p className="mt-3 text-zinc-400">
            Unlock private adult creator posts with a monthly
            subscription.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm font-semibold text-amber-100">
          Payments are unavailable during processor review. No payment
          information can be entered or submitted.
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            disabled
            className="flex-1 cursor-not-allowed rounded-2xl bg-gradient-to-r from-red-500/45 to-purple-600/45 px-8 py-4 text-center text-lg font-black text-white/55"
          >
            Subscribe unavailable
          </button>

          <Link
            href={`/nsfw/creator/${encodeURIComponent(handle)}`}
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-center text-lg font-black text-white hover:bg-white/10"
          >
            Back to creator page
          </Link>
        </div>

        <div className="mt-5 space-y-3 text-sm text-zinc-500">
          <p>
            Membership activation will become available after adult
            payment processing is approved and enabled.
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-zinc-400">
            <p className="font-bold text-white">
              Need help?
            </p>

            <p className="mt-1">
              Contact OnlyAi support with questions about private
              membership access or account review.
            </p>

            <Link
              href="/contact"
              className="mt-3 inline-flex font-black text-red-200 hover:text-red-100"
            >
              Contact support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
