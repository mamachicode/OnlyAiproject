import { NextResponse } from "next/server";
import cloudinary from "@/src/lib/cloudinary";
import prisma from "@/src/lib/prisma";
import { assertSafeText } from "@/src/lib/moderation";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const caption = formData.get("caption") as string || "";
    const title = formData.get("title") as string || "";
    const incomingIsNsfw = formData.get("isNsfw") === "true";

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    // 🛡️ STEP 1 — TEXT MODERATION (BEFORE UPLOAD)
    assertSafeText([title, caption]);

    // 🛡️ STEP 2 — FORCE SFW MODE (BACKEND ENFORCED)
    const nsfwEnabled = process.env.PLATFORM_MODE_NSFW_ENABLED === "true";
    const isNsfw = nsfwEnabled ? incomingIsNsfw : false;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary with moderation
    const uploadResult: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "onlyai/posts",
          resource_type: "image",
          moderation: "aws_rek"
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(buffer);
    });

    // 🛡️ STEP 3 — IMAGE MODERATION CHECK
    const moderation = Array.isArray(uploadResult.moderation)
      ? uploadResult.moderation[0]
      : null;

    const status = moderation?.status || "unknown";

    if (status !== "approved") {
      // Delete flagged image immediately
      if (uploadResult.public_id) {
        await cloudinary.uploader.destroy(uploadResult.public_id, {
          invalidate: true
        });
      }

      return NextResponse.json(
        { error: "Image rejected by moderation system" },
        { status: 400 }
      );
    }

    // ✅ STEP 4 — SAFE TO SAVE
    const post = await prisma.post.create({
      data: {
        title,
        caption,
        isNsfw,
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url
      }
    });

    return NextResponse.json(post);

  } catch (error: any) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
