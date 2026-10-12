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
    "akita": { "zi": 12.75, "main": { "src": "/_portal/illust-map/akita.svg", "bounds": [ [ 39.67337, 140.00977 ], [ 39.77477, 140.22949 ] ] } },
    "aomori": { "zi": 9.75, "main": { "src": "/_portal/illust-map/aomori.svg", "bounds": [ [ 40.17887, 139.92188 ], [ 40.9799, 142.03125 ] ] } },
    "ehime": { "zi": 11, "main": { "src": "/_portal/illust-map/ehime.svg", "bounds": [ [ 33.87042, 132.71484 ], [ 34.30714, 133.59375 ] ] } },
    "fukui": { "zi": 9.25, "main": { "src": "/_portal/illust-map/fukui.svg", "bounds": [ [ 35.74651, 135.35156 ], [ 36.87962, 137.8125 ] ] } },
    "fukuoka": { "zi": 10, "main": { "src": "/_portal/illust-map/fukuoka.svg", "bounds": [ [ 32.84267, 129.72656 ], [ 34.01624, 131.48438 ] ] } },
    "fukushima": { "zi": 10, "main": { "src": "/_portal/illust-map/fukushima.svg", "bounds": [ [ 37.16032, 139.57031 ], [ 37.99616, 141.32813 ] ] } },
    "gifu": { "zi": 8.5, "main": { "src": "/_portal/illust-map/gifu.svg", "bounds": [ [ 34.88593, 135 ], [ 36.59789, 139.21875 ] ] } },
    "gunma": { "zi": 11, "main": { "src": "/_portal/illust-map/gunma.svg", "bounds": [ [ 36.17336, 138.86719 ], [ 36.59789, 139.57031 ] ] }, "core": { "src": "/_portal/illust-map/gunma-core.svg", "bounds": [ [ 36.17336, 138.86719 ], [ 36.52729, 139.57031 ] ] } },
    "hiroshima": { "zi": 13.25, "main": { "src": "/_portal/illust-map/hiroshima.svg", "bounds": [ [ 34.01624, 131.83594 ], [ 34.59704, 133.59375 ] ] }, "core": { "src": "/_portal/illust-map/hiroshima-core.svg", "bounds": [ [ 34.34344, 132.40723 ], [ 34.41597, 132.58301 ] ] } },
    "hokkaido": { "zi": 8, "main": { "src": "/_portal/illust-map/hokkaido.svg", "bounds": [ [ 42.03297, 139.21875 ], [ 45.08904, 146.25 ] ] } },
    "hyogo": { "main": { "src": "/_portal/illust-map/e-hyogo.webp", "bounds": [ [ 34.45222, 134.64844 ], [ 35.03, 135.70313 ] ], "kb": 253 }, "zi": 10.75 },
    "ibaraki": { "zi": 9, "main": { "src": "/_portal/illust-map/ibaraki.svg", "bounds": [ [ 35.46067, 138.51563 ], [ 37.16032, 142.03125 ] ] } },
    "ishikawa": { "zi": 11, "main": { "src": "/_portal/illust-map/ishikawa.svg", "bounds": [ [ 36.31513, 136.05469 ], [ 36.73888, 136.93359 ] ] } },
    "iwate": { "zi": 10.5, "main": { "src": "/_portal/illust-map/iwate.svg", "bounds": [ [ 38.82259, 140.625 ], [ 39.36828, 141.67969 ] ] } },
    "kagawa": { "zi": 11.75, "main": { "src": "/_portal/illust-map/kagawa.svg", "bounds": [ [ 34.16182, 133.68164 ], [ 34.45222, 134.12109 ] ] } },
    "kagoshima": { "zi": 11, "main": { "src": "/_portal/illust-map/kagoshima.svg", "bounds": [ [ 31.65338, 130.42969 ], [ 32.10119, 131.30859 ] ] } },
    "kanagawa": { "zi": 11.25, "main": { "src": "/_portal/illust-map/kanagawa.svg", "bounds": [ [ 35.17381, 139.04297 ], [ 35.74651, 139.74609 ] ] }, "core": { "src": "/_portal/illust-map/kanagawa-core.svg", "bounds": [ [ 35.24562, 139.13086 ], [ 35.53223, 139.74609 ] ] } },
    "kochi": { "zi": 13.75, "main": { "src": "/_portal/illust-map/kochi.svg", "bounds": [ [ 33.50476, 133.50586 ], [ 33.61462, 133.6377 ] ] } },
    "kyoto": { "zi": 12.25, "main": { "src": "/_portal/illust-map/kyoto.svg", "bounds": [ [ 34.8138, 135.52734 ], [ 35.10193, 135.9668 ] ] }, "core": { "src": "/_portal/illust-map/kyoto-core.svg", "bounds": [ [ 34.92197, 135.57129 ], [ 35.10193, 135.87891 ] ] } },
    "mie": { "zi": 11, "main": { "src": "/_portal/illust-map/mie.svg", "bounds": [ [ 34.30714, 136.23047 ], [ 35.31737, 137.10938 ] ] }, "core": { "src": "/_portal/illust-map/mie-core.svg", "bounds": [ [ 34.8138, 136.31836 ], [ 35.17381, 137.02148 ] ] } },
    "miyazaki": { "zi": 11.75, "main": { "src": "/_portal/illust-map/miyazaki.svg", "bounds": [ [ 32.4727, 131.48438 ], [ 32.7688, 131.92383 ] ] } },
    "nagano": { "zi": 8, "main": { "src": "/_portal/illust-map/nagano.svg", "bounds": [ [ 34.30714, 135 ], [ 37.71859, 142.03125 ] ] } },
    "nagasaki": { "zi": 11.75, "main": { "src": "/_portal/illust-map/nagasaki.svg", "bounds": [ [ 32.69487, 129.81445 ], [ 32.91649, 130.25391 ] ] } },
    "nagoya": { "zi": 11.5, "main": { "src": "/_portal/illust-map/nagoya.svg", "bounds": [ [ 34.59704, 136.58203 ], [ 35.46067, 137.63672 ] ] }, "core": { "src": "/_portal/illust-map/nagoya-core.svg", "bounds": [ [ 35.03, 136.66992 ], [ 35.31737, 137.19727 ] ] } },
    "nara": { "zi": 10, "main": { "src": "/_portal/illust-map/nara.svg", "bounds": [ [ 34.30714, 135 ], [ 35.17381, 136.75781 ] ] } },
    "niigata": { "zi": 13.75, "main": { "src": "/_portal/illust-map/niigata.svg", "bounds": [ [ 37.12529, 138.16406 ], [ 37.23033, 138.2959 ] ] } },
    "okayama": { "zi": 13.75, "main": { "src": "/_portal/illust-map/okayama.svg", "bounds": [ [ 34.56086, 133.68164 ], [ 34.63321, 133.81348 ] ] } },
    "okinawa": { "zi": 13, "main": { "src": "/_portal/illust-map/okinawa.svg", "bounds": [ [ 26.31311, 127.74902 ], [ 26.43123, 127.9248 ] ] } },
    "osaka": { "main": { "src": "/_portal/illust-map/e-osaka.webp", "bounds": [ [ 34.30714, 134.64844 ], [ 35.17381, 136.40625 ] ], "kb": 253 }, "zi": 10 },
    "saga": { "zi": 13, "main": { "src": "/_portal/illust-map/saga.svg", "bounds": [ [ 33.17434, 130.25391 ], [ 33.28462, 130.47363 ] ] } },
    "saitama": { "zi": 10.75, "main": { "src": "/_portal/illust-map/saitama.svg", "bounds": [ [ 35.60372, 139.04297 ], [ 36.31513, 140.09766 ] ] } },
    "shiga": { "zi": 9.5, "main": { "src": "/_portal/illust-map/shiga.svg", "bounds": [ [ 34.59704, 135 ], [ 35.74651, 137.10938 ] ] } },
    "shimane": { "zi": 11.75, "main": { "src": "/_portal/illust-map/shimane.svg", "bounds": [ [ 35.31737, 132.80273 ], [ 35.53223, 133.24219 ] ] } },
    "shizuoka": { "zi": 10.75, "main": { "src": "/_portal/illust-map/shizuoka.svg", "bounds": [ [ 34.59704, 137.46094 ], [ 35.46067, 139.57031 ] ] } },
    "tochigi": { "zi": 9.5, "main": { "src": "/_portal/illust-map/tochigi.svg", "bounds": [ [ 36.03133, 138.51563 ], [ 37.16032, 140.625 ] ] } },
    "tokyo": { "zi": 11, "main": { "src": "/_portal/illust-map/tokyo.svg", "bounds": [ [ 35.46067, 139.21875 ], [ 35.88905, 140.09766 ] ] }, "core": { "src": "/_portal/illust-map/tokyo-core.svg", "bounds": [ [ 35.46067, 139.39453 ], [ 35.81781, 140.09766 ] ] } },
    "tottori": { "zi": 13, "main": { "src": "/_portal/illust-map/tottori.svg", "bounds": [ [ 35.35322, 133.24219 ], [ 35.46067, 133.41797 ] ] } },
    "toyama": { "zi": 13, "main": { "src": "/_portal/illust-map/toyama.svg", "bounds": [ [ 36.63316, 137.10938 ], [ 36.73888, 137.3291 ] ] } },
    "wakayama": { "zi": 13, "main": { "src": "/_portal/illust-map/wakayama.svg", "bounds": [ [ 34.16182, 135.08789 ], [ 34.27084, 135.26367 ] ] } },
    "yamagata": { "zi": 13, "main": { "src": "/_portal/illust-map/yamagata.svg", "bounds": [ [ 38.16911, 140.22949 ], [ 38.30718, 140.40527 ] ] } },
    "yamaguchi": { "zi": 10.5, "main": { "src": "/_portal/illust-map/yamaguchi.svg", "bounds": [ [ 33.72434, 130.78125 ], [ 34.30714, 131.83594 ] ] } },
  },
  f: {
    "hyogo": { "main": { "src": "/_portal/illust-map/f-hyogo.webp", "bounds": [ [ 34.45222, 134.64844 ], [ 35.03, 135.70313 ] ], "kb": 244 }, "zi": 10.75 },
    "osaka": { "main": { "src": "/_portal/illust-map/f-osaka.webp", "bounds": [ [ 34.30714, 134.64844 ], [ 35.17381, 136.40625 ] ], "kb": 255 }, "zi": 10 },
  },
  g: {
    "hyogo": { "main": { "src": "/_portal/illust-map/g-hyogo.webp", "bounds": [ [ 34.45222, 134.64844 ], [ 35.03, 135.70313 ] ], "kb": 179 }, "zi": 10.75 },
    "osaka": { "main": { "src": "/_portal/illust-map/g-osaka.webp", "bounds": [ [ 34.30714, 134.64844 ], [ 35.17381, 136.40625 ] ], "kb": 177 }, "zi": 10 },
  },
  h: {
    "hyogo": { "main": { "src": "/_portal/illust-map/h-hyogo.webp", "bounds": [ [ 34.45222, 134.64844 ], [ 35.03, 135.70313 ] ], "kb": 156 }, "zi": 10.75 },
    "osaka": { "main": { "src": "/_portal/illust-map/h-osaka.webp", "bounds": [ [ 34.30714, 134.64844 ], [ 35.17381, 136.40625 ] ], "kb": 151 }, "zi": 10 },
  },
};

/** 全国の地図（描き方ごと。f・g・h が無いときは e） */
export const ILLUST_JAPAN: Partial<Record<IllustStyle, IllustLayer>> & { e: IllustLayer } = { "e": { "src": "/_portal/illust-map/japan.svg", "bounds": [ [ 16.63619, 112.5 ], [ 48.9225, 163.125 ] ] } };
