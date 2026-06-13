// @ts-nocheck
import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/src/lib/prisma";

export const runtime = "nodejs";

function cleanEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function appUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

async function sendResetEmail(email: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESET_EMAIL_FROM || "OnlyAi <support@weareonlyai.com>";

  if (!apiKey) {
    console.warn("RESEND_API_KEY_MISSING_PASSWORD_RESET_EMAIL_NOT_SENT", { email });
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Reset your OnlyAi password",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
          <h2>Reset your OnlyAi password</h2>
          <p>Click the button below to set a new password. This link expires in 1 hour.</p>
          <p>
            <a href="${resetUrl}" style="display:inline-block;background:#ec4899;color:white;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:700;">
              Reset password
            </a>
          </p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `,
      text: `Reset your OnlyAi password: ${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("RESEND_PASSWORD_RESET_ERROR", res.status, text);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = cleanEmail(body.email);

    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: true });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordTokenHash: tokenHash,
          resetPasswordExpiresAt: expiresAt,
        },
      });

      const resetUrl = `${appUrl()}/reset-password?token=${encodeURIComponent(token)}`;
      await sendResetEmail(user.email, resetUrl);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR", error);
    return NextResponse.json({ ok: true });
  }
}
