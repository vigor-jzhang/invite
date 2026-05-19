import { NextResponse } from "next/server";
import { adminPassword, setAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = String(body?.password ?? "");
  let expectedPassword = "";

  try {
    expectedPassword = adminPassword();
  } catch {
    return NextResponse.json({ error: "ADMIN_PASSWORD 未配置" }, { status: 500 });
  }

  if (password !== expectedPassword) {
    return NextResponse.json({ error: "密码不正确" }, { status: 401 });
  }

  await setAdminSession();
  return NextResponse.json({ ok: true });
}
