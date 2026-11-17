import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

/**
 * GET /api/og?title=…&section=…  Social preview card (1200×630) for pages without their own photo:
 * the university crest on forest green, the Swat mountains along the bottom, a gold rule and the page
 * title. Urdu pages get the card without a title (the image renderer can't shape
 * Nastaliq, so no Urdu text is drawn). Cached by browsers for a day and by Cloudflare for a week.
 */

const size = { width: 1200, height: 630 };

let crest: Promise<string> | null = null;
function crestDataUrl(): Promise<string> {
  crest ??= readFile(path.join(process.cwd(), "public", "brand", "uswat-logo.png")).then(
    (file) => `data:image/png;base64,${file.toString("base64")}`,
  );
  return crest;
}

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…` : text);

let gate: Promise<string> | null = null;
/** The real main gate photo (photos/gate.jpeg, "Photo: University of Swat"), pre-cropped to 1200×630. */
function gateDataUrl(): Promise<string> {
  gate ??= readFile(path.join(process.cwd(), "public", "brand", "og-gate.jpg")).then(
    (file) => `data:image/jpeg;base64,${file.toString("base64")}`,
  );
  return gate;
}

const cacheHeaders = "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800";

/**
 * GET /api/og?variant=home  The homepage card: the main gate photo with a green band along the bottom
 * carrying the crest and the university's name (Latin text only, so the same card serves both languages).
 */
async function homeCard(): Promise<Response> {
  const [logo, photo] = await Promise.all([crestDataUrl(), gateDataUrl()]);
  const image = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "sans-serif" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img>. */}
        <img src={photo} width={1200} height={630} alt="" style={{ position: "absolute", inset: 0 }} />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            gap: 28,
            padding: "28px 56px",
            background: "rgba(12, 59, 38, 0.92)",
            borderTop: "6px solid #c9a227",
            color: "#faf8f2",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img>. */}
          <img src={logo} width={104} height={104} alt="" style={{ borderRadius: 999, background: "#faf8f2" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 50, fontWeight: 700, letterSpacing: -0.5 }}>University of Swat</div>
            <div style={{ fontSize: 26, color: "#e9d9a6" }}>Charbagh, Swat · Khyber Pakhtunkhwa · uswat.edu.pk</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
  image.headers.set("Cache-Control", cacheHeaders);
  return image;
}

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  if (params.get("variant") === "home") return homeCard();
  const title = clip((params.get("title") ?? "").trim(), 110);
  const section = clip((params.get("section") ?? "").trim(), 40);
  const logo = await crestDataUrl();

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #0c3b26 0%, #0f4a30 55%, #134d33 100%)",
          color: "#faf8f2",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Mountains of the Swat valley. */}
        <svg
          width="1200"
          height="260"
          viewBox="0 0 1200 260"
          style={{ position: "absolute", left: 0, bottom: 0 }}
        >
          <path d="M0 260 L0 170 L140 80 L250 150 L390 40 L520 140 L640 70 L780 160 L900 60 L1040 150 L1200 90 L1200 260 Z" fill="#ffffff" fillOpacity="0.05" />
          <path d="M0 260 L0 210 L180 130 L320 200 L470 120 L620 205 L760 140 L920 210 L1080 150 L1200 190 L1200 260 Z" fill="#ffffff" fillOpacity="0.07" />
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img>. */}
          <img src={logo} width={120} height={120} alt="" style={{ borderRadius: 999, background: "#faf8f2" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -0.5 }}>University of Swat</div>
            <div style={{ fontSize: 24, color: "#e9d9a6" }}>Charbagh, Swat · Khyber Pakhtunkhwa</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1000 }}>
          <div style={{ width: 96, height: 6, borderRadius: 3, background: "#c9a227" }} />
          {section ? (
            <div style={{ fontSize: 26, fontWeight: 600, color: "#e9d9a6", textTransform: "uppercase", letterSpacing: 2 }}>{section}</div>
          ) : null}
          {title ? (
            <div style={{ fontSize: title.length > 60 ? 54 : 66, fontWeight: 700, lineHeight: 1.12, letterSpacing: -1 }}>{title}</div>
          ) : (
            <div style={{ fontSize: 34, color: "#d7e4dc" }}>uswat.edu.pk</div>
          )}
        </div>
      </div>
    ),
    size,
  );
  image.headers.set("Cache-Control", cacheHeaders);
  return image;
}
