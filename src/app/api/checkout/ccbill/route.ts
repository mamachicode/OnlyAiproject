import { NextResponse } from "next/server";

const CCBILL_BASE = process.env.CCBILL_BASE_URL!;
const CCBILL_CLIENT_ACC = process.env.CCBILL_CLIENT_ACCOUNT!;
const CCBILL_SUB_ACC = process.env.CCBILL_SUB_ACCOUNT!;
const CCBILL_FORM_ID = process.env.CCBILL_FORM_ID!;
const CCBILL_SALT = process.env.CCBILL_SALT!;

// Helper to build the signature (CCBill requirement)
function generateHash(price: string, period: string): string {
  const crypto = require("crypto");
  const toHash = `${price}${period}${CCBILL_SALT}`;
  return crypto.createHash("md5").update(toHash).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { email, price, period } = await req.json(); // period = days
    const hash = generateHash(price, period);
    const redirectUrl = `${CCBILL_BASE}?clientAccnum=${CCBILL_CLIENT_ACC}&clientSubacc=${CCBILL_SUB_ACC}&formName=${CCBILL_FORM_ID}&initialPrice=${price}&initialPeriod=${period}&currencyCode=840&email=${encodeURIComponent(
      email
    )}&subscriptionType=recurring&formDigest=${hash}`;

    return NextResponse.json({ url: redirectUrl });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

