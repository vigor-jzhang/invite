import type { Metadata, Viewport } from "next";
import "@fontsource/noto-serif-sc/chinese-simplified-400.css";
import "@fontsource/noto-serif-sc/chinese-simplified-500.css";
import "@fontsource/noto-serif-sc/chinese-simplified-700.css";
import "@fontsource/noto-serif-sc/chinese-simplified-900.css";
import "@fontsource/ma-shan-zheng/chinese-simplified-400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "良缘答谢宴请柬",
  description: "专属良缘答谢宴 H5 请柬"
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
