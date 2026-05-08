// @ts-nocheck
import { NextResponse } from "next/server";
import { getCreatorForApi } from "@/src/lib/creatorGuard";
import { prisma } from "@/src/lib/prisma";
import { assertSafeText } from "@/src/lib/moderation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanText(value: FormDataEntryValue | null, max: number) {
  return String(value || "").trim().slice(0, max);
}

export async function POST(req: Request) {
  try {
    const creatorAccess = await getCreatorForApi();

    if (!creatorAccess.ok) {
      const target =
        creatorAccess.status === 401
          ? "/login?callbackUrl=/dashboard/messages"
          : "/account";

      return NextResponse.redirect(new URL(target, req.url), 303);
    }

    const formData = await req.formData();

    const title = cleanText(formData.get("title"), 80);
    const body = cleanText(formData.get("body"), 1000);

    if (!title || !body) {
      return NextResponse.redirect(
        new URL("/dashboard/messages?error=missing", req.url),
        303
      );
    }

    assertSafeText([title, body]);

    await prisma.creatorMessage.create({
      data: {
        creatorId: creatorAccess.creatorId,
        title,
        body,
      },
    });

    return NextResponse.redirect(
      new URL("/dashboard/messages?sent=1", req.url),
      303
    );
  } catch (error: any) {
    console.error("CREATOR_MESSAGE_SEND_ERROR", error);

    return NextResponse.redirect(
      new URL(
        `/dashboard/messages?error=${encodeURIComponent(
          error?.message || "Could not send message."
        )}`,
        req.url
      ),
      303
    );
  }
}
