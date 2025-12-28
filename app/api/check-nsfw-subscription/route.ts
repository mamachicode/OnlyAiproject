import { getServerAuthSession } from '@/src/auth';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import prisma from "@/src/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.name) {
      return NextResponse.json({ subscribed: false }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const creatorUsername = searchParams.get("creator");
    const viewerUsername = session.user.name;

    if (!creatorUsername) {
      return NextResponse.json({ error: "Missing creator" }, { status: 400 });
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
    return NextResponse.json({ error: "Subscription check failed" }, { status: 500 });
  }
}
