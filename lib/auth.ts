import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "invite_admin";

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || "admin123";
}

export async function isAdminSession() {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value === adminPassword();
}

export async function requireAdmin() {
  if (await isAdminSession()) {
    return null;
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function setAdminSession(password: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
