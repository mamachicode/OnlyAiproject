import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any);

    if (!session?.user?.email) {
      return NextResponse.redirect(
        `/auth/login?callbackUrl=${encodeURIComponent(req.url)}`
      );
    }

    const subscriberEmail = session.user.email;

    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    const section = searchParams.get("section") ?? "NSFW";

    if (!username) {
      return NextResponse.json(
        { error: "Missing creator username" },
        { status: 400 }
      );
    }

    const creator = await prisma.user.findUnique({
      where: { username },
      select: { email: true, subscriptionPrice: true },
    });

    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }

    const base = process.env.CCBILL_BASE_URL!;
    const clientAcc = process.env.CCBILL_CLIENT_ACCOUNT!;
    const clientSubacc = process.env.CCBILL_SUB_ACCOUNT!;
    const formNum = process.env.CCBILL_FORM_ID!;

    const price = creator.subscriptionPrice ?? 5;

    const params = new URLSearchParams({
      clientAccnum: clientAcc,
      clientSubacc,
      formName: formNum,
      price: String(price),
      currencyCode: "840",
      allowedTypes: "000",
      approvedUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/ccbill/success`,
      declinedUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/ccbill/failure`,
      // Custom webhook fields
      "X-subscriberEmail": subscriberEmail,
      "X-creatorEmail": creator.email,
      "X-siteSection": section.toUpperCase(),
    });

    const finalUrl = `${base}?${params.toString()}`;

    return NextResponse.redirect(finalUrl);
  } catch (err) {
    console.error("generate-link error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
