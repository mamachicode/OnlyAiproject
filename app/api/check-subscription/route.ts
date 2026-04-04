// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/auth";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email missing" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscriptions: true,   // <-- Runtime-valid, TS ignored
      },
    });

    if (!user) {
      return NextResponse.json(
        { subscribed: false },
        { status: 404 }
      );
    }

    const active = user.subscriptions?.some((s) => s.active);

    return NextResponse.json({
      subscribed: !!active,
    });
  } catch (error) {
    console.error("Subscription check error:", error);
    return NextResponse.json(
      { error: "Subscription check failed" },
      { status: 500 }
    );
  }
}
