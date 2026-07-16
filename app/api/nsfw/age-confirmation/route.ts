import { NextResponse } from "next/server";
import { auth } from "@/src/auth";

export const runtime = "nodejs";

const AGE_COOKIE_NAME = "onlyai_nsfw_age_confirmed";
const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Login required." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    success: true,
  });

  response.cookies.set({
    name: AGE_COOKIE_NAME,
    value: "1",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/nsfw",
    maxAge: THIRTY_DAYS_SECONDS,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
  });

  response.cookies.set({
    name: AGE_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/nsfw",
    maxAge: 0,
  });

  return response;
}
