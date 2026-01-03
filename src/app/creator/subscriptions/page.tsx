import { getAuthSession } from "@/lib/auth";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export default async function SubscriptionsDashboard() {
  const session = await getAuthSession();

  if (!session) {
    return <div className="p-10 text-red-500">You must be logged in to view your subscriptions.</div>;
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    include: {
      creator: {
        select: {
          username: true,
          subscriptionPrice: true,
        },
      },
    },
  });

  return (
    <div className="max-w-3xl mx-auto p-10">
      <h1 className="text-4xl font-bold mb-6">Your Subscriptions</h1>

      {subscriptions.length === 0 && (
        <p className="text-gray-500">You are not subscribed to any creators yet.</p>
      )}

      <div className="space-y-4">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="border p-4 rounded-lg flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{sub.creator.username}</h2>
              <p className="text-gray-500">${sub.creator.subscriptionPrice}/month</p>
              <p className={`mt-1 text-sm ${sub.active ? "text-green-600" : "text-red-600"}`}>
                {sub.active ? "Active" : "Inactive"}
              </p>
            </div>

            <a
              href={`/creator/${sub.creator.username}`}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
            >
              View Creator
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
