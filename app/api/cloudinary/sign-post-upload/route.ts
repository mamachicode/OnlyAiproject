// @ts-nocheck
import { NextResponse } from "next/server";
import cloudinary from "@/src/lib/cloudinary";
import { getCreatorForApi } from "@/src/lib/creatorGuard";

export const runtime = "nodejs";

const POST_UPLOAD_FOLDER = "onlyai/posts";

export async function POST() {
  const creatorAccess = await getCreatorForApi();

  if (!creatorAccess.ok) {
    const redirectTo =
      creatorAccess.status === 401
        ? "/login?callbackUrl=/dashboard/upload"
        : "/account";

    return NextResponse.json(
      {
        error: "auth",
        redirectTo,
      },
      { status: creatorAccess.status === 401 ? 401 : 403 }
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
      {
        error: "Cloudinary is not configured.",
      },
      { status: 500 }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const context = `onlyai_user_id=${creatorAccess.userId}|onlyai_upload=post`;

  const paramsToSign = {
    context,
    folder: POST_UPLOAD_FOLDER,
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
    folder: POST_UPLOAD_FOLDER,
    signature,
    timestamp,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
  });
}
