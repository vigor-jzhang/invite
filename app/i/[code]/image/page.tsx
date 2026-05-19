import { notFound } from "next/navigation";
import { InviteImageGenerator } from "@/components/InviteImageGenerator";
import { isInviteCode } from "@/lib/validation";

type InviteImagePageProps = {
  params: Promise<{ code: string }>;
};

export default async function InviteImagePage({ params }: InviteImagePageProps) {
  const { code } = await params;
  if (!isInviteCode(code)) {
    notFound();
  }

  return <InviteImageGenerator code={code} />;
}
