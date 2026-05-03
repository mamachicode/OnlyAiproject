"use client";

import { useEffect, useState } from "react";

type PostMedia = {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  publicId?: string | null;
};

type Post = {
  id: string;
  title: string;
  content?: string | null;
  isLocked: boolean;
  createdAt: string;
  media: PostMedia[];
};

export default function DashboardPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadPosts() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Could not load posts.");
      }

      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (err: any) {
      setError(err?.message || "Could not load posts.");
    } finally {
      setLoading(false);
    }
  }

  async function deletePost(postId: string) {
    setDeletingId(postId);
    setError("");

    try {
      const res = await fetch("/api/posts/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Could not delete post.");
      }

      setPosts((current) => current.filter((post) => post.id !== postId));
    } catch (err: any) {
      setError(err?.message || "Could not delete post.");
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-pink-300">
              Creator dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Your posts</h1>
          </div>

          <a
            href="/dashboard/upload"
            className="rounded-full bg-pink-500 px-5 py-3 text-sm font-semibold text-white hover:bg-pink-400"
          >
            Upload new post
          </a>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-zinc-300">
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-xl font-semibold">No posts yet</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Upload your first SFW members-only post to test the creator flow.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const firstMedia = post.media?.[0];

              return (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950"
                >
                  <div className="aspect-[4/5] bg-zinc-900">
                    {firstMedia?.url ? (
                      firstMedia.type === "VIDEO" ? (
                        <video
                          src={firstMedia.url}
                          controls
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={firstMedia.url}
                          alt={post.title || "OnlyAi creator post"}
                          className="h-full w-full object-cover"
                        />
                      )
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                        No media
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 p-5">
                    <div>
                      <h2 className="line-clamp-2 text-base font-semibold">
                        {post.title || "Members-only post"}
                      </h2>
                      {post.content ? (
                        <p className="mt-2 line-clamp-3 text-sm text-zinc-400">
                          {post.content}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>{post.isLocked ? "Locked" : "Public"}</span>
                      <span>SFW</span>
                    </div>

                    <button
                      onClick={() => deletePost(post.id)}
                      disabled={deletingId === post.id}
                      className="w-full rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === post.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
