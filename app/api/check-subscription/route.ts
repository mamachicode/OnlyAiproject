import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // Lookup user in DB
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
        subscriptions: {
          where: { active: true },
          select: { id: true, active: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ active: false, error: "User not found" }, { status: 404 });
    }

    const active = user.subscriptions.length > 0;

    return NextResponse.json({ active });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json({ active: false, error: "Server error" }, { status: 500 });
  }
}
