/**
 * 共有ボタンのリンクの作り方。純関数（サーバー・クライアントのどちらからも使える）。
 * 外部の公式ウィジェット（各 SNS のスクリプト）は読み込まない。URL を組み立てて普通のリンクにするだけ。
 *
 *  LINE     https://social-plugins.line.me/lineit/share?url=
 *  X        https://twitter.com/intent/tweet?url=&text=
 *  Facebook https://www.facebook.com/sharer/sharer.php?u=
 *
 * 共有する URL は、そのページの正規 URL（https://machinowa.tokyo＋パス。日本語は percent-encode 済み）。
 * クエリには、その URL をもう一度 encodeURIComponent したものを入れる（二重にエンコードされた形が正しい）。
 */

export const SHARE_ORIGIN = "https://machinowa.tokyo";

/** サイト内のパス（日本語のままでもよい）→ 共有する絶対URL（percent-encode 済み・末尾スラッシュなし） */
export function shareTarget(path: string): string {
  let p = path.split(/[?#]/)[0];
  try {
    p = decodeURI(p);
  } catch {
    /* そのまま */
  }
  p = encodeURI(p).replace(/\/+$/, "");
  return p === "" || p === "/" ? SHARE_ORIGIN : `${SHARE_ORIGIN}${p}`;
}

export interface ShareUrls {
  line: string;
  x: string;
  facebook: string;
}

export function shareUrls(url: string, text: string): ShareUrls {
  const u = encodeURIComponent(url);
  return {
    line: `https://social-plugins.line.me/lineit/share?url=${u}`,
    x: `https://twitter.com/intent/tweet?url=${u}&text=${encodeURIComponent(text)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
  };
}
