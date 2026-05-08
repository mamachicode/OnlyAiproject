// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getCreatorForApi } from "@/src/lib/creatorGuard";
import { assertSafeText, prepareSafeUploadFile } from "@/src/lib/moderation";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:
    process.env.CLOUDINARY_API_KEY ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getFiles(formData: FormData) {
  const files = [
    ...formData.getAll("files"),
    ...formData.getAll("file"),
  ];

  return files.filter((file: any) => {
    return file && typeof file === "object" && file.size > 0 && typeof file.arrayBuffer === "function";
  });
}

async function uploadToCloudinary(file: any, order: number) {
  const safeFile = await prepareSafeUploadFile(file);
  const dataUri = `data:${safeFile.mime};base64,${safeFile.buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "onlyai/posts",
    resource_type: "image",
  });

  return {
    url: result.secure_url,
    type: "IMAGE",
    order,
    publicId: result.public_id,
  };
}

export async function POST(req: Request) {
  try {
    const creatorAccess = await getCreatorForApi();

    if (!creatorAccess.ok) {
      const target =
        creatorAccess.status === 401
          ? "/login?callbackUrl=/dashboard/posts"
          : "/account";

      return NextResponse.redirect(new URL(target, req.url), 303);
    }

    const userId = creatorAccess.userId;
    const formData = await req.formData();

    const postId = String(formData.get("postId") || "");
    const title = String(formData.get("title") || "Members-only post").trim();
    const content = String(formData.get("content") || "").trim();
    const isLocked = formData.get("isLocked") === "on";

    if (!postId) {
      return NextResponse.json({ error: "Missing post ID." }, { status: 400 });
    }

    assertSafeText([title, content]);

    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        authorId: userId,
      },
      include: {
        media: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found or unauthorized." },
        { status: 404 }
      );
    }

    const files = getFiles(formData);
    const nextOrder =
      post.media.length > 0
        ? Math.max(...post.media.map((media) => media.order || 0)) + 1
        : 0;

    const newMedia = [];

    for (let i = 0; i < files.length; i++) {
      newMedia.push(await uploadToCloudinary(files[i], nextOrder + i));
    }

    await prisma.post.update({
      where: { id: post.id },
      data: {
        title: title || "Members-only post",
        content: content || null,
        isLocked,
        isNsfw: false,
        ...(newMedia.length
          ? {
              media: {
                create: newMedia,
              },
            }
          : {}),
      },
    });

    return NextResponse.redirect(
      new URL(`/dashboard/posts/${post.id}/edit?saved=1`, req.url),
      303
    );
  } catch (error) {
    console.error("POST_UPDATE_ERROR", error);

    return NextResponse.json(
      { error: error?.message || "Could not update post." },
      { status: 500 }
    );
  }
}
