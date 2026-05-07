import Link from "next/link";

export default function UploadPostPage() {
  return (
    <main className="min-h-screen bg-[#07050d] text-white">
      <section className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-pink-300">
          Creator content
        </p>

        <h1 className="mt-4 text-4xl font-black">Upload a post</h1>

        <p className="mt-3 max-w-2xl text-zinc-400">
          Create one members-only post with one or more images/videos. Use this for comics, stories, photo sets, or private updates.
        </p>

        <form
          action="/api/posts/upload"
          method="POST"
          encType="multipart/form-data"
          className="mt-8 space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.05] p-6"
        >
          <div>
            <label className="block text-sm font-bold text-zinc-300">
              Title
            </label>
            <input
              name="title"
              placeholder="Members-only post"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-300">
              Caption / story text
            </label>
            <textarea
              name="content"
              rows={5}
              placeholder="Write a caption or story intro..."
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-300">
              Media files
            </label>
            <input
              name="files"
              type="file"
              accept="image/*,video/*"
              multiple
              required
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white file:mr-4 file:rounded-full file:border-0 file:bg-pink-500 file:px-4 file:py-2 file:font-bold file:text-white"
            />
            <p className="mt-2 text-xs text-zinc-500">
              Select multiple files to create a gallery/comic-style post. Stripe lane must stay SFW.
            </p>
          </div>

          <div className="rounded-2xl border border-pink-400/20 bg-pink-500/10 p-4 text-sm text-pink-100">
            New posts are members-only by default. You can edit the post later and add more media.
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="rounded-full bg-pink-500 px-6 py-3 text-sm font-black text-white hover:bg-pink-400"
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
