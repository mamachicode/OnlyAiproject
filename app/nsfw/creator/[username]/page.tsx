import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function checkSubscription(creatorUsername: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/check-nsfw-subscription?creator=${creatorUsername}`,
      { cache: "no-store" }
    );
    if (!res.ok) return false;
    const data = await res.json();
    return data.subscribed === true;
  } catch {
    return false;
  }
}

export default async function NsfwCreatorPage({
  params,
}: {
  params: { username: string };
}) {
  const creator = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      username: true,
      nsfwPrice: true,
      isNsfw: true,
      posts: {
        orderBy: { createdAt: "desc" },
        select: { id: true, url: true },
      },
    },
  });

  if (!creator || !creator.isNsfw) {
    return <div className="p-10 text-red-600">Creator not found</div>;
  }

  const isSubscribed = await checkSubscription(creator.username);

  return (
    <div className="max-w-4xl mx-auto p-10">
      <h1 className="text-4xl font-bold mb-2">@{creator.username}</h1>
      <p className="text-gray-600 mb-6 text-lg">NSFW Creator</p>

      {!isSubscribed && (
        <Link
          href={`/nsfw/subscribe/${creator.username}`}
          className="inline-block bg-red-600 text-white px-4 py-2 rounded mb-8"
        >
          Subscribe with CCBill – ${creator.nsfwPrice}
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

      {isSubscribed && (
        <p className="text-green-500 font-medium mt-4">
          You are subscribed. Enjoy the full gallery.
        </p>
      )}
    </div>
  );
}
