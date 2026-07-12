// @ts-nocheck
export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { requireAdminPage } from "@/src/lib/adminGuard";

export default async function ManualReviewQueuePage() {
  await requireAdminPage("/admin/manual-review");

  const reviews = await prisma.moderationReview.findMany({
    orderBy: [
      { status: "asc" },
      { createdAt: "asc" },
    ],
    include: {
      post: {
        include: {
          author: {
            include: {
              creator: true,
            },
          },
          media: {
            orderBy: {
              order: "asc",
            },
            take: 1,
          },
        },
      },
    },
  });

  const pendingCount = reviews.filter(
    (review) => review.status === "PENDING"
  ).length;

  return (
    <main className="min-h-screen bg-[#07050d] text-white">
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300">
          OnlyAi admin
        </p>

        <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-4xl font-black">Manual review queue</h1>
            <p className="mt-3 text-zinc-400">
              Review flagged uploads from every OnlyAi creator.
            </p>
          </div>

          <div className="rounded-full border border-amber-400/25 bg-amber-400/10 px-5 py-3 text-sm font-black text-amber-100">
            {pendingCount} pending
          </div>
        </div>

        <div className="mt-10 space-y-4">
          {reviews.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-zinc-400">
              No moderation reviews have been recorded yet.
            </div>
          ) : (
            reviews.map((review) => {
              const handle =
                review.post?.author?.creator?.handle ||
                review.post?.author?.username ||
                review.creatorHandle ||
                "unknown";

              const thumbnail = review.post?.media?.[0] || null;

              const title =
                review.post?.title ||
                review.postTitle ||
                "Removed post";

              return (
                <article
                  key={review.id}
                  className="grid gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5 md:grid-cols-[140px_1fr_auto]"
                >
                  <div className="aspect-square overflow-hidden rounded-2xl bg-black">
                    {thumbnail?.type === "VIDEO" ? (
                      <video
                        src={thumbnail.url}
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : thumbnail ? (
                      <img
                        src={thumbnail.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-600">
                        No media
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={
                          review.status === "PENDING"
                            ? "rounded-full bg-amber-400/15 px-3 py-1 text-xs font-black text-amber-200"
                            : review.status === "APPROVED"
                              ? "rounded-full bg-green-400/15 px-3 py-1 text-xs font-black text-green-200"
                              : "rounded-full bg-red-400/15 px-3 py-1 text-xs font-black text-red-200"
                        }
                      >
                        {review.status}
                      </span>

                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        {review.source === "post_update" ? "Post update" : "New post"}
                      </span>
                    </div>

                    <h2 className="mt-3 text-xl font-black">
                      {title}
                    </h2>

                    <p className="mt-2 text-sm text-zinc-400">
                      Creator: @{handle}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      {review.createdAt.toLocaleString()}
                    </p>

                    <p className="mt-3 text-sm text-zinc-300">
                      {review.reason}
                    </p>
                  </div>

                  <div className="flex items-center">
                    {review.postId && review.post ? (
                      <Link
                        href={`/admin/manual-review/${review.postId}`}
                        className="rounded-full bg-amber-300 px-5 py-3 text-sm font-black text-black hover:bg-amber-200"
                      >
                        {review.status === "PENDING"
                          ? "Review post"
                          : "View post"}
                      </Link>
                    ) : (
                      <span className="rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-500">
                        Post removed
                      </span>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
