import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { toggleGuest } from "@/lib/store";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  const { id } = await context.params;
  const guest = await toggleGuest(id);

  if (!guest) {
    return NextResponse.json({ error: "宾客不存在" }, { status: 404 });
  }

  return NextResponse.json({ guest });
}
