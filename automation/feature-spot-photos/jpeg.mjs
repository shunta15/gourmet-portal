// build.mjs(特集)・automation/shop-photos/build.mjs(店)で共有する、写真ファイルの検査の部品(依存なし)。
import { createHash } from 'node:crypto';

export const MIN_PX = 300;
export const KB = 1024;
export const SLACK = 1.5;
/** 大きさの決まり(バイト数。検査では SLACK 倍まで許す) */
export const LIMIT = { spot: 220 * KB, hero: 350 * KB };

/** JPEG を読む(SOF のサイズの記載と、終わりの EOI を見る)。読めれば { width, height }、だめなら { error } */
export function readJpeg(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return { error: '先頭が JPEG ではない' };
  let i = 2;
  let dims = null;
  while (i < buf.length - 1) {
    if (buf[i] !== 0xff) return { error: 'JPEG の構造が壊れている' };
    while (i < buf.length && buf[i] === 0xff) i++; // 詰めの 0xFF
    const m = buf[i++];
    if (m === undefined) break;
    if (m === 0x01 || (m >= 0xd0 && m <= 0xd8)) continue; // 長さの無いマーカー
    if (m === 0xd9) break; // EOI(SOF より前に来たら、下で dims 無しになる)
    if (i + 2 > buf.length) return { error: 'JPEG の途中で切れている' };
    const len = buf.readUInt16BE(i);
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      if (i + 7 > buf.length) return { error: 'JPEG のサイズの記載が切れている' };
      dims = { height: buf.readUInt16BE(i + 3), width: buf.readUInt16BE(i + 5) };
      break;
    }
    if (m === 0xda) break; // SOS: 画像の本体に入った(SOF を見つけられなかった)
    i += len;
  }
  if (!dims || !dims.width || !dims.height) return { error: 'JPEG のサイズの記載が見つからない' };
  let end = buf.length;
  while (end > 2 && buf[end - 1] === 0x00) end--; // 末尾の 0 の詰めは許す
  if (!(buf[end - 2] === 0xff && buf[end - 1] === 0xd9)) return { error: '終わり(EOI)が無い=途中で切れた JPEG' };
  return dims;
}

/** 特集の ID から導いた、写真の置き場の名前(fs-+sha1 の先頭 10 桁) */
export const sha1dir = (featureId) => 'fs-' + createHash('sha1').update(featureId).digest('hex').slice(0, 10);
export const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
