import { notFound } from "next/navigation";
import { InviteExperience } from "@/components/InviteExperience";
import { findGuestByCode } from "@/lib/store";
import { isInviteCode } from "@/lib/validation";
import { weddingConfig } from "@/lib/wedding-config";

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
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
