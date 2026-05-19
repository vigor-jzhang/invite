import { InviteExperience } from "@/components/InviteExperience";
import { inviteShareMetadata } from "@/lib/share";
import { weddingConfig } from "@/lib/wedding-config";

export const metadata = inviteShareMetadata();

export default function Home() {
  return <InviteExperience wedding={weddingConfig} />;
}
