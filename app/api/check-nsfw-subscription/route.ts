// @ts-nocheck
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/auth";
import prisma from "@/src/lib/prisma";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { subscribed: false },
        { status: 401 }
      );
    }

    const isSubscribed = await prisma.subscription.findFirst({
      where: {
        userEmail: session.user.email,
        active: true,
        nsfw: true,
      },
    });

    return NextResponse.json({
      subscribed: !!isSubscribed,
    });
  } catch (error) {
    console.error("NSFW subscription check error:", error);
    return NextResponse.json(
      { error: "Error checking subscription" },
      { status: 500 }
    );
  }
}
