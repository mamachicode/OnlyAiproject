// @ts-nocheck
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
import LogoutButton from "../LogoutButton";

export default async function FanMessagesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/messages");
  }

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: session.user.id,
      processor: "STRIPE",
      status: "ACTIVE",
      OR: [
        { currentPeriodEnd: null },
        { currentPeriodEnd: { gt: new Date() } },
      ],
    },
    select: {
      creatorId: true,
    },
  });

  const creatorIds = subscriptions.map((sub) => sub.creatorId);

  const messages =
    creatorIds.length > 0
      ? await prisma.creatorMessage.findMany({
          where: {
            creatorId: {
              in: creatorIds,
            },
          },
          include: {
            creator: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 50,
        })
      : [];

  return (
    <main className="min-h-screen bg-[#07050d] text-white">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <nav className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/account" className="text-4xl font-black tracking-tight">
            Only<span className="text-pink-400">Ai</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/account"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold text-zinc-200 hover:bg-white/10 hover:text-white"
            >
              Account
            </Link>

            <LogoutButton />
          </div>
        </nav>

        <div className="mt-16">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-pink-300">
            Fan inbox
          </p>
          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Messages
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-400">
            Private updates from creators you actively subscribe to.
          </p>
        </div>

        <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.05] p-6">
          {messages.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-black/20 p-6 text-zinc-400">
              No creator messages yet.
            </div>
          ) : (
            <div className="grid gap-4">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className="rounded-3xl border border-white/10 bg-black/20 p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-pink-300">
                        {message.creator.displayName || message.creator.handle}
                      </p>
                      <h2 className="mt-2 text-2xl font-black">
                        {message.title}
                      </h2>
                      <p className="mt-1 text-xs text-zinc-500">
                        {message.createdAt.toLocaleString()}
                      </p>
                    </div>

                    <Link
                      href={`/public/creator/${message.creator.handle}`}
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-black text-white hover:bg-white/10"
                    >
                      Creator page
                    </Link>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                    {message.body}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
