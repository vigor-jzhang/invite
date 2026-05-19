import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InviteExperience } from "@/components/InviteExperience";
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

  const title = `诚邀${guest.displayName}莅临${weddingConfig.banquetTitle}`;
  const description = `张勤业、王淑敏敬邀${guest.displayName}莅临张俭伟先生与吴晓坤女士${weddingConfig.banquetTitle}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website"
    },
    twitter: {
      card: "summary",
      title,
      description
    }
  };
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
