import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * CCBill sends POST requests to this endpoint when a payment event occurs.
 * We’ll mark the user’s subscription as active if payment is successful.
 */

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const email = formData.get("email")?.toString();
    const eventType = formData.get("eventType")?.toString();

    if (!email || !eventType) {
      return NextResponse.json({ error: "Missing email or event type" }, { status: 400 });
    }

    if (eventType === "NewSaleSuccess" || eventType === "RenewalSuccess") {
      // Ensure user exists
      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.user.create({
          data: { email, password: "TEMP_HASHED", role: "FAN" },
        });
      }

      // Activate subscription
      await prisma.subscription.upsert({
        where: { userEmail: email },
        update: { active: true },
        create: {
          userEmail: email,
          active: true,
        },
      });

      console.log(`✅ Subscription activated for ${email}`);
      return NextResponse.json({ success: true });
    }

    if (eventType === "SubscriptionCancelled") {
      await prisma.subscription.updateMany({
        where: { userEmail: email },
        data: { active: false },
      });

      console.log(`🚫 Subscription cancelled for ${email}`);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: "Ignored event" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
