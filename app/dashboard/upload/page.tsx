// @ts-nocheck
export const dynamic = "force-dynamic";

import Link from "next/link";
import UploadPostForm from "./UploadPostForm";
import { requireCreatorPage } from "@/src/lib/creatorGuard";

type UploadPostPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

function getUploadErrorMessage(error?: string) {
  if (!error) return "";

  if (error === "nofile") {
    return "Add at least one image or short video before uploading your post.";
  }

  if (error === "moderation") {
    return "That image could not be added by the SFW safety check. Try a cleaner crop or a different image.";
  }

  if (error === "text") {
    return "Some wording could not be saved. Edit the title or description and try again.";
  }

  if (error === "video") {
    return "That video could not be added. Use MP4, MOV, or WebM under 25MB.";
  }

  if (error === "url") {
    return "That image URL could not be added. Use a direct HTTPS link to a JPG, PNG, WebP, or GIF image.";
  }

  if (error === "storage") {
    return "We could not process that image right now. Try a smaller image or upload one image first.";
  }

  return "Could not upload that post. Check the image and try again.";
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
              Create a new post with images, photo sets, stories, or a short video.
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
                <p className="font-black text-white">Upload not added</p>
                <p className="mt-1 text-red-100">{uploadError}</p>
              </div>
            </div>
          </div>
        ) : null}

        <UploadPostForm />
      </section>
    </main>
  );
}
