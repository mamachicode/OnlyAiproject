// @ts-nocheck
import prisma from "@/src/lib/prisma";
import Link from "next/link";

export default async function CreatorPage({ params }) {
  const { username } = params;

  const creator = await prisma.user.findUnique({
    where: { username },
    select: {
      username: true,
      bio: true,
      avatar: true,
      posts: {
        where: { nsfw: false },
        select: {
          id: true,
          url: true,
          caption: true,
        },
      },
    },
  });

  if (!creator) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Creator not found</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <img
          src={creator.avatar || "/placeholder.png"}
          alt={creator.username}
          className="w-20 h-20 rounded-full object-cover"
        />
        <div>
          <h1 className="text-3xl font-bold">{creator.username}</h1>
          <p className="text-gray-400">{creator.bio || "No bio available"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {creator.posts.map((post: any) => (
          <div key={post.id} className="relative">
            <img
              src={post.url}
              alt="Post"
              className="w-full h-full object-cover rounded"
            />
            {post.caption && (
              <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-sm p-1 rounded-b">
                {post.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link
          href={`/sfw/subscribe/${creator.username}`}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded"
        >
          Subscribe for more
        </Link>
      </div>
    </div>
  );
}
