import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteGuest } from "@/lib/store";

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  const { id } = await context.params;
  const guest = await deleteGuest(id);

  if (!guest) {
    return NextResponse.json({ error: "宾客不存在" }, { status: 404 });
  }

  return NextResponse.json({ guest });
}
