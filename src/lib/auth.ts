import { cookies } from "next/headers";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

const COOKIE = "ibeku_admin";

export async function login(username: string, password: string): Promise<boolean> {
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) return false;
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return false;
  const jar = await cookies();
  jar.set(COOKIE, admin.id, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return true;
}

export async function logout() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isLoggedIn(): Promise<boolean> {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (!id) return false;
  const admin = await prisma.admin.findUnique({ where: { id } });
  return !!admin;
}
