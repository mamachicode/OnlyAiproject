// @ts-nocheck
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
import LogoutButton from "./LogoutButton";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account");
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
    redirect("/login?callbackUrl=/account");
  }

  const activeSubscriptions = user.subscriptions.filter(
    (sub) =>
      sub.status === "ACTIVE" &&
      (!sub.currentPeriodEnd || sub.currentPeriodEnd > new Date())
  );

  return (
    <main className="min-h-screen bg-[#07050d] text-white">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <nav className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="text-4xl font-black tracking-tight">
            Only<span className="text-pink-400">Ai</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            {user.creator ? (
              <Link
                href="/dashboard"
                className="rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm font-bold hover:bg-white/15"
              >
                Creator dashboard
              </Link>
            ) : (
              <Link
                href="/dashboard/settings"
                className="rounded-full border border-pink-400/30 bg-pink-500/15 px-5 py-2 text-sm font-bold text-pink-100 hover:bg-pink-500/25"
              >
                Become a creator
              </Link>
            )}

            <LogoutButton />
          </div>
        </nav>

        <div className="mt-16">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-pink-300">
            {user.creator ? "Creator account" : "Fan account"}
          </p>
          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Your OnlyAi account
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-400">
            {user.creator
              ? "Manage your creator tools and any creator subscriptions you support."
              : "Manage creator subscriptions and unlock private posts from the creators you support."}
          </p>
        </div>

        {user.creator ? (
          <div className="mt-10 rounded-[2rem] border border-pink-400/20 bg-pink-500/[0.06] p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-black">Creator tools</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Your creator profile is active. Manage posts, uploads, settings, and your public creator page.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-white px-5 py-3 text-center text-sm font-black text-black"
                >
                  Open dashboard
                </Link>

                <Link
                  href={`/public/creator/${user.creator.handle}`}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-black text-white hover:bg-white/10"
                >
                  View public page
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.05] p-6">
          <h2 className="text-2xl font-black">Your fan subscriptions</h2>

          {activeSubscriptions.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-6 text-zinc-400">
              You do not have active fan subscriptions yet.

            </div>
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
                          Open creator page
                        </Link>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
