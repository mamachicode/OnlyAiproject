// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, creatorId } = body;

    if (!userId || !creatorId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await prisma.subscription.create({
      data: {
        userId,
        creatorId,
        active: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}
