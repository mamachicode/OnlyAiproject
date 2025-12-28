import { getAuthSession } from "@/lib/auth";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export default async function SubscribersPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return <div className="p-10 text-red-600">Not logged in</div>;
  }

  // Fetch all subscribers of this creator
  const subscribers = await prisma.subscription.findMany({
    where: { creatorId: session.user.id },
    include: {
      subscriber: { select: { email: true } }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Your Subscribers</h1>

      {subscribers.length === 0 ? (
        <p className="text-gray-600">You have no subscribers yet.</p>
      ) : (
        <div className="space-y-4">
          {subscribers.map((sub) => (
            <div key={sub.id} className="border p-4 rounded">
              <p className="font-semibold">{sub.subscriber.email}</p>
              <p className="text-gray-600 text-sm">
                Subscribed on: {new Date(sub.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
