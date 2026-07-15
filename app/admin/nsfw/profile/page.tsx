import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { requireAdminPage } from "@/src/lib/adminGuard";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
};

export default async function PrivateNsfwProfileSettingsPage({
  searchParams,
}: PageProps) {
  const admin = await requireAdminPage("/admin/nsfw/profile");
  const query = await searchParams;

  const creator = await prisma.creator.findFirst({
    where: {
      OR: [
        {
          handle: {
            equals: "demolitionbaby",
            mode: "insensitive",
          },
        },
        {
          user: {
            username: {
              equals: "demolitionbaby",
              mode: "insensitive",
            },
          },
        },
      ],
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  if (!creator || admin.userId !== creator.userId) {
    notFound();
  }

  const handle =
    creator.handle || creator.user.username;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(127,29,29,0.28),transparent_38%),linear-gradient(180deg,#1a070b_0%,#0d0508_45%,#070305_100%)] px-6 py-16 text-white">
      <section className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/nsfw/creator/${encodeURIComponent(handle)}`}
            className="text-sm font-bold text-zinc-400 hover:text-white"
          >
            ← Back to NSFW creator page
          </Link>

          <Link
            href="/admin/nsfw/upload"
            className="rounded-full border border-red-400/30 bg-red-500/15 px-5 py-2 text-center text-sm font-black text-red-100 hover:bg-red-500/25"
          >
            Add post
          </Link>
        </div>

        <p className="mt-10 text-sm font-black uppercase tracking-[0.3em] text-red-300">
          Private 18+ profile
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          Edit NSFW profile
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
          These details are used only by the NSFW lane. Your SFW display
          name, bio, avatar, and banner will not be changed.
        </p>

        {query.saved === "1" ? (
          <div className="mt-6 rounded-2xl border border-green-400/25 bg-green-500/10 p-4 text-sm font-bold text-green-100">
            NSFW profile saved.
          </div>
        ) : null}

        {query.error ? (
          <div className="mt-6 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm font-bold text-red-100">
            {query.error}
          </div>
        ) : null}

        <form
          action="/api/admin/nsfw/profile"
          method="POST"
          encType="multipart/form-data"
          className="mt-8 space-y-7 rounded-3xl border border-white/10 bg-black/25 p-6 sm:p-8"
        >
          <label className="block">
            <span className="text-sm font-black">
              NSFW display name
            </span>

            <input
              name="nsfwDisplayName"
              maxLength={50}
              defaultValue={
                creator.nsfwDisplayName ||
                creator.displayName ||
                handle
              }
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 font-semibold text-white outline-none focus:border-red-400/50"
            />
          </label>

          <label className="block">
            <span className="text-sm font-black">
              NSFW bio
            </span>

            <textarea
              name="nsfwBio"
              rows={5}
              maxLength={280}
              defaultValue={
                creator.nsfwBio ||
                creator.bio ||
                ""
              }
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 font-semibold text-white outline-none focus:border-red-400/50"
            />

            <span className="mt-2 block text-xs text-zinc-500">
              Maximum 280 characters.
            </span>
          </label>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm font-black">
                NSFW avatar
              </p>

              {creator.nsfwAvatarUrl ? (
                <img
                  src={creator.nsfwAvatarUrl}
                  alt="Current NSFW avatar"
                  className="mt-4 h-28 w-28 rounded-full border border-white/10 object-cover"
                />
              ) : (
                <p className="mt-4 text-sm text-zinc-500">
                  Currently using the SFW avatar as a fallback.
                </p>
              )}

              <input
                name="nsfwAvatar"
                type="file"
                accept="image/*"
                className="mt-5 block w-full text-sm text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-red-500/15 file:px-4 file:py-2 file:font-black file:text-red-100"
              />

              {creator.nsfwAvatarUrl ? (
                <label className="mt-4 flex items-center gap-3 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    name="removeNsfwAvatar"
                    value="1"
                  />
                  Remove NSFW avatar and use SFW fallback
                </label>
              ) : null}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm font-black">
                NSFW banner
              </p>

              {creator.nsfwBannerUrl ? (
                <img
                  src={creator.nsfwBannerUrl}
                  alt="Current NSFW banner"
                  className="mt-4 aspect-[16/6] w-full rounded-2xl border border-white/10 object-cover"
                />
              ) : (
                <p className="mt-4 text-sm text-zinc-500">
                  Currently using the SFW banner as a fallback.
                </p>
              )}

              <input
                name="nsfwBanner"
                type="file"
                accept="image/*"
                className="mt-5 block w-full text-sm text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-red-500/15 file:px-4 file:py-2 file:font-black file:text-red-100"
              />

              {creator.nsfwBannerUrl ? (
                <label className="mt-4 flex items-center gap-3 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    name="removeNsfwBanner"
                    value="1"
                  />
                  Remove NSFW banner and use SFW fallback
                </label>
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-red-500 to-purple-600 px-6 py-4 text-base font-black text-white hover:opacity-90"
          >
            Save NSFW profile
          </button>
        </form>
      </section>
    </main>
  );
}
