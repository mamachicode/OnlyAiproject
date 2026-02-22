import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: any) {
  const { pathname } = req.nextUrl;

  // WEBHOOK BYPASS (Stripe + CCBill)
  if (
    pathname.startsWith("/api/ccbill/webhook") ||
    pathname.startsWith("/api/webhooks/stripe")
  ) {
    return NextResponse.next();
  }

  // Allow public & legal routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/create-account") ||
    pathname.startsWith("/legal") ||
    pathname === "/" ||
    pathname === "/age"
  ) {
    return NextResponse.next();
  }

  // AGE GATE (Expanded for full adult ecosystem)
  if (
    pathname.startsWith("/nsfw") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/subscribe") ||
    pathname.startsWith("/creator") ||
    pathname.startsWith("/ccbill") ||
    pathname.startsWith("/billing")
  ) {
    const ageVerified = req.cookies.get("age_verified")?.value;

    if (ageVerified !== "true") {
      return NextResponse.redirect(new URL("/age", req.url));
    }
  }

  // AUTH PROTECTION
  if (pathname.startsWith("/creator") || pathname.startsWith("/exclusive")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.email) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
