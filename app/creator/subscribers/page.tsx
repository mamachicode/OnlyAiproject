import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export default async function SubscribersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return <div>Unauthorized</div>
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) return <div>User not found</div>

  const subs = await prisma.billingSubscription.findMany({
    where: {
      userId: user.id,
      status: "ACTIVE",
    },
    include: {
      user: true,
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
