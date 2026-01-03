"use client";

import useSWR from "swr";
import { useState } from "react";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function PostsPage() {
  const { data, mutate, error, isLoading } = useSWR("/api/posts/list", fetcher);
  const [deleting, setDeleting] = useState("");

  if (isLoading) return <div className="p-10">Loading...</div>;
  if (error) return <div className="p-10 text-red-600">Failed to load posts</div>;

  const posts = data?.posts || [];

  async function deletePost(id) {
    if (!confirm("Delete this post?")) return;

    setDeleting(id);

    const res = await fetch("/api/posts/delete", {
      method: "POST",
      body: JSON.stringify({ postId: id }),
    });

    setDeleting("");

    if (!res.ok) {
      alert("Delete failed");
      return;
    }

    // Refresh list
    mutate();
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Your Posts</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="relative group">
            <img
              src={post.url}
              className="rounded-md w-full h-auto shadow"
              alt={post.caption || ""}
            />

            {post.caption && (
              <p className="mt-2 text-gray-700">{post.caption}</p>
            )}

            <button
              onClick={() => deletePost(post.id)}
              disabled={deleting === post.id}
              className="absolute top-2 right-2 bg-red-600 text-white text-sm px-3 py-1 rounded opacity-90 hover:bg-red-700"
            >
              {deleting === post.id ? "Deleting..." : "Delete"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
