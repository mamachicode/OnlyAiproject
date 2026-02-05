import prisma from "@/lib/prisma"

function normalizeStatus(input: unknown): "ACTIVE" | "CANCELED" | "EXPIRED" {
  const s = String(input ?? "").trim().toUpperCase()
  if (s === "ACTIVE") return "ACTIVE"
  if (s === "CANCELED" || s === "CANCELLED") return "CANCELED"
  if (s === "EXPIRED") return "EXPIRED"
  return "EXPIRED"
}

function normalizeProcessor(input: unknown): "CCBILL" | "STRIPE" {
  const p = String(input ?? "").trim().toUpperCase()
  if (p === "CCBILL") return "CCBILL"
  if (p === "STRIPE") return "STRIPE"
  throw new Error("INVALID_PROCESSOR")
}

export async function POST(req: Request) {
  let rawBody = ""
  let body: any

  try {
    rawBody = await req.text()
    body = rawBody ? JSON.parse(rawBody) : {}
  } catch {
    return new Response("Invalid JSON", { status: 400 })
  }

  const {
    processor: processorRaw,
    eventId,
    eventType,
    userEmail,
    creatorId,
    externalId,
    status,
    periodEnd,
  } = body ?? {}

  if (!eventId || !eventType || !userEmail || !creatorId || !externalId) {
    return new Response("Invalid payload (missing required fields)", { status: 400 })
  }

  let processor: "CCBILL" | "STRIPE"
  try {
    processor = normalizeProcessor(processorRaw)
  } catch {
    return new Response("Invalid processor", { status: 400 })
  }

  const normalizedStatus = normalizeStatus(status)

  const user = await prisma.user.findUnique({
    where: { email: String(userEmail).trim().toLowerCase() },
    select: { id: true },
  })

  if (!user) return new Response("User not found", { status: 404 })

  // Idempotency
  try {
    await prisma.webhookEvent.create({
      data: {
        processor,
        eventId: String(eventId),
        eventType: String(eventType),
        status: "RECEIVED",
        payload: body ?? null,
        rawBody,
      },
    })
  } catch {
    return new Response("OK (duplicate)", { status: 200 })
  }

  try {
    const creator = await prisma.creator.findUnique({
      where: { id: String(creatorId) },
      select: { id: true },
    })

    if (!creator) {
      await prisma.webhookEvent.update({
        where: { uniq_processor_eventId: { processor, eventId: String(eventId) } },
        data: { status: "FAILED", processedAt: new Date(), error: "CREATOR_NOT_FOUND" },
      })
      return new Response("Creator not found", { status: 404 })
    }

    await prisma.subscription.upsert({
      where: {
        uniq_user_creator_processor: {
          userId: user.id,
          creatorId: creator.id,
          processor,
        },
      },
      update: {
        externalId: String(externalId),
        status: normalizedStatus,
        currentPeriodEnd: periodEnd ? new Date(String(periodEnd)) : undefined,
        endedAt: normalizedStatus === "ACTIVE" ? null : new Date(),
      },
      create: {
        userId: user.id,
        creatorId: creator.id,
        processor,
        externalId: String(externalId),
        status: normalizedStatus,
        currentPeriodEnd: periodEnd ? new Date(String(periodEnd)) : undefined,
      },
    })

    await prisma.webhookEvent.update({
      where: { uniq_processor_eventId: { processor, eventId: String(eventId) } },
      data: { status: "PROCESSED", processedAt: new Date() },
    })

    return new Response("OK", { status: 200 })
  } catch (e: any) {
    await prisma.webhookEvent.update({
      where: { uniq_processor_eventId: { processor, eventId: String(eventId) } },
      data: { status: "FAILED", processedAt: new Date(), error: String(e?.message ?? "UNKNOWN_ERROR") },
    })

    return new Response("Webhook processing failed", { status: 500 })
  }
}
