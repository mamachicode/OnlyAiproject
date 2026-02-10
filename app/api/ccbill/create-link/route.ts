import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/auth";

export async function GET(req: Request) {
  const session = await getServerAuthSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const username = searchParams.get("creator");
  const section = searchParams.get("section");

  if (!username || !section) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // 🔴 CCBill handles NSFW only
  if (section !== "NSFW") {
    return NextResponse.json(
      { error: "Invalid processor route" },
      { status: 400 }
    );
  }

  const creator = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, isNsfw: true },
  });

  if (!creator || !creator.isNsfw) {
    return NextResponse.json(
      { error: "Creator not eligible for NSFW billing" },
      { status: 400 }
    );
  }

  const subscriptionId = process.env.CCBILL_NSFW_SUBSCRIPTION_ID;

  // 🔥 Approval-safe fallback (no creds yet)
  if (!subscriptionId) {
    return NextResponse.redirect(
      new URL("/ccbill/pending-approval", req.url)
    );
  }

  const billingUrl =
    `https://bill.ccbill.com/jpost/signup.cgi` +
    `?subscriptionId=${subscriptionId}` +
    `&clientAccnum=${process.env.CCBILL_ACCOUNT_NUM}` +
    `&clientSubacc=${process.env.CCBILL_SUBACC}` +
    `&username=${creator.username}`;

  return NextResponse.redirect(billingUrl);
}
