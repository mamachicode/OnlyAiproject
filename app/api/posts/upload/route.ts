import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const MAX_VIDEO_SIZE_MB = 100;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const title = formData.get("title") as string | null;
    const content = formData.get("content") as string | null;
    const requestedIsNsfw = formData.get("isNsfw") === "true";
    const isLocked = formData.get("isLocked") === "true";
    const priceCentsRaw = formData.get("priceCents") as string | null;

    if (!title || files.length === 0) {
      return new Response("Missing fields", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { creatorProfile: true },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    if (!user.creatorProfile) {
      return new Response("Not a creator", { status: 403 });
    }

    const classification = user.creatorProfile.classification;
    const isNsfw = classification === "NSFW" ? requestedIsNsfw : false;

    if (classification === "SFW" && requestedIsNsfw) {
      return new Response("SFW creators cannot post NSFW content", { status: 403 });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        isNsfw,
        isLocked,
        priceCents: isLocked && priceCentsRaw ? parseInt(priceCentsRaw) : null,
        authorId: user.id,
      },
    });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith("video/");
      const sizeMB = file.size / (1024 * 1024);

      if (isVideo && sizeMB > MAX_VIDEO_SIZE_MB) {
        return new Response("Video exceeds 100MB limit", { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      const upload = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ resource_type: "auto" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(buffer);
      });

      await prisma.postMedia.create({
        data: {
          postId: post.id,
          url: upload.secure_url,
          type: isVideo ? "VIDEO" : "IMAGE",
          order: i,
        },
      });
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response("Upload failed", { status: 500 });
  }
}
