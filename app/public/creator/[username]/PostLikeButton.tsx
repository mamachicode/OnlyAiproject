"use client";

import { useState } from "react";

type PostLikeButtonProps = {
  postId: string;
  initialLikeCount: number;
  initialLiked: boolean;
  isLoggedIn: boolean;
};

export default function PostLikeButton({
  postId,
  initialLikeCount,
  initialLiked,
  isLoggedIn,
}: PostLikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [saving, setSaving] = useState(false);

  async function toggleLike() {
    if (saving) return;

    if (!isLoggedIn) {
      const next = encodeURIComponent(window.location.pathname);
      window.location.href = `/login?callbackUrl=${next}`;
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/posts/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ postId }),
      });

      if (res.status === 401) {
        const next = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?callbackUrl=${next}`;
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Could not update like.");
      }

      setLiked(Boolean(data.liked));
      setLikeCount(Number(data.likeCount || 0));
    } catch (error) {
      console.error("POST_LIKE_BUTTON_ERROR", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleLike}
      disabled={saving}
      aria-pressed={liked}
      className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black transition disabled:opacity-60 ${
        liked
          ? "border-pink-400/50 bg-pink-500/15 text-pink-100"
          : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-pink-400/30 hover:bg-pink-500/10 hover:text-white"
      }`}
    >
      <span className={liked ? "text-pink-300" : "text-zinc-400"}>
        {liked ? "♥" : "♡"}
      </span>
      <span>{liked ? "Liked" : "Like"}</span>
      <span className="text-zinc-500">{likeCount}</span>
    </button>
  );
}
