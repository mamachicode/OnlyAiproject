import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const eventType = form.get("eventType");
    const subscriptionId = form.get("subscriptionId");
    const subscriberUsername = form.get("subscriberUsername");
    const creatorUsername = form.get("creatorUsername");
    const siteSection = form.get("siteSection");

    if (!subscriberUsername || !creatorUsername || !siteSection) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await prisma.billingSubscription.upsert({
      where: { subscriptionId: String(subscriptionId || "") },
      update: {
        status: String(eventType || "Unknown"),
      },
      create: {
        subscriptionId: String(subscriptionId || ""),
        eventType: String(eventType || "Unknown"),
        subscriberUsername: String(subscriberUsername),
        creatorUsername: String(creatorUsername),
        siteSection: String(siteSection),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Webhook failure", details: String(err) }, { status: 500 });
  }
}
