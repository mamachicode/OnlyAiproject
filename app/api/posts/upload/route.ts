import { getServerAuthSession } from '@/src/auth';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import prisma from "@/src/lib/prisma";
import cloudinary from "@/src/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const caption = formData.get("caption") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Missing image" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const upload = await new Promise<any>((resolve, reject) => {
      const s = cloudinary.uploader.upload_stream(
        {
          folder: "onlyai",
          resource_type: "auto",
        },
        (err, res) => {
          if (err) reject(err);
          else resolve(res);
        }
      );
      s.end(buffer);
    });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.post.create({
      data: {
        creatorId: user.id,
        url: upload.secure_url,
        publicId: upload.public_id,
        caption: caption || "",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Upload Error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
