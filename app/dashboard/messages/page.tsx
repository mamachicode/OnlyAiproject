// @ts-nocheck
export const dynamic = "force-dynamic";

import { requireCreatorPage } from "@/src/lib/creatorGuard";
import { prisma } from "@/src/lib/prisma";

type MessagesPageProps = {
  searchParams?: Promise<{
    sent?: string;
    error?: string;
  }>;
};

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
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-pink-300">
          Creator messages
        </p>

        <h1 className="mt-4 text-4xl font-black">Message your fans</h1>

        <p className="mt-4 max-w-2xl text-zinc-400">
          Send SFW updates to active subscribers. This is the first OnlyAi messaging layer before full one-to-one DMs.
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-zinc-300">
          Active subscribers who can read your messages:{" "}
          <span className="font-black text-white">{activeSubscriberCount}</span>
        </div>

        {sent ? (
          <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-5 text-sm font-semibold text-green-200">
            Message sent to your subscriber inbox.
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm font-semibold text-red-200">
            {error === "missing"
              ? "Add a title and message before sending."
              : error}
          </div>
        ) : null}

        <form
          action="/api/creator/messages"
          method="POST"
          className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.05] p-6"
        >
          <label className="block">
            <span className="text-sm font-bold text-zinc-100">
              Message title
            </span>
            <input
              name="title"
              required
              maxLength={80}
              placeholder="New drop tonight"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 font-semibold text-white outline-none placeholder:text-zinc-600"
            />
          </label>

          <label className="mt-6 block">
            <span className="text-sm font-bold text-zinc-100">
              Message
            </span>
            <textarea
              name="body"
              required
              rows={6}
              maxLength={1000}
              placeholder="Write a private update for your subscribers..."
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 font-semibold text-white outline-none placeholder:text-zinc-600"
            />
          </label>

          <p className="mt-3 text-xs text-zinc-500">
            Keep messages SFW for the Stripe lane.
          </p>

          <button
            type="submit"
            className="mt-6 rounded-full bg-pink-500 px-6 py-3 text-sm font-black text-white hover:bg-pink-400"
          >
            Send message
          </button>
        </form>

        <section className="mt-10">
          <h2 className="text-2xl font-black">Recent messages</h2>

          {messages.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-6 text-zinc-400">
              No messages sent yet.
            </div>
          ) : (
            <div className="mt-5 grid gap-4">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className="rounded-3xl border border-white/10 bg-black/20 p-6"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className="text-xl font-black">{message.title}</h3>
                    <p className="text-xs text-zinc-500">
                      {message.createdAt.toLocaleString()}
                    </p>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                    {message.body}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
