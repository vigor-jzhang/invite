"use client";

import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Guest, WeddingConfig } from "@/lib/types";

type Props = {
  code: string;
};

type InvitePayload = {
  guest: Guest;
  wedding: WeddingConfig;
};

const imageWidth = 900;
const imageHeight = 1600;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = "";

  for (const char of text) {
    const nextLine = line + char;
    if (ctx.measureText(nextLine).width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = nextLine;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines;
}

function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  options: {
    color?: string;
    font: string;
    lineHeight?: number;
    maxWidth?: number;
  }
) {
  ctx.fillStyle = options.color ?? "#fff8e7";
  ctx.font = options.font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const maxWidth = options.maxWidth ?? 760;
  const lineHeight = options.lineHeight ?? 56;
  const lines = wrapText(ctx, text, maxWidth);
  const firstY = y - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, index) => {
    ctx.fillText(line, imageWidth / 2, firstY + index * lineHeight);
  });

  return firstY + lines.length * lineHeight;
}

function drawInviteImage(canvas: HTMLCanvasElement, payload: InvitePayload) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return "";
  }

  canvas.width = imageWidth;
  canvas.height = imageHeight;

  const background = ctx.createLinearGradient(0, 0, imageWidth, imageHeight);
  background.addColorStop(0, "#661111");
  background.addColorStop(0.42, "#8f1d1d");
  background.addColorStop(1, "#3f0909");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, imageWidth, imageHeight);

  const glow = ctx.createRadialGradient(450, 190, 20, 450, 190, 360);
  glow.addColorStop(0, "rgba(239, 204, 119, 0.34)");
  glow.addColorStop(1, "rgba(239, 204, 119, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, imageWidth, imageHeight);

  const lowerGlow = ctx.createRadialGradient(190, 1320, 20, 190, 1320, 360);
  lowerGlow.addColorStop(0, "rgba(239, 204, 119, 0.18)");
  lowerGlow.addColorStop(1, "rgba(239, 204, 119, 0)");
  ctx.fillStyle = lowerGlow;
  ctx.fillRect(0, 0, imageWidth, imageHeight);

  ctx.strokeStyle = "rgba(239, 204, 119, 0.68)";
  ctx.lineWidth = 3;
  ctx.roundRect(42, 42, imageWidth - 84, imageHeight - 84, 42);
  ctx.stroke();

  ctx.strokeStyle = "rgba(239, 204, 119, 0.36)";
  ctx.lineWidth = 1;
  ctx.roundRect(64, 64, imageWidth - 128, imageHeight - 128, 32);
  ctx.stroke();

  drawCenteredText(ctx, "INVITATION", 116, {
    color: "#e9c669",
    font: "700 30px 'Noto Serif SC', 'Songti SC', serif",
    maxWidth: 760
  });

  drawCenteredText(ctx, payload.wedding.banquetTitle, 186, {
    color: "#f4d57d",
    font: "900 72px 'Noto Serif SC', 'Songti SC', serif",
    maxWidth: 760
  });

  ctx.fillStyle = "#e9c669";
  ctx.fillRect((imageWidth - 168) / 2, 252, 168, 2);

  drawCenteredText(ctx, "诚邀", 370, {
    color: "#f4d57d",
    font: "900 44px 'Noto Serif SC', 'Songti SC', serif",
    maxWidth: 760
  });

  const nameFontSize = payload.guest.displayName.length > 8 ? 58 : 70;
  const afterNameY = drawCenteredText(ctx, payload.guest.displayName, 470, {
    color: "#f4d57d",
    font: `900 ${nameFontSize}px 'Ma Shan Zheng', 'KaiTi', 'Noto Serif SC', serif`,
    lineHeight: 76,
    maxWidth: 740
  });

  drawCenteredText(ctx, "莅临", Math.max(afterNameY + 60, 610), {
    font: "900 46px 'Noto Serif SC', 'Songti SC', serif",
    maxWidth: 760
  });
  drawCenteredText(ctx, "张俭伟先生 与 吴晓坤女士", Math.max(afterNameY + 135, 685), {
    color: "#f4d57d",
    font: "900 52px 'Noto Serif SC', 'Songti SC', serif",
    maxWidth: 800
  });
  drawCenteredText(ctx, "良缘答谢宴", Math.max(afterNameY + 215, 765), {
    font: "900 46px 'Noto Serif SC', 'Songti SC', serif",
    maxWidth: 760
  });

  drawCenteredText(ctx, "谨备薄宴", 900, {
    font: "900 42px 'Noto Serif SC', 'Songti SC', serif"
  });
  drawCenteredText(ctx, "恭候光临", 970, {
    font: "900 42px 'Noto Serif SC', 'Songti SC', serif"
  });

  drawCenteredText(ctx, "张俭伟父母", 1086, {
    color: "#f4d57d",
    font: "900 40px 'Noto Serif SC', 'Songti SC', serif"
  });
  drawCenteredText(ctx, "张勤业 王淑敏 敬邀", 1150, {
    color: "#f4d57d",
    font: "900 40px 'Noto Serif SC', 'Songti SC', serif"
  });

  drawCenteredText(ctx, "时间", 1280, {
    color: "#f4d57d",
    font: "900 34px 'Noto Serif SC', 'Songti SC', serif"
  });
  drawCenteredText(ctx, payload.wedding.dateText, 1336, {
    font: "900 34px 'Noto Serif SC', 'Songti SC', serif",
    maxWidth: 760
  });
  drawCenteredText(ctx, "地点", 1414, {
    color: "#f4d57d",
    font: "900 34px 'Noto Serif SC', 'Songti SC', serif"
  });
  drawCenteredText(ctx, payload.wedding.venueName, 1470, {
    font: "900 34px 'Noto Serif SC', 'Songti SC', serif",
    maxWidth: 760
  });
  drawCenteredText(ctx, payload.wedding.address, 1522, {
    color: "rgba(255, 248, 231, 0.86)",
    font: "700 28px 'Noto Serif SC', 'Songti SC', serif",
    lineHeight: 38,
    maxWidth: 760
  });

  return canvas.toDataURL("image/png");
}

export function InviteImageGenerator({ code }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [fileName, setFileName] = useState("invite.png");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function renderImage() {
      setError("");
      try {
        const response = await fetch(`/api/invites/${code}`);
        if (!response.ok) {
          setError("请柬不存在或已失效");
          return;
        }

        const payload = (await response.json()) as InvitePayload;
        await document.fonts.ready;

        if (cancelled || !canvasRef.current) {
          return;
        }

        const nextImageUrl = drawInviteImage(canvasRef.current, payload);
        setImageUrl(nextImageUrl);
        setFileName(`${payload.guest.displayName}-良缘答谢宴请柬.png`);
      } catch {
        setError("图片生成失败，请刷新后重试");
      }
    }

    renderImage();

    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <main className="phone-shell min-h-dvh bg-[#fff8df] px-5 py-6 text-slate-900">
      <div className="mx-auto max-w-sm">
        <h1 className="text-2xl font-black">请柬图片</h1>
        <p className="mt-2 text-sm leading-6 text-slate-900/58">图片生成后可长按保存，或使用下方按钮下载。</p>

        {error ? (
          <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>
        ) : null}

        <div className="mt-5 overflow-hidden rounded-3xl border border-amber-200 bg-white p-2 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="block w-full rounded-2xl" src={imageUrl} alt="请柬图片" />
          ) : (
            <div className="flex aspect-[9/16] items-center justify-center rounded-2xl bg-[#fffdf5] text-sm font-bold text-slate-900/50">
              正在生成图片...
            </div>
          )}
        </div>

        {imageUrl ? (
          <a
            className="tap-target mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-3 font-bold text-white"
            href={imageUrl}
            download={fileName}
          >
            <Download size={18} />
            下载图片
          </a>
        ) : null}
      </div>
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </main>
  );
}
