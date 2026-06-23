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

  const activeMemberCount = creator
    ? await prisma.subscription.count({
        where: {
          creatorId: creator.id,
          processor: "STRIPE",
          status: "ACTIVE",
          OR: [
            { currentPeriodEnd: null },
            { currentPeriodEnd: { gt: new Date() } },
          ],
        },
      })
    : 0;

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
      <section className="relative overflow-hidden border-b border-white/10 px-3 py-3 sm:px-6 sm:py-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(147,51,234,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_28%)]" />

        <div className="relative mx-auto max-w-6xl">
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

          <div className="mt-4 overflow-hidden rounded-[1.4rem] border border-white/10 bg-zinc-950/90 shadow-2xl shadow-pink-950/20 sm:mt-5 sm:rounded-[2rem]">
            <div className="relative h-36 bg-gradient-to-br from-pink-500/40 via-purple-600/20 to-black sm:h-60 md:h-80 lg:h-96">
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

            <div className="grid gap-5 p-4 sm:gap-6 sm:p-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:p-8">
              <div>
                <div className="-mt-10 flex min-w-0 flex-col gap-3 sm:-mt-14 sm:flex-row sm:items-end sm:gap-4">
                  <div
                    className="relative h-24 w-24 min-h-24 min-w-24 max-h-24 max-w-24 shrink-0 overflow-hidden rounded-[9999px] border-4 border-zinc-950 bg-gradient-to-br from-pink-500 to-purple-600 shadow-2xl shadow-pink-500/20 ring-1 ring-white/10 sm:h-[112px] sm:w-[112px] sm:min-h-[112px] sm:min-w-[112px] sm:max-h-[112px] sm:max-w-[112px]"
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

                    <h1 className="mt-2 break-words text-4xl font-black tracking-tight sm:mt-3 sm:text-5xl md:text-6xl">
                      {displayName}
                    </h1>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-base font-semibold text-zinc-400">
                      <p>@{publicHandle}</p>
                      <span className="hidden text-zinc-700 sm:inline">•</span>
                      <p>
                        {activeMemberCount} member{activeMemberCount === 1 ? "" : "s"}{" · "}
                        {posts.length} post{posts.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-4 max-w-2xl whitespace-pre-line text-[1.05rem] font-medium leading-7 tracking-[0.01em] text-zinc-200/90 sm:mt-5 sm:text-xl sm:leading-8">
                  {bio}
                </p>


                {isOwner ? (
                  <div className="mt-4 rounded-2xl border border-pink-400/20 bg-pink-500/10 p-3 sm:mt-6 sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-4">
                    <div>
                      <p className="text-sm font-black text-white">
                        Creator tools
                      </p>
                      <p className="mt-1 hidden text-sm text-pink-100/75 sm:block">
                        Manage your profile, posts, subscribers, and fan messages.
                      </p>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-0 sm:flex sm:flex-row sm:flex-wrap sm:justify-end">
                      <Link
                        href="/dashboard/settings"
                        className="rounded-full bg-white px-3 py-2 text-center text-xs font-black text-black hover:bg-zinc-200 sm:px-4 sm:text-sm"
                      >
                        Edit profile
                      </Link>
                      <Link
                        href="/dashboard/upload"
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-black text-white hover:bg-white/10 sm:px-4 sm:text-sm"
                      >
                        Add post
                      </Link>
                      <Link
                        href="/dashboard/subscribers"
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-black text-white hover:bg-white/10 sm:px-4 sm:text-sm"
                      >
                        View subscribers
                      </Link>

                      <Link
                        href="/dashboard/messages"
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-black text-white hover:bg-white/10 sm:px-4 sm:text-sm"
                      >
                        Message fans
                      </Link>
                    </div>
                  </div>
                ) : null}

                {isOwner ? (
                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-pink-400/20 bg-white/[0.04] px-4 py-3 sm:hidden">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-200">
                        Membership
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Subscription price
                      </p>
                    </div>

                    <p className="text-lg font-black text-white">
                      ${price}<span className="text-xs text-zinc-500">/mo</span>
                    </p>
                  </div>
                ) : null}
              </div>

              <aside className={`self-start rounded-[1.25rem] border border-pink-400/20 bg-gradient-to-br from-pink-500/[0.14] via-white/[0.06] to-purple-500/[0.1] p-4 shadow-xl shadow-pink-950/20 sm:rounded-[1.5rem] sm:p-6 lg:sticky lg:top-6 ${isOwner ? "hidden sm:block" : ""}`}>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-pink-200 sm:text-sm">
                  {isOwner ? "Membership" : "Monthly membership"}
                </p>

                <div className="mt-2 flex items-end gap-2 sm:mt-3">
                  <p className="text-3xl font-black sm:text-5xl">${price}</p>
                  <p className="pb-1 text-sm font-bold text-zinc-400 sm:pb-2">
                    /month
                  </p>
                </div>

                <p className="mt-3 text-xs leading-5 text-zinc-300 sm:mt-4 sm:text-sm sm:leading-6">
                  {isOwner
                    ? "Your monthly subscription price."
                    : `Unlock private posts and creator updates from @${publicHandle}.`}
                </p>

                {isOwner ? null : isCreatorSfw ? (
                  hasActiveSubscription ? (
                    <p className="mt-5 text-center text-sm font-semibold text-zinc-100">
                      Active subscriber — access unlocked
                    </p>
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

                {!isOwner && isCreatorSfw ? (
                  <div className="mt-4 space-y-3 text-center text-xs leading-5 text-zinc-500">
                    <p>Cancel anytime.</p>
                    <Link
                      href="/contact"
                      className="inline-flex font-bold text-pink-200 hover:text-pink-100"
                    >
                      Need help with checkout, login, or locked posts?
                    </Link>
                  </div>
                ) : null}
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
