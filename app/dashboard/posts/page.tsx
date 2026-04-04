"use client";
export const dynamic = "force-dynamic";

import useSWR from "swr";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PostsPage() {
  const { data, mutate, error, isLoading } = useSWR("/api/posts/list", fetcher);

  const [caption, setCaption] = useState("");

  async function createPost() {
    const form = new FormData();
    form.append("caption", caption);

    await fetch("/api/posts", { method: "POST", body: form });
    mutate();
    setCaption("");
  }

  return (
    <div className="p-6">
      <h1 className="text-lg font-bold mb-4">Your Posts</h1>

      <div className="mb-4">
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="border p-2 w-full"
          placeholder="Write a caption..."
        />
        <button
          onClick={createPost}
          className="bg-blue-600 text-white px-4 py-2 mt-2 rounded"
        >
          Create Post
        </button>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p>Error loading posts.</p>}

      {data?.posts?.length ? (
        <ul className="space-y-2">
          {data.posts.map((post) => (
            <li key={post.id} className="p-2 border rounded">
              {post.caption}
            </li>
          ))}
        </ul>
      ) : (
        <p>No posts found.</p>
      )}
    </div>
  );
}
