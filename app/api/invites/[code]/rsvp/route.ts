import { NextResponse } from "next/server";
import { updateRsvp } from "@/lib/store";
import { isInviteCode, parseRsvpStatus, trimToLength } from "@/lib/validation";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  if (!isInviteCode(code)) {
    return NextResponse.json({ error: "请柬不存在或已失效" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const status = parseRsvpStatus(body?.status);
  const message = trimToLength(body?.message, 200);

  if (!status || status === "pending") {
    return NextResponse.json({ error: "请选择是否出席" }, { status: 400 });
  }

  const guest = await updateRsvp(code, status, message);

  if (!guest) {
    return NextResponse.json({ error: "请柬不存在或已失效" }, { status: 404 });
  }

  return NextResponse.json({ guest });
}
