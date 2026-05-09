// @ts-nocheck
export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireCreatorPage } from "@/src/lib/creatorGuard";
import { prisma } from "@/src/lib/prisma";

type MessagesPageProps = {
  searchParams?: Promise<{
    sent?: string;
    error?: string;
  }>;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function getErrorMessage(error: string) {
  if (error === "missing") return "Add a title and message before sending.";
  if (error === "sendfailed") {
    return "Could not send that message. Keep it clean, subscriber-safe, and try again.";
  }

  return "Could not send that message. Please try again.";
}

export default async function CreatorMessagesPage({
  searchParams,
}: MessagesPageProps) {
  const creatorAccess = await requireCreatorPage("/dashboard/messages");
  const params = await Promise.resolve(searchParams);

  const sent = params?.sent === "1";
  const error = params?.error || "";

  const activeSubscriberCount = await prisma.subscription.count({
    where: {
      creatorId: creatorAccess.creatorId,
      processor: "STRIPE",
      status: "ACTIVE",
      OR: [
        { currentPeriodEnd: null },
        { currentPeriodEnd: { gt: new Date() } },
      ],
    },
  });

  const messages = await prisma.creatorMessage.findMany({
    where: {
      creatorId: creatorAccess.creatorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 25,
  });

  return (
    <main className="min-h-screen bg-[#07050d] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-pink-300">
              Creator messages
            </p>

            <h1 className="mt-4 text-5xl font-black tracking-tight">
              Message your fans
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              Send polished subscriber-only updates to active fans. Perfect for
              new drops, schedule notes, previews, and creator announcements.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white hover:bg-white/10"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-pink-400/20 bg-pink-500/[0.08] p-6">
            <p className="text-4xl font-black">{activeSubscriberCount}</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-pink-200">
              Active readers
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Fans with active subscriptions who can see your messages.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6">
            <p className="text-4xl font-black">{messages.length}</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
              Recent messages
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Your latest broadcast updates shown inside fan inboxes.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6">
            <p className="text-4xl font-black">SFW</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
              Current lane
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Keep creator messages clean and subscriber-safe for launch.
            </p>
          </div>
        </div>

        {sent ? (
          <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-5 text-sm font-semibold text-green-200">
            Message sent. Active subscribers can now read it in their fan inbox.
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm font-semibold text-red-200">
            {getErrorMessage(error)}
          </div>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form
            action="/api/creator/messages"
            method="POST"
            className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/20"
          >
            <div className="mb-6 rounded-3xl border border-pink-400/15 bg-pink-500/[0.07] p-5">
              <p className="text-lg font-black">Broadcast update</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                This sends one private update to all currently active
                subscribers. Full one-to-one DMs can come later.
              </p>
            </div>

            <label className="block">
              <span className="text-sm font-bold text-zinc-100">
                Message title
              </span>
              <input
                name="title"
                required
                maxLength={80}
                placeholder="New drop tonight"
                className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 font-semibold text-white outline-none placeholder:text-zinc-600 focus:border-pink-400/40"
              />
            </label>

            <label className="mt-6 block">
              <span className="text-sm font-bold text-zinc-100">
                Message
              </span>
              <textarea
                name="body"
                required
                rows={8}
                maxLength={1000}
                placeholder="Write a private update for your subscribers..."
                className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-5 py-4 font-semibold leading-7 text-white outline-none placeholder:text-zinc-600 focus:border-pink-400/40"
              />
            </label>

            <p className="mt-3 text-xs leading-5 text-zinc-500">
              Launch rule: keep messages clean, premium, and subscriber-safe.
              Use this for updates, previews, announcements, and creator notes.
            </p>

            <button
              type="submit"
              className="mt-6 rounded-full bg-pink-500 px-7 py-3 text-sm font-black text-white shadow-lg shadow-pink-950/30 hover:bg-pink-400"
            >
              Send to active subscribers
            </button>
          </form>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black">Recent messages</h2>
              <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-bold text-zinc-400">
                Latest 25
              </span>
            </div>

            {messages.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-6 text-zinc-400">
                <p className="font-bold text-white">No messages sent yet.</p>
                <p className="mt-2 text-sm leading-6">
                  Send your first creator update when you are ready to test the
                  fan inbox experience.
                </p>
              </div>
            ) : (
              <div className="mt-5 grid gap-4">
                {messages.map((message) => (
                  <article
                    key={message.id}
                    className="rounded-3xl border border-white/10 bg-black/25 p-5"
                  >
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold text-zinc-500">
                        {formatDate(message.createdAt)}
                      </p>
                      <h3 className="text-xl font-black leading-tight">
                        {message.title}
                      </h3>
                    </div>

                    <p className="mt-3 max-h-36 overflow-hidden whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                      {message.body}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
