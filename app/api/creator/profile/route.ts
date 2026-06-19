// @ts-nocheck
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
import cloudinary from "@/src/lib/cloudinary";
import { assertSafeText, prepareSafeUploadFile } from "@/src/lib/moderation";

export const runtime = "nodejs";

function cleanHandle(value: FormDataEntryValue | null) {
  return String(value || "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 30);
}

function cleanDisplayName(value: FormDataEntryValue | null, fallback: string) {
  const next = String(value || "").trim().slice(0, 50);
  return next || fallback;
}

function cleanBio(value: FormDataEntryValue | null) {
  return String(value || "").trim().slice(0, 280);
}

function cleanPrice(value: FormDataEntryValue | null) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) return 5;

  const roundedToCents = Math.round(parsed * 100) / 100;

  if (roundedToCents < 1) return 1;
  if (roundedToCents > 500) return 500;

  return roundedToCents;
}

function getUploadFile(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "object") return null;
  if (typeof (value as any).arrayBuffer !== "function") return null;
  if (Number((value as any).size || 0) <= 0) return null;
  return value as any;
}

function redirectWith(req: Request, params: Record<string, string>) {
  const url = new URL("/dashboard/settings", req.url);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value.slice(0, 180));
  }

  return NextResponse.redirect(url, 303);
}

async function uploadProfileImage(file: any, folder: string) {
  const safeFile = await prepareSafeUploadFile(file);
  const dataUri = `data:${safeFile.mime};base64,${safeFile.buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
  });

  return result.secure_url;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.redirect(
        new URL("/login?callbackUrl=/dashboard/settings", req.url),
        303
      );
    }

    const formData = await req.formData();

    const handle = cleanHandle(formData.get("handle"));
    const sfwPrice = cleanPrice(formData.get("sfwPrice"));
    const priceCents = Math.round(sfwPrice * 100);
    const displayName = cleanDisplayName(formData.get("displayName"), handle);
    const bio = cleanBio(formData.get("bio"));

    if (!handle || handle.length < 3) {
      return redirectWith(req, {
        error: "Choose a creator handle with at least 3 characters.",
      });
    }

    assertSafeText([handle, displayName, bio]);

    const avatarFile = getUploadFile(formData.get("avatar"));
    const bannerFile = getUploadFile(formData.get("banner"));

    const avatarUrl = avatarFile
      ? await uploadProfileImage(avatarFile, "onlyai/creators/avatars")
      : null;

    const bannerUrl = bannerFile
      ? await uploadProfileImage(bannerFile, "onlyai/creators/banners")
      : null;

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          username: handle,
          sfwPrice: Math.round(sfwPrice),
        },
      }),

      prisma.creator.upsert({
        where: {
          userId,
        },
        update: {
          handle,
          displayName,
          bio: bio || null,
          classification: "SFW",
          priceCents,
          currency: "USD",
          billingPeriodDays: 30,
          ...(avatarUrl ? { avatarUrl } : {}),
          ...(bannerUrl ? { bannerUrl } : {}),
        },
        create: {
          userId,
          handle,
          displayName,
          bio: bio || null,
          classification: "SFW",
          priceCents,
          currency: "USD",
          billingPeriodDays: 30,
          avatarUrl,
          bannerUrl,
        },
      }),
    ]);

    return redirectWith(req, { saved: "1" });
  } catch (error: any) {
    console.error("CREATOR_PROFILE_SAVE_ERROR", error);

    if (error?.code === "P2002") {
      return redirectWith(req, {
        error: "That creator handle is already taken.",
      });
    }

    return redirectWith(req, {
      error: error?.message || "Could not save creator profile.",
    });
  }
}
