// @ts-nocheck
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
import CreatorProfileForm from "./CreatorProfileForm";

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
      ? user.creator.priceCents / 100
      : user.sfwPrice ?? 5;

  return (
    <main className="min-h-screen bg-black px-6 pb-32 pt-10 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-pink-300">
          Creator profile
        </p>

        <h1 className="mt-4 text-4xl font-black">Creator settings</h1>

        <p className="mt-4 max-w-2xl text-zinc-400">
          Set your public creator identity, profile banner, avatar, bio, and monthly subscription price. After saving, you’ll go to your creator dashboard where you can upload posts.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={user.creator ? "/dashboard" : "/account"}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-black text-white hover:bg-white/10"
          >
            {user.creator ? "← Creator dashboard" : "← Back to account"}
          </Link>

          <Link
            href={`/public/creator/${currentHandle}`}
            className="rounded-full bg-white px-5 py-3 text-center text-sm font-black text-black hover:bg-zinc-200"
          >
            View creator page
          </Link>
        </div>

        {saved ? (
          <div className="mt-8 rounded-2xl border border-green-500/30 bg-green-500/10 p-5 text-sm font-semibold text-green-200">
            <p className="text-base font-black">Settings saved.</p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/public/creator/${currentHandle}`}
                className="rounded-full bg-green-200 px-5 py-3 text-center text-sm font-black text-green-950 hover:bg-green-100"
              >
                View creator page
              </Link>

              <Link
                href="/dashboard"
                className="rounded-full border border-green-300/20 bg-black/20 px-5 py-3 text-center text-sm font-black text-green-100 hover:bg-black/30"
              >
                Back to dashboard
              </Link>
            </div>
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

        <CreatorProfileForm
          currentDisplayName={currentDisplayName}
          currentHandle={currentHandle}
          currentBio={currentBio}
          currentMonthlyPrice={currentMonthlyPrice}
          currentAvatarUrl={currentAvatarUrl}
          currentBannerUrl={currentBannerUrl}
        />
      </div>
    </main>
  );
}
