import { NextResponse } from "next/server";
import { updateRsvp } from "@/lib/store";
import type { RsvpStatus } from "@/lib/types";

const statuses = new Set(["attending", "declined"]);

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const body = await request.json().catch(() => null);
  const status = String(body?.status ?? "") as RsvpStatus;
  const message = String(body?.message ?? "").trim().slice(0, 200);

  if (!statuses.has(status)) {
    return NextResponse.json({ error: "请选择是否出席" }, { status: 400 });
  }

  const guest = await updateRsvp(code, status, message);

  if (!guest) {
    return NextResponse.json({ error: "请柬不存在或已失效" }, { status: 404 });
  }

  return NextResponse.json({ guest });
}
