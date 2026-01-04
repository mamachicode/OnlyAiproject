import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "410 – Stripe moved to /pages/api/stripe/checkout" },
    { status: 410 }
  );
}
