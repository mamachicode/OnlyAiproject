import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Handles CCBill webhook notifications.
 * CCBill will POST to this endpoint on events like subscription signup, rebill, and cancel.
 * We'll extract the email and subscription status, then update the user in Prisma.
 */

export async function POST(req: Request) {
  try {
    const data = await req.formData(); // CCBill sends application/x-www-form-urlencoded
    const eventType = data.get("eventType")?.toString();
    const email = data.get("email")?.toString();

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    if (eventType === "NewSaleSuccess" || eventType === "RenewalSuccess") {
      // Mark user as subscribed for 30 days
      const subscriptionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await prisma.user.upsert({
        where: { email },
        update: { subscribed: true, subscriptionExpires },
        create: {
          email,
          subscribed: true,
          subscriptionExpires,
        },
      });

      return NextResponse.json({ success: true, message: "User subscribed" });
    }

    if (eventType === "SubscriptionCanceled") {
      await prisma.user.updateMany({
        where: { email },
        data: { subscribed: false },
      });

      return NextResponse.json({ success: true, message: "User unsubscribed" });
    }

    return NextResponse.json({ success: true, message: "Event ignored" });
  } catch (err) {
    console.error("CCBill webhook error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
