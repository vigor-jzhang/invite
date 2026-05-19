import { promises as fs } from "fs";
import path from "path";
import type { Guest, GuestType, RsvpStatus } from "./types";

const dataPath = path.join(process.cwd(), "data", "guests.json");
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

type CreateGuestInput = {
  guestName: string;
  honorific: string;
  displayName: string;
  guestType: GuestType;
};

function hasPostgres() {
  return Boolean(databaseUrl);
}

async function query(strings: TemplateStringsArray, ...values: unknown[]) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }
  const { neon } = await import("@neondatabase/serverless");
  const db = neon(databaseUrl);
  return db(strings, ...values);
}

function now() {
  return new Date().toISOString();
}

function normalizeGuest(row: Record<string, unknown>): Guest {
  return {
    id: String(row.id),
    inviteCode: String(row.invite_code ?? row.inviteCode),
    guestName: String(row.guest_name ?? row.guestName),
    honorific: String(row.honorific),
    displayName: String(row.display_name ?? row.displayName),
    guestType: String(row.guest_type ?? row.guestType) as GuestType,
    isActive: Boolean(row.is_active ?? row.isActive),
    rsvpStatus: String(row.rsvp_status ?? row.rsvpStatus) as RsvpStatus,
    rsvpMessage: String(row.rsvp_message ?? row.rsvpMessage ?? ""),
    createdAt: String(row.created_at ?? row.createdAt),
    updatedAt: String(row.updated_at ?? row.updatedAt)
  };
}

function inviteCode() {
  return crypto.randomUUID().replaceAll("-", "").slice(0, 12);
}

async function ensureLocalFile() {
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
        guestType: "single",
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
  await ensureLocalFile();
  const data = await fs.readFile(dataPath, "utf8");
  return JSON.parse(data) as Guest[];
}

async function writeLocal(guests: Guest[]) {
  await fs.writeFile(dataPath, JSON.stringify(guests, null, 2));
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
  if (hasPostgres()) {
    await ensureSchema();
    const rows = await query`SELECT * FROM guests WHERE invite_code = ${code} LIMIT 1`;
    return rows[0] ? normalizeGuest(rows[0]) : null;
  }

  const guests = await readLocal();
  return guests.find((guest) => guest.inviteCode === code) ?? null;
}

export async function createGuest(input: CreateGuestInput) {
  const timestamp = now();
  const guest: Guest = {
    id: crypto.randomUUID(),
    inviteCode: inviteCode(),
    guestName: input.guestName,
    honorific: input.honorific,
    displayName: input.displayName,
    guestType: input.guestType,
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
  const timestamp = now();

  if (hasPostgres()) {
    await ensureSchema();
    const rows = await query`
      UPDATE guests
      SET rsvp_status = ${status}, rsvp_message = ${message}, updated_at = ${timestamp}
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
    rsvpMessage: message,
    updatedAt: timestamp
  };
  await writeLocal(guests);
  return guests[index];
}
