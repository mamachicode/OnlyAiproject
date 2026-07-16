// @ts-nocheck
import { NextResponse } from "next/server";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
import cloudinary from "@/src/lib/cloudinary";

export const runtime = "nodejs";

function cleanText(value: unknown, maxLength: number) {
  return String(value || "").trim().slice(0, maxLength);
}

async function getMasterCreator() {
  return prisma.creator.findFirst({
    where: {
      OR: [
        {
          handle: {
            equals: "demolitionbaby",
            mode: "insensitive",
          },
        },
        {
          user: {
            username: {
              equals: "demolitionbaby",
              mode: "insensitive",
            },
          },
        },
      ],
    },
  });
}

function contextValue(resource: any, key: string) {
  const custom = resource?.context?.custom;

  if (custom && typeof custom === "object") {
    return String(custom[key] || "");
  }

  const context = resource?.context;

  if (typeof context === "string") {
    const entry = context
      .split("|")
      .find((item) => item.startsWith(`${key}=`));

    return entry ? entry.slice(key.length + 1) : "";
  }

  return "";
}

async function verifyProfileUpload(
  publicId: string,
  secureUrl: string,
  ownerUserId: string,
  target: "avatar" | "banner"
) {
  if (!publicId || !secureUrl) {
    throw new Error("Uploaded image details are missing.");
  }

  const resource = await cloudinary.api.resource(publicId, {
    resource_type: "image",
    context: true,
  });

  if (
    contextValue(resource, "onlyai_user_id") !== ownerUserId ||
    contextValue(resource, "onlyai_lane") !== "nsfw" ||
    contextValue(resource, "onlyai_access") !==
      "private_processor_review" ||
    contextValue(resource, "onlyai_profile_target") !== target
  ) {
    throw new Error("Upload ownership could not be verified.");
  }

  const verifiedUrl = String(resource?.secure_url || "").trim();
  const bytes = Number(resource?.bytes || 0);
  const format = String(resource?.format || "")
    .trim()
    .toLowerCase();

  const allowedFormats = new Set([
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
  ]);

  if (!allowedFormats.has(format)) {
    throw new Error(
      "Only JPG, PNG, WebP, and GIF images are allowed."
    );
  }

  if (bytes <= 0) {
    throw new Error("Uploaded image is empty.");
  }

  if (bytes > 20 * 1024 * 1024) {
    throw new Error("Image is too large. Maximum size is 20 MB.");
  }

  if (
    !verifiedUrl.startsWith("https://res.cloudinary.com/") ||
    verifiedUrl !== secureUrl
  ) {
    throw new Error("Uploaded image URL could not be verified.");
  }

  return verifiedUrl;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const creator = await getMasterCreator();

    if (
      !session?.user?.id ||
      !creator ||
      session.user.id !== creator.userId
    ) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const nsfwDisplayName = cleanText(
      body?.nsfwDisplayName,
      50
    );

    const nsfwBio = cleanText(
      body?.nsfwBio,
      280
    );

    const nsfwPrice = Number(body?.nsfwPrice);

    if (
      !Number.isInteger(nsfwPrice) ||
      nsfwPrice < 1 ||
      nsfwPrice > 500
    ) {
      return NextResponse.json(
        {
          error:
            "NSFW monthly price must be a whole dollar amount between $1 and $500.",
        },
        { status: 400 }
      );
    }

    const removeAvatar = body?.removeNsfwAvatar === true;
    const removeBanner = body?.removeNsfwBanner === true;

    const avatarUpload = body?.avatarUpload;
    const bannerUpload = body?.bannerUpload;

    const nsfwAvatarUrl = avatarUpload
      ? await verifyProfileUpload(
          String(avatarUpload.publicId || ""),
          String(avatarUpload.secureUrl || ""),
          creator.userId,
          "avatar"
        )
      : null;

    const nsfwBannerUrl = bannerUpload
      ? await verifyProfileUpload(
          String(bannerUpload.publicId || ""),
          String(bannerUpload.secureUrl || ""),
          creator.userId,
          "banner"
        )
      : null;

    await prisma.$transaction([
      prisma.creator.update({
        where: {
          id: creator.id,
        },
        data: {
        nsfwDisplayName: nsfwDisplayName || null,
        nsfwBio: nsfwBio || null,
        ...(removeAvatar
          ? { nsfwAvatarUrl: null }
          : nsfwAvatarUrl
            ? { nsfwAvatarUrl }
            : {}),
          ...(removeBanner
            ? { nsfwBannerUrl: null }
            : nsfwBannerUrl
              ? { nsfwBannerUrl }
              : {}),
        },
      }),
      prisma.user.update({
        where: {
          id: creator.userId,
        },
        data: {
          nsfwPrice,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      redirectTo: "/admin/nsfw/profile?saved=1",
    });
  } catch (error) {
    console.error("ADMIN_NSFW_PROFILE_SAVE_ERROR", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not save the NSFW profile.",
      },
      { status: 400 }
    );
  }
}
