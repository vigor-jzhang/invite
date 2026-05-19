import type { GuestType, RsvpStatus } from "./types";

export const guestTypes = ["single", "couple", "family", "custom"] as const;
export const rsvpStatuses = ["pending", "attending", "declined"] as const;

const guestTypeSet = new Set<string>(guestTypes);
const rsvpStatusSet = new Set<string>(rsvpStatuses);

export function trimToLength(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

export function parseGuestType(value: unknown): GuestType | null {
  const normalized = String(value ?? "");
  return guestTypeSet.has(normalized) ? (normalized as GuestType) : null;
}

export function parseRsvpStatus(value: unknown): RsvpStatus | null {
  const normalized = String(value ?? "");
  return rsvpStatusSet.has(normalized) ? (normalized as RsvpStatus) : null;
}

export function isInviteCode(value: string) {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(value);
}
