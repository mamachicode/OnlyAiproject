// @ts-nocheck
import { NextResponse } from "next/server";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
import cloudinary from "@/src/lib/cloudinary";

export const runtime = "nodejs";

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

export async function POST(req: Request) {
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

  const body = await req.json().catch(() => ({}));
  const target =
    body?.target === "avatar"
      ? "avatar"
      : body?.target === "banner"
        ? "banner"
        : null;

  if (!target) {
    return NextResponse.json(
      { error: "Invalid profile image target." },
      { status: 400 }
    );
  }

  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  const apiKey =
    process.env.CLOUDINARY_API_KEY ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary is not configured." },
      { status: 500 }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder =
    target === "avatar"
      ? "onlyai/nsfw-profile/avatars"
      : "onlyai/nsfw-profile/banners";

  const context =
    `onlyai_user_id=${creator.userId}` +
    "|onlyai_lane=nsfw" +
    "|onlyai_access=private_processor_review" +
    `|onlyai_profile_target=${target}`;

  const paramsToSign = {
    context,
    folder,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    apiSecret
  );

  return NextResponse.json({
    apiKey,
    cloudName,
    context,
    folder,
    signature,
    timestamp,
    uploadUrl:
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  });
}
