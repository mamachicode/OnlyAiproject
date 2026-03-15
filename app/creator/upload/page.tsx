"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isNsfw, setIsNsfw] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [priceCents, setPriceCents] = useState("");

  async function handleUpload(e: any) {
    e.preventDefault();

    if (!title || files.length === 0) {
      alert("Title and files required");
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

    if (!res.ok) {
      alert("Upload failed");
      return;
    }

    alert("Post created!");
    router.push("/creator/posts");
  }

  return (
    <div className="p-10 max-w-lg mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Create Post</h1>

      <form onSubmit={handleUpload} className="space-y-4">

        <input
          type="text"
          placeholder="Post title"
          className="w-full border p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Caption / description"
          className="w-full border p-2"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <input
          type="file"
          multiple
          className="w-full border p-2"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />

        <label className="flex gap-2">
          <input
            type="checkbox"
            checked={isLocked}
            onChange={(e) => setIsLocked(e.target.checked)}
          />
          Locked content
        </label>

        {isLocked && (
          <input
            type="number"
            placeholder="Price in cents (ex: 500 = $5)"
            className="w-full border p-2"
            value={priceCents}
            onChange={(e) => setPriceCents(e.target.value)}
          />
        )}

        <button className="w-full bg-black text-white py-3 rounded">
          Publish Post
        </button>
      </form>
    </div>
  );
}
