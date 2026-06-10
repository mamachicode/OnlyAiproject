import { NextResponse } from "next/server";

function unavailable() {
  return NextResponse.json(
    { error: "This webhook lane is not available." },
    { status: 404 }
  );
}

export async function GET() {
  return unavailable();
}

export async function POST() {
  return unavailable();
}
