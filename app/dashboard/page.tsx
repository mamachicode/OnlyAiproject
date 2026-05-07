// @ts-nocheck
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      creator: true,
      subscriptions: {
        orderBy: { createdAt: "desc" },
        include: {
          creator: {
            select: {
              handle: true,
              displayName: true,
              classification: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  if (!user.creator) {
    const activeSubscriptions = user.subscriptions.filter(
      (sub) =>
        sub.status === "ACTIVE" &&
        (!sub.currentPeriodEnd || sub.currentPeriodEnd > new Date())
    );

    return (
      <div className="p-6 md:p-10">
        <div className="max-w-6xl">
          <p className="text-sm font-semibold text-pink-300">
            OnlyAi fan account
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
            Fan Dashboard
          </h1>

          <p className="mt-4 max-w-2xl text-zinc-400">
            Welcome back, @{user.username}. Manage your subscriptions and unlock private creator posts.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Link
              href="/account"
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:bg-white/[0.07]"
            >
              <p className="text-2xl font-black">My subscriptions</p>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                View creators you support.
              </p>
            </Link>

            <Link
              href="/public/creator/demolitionbaby"
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:bg-white/[0.07]"
            >
              <p className="text-2xl font-black">Unlocked creator</p>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Open your active creator subscription.
              </p>
            </Link>

            <Link
              href="/dashboard/settings"
              className="rounded-3xl border border-pink-400/20 bg-pink-500/10 p-6 transition hover:bg-pink-500/15"
            >
              <p className="text-2xl font-black">Become a creator</p>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Start your own creator page when ready.
              </p>
            </Link>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">Active subscriptions</h2>

            {activeSubscriptions.length === 0 ? (
              <p className="mt-4 text-zinc-400">
                You do not have active subscriptions yet.
              </p>
            ) : (
              <div className="mt-6 grid gap-4">
                {activeSubscriptions.map((sub) => {
                  const creatorHandle = sub.creator?.handle;
                  const creatorName =
                    sub.creator?.displayName || creatorHandle || "Creator";

                  return (
                    <div
                      key={sub.id}
                      className="rounded-3xl border border-white/10 bg-black/20 p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-black">{creatorName}</p>
                          <p className="mt-1 text-sm text-zinc-500">
                            Status: {sub.status}
                          </p>
                        </div>

                        {creatorHandle ? (
                          <Link
                            href={`/public/creator/${creatorHandle}`}
                            className="rounded-full bg-white px-5 py-3 text-center text-sm font-black text-black"
                          >
                            View unlocked posts
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const creatorHandle = user.creator.handle || user.username;
  const creatorPath = `/public/creator/${creatorHandle}`;

  const cards = [
    {
      title: "Creator settings",
      detail: "Set your handle and monthly price.",
      href: "/dashboard/settings",
    },
    {
      title: "Upload post",
      detail: "Add a private creator post.",
      href: "/dashboard/upload",
    },
    {
      title: "Your posts",
      detail: "Review your uploaded creator content.",
      href: "/dashboard/posts",
    },
  ];

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl">
        <p className="text-sm font-semibold text-pink-300">
          OnlyAi creator system
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
          Creator Dashboard
        </h1>

        <p className="mt-4 max-w-2xl text-zinc-400">
          Welcome back, @{creatorHandle}. Upload posts, manage your page, and prepare your membership for subscribers.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {cards.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:bg-white/[0.07]"
            >
              <p className="text-2xl font-black">{item.title}</p>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {item.detail}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-pink-500/15 via-purple-500/10 to-white/[0.03] p-6">
          <p className="text-sm font-semibold text-zinc-400">
            Your creator page
          </p>

          <h2 className="mt-2 text-2xl font-black">@{creatorHandle}</h2>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/settings"
              className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-center font-black text-white"
            >
              Edit settings
            </Link>

            <Link
              href={creatorPath}
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-center font-black text-white hover:bg-white/10"
            >
              View public page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
