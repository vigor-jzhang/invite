import { NextResponse } from "next/server";
import { findGuestByCode } from "@/lib/store";
import { isInviteCode } from "@/lib/validation";
import { weddingConfig } from "@/lib/wedding-config";

export async function GET(_: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  if (!isInviteCode(code)) {
    return NextResponse.json({ error: "请柬不存在或已失效" }, { status: 404 });
  }

  const guest = await findGuestByCode(code);

  if (!guest || !guest.isActive) {
    return NextResponse.json({ error: "请柬不存在或已失效" }, { status: 404 });
  }

  return NextResponse.json({ guest, wedding: weddingConfig });
}
