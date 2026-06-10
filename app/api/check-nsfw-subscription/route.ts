import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { subscribed: false, error: "This subscription lane is not available." },
    { status: 404 }
  );
}
