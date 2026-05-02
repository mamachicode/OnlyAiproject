import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
import cloudinary from "@/src/lib/cloudinary";
import { assertSafeText } from "@/src/lib/moderation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in to upload." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const caption = String(formData.get("caption") || "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing upload file." },
        { status: 400 }
      );
    }

    // Stripe-safe MVP rule:
    // Dashboard upload is SFW-only until the CCBill/NSFW lane is approved and isolated.
    assertSafeText([caption]);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "onlyai/posts/sfw",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      stream.end(buffer);
    });

    if (!uploadResult?.secure_url) {
      return NextResponse.json(
        { error: "Cloudinary upload failed." },
        { status: 500 }
      );
    }

    const isVideo =
      typeof uploadResult.resource_type === "string" &&
      uploadResult.resource_type.toLowerCase().includes("video");

    const post = await prisma.post.create({
      data: {
        title: caption || "Members-only post",
        content: caption || null,
        isNsfw: false,
        authorId: userId,
        isLocked: true,
        priceCents: null,
        media: {
          create: {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id || null,
            type: isVideo ? "VIDEO" : "IMAGE",
            order: 0,
          },
        },
      },
      include: {
        media: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ ok: true, post });
  } catch (err: any) {
    console.error("POST_UPLOAD_ERROR", err);

    return NextResponse.json(
      {
        error:
          err?.message ||
          "Upload failed. Please try again or contact support.",
      },
      { status: 500 }
    );
  }
}
