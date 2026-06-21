import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: any) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const url = new URL(req.url);

  // Protected legacy member-only areas.
  // Important: keep /creators public for fan discovery.
  const isLegacyCreatorArea =
    url.pathname === "/creator" || url.pathname.startsWith("/creator/");

  const isExclusiveArea =
    url.pathname === "/exclusive" || url.pathname.startsWith("/exclusive/");

  if (isLegacyCreatorArea || isExclusiveArea) {
    if (!token?.email) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Temporarily skip Prisma check — handled in API routes instead.
    const subscribed = token?.subscribed || false;

    if (!subscribed) {
      return NextResponse.redirect(new URL("/subscribe", req.url));
    }
  }

  return NextResponse.next();
}
