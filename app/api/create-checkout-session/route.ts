// @ts-nocheck
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: process.env.STRIPE_API_VERSION || "2024-04-10",
});

export async function POST() {
  try {
    const body = await new Response(await new Request("").arrayBuffer()).json();

    const { priceId, successUrl, cancelUrl } = body;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Checkout session failed" },
      { status: 500 }
    );
  }
}
