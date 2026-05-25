// @ts-nocheck
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";

function formatDate(value) {
  if (!value) return "Active";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(value);
}

export default async function SubscribersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/subscribers");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      creator: true,
    },
  });

  if (!user?.creator) {
    redirect("/dashboard/settings");
  }

  const subscriptions = await prisma.subscription.findMany({
    where: {
      creatorId: user.creator.id,
      status: "ACTIVE",
      OR: [
        { currentPeriodEnd: null },
        { currentPeriodEnd: { gt: new Date() } },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          username: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-5xl">
        <p className="text-sm font-semibold text-pink-300">
          Creator members
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
          Subscribers
        </h1>

        <p className="mt-4 max-w-2xl text-zinc-400">
          View fans with active monthly access to your creator page.
        </p>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-2xl font-black">
                {subscriptions.length} active subscriber{subscriptions.length === 1 ? "" : "s"}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                @{user.creator.handle}
              </p>
            </div>

            <Link
              href="/dashboard/messages"
              className="rounded-full bg-white px-5 py-3 text-center text-sm font-black text-black hover:bg-zinc-200"
            >
              Message fans
            </Link>
          </div>
        </div>

        {subscriptions.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-2xl font-black">No active subscribers yet</h2>
            <p className="mt-3 text-zinc-400">
              Active members will appear here after they subscribe.
            </p>

            <Link
              href={`/public/creator/${user.creator.handle}`}
              className="mt-5 inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white hover:bg-white/10"
            >
              View public page
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="rounded-3xl border border-white/10 bg-black/20 p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-black">
                      @{sub.user?.username || "fan"}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {sub.user?.email}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="inline-flex rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-sm font-black text-green-100">
                      Active
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      Renews until {formatDate(sub.currentPeriodEnd)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
