import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const status = String(body.status || "SCHEDULED");
  const allowed = ["SCHEDULED", "LIVE", "HALF_TIME", "FULL_TIME", "POSTPONED"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Bad status" }, { status: 400 });
  }

  await prisma.match.update({
    where: { id },
    data: {
      status,
      halfTimeHomeScore: body.halfTimeHomeScore,
      halfTimeAwayScore: body.halfTimeAwayScore,
      fullTimeHomeScore: body.fullTimeHomeScore,
      fullTimeAwayScore: body.fullTimeAwayScore,
    },
  });

  return NextResponse.json({ ok: true });
}
