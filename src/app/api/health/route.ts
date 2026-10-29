import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {}
  return NextResponse.json(
    { status: dbOk ? "ok" : "degraded", db: dbOk ? "connected" : "error", uptime: process.uptime() },
    { status: dbOk ? 200 : 503 }
  );
}
