// @ts-nocheck
import prisma from "@/src/lib/prisma";

export default async function NsfwSubscribePage({ params }) {
  const { username } = params;

  const creator = await prisma.user.findUnique({
    where: { username },
    select: {
      username: true,
      avatar: true,
      nsfwPrice: true,
      bio: true,
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
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Subscribe to {creator.username}</h1>

      <div className="bg-black/20 p-4 rounded-lg mb-6">
        <p className="text-gray-300">
          Unlock NSFW content for <span className="font-bold">${creator.nsfwPrice}/month</span>.
        </p>
      </div>

      <form action="/api/ccbill/create-link" method="GET">
        <input type="hidden" name="creator" value={creator.username} />
        <input type="hidden" name="section" value="nsfw" />

        <button
          type="submit"
          className="bg-pink-600 hover:bg-pink-700 transition text-white px-6 py-3 rounded-lg w-full"
        >
          Continue to Payment
        </button>
      </form>
    </div>
  );
}
