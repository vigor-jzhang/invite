import type { Metadata, Viewport } from "next";
import "@fontsource/noto-serif-sc/chinese-simplified-400.css";
import "@fontsource/noto-serif-sc/chinese-simplified-500.css";
import "@fontsource/noto-serif-sc/chinese-simplified-700.css";
import "@fontsource/noto-serif-sc/chinese-simplified-900.css";
import "@fontsource/ma-shan-zheng/chinese-simplified-400.css";
import { inviteShareMetadata } from "@/lib/share";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jzandxw.space";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  ...inviteShareMetadata()
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#8f1d1d"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
