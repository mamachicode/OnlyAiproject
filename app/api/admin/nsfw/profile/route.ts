// @ts-nocheck
import { NextResponse } from "next/server";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
import cloudinary from "@/src/lib/cloudinary";

export const runtime = "nodejs";

function cleanText(value: FormDataEntryValue | null, maxLength: number) {
  return String(value || "").trim().slice(0, maxLength);
}

function getUploadFile(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "object") return null;
  if (typeof (value as any).arrayBuffer !== "function") return null;
  if (Number((value as any).size || 0) <= 0) return null;
  return value as any;
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

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

async function prepareNsfwProfileImage(file: any) {
  if (
    !file ||
    typeof file !== "object" ||
    typeof file.arrayBuffer !== "function"
  ) {
    throw new Error("Invalid image file.");
  }

  const mime = String(file.type || "")
    .trim()
    .toLowerCase();

  const size = Number(file.size || 0);

  if (!ALLOWED_IMAGE_MIMES.has(mime)) {
    throw new Error(
      "Only JPG, PNG, WebP, and GIF images are allowed."
    );
  }

  if (size <= 0) {
    throw new Error("Image file is empty.");
  }

  if (size > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large. Max 20 MB.");
  }

  const buffer = Buffer.from(
    await file.arrayBuffer()
  );

  if (!buffer.length) {
    throw new Error("Image file is empty.");
  }

  return {
    buffer,
    mime,
  };
}

async function uploadImage(file: any, folder: string) {
  const prepared = await prepareNsfwProfileImage(file);

  const dataUri =
    `data:${prepared.mime};base64,${prepared.buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
  });

  const secureUrl = String(
    result.secure_url || ""
  ).trim();

  if (
    !secureUrl.startsWith(
      "https://res.cloudinary.com/"
    )
  ) {
    throw new Error(
      "Uploaded image URL could not be verified."
    );
  }

  return secureUrl;
}

function redirectWith(req: Request, values: Record<string, string>) {
  const url = new URL("/admin/nsfw/profile", req.url);

  for (const [key, value] of Object.entries(values)) {
    url.searchParams.set(key, value.slice(0, 180));
  }

  return NextResponse.redirect(url, 303);
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

    const formData = await req.formData();

    const nsfwDisplayName = cleanText(
      formData.get("nsfwDisplayName"),
      50
    );

    const nsfwBio = cleanText(
      formData.get("nsfwBio"),
      280
    );

    const avatarFile = getUploadFile(
      formData.get("nsfwAvatar")
    );

    const bannerFile = getUploadFile(
      formData.get("nsfwBanner")
    );

    const removeAvatar =
      formData.get("removeNsfwAvatar") === "1" &&
      !avatarFile;

    const removeBanner =
      formData.get("removeNsfwBanner") === "1" &&
      !bannerFile;

    const nsfwAvatarUrl = avatarFile
      ? await uploadImage(
          avatarFile,
          "onlyai/nsfw-profile/avatars"
        )
      : null;

    const nsfwBannerUrl = bannerFile
      ? await uploadImage(
          bannerFile,
          "onlyai/nsfw-profile/banners"
        )
      : null;

    await prisma.creator.update({
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
    });

    return redirectWith(req, { saved: "1" });
  } catch (error) {
    console.error("ADMIN_NSFW_PROFILE_SAVE_ERROR", error);

    return redirectWith(req, {
      error:
        error instanceof Error
          ? error.message
          : "Could not save the NSFW profile.",
    });
  }
}
