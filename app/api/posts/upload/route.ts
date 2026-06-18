// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getCreatorForApi } from "@/src/lib/creatorGuard";
import { assertSafeText, prepareSafeUploadFile } from "@/src/lib/moderation";
import { v2 as cloudinary } from "cloudinary";
import dns from "dns/promises";
import net from "net";

export const runtime = "nodejs";

const MAX_REMOTE_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_REMOTE_REDIRECTS = 3;

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
    message.includes("image url") ||
    message.includes("remote image") ||
    message.includes("direct image link") ||
    message.includes("private network") ||
    message.includes("https url")
  ) {
    return "url";
  }

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

function getImageUrl(formData: FormData) {
  return String(
    formData.get("imageUrl") ||
    formData.get("mediaUrl") ||
    formData.get("url") ||
    ""
  ).trim();
}

function assertVideoUploadRules(files: any[], hasRemoteImage = false) {
  const videoFiles = files.filter((file: any) =>
    String(file?.type || "").toLowerCase().startsWith("video/")
  );

  if (videoFiles.length > 1) {
    throw new Error("Only one video can be added per post right now.");
  }

  if (videoFiles.length === 1 && (files.length > 1 || hasRemoteImage)) {
    throw new Error("Upload either multiple images or one short video for now.");
  }
}

function isBlockedHostname(hostname: string) {
  const lower = hostname.toLowerCase();

  return (
    lower === "localhost" ||
    lower === "127.0.0.1" ||
    lower === "0.0.0.0" ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal")
  );
}

function isPrivateIp(address: string) {
  const version = net.isIP(address);

  if (!version) return false;

  if (version === 4) {
    const parts = address.split(".").map((part) => Number(part));

    if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
      return true;
    }

    const [a, b] = parts;

    return (
      a === 10 ||
      a === 127 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      a === 0
    );
  }

  const lower = address.toLowerCase();

  return (
    lower === "::1" ||
    lower.startsWith("fc") ||
    lower.startsWith("fd") ||
    lower.startsWith("fe80")
  );
}

async function assertSafeRemoteUrl(rawUrl: string) {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Image URL must be a direct HTTPS image link.");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("Image URL must be a direct HTTPS image link.");
  }

  if (isBlockedHostname(parsed.hostname)) {
    throw new Error("Image URL cannot point to a private network.");
  }

  const resolved = await dns.lookup(parsed.hostname, { all: true });

  if (!resolved.length || resolved.some((item) => isPrivateIp(item.address))) {
    throw new Error("Image URL cannot point to a private network.");
  }

  return parsed;
}

function filenameFromRemoteUrl(url: URL, mime: string) {
  const fallbackExtension =
    mime === "image/png"
      ? "png"
      : mime === "image/webp"
        ? "webp"
        : mime === "image/gif"
          ? "gif"
          : "jpg";

  let base = "";

  try {
    base = decodeURIComponent(url.pathname.split("/").pop() || "");
  } catch {
    base = url.pathname.split("/").pop() || "";
  }

  base = base
    .replace(/[?#].*$/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

  if (!base || !base.includes(".")) {
    return `remote-image.${fallbackExtension}`;
  }

  return base;
}

async function fetchRemoteImageAsFile(rawUrl: string, redirectCount = 0): Promise<any> {
  const parsed = await assertSafeRemoteUrl(rawUrl);

  const res = await fetch(parsed.toString(), {
    method: "GET",
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
    headers: {
      "user-agent": "OnlyAi image fetcher",
      accept: "image/jpeg,image/png,image/webp,image/gif",
    },
  });

  if ([301, 302, 303, 307, 308].includes(res.status)) {
    if (redirectCount >= MAX_REMOTE_REDIRECTS) {
      throw new Error("Image URL has too many redirects.");
    }

    const location = res.headers.get("location");

    if (!location) {
      throw new Error("Image URL redirect is missing a location.");
    }

    const nextUrl = new URL(location, parsed).toString();
    return fetchRemoteImageAsFile(nextUrl, redirectCount + 1);
  }

  if (!res.ok) {
    throw new Error("Image URL could not be loaded.");
  }

  const mime = String(res.headers.get("content-type") || "")
    .split(";")[0]
    .trim()
    .toLowerCase();

  if (!["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"].includes(mime)) {
    throw new Error("Image URL must point directly to a JPG, PNG, WebP, or GIF image.");
  }

  const contentLength = Number(res.headers.get("content-length") || 0);

  if (contentLength > MAX_REMOTE_IMAGE_BYTES) {
    throw new Error("Remote image is too large. Max 20MB.");
  }

  const buffer = Buffer.from(await res.arrayBuffer());

  if (!buffer.length) {
    throw new Error("Remote image is empty.");
  }

  if (buffer.length > MAX_REMOTE_IMAGE_BYTES) {
    throw new Error("Remote image is too large. Max 20MB.");
  }

  const filename = filenameFromRemoteUrl(parsed, mime);

  return {
    name: filename,
    type: mime,
    size: buffer.length,
    async arrayBuffer() {
      return buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
    },
  };
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
    const imageUrl = getImageUrl(formData);
    const hasRemoteImage = Boolean(imageUrl);

    if (!files.length && !hasRemoteImage) {
      return redirectToUpload(req, "nofile");
    }

    assertVideoUploadRules(files, hasRemoteImage);

    const uploadedMedia = [];

    for (let i = 0; i < files.length; i++) {
      uploadedMedia.push(await uploadToCloudinary(files[i], i));
    }

    if (hasRemoteImage) {
      const remoteFile = await fetchRemoteImageAsFile(imageUrl);
      uploadedMedia.push(await uploadToCloudinary(remoteFile, uploadedMedia.length));
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
