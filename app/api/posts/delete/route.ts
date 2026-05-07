import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getCreatorForApi } from "@/src/lib/creatorGuard";
import cloudinary from "@/src/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const creatorAccess = await getCreatorForApi();

    if (!creatorAccess.ok) {
      return NextResponse.json(
        { error: creatorAccess.error },
        { status: creatorAccess.status }
      );
    }

    const userId = creatorAccess.userId;

    const body = await req.json();
    const postId = String(body.id || body.postId || "").trim();

    if (!postId) {
      return NextResponse.json(
        { error: "Missing post id." },
        { status: 400 }
      );
    }

    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        authorId: userId,
      },
      include: {
        media: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found." },
        { status: 404 }
      );
    }

    for (const item of post.media) {
      if (item.publicId) {
        try {
          await cloudinary.uploader.destroy(item.publicId, {
            resource_type: item.type === "VIDEO" ? "video" : "image",
          });
        } catch (cloudinaryErr) {
          console.error("CLOUDINARY_DELETE_WARNING", cloudinaryErr);
        }
      }
    }

    await prisma.post.delete({
      where: { id: post.id },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("POST_DELETE_ERROR", err);

    return NextResponse.json(
      { error: err?.message || "Could not delete post." },
      { status: 500 }
    );
  }
}
