// @ts-nocheck
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();

// IMPORTANT: remove fixed API version to avoid TS "basil" lock error
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: process.env.STRIPE_API_VERSION ?? undefined,
});

export async function POST(req: Request) {
  try {
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const rawBody = await req.text();

    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    // Handle subscription events
    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as any;

      await prisma.subscription.upsert({
        where: { stripeSubscriptionId: sub.id },
        update: {
          active: sub.status === "active",
        },
        create: {
          stripeSubscriptionId: sub.id,
          active: sub.status === "active",
          userEmail: sub.customer_email || "",
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
