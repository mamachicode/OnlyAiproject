import { getAuthSession } from "@/src/lib/auth";
import prisma from "@/lib/prisma";
import { auth } from "@/src/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getAuthSession();
  if (!session)
    return NextResponse.json({ posts: [] });

  const posts = await prisma.post.findMany({
    where: { creatorId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ posts });
}
