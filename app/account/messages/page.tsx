// @ts-nocheck
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
import LogoutButton from "../LogoutButton";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function getInitials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

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
      <section className="mx-auto max-w-6xl px-6 py-10">
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

        <div className="mt-14 overflow-hidden rounded-[2.25rem] border border-pink-400/15 bg-gradient-to-br from-pink-500/[0.14] via-purple-500/[0.08] to-white/[0.03] p-8 shadow-2xl shadow-pink-950/20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-pink-300">
                Fan inbox
              </p>

              <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">
                Creator messages
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
                Private subscriber-only updates from the creators you support.
                New drops, creator notes, and fan updates appear here.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-72">
              <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                <p className="text-3xl font-black">{subscriptions.length}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                  Active subs
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                <p className="text-3xl font-black">{messages.length}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                  Messages
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 sm:p-6">
          {messages.length === 0 ? (
            <div className="rounded-[1.75rem] border border-white/10 bg-black/25 p-8 text-zinc-400">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/15 text-2xl">
                💌
              </div>

              <p className="mt-6 text-2xl font-black text-white">
                No messages yet.
              </p>

              <p className="mt-3 max-w-xl text-sm leading-6">
                When creators you subscribe to send private updates, they will
                appear here. Keep supporting creators and check back after new
                posts or drops.
              </p>

              <Link
                href="/account"
                className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-black hover:bg-zinc-200"
              >
                Back to account
              </Link>
            </div>
          ) : (
            <div className="grid gap-5">
              {messages.map((message) => {
                const creatorName =
                  message.creator.displayName || message.creator.handle || "Creator";
                const creatorHandle = message.creator.handle;

                return (
                  <article
                    key={message.id}
                    className="overflow-hidden rounded-[1.9rem] border border-white/10 bg-black/30 shadow-xl shadow-black/20 transition hover:border-pink-400/25 hover:bg-black/40"
                  >
                    <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-pink-400/30 bg-gradient-to-br from-pink-500 to-purple-700 text-lg font-black text-white shadow-lg shadow-pink-950/30">
                          {message.creator.avatarUrl ? (
                            <img
                              src={message.creator.avatarUrl}
                              alt={`${creatorName} avatar`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            getInitials(creatorName)
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="rounded-full border border-pink-400/20 bg-pink-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-pink-200">
                              Subscriber update
                            </p>

                            <p className="text-xs font-semibold text-zinc-500">
                              {formatDate(message.createdAt)}
                            </p>
                          </div>

                          <p className="mt-3 text-sm font-bold text-zinc-400">
                            From{" "}
                            <span className="text-white">{creatorName}</span>
                          </p>

                          <h2 className="mt-2 max-w-3xl text-2xl font-black leading-tight text-white">
                            {message.title}
                          </h2>
                        </div>
                      </div>

                      {creatorHandle ? (
                        <Link
                          href={`/public/creator/${creatorHandle}`}
                          className="inline-flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-white px-5 py-3 text-sm font-black text-black hover:bg-zinc-200"
                        >
                          View creator
                        </Link>
                      ) : null}
                    </div>

                    <div className="border-t border-white/10 px-6 py-5">
                      <p className="whitespace-pre-wrap text-base leading-7 text-zinc-300">
                        {message.body}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
