import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get("stripe-signature")!

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
    const sub = event.data.object as Stripe.Subscription

    const subscriptionId = sub.id
    const stripeSubId = sub.id
    const status = sub.status
    const userEmail = sub.metadata.email

    const periodEnd =
      sub.items.data[0]?.price.recurring?.interval
        ? new Date(
            (sub.items.data[0].current_period_end ??
              Math.floor(Date.now() / 1000)) * 1000
          )
        : new Date()

    if (!userEmail) return new Response("Missing user email", { status: 400 })

    await prisma.billingSubscription.upsert({
      where: { subscriptionId },

      update: {
        status,
        currentPeriodEnd: periodEnd,
      },

      create: {
        subscriptionId,
        stripeSubId,
        status,
        currentPeriodEnd: periodEnd,
        user: { connect: { email: userEmail } },
      },
    })
  }

  return new Response("OK", { status: 200 })
}
