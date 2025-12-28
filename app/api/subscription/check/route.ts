import { getAuthSession } from "@/src/lib/auth";
import { NextResponse } from "next/server";
import { auth } from "@/src/auth";
import prisma from "@/src/lib/prisma";

export async function GET(req) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ subscribed: false });

  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get("creatorId");
  if (!creatorId) return NextResponse.json({ subscribed: false });

  const sub = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      creatorId,
      active: true,
    },
  });

  return NextResponse.json({ subscribed: Boolean(sub) });
}
