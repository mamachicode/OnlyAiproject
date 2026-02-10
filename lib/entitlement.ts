import prisma from "@/lib/prisma"

export async function hasActiveSubscription(
  userId: string,
  creatorId: string
): Promise<boolean> {
  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      creatorId,
      status: "ACTIVE",
    },
  })

  if (!sub) return false

  // If no period end defined, assume active (legacy behavior)
  if (!sub.currentPeriodEnd) return true

  return sub.currentPeriodEnd > new Date()
}
