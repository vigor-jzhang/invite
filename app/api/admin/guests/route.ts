import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createGuest, listGuests } from "@/lib/store";
import type { GuestType } from "@/lib/types";

const guestTypes = new Set(["single", "couple", "family", "custom"]);

export async function GET() {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  return NextResponse.json({ guests: await listGuests() });
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  const body = await request.json().catch(() => null);
  const guestName = String(body?.guestName ?? "").trim();
  const honorific = String(body?.honorific ?? "").trim();
  const displayName = String(body?.displayName ?? "").trim();
  const guestType = String(body?.guestType ?? "single") as GuestType;

  if (!guestName || !displayName || !honorific || !guestTypes.has(guestType)) {
    return NextResponse.json({ error: "请完整填写宾客信息" }, { status: 400 });
  }

  const guest = await createGuest({
    guestName,
    honorific,
    displayName,
    guestType
  });

  return NextResponse.json({ guest });
}
