export type GuestType = "male" | "female" | "couple" | "family" | "custom";

export type RsvpStatus = "pending" | "attending" | "declined";

export type Guest = {
  id: string;
  inviteCode: string;
  guestName: string;
  honorific: string;
  displayName: string;
  guestType: GuestType;
  isActive: boolean;
  rsvpStatus: RsvpStatus;
  rsvpMessage: string;
  createdAt: string;
  updatedAt: string;
};

export type WeddingConfig = {
  coupleNames: string;
  banquetTitle: string;
  dateText: string;
  timeText: string;
  venueName: string;
  address: string;
  mapUrl: string;
  hostLine: string;
};
