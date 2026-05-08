// @ts-nocheck
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";

type SettingsPageProps = {
  searchParams?: Promise<{
    saved?: string;
    error?: string;
  }>;
};

export default async function CreatorSettingsPage({
  searchParams,
}: SettingsPageProps) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect("/login");
  }

  const resolvedSearchParams = await Promise.resolve(searchParams);
  const saved = resolvedSearchParams?.saved === "1";
  const error = resolvedSearchParams?.error || "";

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      username: true,
      sfwPrice: true,
      creator: {
        select: {
          handle: true,
          displayName: true,
          bio: true,
          avatarUrl: true,
          bannerUrl: true,
          priceCents: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const currentHandle = user.creator?.handle || user.username || "";
  const currentDisplayName = user.creator?.displayName || currentHandle;
  const currentBio = user.creator?.bio || "";
  const currentAvatarUrl = user.creator?.avatarUrl || "";
  const currentBannerUrl = user.creator?.bannerUrl || "";

  const currentMonthlyPrice =
    user.creator?.priceCents != null
      ? Math.round(user.creator.priceCents / 100)
      : user.sfwPrice ?? 5;

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-pink-300">
          Creator profile
        </p>

        <h1 className="mt-4 text-4xl font-black">Creator settings</h1>

        <p className="mt-4 max-w-2xl text-zinc-400">
          Set your public creator identity, profile banner, avatar, bio, and monthly subscription price.
        </p>

        {saved ? (
          <div className="mt-8 rounded-2xl border border-green-500/30 bg-green-500/10 p-5 text-sm font-semibold text-green-200">
            Settings saved.
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm font-semibold text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]">
          <div className="relative h-48 bg-gradient-to-br from-pink-500/30 via-purple-500/20 to-black">
            {currentBannerUrl ? (
              <img
                src={currentBannerUrl}
                alt="Current creator banner"
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>

          <div className="px-8 pb-8">
            <div className="-mt-12 h-24 w-24 overflow-hidden rounded-full border-4 border-black bg-gradient-to-br from-pink-500 to-purple-600">
              {currentAvatarUrl ? (
                <img
                  src={currentAvatarUrl}
                  alt="Current creator avatar"
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>

            <h2 className="mt-4 text-2xl font-black">
              {currentDisplayName || "Creator name"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">@{currentHandle}</p>
            <p className="mt-4 max-w-2xl text-sm text-zinc-400">
              {currentBio || "Your creator bio will appear here."}
            </p>
          </div>
        </div>

        <form
          action="/api/creator/profile"
          method="POST"
          encType="multipart/form-data"
          className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-8"
        >
          <div className="grid gap-8 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-zinc-100">
                Display name
              </span>

              <input
                name="displayName"
                maxLength={50}
                defaultValue={currentDisplayName}
                placeholder="Your creator name"
                className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-5 font-semibold text-white outline-none placeholder:text-zinc-600"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-zinc-100">
                Creator handle
              </span>

              <div className="mt-3 flex items-center rounded-2xl border border-white/10 bg-black/30 px-5">
                <span className="text-zinc-500">@</span>
                <input
                  name="handle"
                  required
                  minLength={3}
                  maxLength={30}
                  pattern="[a-zA-Z0-9_]+"
                  defaultValue={currentHandle}
                  className="w-full bg-transparent px-4 py-5 font-semibold text-white outline-none"
                />
              </div>
            </label>
          </div>

          <label className="mt-8 block">
            <span className="text-sm font-bold text-zinc-100">
              Bio
            </span>

            <textarea
              name="bio"
              rows={4}
              maxLength={280}
              defaultValue={currentBio}
              placeholder="Tell fans what you post and why they should subscribe..."
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-5 font-semibold text-white outline-none placeholder:text-zinc-600"
            />

            <p className="mt-2 text-xs text-zinc-500">
              Keep it SFW for the Stripe lane. Max 280 characters.
            </p>
          </label>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-zinc-100">
                Avatar image
              </span>

              <input
                name="avatar"
                type="file"
                accept="image/*"
                className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white file:mr-4 file:rounded-full file:border-0 file:bg-pink-500 file:px-4 file:py-2 file:font-bold file:text-white"
              />

              <p className="mt-2 text-xs text-zinc-500">
                Optional. SFW images only. Leave empty to keep current avatar.
              </p>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-zinc-100">
                Banner image
              </span>

              <input
                name="banner"
                type="file"
                accept="image/*"
                className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white file:mr-4 file:rounded-full file:border-0 file:bg-pink-500 file:px-4 file:py-2 file:font-bold file:text-white"
              />

              <p className="mt-2 text-xs text-zinc-500">
                Optional wide cover image. SFW images only. Leave empty to keep current banner.
              </p>
            </label>
          </div>

          <label className="mt-8 block">
            <span className="text-sm font-bold text-zinc-100">
              Monthly price
            </span>

            <div className="mt-3 flex items-center rounded-2xl border border-white/10 bg-black/30 px-5">
              <span className="text-zinc-500">$</span>
              <input
                name="sfwPrice"
                required
                min={1}
                max={500}
                type="number"
                defaultValue={currentMonthlyPrice}
                className="w-full bg-transparent px-4 py-5 font-semibold text-white outline-none"
              />
              <span className="text-zinc-500">/month</span>
            </div>
          </label>

          <button
            type="submit"
            className="mt-8 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-5 text-lg font-black text-white shadow-2xl shadow-pink-500/20 transition hover:scale-[1.01]"
          >
            Save creator profile
          </button>
        </form>
      </div>
    </main>
  );
}
