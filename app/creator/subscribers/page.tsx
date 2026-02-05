import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export default async function SubscribersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return <div>Unauthorized</div>
  }

  // Find logged-in user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) return <div>User not found</div>

  // Find creator profile
  const creator = await prisma.creator.findUnique({
    where: { userId: user.id },
    select: { id: true },
  })

  if (!creator) {
    return <div>You do not have a creator profile yet.</div>
  }

  // Find active subscriptions for this creator
  const subs = await prisma.subscription.findMany({
    where: {
      creatorId: creator.id,
      status: "ACTIVE",
    },
    include: {
      user: true, // subscriber
    },
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Subscribers</h1>

      {subs.length === 0 && <p>No active subscribers yet.</p>}

      <ul className="space-y-2">
        {subs.map((s) => (
          <li key={s.id} className="border rounded p-2">
            <p>{s.user.email}</p>
            <p className="text-sm text-gray-500">Status: {s.status}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
