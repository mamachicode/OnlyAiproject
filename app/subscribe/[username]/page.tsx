// @ts-nocheck
export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/src/lib/prisma";

export default async function SubscribePage({ params, searchParams }) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);

  const username = String(resolvedParams?.username || "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();

  const canceled = resolvedSearchParams?.canceled === "1";

  const creator = await prisma.creator.findFirst({
    where: {
      classification: "SFW",
      OR: [
        { handle: username },
        {
          user: {
            username,
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

  if (!creator) {
    return (
      <main className="min-h-screen bg-[#07050d] text-white">
        <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-20">
          <h1 className="text-5xl font-black">Creator not found.</h1>
          <Link
            href="/"
            className="mt-8 w-fit rounded-2xl bg-white px-6 py-3 font-black text-black"
          >
            Back to OnlyAi
          </Link>
        </section>
      </main>
    );
  }

  const handle = creator.handle || creator.user.username;
  const priceCents = creator.priceCents || 1000;
  const price = (priceCents / 100).toFixed(2);

  return (
    <main className="min-h-screen bg-[#07050d] text-white">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-20">
        <Link href="/" className="mb-10 text-4xl font-black tracking-tight">
          Only<span className="text-pink-400">Ai</span>
        </Link>

        <p className="mb-5 inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-300">
          Creator membership
        </p>

        <h1 className="text-5xl font-black tracking-tight md:text-7xl">
          Subscribe to @{handle}
        </h1>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-sm font-semibold text-zinc-500">Monthly access</p>
          <p className="mt-3 text-5xl font-black">${price}</p>
          <p className="mt-3 text-zinc-400">
            Unlock private creator posts with a monthly subscription.
          </p>
        </div>

        {canceled ? (
          <div className="mt-8 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-sm font-semibold text-yellow-100">
            Checkout was canceled. You can try again anytime.
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <form action="/api/stripe/checkout" method="POST" className="flex-1">
            <input type="hidden" name="username" value={handle} />
            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 text-center text-lg font-black text-white transition hover:scale-[1.01]"
            >
              Subscribe now
            </button>
          </form>

          <Link
            href={`/public/creator/${handle}`}
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-center text-lg font-black text-white hover:bg-white/10"
          >
            Back to creator page
          </Link>
        </div>

        <div className="mt-5 space-y-3 text-sm text-zinc-500">
          <p>Secure checkout powered by Stripe.</p>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-zinc-400">
            <p className="font-bold text-white">Need help?</p>
            <p className="mt-1">
              If checkout, login, or locked posts do not work, contact OnlyAi support.
            </p>
            <Link
              href="/contact"
              className="mt-3 inline-flex font-black text-pink-200 hover:text-pink-100"
            >
              Contact support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
