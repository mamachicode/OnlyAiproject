import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEBHOOK_SALT = process.env.CCBILL_WEBHOOK_SALT!;

function verifyDigest(
  subscriptionId: string,
  subscriptionStatus: string,
  receivedDigest: string
) {
  if (!WEBHOOK_SALT) { throw new Error("CCBILL_WEBHOOK_SALT not configured"); }

  const toHash = `${subscriptionId}${subscriptionStatus}${WEBHOOK_SALT}`;
  const expected = crypto.createHash("md5").update(toHash).digest("hex");

  if (expected.length !== receivedDigest.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(receivedDigest));
}

export async function POST(req: Request) {
  const raw = await req.text();
  const params = new URLSearchParams(raw);

  const subscriptionId = params.get("subscriptionId");
  const email = params.get("email");
  const subscriptionStatus = params.get("subscriptionStatus");
  const nextBillingDate = params.get("nextBillingDate");
  const creatorId = params.get("customField1");
  const receivedDigest =
    params.get("responseDigest") || params.get("subscriptionDigest");

  if (
    !subscriptionId ||
    !email ||
    !subscriptionStatus ||
    !creatorId ||
    !receivedDigest
  ) {
    return new NextResponse("Invalid CCBill payload", { status: 400 });
  }

  // 🔒 SIGNATURE VALIDATION
  if (!verifyDigest(subscriptionId, subscriptionStatus, receivedDigest)) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  // Stable idempotent event ID
  const eventId = `ccbill:${subscriptionId}:${subscriptionStatus}:${nextBillingDate ?? "none"}`;

  let normalizedStatus = "EXPIRED";
  const s = subscriptionStatus.toUpperCase();

  if (s.includes("ACTIVE")) normalizedStatus = "ACTIVE";
  else if (s.includes("CANCEL")) normalizedStatus = "CANCELED";
  else if (s.includes("EXPIRE")) normalizedStatus = "EXPIRED";

  const internalPayload = {
    processor: "CCBILL",
    eventId,
    eventType: "subscription_update",
    userEmail: email.trim().toLowerCase(),
    creatorId,
    externalId: subscriptionId,
    status: normalizedStatus,
    periodEnd: nextBillingDate ?? null,
  };

  const response = await fetch(
    new URL("/api/subscription/webhook", req.url),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(internalPayload),
    }
  );

  if (!response.ok) {
    return new NextResponse("Internal processing failed", { status: 500 });
  }

  return new NextResponse("OK", { status: 200 });
}
