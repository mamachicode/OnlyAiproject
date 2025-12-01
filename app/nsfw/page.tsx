import prisma from "@/src/lib/prisma";
import Link from "next/link";

export default async function NsfwLandingPage() {
  const creators = await prisma.user.findMany({
    where: { isNsfw: true },
    select: {
      username: true,
      nsfwPrice: true,
      posts: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { url: true },
      },
    },
  });

  return (
    <div className="max-w-5xl mx-auto p-10">
      <h1 className="text-4xl font-bold mb-4">NSFW Creators (18+)</h1>
      <p className="text-gray-600 mb-10">
        Explore adult creators on OnlyAI. All models are 18+.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {creators.map((creator) => (
          <Link
            key={creator.username}
            href={`/nsfw/creator/${creator.username}`}
            className="block group border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
          >
            <img
              src={creator.posts[0]?.url ?? "/placeholder-nsfw.jpg"}
              className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="p-4">
              <p className="font-semibold text-lg">@{creator.username}</p>
              <p className="text-sm text-gray-600">
                NSFW Subscription • ${creator.nsfwPrice}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
