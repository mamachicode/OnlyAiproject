import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  const body = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: body.priceId,
        quantity: 1,
      },
    ],
    success_url: body.successUrl,
    cancel_url: body.cancelUrl,
    customer_email: body.email,
  });

  return NextResponse.json({ url: session.url });
}
