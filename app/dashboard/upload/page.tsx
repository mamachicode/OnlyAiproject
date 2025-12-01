"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");

  async function handleUpload(e: any) {
    e.preventDefault();
    if (!file) return alert("Select an image first");

    const form = new FormData();
    form.append("file", file);
    form.append("caption", caption);

    const res = await fetch("/api/posts/upload", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      alert("Upload failed");
      return;
    }

    alert("Upload successful!");
    router.push("/dashboard/posts");
  }

  return (
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upload Image</h1>

      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="file"
          accept="image/*"
          className="w-full border p-2"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <input
          type="text"
          placeholder="Caption"
          className="w-full border p-2"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <button className="w-full bg-black text-white py-2 rounded">
          Upload
        </button>
      </form>
    </div>
  );
}
