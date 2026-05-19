import type { Metadata, Viewport } from "next";
import "@fontsource/noto-serif-sc/chinese-simplified-400.css";
import "@fontsource/noto-serif-sc/chinese-simplified-500.css";
import "@fontsource/noto-serif-sc/chinese-simplified-700.css";
import "@fontsource/noto-serif-sc/chinese-simplified-900.css";
import "@fontsource/ma-shan-zheng/chinese-simplified-400.css";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jzandxw.space";
const shareImage = "/share-card.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "良缘答谢宴请柬",
  description: "专属良缘答谢宴 H5 请柬",
  openGraph: {
    title: "良缘答谢宴请柬",
    description: "专属良缘答谢宴 H5 请柬",
    type: "website",
    images: [shareImage]
  },
  twitter: {
    card: "summary_large_image",
    title: "良缘答谢宴请柬",
    description: "专属良缘答谢宴 H5 请柬",
    images: [shareImage]
  }
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
