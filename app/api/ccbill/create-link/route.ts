import { getServerAuthSession } from '@/src/auth';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";


export async function GET(req: Request) {
  const session = await getServerAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const creator = searchParams.get("creator");
  const section = searchParams.get("section");

  if (!creator || !section) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  // TEMPORARY — Fake CCBill test link
  const billingUrl = `https://api.ccbill.com/fake-test?creator=${creator}&section=${section}`;

  return NextResponse.redirect(billingUrl);
}
