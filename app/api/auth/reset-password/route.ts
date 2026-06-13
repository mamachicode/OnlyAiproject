// @ts-nocheck
import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcrypt";
import prisma from "@/src/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = String(body.token || "");
    const password = String(body.password || "");

    if (!token || token.length < 32) {
      return NextResponse.json(
        { error: "Reset link is invalid or expired." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: {
          gt: new Date(),
        },
      },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Reset link is invalid or expired." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordTokenHash: null,
        resetPasswordExpiresAt: null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR", error);
    return NextResponse.json(
      { error: "Could not reset password." },
      { status: 500 }
    );
  }
}
