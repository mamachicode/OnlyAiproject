import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  const body = await req.json()

  const {
    subscriptionId,
    userEmail,
    status,
    stripeSubId,
    periodEnd,
  } = body

  if (!subscriptionId || !userEmail || !status) {
    return new Response("Invalid payload", { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true },
  })

  if (!user) return new Response("User not found", { status: 404 })

  await prisma.billingSubscription.upsert({
    where: { subscriptionId },

    update: {
      status,
      currentPeriodEnd: periodEnd ? new Date(periodEnd) : undefined,
    },

    create: {
      subscriptionId,
      stripeSubId: stripeSubId || subscriptionId,
      status,
      currentPeriodEnd: periodEnd ? new Date(periodEnd) : new Date(),
      userId: user.id,
    },
  })

  return new Response("OK", { status: 200 })
}
