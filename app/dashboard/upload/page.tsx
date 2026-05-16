// @ts-nocheck
export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireCreatorPage } from "@/src/lib/creatorGuard";

type UploadPostPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

function getUploadErrorMessage(error?: string) {
  if (!error) return "";

  if (error === "nofile") {
    return "Add at least one SFW image before uploading your post.";
  }

  if (error === "moderation") {
    return "That upload was blocked by the SFW safety check. Use a clean, fully clothed, Stripe-safe image and try again.";
  }

  if (error === "text") {
    return "Your title or caption triggered the safety filter. Keep it clean, creator-safe, and try again.";
  }

  if (error === "video") {
    return "Video uploads are temporarily disabled until full video moderation is ready.";
  }

  if (error === "storage") {
    return "The upload service could not process the image right now. Try again with a smaller image or upload one image first.";
  }

  return "Could not upload that post. Check the image, keep it SFW, and try again.";
}

export default async function UploadPostPage({
  searchParams,
}: UploadPostPageProps) {
  await requireCreatorPage("/dashboard/upload");

  const params = await Promise.resolve(searchParams);
  const uploadError = getUploadErrorMessage(params?.error);

  return (
    <main className="min-h-screen bg-[#07050d] text-white">
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-pink-300">
              Creator content
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight">
              Upload a post
            </h1>

            <p className="mt-3 max-w-2xl text-zinc-400">
              Create one members-only post with one or more SFW images. Use this
              for comics, stories, photo sets, or private creator updates.
            </p>
          </div>

          <Link
            href="/dashboard/posts"
            className="inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white hover:bg-white/10"
          >
            Back to posts
          </Link>
        </div>

        {uploadError ? (
          <div className="mt-8 rounded-[1.5rem] border border-red-500/30 bg-red-500/10 p-5 text-sm font-semibold leading-6 text-red-100 shadow-lg shadow-red-950/10">
            <div className="flex gap-3">
              <span className="mt-0.5">⚠️</span>
              <div>
                <p className="font-black text-white">Upload blocked</p>
                <p className="mt-1 text-red-100">{uploadError}</p>
              </div>
            </div>
          </div>
        ) : null}

        <form
          action="/api/posts/upload"
          method="POST"
          encType="multipart/form-data"
          className="mt-8 space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/20"
        >
          <div>
            <label className="block text-sm font-bold text-zinc-300">
              Title
            </label>
            <input
              name="title"
              placeholder="Members-only post"
              maxLength={90}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-pink-400/40"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-300">
              Caption / story text
            </label>
            <textarea
              name="content"
              rows={5}
              maxLength={1500}
              placeholder="Write a caption or story intro..."
              className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-4 leading-7 text-white outline-none placeholder:text-zinc-600 focus:border-pink-400/40"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-300">
              Media files
            </label>
            <input
              name="files"
              type="file"
              accept="image/*"
              multiple
              required
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white file:mr-4 file:rounded-full file:border-0 file:bg-pink-500 file:px-4 file:py-2 file:font-bold file:text-white"
            />
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Select one or more clean SFW images. Unsafe images are blocked
              before upload. Video uploads stay disabled until real video
              moderation is ready.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-pink-400/20 bg-pink-500/10 p-4 text-sm text-pink-100">
              <p className="font-black text-white">Members-only</p>
              <p className="mt-1 text-xs leading-5 text-pink-100/80">
                New posts are locked for subscribers by default.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
              <p className="font-black text-white">Gallery ready</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Multiple images become one post set.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
              <p className="font-black text-white">Stripe-safe</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Keep launch content clean and payment-safe.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="rounded-full bg-pink-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-pink-950/30 hover:bg-pink-400"
            >
              Upload post
            </button>

            <Link
              href="/dashboard/posts"
              className="rounded-full border border-white/10 px-6 py-3 text-center text-sm font-black text-white hover:bg-white/10"
            >
              Back to posts
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
