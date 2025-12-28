import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { getServerAuthSession } from "@/src/auth";

export async function GET(req, { params }) {
  const { username } = params;
  const session = await getServerAuthSession();

  if (!session) {
    return NextResponse.json({ subscribed: false }, { status: 401 });
  }

  // Check active subscription using username-based BillingSubscription model
  const subscription = await prisma.billingSubscription.findFirst({
    where: {
      subscriberUsername: session.user.name,
      creatorUsername: username,
      status: "ACTIVE"
    }
  });

  return NextResponse.json({
    subscribed: !!subscription
  });
}
