export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";

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

          return (
            <div
              key={post.id}
              className="bg-neutral-900 rounded-xl overflow-hidden shadow hover:scale-[1.02] transition"
            >
              {/* Media Wrapper */}
              <div className="relative">
                {media.type === "IMAGE" ? (
                  <img
                    src={displayUrl}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <video
                    src={displayUrl}
                    className="w-full h-64 object-cover"
                    controls={!post.isLocked}
                  />
                )}

                {/* LOCK OVERLAY */}
                {post.isLocked && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center px-4">
                      <div className="text-3xl mb-2">🔒</div>
                      <p className="text-sm font-semibold text-white">
                        Locked Content
                      </p>
                      <p className="text-xs text-neutral-300 mt-1">
                        Subscribe to unlock
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-3">
                <p className="text-sm font-semibold text-white truncate">
                  {post.title}
                </p>
                <p className="text-xs text-neutral-400">
                  @{post.author.creatorProfile?.handle ?? post.author.username}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
