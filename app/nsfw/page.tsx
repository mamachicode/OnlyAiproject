// @ts-nocheck
import Link from "next/link";
import prisma from "@/src/lib/prisma";

export default async function Page() {
  const rawCreators = await prisma.user.findMany({
    where: { isNsfw: true },
    select: {
      username: true
    },
  });

  // 🛡️ SAFE MAPPING (keeps UI working)
  const creators = rawCreators.map((user) => ({
    ...user,
    avatar: null,
    bio: null
  }));

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">NSFW Creators</h1>

      {creators.length === 0 && <p>No creators found.</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {creators.map((creator: any) => (
          <Link
            key={creator.username}
            href={`/nsfw/creator/${creator.username}`}
            className="block border rounded-lg overflow-hidden shadow bg-black/20 hover:bg-black/30 transition"
          >
            <div className="aspect-square bg-gray-200 flex items-center justify-center">
              {creator.avatar ? (
                <img
                  src={creator.avatar}
                  alt={creator.username}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-gray-500">No Avatar</span>
              )}
            </div>

            <div className="p-4">
              <h2 className="font-semibold">{creator.username}</h2>
              <p className="text-sm text-gray-400">
                {creator.bio || "No bio"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
