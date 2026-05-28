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

function redirectToUpload(req: Request, errorCode: string) {
  return NextResponse.redirect(
    new URL(`/dashboard/upload?error=${encodeURIComponent(errorCode)}`, req.url),
    303
  );
}

function classifyUploadError(error: any) {
  const message = String(error?.message || "").toLowerCase();

  if (
    message.includes("video") ||
    message.includes("unsupported media") ||
    message.includes("resource_type")
  ) {
    return "video";
  }

  if (
    message.includes("text") ||
    message.includes("caption") ||
    message.includes("title") ||
    message.includes("word") ||
    message.includes("language")
  ) {
    return "text";
  }

  if (
    message.includes("moderation") ||
    message.includes("sightengine") ||
    message.includes("unsafe") ||
    message.includes("sfw") ||
    message.includes("nsfw") ||
    message.includes("explicit") ||
    message.includes("nudity") ||
    message.includes("adult") ||
    message.includes("blocked")
  ) {
    return "moderation";
  }

  if (
    message.includes("cloudinary") ||
    message.includes("upload") ||
    message.includes("api key") ||
    message.includes("api_secret") ||
    message.includes("configuration") ||
    message.includes("configured") ||
    message.includes("storage")
  ) {
    return "storage";
  }

  return "failed";
}

function getFiles(formData: FormData) {
  const files = [
    ...formData.getAll("files"),
    ...formData.getAll("file"),
  ];

  return files.filter((file: any) => {
    return (
      file &&
      typeof file === "object" &&
      file.size > 0 &&
      typeof file.arrayBuffer === "function"
    );
  });
}

function assertVideoBetaRules(files: any[]) {
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
          ? "/login?callbackUrl=/dashboard/upload"
          : "/account";

      return NextResponse.redirect(new URL(target, req.url), 303);
    }

    const userId = creatorAccess.userId;
    const formData = await req.formData();

    const title = String(
      formData.get("title") ||
      formData.get("caption") ||
      "Members-only post"
    ).trim();

    const content = String(
      formData.get("content") ||
      formData.get("caption") ||
      ""
    ).trim();

    assertSafeText([title, content]);

    const files = getFiles(formData);

    if (!files.length) {
      return redirectToUpload(req, "nofile");
    }

    const uploadedMedia = [];

    for (let i = 0; i < files.length; i++) {
      uploadedMedia.push(await uploadToCloudinary(files[i], i));
    }

    await prisma.post.create({
      data: {
        title: title || "Members-only post",
        content: content || null,
        isNsfw: false,
        authorId: userId,
        isLocked: true,
        priceCents: null,
        media: {
          create: uploadedMedia,
        },
      },
    });

    return NextResponse.redirect(
      new URL("/dashboard/posts?uploaded=1", req.url),
      303
    );
  } catch (error) {
    console.error("POST_UPLOAD_ERROR", error);

    return redirectToUpload(req, classifyUploadError(error));
  }
}
