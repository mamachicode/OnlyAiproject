// @ts-nocheck
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // Prevent TypeScript from enforcing the baked-in Stripe API constraint
  apiVersion: process.env.STRIPE_API_VERSION ?? undefined,
});

export async function POST(req: Request) {
  try {
    const { priceId, successUrl, cancelUrl } = await req.json();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    return NextResponse.json(
      { error: "Session creation failed" },
      { status: 500 }
    );
  }
}
