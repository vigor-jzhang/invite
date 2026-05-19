import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createGuest, hasPersistentStore, listGuests } from "@/lib/store";
import { parseGuestType, trimToLength } from "@/lib/validation";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  if (!hasPersistentStore()) {
    return NextResponse.json({
      guests: [],
      warning: "生产环境需要配置 DATABASE_URL 后才能保存宾客"
    });
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

  let guest;
  try {
    guest = await createGuest({
      guestName,
      honorific,
      displayName,
      guestType
    });
  } catch {
    return NextResponse.json(
      { error: "生产环境需要先配置 DATABASE_URL 数据库连接" },
      { status: 500 }
    );
  }

  return NextResponse.json({ guest });
}
