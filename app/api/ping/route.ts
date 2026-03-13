import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok" });
  } catch (error) {
    console.error("Ping DB error:", error);
    return Response.json({ status: "db-error" }, { status: 500 });
  }
}
