"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (!file) {
      setError("Select an image first.");
      return;
    }

    setLoading(true);

    const form = new FormData();
    form.append("file", file);
    form.append("caption", caption);

    try {
      const res = await fetch("/api/posts/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || `Upload failed with status ${res.status}.`);
        setLoading(false);
        return;
      }

      router.push("/dashboard/posts");
      router.refresh();
    } catch (err) {
      setError("Upload failed because the request could not complete.");
      setLoading(false);
    }
  }

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-pink-300">Creator content</p>

        <h1 className="mt-3 text-4xl font-black tracking-tight">
          Upload post
        </h1>

        <p className="mt-4 text-zinc-400">
          Add a clean image post to your creator page.
        </p>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-200">
            {error}
          </div>
        )}

        <form
          onSubmit={handleUpload}
          className="mt-8 space-y-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6"
        >
          <div>
            <label className="block text-sm font-bold text-zinc-300">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:font-bold file:text-black"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-300">
              Caption
            </label>
            <input
              type="text"
              placeholder="Write a short caption..."
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-zinc-600"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4 text-center font-black text-white shadow-xl shadow-pink-500/20 disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Upload post"}
          </button>
        </form>
      </div>
    </div>
  );
}
