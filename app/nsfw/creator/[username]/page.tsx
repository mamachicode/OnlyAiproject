import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { requireAdminPage } from "@/src/lib/adminGuard";
import MediaLightbox from "@/app/public/creator/[username]/MediaLightbox";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    username: string;
  }>;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(value);
}

export default async function PrivateNsfwCreatorPage({
  params,
}: PageProps) {
  const { username } = await params;

  const handle = decodeURIComponent(username)
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();

  const admin = await requireAdminPage(
    `/nsfw/creator/${encodeURIComponent(handle)}`
  );

  const creator = await prisma.creator.findFirst({
    where: {
      OR: [
        {
          handle: {
            equals: handle,
            mode: "insensitive",
          },
        },
        {
          user: {
            username: {
              equals: handle,
              mode: "insensitive",
            },
          },
        },
      ],
    },
    include: {
      user: {
        include: {
          posts: {
            where: {
              isNsfw: true,
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

  if (!creator) {
    notFound();
  }

  const displayName =
    creator.nsfwDisplayName ||
    creator.displayName ||
    creator.handle ||
    creator.user.username;

  const publicHandle =
    creator.handle || creator.user.username;

  const bio =
    creator.nsfwBio ||
    creator.bio ||
    "Subscribe for private creator posts, exclusive adult image sets, and members-only releases.";

  const avatarUrl =
    creator.nsfwAvatarUrl ||
    creator.avatarUrl ||
    "";

  const bannerUrl =
    creator.nsfwBannerUrl ||
    creator.bannerUrl ||
    "";
  const posts = creator.user.posts;

  const priceDollars = Number(
    creator.user.nsfwPrice || 10
  );

  const price = (
    Number.isFinite(priceDollars) && priceDollars > 0
      ? priceDollars
      : 10
  ).toFixed(2);

  const lockedCount = posts.filter(
    (post) => post.isLocked
  ).length;

  const freeCount = posts.length - lockedCount;

  const isMasterAccount =
    admin.userId === creator.userId;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(127,29,29,0.28),transparent_38%),linear-gradient(180deg,#1a070b_0%,#0d0508_45%,#070305_100%)] text-white">
      <div className="border-b border-red-500/20 bg-black px-6 py-3 text-center text-sm font-black text-red-100">
        18+ area — age verification required
      </div>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/nsfw"
            className="text-sm font-bold text-zinc-400 hover:text-white"
          >
            ← Back to private NSFW review
          </Link>

          <div className="flex flex-col gap-2 sm:flex-row">
            {isMasterAccount ? (
              <>
                <Link
                  href="/admin/nsfw/profile"
                  className="rounded-full border border-white/10 bg-white/[0.05] px-5 py-2 text-center text-sm font-black text-white hover:bg-white/10"
                >
                  Edit NSFW profile
                </Link>

                <Link
                  href="/admin/nsfw/upload"
                  className="rounded-full border border-red-400/30 bg-red-500/15 px-5 py-2 text-center text-sm font-black text-red-100 hover:bg-red-500/25"
                >
                  Add post
                </Link>
              </>
            ) : null}

            <Link
              href={`/nsfw/subscribe/${encodeURIComponent(publicHandle)}`}
              className="rounded-full border border-white/10 bg-white/[0.05] px-5 py-2 text-center text-sm font-black text-white hover:bg-white/10"
            >
              Preview subscription page
            </Link>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[1.4rem] border border-white/10 bg-zinc-950/90 shadow-2xl shadow-red-950/20 sm:mt-7 sm:rounded-[2rem]">
          <div className="relative h-36 bg-gradient-to-br from-red-500/40 via-purple-600/20 to-black sm:h-60 md:h-80 lg:h-96">
            {bannerUrl ? (
              <img
                src={bannerUrl}
                alt={`${displayName} banner`}
                className="h-full w-full object-cover"
                style={{
                  objectPosition: "center 18%",
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(147,51,234,0.25),transparent_35%)]">
                <span className="text-sm font-semibold uppercase tracking-[0.35em] text-red-200/70">
                  Private 18+ creator
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
          </div>

          <div className="grid gap-5 p-4 sm:gap-6 sm:p-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:p-8">
            <div>
              <div className="-mt-10 flex min-w-0 flex-col gap-3 sm:-mt-14 sm:flex-row sm:items-end sm:gap-4">
                <div
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-zinc-950 bg-gradient-to-br from-red-500 to-purple-600 shadow-2xl shadow-red-500/20 ring-1 ring-white/10 sm:h-28 sm:w-28"
                  style={{
                    clipPath:
                      "circle(50% at 50% 50%)",
                  }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={`${displayName} avatar`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-black">
                      {displayName
                        ?.charAt(0)
                        .toUpperCase() || "O"}
                    </div>
                  )}
                </div>

                <div className="min-w-0 pb-1">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-red-300">
                    Private 18+ creator
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h1 className="break-words text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
                      {displayName}
                    </h1>

                    <span
                      className="inline-flex shrink-0 items-center rounded-md border border-red-400/40 bg-red-500/20 px-2.5 py-1 text-xs font-black uppercase tracking-[0.14em] text-red-100 shadow-lg shadow-red-950/30"
                      aria-label="Adult content creator"
                      title="Adult content"
                    >
                      18+
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-base font-semibold text-zinc-400">
                    <p>@{publicHandle}</p>
                    <span className="hidden text-zinc-700 sm:inline">
                      •
                    </span>
                    <p>
                      {posts.length} post
                      {posts.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 max-w-2xl whitespace-pre-line text-[1.05rem] font-medium leading-7 text-zinc-200/90 sm:mt-5 sm:text-xl sm:leading-8">
                {bio}
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold text-zinc-300">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                  {lockedCount} locked
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                  {freeCount} free
                </span>

                <span className="rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-red-100">
                  18+ content
                </span>
              </div>
            </div>

            <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm font-semibold text-zinc-500">
                Monthly access
              </p>

              <p className="mt-3 text-4xl font-black">
                ${price}
              </p>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Unlock private adult creator posts with a monthly membership.
              </p>

              <Link
                href={`/nsfw/subscribe/${encodeURIComponent(publicHandle)}`}
                className="mt-6 block w-full rounded-2xl bg-gradient-to-r from-red-500 to-purple-600 px-6 py-4 text-center text-base font-black text-white hover:opacity-90"
              >
                Subscribe
              </Link>

              <p className="mt-4 text-center text-xs leading-5 text-zinc-500">
                Payments remain unavailable during processor review.
              </p>
            </aside>
          </div>
        </div>

        <section className="mt-10">
          <div className="mb-7">
            <h2 className="text-3xl font-black">
              Creator posts
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Private adult posts available on this creator profile.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
              <p className="text-xl font-black">
                No posts yet
              </p>

              <p className="mt-3 text-sm leading-7 text-zinc-400">
                This creator has not published any private adult posts yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                const gallery = post.media.map(
                  (item, index) => ({
                    src: item.url,
                    type: item.type,
                    alt: `${post.title || "Creator post"} media ${index + 1}`,
                  })
                );

                return (
                  <article
                    key={post.id}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
                  >
                    {gallery.length > 0 ? (
                      <div className="aspect-[4/5] overflow-hidden bg-black">
                        <MediaLightbox
                          media={gallery}
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[4/5] items-center justify-center bg-black/40 text-sm font-bold text-zinc-500">
                        No media
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.15em]">
                        <span
                          className={
                            post.isLocked
                              ? "rounded-full bg-red-500/15 px-3 py-1 text-red-200"
                              : "rounded-full bg-white/10 px-3 py-1 text-zinc-300"
                          }
                        >
                          {post.isLocked
                            ? "Locked"
                            : "Free"}
                        </span>

                        {post.media.length > 1 ? (
                          <span className="rounded-full bg-white/10 px-3 py-1 text-zinc-300">
                            {post.media.length} items
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-4 text-xl font-black">
                        {post.title}
                      </h3>

                      {post.content ? (
                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-400">
                          {post.content}
                        </p>
                      ) : null}

                      <p className="mt-4 text-xs font-semibold text-zinc-600">
                        Published {formatDate(post.createdAt)}
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
