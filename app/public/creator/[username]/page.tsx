import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
import MediaLightbox from "./MediaLightbox";

type PageProps = {
  params: Promise<{
    username: string;
  }>;
};

function formatPrice(priceCents: number) {
  return (priceCents / 100).toFixed(2);
}

export default async function PublicCreatorPage({ params }: PageProps) {
  const { username } = await params;
  const handle = decodeURIComponent(username);

  const session = await getServerSession(authOptions);
  const fanUserId = (session?.user as { id?: string } | undefined)?.id;

  const creator = await prisma.creator.findFirst({
    where: {
      OR: [
        { handle },
        {
          user: {
            username: handle,
          },
        },
      ],
    },
    include: {
      user: {
        include: {
          posts: {
            where: {
              isNsfw: false,
            },
            orderBy: {
              createdAt: "desc",
            },
            include: {
              media: {
                orderBy: {
                  order: "asc",
                },
              },
            },
          },
        },
      },
    },
  });

  const fallbackUser = creator
    ? null
    : await prisma.user.findUnique({
        where: {
          username: handle,
        },
        include: {
          posts: {
            where: {
              isNsfw: false,
            },
            orderBy: {
              createdAt: "desc",
            },
            include: {
              media: {
                orderBy: {
                  order: "asc",
                },
              },
            },
          },
        },
      });

  const user = creator?.user || fallbackUser;

  if (!user) {
    notFound();
  }

  const isCreatorSfw = !creator || creator.classification === "SFW";
  const displayName = creator?.displayName || user.username;
  const publicHandle = creator?.handle || user.username;
  const bio =
    creator?.bio ||
    "Subscribe for private creator posts, fan-only updates, and members-only drops.";
  const avatarUrl = creator?.avatarUrl || "";
  const bannerUrl = creator?.bannerUrl || "";
  const priceCents = creator?.priceCents ?? (user.sfwPrice || 5) * 100;
  const price = formatPrice(priceCents);
  const posts = isCreatorSfw ? user.posts : [];
  const lockedCount = posts.filter((post) => post.isLocked).length;
  const freeCount = posts.length - lockedCount;

  const activeSubscription =
    fanUserId && creator
      ? await prisma.subscription.findFirst({
          where: {
            userId: fanUserId,
            creatorId: creator.id,
            processor: "STRIPE",
            status: "ACTIVE",
            OR: [
              { currentPeriodEnd: null },
              { currentPeriodEnd: { gt: new Date() } },
            ],
          },
        })
      : null;

  const hasActiveSubscription = Boolean(activeSubscription);
  const isOwner = Boolean(fanUserId && creator?.userId === fanUserId);

  return (
    <main className="min-h-screen bg-[#07050d] text-white">
      <section className="relative overflow-hidden border-b border-white/10 px-4 py-4 sm:px-6 sm:py-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(147,51,234,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_28%)]" />

        <div className="relative mx-auto max-w-5xl">
          <div className="flex items-center justify-between gap-4">
            <Link
              href={fanUserId ? "/account" : "/"}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-zinc-300 hover:bg-white/[0.08] hover:text-white"
            >
              ← OnlyAi
            </Link>

            {isOwner ? (
              <Link
                href="/dashboard"
                className="rounded-full bg-white px-5 py-2 text-sm font-black text-black hover:bg-zinc-200"
              >
                Dashboard
              </Link>
            ) : null}
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-950/90 shadow-2xl shadow-pink-950/20 sm:rounded-[2rem]">
            <div className="relative h-40 bg-gradient-to-br from-pink-500/40 via-purple-600/20 to-black sm:h-52 md:h-64">
              {bannerUrl ? (
                <img
                  src={bannerUrl}
                  alt={`${displayName} banner`}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: "center 18%" }}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(147,51,234,0.25),transparent_35%)]">
                  <span className="text-sm font-semibold uppercase tracking-[0.35em] text-pink-200/70">
                    Creator profile
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
            </div>

            <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-7">
              <div>
                <div className="-mt-10 flex min-w-0 flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end">
                  <div
                    className="relative h-[96px] w-[96px] min-h-[96px] min-w-[96px] max-h-[96px] max-w-[96px] shrink-0 overflow-hidden rounded-[9999px] border-4 border-zinc-950 bg-gradient-to-br from-pink-500 to-purple-600 shadow-2xl shadow-pink-500/20 ring-1 ring-white/10"
                    style={{ clipPath: "circle(50% at 50% 50%)" }}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={`${displayName} avatar`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl font-black">
                        {displayName?.[0]?.toUpperCase() || "O"}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 pb-1">

                    <h1 className="mt-3 break-words text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                      {displayName}
                    </h1>

                    <p className="mt-2 text-base font-semibold text-zinc-400">
                      @{publicHandle}
                    </p>
                  </div>
                </div>

                <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
                  {bio}
                </p>

                <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
                  <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-bold text-zinc-200">
                    {isOwner
                      ? `🔒 ${lockedCount} locked posts`
                      : `🔒 ${lockedCount} member posts`}
                  </div>

                  {freeCount > 0 ? (
                    <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-bold text-zinc-200">
                      ✨ {freeCount} previews
                    </div>
                  ) : (
                    <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-bold text-zinc-200">
                      ✨ Private feed
                    </div>
                  )}

                  <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-bold text-zinc-200">
                    💌 Creator updates
                  </div>
                </div>

                {isOwner ? (
                  <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-pink-400/20 bg-pink-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-black text-white">
                        Creator preview
                      </p>
                      <p className="mt-1 text-sm text-pink-100/75">
                        This is what fans see before subscribing.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                      <Link
                        href="/dashboard/settings"
                        className="rounded-full bg-white px-4 py-2 text-center text-sm font-black text-black hover:bg-zinc-200"
                      >
                        Edit profile
                      </Link>
                      <Link
                        href="/dashboard/upload"
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-black text-white hover:bg-white/10"
                      >
                        Add post
                      </Link>
                      <Link
                        href="/dashboard/subscribers"
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-black text-white hover:bg-white/10"
                      >
                        View subscribers
                      </Link>

                      <Link
                        href="/dashboard/messages"
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-black text-white hover:bg-white/10"
                      >
                        Message fans
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>

              <aside className="self-start rounded-[1.5rem] border border-pink-400/20 bg-gradient-to-br from-pink-500/[0.14] via-white/[0.06] to-purple-500/[0.1] p-5 shadow-xl shadow-pink-950/20 sm:p-6 lg:sticky lg:top-6">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-200">
                  Monthly membership
                </p>

                <div className="mt-3 flex items-end gap-2">
                  <p className="text-4xl font-black sm:text-5xl">${price}</p>
                  <p className="pb-2 text-sm font-bold text-zinc-400">
                    /month
                  </p>
                </div>

                <p className="mt-4 text-sm leading-6 text-zinc-300">
                  Unlock members-only posts, previews, and creator updates from @{publicHandle}.
                </p>

                {isOwner ? (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-zinc-300">
                    <p className="font-black text-white">Fan subscription preview</p>
                    <p className="mt-1">
                      Fans will see the subscribe button here. Manage your page from the creator preview tools.
                    </p>
                  </div>
                ) : isCreatorSfw ? (
                  hasActiveSubscription ? (
                    <div className="mt-5 rounded-2xl border border-green-400/20 bg-green-400/10 p-4 text-center text-sm font-black text-green-100">
                      Active subscriber
                    </div>
                  ) : (
                    <Link
                      href={`/subscribe/${publicHandle}`}
                      className="mt-5 block rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4 text-center text-base font-black text-white shadow-lg shadow-pink-950/30 transition hover:scale-[1.01] hover:from-pink-400 hover:to-purple-500"
                    >
                      Subscribe now — ${price}/month
                    </Link>
                  )
                ) : (
                  <div className="mt-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-100">
                    This creator page is not available yet.
                  </div>
                )}

                <div className="mt-5 space-y-3 text-sm text-zinc-300">
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="font-black text-white">🔒 Unlock the feed</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Access locked posts once your subscription is active.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="font-black text-white">💌 Creator updates</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Receive private broadcast messages from the creator.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="font-black text-white">🛡️ Secure checkout</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Stripe-powered monthly access. Cancel anytime.
                    </p>
                  </div>
                </div>



                <p className="mt-4 text-xs leading-5 text-zinc-500">
                  {isOwner
                    ? "Fans will see subscribe or subscriber status here."
                    : "Secure monthly access. Cancel anytime."}
                </p>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-pink-300">
                Creator feed
              </p>
              <h2 className="mt-2 text-3xl font-black">Latest posts</h2>
              <p className="mt-2 text-sm text-zinc-400">
                {isOwner
                  ? "Owner preview: subscribers can unlock your private posts."
                  : hasActiveSubscription
                    ? "You have active access to this creator feed."
                    : "Preview the feed and subscribe to unlock members-only posts."}
              </p>
            </div>

            {!isOwner && isCreatorSfw && !hasActiveSubscription ? (
              <Link
                href={`/subscribe/${publicHandle}`}
                className="rounded-full bg-white px-5 py-3 text-center text-sm font-black text-black hover:bg-zinc-200"
              >
                Unlock full feed
              </Link>
            ) : null}
          </div>

          {posts.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-zinc-400">
              <p className="text-lg font-black text-white">No posts yet.</p>
              <p className="mt-2 text-sm">
                This creator has not published preview posts yet.
              </p>

              {isOwner ? (
                <Link
                  href="/dashboard/upload"
                  className="mt-5 inline-flex rounded-full bg-pink-500 px-5 py-3 text-sm font-black text-white hover:bg-pink-400"
                >
                  Add your first post
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                const firstMedia = post.media?.[0];
                const canViewPost =
                  isOwner || !post.isLocked || hasActiveSubscription;

                return (
                  <article
                    key={post.id}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-xl shadow-black/20 transition hover:border-pink-400/25"
                  >
                    <div className="aspect-[4/5] bg-zinc-900">
                      {!canViewPost ? (
                        <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-black p-6 text-center">
                          <div className="mb-4 rounded-full border border-white/15 bg-black/40 px-5 py-3 text-sm font-black backdrop-blur">
                            🔒 Members only
                          </div>
                          <p className="max-w-xs text-sm leading-6 text-zinc-300">
                            Subscribe to unlock this creator drop.
                          </p>

                          {!isOwner && isCreatorSfw ? (
                            <Link
                              href={`/subscribe/${publicHandle}`}
                              className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-black text-black hover:bg-zinc-200"
                            >
                              Unlock for ${price}/month
                            </Link>
                          ) : null}
                        </div>
                      ) : firstMedia?.url ? (
                        <MediaLightbox
                          media={post.media.map((item: any) => ({
                            src: item.url,
                            type: item.type,
                            alt: post.title || "OnlyAi creator post",
                          }))}
                          initialIndex={0}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                          Creator post
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="mb-3 inline-flex rounded-full bg-pink-500/10 px-3 py-1 text-xs font-bold text-pink-200">
                        {post.isLocked
                          ? canViewPost
                            ? "Unlocked"
                            : "Subscribers only"
                          : "Free preview"}
                      </div>

                      <h3 className="line-clamp-2 text-lg font-black">
                        {post.title || "Members-only post"}
                      </h3>

                      {post.content ? (
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">
                          {post.content}
                        </p>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
