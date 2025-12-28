import { getAuthSession } from "@/src/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/src/auth";

export async function PUT(req: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { price } = await req.json();

  if (!price || price < 1) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { subscriptionPrice: price },
  });

  return NextResponse.json({ success: true });
}
