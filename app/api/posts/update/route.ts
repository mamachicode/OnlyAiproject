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

function assertVideoUploadRules(files: any[]) {
  const videoFiles = files.filter((file: any) =>
    String(file?.type || "").toLowerCase().startsWith("video/")
  );

  if (videoFiles.length > 1) {
    throw new Error("Only one video can be added per post right now.");
  }

  if (videoFiles.length === 1 && files.length > 1) {
    throw new Error("Upload either multiple images or one short video for now.");
  }
}


async function uploadToCloudinary(file: any, order: number) {
  const safeFile = await prepareSafeUploadFile(file);
  const dataUri = `data:${safeFile.mime};base64,${safeFile.buffer.toString("base64")}`;

  const mediaType = safeFile.type || (safeFile.mime.startsWith("video/") ? "VIDEO" : "IMAGE");
  const resourceType = safeFile.resourceType || (mediaType === "VIDEO" ? "video" : "image");

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "onlyai/posts",
    resource_type: resourceType,
  });

  return {
    url: result.secure_url,
    type: mediaType,
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
    const removeMediaIds = formData
      .getAll("removeMediaIds")
      .map((value) => String(value || ""))
      .filter(Boolean);

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

    const ownedMediaToRemove = post.media.filter((media) =>
      removeMediaIds.includes(media.id)
    );

    const ownedRemoveIds = ownedMediaToRemove.map((media) => media.id);

    const files = getFiles(formData);
    assertVideoUploadRules(files);

    const nextOrder =
      post.media.length > 0
        ? Math.max(...post.media.map((media) => media.order || 0)) + 1
        : 0;

    const newMedia = [];

    for (let i = 0; i < files.length; i++) {
      newMedia.push(await uploadToCloudinary(files[i], nextOrder + i));
    }

    for (const media of ownedMediaToRemove) {
      if (!media.publicId) continue;

      try {
        await cloudinary.uploader.destroy(media.publicId, {
          resource_type: media.type === "VIDEO" ? "video" : "image",
        });
      } catch (cloudinaryError) {
        console.warn("POST_MEDIA_DELETE_CLOUDINARY_WARNING", cloudinaryError);
      }
    }

    const mediaUpdate: any = {};

    if (ownedRemoveIds.length) {
      mediaUpdate.deleteMany = {
        id: {
          in: ownedRemoveIds,
        },
      };
    }

    if (newMedia.length) {
      mediaUpdate.create = newMedia;
    }

    await prisma.post.update({
      where: { id: post.id },
      data: {
        title: title || "Members-only post",
        content: content || null,
        isLocked,
        isNsfw: false,
        ...(Object.keys(mediaUpdate).length
          ? {
              media: mediaUpdate,
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
