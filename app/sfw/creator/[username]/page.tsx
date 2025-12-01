import prisma from "@/src/lib/prisma";

export default async function SfwCreatorPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const creator = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      subscriptionPrice: true,
      isNsfw: true,
      posts: { orderBy: { createdAt: "desc" } }
    },
  });

  if (!creator || creator.isNsfw) {
    return <div className="p-10 text-red-600">Creator not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-10">
      <h1 className="text-4xl font-bold mb-2">{creator.username}</h1>
      <p className="text-gray-600 mb-6">SFW Creator</p>

      <a
        href={`/sfw/subscribe/${creator.username}`}
        className="inline-block bg-pink-600 text-white px-4 py-2 rounded mb-8"
      >
        Subscribe with Stripe
      </a>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {creator.posts.map((post) => (
          <div key={post.id} className="relative">
            <img
              src={post.url}
              className="w-full h-full object-cover rounded-lg blur-sm brightness-50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white font-bold bg-black/50 px-2 py-1 rounded">
                Subscribe to unlock
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
