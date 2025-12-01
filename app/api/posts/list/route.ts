import prisma from "@/src/lib/prisma";
import { auth } from "@/src/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ posts: [] });

  const posts = await prisma.post.findMany({
    where: { creatorId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ posts });
}
