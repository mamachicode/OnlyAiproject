import prisma from "@/src/lib/prisma";
import { auth } from "@/src/auth";
import Link from "next/link";

export default async function SubscribePage({ params }: { params: { username: string } }) {
  const session = await auth();

  if (!session) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-600 mb-4">You must be logged in to subscribe.</p>
        <Link href="/login" className="text-blue-600 underline">Go to Login</Link>
      </div>
    );
  }

  const creator = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      id: true,
      username: true,
      subscriptionPrice: true,
    },
  });

  if (!creator) {
    return <div className="p-10 text-red-600">Creator not found.</div>;
  }

  async function subscribe() {
    "use server";

    await fetch("/api/subscribe", {
      method: "POST",
      body: JSON.stringify({
        creatorId: creator.id,
      }),
    });
  }

  return (
    <div className="p-10 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-2">Subscribe to {creator.username}</h1>
      <p className="text-gray-700 mb-6">${creator.subscriptionPrice} / month</p>

      <form action={subscribe}>
        <button className="bg-pink-600 text-white px-6 py-3 rounded w-full text-lg">
          Subscribe Now
        </button>
      </form>
    </div>
  );
}
