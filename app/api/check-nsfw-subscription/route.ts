import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/prisma"
import { hasActiveSubscription } from "@/lib/entitlement"

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

  const active = await hasActiveSubscription(user.id, creatorId)

  return new Response(JSON.stringify({ active }), { status: 200 })
}
