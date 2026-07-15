import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { requireAdminPage } from "@/src/lib/adminGuard";
import NsfwProfileForm from "./NsfwProfileForm";

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

        <NsfwProfileForm
          displayName={
            creator.nsfwDisplayName ||
            creator.displayName ||
            handle
          }
          bio={
            creator.nsfwBio ||
            creator.bio ||
            ""
          }
          currentAvatarUrl={
            creator.nsfwAvatarUrl || ""
          }
          currentBannerUrl={
            creator.nsfwBannerUrl || ""
          }
        />
      </section>
    </main>
  );
}
