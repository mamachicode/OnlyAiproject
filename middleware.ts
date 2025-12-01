import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: any) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const url = new URL(req.url);

  // Protected areas
  if (url.pathname.startsWith("/creator") || url.pathname.startsWith("/exclusive")) {
    if (!token?.email) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Temporarily skip Prisma check — handled in API routes instead
    const subscribed = token?.subscribed || false;
    if (!subscribed) {
      return NextResponse.redirect(new URL("/subscribe", req.url));
    }
  }

  return NextResponse.next();
}
