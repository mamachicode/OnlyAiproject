import prisma from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

interface Props {
  params: { username: string };
}

export default async function SubscribeSfwPage({ params }: Props) {
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
      sfwPrice: true,
    },
  });

  if (!creator || creator.sfwPrice === null) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl font-bold">Creator not found</h1>
      </div>
    );
  }

  // Build the dynamic CCBill link (placeholder for now)
  const ccbillLink = `/api/ccbill/create-link?creator=${creator.username}&section=SFW`;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-3xl font-bold mb-2">@{creator.username}</h1>
      <p className="text-gray-600 mb-6">SFW Subscription</p>

      <div className="text-4xl font-bold mb-6">${creator.sfwPrice}</div>

      <Link 
        href={ccbillLink}
        className="w-full block bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded"
      >
        Subscribe Now
      </Link>
    </div>
  );
}
