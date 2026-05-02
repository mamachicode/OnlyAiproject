import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
import { assertSafeText } from "@/src/lib/moderation";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
        isNsfw: false,
      },
      orderBy: { createdAt: "desc" },
      include: {
        media: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ posts });
  } catch (err: any) {
    console.error("POSTS_GET_ERROR", err);
    return NextResponse.json(
      { error: err?.message || "Could not load posts." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const title = String(body.title || body.caption || "Members-only post").trim();
    const content = String(body.content || body.caption || "").trim();
    const mediaUrl = String(body.url || "").trim();
    const publicId = body.publicId ? String(body.publicId).trim() : null;

    assertSafeText([title, content]);

    const post = await prisma.post.create({
      data: {
        title: title || "Members-only post",
        content: content || null,
        isNsfw: false,
        authorId: userId,
        isLocked: true,
        priceCents: null,
        ...(mediaUrl
          ? {
              media: {
                create: {
                  url: mediaUrl,
                  publicId,
                  type: "IMAGE",
                  order: 0,
                },
              },
            }
          : {}),
      },
      include: {
        media: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ ok: true, post });
  } catch (err: any) {
    console.error("POSTS_CREATE_ERROR", err);
    return NextResponse.json(
      { error: err?.message || "Could not create post." },
      { status: 500 }
    );
  }
}
