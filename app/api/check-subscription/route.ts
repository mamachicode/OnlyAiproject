import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return new Response("Invalid JSON", { status: 400 })
  }

  const creatorId = String(body?.creatorId ?? "").trim()
  const processor = String(body?.processor ?? "CCBILL").toUpperCase()

  if (!creatorId) {
    return new Response("creatorId required", { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    return new Response(JSON.stringify({ active: false }), { status: 200 })
  }

  const sub = await prisma.subscription.findUnique({
    where: {
      uniq_user_creator_processor: {
        userId: user.id,
        creatorId,
        processor: processor as any,
      },
    },
    select: { status: true },
  })

  const active = !!sub && sub.status === "ACTIVE"

  return new Response(JSON.stringify({ active }), { status: 200 })
}
