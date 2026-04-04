// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const email = data.email;
    const creatorId = data.creatorId;

    if (!email || !creatorId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if the user exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // If not, create without 'role' since schema doesn't support it anymore
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          password: "TEMP_HASHED", // replaced by real hash later
        },
      });
    }

    // Create subscription
    await prisma.subscription.create({
      data: {
        userId: user.id,
        creatorId,
        active: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CCBill Webhook Error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
