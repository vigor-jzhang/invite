import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InviteExperience } from "@/components/InviteExperience";
import { inviteShareMetadata } from "@/lib/share";
import { findGuestByCode } from "@/lib/store";
import { isInviteCode } from "@/lib/validation";
import { weddingConfig } from "@/lib/wedding-config";

type InvitePageProps = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: InvitePageProps): Promise<Metadata> {
  const { code } = await params;
  if (!isInviteCode(code)) {
    return {};
  }

  const guest = await findGuestByCode(code);
  if (!guest || !guest.isActive) {
    return {};
  }

  return inviteShareMetadata(guest.displayName);
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { code } = await params;
  if (!isInviteCode(code)) {
    notFound();
  }

  const guest = await findGuestByCode(code);

  if (!guest || !guest.isActive) {
    notFound();
  }

  return <InviteExperience guest={guest} wedding={weddingConfig} />;
}
