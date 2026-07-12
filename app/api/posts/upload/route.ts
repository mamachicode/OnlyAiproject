// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getCreatorForApi } from "@/src/lib/creatorGuard";
import { assertSafeText, prepareSafeUploadFile } from "@/src/lib/moderation";
import { sendManualReviewAlert } from "@/src/lib/manualReviewAlert";
import cloudinary from "@/src/lib/cloudinary";
import dns from "dns/promises";
import net from "net";

export const runtime = "nodejs";

const MAX_IMAGES_PER_POST = 10;
const MAX_VIDEO_BYTES = 25 * 1024 * 1024;
const MAX_REMOTE_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_REMOTE_REDIRECTS = 3;
const POST_UPLOAD_FOLDER = "onlyai/posts";

function redirectToUpload(req: Request, errorCode: string) {
  return NextResponse.redirect(
    new URL(`/dashboard/upload?error=${encodeURIComponent(errorCode)}`, req.url),
    303
  );
}

function uploadErrorResponse(
  req: Request,
  errorCode: string,
  wantsJson: boolean,
  status = 400
) {
  if (wantsJson) {
    return NextResponse.json({ error: errorCode }, { status });
  }

  return redirectToUpload(req, errorCode);
}

function uploadSuccessResponse(
  req: Request,
  wantsJson: boolean,
  moderationLevel: "safe" | "suggestive" | "manual_review" = "safe"
) {
  const redirectTo =
    moderationLevel === "manual_review"
      ? "/dashboard/posts?uploaded=1&moderation=manual_review"
      : moderationLevel === "suggestive"
        ? "/dashboard/posts?uploaded=1&moderation=suggestive"
        : "/dashboard/posts?uploaded=1";

  if (wantsJson) {
    return NextResponse.json({
      ok: true,
      redirectTo,
      moderation: {
        level: moderationLevel,
      },
    });
  }

  return NextResponse.redirect(new URL(redirectTo, req.url), 303);
}

function classifyUploadError(error: any) {
  const message = String(error?.message || "").toLowerCase();

  if (
    message.includes("too many") ||
    message.includes("10 images") ||
    message.includes("ten images")
  ) {
    return "count";
  }

  if (
    message.includes("too large") ||
    message.includes("max 20mb") ||
    message.includes("max 25mb") ||
    message.includes("size")
  ) {
    return "size";
  }

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
  const files = [...formData.getAll("files"), ...formData.getAll("file")];

  return files.filter((file: any) => {
    return (
      file &&
      typeof file === "object" &&
      file.size > 0 &&
      typeof file.arrayBuffer === "function"
    );
  });
}

function getImageUrlFromValue(value: any) {
  return String(value || "").trim();
}

function getImageUrl(formData: FormData) {
  return getImageUrlFromValue(
    formData.get("imageUrl") ||
      formData.get("mediaUrl") ||
      formData.get("url") ||
      ""
  );
}

function normalizeDirectMediaList(value: any) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const publicId = String(item?.publicId || item?.public_id || "").trim();
      const url = String(item?.url || item?.secure_url || "").trim();
      const resourceType = String(
        item?.resourceType || item?.resource_type || ""
      )
        .trim()
        .toLowerCase();
      const type = String(item?.type || "").trim().toUpperCase();
      const bytes = Number(item?.bytes || 0);

      return {
        publicId,
        url,
        resourceType:
          resourceType === "video" || type === "VIDEO" ? "video" : "image",
        type: resourceType === "video" || type === "VIDEO" ? "VIDEO" : "IMAGE",
        bytes,
      };
    })
    .filter((item) => item.publicId);
}

function mediaKindFromFile(file: any) {
  const mime = String(file?.type || "").toLowerCase();

  if (mime.startsWith("video/")) return "VIDEO";
  return "IMAGE";
}

function assertPostMediaRules({
  files,
  directMedia,
  hasRemoteImage,
}: {
  files: any[];
  directMedia: any[];
  hasRemoteImage: boolean;
}) {
  const kinds = [
    ...files.map(mediaKindFromFile),
    ...directMedia.map((item) => item.type),
    ...(hasRemoteImage ? ["IMAGE"] : []),
  ];

  const imageCount = kinds.filter((kind) => kind === "IMAGE").length;
  const videoCount = kinds.filter((kind) => kind === "VIDEO").length;

  if (!imageCount && !videoCount) {
    throw new Error("Add media before uploading.");
  }

  if (videoCount > 1) {
    throw new Error("Only one video can be added per post right now.");
  }

  if (videoCount === 1 && imageCount > 0) {
    throw new Error("Upload either multiple images or one short video for now.");
  }

  if (imageCount > MAX_IMAGES_PER_POST) {
    throw new Error("Too many images. Add up to 10 images per post.");
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

  if (
    !["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"].includes(
      mime
    )
  ) {
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

  const mediaType =
    safeFile.type || (safeFile.mime.startsWith("video/") ? "VIDEO" : "IMAGE");
  const resourceType =
    safeFile.resourceType || (mediaType === "VIDEO" ? "video" : "image");

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: POST_UPLOAD_FOLDER,
    resource_type: resourceType,
  });

  return {
    url: result.secure_url,
    type: mediaType,
    order,
    publicId: result.public_id,
    resourceType,
    moderation: safeFile.moderation,
  };
}

function assertCloudinaryPublicId(publicId: string) {
  if (!publicId || publicId.length > 300) {
    throw new Error("Upload could not be verified.");
  }

  if (!publicId.startsWith(`${POST_UPLOAD_FOLDER}/`)) {
    throw new Error("Upload could not be verified.");
  }

  if (!/^[a-zA-Z0-9_./-]+$/.test(publicId)) {
    throw new Error("Upload could not be verified.");
  }

  return publicId;
}

function getCloudinaryContextOwner(resource: any) {
  return String(
    resource?.context?.custom?.onlyai_user_id ||
      resource?.context?.onlyai_user_id ||
      ""
  );
}

async function verifyDirectCloudinaryMedia(item: any, userId: string) {
  const publicId = assertCloudinaryPublicId(item.publicId);
  const resourceType = item.resourceType === "video" ? "video" : "image";

  const resource = await cloudinary.api.resource(publicId, {
    resource_type: resourceType,
    context: true,
  });

  const ownerId = getCloudinaryContextOwner(resource);

  if (ownerId !== userId) {
    throw new Error("Upload could not be verified. Try adding the media again.");
  }

  const secureUrl = String(resource?.secure_url || item.url || "").trim();

  if (!secureUrl.startsWith("https://res.cloudinary.com/")) {
    throw new Error("Upload could not be verified.");
  }

  const bytes = Number(resource?.bytes || item.bytes || 0);

  if (resourceType === "video" && bytes > MAX_VIDEO_BYTES) {
    throw new Error("Video is too large. Max 25MB.");
  }

  if (resourceType === "image" && bytes > MAX_REMOTE_IMAGE_BYTES) {
    throw new Error("Image is too large. Max 20MB.");
  }

  return {
    publicId,
    url: secureUrl,
    type: resourceType === "video" ? "VIDEO" : "IMAGE",
    resourceType,
    bytes,
  };
}

async function prepareVerifiedDirectMedia(item: any, order: number) {
  if (item.resourceType === "video") {
    return {
      url: item.url,
      type: "VIDEO",
      order,
      publicId: item.publicId,
      resourceType: "video",
    };
  }

  const imageFile = await fetchRemoteImageAsFile(item.url);
  const safeFile = await prepareSafeUploadFile(imageFile);

  return {
    url: item.url,
    type: "IMAGE",
    order,
    publicId: item.publicId,
    resourceType: "image",
    moderation: safeFile.moderation,
  };
}

async function cleanupCloudinaryMedia(items: any[]) {
  const seen = new Set();

  for (const item of items) {
    const publicId = String(item?.publicId || "").trim();

    if (!publicId || seen.has(publicId)) continue;
    seen.add(publicId);

    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: item?.resourceType === "video" ? "video" : "image",
      });
    } catch (error) {
      console.warn("POST_UPLOAD_CLEANUP_WARNING", publicId, error);
    }
  }
}

function toPostMediaCreate(item: any) {
  return {
    url: item.url,
    type: item.type,
    order: item.order,
    publicId: item.publicId,
  };
}

export async function POST(req: Request) {
  const wantsJson = String(req.headers.get("content-type") || "")
    .toLowerCase()
    .includes("application/json");

  let directCleanupMedia: any[] = [];
  let uploadedMedia: any[] = [];

  try {
    const creatorAccess = await getCreatorForApi();

    if (!creatorAccess.ok) {
      const target =
        creatorAccess.status === 401
          ? "/login?callbackUrl=/dashboard/upload"
          : "/account";

      if (wantsJson) {
        return NextResponse.json(
          {
            error: "auth",
            redirectTo: target,
          },
          { status: creatorAccess.status === 401 ? 401 : 403 }
        );
      }

      return NextResponse.redirect(new URL(target, req.url), 303);
    }

    const userId = creatorAccess.userId;

    let title = "Members-only post";
    let content = "";
    let files: any[] = [];
    let imageUrl = "";
    let directMedia: any[] = [];

    if (wantsJson) {
      const body = await req.json();

      title = String(body?.title || body?.caption || "Members-only post").trim();
      content = String(body?.content || body?.caption || "").trim();
      imageUrl = getImageUrlFromValue(body?.imageUrl || body?.mediaUrl || body?.url);
      directMedia = normalizeDirectMediaList(body?.media);
    } else {
      const formData = await req.formData();

      title = String(
        formData.get("title") ||
          formData.get("caption") ||
          "Members-only post"
      ).trim();

      content = String(
        formData.get("content") ||
          formData.get("caption") ||
          ""
      ).trim();

      files = getFiles(formData);
      imageUrl = getImageUrl(formData);
    }

    assertSafeText([title, content]);

    const hasRemoteImage = Boolean(imageUrl);

    if (!files.length && !directMedia.length && !hasRemoteImage) {
      return uploadErrorResponse(req, "nofile", wantsJson);
    }

    assertPostMediaRules({
      files,
      directMedia,
      hasRemoteImage,
    });

    for (let i = 0; i < files.length; i++) {
      const media = await uploadToCloudinary(files[i], uploadedMedia.length);
      uploadedMedia.push(media);
    }

    if (directMedia.length) {
      const verifiedDirectMedia = [];

      for (const item of directMedia) {
        verifiedDirectMedia.push(await verifyDirectCloudinaryMedia(item, userId));
      }

      directCleanupMedia = verifiedDirectMedia;

      for (const item of verifiedDirectMedia) {
        uploadedMedia.push(
          await prepareVerifiedDirectMedia(item, uploadedMedia.length)
        );
      }
    }

    if (hasRemoteImage) {
      const remoteFile = await fetchRemoteImageAsFile(imageUrl);
      uploadedMedia.push(
        await uploadToCloudinary(remoteFile, uploadedMedia.length)
      );
    }

    const moderationLevel = uploadedMedia.some(
      (item) => item?.moderation?.level === "manual_review"
    )
      ? "manual_review"
      : uploadedMedia.some(
          (item) => item?.moderation?.level === "suggestive"
        )
        ? "suggestive"
        : "safe";

    const createdPost = await prisma.post.create({
      data: {
        title: title || "Members-only post",
        content: content || null,
        isNsfw: false,
        authorId: userId,
        isLocked: true,
        priceCents: null,
        media: {
          create: uploadedMedia.map(toPostMediaCreate),
        },
      },
    });

    if (moderationLevel === "manual_review") {
      const manualReviewMedia = uploadedMedia.filter(
        (item) => item?.moderation?.level === "manual_review"
      );

      console.warn("MANUAL_REVIEW_REQUIRED", {
        source: "post_upload",
        postId: createdPost.id,
        userId,
        mediaCount: manualReviewMedia.length,
      });

      const creatorSnapshot = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          username: true,
          creator: {
            select: {
              handle: true,
            },
          },
        },
      });

      const reviewPublicIds = manualReviewMedia
        .map((item) => String(item?.publicId || "").trim())
        .filter(Boolean);

      await prisma.moderationReview.upsert({
        where: {
          pendingKey: createdPost.id,
        },
        update: {
          postId: createdPost.id,
          creatorUserId: userId,
          creatorHandle:
            creatorSnapshot?.creator?.handle ||
            creatorSnapshot?.username ||
            null,
          postTitle: createdPost.title || null,
          source: "post_upload",
          reason: "Sightengine quota reached",
          mediaPublicIds: reviewPublicIds,
          createdAt: new Date(),
        },
        create: {
          postId: createdPost.id,
          pendingKey: createdPost.id,
          creatorUserId: userId,
          creatorHandle:
            creatorSnapshot?.creator?.handle ||
            creatorSnapshot?.username ||
            null,
          postTitle: createdPost.title || null,
          source: "post_upload",
          reason: "Sightengine quota reached",
          mediaPublicIds: reviewPublicIds,
        },
      });

      await sendManualReviewAlert({
        source: "post_upload",
        postId: createdPost.id,
        userId,
        mediaCount: manualReviewMedia.length,
        publicIds: manualReviewMedia
          .map((item) => String(item?.publicId || "").trim())
          .filter(Boolean),
      });
    }

    directCleanupMedia = [];
    uploadedMedia = [];

    return uploadSuccessResponse(req, wantsJson, moderationLevel);
  } catch (error) {
    console.error("POST_UPLOAD_ERROR", error);

    await cleanupCloudinaryMedia([...directCleanupMedia, ...uploadedMedia]);

    return uploadErrorResponse(req, classifyUploadError(error), wantsJson);
  }
}
