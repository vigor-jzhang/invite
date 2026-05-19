import { promises as fs } from "fs";
import path from "path";
import type { Guest, GuestType, RsvpStatus } from "./types";
import { isInviteCode, parseGuestType, parseRsvpStatus, trimToLength } from "./validation";

const dataPath = path.join(process.cwd(), "data", "guests.json");
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const canUseLocalStore = !databaseUrl && process.env.NODE_ENV !== "production";

type CreateGuestInput = {
  guestName: string;
  honorific: string;
  displayName: string;
  guestType: GuestType;
};

function hasPostgres() {
  return Boolean(databaseUrl);
}

export function hasPersistentStore() {
  return hasPostgres() || canUseLocalStore;
}

async function query(strings: TemplateStringsArray, ...values: unknown[]) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }
  const { neon } = await import("@neondatabase/serverless");
  const db = neon(databaseUrl);
  return db(strings, ...values);
}

function assertInviteCode(code: string) {
  if (!isInviteCode(code)) {
    throw new Error("Invalid invite code");
  }
}

function now() {
  return new Date().toISOString();
}

function normalizeGuest(row: Record<string, unknown>): Guest {
  const guestType = parseGuestType(row.guest_type ?? row.guestType) ?? "custom";
  const rsvpStatus = parseRsvpStatus(row.rsvp_status ?? row.rsvpStatus) ?? "pending";

  return {
    id: String(row.id),
    inviteCode: String(row.invite_code ?? row.inviteCode),
    guestName: trimToLength(row.guest_name ?? row.guestName, 80),
    honorific: trimToLength(row.honorific, 20),
    displayName: trimToLength(row.display_name ?? row.displayName, 100),
    guestType,
    isActive: Boolean(row.is_active ?? row.isActive),
    rsvpStatus,
    rsvpMessage: trimToLength(row.rsvp_message ?? row.rsvpMessage, 200),
    createdAt: String(row.created_at ?? row.createdAt),
    updatedAt: String(row.updated_at ?? row.updatedAt)
  };
}

function inviteCode() {
  return crypto.randomUUID().replaceAll("-", "").slice(0, 12);
}

async function ensureLocalFile() {
  if (!canUseLocalStore) {
    return;
  }

  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  try {
    await fs.access(dataPath);
  } catch {
    const seed: Guest[] = [
      {
        id: crypto.randomUUID(),
        inviteCode: "demo",
        guestName: "张先生",
        honorific: "先生",
        displayName: "张先生",
        guestType: "male",
        isActive: true,
        rsvpStatus: "pending",
        rsvpMessage: "",
        createdAt: now(),
        updatedAt: now()
      }
    ];
    await fs.writeFile(dataPath, JSON.stringify(seed, null, 2));
  }
}

async function readLocal() {
  if (!canUseLocalStore) {
    return [];
  }

  await ensureLocalFile();
  try {
    const data = await fs.readFile(dataPath, "utf8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.map(normalizeGuest) : [];
  } catch {
    return [];
  }
}

async function writeLocal(guests: Guest[]) {
  if (!canUseLocalStore) {
    throw new Error("DATABASE_URL is required for persistent storage in production");
  }

  const tmpPath = `${dataPath}.${process.pid}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(guests, null, 2));
  await fs.rename(tmpPath, dataPath);
}

export async function ensureSchema() {
  if (!hasPostgres()) {
    return;
  }

  await query`
    CREATE TABLE IF NOT EXISTS guests (
      id TEXT PRIMARY KEY,
      invite_code TEXT UNIQUE NOT NULL,
      guest_name TEXT NOT NULL,
      honorific TEXT NOT NULL,
      display_name TEXT NOT NULL,
      guest_type TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      rsvp_status TEXT NOT NULL DEFAULT 'pending',
      rsvp_message TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    )
  `;
}

export async function listGuests() {
  if (hasPostgres()) {
    await ensureSchema();
    const rows = await query`SELECT * FROM guests ORDER BY created_at DESC`;
    return rows.map(normalizeGuest);
  }

  const guests = await readLocal();
  return guests.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findGuestByCode(code: string) {
  assertInviteCode(code);

  if (hasPostgres()) {
    await ensureSchema();
    const rows = await query`SELECT * FROM guests WHERE invite_code = ${code} LIMIT 1`;
    return rows[0] ? normalizeGuest(rows[0]) : null;
  }

  if (!canUseLocalStore) {
    throw new Error("DATABASE_URL is required for creating guests in production");
  }

  const guests = await readLocal();
  return guests.find((guest) => guest.inviteCode === code) ?? null;
}

export async function createGuest(input: CreateGuestInput) {
  const normalizedInput = {
    guestName: trimToLength(input.guestName, 80),
    honorific: trimToLength(input.honorific, 20),
    displayName: trimToLength(input.displayName, 100),
    guestType: input.guestType
  };

  const timestamp = now();
  const guest: Guest = {
    id: crypto.randomUUID(),
    inviteCode: inviteCode(),
    guestName: normalizedInput.guestName,
    honorific: normalizedInput.honorific,
    displayName: normalizedInput.displayName,
    guestType: normalizedInput.guestType,
    isActive: true,
    rsvpStatus: "pending",
    rsvpMessage: "",
    createdAt: timestamp,
    updatedAt: timestamp
  };

  if (hasPostgres()) {
    await ensureSchema();
    await query`
      INSERT INTO guests (
        id, invite_code, guest_name, honorific, display_name, guest_type,
        is_active, rsvp_status, rsvp_message, created_at, updated_at
      )
      VALUES (
        ${guest.id}, ${guest.inviteCode}, ${guest.guestName}, ${guest.honorific},
        ${guest.displayName}, ${guest.guestType}, ${guest.isActive},
        ${guest.rsvpStatus}, ${guest.rsvpMessage}, ${guest.createdAt}, ${guest.updatedAt}
      )
    `;
    return guest;
  }

  if (!canUseLocalStore) {
    return null;
  }

  const guests = await readLocal();
  guests.unshift(guest);
  await writeLocal(guests);
  return guest;
}

export async function toggleGuest(id: string) {
  const timestamp = now();

  if (hasPostgres()) {
    await ensureSchema();
    const current = await query`SELECT is_active FROM guests WHERE id = ${id} LIMIT 1`;
    if (!current[0]) {
      return null;
    }
    const nextActive = !current[0].is_active;
    const rows = await query`
      UPDATE guests
      SET is_active = ${nextActive}, updated_at = ${timestamp}
      WHERE id = ${id}
      RETURNING *
    `;
    return normalizeGuest(rows[0]);
  }

  if (!canUseLocalStore) {
    return null;
  }

  const guests = await readLocal();
  const index = guests.findIndex((guest) => guest.id === id);
  if (index === -1) {
    return null;
  }
  guests[index] = {
    ...guests[index],
    isActive: !guests[index].isActive,
    updatedAt: timestamp
  };
  await writeLocal(guests);
  return guests[index];
}

export async function updateRsvp(code: string, status: RsvpStatus, message: string) {
  assertInviteCode(code);

  const timestamp = now();
  const safeMessage = trimToLength(message, 200);

  if (hasPostgres()) {
    await ensureSchema();
    const rows = await query`
      UPDATE guests
      SET rsvp_status = ${status}, rsvp_message = ${safeMessage}, updated_at = ${timestamp}
      WHERE invite_code = ${code} AND is_active = TRUE
      RETURNING *
    `;
    return rows[0] ? normalizeGuest(rows[0]) : null;
  }

  const guests = await readLocal();
  const index = guests.findIndex((guest) => guest.inviteCode === code && guest.isActive);
  if (index === -1) {
    return null;
  }
  guests[index] = {
    ...guests[index],
    rsvpStatus: status,
    rsvpMessage: safeMessage,
    updatedAt: timestamp
  };
  await writeLocal(guests);
  return guests[index];
}
