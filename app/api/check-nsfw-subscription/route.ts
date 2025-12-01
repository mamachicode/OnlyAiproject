import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/**
 * Checks if a user has an ACTIVE NSFW subscription to a creator.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ subscribed: false }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const viewerUsername = session.user.name; // user.name = username
    const creatorUsername = searchParams.get("creator");

    if (!creatorUsername) {
      return NextResponse.json(
        { error: "Missing creator" },
        { status: 400 }
      );
    }

    const sub = await prisma.billingSubscription.findFirst({
      where: {
        subscriberUsername: viewerUsername,
        creatorUsername,
        siteSection: "NSFW",
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ subscribed: !!sub });
  } catch (err) {
    return NextResponse.json(
      { error: "Subscription check failed", details: String(err) },
      { status: 500 }
    );
  }
}
