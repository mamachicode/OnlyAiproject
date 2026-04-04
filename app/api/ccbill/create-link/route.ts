// @ts-nocheck
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/auth";

export async function GET(req) {
  // Validate user session
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Not logged in" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const creator = searchParams.get("creator");
  const section = searchParams.get("section");

  if (!creator || !section) {
    return NextResponse.json(
      { error: "Missing params" },
      { status: 400 }
    );
  }

  // TEMPORARY URL — we will connect this to real CCBill once they approve
  const link = `https://api.ccbill.com/fake-test?creator=${creator}&section=${section}`;

  return NextResponse.redirect(link);
}
