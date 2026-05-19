import { NextResponse } from "next/server";
import { adminPassword, setAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = String(body?.password ?? "");

  if (password !== adminPassword()) {
    return NextResponse.json({ error: "密码不正确" }, { status: 401 });
  }

  await setAdminSession(password);
  return NextResponse.json({ ok: true });
}
