// @ts-nocheck
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { requireAdminPage } from "@/src/lib/adminGuard";

type PageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export default async function ManualReviewPage({ params }: PageProps) {
  const { postId } = await params;

  await requireAdminPage(`/admin/manual-review/${postId}`);

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      media: {
        orderBy: {
          order: "asc",
        },
      },
      author: {
        include: {
          creator: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const handle =
    post.author?.creator?.handle ||
    post.author?.username ||
    "unknown";

  return (
    <main className="min-h-screen bg-[#07050d] text-white">
      <section className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300">
          Manual safety review
        </p>

        <h1 className="mt-4 text-4xl font-black">
          {post.title || "Untitled post"}
        </h1>

        <div className="mt-6 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-5">
          <p className="font-bold text-amber-100">
            This post was accepted because the automatic moderation quota was unavailable.
          </p>
          <p className="mt-2 text-sm text-amber-100/75">
            Review every newly uploaded image and confirm it follows the OnlyAi SFW rules.
          </p>
        </div>

        <div className="mt-8 grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Creator
            </p>
            <p className="mt-2 text-lg font-black">@{handle}</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Post ID
            </p>
            <p className="mt-2 break-all text-sm font-semibold text-zinc-300">
              {post.id}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Created
            </p>
            <p className="mt-2 text-sm font-semibold text-zinc-300">
              {post.createdAt.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Access
            </p>
            <p className="mt-2 text-sm font-semibold text-zinc-300">
              {post.isLocked ? "Members-only" : "Public"}
            </p>
          </div>
        </div>

        {post.content ? (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Description
            </p>
            <p className="mt-3 whitespace-pre-wrap leading-7 text-zinc-200">
              {post.content}
            </p>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/public/creator/${encodeURIComponent(handle)}`}
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-black hover:bg-white/10"
          >
            View creator profile
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {post.media.map((item, index) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-3xl border border-white/10 bg-black"
            >
              {item.type === "VIDEO" ? (
                <video
                  src={item.url}
                  controls
                  playsInline
                  className="max-h-[75vh] w-full object-contain"
                />
              ) : (
                <a href={item.url} target="_blank" rel="noreferrer">
                  <img
                    src={item.url}
                    alt={`Post media ${index + 1}`}
                    className="max-h-[75vh] w-full object-contain"
                  />
                </a>
              )}

              <div className="p-4">
                <p className="text-sm font-black">
                  Media {index + 1} · {item.type}
                </p>

                {item.publicId ? (
                  <p className="mt-2 break-all text-xs text-zinc-500">
                    {item.publicId}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
