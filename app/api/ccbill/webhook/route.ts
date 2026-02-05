import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const raw = await req.text();
  const params = new URLSearchParams(raw);

  // Extract raw CCBill fields
  const subscriptionId = params.get("subscriptionId");
  const email = params.get("email");
  const subscriptionStatus = params.get("subscriptionStatus");
  const nextBillingDate = params.get("nextBillingDate");
  const creatorId = params.get("customField1");

  if (!subscriptionId || !email || !subscriptionStatus || !creatorId) {
    return new NextResponse("Invalid CCBill payload", { status: 400 });
  }

  // Map CCBill status → internal status
  let normalizedStatus = "EXPIRED";
  const s = subscriptionStatus.toUpperCase();

  if (s.includes("ACTIVE")) normalizedStatus = "ACTIVE";
  else if (s.includes("CANCEL")) normalizedStatus = "CANCELED";
  else if (s.includes("EXPIRE")) normalizedStatus = "EXPIRED";

  const internalPayload = {
    processor: "CCBILL",
    eventId: `${subscriptionId}_${Date.now()}`,
    eventType: "subscription_update",
    userEmail: email,
    creatorId,
    externalId: subscriptionId,
    status: normalizedStatus,
    periodEnd: nextBillingDate ?? null,
  };

  // Forward to internal webhook
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
