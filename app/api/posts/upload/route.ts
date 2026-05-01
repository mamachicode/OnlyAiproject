import { NextResponse } from "next/server";
import cloudinary, { cloudinaryEnvStatus } from "@/src/lib/cloudinary";
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/auth";
import { assertSafeText } from "@/src/lib/moderation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (cloudinaryEnvStatus.missing.length > 0) {
      return NextResponse.json(
        {
          error: `Cloudinary is not configured on the server. Missing: ${cloudinaryEnvStatus.missing.join(", ")}`,
        },
        { status: 500 }
      );
    }

    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const caption = String(formData.get("caption") || "").trim();

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!file.type?.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads are allowed" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be under 10MB" },
        { status: 400 }
      );
    }

    assertSafeText([caption]);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "onlyai/posts",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(buffer);
    });

    if (!uploadResult?.secure_url || !uploadResult?.public_id) {
      return NextResponse.json(
        { error: "Cloudinary upload did not return a valid image URL." },
        { status: 500 }
      );
    }

    const post = await prisma.post.create({
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        caption,
        creatorId: session.user.id,
      },
    });

    return NextResponse.json({ post });
  } catch (error: any) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      { error: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
