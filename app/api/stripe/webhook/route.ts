// @ts-nocheck
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/src/lib/prisma";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: process.env.STRIPE_API_VERSION || "2024-04-10",
});

function stripePeriodEndToDate(value: unknown) {
  const seconds = Number(value || 0);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return new Date(seconds * 1000);
}

function getStripeCurrentPeriodEnd(stripeSub: any) {
  const itemPeriodEnd = stripeSub.items?.data?.find(
    (item: any) => Number(item?.current_period_end || 0) > 0
  )?.current_period_end;

  return stripePeriodEndToDate(stripeSub.current_period_end || itemPeriodEnd);
}

function mapStripeStatus(status: string) {
  if (status === "active" || status === "trialing") return "ACTIVE";
  if (status === "canceled" || status === "unpaid" || status === "incomplete_expired") return "CANCELED";
  return "EXPIRED";
}

async function recordWebhookEvent(event: Stripe.Event, rawBody: string, status = "RECEIVED", error?: string) {
  try {
    await prisma.webhookEvent.upsert({
      where: {
        processor_eventId: {
          processor: "STRIPE",
          eventId: event.id,
        },
      },
      update: {
        eventType: event.type,
        payload: event as any,
        rawBody,
        status,
        error: error || null,
        processedAt: status === "PROCESSED" ? new Date() : null,
      },
      create: {
        processor: "STRIPE",
        eventId: event.id,
        eventType: event.type,
        payload: event as any,
        rawBody,
        status,
        error: error || null,
        processedAt: status === "PROCESSED" ? new Date() : null,
      },
    });
  } catch (err) {
    console.error("STRIPE_WEBHOOK_EVENT_RECORD_ERROR", err);
  }
}

async function upsertSubscriptionFromStripeSubscription(stripeSub: any) {
  const metadata = stripeSub.metadata || {};

  const fanUserId = metadata.fanUserId;
  const creatorId = metadata.creatorId;

  if (!fanUserId || !creatorId || !stripeSub.id) {
    console.warn("STRIPE_SUBSCRIPTION_MISSING_METADATA", {
      subscriptionId: stripeSub.id,
      fanUserId,
      creatorId,
    });
    return;
  }

  const status = mapStripeStatus(stripeSub.status);
  const currentPeriodEnd = getStripeCurrentPeriodEnd(stripeSub);
  const endedAt = status === "ACTIVE" ? null : new Date();

  const existingByExternalId = await prisma.subscription.findUnique({
    where: {
      processor_externalId: {
        processor: "STRIPE",
        externalId: stripeSub.id,
      },
    },
    select: { id: true },
  });

  if (existingByExternalId) {
    await prisma.subscription.update({
      where: { id: existingByExternalId.id },
      data: {
        userId: fanUserId,
        creatorId,
        status,
        currentPeriodEnd,
        endedAt,
      },
    });
    return;
  }

  const existingByFanCreator = await prisma.subscription.findUnique({
    where: {
      userId_creatorId_processor: {
        userId: fanUserId,
        creatorId,
        processor: "STRIPE",
      },
    },
    select: { id: true, externalId: true, status: true },
  });

  if (existingByFanCreator) {
    await prisma.subscription.update({
      where: { id: existingByFanCreator.id },
      data: {
        externalId: stripeSub.id,
        status,
        currentPeriodEnd,
        endedAt,
      },
    });
    return;
  }

  await prisma.subscription.create({
    data: {
      userId: fanUserId,
      creatorId,
      processor: "STRIPE",
      externalId: stripeSub.id,
      status,
      currentPeriodEnd,
      endedAt,
    },
  });
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  let event: Stripe.Event | null = null;

  try {
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("STRIPE_WEBHOOK_SECRET_MISSING");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    await recordWebhookEvent(event, rawBody, "RECEIVED");

    if (event.type === "checkout.session.completed") {
      const checkoutSession = event.data.object as any;

      if (checkoutSession.mode === "subscription" && checkoutSession.subscription) {
        const stripeSub = await stripe.subscriptions.retrieve(
          String(checkoutSession.subscription)
        );

        await upsertSubscriptionFromStripeSubscription(stripeSub);
      }
    }

    if (event.type === "customer.subscription.updated") {
      const stripeSubEvent = event.data.object as any;
      const latestStripeSub = await stripe.subscriptions.retrieve(
        String(stripeSubEvent.id)
      );

      await upsertSubscriptionFromStripeSubscription(latestStripeSub);
    }

    if (event.type === "customer.subscription.deleted") {
      const stripeSub = event.data.object as any;
      await upsertSubscriptionFromStripeSubscription(stripeSub);
    }

    await recordWebhookEvent(event, rawBody, "PROCESSED");

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("STRIPE_WEBHOOK_ERROR", err);

    const message = err instanceof Error ? err.message : String(err);

    if (event) {
      await recordWebhookEvent(event, rawBody, "FAILED", message);
    }

    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
