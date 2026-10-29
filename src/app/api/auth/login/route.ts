import { NextResponse } from "next/server";
import { login } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  if (!username || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }
  const ok = await login(username, password);
  if (!ok) return NextResponse.json({ error: "Invalid" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
