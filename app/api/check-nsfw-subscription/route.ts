import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/prisma"

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Find the user first
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return new Response(JSON.stringify({ active: false }), { status: 200 })
  }

  // Check active subscription in new Subscription model
  const sub = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
      status: "ACTIVE",
    },
  })

  return new Response(JSON.stringify({ active: !!sub }), { status: 200 })
}
