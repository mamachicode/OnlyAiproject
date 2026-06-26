// @ts-nocheck
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return jsonError("Sign in to like posts.", 401);
    }

    const body = await req.json().catch(() => ({}));
    const postId = String(body.postId || "").trim();

    if (!postId) {
      return jsonError("Missing postId.", 400);
    }

    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        isNsfw: false,
      },
      select: {
        id: true,
      },
    });

    if (!post) {
      return jsonError("Post not found.", 404);
    }

    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    let liked = false;

    if (existingLike) {
      await prisma.postLike.delete({
        where: {
          id: existingLike.id,
        },
      });
    } else {
      await prisma.postLike.create({
        data: {
          postId,
          userId,
        },
      });

      liked = true;
    }

    const likeCount = await prisma.postLike.count({
      where: {
        postId,
      },
    });

    return NextResponse.json({
      postId,
      liked,
      likeCount,
    });
  } catch (error: any) {
    console.error("POST_LIKE_TOGGLE_ERROR", error);

    return jsonError(error?.message || "Could not update like.", 500);
  }
}
