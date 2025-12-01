import prisma from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

interface Props {
  params: { username: string };
}

export default async function SubscribeNsfwPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold">Login Required</h1>
        <p className="mt-4">Please login to subscribe to creators.</p>
        <Link href="/auth/login" className="underline text-blue-600">Login</Link>
      </div>
    );
  }

  const creator = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      username: true,
      email: true,
      nsfwPrice: true,
      isNsfw: true,
    },
  });

  if (!creator || creator.nsfwPrice === null || creator.isNsfw !== true) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl font-bold">Creator not found or NSFW disabled</h1>
      </div>
    );
  }

  const ccbillLink = `/api/ccbill/create-link?creator=${creator.username}&section=NSFW`;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-3xl font-bold mb-2">@{creator.username}</h1>
      <p className="text-gray-600 mb-6">NSFW Subscription</p>

      <div className="text-4xl font-bold mb-6">${creator.nsfwPrice}</div>

      <Link 
        href={ccbillLink}
        className="w-full block bg-red-600 hover:bg-red-700 text-white text-center py-3 rounded"
      >
        Subscribe Now (18+)
      </Link>
    </div>
  );
}
