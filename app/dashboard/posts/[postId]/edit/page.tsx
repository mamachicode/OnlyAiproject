// @ts-nocheck
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";

type PageProps = {
  params: Promise<{
    postId: string;
  }>;
  searchParams?: Promise<{
    saved?: string;
  }>;
};

export default async function EditPostPage({ params, searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/posts");
  }

  const { postId } = await params;
  const query = searchParams ? await searchParams : {};
  const saved = query?.saved === "1";

  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      authorId: session.user.id,
    },
    include: {
      media: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#07050d] text-white">
      <section className="mx-auto max-w-5xl px-6 py-12">
        <Link href="/dashboard/posts" className="text-sm text-zinc-400 hover:text-white">
          ← Back to posts
        </Link>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.35em] text-pink-300">
          Edit post
        </p>

        <h1 className="mt-4 text-4xl font-black">{post.title}</h1>

        {saved ? (
          <div className="mt-6 rounded-2xl border border-green-400/20 bg-green-400/10 p-4 text-sm font-bold text-green-100">
            Post saved.
          </div>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <form
            action="/api/posts/update"
            method="POST"
            encType="multipart/form-data"
            className="space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.05] p-6"
          >
            <input type="hidden" name="postId" value={post.id} />

            <div>
              <label className="block text-sm font-bold text-zinc-300">
                Title
              </label>
              <input
                name="title"
                defaultValue={post.title || ""}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-300">
                Caption / story text
              </label>
              <textarea
                name="content"
                rows={6}
                defaultValue={post.content || ""}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-zinc-600"
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm font-bold text-zinc-200">
              <input
                type="checkbox"
                name="isLocked"
                defaultChecked={post.isLocked}
                className="h-5 w-5"
              />
              Members-only locked post
            </label>

            <div>
              <label className="block text-sm font-bold text-zinc-300">
                Add more media to this post
              </label>
              <input
                name="files"
                type="file"
                accept="image/*,video/*"
                multiple
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white file:mr-4 file:rounded-full file:border-0 file:bg-pink-500 file:px-4 file:py-2 file:font-bold file:text-white"
              />
              <p className="mt-2 text-xs text-zinc-500">
                New files are appended to this post. Paid fans can browse them with arrows in the lightbox.
              </p>
            </div>

            <button
              type="submit"
              className="rounded-full bg-pink-500 px-6 py-3 text-sm font-black text-white hover:bg-pink-400"
            >
              Save post
            </button>
          </form>

          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5">
            <h2 className="text-xl font-black">Current media</h2>
            <p className="mt-2 text-sm text-zinc-500">
              {post.media.length} item{post.media.length === 1 ? "" : "s"} in this post.
            </p>

            <div className="mt-5 grid gap-4">
              {post.media.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-500">
                  No media attached.
                </div>
              ) : (
                post.media.map((item, index) => (
                  <div key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                    <div className="aspect-[4/5] bg-zinc-900">
                      {item.type === "VIDEO" ? (
                        <video src={item.url} controls className="h-full w-full object-cover" />
                      ) : (
                        <img src={item.url} alt={post.title || "Post media"} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="p-3 text-xs text-zinc-400">
                      Item {index + 1} · {item.type}
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
