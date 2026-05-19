import type { Metadata } from "next";
import { weddingConfig } from "./wedding-config";

export const shareImage = "/share-card.png";

export function inviteShareText(displayName?: string) {
  const guestPart = displayName ? `${displayName}莅临` : "亲友莅临";
  const title = `诚邀${guestPart}${weddingConfig.banquetTitle}`;
  const description = `张勤业、王淑敏敬邀${guestPart}张俭伟先生与吴晓坤女士${weddingConfig.banquetTitle}`;

  return { title, description };
}

export function inviteShareMetadata(displayName?: string): Metadata {
  const { title, description } = inviteShareText(displayName);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [shareImage]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [shareImage]
    }
  };
}
