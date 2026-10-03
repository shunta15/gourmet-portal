/**
 * 動画の表示まわりの小さな共通部品（純粋関数）。
 */
import type { Video } from "./types";

/** 表示用のタイトル。TikTok のキャプションからはハッシュタグを外す（動画ファイルの「#1」は番号なのでそのまま） */
export function displayTitle(v: Video): string {
  if (v.source !== "tiktok") return v.title;
  const t = v.title.replace(/#[^\s#]+/g, " ").replace(/\s+/g, " ").trim();
  if (t) return t;
  return v.author ? `${v.author}の動画` : "動画";
}

/** `<title>` などに使う短いタイトル */
export function shortTitle(v: Video, max = 36): string {
  const t = displayTitle(v);
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

/** 秒 → "0:34" */
export function formatDuration(sec?: number): string | null {
  if (!sec || !isFinite(sec) || sec <= 0) return null;
  const s = Math.round(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** 秒 → ISO 8601 の長さ（PT34S） */
export function isoDuration(sec?: number): string | null {
  if (!sec || !isFinite(sec) || sec <= 0) return null;
  const s = Math.round(sec);
  const m = Math.floor(s / 60);
  return `PT${m ? `${m}M` : ""}${s % 60 ? `${s % 60}S` : m ? "" : "0S"}`;
}

/** TikTok の埋め込みプレーヤー */
export function tiktokPlayerUrl(tiktokId: string, autoplay = false): string {
  return `https://www.tiktok.com/player/v1/${tiktokId}${autoplay ? "?autoplay=1&rel=0" : ""}`;
}

/**
 * VideoObject を出せる（＝投稿日が分かる）動画だけ index 対象。
 * uploadDate が無い動画（動画ファイルなど）は VideoObject を出さず noindex にする。
 */
export function isVideoIndexable(v: Video): boolean {
  return !!v.uploadDate && !Number.isNaN(Date.parse(v.uploadDate));
}

/** 動画のページ */
export function videoHref(v: Video): string {
  return `/videos/${v.id}`;
}

/** メタ情報・VideoObject・サイトマップで共通に使う説明文（事実だけ。数字は入れない） */
export function videoDescription(v: Video, storeName?: string): string {
  const t = displayTitle(v);
  return storeName
    ? `${storeName}を紹介するショート動画「${t}」。マチノワに掲載している動画です。`
    : `ショート動画「${t}」。マチノワに掲載している動画です。`;
}

/** 投稿日（ISO 8601）→ 「2026年9月15日」（日本時間） */
export function formatUploadDate(iso: string): string {
  const d = new Date(iso);
  const jst = new Date(d.getTime() + 9 * 3600 * 1000);
  return `${jst.getUTCFullYear()}年${jst.getUTCMonth() + 1}月${jst.getUTCDate()}日`;
}
