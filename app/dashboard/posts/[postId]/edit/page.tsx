// @ts-nocheck
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { requireCreatorPage } from "@/src/lib/creatorGuard";
import EditPostForm from "./EditPostForm";

type PageProps = {
  params: Promise<{
    postId: string;
  }>;
  searchParams?: Promise<{
    saved?: string;
  }>;
};

export default async function EditPostPage({ params, searchParams }: PageProps) {
  const creatorAccess = await requireCreatorPage("/dashboard/posts");

  const { postId } = await params;
  const query = searchParams ? await searchParams : {};
  const saved = query?.saved === "1";

  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      authorId: creatorAccess.userId,
    },
    include: {
      media: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const safePost = {
    id: post.id,
    title: post.title || "",
    content: post.content || "",
    isLocked: post.isLocked,
    media: post.media.map((item) => ({
      id: item.id,
      url: item.url,
      type: item.type,
      order: item.order || 0,
      publicId: item.publicId || "",
    })),
  };

  return (
    <main className="min-h-screen bg-[#07050d] text-white">
      <section className="mx-auto max-w-5xl px-6 py-12">
        <Link href="/dashboard/posts" className="text-sm text-zinc-400 hover:text-white">
          ← Back to posts
        </Link>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.35em] text-pink-300">
          Edit post
        </p>

        <h1 className="mt-4 text-4xl font-black">{post.title}</h1>

        {saved ? (
          <div className="mt-6 rounded-2xl border border-green-400/20 bg-green-400/10 p-4 text-sm font-bold text-green-100">
            Post saved.
          </div>
        ) : null}

        <EditPostForm post={safePost} />
      </section>
    </main>
  );
}
