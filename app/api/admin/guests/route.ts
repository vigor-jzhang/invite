import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createGuest, listGuests } from "@/lib/store";
import { parseGuestType, trimToLength } from "@/lib/validation";

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
  const guestName = trimToLength(body?.guestName, 80);
  const honorific = trimToLength(body?.honorific, 20);
  const displayName = trimToLength(body?.displayName, 100);
  const guestType = parseGuestType(body?.guestType);

  if (!guestName || !displayName || !honorific || !guestType) {
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
