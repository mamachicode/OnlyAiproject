import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    DATABASE_URL: process.env.DATABASE_URL || null,
    DIRECT_URL: process.env.DIRECT_URL || null,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
    NODE_ENV: process.env.NODE_ENV || null,
    VERCEL_ENV: process.env.VERCEL_ENV || null,
  });
}
