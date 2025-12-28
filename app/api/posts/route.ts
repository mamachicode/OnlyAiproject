import { getAuthSession } from "@/src/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/src/auth";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await prisma.post.findMany({
    where: { creatorId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url, publicId, caption } = await req.json();

  const post = await prisma.post.create({
    data: {
      url,
      publicId,
      caption,
      creatorId: session.user.id,
    },
  });

  return NextResponse.json(post);
}
