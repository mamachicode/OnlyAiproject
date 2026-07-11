"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PostMedia = {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  order?: number;
};

type Post = {
  id: string;
  title: string;
  content?: string | null;
  isLocked: boolean;
  createdAt?: string;
  media: PostMedia[];
  _count?: {
    likes?: number;
  };
};

export default function DashboardPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [uploadNotice, setUploadNotice] = useState("");

  async function loadPosts() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json();
      const nextPosts = Array.isArray(data) ? data : data.posts || [];

      setPosts(nextPosts);
    } catch (err) {
      setError("Could not load posts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("moderation") === "manual_review") {
      setUploadNotice(
        "Your post was uploaded and is pending a routine manual safety review."
      );
    } else if (params.get("moderation") === "suggestive") {
      setUploadNotice(
        "Some viewers may consider this content suggestive, but it complies with the current SFW guidelines."
      );
    } else if (params.get("uploaded") === "1") {
      setUploadNotice("Your post was uploaded successfully.");
    }

    loadPosts();
  }, []);

  async function deletePost(postId: string) {
    const confirmed = window.confirm("Delete this post?");
    if (!confirmed) return;

    setDeletingId(postId);
    setError("");

    try {
      const res = await fetch("/api/posts/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ postId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Delete failed.");
      }

      setPosts((current) => current.filter((post) => post.id !== postId));
    } catch (err: any) {
      setError(err.message || "Could not delete post.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#07050d] text-white">
      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-pink-300">
                Creator dashboard
              </p>
              <h1 className="mt-4 text-4xl font-black">Your posts</h1>
            </div>

            <Link
              href="/dashboard/upload"
              className="rounded-full bg-pink-500 px-6 py-3 text-center text-sm font-black text-white hover:bg-pink-400"
            >
              Upload new post
            </Link>
          </div>

          {uploadNotice ? (
            <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm font-bold leading-6 text-amber-100">
              {uploadNotice}
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-bold text-red-100">
              {error}
            </div>
          ) : null}

          {loading ? (
            <p className="mt-10 text-zinc-400">Loading posts...</p>
          ) : posts.length === 0 ? (
            <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 text-zinc-400">
              No posts yet.
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => {
                const firstMedia = post.media?.[0];
                const mediaCount = post.media?.length || 0;

                return (
                  <article
                    key={post.id}
                    className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]"
                  >
                    <div className="relative aspect-[4/5] bg-zinc-900">
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

                      {mediaCount > 1 ? (
                        <div className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-black text-white backdrop-blur">
                          {mediaCount} items
                        </div>
                      ) : null}
                    </div>

                    <div className="p-5">
                      <h2 className="text-xl font-black">
                        {post.title || "Members-only post"}
                      </h2>

                      {post.content ? (
                        <p className="mt-2 line-clamp-3 text-sm text-zinc-400">
                          {post.content}
                        </p>
                      ) : null}

                      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                        <span>{post.isLocked ? "Locked" : "Public"}</span>
                        <span>♥ {post._count?.likes || 0}</span>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <Link
                          href={`/dashboard/posts/${post.id}/edit`}
                          className="rounded-full border border-white/10 px-4 py-3 text-center text-sm font-black text-white hover:bg-white/10"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => deletePost(post.id)}
                          disabled={deletingId === post.id}
                          className="rounded-full border border-red-400/20 px-4 py-3 text-sm font-black text-red-100 hover:bg-red-500/10 disabled:opacity-50"
                        >
                          {deletingId === post.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
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
