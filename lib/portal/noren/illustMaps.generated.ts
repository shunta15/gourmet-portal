/**
 * 「さがす」の地図 e・f・g・h の、地域ごとの画像の範囲の表。automation/illust-map/raster.mjs が書き出す（手で編集しない）。
 * main = 粗い層（すべての店の範囲。h はこの 1 枚だけ）、core = 細かい層（初期表示のまわり。縁をぼかした透明つき。粗い層の上に重ねる）。bounds は [[南, 西], [北, 東]]（緯度経度）。
 * f・g・h は、ここにある地域だけ（ほかの地域は e の絵を出す）。e のうち src が .svg のものは、画像にする前の描き起こし（暫定）。
 * 出典: 地図は国土地理院ベクトルタイルをもとに作成。
 */
export type IllustLayer = { src: string; bounds: [[number, number], [number, number]]; kb?: number };
export type IllustEntry = { main: IllustLayer; core?: IllustLayer; zi?: number };
export type IllustStyle = "e" | "f" | "g" | "h";

export const ILLUST: Record<IllustStyle, Record<string, IllustEntry>> = {
  e: {
    "akita": { "main": { "src": "/_portal/illust-map/e-akita.webp", "bounds": [ [ 39.67337, 140.00977 ], [ 39.77477, 140.22949 ] ], "kb": 194 }, "zi": 12.75 },
    "aomori": { "main": { "src": "/_portal/illust-map/e-aomori.webp", "bounds": [ [ 40.17887, 139.92188 ], [ 40.9799, 142.03125 ] ], "kb": 224 }, "zi": 9.75 },
    "ehime": { "main": { "src": "/_portal/illust-map/e-ehime.webp", "bounds": [ [ 33.87042, 132.71484 ], [ 34.30714, 133.59375 ] ], "kb": 198 }, "zi": 11 },
    "fukui": { "main": { "src": "/_portal/illust-map/e-fukui.webp", "bounds": [ [ 35.74651, 135.35156 ], [ 36.87962, 137.8125 ] ], "kb": 171 }, "zi": 9.25 },
    "fukuoka": { "main": { "src": "/_portal/illust-map/e-fukuoka.webp", "bounds": [ [ 32.54681, 129.375 ], [ 34.30714, 132.1875 ] ], "kb": 156 }, "zi": 9 },
    "fukushima": { "main": { "src": "/_portal/illust-map/e-fukushima.webp", "bounds": [ [ 37.16032, 139.57031 ], [ 37.99616, 141.32813 ] ], "kb": 249 }, "zi": 10 },
    "gifu": { "main": { "src": "/_portal/illust-map/e-gifu.webp", "bounds": [ [ 34.88593, 135 ], [ 36.59789, 139.21875 ] ], "kb": 170 }, "zi": 8.5 },
    "gunma": { "main": { "src": "/_portal/illust-map/e-gunma.webp", "bounds": [ [ 36.17336, 138.69141 ], [ 36.59789, 139.57031 ] ], "kb": 237 }, "zi": 10.75 },
    "hiroshima": { "main": { "src": "/_portal/illust-map/e-hiroshima.webp", "bounds": [ [ 34.01624, 131.83594 ], [ 34.88593, 133.59375 ] ], "kb": 245 }, "zi": 10.25 },
    "hokkaido": { "main": { "src": "/_portal/illust-map/e-hokkaido.webp", "bounds": [ [ 42.03297, 139.21875 ], [ 45.08904, 146.25 ] ], "kb": 144 }, "zi": 8 },
    "hyogo": { "main": { "src": "/_portal/illust-map/e-hyogo.webp", "bounds": [ [ 34.45222, 134.64844 ], [ 35.03, 135.70313 ] ], "kb": 253 }, "zi": 10.75 },
    "ibaraki": { "main": { "src": "/_portal/illust-map/e-ibaraki.webp", "bounds": [ [ 35.46067, 138.51563 ], [ 37.16032, 142.03125 ] ], "kb": 209 }, "zi": 9 },
    "ishikawa": { "main": { "src": "/_portal/illust-map/e-ishikawa.webp", "bounds": [ [ 36.31513, 136.05469 ], [ 36.73888, 136.93359 ] ], "kb": 210 }, "zi": 11 },
    "iwate": { "main": { "src": "/_portal/illust-map/e-iwate.webp", "bounds": [ [ 38.82259, 140.625 ], [ 39.36828, 141.67969 ] ], "kb": 225 }, "zi": 10.5 },
    "kagawa": { "main": { "src": "/_portal/illust-map/e-kagawa.webp", "bounds": [ [ 34.16182, 133.68164 ], [ 34.45222, 134.12109 ] ], "kb": 252 }, "zi": 11.75 },
    "kagoshima": { "main": { "src": "/_portal/illust-map/e-kagoshima.webp", "bounds": [ [ 31.65338, 130.42969 ], [ 32.10119, 131.30859 ] ], "kb": 253 }, "zi": 11 },
    "kanagawa": { "main": { "src": "/_portal/illust-map/e-kanagawa.webp", "bounds": [ [ 35.17381, 138.86719 ], [ 35.74651, 139.92188 ] ], "kb": 256 }, "zi": 10.5 },
    "kochi": { "main": { "src": "/_portal/illust-map/e-kochi.webp", "bounds": [ [ 33.50476, 133.50586 ], [ 33.61462, 133.6377 ] ], "kb": 245 }, "zi": 13.75 },
    "kyoto": { "main": { "src": "/_portal/illust-map/e-kyoto.webp", "bounds": [ [ 34.8138, 135.43945 ], [ 35.10193, 135.9668 ] ], "kb": 247 }, "zi": 11.5 },
    "mie": { "main": { "src": "/_portal/illust-map/e-mie.webp", "bounds": [ [ 33.72434, 135 ], [ 35.46067, 138.51563 ] ], "kb": 222 }, "zi": 9 },
    "miyazaki": { "main": { "src": "/_portal/illust-map/e-miyazaki.webp", "bounds": [ [ 32.4727, 131.48438 ], [ 32.7688, 131.92383 ] ], "kb": 214 }, "zi": 11.75 },
    "nagano": { "main": { "src": "/_portal/illust-map/e-nagano.webp", "bounds": [ [ 34.30714, 135 ], [ 37.71859, 142.03125 ] ], "kb": 196 }, "zi": 8 },
    "nagasaki": { "main": { "src": "/_portal/illust-map/e-nagasaki.webp", "bounds": [ [ 32.69487, 129.81445 ], [ 32.91649, 130.25391 ] ], "kb": 203 }, "zi": 11.75 },
    "nagoya": { "main": { "src": "/_portal/illust-map/e-nagoya.webp", "bounds": [ [ 34.59704, 136.05469 ], [ 35.46067, 138.16406 ] ], "kb": 209 }, "zi": 9.5 },
    "nara": { "main": { "src": "/_portal/illust-map/e-nara.webp", "bounds": [ [ 34.30714, 135 ], [ 35.17381, 136.75781 ] ], "kb": 246 }, "zi": 10 },
    "niigata": { "main": { "src": "/_portal/illust-map/e-niigata.webp", "bounds": [ [ 37.12529, 138.16406 ], [ 37.23033, 138.2959 ] ], "kb": 239 }, "zi": 13.75 },
    "okayama": { "main": { "src": "/_portal/illust-map/e-okayama.webp", "bounds": [ [ 34.56086, 133.68164 ], [ 34.63321, 133.81348 ] ], "kb": 256 }, "zi": 13.75 },
    "okinawa": { "main": { "src": "/_portal/illust-map/e-okinawa.webp", "bounds": [ [ 26.31311, 127.74902 ], [ 26.43123, 127.9248 ] ], "kb": 195 }, "zi": 13 },
    "osaka": { "main": { "src": "/_portal/illust-map/e-osaka.webp", "bounds": [ [ 34.30714, 134.64844 ], [ 35.17381, 136.40625 ] ], "kb": 253 }, "zi": 10 },
    "saga": { "main": { "src": "/_portal/illust-map/e-saga.webp", "bounds": [ [ 33.17434, 130.25391 ], [ 33.28462, 130.47363 ] ], "kb": 253 }, "zi": 13 },
    "saitama": { "main": { "src": "/_portal/illust-map/e-saitama.webp", "bounds": [ [ 35.46067, 138.51563 ], [ 36.59789, 140.625 ] ], "kb": 254 }, "zi": 9.75 },
    "shiga": { "main": { "src": "/_portal/illust-map/e-shiga.webp", "bounds": [ [ 34.59704, 135 ], [ 35.74651, 137.10938 ] ], "kb": 243 }, "zi": 9.5 },
    "shimane": { "main": { "src": "/_portal/illust-map/e-shimane.webp", "bounds": [ [ 35.31737, 132.80273 ], [ 35.53223, 133.24219 ] ], "kb": 212 }, "zi": 11.75 },
    "shizuoka": { "main": { "src": "/_portal/illust-map/e-shizuoka.webp", "bounds": [ [ 34.30714, 137.10938 ], [ 36.03133, 139.92188 ] ], "kb": 253 }, "zi": 9.25 },
    "tochigi": { "main": { "src": "/_portal/illust-map/e-tochigi.webp", "bounds": [ [ 36.03133, 138.51563 ], [ 37.16032, 140.625 ] ], "kb": 242 }, "zi": 9.5 },
    "tokyo": { "main": { "src": "/_portal/illust-map/e-tokyo.webp", "bounds": [ [ 35.46067, 139.04297 ], [ 35.88905, 140.09766 ] ], "kb": 256 }, "zi": 10.75 },
    "tottori": { "main": { "src": "/_portal/illust-map/e-tottori.webp", "bounds": [ [ 35.35322, 133.24219 ], [ 35.46067, 133.41797 ] ], "kb": 226 }, "zi": 13 },
    "toyama": { "main": { "src": "/_portal/illust-map/e-toyama.webp", "bounds": [ [ 36.63316, 137.10938 ], [ 36.73888, 137.3291 ] ], "kb": 243 }, "zi": 13 },
    "wakayama": { "main": { "src": "/_portal/illust-map/e-wakayama.webp", "bounds": [ [ 34.16182, 135.08789 ], [ 34.27084, 135.26367 ] ], "kb": 225 }, "zi": 13 },
    "yamagata": { "main": { "src": "/_portal/illust-map/e-yamagata.webp", "bounds": [ [ 38.16911, 140.22949 ], [ 38.30718, 140.40527 ] ], "kb": 238 }, "zi": 13 },
    "yamaguchi": { "main": { "src": "/_portal/illust-map/e-yamaguchi.webp", "bounds": [ [ 33.72434, 130.78125 ], [ 34.30714, 131.83594 ] ], "kb": 217 }, "zi": 10.5 },
  },
  f: {
    "fukuoka": { "main": { "src": "/_portal/illust-map/f-fukuoka.webp", "bounds": [ [ 32.54681, 129.375 ], [ 34.30714, 132.1875 ] ], "kb": 163 }, "zi": 9 },
    "hyogo": { "main": { "src": "/_portal/illust-map/f-hyogo.webp", "bounds": [ [ 34.45222, 134.64844 ], [ 35.03, 135.70313 ] ], "kb": 258 }, "zi": 10.75 },
    "kyoto": { "main": { "src": "/_portal/illust-map/f-kyoto.webp", "bounds": [ [ 34.8138, 135.43945 ], [ 35.10193, 135.9668 ] ], "kb": 221 }, "zi": 11.5 },
    "nagoya": { "main": { "src": "/_portal/illust-map/f-nagoya.webp", "bounds": [ [ 34.59704, 136.05469 ], [ 35.46067, 138.16406 ] ], "kb": 195 }, "zi": 9.5 },
    "osaka": { "main": { "src": "/_portal/illust-map/f-osaka.webp", "bounds": [ [ 34.30714, 134.64844 ], [ 35.17381, 136.40625 ] ], "kb": 252 }, "zi": 10 },
    "tokyo": { "main": { "src": "/_portal/illust-map/f-tokyo.webp", "bounds": [ [ 35.46067, 139.04297 ], [ 35.88905, 140.09766 ] ], "kb": 246 }, "zi": 10.75 },
  },
  g: {
    "fukuoka": { "main": { "src": "/_portal/illust-map/g-fukuoka.webp", "bounds": [ [ 32.54681, 129.375 ], [ 34.30714, 132.1875 ] ], "kb": 95 }, "zi": 9 },
    "hyogo": { "main": { "src": "/_portal/illust-map/g-hyogo.webp", "bounds": [ [ 34.45222, 134.64844 ], [ 35.03, 135.70313 ] ], "kb": 176 }, "zi": 10.75 },
    "kyoto": { "main": { "src": "/_portal/illust-map/g-kyoto.webp", "bounds": [ [ 34.8138, 135.43945 ], [ 35.10193, 135.9668 ] ], "kb": 129 }, "zi": 11.5 },
    "nagoya": { "main": { "src": "/_portal/illust-map/g-nagoya.webp", "bounds": [ [ 34.59704, 136.05469 ], [ 35.46067, 138.16406 ] ], "kb": 121 }, "zi": 9.5 },
    "osaka": { "main": { "src": "/_portal/illust-map/g-osaka.webp", "bounds": [ [ 34.30714, 134.64844 ], [ 35.17381, 136.40625 ] ], "kb": 175 }, "zi": 10 },
    "tokyo": { "main": { "src": "/_portal/illust-map/g-tokyo.webp", "bounds": [ [ 35.46067, 139.04297 ], [ 35.88905, 140.09766 ] ], "kb": 171 }, "zi": 10.75 },
  },
  h: {
    "fukuoka": { "main": { "src": "/_portal/illust-map/h-fukuoka.webp", "bounds": [ [ 32.54681, 129.375 ], [ 34.88593, 132.1875 ] ], "kb": 125 }, "zi": 9 },
    "hyogo": { "main": { "src": "/_portal/illust-map/h-hyogo.webp", "bounds": [ [ 34.30714, 134.29688 ], [ 35.46067, 136.05469 ] ], "kb": 257 }, "zi": 10.75 },
    "kyoto": { "main": { "src": "/_portal/illust-map/h-kyoto.webp", "bounds": [ [ 34.59704, 135.35156 ], [ 35.31737, 136.05469 ] ], "kb": 251 }, "zi": 11.5 },
    "nagoya": { "main": { "src": "/_portal/illust-map/h-nagoya.webp", "bounds": [ [ 34.30714, 136.05469 ], [ 35.74651, 138.16406 ] ], "kb": 179 }, "zi": 9.5 },
    "osaka": { "main": { "src": "/_portal/illust-map/h-osaka.webp", "bounds": [ [ 34.01624, 134.64844 ], [ 35.46067, 136.40625 ] ], "kb": 254 }, "zi": 10 },
    "tokyo": { "main": { "src": "/_portal/illust-map/h-tokyo.webp", "bounds": [ [ 35.17381, 138.86719 ], [ 36.03133, 140.27344 ] ], "kb": 258 }, "zi": 10.75 },
  },
};

/** 全国の地図（描き方ごと。f・g・h が無いときは e） */
export const ILLUST_JAPAN: Partial<Record<IllustStyle, IllustLayer>> & { e: IllustLayer } = { "f": { "src": "/_portal/illust-map/f-japan.webp", "bounds": [ [ 16.63619, 112.5 ], [ 48.9225, 163.125 ] ] }, "g": { "src": "/_portal/illust-map/g-japan.webp", "bounds": [ [ 16.63619, 112.5 ], [ 48.9225, 163.125 ] ] }, "h": { "src": "/_portal/illust-map/h-japan.webp", "bounds": [ [ 16.63619, 112.5 ], [ 48.9225, 163.125 ] ] }, "e": { "src": "/_portal/illust-map/e-japan.webp", "bounds": [ [ 16.63619, 112.5 ], [ 48.9225, 163.125 ] ] } };
