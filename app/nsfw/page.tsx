export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import NsfwCard from "@/components/NsfwCard";

export default async function NsfwPage() {
  const posts = await prisma.post.findMany({
    where: { isNsfw: true },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        include: {
          creatorProfile: true,
        },
      },
      media: {
        take: 1,
        orderBy: { order: "asc" },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {posts.map((post) => {
          const media = post.media?.[0];
          if (!media) return null;

          const displayUrl = post.isLocked
            ? media.blurUrl ?? media.url
            : media.url;

          if (!displayUrl) return null;

          const handle =
            post.author.creatorProfile?.handle ??
            post.author.username;

          return (
            <NsfwCard
              key={post.id}
              postId={post.id}
              title={post.title}
              handle={handle}
              isLocked={post.isLocked}
              mediaType={media.type}
              displayUrl={displayUrl}
            />
          );
        })}
      </div>
    </div>
  );
}
