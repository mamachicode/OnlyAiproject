// @ts-nocheck
import { NextResponse } from "next/server";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
import cloudinary from "@/src/lib/cloudinary";

export const runtime = "nodejs";

const NSFW_UPLOAD_FOLDER = "onlyai/nsfw-review";
const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

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
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  });
}

function contextValue(resource: any, key: string) {
  return String(
    resource?.context?.custom?.[key] ||
      resource?.context?.[key] ||
      ""
  );
}

async function verifyImage(item: any, ownerUserId: string) {
  const publicId = String(item?.publicId || "").trim();

  if (
    !publicId.startsWith(`${NSFW_UPLOAD_FOLDER}/`) ||
    !/^[a-zA-Z0-9_./-]+$/.test(publicId)
  ) {
    throw new Error("Upload could not be verified.");
  }

  const resource = await cloudinary.api.resource(publicId, {
    resource_type: "image",
    context: true,
  });

  if (
    contextValue(resource, "onlyai_user_id") !== ownerUserId ||
    contextValue(resource, "onlyai_lane") !== "nsfw" ||
    contextValue(resource, "onlyai_access") !==
      "private_processor_review"
  ) {
    throw new Error("Upload ownership could not be verified.");
  }

  const secureUrl = String(resource?.secure_url || "").trim();
  const bytes = Number(resource?.bytes || 0);

  if (!secureUrl.startsWith("https://res.cloudinary.com/")) {
    throw new Error("Upload URL could not be verified.");
  }

  if (bytes <= 0 || bytes > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large. Max 20 MB.");
  }

  return {
    publicId,
    url: secureUrl,
    type: "IMAGE",
    order: 0,
  };
}

async function cleanupMedia(items: any[]) {
  for (const item of items) {
    if (!item?.publicId) continue;

    try {
      await cloudinary.uploader.destroy(item.publicId, {
        resource_type: "image",
      });
    } catch (error) {
      console.warn("ADMIN_NSFW_UPLOAD_CLEANUP_WARNING", {
        publicId: item.publicId,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }
  }
}

export async function POST(req: Request) {
  const verifiedMedia: any[] = [];

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

    const body = await req.json();

    const title = String(
      body?.title || "Private creator preview"
    )
      .trim()
      .slice(0, 120);

    const content = String(body?.content || "")
      .trim()
      .slice(0, 2000);

    const confirmations = body?.confirmations || {};

    if (
      confirmations.adult !== true ||
      confirmations.likeness !== true ||
      confirmations.rights !== true ||
      confirmations.policy !== true
    ) {
      return NextResponse.json(
        { error: "All compliance confirmations are required." },
        { status: 400 }
      );
    }

    const media = Array.isArray(body?.media)
      ? body.media
      : [];

    if (!media.length || media.length > MAX_IMAGES) {
      return NextResponse.json(
        { error: "Choose between 1 and 5 images." },
        { status: 400 }
      );
    }

    for (let index = 0; index < media.length; index++) {
      const verified = await verifyImage(
        media[index],
        creator.userId
      );

      verifiedMedia.push({
        ...verified,
        order: index,
      });
    }

    await prisma.post.create({
      data: {
        title: title || "Private creator preview",
        content: content || null,
        authorId: creator.userId,
        isNsfw: true,
        isLocked: body?.isLocked !== false,
        priceCents: null,
        media: {
          create: verifiedMedia.map((item) => ({
            url: item.url,
            publicId: item.publicId,
            type: item.type,
            order: item.order,
          })),
        },
      },
    });

    const publicHandle =
      creator.handle ||
      creator.user.username ||
      "demolitionbaby";

    verifiedMedia.length = 0;

    return NextResponse.json({
      success: true,
      redirectTo:
        `/nsfw/creator/${encodeURIComponent(publicHandle)}`,
    });
  } catch (error) {
    console.error("ADMIN_NSFW_UPLOAD_ERROR", error);

    await cleanupMedia(verifiedMedia);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The post could not be created.",
      },
      { status: 500 }
    );
  }
}
