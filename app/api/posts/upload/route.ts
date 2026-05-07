// @ts-nocheck
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
import { getCreatorForApi } from "@/src/lib/creatorGuard";
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

const BLOCKED_SFW_TERMS = [
  "porn",
  "xxx",
  "nude",
  "nudity",
  "explicit",
  "fetish",
  "hardcore",
  "onlyfans",
  "nsfw",
  "18+",
];

function assertSafeText(values: string[]) {
  const combined = values.join(" ").toLowerCase();

  for (const term of BLOCKED_SFW_TERMS) {
    if (combined.includes(term)) {
      throw new Error("This post text is not allowed in the Stripe SFW lane.");
    }
  }
}

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
  const mime = String(file.type || "application/octet-stream");

  if (!mime.startsWith("image/") && !mime.startsWith("video/")) {
    throw new Error("Only image and video uploads are supported.");
  }

  const maxSizeMb = mime.startsWith("video/") ? 100 : 20;
  const maxBytes = maxSizeMb * 1024 * 1024;

  if (file.size > maxBytes) {
    throw new Error(`File is too large. Max ${maxSizeMb}MB.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${mime};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "onlyai/posts",
    resource_type: mime.startsWith("video/") ? "video" : "image",
  });

  return {
    url: result.secure_url,
    type: mime.startsWith("video/") ? "VIDEO" : "IMAGE",
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
      return NextResponse.json(
        { error: "Upload at least one image or video." },
        { status: 400 }
      );
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

    return NextResponse.redirect(new URL("/dashboard/posts?uploaded=1", req.url), 303);
  } catch (error) {
    console.error("POST_UPLOAD_ERROR", error);

    return NextResponse.json(
      { error: error?.message || "Could not upload post." },
      { status: 500 }
    );
  }
}
