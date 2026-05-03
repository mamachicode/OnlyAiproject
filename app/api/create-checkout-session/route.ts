import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Please use the creator subscribe page to start checkout.",
    },
    { status: 400 }
  );
}
