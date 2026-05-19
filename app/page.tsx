import { InviteExperience } from "@/components/InviteExperience";
import { weddingConfig } from "@/lib/wedding-config";

export default function Home() {
  return <InviteExperience wedding={weddingConfig} />;
}
