// @ts-nocheck
export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/src/lib/prisma";

export default async function SubscribePage({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const username = String(resolvedParams?.username || "").trim().toLowerCase();

  const creator = await prisma.user.findUnique({
    where: { username },
    select: {
      username: true,
      sfwPrice: true,
    },
  });

  if (!creator) {
    return (
      <main className="min-h-screen bg-[#07050d] text-white">
        <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-20">
          <h1 className="text-5xl font-black">Creator not found.</h1>
          <Link href="/" className="mt-8 w-fit rounded-2xl bg-white px-6 py-3 font-black text-black">
            Back to OnlyAi
          </Link>
        </section>
      </main>
    );
  }

  const price = creator.sfwPrice ?? 5;

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
          Subscribe to @{creator.username}
        </h1>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-sm font-semibold text-zinc-500">Monthly access</p>
          <p className="mt-3 text-5xl font-black">${price}</p>
          <p className="mt-3 text-zinc-400">
            Unlock private creator posts when billing is connected.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-sm font-semibold text-yellow-100">
          Checkout connection is the next sprint. This page is ready for Stripe wiring.
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href={`/public/creator/${creator.username}`}
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-center text-lg font-black text-white hover:bg-white/10"
          >
            Back to creator page
          </Link>

          <Link
            href="/login"
            className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 text-center text-lg font-black text-white"
          >
            Creator login
          </Link>
        </div>
      </section>
    </main>
  );
}
