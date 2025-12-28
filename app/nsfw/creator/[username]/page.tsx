// @ts-nocheck
import prisma from "@/src/lib/prisma";

export default async function CreatorPage({ params }) {
  const { username } = params;

  const creator = await prisma.user.findUnique({
    where: { username },
    include: { posts: true },
  });

  if (!creator) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold">Creator not found</h1>
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-4">{creator.username}</h1>
      <p className="text-gray-600 mb-6">NSFW Creator Profile</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {creator.posts.map((post) => (
          <div key={post.id} className="border rounded p-4">
            <h2 className="font-semibold text-lg">{post.title}</h2>
            <p className="text-sm text-gray-500">{post.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
