"use client";

import Link from "next/link";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Post = {
  id: string;
  url?: string | null;
  caption?: string | null;
  createdAt?: string;
};

export default function PostsPage() {
  const { data, error, isLoading } = useSWR("/api/posts/list", fetcher);

  const posts: Post[] = data?.posts || [];

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-pink-300">Creator content</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">Your posts</h1>
            <p className="mt-3 text-zinc-400">
              Manage the posts uploaded to your creator page.
            </p>
          </div>

          <Link
            href="/dashboard/upload"
            className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-center font-black text-white"
          >
            Upload post
          </Link>
        </div>

        {isLoading && <p className="mt-8 text-zinc-400">Loading posts...</p>}

        {error && (
          <p className="mt-8 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-200">
            Error loading posts.
          </p>
        )}

        {!isLoading && !posts.length && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-2xl font-black">No posts yet</h2>
            <p className="mt-3 text-zinc-400">
              Upload your first creator post to start building your page.
            </p>
            <Link
              href="/dashboard/upload"
              className="mt-6 inline-block rounded-2xl bg-white px-6 py-3 font-black text-black"
            >
              Upload first post
            </Link>
          </div>
        )}

        {posts.length > 0 && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
              >
                {post.url ? (
                  <img
                    src={post.url}
                    alt={post.caption || "OnlyAi creator post"}
                    className="h-72 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-72 items-center justify-center bg-black/30 text-zinc-500">
                    No image
                  </div>
                )}

                <div className="p-5">
                  <p className="text-sm leading-6 text-zinc-300">
                    {post.caption || "No caption"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
