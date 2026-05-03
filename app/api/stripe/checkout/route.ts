// @ts-nocheck
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/src/lib/prisma";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: process.env.STRIPE_API_VERSION || "2024-04-10",
});

function cleanHandle(value: unknown) {
  return String(value || "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 30);
}

async function readUsername(req: Request) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await req.json();
    return cleanHandle(body.username || body.creator || body.handle);
  }

  const formData = await req.formData();
  return cleanHandle(
    formData.get("username") || formData.get("creator") || formData.get("handle")
  );
}

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Payments are not available right now." },
        { status: 500 }
      );
    }

    const username = await readUsername(req);

    if (!username) {
      return NextResponse.json(
        { error: "Creator not found." },
        { status: 400 }
      );
    }

    const creator = await prisma.creator.findFirst({
      where: {
        classification: "SFW",
        OR: [
          { handle: username },
          {
            user: {
              username,
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found." },
        { status: 404 }
      );
    }

    const unitAmount = Number(creator.priceCents || 0);

    if (!Number.isInteger(unitAmount) || unitAmount < 100 || unitAmount > 50000) {
      return NextResponse.json(
        { error: "This creator’s price is not available right now." },
        { status: 400 }
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      new URL(req.url).origin;

    const handle = creator.handle || creator.user.username;
    const currency = String(creator.currency || "USD").toLowerCase();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: unitAmount,
            recurring: {
              interval: "month",
            },
            product_data: {
              name: `@${handle} on OnlyAi`,
              description: "Monthly creator membership",
              metadata: {
                creatorId: creator.id,
                creatorUserId: creator.userId,
                creatorHandle: handle,
                section: "SFW",
              },
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/billing/success?creator=${encodeURIComponent(handle)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscribe/${encodeURIComponent(handle)}?canceled=1`,
      metadata: {
        creatorId: creator.id,
        creatorUserId: creator.userId,
        creatorHandle: handle,
        processor: "STRIPE",
        section: "SFW",
        priceCents: String(unitAmount),
      },
      subscription_data: {
        metadata: {
          creatorId: creator.id,
          creatorUserId: creator.userId,
          creatorHandle: handle,
          processor: "STRIPE",
          section: "SFW",
          priceCents: String(unitAmount),
        },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Checkout is not available right now." },
        { status: 500 }
      );
    }

    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    console.error("STRIPE_CHECKOUT_ERROR", err);

    return NextResponse.json(
      { error: "Checkout is not available right now." },
      { status: 500 }
    );
  }
}
