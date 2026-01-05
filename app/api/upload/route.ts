import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/auth";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File;
  const caption = form.get("caption") as string;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Convert file → buffer for Cloudinary
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Upload to Cloudinary
  const uploaded = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "onlyai_uploads" }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
      .end(buffer);
  });

  const result = uploaded as any;

  // Save post in Prisma
  await prisma.post.create({
    data: {
      url: result.secure_url,
      publicId: result.public_id,
      caption: caption || "",
      creatorId: session.user.id,
    },
  });

  return NextResponse.json({ success: true });
}
