import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";
import { findGuestByCode } from "@/lib/store";
import { isInviteCode } from "@/lib/validation";
import { weddingConfig } from "@/lib/wedding-config";

export const runtime = "nodejs";

const size = {
  width: 900,
  height: 1600
};

async function loadFont(fileName: string) {
  return readFile(path.join(process.cwd(), "node_modules", "@fontsource", "noto-serif-sc", "files", fileName));
}

export async function GET(_: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  if (!isInviteCode(code)) {
    return new Response("Not found", { status: 404 });
  }

  const guest = await findGuestByCode(code);
  if (!guest || !guest.isActive) {
    return new Response("Not found", { status: 404 });
  }

  const [serifRegular, serifBold] = await Promise.all([
    loadFont("noto-serif-sc-chinese-simplified-400-normal.woff2"),
    loadFont("noto-serif-sc-chinese-simplified-700-normal.woff2")
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(165deg, #661111 0%, #8f1d1d 42%, #3f0909 100%)",
          color: "#fff8e7",
          fontFamily: "Noto Serif SC"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(circle at 50% 12%, rgba(239,204,119,0.32), transparent 22%), radial-gradient(circle at 20% 82%, rgba(239,204,119,0.18), transparent 24%), radial-gradient(circle at 85% 75%, rgba(255,248,231,0.12), transparent 20%)"
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 42,
            display: "flex",
            border: "3px solid rgba(239,204,119,0.68)",
            borderRadius: 42
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 64,
            display: "flex",
            border: "1px solid rgba(239,204,119,0.36)",
            borderRadius: 32
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            width: "100%",
            height: "100%",
            padding: "96px 76px",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center"
          }}
        >
          <div style={{ display: "flex", fontSize: 30, letterSpacing: 12, color: "#e9c669" }}>
            INVITATION
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 70,
              fontWeight: 700,
              color: "#f4d57d"
            }}
          >
            {weddingConfig.banquetTitle}
          </div>
          <div
            style={{
              display: "flex",
              width: 168,
              height: 2,
              marginTop: 34,
              background: "#e9c669"
            }}
          />

          <div
            style={{
              display: "flex",
              marginTop: 78,
              fontSize: 42,
              fontWeight: 700,
              letterSpacing: 18,
              color: "#f4d57d"
            }}
          >
            诚邀
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 32,
              maxWidth: 720,
              fontSize: guest.displayName.length > 8 ? 58 : 68,
              fontWeight: 700,
              lineHeight: 1.2,
              color: "#f4d57d",
              wordBreak: "break-word"
            }}
          >
            {guest.displayName}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 62,
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
              fontSize: 44,
              fontWeight: 700,
              lineHeight: 1.45
            }}
          >
            <div style={{ display: "flex" }}>莅临</div>
            <div style={{ display: "flex", fontSize: 52, color: "#f4d57d" }}>
              张俭伟先生 与 吴晓坤女士
            </div>
            <div style={{ display: "flex" }}>良缘答谢宴</div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 58,
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              fontSize: 40,
              fontWeight: 700,
              lineHeight: 1.5
            }}
          >
            <div style={{ display: "flex" }}>谨备薄宴</div>
            <div style={{ display: "flex" }}>恭候光临</div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 56,
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              fontSize: 38,
              fontWeight: 700,
              color: "#f4d57d"
            }}
          >
            <div style={{ display: "flex" }}>张俭伟父母</div>
            <div style={{ display: "flex" }}>张勤业 王淑敏 敬邀</div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "auto",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              fontSize: 34,
              fontWeight: 700,
              lineHeight: 1.38
            }}
          >
            <div style={{ display: "flex", color: "#f4d57d" }}>时间</div>
            <div style={{ display: "flex" }}>{weddingConfig.dateText}</div>
            <div style={{ display: "flex", marginTop: 14, color: "#f4d57d" }}>地点</div>
            <div style={{ display: "flex" }}>{weddingConfig.venueName}</div>
            <div style={{ display: "flex", fontSize: 29, color: "rgba(255,248,231,0.86)" }}>
              {weddingConfig.address}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Noto Serif SC",
          data: serifRegular,
          weight: 400,
          style: "normal"
        },
        {
          name: "Noto Serif SC",
          data: serifBold,
          weight: 700,
          style: "normal"
        }
      ],
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=86400"
      }
    }
  );
}
