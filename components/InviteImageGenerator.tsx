"use client";

import { Download, RefreshCw } from "lucide-react";
import { toPng } from "html-to-image";
import { useCallback, useEffect, useRef, useState } from "react";
import { InviteExperience } from "@/components/InviteExperience";
import type { Guest, WeddingConfig } from "@/lib/types";

type Props = {
  code: string;
};

type InvitePayload = {
  guest: Guest;
  wedding: WeddingConfig;
};

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function waitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map((image) => {
      if (image.complete) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        image.onload = () => resolve();
        image.onerror = () => resolve();
      });
    })
  );
}

export function InviteImageGenerator({ code }: Props) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [payload, setPayload] = useState<InvitePayload | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [fileName, setFileName] = useState("invite.png");
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  const generateImage = useCallback(async () => {
    if (!captureRef.current || !payload) {
      return;
    }

    setGenerating(true);
    setError("");

    try {
      await document.fonts.ready;
      await waitForImages(captureRef.current);
      await wait(900);

      const captureWidth = 390;
      const captureHeight = Math.max(captureRef.current.scrollHeight, 1180);

      const nextImageUrl = await toPng(captureRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#7f1717",
        width: captureWidth,
        height: captureHeight,
        style: {
          width: `${captureWidth}px`,
          height: `${captureHeight}px`,
          minHeight: `${captureHeight}px`,
          margin: "0",
          overflow: "visible",
          transform: "none"
        }
      });

      setImageUrl(nextImageUrl);
      setFileName(`${payload.guest.displayName}-良缘答谢宴请柬.png`);
    } catch {
      setError("图片生成失败，请刷新后重试");
    } finally {
      setGenerating(false);
    }
  }, [payload]);

  useEffect(() => {
    let cancelled = false;

    async function loadInvite() {
      setError("");
      try {
        const response = await fetch(`/api/invites/${code}`);
        if (!response.ok) {
          setError("请柬不存在或已失效");
          return;
        }

        const nextPayload = (await response.json()) as InvitePayload;
        if (!cancelled) {
          setPayload(nextPayload);
        }
      } catch {
        setError("请柬加载失败，请刷新后重试");
      }
    }

    loadInvite();

    return () => {
      cancelled = true;
    };
  }, [code]);

  useEffect(() => {
    if (payload) {
      generateImage();
    }
  }, [generateImage, payload]);

  return (
    <main className="phone-shell min-h-dvh bg-[#fff8df] px-5 py-6 text-slate-900">
      <div className="mx-auto max-w-sm">
        <h1 className="text-2xl font-black">请柬图片</h1>
        <p className="mt-2 text-sm leading-6 text-slate-900/58">图片由真实请柬页面生成，生成后可长按保存。</p>

        {error ? (
          <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>
        ) : null}

        <div className="mt-5 overflow-hidden rounded-3xl border border-amber-200 bg-white p-2 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="block w-full rounded-2xl" src={imageUrl} alt="请柬图片" />
          ) : (
            <div className="flex aspect-[9/16] items-center justify-center rounded-2xl bg-[#fffdf5] text-sm font-bold text-slate-900/50">
              {generating || payload ? "正在生成图片..." : "正在加载请柬..."}
            </div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            className="tap-target flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 disabled:opacity-50"
            disabled={!payload || generating}
            onClick={generateImage}
          >
            <RefreshCw size={18} />
            重新生成
          </button>
          <a
            className={`tap-target flex items-center justify-center gap-2 rounded-full px-4 py-3 font-bold text-white ${
              imageUrl ? "bg-blue-600" : "pointer-events-none bg-slate-300"
            }`}
            href={imageUrl || "#"}
            download={fileName}
          >
            <Download size={18} />
            下载图片
          </a>
        </div>
      </div>

      <div className="invite-capture pointer-events-none fixed left-0 top-0 -z-10 w-[390px]" aria-hidden="true">
        <div ref={captureRef} className="w-[390px] overflow-visible bg-wine">
          {payload ? <InviteExperience guest={payload.guest} wedding={payload.wedding} initialOpened exportMode /> : null}
        </div>
      </div>
    </main>
  );
}
