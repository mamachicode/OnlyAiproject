// @ts-nocheck
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/src/auth";

export default async function SubscribePage({ params }) {
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

  const session = await getServerAuthSession();
  const isLoggedIn = !!session;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Subscribe to {creator.username}</h1>

      {!isLoggedIn ? (
        <p className="text-center text-gray-500">
          Please log in to subscribe.
        </p>
      ) : (
        <div>
          <p className="text-gray-600 mb-4">Monthly subscription options:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>SFW: ${creator.sfwPrice}</li>
            <li>NSFW: ${creator.nsfwPrice}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
