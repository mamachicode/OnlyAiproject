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
    "Subscribe for private creator posts, updates, and members-only content.";
  const avatarUrl = creator?.avatarUrl || "";
  const bannerUrl = creator?.bannerUrl || "";
  const priceCents = creator?.priceCents ?? (user.sfwPrice || 5) * 100;
  const price = (priceCents / 100).toFixed(2);
  const posts = isCreatorSfw ? user.posts : [];

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

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="border-b border-white/10 px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href={fanUserId ? "/account" : "/"}
            className="text-sm text-zinc-400 hover:text-white"
          >
            ← OnlyAi
          </Link>

          <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950">
            <div className="h-56 bg-gradient-to-br from-pink-500/40 via-purple-600/20 to-black md:h-72">
              {bannerUrl ? (
                <img
                  src={bannerUrl}
                  alt={`${displayName} banner`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(147,51,234,0.25),transparent_35%)]">
                  <span className="text-sm font-semibold uppercase tracking-[0.35em] text-pink-200/70">
                    Creator profile
                  </span>
                </div>
              )}
            </div>

            <div className="grid gap-8 p-6 md:grid-cols-[1fr_280px] md:p-8">
              <div>
                <div className="-mt-20 h-32 w-32 overflow-hidden rounded-full border-4 border-zinc-950 bg-gradient-to-br from-pink-500 to-purple-600 shadow-2xl shadow-pink-500/20">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={`${displayName} avatar`}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>

                <p className="mt-6 text-sm uppercase tracking-[0.35em] text-pink-300">
                  Creator
                </p>

                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
                  {displayName}
                </h1>

                <p className="mt-2 text-zinc-400">@{publicHandle}</p>

                <p className="mt-5 max-w-2xl text-zinc-300">
                  {bio}
                </p>
              </div>

              <div className="self-start rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm text-zinc-400">Monthly access</p>
                <p className="mt-2 text-3xl font-semibold">${price}</p>

                {isCreatorSfw ? (
                  hasActiveSubscription ? (
                    <div className="mt-5 rounded-2xl border border-green-400/20 bg-green-400/10 p-4 text-center text-sm font-semibold text-green-100">
                      Active subscriber
                    </div>
                  ) : (
                    <Link
                      href={`/subscribe/${publicHandle}`}
                      className="mt-5 block rounded-full bg-pink-500 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-pink-400"
                    >
                      Subscribe
                    </Link>
                  )
                ) : (
                  <div className="mt-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-100">
                    This creator page is not available yet.
                  </div>
                )}

                <p className="mt-4 text-xs text-zinc-500">
                  Secure monthly subscription.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Posts</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Preview recent creator posts.
              </p>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-zinc-400">
              No posts yet.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                const firstMedia = post.media?.[0];
                const canViewPost = !post.isLocked || hasActiveSubscription;

                return (
                  <article
                    key={post.id}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950"
                  >
                    <div className="aspect-[4/5] bg-zinc-900">
                      {!canViewPost ? (
                        <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-black p-6 text-center">
                          <div className="mb-4 rounded-full border border-white/15 bg-black/40 px-5 py-3 text-sm font-semibold backdrop-blur">
                            🔒 Subscribe to unlock
                          </div>
                          <p className="max-w-xs text-sm text-zinc-300">
                            This post is available to subscribers.
                          </p>
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
                      <div className="mb-3 inline-flex rounded-full bg-pink-500/10 px-3 py-1 text-xs text-pink-200">
                        {post.isLocked
                          ? hasActiveSubscription
                            ? "Unlocked"
                            : "Subscribers only"
                          : "Free preview"}
                      </div>
                      <h3 className="line-clamp-2 font-semibold">
                        {post.title || "Members-only post"}
                      </h3>
                      {post.content ? (
                        <p className="mt-2 line-clamp-3 text-sm text-zinc-400">
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
