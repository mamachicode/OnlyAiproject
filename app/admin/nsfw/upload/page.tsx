import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { requireAdminPage } from "@/src/lib/adminGuard";
import NsfwUploadForm from "./NsfwUploadForm";

export const dynamic = "force-dynamic";

export default async function AdminNsfwUploadPage() {
  const admin = await requireAdminPage("/admin/nsfw/upload");

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

  const publicHandle =
    creator.handle || creator.user.username || "demolitionbaby";

  return (
    <main className="min-h-screen bg-[#080309] px-6 py-14 text-white">
      <section className="mx-auto max-w-3xl">
        <Link
          href={`/nsfw/creator/${encodeURIComponent(publicHandle)}`}
          className="text-sm font-bold text-zinc-400 hover:text-white"
        >
          ← Back to private creator preview
        </Link>

        <p className="mt-10 text-sm font-black uppercase tracking-[0.35em] text-red-300">
          OnlyAi administration
        </p>

        <h1 className="mt-4 text-4xl font-black">
          Add private 18+ content
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
          Add content to the private demolitionbaby adult storefront. It will
          not appear on the public SFW creator page.
        </p>

        <NsfwUploadForm publicHandle={publicHandle} />
      </section>
    </main>
  );
}
