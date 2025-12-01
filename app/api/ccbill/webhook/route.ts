import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * CCBill MOCK MODE Webhook
 * -------------------------
 *  - Accepts CCBill-style POST form-data
 *  - Writes to BillingSubscription table
 *  - NO MD5 validation yet (no credentials)
 *  - Safe for CCBill pre-approval
 */

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const eventType = form.get("eventType") as string | null;
    const subscriptionId = form.get("subscriptionId") as string | null;
    const subscriberUsername = form.get("subscriberUsername") as string | null;
    const creatorUsername = form.get("creatorUsername") as string | null;
    const siteSection = form.get("siteSection") as string | null;
    const price = form.get("price") as string | null;

    if (!eventType || !subscriberUsername || !creatorUsername || !siteSection) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let status = "UNKNOWN";

    switch (eventType) {
      case "NewSaleSuccess":
      case "RenewalSuccess":
        status = "ACTIVE";
        break;
      case "CancelSubscription":
      case "Void":
      case "Chargeback":
        status = "CANCELLED";
        break;
      default:
        status = "UNKNOWN";
    }

    await prisma.billingSubscription.upsert({
      where: {
        subscriberUsername_creatorUsername_siteSection: {
          subscriberUsername,
          creatorUsername,
          siteSection,
        },
      },
      update: {
        status,
        price: price ? Number(price) : undefined,
        subscriptionId: subscriptionId ?? undefined,
      },
      create: {
        subscriberUsername,
        creatorUsername,
        siteSection,
        status,
        price: price ? Number(price) : 0,
        subscriptionId: subscriptionId ?? "mock-subscription-id",
      },
    });

    return NextResponse.json({
      success: true,
      eventReceived: eventType,
      mockMode: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Webhook error", details: String(error) },
      { status: 500 }
    );
  }
}
