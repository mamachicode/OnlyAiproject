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

export default async function PrivateNsfwCreatorReviewPage({
  params,
}: PageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);

  await requireAdminPage(
    `/nsfw/creator/${encodeURIComponent(decodedUsername)}`
  );

  const creator = await prisma.creator.findFirst({
    where: {
      OR: [
        {
          handle: decodedUsername,
        },
        {
          user: {
            username: decodedUsername,
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
              _count: {
                select: {
                  likes: true,
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

  const publicHandle = creator.handle || creator.user.username;
  const displayName = creator.displayName || publicHandle;
  const posts = creator.user.posts;

  return (
    <main className="min-h-screen bg-[#080309] text-white">
      <section className="border-b border-red-400/15 bg-black/40">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Link
            href="/nsfw"
            className="text-sm font-bold text-zinc-400 hover:text-white"
          >
            ← Back to private NSFW review
          </Link>

          <div className="mt-6 rounded-3xl border border-amber-400/25 bg-amber-400/10 p-5">
            <p className="font-black text-amber-100">
              Private processor-review preview
            </p>
            <p className="mt-2 text-sm leading-6 text-amber-100/75">
              This storefront is visible only to authorized OnlyAi
              administrators and authorized processor reviewers. It is not
              public, it is excluded from search indexing, and checkout remains
              disabled.
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        {creator.bannerUrl ? (
          <div className="absolute inset-x-0 top-0 h-64 overflow-hidden opacity-35">
            <img
              src={creator.bannerUrl}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#080309]/70 to-[#080309]" />
          </div>
        ) : null}

        <div className="relative mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="h-28 w-28 overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-2xl">
              {creator.avatarUrl ? (
                <img
                  src={creator.avatarUrl}
                  alt={`${displayName} avatar`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-black text-red-200">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-red-300">
                18+ creator review
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                {displayName}
              </h1>

              <p className="mt-2 text-lg font-bold text-zinc-400">
                @{publicHandle}
              </p>

              {creator.bio ? (
                <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-300">
                  {creator.bio}
                </p>
              ) : (
                <p className="mt-5 text-sm text-zinc-500">
                  No creator bio has been added.
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-red-400/20 bg-red-500/10 px-6 py-5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-red-200">
                Review feed
              </p>
              <p className="mt-2 text-3xl font-black">{posts.length}</p>
              <p className="text-sm text-red-100/65">
                NSFW {posts.length === 1 ? "post" : "posts"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-red-300">
              Private adult feed
            </p>
            <h2 className="mt-2 text-3xl font-black">
              Private content preview
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              Adult creator content prepared for authorized compliance and
              processor review.
            </p>
          </div>

          <Link
            href={`/nsfw/subscribe/${encodeURIComponent(publicHandle)}`}
            className="rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-center text-sm font-black text-zinc-300 hover:bg-white/10"
          >
            Preview subscription page
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <p className="text-xl font-black text-white">
              No private content available yet
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
              No adult creator content has been published to this private
              review profile yet.
            </p>

            <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5 text-sm leading-6 text-amber-100/80">
              This creator page remains private. Public access and live billing
              are disabled during compliance and processor review.
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const gallery = post.media.map((item, index) => ({
                src: item.url,
                type: item.type,
                alt: `${post.title || "Private creator post"} media ${index + 1}`,
              }));

              return (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
                >
                  <div className="aspect-[4/5] bg-black/60">
                    {gallery.length > 0 ? (
                      <MediaLightbox media={gallery} />
                    ) : (
                      <div className="flex h-full items-center justify-center p-6 text-center text-sm font-bold text-zinc-600">
                        No media attached
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-xs font-black text-red-200">
                        Private 18+ content
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black ${
                          post.isLocked
                            ? "border-purple-400/25 bg-purple-500/10 text-purple-200"
                            : "border-white/10 bg-white/[0.05] text-zinc-300"
                        }`}
                      >
                        {post.isLocked ? "Locked" : "Free"}
                      </span>
                    </div>

                    <h3 className="mt-4 text-xl font-black">
                      {post.title || "Untitled post"}
                    </h3>

                    {post.content ? (
                      <p className="mt-3 line-clamp-4 text-sm leading-6 text-zinc-400">
                        {post.content}
                      </p>
                    ) : null}

                    <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-bold text-zinc-500">
                      <span>{formatDate(post.createdAt)}</span>
                      <span>
                        {post.media.length}{" "}
                        {post.media.length === 1 ? "item" : "items"}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
