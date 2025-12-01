import prisma from "@/src/lib/prisma";
import { auth } from "@/src/auth";
import Link from "next/link";

export default async function CreatorPage({ params }: { params: { username: string } }) {
  const session = await auth();

  const creator = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      id: true,
      email: true,
      username: true,
      posts: { orderBy: { createdAt: "desc" } },
      subscriptionPrice: true,
    },
  });

  if (!creator) {
    return <div className="p-10 text-red-600">Creator not found</div>;
  }

  // Check if viewer is subscribed
  let isSubscribed = false;

  if (session?.user?.id) {
    const sub = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        creatorId: creator.id,
        active: true,
      },
    });
    isSubscribed = !!sub;
  }

  return (
    <div className="max-w-4xl mx-auto p-10">
      <h1 className="text-4xl font-bold mb-2">{creator.username}</h1>

      {!isSubscribed && (
        <Link
          href={`/subscribe/${creator.username}`}
          className="inline-block bg-pink-600 text-white px-4 py-2 rounded mb-8"
        >
          Subscribe for ${creator.subscriptionPrice}
        </Link>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {creator.posts.map((post) => (
          <div key={post.id} className="relative">
            <img
              src={post.url}
              className={`w-full h-full object-cover rounded-lg ${
                isSubscribed ? "" : "blur-sm brightness-50"
              }`}
            />
            {!isSubscribed && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white font-bold bg-black/50 px-2 py-1 rounded">
                  Subscribe to unlock
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
