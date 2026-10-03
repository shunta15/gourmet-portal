/**
 * 総合サイトの共有画像（OGP, 1200×630）の絵柄。next/og（Satori）は flexbox と一部の CSS だけなので、
 * 子が2つ以上の要素は必ず display:flex にする。
 *
 * 数字・店名は実データだけ（掲載数 0 のあいだは「掲載準備中」）。写真・星評価・架空の数字は出さない。
 * 日本語フォント: next/og は日本語の文字を見つけると Noto Sans JP を自動で読み込む（ルートの
 * app/opengraph-image.tsx などグルメ側の共有画像と同じ仕組み）。太字は付かず標準の太さで出る。
 */
import { ImageResponse } from "next/og";
import type { ReactElement } from "react";
import { OG_SIZE } from "@/lib/seo/og";
import { VERTICALS } from "@/lib/verticals";
import type { VerticalKey } from "@/lib/verticals/types";
import { VERTICAL_FACE } from "@/lib/portal/meta";

const IVORY = "#f4efe6";
const INK = "#15110e";
const INK2 = "#4a423a";
const ORDER: VerticalKey[] = ["gourmet", "beauty", "bodycare", "pet", "leisure", "stay"];

/** 画像のレスポンス。URL に ?v= を付けているので、CDN には長く持たせる */
export function renderOg(el: ReactElement): ImageResponse {
  return new ImageResponse(el, {
    ...OG_SIZE,
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
  });
}

/** 文字数に応じて大きな見出しの字の大きさを決める（長い駅名がはみ出さないように） */
function fit(len: number, table: [number, number][], min: number): number {
  for (const [max, size] of table) if (len <= max) return size;
  return min;
}

function Brand({ right }: { right?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
        <div style={{ display: "flex", fontSize: 34, letterSpacing: 8, color: INK }}>マチノワ</div>
        <div style={{ display: "flex", fontSize: 20, letterSpacing: 7, color: INK2 }}>MACHINOWA</div>
      </div>
      {right ? <div style={{ display: "flex", fontSize: 22, letterSpacing: 5, color: INK2 }}>{right}</div> : null}
    </div>
  );
}

function Url() {
  return <div style={{ display: "flex", flexShrink: 0, fontSize: 22, letterSpacing: 4, color: INK2 }}>machinowa.tokyo</div>;
}

function Chip({ color, label, note, small }: { color: string; label: string; note?: string; small?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: small ? 9 : 12,
        padding: small ? "9px 16px" : "12px 22px",
        border: "2px solid rgba(21,17,14,0.25)",
        borderRadius: 999,
        background: "rgba(250,247,241,0.72)",
        fontSize: small ? 21 : 26,
        color: INK,
      }}
    >
      <div style={{ display: "flex", width: small ? 13 : 16, height: small ? 13 : 16, borderRadius: 999, background: color }} />
      <div style={{ display: "flex" }}>{label}</div>
      {note ? <div style={{ display: "flex", fontSize: small ? 19 : 22, color: INK2 }}>{note}</div> : null}
    </div>
  );
}

/** 6業種の輪（総合トップ・ヒーローの輪と同じ幾何） */
function Ring({ size }: { size: number }) {
  const C = 200;
  const R = 150;
  const rad = (d: number) => (d * Math.PI) / 180;
  const pt = (d: number, r: number) => [C + r * Math.cos(rad(d)), C + r * Math.sin(rad(d))] as const;
  return (
    <div style={{ display: "flex", position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 400 400" style={{ position: "absolute", left: 0, top: 0 }}>
        <circle cx={C} cy={C} r={R + 34} fill="none" stroke="rgba(21,17,14,0.2)" strokeWidth="1.5" strokeDasharray="3 7" />
        <circle cx={C} cy={C} r={R - 34} fill="none" stroke="rgba(21,17,14,0.12)" strokeWidth="1.5" />
        {ORDER.map((k, i) => {
          const mid = -90 + i * 60;
          const [x0, y0] = pt(mid - 26, R);
          const [x1, y1] = pt(mid + 26, R);
          return (
            <path
              key={k}
              d={`M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`}
              fill="none"
              stroke={VERTICALS[k].accent.color}
              strokeWidth="11"
              strokeLinecap="round"
            />
          );
        })}
        {ORDER.map((k, i) => {
          const [x, y] = pt(-90 + i * 60, R);
          return <circle key={k} cx={x} cy={y} r="6" fill="#faf7f1" stroke={VERTICALS[k].accent.color} strokeWidth="3" />;
        })}
      </svg>
      <div style={{ display: "flex", position: "absolute", left: 0, top: 0, width: size, height: size, alignItems: "center", justifyContent: "center", fontSize: size * 0.3, color: INK }}>
        輪
      </div>
    </div>
  );
}

/** 総合トップ */
export function HomeCard(): ReactElement {
  const g = (rgb: string, at: string) => `radial-gradient(circle at ${at}, rgba(${rgb},0.34), rgba(244,239,230,0) 52%)`;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "52px 72px 48px",
        color: INK,
        backgroundImage: [
          g("200,79,53", "10% 18%"),
          g("232,84,125", "78% 8%"),
          g("62,155,220", "96% 70%"),
          g("229,164,71", "44% 104%"),
          g("127,168,150", "66% 52%"),
          "linear-gradient(160deg, #f6f1e8, #efe6dc)",
        ].join(","),
      }}
    >
      <Brand right="machinowa.tokyo" />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 54, color: INK }}>街の店を、</div>
          <div style={{ display: "flex", fontSize: 196, lineHeight: 1.05, letterSpacing: -6, color: INK }}>マチノワ</div>
          <div style={{ display: "flex", fontSize: 50, color: INK }}>業種をまたいで探す。</div>
        </div>
        <Ring size={330} />
      </div>
      <div style={{ display: "flex", gap: 10, width: "100%" }}>
        {ORDER.map((k) => (
          <Chip key={k} small color={VERTICALS[k].accent.color} label={VERTICALS[k].name} />
        ))}
      </div>
    </div>
  );
}

/** 業種トップ（業種名・業種の色）。count は実データの掲載数 */
export function VerticalCard({ vertical, count }: { vertical: VerticalKey; count: number }): ReactElement {
  const v = VERTICALS[vertical];
  const face = VERTICAL_FACE[vertical];
  const pre = v.brand.startsWith("マチノワ") ? "マチノワ" : "";
  const name = v.brand.slice(pre.length);
  const cats = v.categories.map((c) => c.name).join("・");
  const nameSize = fit(name.length, [[4, 190], [6, 160], [8, 126]], 100);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        width: "100%",
        height: "100%",
        padding: "52px 72px 48px",
        color: INK,
        backgroundImage: [
          `radial-gradient(circle at 92% 8%, ${v.accent.color}66, rgba(244,239,230,0) 52%)`,
          `radial-gradient(circle at 6% 104%, ${v.accent.color}40, rgba(244,239,230,0) 50%)`,
          `linear-gradient(160deg, ${v.accent.lightColor}, ${IVORY})`,
        ].join(","),
      }}
    >
      <div style={{ display: "flex", position: "absolute", right: 36, top: -30, fontSize: 600, lineHeight: 1, color: "rgba(255,255,255,0.6)" }}>{face.glyph}</div>
      <Brand right={face.en.toUpperCase()} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        {pre ? <div style={{ display: "flex", fontSize: 44, letterSpacing: 10, color: INK2 }}>{pre}</div> : null}
        <div style={{ display: "flex", fontSize: nameSize, lineHeight: 1.1, letterSpacing: -4, color: INK }}>{name}</div>
        <div style={{ display: "flex", marginTop: 14, fontSize: 30, lineHeight: 1.6, color: INK2, maxWidth: 820 }}>{cats}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 26px", border: `2px solid ${v.accent.color}`, borderRadius: 999, background: "rgba(250,247,241,0.8)", fontSize: 28, color: INK }}>
          <div style={{ display: "flex", width: 16, height: 16, borderRadius: 999, background: v.accent.color }} />
          <div style={{ display: "flex" }}>{count > 0 ? `掲載 ${count} 件` : "掲載準備中"}</div>
        </div>
        <Url />
      </div>
    </div>
  );
}

/** 駅ページ。店数・路線は実データ */
export function StationCard({
  heading,
  place,
  count,
  lines,
  prefShort,
}: {
  /** 「祇園四条駅周辺」 */
  heading: string;
  /** 「京都府京都市東山区」 */
  place: string;
  count: number;
  lines: string[];
  prefShort: string;
}): ReactElement {
  // 見出しの領域は幅 約1030px。全角で 1文字≒字の大きさなので、文字数から割る（上限170・下限64。それ以上長ければ折り返す）
  const size = Math.max(64, Math.min(170, Math.floor(1030 / Math.max(1, heading.length))));
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        width: "100%",
        height: "100%",
        padding: "52px 72px 48px",
        color: INK,
        backgroundImage: [
          "radial-gradient(circle at 94% 6%, rgba(200,79,53,0.20), rgba(244,239,230,0) 50%)",
          "radial-gradient(circle at 4% 100%, rgba(62,155,220,0.18), rgba(244,239,230,0) 50%)",
          `linear-gradient(160deg, #e7dfd0, ${IVORY})`,
        ].join(","),
      }}
    >
      <div style={{ display: "flex", position: "absolute", right: 36, top: -30, fontSize: 560, lineHeight: 1, color: "rgba(255,255,255,0.6)" }}>駅</div>
      <Brand right={`STATION — ${prefShort}`} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: size, lineHeight: 1.12, letterSpacing: -3, color: INK }}>{heading}</div>
        <div style={{ display: "flex", marginTop: 12, fontSize: 32, color: INK2 }}>{place}</div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, maxWidth: 760 }}>
          {lines.map((l) => (
            <div key={l} style={{ display: "flex", padding: "10px 20px", border: "2px solid rgba(21,17,14,0.25)", borderRadius: 999, background: "rgba(250,247,241,0.72)", fontSize: 24, color: INK }}>
              {l}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, color: INK }}>
          <div style={{ display: "flex", fontSize: 110, lineHeight: 1 }}>{count}</div>
          <div style={{ display: "flex", fontSize: 34 }}>店を掲載</div>
        </div>
      </div>
    </div>
  );
}

/** 県（業種横断の街）。業種ごとの件数は実データ（0 は「準備中」） */
export function AreaCard({ short, rows }: { short: string; rows: { key: VerticalKey; count: number }[] }): ReactElement {
  const size = fit(short.length, [[3, 230], [4, 190]], 150);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        width: "100%",
        height: "100%",
        padding: "52px 72px 48px",
        color: INK,
        backgroundImage: [
          "radial-gradient(circle at 94% 6%, rgba(232,84,125,0.20), rgba(244,239,230,0) 50%)",
          "radial-gradient(circle at 4% 100%, rgba(229,164,71,0.22), rgba(244,239,230,0) 50%)",
          `linear-gradient(160deg, #e7dfd0, ${IVORY})`,
        ].join(","),
      }}
    >
      <div style={{ display: "flex", position: "absolute", right: 36, top: -30, fontSize: 600, lineHeight: 1, color: "rgba(255,255,255,0.6)" }}>街</div>
      <Brand right="machinowa.tokyo" />
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <div style={{ display: "flex", fontSize: size, lineHeight: 1.1, letterSpacing: -4, color: INK }}>{short}</div>
        <div style={{ display: "flex", fontSize: 54, color: INK }}>の店を業種から探す</div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, width: "100%" }}>
        {rows.map((r) => (
          <Chip small key={r.key} color={VERTICALS[r.key].accent.color} label={VERTICALS[r.key].name} note={r.count > 0 ? `${r.count}店` : "準備中"} />
        ))}
      </div>
    </div>
  );
}
