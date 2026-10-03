/**
 * ショート動画の型。
 * 動画は2種類: (a) TikTok に投稿した動画のリンク（source: 'tiktok'）、(b) サイトに置いた動画ファイル（source: 'file'）。
 * 再生数・いいね・コメント・保存の数字は持たない（いつの値か確かめられないため表示しない）。
 */
import type { VerticalKey } from "@/lib/verticals/types";

export type VideoSource = "tiktok" | "file";

export interface Video {
  /** URL に使う ID（/videos/{id}）。TikTok は `tt-{tiktokId}` */
  id: string;
  source: VideoSource;
  /** source=tiktok のとき: 動画 ID（数字） */
  tiktokId?: string;
  /** source=tiktok のとき: 正規の動画 URL（https://www.tiktok.com/@user/video/ID） */
  tiktokUrl?: string;
  /** source=file のとき: mp4 のパス（/videos/...） */
  src?: string;
  /** サムネイルのパス（/videos/...）。TikTok のサムネイルは期限切れになるので自サイトに保存したもの */
  thumbnail: string;
  title: string;
  /** 映っている店の ID（複数可。店に紐づかない動画は空） */
  storeIds: string[];
  /** 縦型（9:16）かどうか */
  vertical: boolean;
  /** 店に紐づかない動画の業種（店があるときは店の業種を使う） */
  industry?: VerticalKey;
  author?: string;
  /** 投稿日（ISO 8601）。分かる動画だけ入れる。入っている動画だけ VideoObject を出して index 対象にする */
  uploadDate?: string;
  /** 長さ（秒）。実測できたものだけ */
  duration?: number;
}
