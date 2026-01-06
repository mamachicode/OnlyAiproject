import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/prisma"

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 })
  }

  const sub = await prisma.billingSubscription.findFirst({
    where: {
      user: { email: session.user.email },
      status: "ACTIVE",
    },
  })

  return new Response(JSON.stringify({ active: !!sub }), { status: 200 })
}
