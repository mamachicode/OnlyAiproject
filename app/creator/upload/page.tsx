"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isNsfw, setIsNsfw] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [priceCents, setPriceCents] = useState("");
  const [error, setError] = useState("");

  async function handleUpload(e: any) {
    e.preventDefault();
    setError("");

    if (!title || files.length === 0) {
      setError("Title and files required");
      return;
    }

    const form = new FormData();

    files.forEach((file) => {
      form.append("files", file);
    });

    form.append("title", title);
    form.append("content", content);
    form.append("isNsfw", String(isNsfw));
    form.append("isLocked", String(isLocked));
    form.append("priceCents", priceCents);

    const res = await fetch("/api/posts/upload", {
      method: "POST",
      body: form,
    });

    const text = await res.text();

    if (!res.ok) {
      setError(text || "Upload failed");
      return;
    }

    router.push("/creator/posts");
  }

  return (
    <div className="p-10 max-w-lg mx-auto space-y-6 text-white">
      <h1 className="text-3xl font-bold">Create Post</h1>

      {error ? (
        <div className="rounded-lg border border-red-800 bg-red-950 p-3 text-red-300">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="text"
          placeholder="Post title"
          className="w-full border border-neutral-700 bg-neutral-900 p-3 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Caption / description"
          className="w-full border border-neutral-700 bg-neutral-900 p-3 rounded"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <input
          type="file"
          multiple
          className="w-full border border-neutral-700 bg-neutral-900 p-3 rounded"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />

        <label className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={isNsfw}
            onChange={(e) => setIsNsfw(e.target.checked)}
          />
          Mark as NSFW
        </label>

        <label className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={isLocked}
            onChange={(e) => setIsLocked(e.target.checked)}
          />
          Locked content
        </label>

        {isLocked ? (
          <input
            type="number"
            placeholder="Price in cents (500 = $5)"
            className="w-full border border-neutral-700 bg-neutral-900 p-3 rounded"
            value={priceCents}
            onChange={(e) => setPriceCents(e.target.value)}
          />
        ) : null}

        <button className="w-full bg-pink-600 text-white py-3 rounded font-semibold">
          Publish Post
        </button>
      </form>
    </div>
  );
}
