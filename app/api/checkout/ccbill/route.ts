import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import crypto from "crypto";

const CCBILL_BASE = process.env.CCBILL_BASE_URL!;
const CCBILL_CLIENT_ACC = process.env.CCBILL_CLIENT_ACCOUNT!;
const CCBILL_SUB_ACC = process.env.CCBILL_SUB_ACCOUNT!;
const CCBILL_FORM_ID = process.env.CCBILL_FORM_ID!;
const CCBILL_SALT = process.env.CCBILL_SALT!;

function generateHash(price: string, period: string): string {
  const toHash = `${price}${period}${CCBILL_SALT}`;
  return crypto.createHash("md5").update(toHash).digest("hex");
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const creatorId = String(body?.creatorId ?? "").trim();
  if (!creatorId) {
    return NextResponse.json({ error: "creatorId required" }, { status: 400 });
  }

  const creator = await prisma.creator.findUnique({
    where: { id: creatorId },
    select: {
      id: true,
      classification: true,
      platformFeeBps: true,
      priceCents: true,
      currency: true,
      billingPeriodDays: true,
    },
  });

  if (!creator) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }

  if (creator.classification !== "NSFW") {
    return NextResponse.json({ error: "Invalid creator type" }, { status: 400 });
  }

  const priceCents = creator.priceCents;
  const periodDays = creator.billingPeriodDays;

  const price = (priceCents / 100).toFixed(2);
  const period = String(periodDays);

  const hash = generateHash(price, period);

  const currencyCode =
    creator.currency === "USD"
      ? "840"
      : creator.currency === "EUR"
      ? "978"
      : "840";

  const redirectUrl =
    `${CCBILL_BASE}?clientAccnum=${CCBILL_CLIENT_ACC}` +
    `&clientSubacc=${CCBILL_SUB_ACC}` +
    `&formName=${CCBILL_FORM_ID}` +
    `&initialPrice=${price}` +
    `&initialPeriod=${period}` +
    `&currencyCode=${currencyCode}` +
    `&subscriptionType=recurring` +
    `&email=${encodeURIComponent(session.user.email)}` +
    `&formDigest=${hash}` +
    `&customField1=${creator.id}` +
    `&customField2=${encodeURIComponent(session.user.email)}`;

  return NextResponse.json({ url: redirectUrl });
}
