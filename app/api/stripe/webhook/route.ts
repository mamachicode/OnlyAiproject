import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed.', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // ✅ Log event type and full payload
  console.log("✅ Stripe Event Received:", event.type);
  console.log("📦 Full Payload:", JSON.stringify(event, null, 2));

  // ✅ Handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerEmail = session.customer_email;
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;

    if (customerEmail && subscriptionId && customerId) {
      try {
        await prisma.subscription.upsert({
          where: { userId: customerEmail },
          update: {
            status: 'active',
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            currentPeriodEnd: new Date((session.expires_at || 0) * 1000),
          },
          create: {
            userId: customerEmail,
            status: 'active',
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            currentPeriodEnd: new Date((session.expires_at || 0) * 1000),
          },
        });
        console.log(`✅ Subscription saved for ${customerEmail}`);
      } catch (err: any) {
        console.error('❌ Failed to save subscription:', err.message);
      }
    } else {
      console.warn("⚠️ Missing customerEmail, subscriptionId, or customerId");
    }
  }

  return new Response('✅ Webhook received', { status: 200 });
}
