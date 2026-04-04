// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ subscribed: false });

  const userEmail = session.user?.email;
  if (!userEmail) return NextResponse.json({ subscribed: false });

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: {
      subscriptions: {
        where: { active: true },
        select: { id: true, active: true },
      },
    },
  });

  const isSubscribed = user?.subscriptions?.length > 0;

  return NextResponse.json({ subscribed: isSubscribed });
}
