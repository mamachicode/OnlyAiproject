import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/prisma"

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) return new Response("User not found", { status: 404 })

  const sub = await prisma.billingSubscription.findFirst({
    where: {
      userId: user.id,
      status: "ACTIVE",
    },
  })

  return new Response(JSON.stringify({ active: !!sub }), { status: 200 })
}
