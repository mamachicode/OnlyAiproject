// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import bcrypt from "bcrypt";

function cleanEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function cleanUsername(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^@/, "");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = cleanEmail(body.email);
    const username = cleanUsername(body.username);
    const password = String(body.password || "");

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Enter a valid email." },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_]{3,24}$/.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username must be 3–24 characters and can only use lowercase letters, numbers, and underscores.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
      select: {
        email: true,
        username: true,
      },
    });

    if (existingUser?.email === email) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    if (existingUser?.username === username) {
      return NextResponse.json(
        { error: "That username is already taken." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        sfwPrice: 5,
        nsfwPrice: 10,
        isNsfw: false,
      },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    return NextResponse.json(
      { error: "Could not create account." },
      { status: 500 }
    );
  }
}
