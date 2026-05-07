// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getCreatorForApi } from "@/src/lib/creatorGuard";
import { assertSafeText } from "@/src/lib/moderation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const creatorAccess = await getCreatorForApi();

    if (!creatorAccess.ok) {
      return jsonError(creatorAccess.error, creatorAccess.status);
    }

    const posts = await prisma.post.findMany({
      where: {
        authorId: creatorAccess.userId,
        isNsfw: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        media: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(posts);
  } catch (error: any) {
    console.error("POSTS_GET_ERROR", error);

    return jsonError(error?.message || "Could not load posts.", 500);
  }
}

export async function POST(req: Request) {
  try {
    const creatorAccess = await getCreatorForApi();

    if (!creatorAccess.ok) {
      return jsonError(creatorAccess.error, creatorAccess.status);
    }

    const body = await req.json().catch(() => ({}));

    const title = String(
      body.title ||
      body.caption ||
      "Members-only post"
    ).trim();

    const content = String(
      body.content ||
      body.caption ||
      ""
    ).trim();

    const mediaUrl = String(
      body.mediaUrl ||
      body.imageUrl ||
      body.url ||
      ""
    ).trim();

    assertSafeText([title, content, mediaUrl]);

    const mediaType =
      String(body.mediaType || body.type || "").toUpperCase() === "VIDEO"
        ? "VIDEO"
        : "IMAGE";

    const post = await prisma.post.create({
      data: {
        title: title || "Members-only post",
        content: content || null,
        isNsfw: false,
        authorId: creatorAccess.userId,
        isLocked: body.isLocked === false ? false : true,
        priceCents: null,
        ...(mediaUrl
          ? {
              media: {
                create: [
                  {
                    url: mediaUrl,
                    type: mediaType,
                    order: 0,
                    publicId: body.publicId || null,
                  },
                ],
              },
            }
          : {}),
      },
      include: {
        media: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error("POSTS_CREATE_ERROR", error);

    return jsonError(error?.message || "Could not create post.", 500);
  }
}
