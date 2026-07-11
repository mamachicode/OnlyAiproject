// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getCreatorForApi } from "@/src/lib/creatorGuard";
import { assertSafeText, prepareSafeUploadFile } from "@/src/lib/moderation";
import cloudinary from "@/src/lib/cloudinary";

export const runtime = "nodejs";

const MAX_IMAGES_PER_POST = 10;
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_VIDEO_BYTES = 25 * 1024 * 1024;
const POST_UPLOAD_FOLDER = "onlyai/posts";

function wantsJsonResponse(req: Request) {
  return String(req.headers.get("content-type") || "")
    .toLowerCase()
    .includes("application/json");
}

function jsonError(error: string, message: string, status = 400) {
  return NextResponse.json({ error, message }, { status });
}

function updateSuccessResponse(
  req: Request,
  postId: string,
  wantsJson: boolean,
  moderationLevel: "safe" | "suggestive" = "safe"
) {
  const redirectTo =
    moderationLevel === "suggestive"
      ? `/dashboard/posts/${postId}/edit?saved=1&moderation=suggestive`
      : `/dashboard/posts/${postId}/edit?saved=1`;

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

function updateAuthResponse(req: Request, wantsJson: boolean, status: number) {
  const redirectTo = status === 401 ? "/login?callbackUrl=/dashboard/posts" : "/account";

  if (wantsJson) {
    return NextResponse.json(
      {
        error: "auth",
        redirectTo,
      },
      { status }
    );
  }

  return NextResponse.redirect(new URL(redirectTo, req.url), 303);
}

function classifyUploadError(error: any) {
  const message = String(error?.message || "").toLowerCase();

  if (message.includes("10 images") || message.includes("too many")) {
    return "count";
  }

  if (message.includes("too large") || message.includes("20mb") || message.includes("25mb")) {
    return "size";
  }

  if (message.includes("video")) {
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
    message.includes("storage") ||
    message.includes("configured")
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

function mediaKindFromFile(file: any) {
  const mime = String(file?.type || "").toLowerCase();

  if (mime.startsWith("video/")) return "VIDEO";
  return "IMAGE";
}

function normalizeDirectMediaList(value: any) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const publicId = String(item?.publicId || item?.public_id || "").trim();
      const url = String(item?.url || item?.secure_url || "").trim();
      const resourceType = String(item?.resourceType || item?.resource_type || "")
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

function assertPostMediaRules({
  existingMedia,
  files,
  directMedia,
}: {
  existingMedia: any[];
  files: any[];
  directMedia: any[];
}) {
  const kinds = [
    ...existingMedia.map((item) => item.type),
    ...files.map(mediaKindFromFile),
    ...directMedia.map((item) => item.type),
  ];

  const imageCount = kinds.filter((kind) => kind === "IMAGE").length;
  const videoCount = kinds.filter((kind) => kind === "VIDEO").length;

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

  if (resourceType === "image" && bytes > MAX_IMAGE_BYTES) {
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

function filenameFromCloudinary(item: any) {
  const base = String(item.publicId || "cloudinary-image")
    .split("/")
    .pop()
    ?.replace(/[^a-zA-Z0-9._-]/g, "-")
    .slice(0, 80);

  return base || "cloudinary-image";
}

async function fetchCloudinaryImageAsFile(item: any) {
  let lastStatus = 0;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(item.url, {
        method: "GET",
        signal: AbortSignal.timeout(15000),
        headers: {
          accept: "image/jpeg,image/png,image/webp,image/gif",
          "cache-control": "no-cache",
        },
      });

      lastStatus = res.status;

      if (!res.ok) {
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 750));
          continue;
        }

        break;
      }

      const mime = String(res.headers.get("content-type") || "")
        .split(";")[0]
        .trim()
        .toLowerCase();

      const buffer = Buffer.from(await res.arrayBuffer());

      if (!buffer.length) {
        throw new Error("Upload file is empty.");
      }

      if (buffer.length > MAX_IMAGE_BYTES) {
        throw new Error("Image is too large. Max 20MB.");
      }

      return {
        name: filenameFromCloudinary(item),
        type: mime || "image/jpeg",
        size: buffer.length,
        async arrayBuffer() {
          return buffer.buffer.slice(
            buffer.byteOffset,
            buffer.byteOffset + buffer.byteLength
          );
        },
      };
    } catch (error) {
      lastError = error;

      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 750));
        continue;
      }
    }
  }

  console.error("EDIT_CLOUDINARY_FETCH_FAILURE", {
    publicId: item?.publicId,
    status: lastStatus,
    error: lastError instanceof Error ? lastError.message : String(lastError || ""),
  });

  throw new Error(
    "The uploaded image could not be retrieved for its safety check. Please try saving again."
  );
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

  const imageFile = await fetchCloudinaryImageAsFile(item);
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
      console.warn("POST_UPDATE_CLEANUP_WARNING", publicId, error);
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
  const wantsJson = wantsJsonResponse(req);
  let directCleanupMedia: any[] = [];
  let newMedia: any[] = [];

  try {
    const creatorAccess = await getCreatorForApi();

    if (!creatorAccess.ok) {
      return updateAuthResponse(req, wantsJson, creatorAccess.status);
    }

    const userId = creatorAccess.userId;

    let postId = "";
    let title = "Members-only post";
    let content = "";
    let isLocked = true;
    let removeMediaIds: string[] = [];
    let files: any[] = [];
    let directMedia: any[] = [];

    if (wantsJson) {
      const body = await req.json();

      postId = String(body?.postId || "").trim();
      title = String(body?.title || "Members-only post").trim();
      content = String(body?.content || "").trim();
      isLocked = Boolean(body?.isLocked);
      removeMediaIds = Array.isArray(body?.removeMediaIds)
        ? body.removeMediaIds.map((value: any) => String(value || "")).filter(Boolean)
        : [];
      directMedia = normalizeDirectMediaList(body?.media);
    } else {
      const formData = await req.formData();

      postId = String(formData.get("postId") || "");
      title = String(formData.get("title") || "Members-only post").trim();
      content = String(formData.get("content") || "").trim();
      isLocked = formData.get("isLocked") === "on";
      removeMediaIds = formData
        .getAll("removeMediaIds")
        .map((value) => String(value || ""))
        .filter(Boolean);
      files = getFiles(formData);
    }

    if (!postId) {
      return jsonError("failed", "Missing post ID.", 400);
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
      return jsonError("failed", "Post not found or unauthorized.", 404);
    }

    const ownedMediaToRemove = post.media.filter((media) =>
      removeMediaIds.includes(media.id)
    );

    const ownedRemoveIds = ownedMediaToRemove.map((media) => media.id);

    const remainingMedia = post.media.filter(
      (media) => !ownedRemoveIds.includes(media.id)
    );

    assertPostMediaRules({
      existingMedia: remainingMedia,
      files,
      directMedia,
    });

    const nextOrder =
      remainingMedia.length > 0
        ? Math.max(...remainingMedia.map((media) => media.order || 0)) + 1
        : 0;

    for (let i = 0; i < files.length; i++) {
      newMedia.push(await uploadToCloudinary(files[i], nextOrder + newMedia.length));
    }

    if (directMedia.length) {
      const verifiedDirectMedia = [];

      for (const item of directMedia) {
        verifiedDirectMedia.push(await verifyDirectCloudinaryMedia(item, userId));
      }

      directCleanupMedia = verifiedDirectMedia;

      for (const item of verifiedDirectMedia) {
        newMedia.push(
          await prepareVerifiedDirectMedia(item, nextOrder + newMedia.length)
        );
      }
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
      mediaUpdate.create = newMedia.map(toPostMediaCreate);
    }

    const moderationLevel = newMedia.some(
      (item) => item?.moderation?.level === "suggestive"
    )
      ? "suggestive"
      : "safe";

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

    directCleanupMedia = [];
    newMedia = [];

    return updateSuccessResponse(
      req,
      post.id,
      wantsJson,
      moderationLevel
    );
  } catch (error) {
    console.error("POST_UPDATE_ERROR", error);

    await cleanupCloudinaryMedia([...directCleanupMedia, ...newMedia]);

    if (wantsJson) {
      return NextResponse.json(
        {
          error: classifyUploadError(error),
          message: error?.message || "Could not update post.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "Could not update post." },
      { status: 500 }
    );
  }
}
