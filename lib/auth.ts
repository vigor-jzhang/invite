import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "invite_admin";
const encoder = new TextEncoder();

export function adminPassword() {
  if (process.env.ADMIN_PASSWORD) {
    return process.env.ADMIN_PASSWORD;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_PASSWORD is required in production");
  }

  return "admin123";
}

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || adminPassword();
}

async function digest(value: string) {
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Buffer.from(hash).toString("base64url");
}

async function sessionToken() {
  return digest(`invite-admin:${sessionSecret()}`);
}

export async function isAdminSession() {
  const store = await cookies();
  const cookie = store.get(COOKIE_NAME)?.value;
  if (!cookie) {
    return false;
  }

  return cookie === await sessionToken();
}

export async function requireAdmin() {
  if (await isAdminSession()) {
    return null;
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function setAdminSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, await sessionToken(), {
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
