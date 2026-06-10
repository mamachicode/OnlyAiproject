import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "This checkout lane is not available." },
    { status: 404 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "This checkout lane is not available." },
    { status: 404 }
  );
}
