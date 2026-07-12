// @ts-nocheck
import { NextResponse } from "next/server";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
import cloudinary from "@/src/lib/cloudinary";

export const runtime = "nodejs";

function adminEmails() {
  return String(process.env.ONLYAI_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const email = String(session?.user?.email || "").trim().toLowerCase();

    if (!email || !adminEmails().includes(email)) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const postId = String(formData.get("postId") || "").trim();
    const action = String(formData.get("action") || "").trim();

    if (!postId || !["approve", "remove"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid review action." },
        { status: 400 }
      );
    }

    const pendingReview = await prisma.moderationReview.findUnique({
      where: {
        pendingKey: postId,
      },
    });

    if (!pendingReview || pendingReview.status !== "PENDING") {
      return NextResponse.json(
        { error: "This review has already been completed." },
        { status: 409 }
      );
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        media: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found." },
        { status: 404 }
      );
    }

    if (action === "approve") {
      await prisma.moderationReview.update({
        where: {
          id: pendingReview.id,
        },
        data: {
          pendingKey: null,
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewedByEmail: email,
        },
      });

      return NextResponse.redirect(
        new URL(
          `/admin/manual-review/${postId}?reviewed=approved`,
          req.url
        ),
        303
      );
    }

    const mediaToDelete = post.media
      .filter((item) => Boolean(item.publicId))
      .map((item) => ({
        publicId: item.publicId,
        resourceType: item.type === "VIDEO" ? "video" : "image",
      }));

    await prisma.$transaction([
      prisma.moderationReview.update({
        where: {
          id: pendingReview.id,
        },
        data: {
          pendingKey: null,
          status: "REMOVED",
          reviewedAt: new Date(),
          reviewedByEmail: email,
        },
      }),
      prisma.post.delete({
        where: {
          id: postId,
        },
      }),
    ]);

    for (const item of mediaToDelete) {
      try {
        await cloudinary.uploader.destroy(item.publicId, {
          resource_type: item.resourceType,
        });
      } catch (error) {
        console.warn("ADMIN_REVIEW_CLOUDINARY_DELETE_WARNING", {
          publicId: item.publicId,
          error:
            error instanceof Error
              ? error.message
              : String(error),
        });
      }
    }

    return NextResponse.redirect(
      new URL("/admin/manual-review?removed=1", req.url),
      303
    );
  } catch (error) {
    console.error("ADMIN_MANUAL_REVIEW_ACTION_ERROR", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Review action failed.",
      },
      { status: 500 }
    );
  }
}
