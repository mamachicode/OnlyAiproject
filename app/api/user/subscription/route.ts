// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/auth";

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sfwPrice, nsfwPrice } = await req.json();

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      sfwPrice: sfwPrice ?? undefined,
      nsfwPrice: nsfwPrice ?? undefined,
    },
  });

  return NextResponse.json({ success: true });
}
