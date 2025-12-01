import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

async function getUser(username: string) {
  return prisma.user.findUnique({
    where: { username },
    include: {
      posts: true,
    },
  });
}

export default async function CreatorPage({ params }: { params: { username: string } }) {
  const user = await getUser(params.username);

  if (!user) {
    return (
      <div className="p-10 text-center text-white text-2xl">
        Creator not found
      </div>
    );
  }

  // TEMP: This will be replaced with actual subscription check later
  const isSubscribed = false;

  return (
    <div className="p-6 text-white">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">@{user.username}</h1>
          <p className="text-gray-400">Creator on OnlyAI</p>
        </div>

        {/* Subscribe Button */}
        {!isSubscribed && (
          <Link
            href="/subscribe"
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg inline-block mb-6"
          >
            Subscribe to unlock all posts
          </Link>
        )}

        {/* Posts */}
        <div className="grid grid-cols-2 gap-4">
          {user.posts.map((post) => (
            <div key={post.id} className="relative w-full aspect-square overflow-hidden rounded-lg">
              <Image
                src={post.url}
                alt="Post"
                fill
                className={
                  isSubscribed
                    ? "object-cover"
                    : "object-cover blur-xl brightness-50"
                }
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
