import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const body = await req.json();

  const { userId, creatorId } = body;

  if (!userId || !creatorId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await prisma.subscription.upsert({
    where: {
      userId_creatorId: { userId, creatorId }
    },
    update: { active: true },
    create: {
      userId,
      creatorId,
      active: true
    }
  });

  return NextResponse.json({ success: true });
}
