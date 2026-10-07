/**
 * 「三つの輪 MITSUWA」の配色（見比べ用）。色の値は、このファイルにだけ書く（CSS 変数は themeStyle() がここから作る。
 * 輪の描き方が変わっても（CSS 3D でも WebGL でも）、同じ値を使えるように、輪の色は themeRings() でも取れる）。
 * 1 つの世界として組む: 地・3 本の輪（表と裏・字・縁）・見出しとふち取り・札（塗り・線・字・乗せたとき）・下のブロック・入るときの幕。
 * ki が、いまの黄と黒（`/proto-hub/mitsuwa`）。ほかは `/proto-hub/mitsuwa/<名前>`。輪は「ひと／みせ／まち」の順。
 */
export const THEMES = [
  { key: "ki", label: "黄と黒（いまの色）" },
  { key: "kurokin", label: "黒と金" },
  { key: "iki", label: "藍・白・朱" },
  { key: "kissa", label: "深緑・クリーム・橙" },
  { key: "wine", label: "ワイン・薔薇色・金" },
  { key: "shiro", label: "白と三原色" },
] as const;

export type ThemeKey = (typeof THEMES)[number]["key"];
export const THEME_KEYS: ThemeKey[] = THEMES.map((t) => t.key);
export const isThemeKey = (s: string): s is ThemeKey => (THEME_KEYS as string[]).includes(s);
export const themeLabel = (k: ThemeKey) => THEMES.find((t) => t.key === k)?.label ?? k;
/** 色の URL。ki は、いまのまま `/proto-hub/mitsuwa` */
export const themePath = (k: ThemeKey) => (k === "ki" ? "/proto-hub/mitsuwa" : `/proto-hub/mitsuwa/${k}`);

export interface RingColors {
  /** 帯（表）・字・縁の線・奥に見える面（裏）とその鏡文字の色・陰に重ねる色 */
  band: string;
  ink: string;
  edge: string;
  bandb: string;
  inkb: string;
  shc: string;
  /** 陰の付け方: true = 明るくする（暗い帯）、false = 暗くする（明るい帯）。max は濃さの上限 */
  lighten: boolean;
  max: number;
}

export interface Theme {
  /** 地（外側・中心の明るい側・縁） */
  bg: string;
  bgL: string;
  bgD: string;
  /** 見出し・ロゴ・リードの色、見出しのふち取り（輪の上で字を浮かせる。地と同じ色にする） */
  ink: string;
  halo: string;
  /** 線（さがす・準備中の太枠・括りの線・つかむ目印）と、乗せたときの塗りとその上の字 */
  acc: string;
  accH: string;
  accHon: string;
  focus: string;
  /** 入るときの幕 */
  veil: string;
  /** 輪の足もとの影（r,g,b と濃さ） */
  shadow: string;
  shadowA: number;
  rings: [RingColors, RingColors, RingColors];
  /** 掲載中の札: 塗り・字と印・数字・単位・小さい字・乗せたときの塗りと字 */
  live: { bg: string; on: string; fig: string; em: string; sub: string; h: string; hon: string };
  /** 入れない札の破線とその字 */
  waitLine: string;
  waitInk: string;
  /** 下のブロック: 地・字・3 語を囲む輪／行頭の輪の色・結びの板（地・字 1 行目・字 2 行目・飾りの輪） */
  st: { bg: string; ink: string; w: [string, string, string]; p4bg: string; p4ink: string; p4ink2: string; p4ring: string };
  /** 色見本の丸の中の点 */
  dot: string;
}

const KI: Theme = {
  bg: "#FFD400",
  bgL: "#FFE65C",
  bgD: "#F2C000",
  ink: "#14110A",
  halo: "#FFD400",
  acc: "#14110A",
  accH: "#14110A",
  accHon: "#FFD400",
  focus: "#14110A",
  veil: "#14110A",
  shadow: "120,78,0",
  shadowA: 0.3,
  rings: [
    { band: "#14110A", ink: "#FFD400", edge: "#FFD400", bandb: "#C99F00", inkb: "#A98600", shc: "#FFFFFF", lighten: true, max: 0.05 },
    { band: "#FFFDF4", ink: "#14110A", edge: "#14110A", bandb: "#FFF0A6", inkb: "#E5CB5C", shc: "#4A3300", lighten: false, max: 0.32 },
    { band: "#EA3A1B", ink: "#FFFDF4", edge: "#FFFDF4", bandb: "#F28A66", inkb: "#D95B38", shc: "#4D0D00", lighten: false, max: 0.36 },
  ],
  live: { bg: "#14110A", on: "#FFD400", fig: "#FFD400", em: "#FFFDF4", sub: "rgba(255,253,244,.84)", h: "#C92E10", hon: "#FFFDF4" },
  waitLine: "rgba(20,17,10,.72)",
  waitInk: "rgba(20,17,10,.72)",
  st: { bg: "#FFD400", ink: "#14110A", w: ["#14110A", "#FFFDF4", "#EA3A1B"], p4bg: "#14110A", p4ink: "#FFD400", p4ink2: "#FFFDF4", p4ring: "#EA3A1B" },
  dot: "#14110A",
};

const THEME: Record<ThemeKey, Theme> = {
  ki: KI,
  /* 黒と金: 高級感。黒い地に、金・象牙・深紅の帯。見出しは象牙 */
  kurokin: {
    bg: "#100E0B",
    bgL: "#2A2013",
    bgD: "#0A0907",
    ink: "#F1E7D2",
    halo: "#100E0B",
    acc: "#C9A24A",
    accH: "#F1E7D2",
    accHon: "#100E0B",
    focus: "#F1E7D2",
    veil: "#0A0907",
    shadow: "0,0,0",
    shadowA: 0.55,
    rings: [
      { band: "#C9A24A", ink: "#100E0B", edge: "#100E0B", bandb: "#7A6532", inkb: "#5A4824", shc: "#2A1D05", lighten: false, max: 0.3 },
      { band: "#F1E7D2", ink: "#100E0B", edge: "#100E0B", bandb: "#9A927C", inkb: "#766E5A", shc: "#4A3B1C", lighten: false, max: 0.3 },
      { band: "#8E1B24", ink: "#F1E7D2", edge: "#F1E7D2", bandb: "#702830", inkb: "#4F171C", shc: "#FFE3D6", lighten: true, max: 0.14 },
    ],
    live: { bg: "#C9A24A", on: "#100E0B", fig: "#100E0B", em: "#100E0B", sub: "rgba(16,14,11,.88)", h: "#F1E7D2", hon: "#100E0B" },
    waitLine: "#8C8578",
    waitInk: "#B3AB9B",
    st: { bg: "#100E0B", ink: "#F1E7D2", w: ["#C9A24A", "#F1E7D2", "#C4343F"], p4bg: "#C9A24A", p4ink: "#100E0B", p4ink2: "#5A0F18", p4ring: "#8E1B24" },
    dot: "#C9A24A",
  },
  /* 藍・白・朱: 粋。暖簾や祭りの色。藍の地に、白・朱・山吹の帯。見出しは白 */
  iki: {
    bg: "#16245C",
    bgL: "#22358A",
    bgD: "#0F1A47",
    ink: "#FFFFFF",
    halo: "#16245C",
    acc: "#FFFFFF",
    accH: "#FFFFFF",
    accHon: "#16245C",
    focus: "#FFFFFF",
    veil: "#0F1A47",
    shadow: "4,8,36",
    shadowA: 0.5,
    rings: [
      { band: "#FFFFFF", ink: "#16245C", edge: "#16245C", bandb: "#A6B1E4", inkb: "#7C8ACF", shc: "#0B1440", lighten: false, max: 0.3 },
      { band: "#F0562F", ink: "#FFFFFF", edge: "#FFFFFF", bandb: "#F39577", inkb: "#DB6040", shc: "#4A0F00", lighten: false, max: 0.34 },
      { band: "#F4B62A", ink: "#16245C", edge: "#16245C", bandb: "#F7D27A", inkb: "#DFA83A", shc: "#4A3200", lighten: false, max: 0.3 },
    ],
    live: { bg: "#F4B62A", on: "#16245C", fig: "#16245C", em: "#16245C", sub: "rgba(22,36,92,.9)", h: "#FFFFFF", hon: "#16245C" },
    waitLine: "#97A1D2",
    waitInk: "#C9D0EE",
    st: { bg: "#16245C", ink: "#FFFFFF", w: ["#FFFFFF", "#F0562F", "#F4B62A"], p4bg: "#FFFFFF", p4ink: "#16245C", p4ink2: "#C7351A", p4ring: "#F4B62A" },
    dot: "#F0562F",
  },
  /* 深緑・クリーム・橙: レトロな喫茶。深い緑の地に、クリーム・橙・からしの帯。見出しはクリーム */
  kissa: {
    bg: "#0F3F30",
    bgL: "#1B5A45",
    bgD: "#0A2F23",
    ink: "#F4E9C9",
    halo: "#0F3F30",
    acc: "#F4E9C9",
    accH: "#F4E9C9",
    accHon: "#0F3F30",
    focus: "#F4E9C9",
    veil: "#0A2F23",
    shadow: "2,20,14",
    shadowA: 0.5,
    rings: [
      { band: "#F4E9C9", ink: "#0F3F30", edge: "#0F3F30", bandb: "#9DB08E", inkb: "#6E8863", shc: "#0A2A1E", lighten: false, max: 0.3 },
      { band: "#F0852A", ink: "#0F3F30", edge: "#0F3F30", bandb: "#F4AD72", inkb: "#D9823A", shc: "#3D1A00", lighten: false, max: 0.32 },
      { band: "#E0B030", ink: "#0F3F30", edge: "#0F3F30", bandb: "#F1D37A", inkb: "#C9A232", shc: "#3A2A00", lighten: false, max: 0.3 },
    ],
    live: { bg: "#F4E9C9", on: "#0F3F30", fig: "#0F3F30", em: "#0F3F30", sub: "rgba(15,63,48,.9)", h: "#F4B35E", hon: "#0F3F30" },
    waitLine: "#8FA894",
    waitInk: "#C5D2BE",
    st: { bg: "#0F3F30", ink: "#F4E9C9", w: ["#F4E9C9", "#F0852A", "#E0B030"], p4bg: "#F4E9C9", p4ink: "#0F3F30", p4ink2: "#B8530C", p4ring: "#F0852A" },
    dot: "#F0852A",
  },
  /* ワイン・薔薇色・金: 艶のある大人の夜。深いワインの地に、金・薔薇色・黒の帯。見出しは象牙。赤でも暗く深く */
  wine: {
    bg: "#4B0D22",
    bgL: "#6E1838",
    bgD: "#33081A",
    ink: "#F6EAD8",
    halo: "#4B0D22",
    acc: "#D3AC62",
    accH: "#D3AC62",
    accHon: "#4B0D22",
    focus: "#F6EAD8",
    veil: "#2A0615",
    shadow: "18,0,8",
    shadowA: 0.5,
    rings: [
      { band: "#D3AC62", ink: "#4B0D22", edge: "#4B0D22", bandb: "#A8854F", inkb: "#7F6038", shc: "#2E1A00", lighten: false, max: 0.3 },
      { band: "#F0C2BB", ink: "#4B0D22", edge: "#4B0D22", bandb: "#B68385", inkb: "#8D5A62", shc: "#4A1022", lighten: false, max: 0.3 },
      { band: "#150A0D", ink: "#D3AC62", edge: "#D3AC62", bandb: "#7A4A52", inkb: "#5E3138", shc: "#FFFFFF", lighten: true, max: 0.07 },
    ],
    live: { bg: "#D3AC62", on: "#4B0D22", fig: "#4B0D22", em: "#4B0D22", sub: "rgba(75,13,34,.9)", h: "#F0C2BB", hon: "#4B0D22" },
    waitLine: "#A8828E",
    waitInk: "#E0C6C0",
    st: { bg: "#4B0D22", ink: "#F6EAD8", w: ["#D3AC62", "#F0C2BB", "#F6EAD8"], p4bg: "#D3AC62", p4ink: "#4B0D22", p4ink2: "#8A1F3D", p4ring: "#F0C2BB" },
    dot: "#D3AC62",
  },
  /* 白と三原色: 明るくモダン。白い地に、赤・青・黄の帯。見出しは黒 */
  shiro: {
    bg: "#F7F7F5",
    bgL: "#FFFFFF",
    bgD: "#ECECE8",
    ink: "#111111",
    halo: "#F7F7F5",
    acc: "#111111",
    accH: "#111111",
    accHon: "#FFFFFF",
    focus: "#1A3FD0",
    veil: "#111111",
    shadow: "0,0,0",
    shadowA: 0.16,
    rings: [
      { band: "#E5261F", ink: "#FFFFFF", edge: "#FFFFFF", bandb: "#F2A09B", inkb: "#E0716B", shc: "#4D0A06", lighten: false, max: 0.36 },
      { band: "#1A3FD0", ink: "#FFFFFF", edge: "#FFFFFF", bandb: "#9FB0EE", inkb: "#6F86D8", shc: "#050F3F", lighten: false, max: 0.34 },
      { band: "#FFCF00", ink: "#111111", edge: "#111111", bandb: "#FFE98A", inkb: "#E6C400", shc: "#4D3E00", lighten: false, max: 0.3 },
    ],
    live: { bg: "#1A3FD0", on: "#FFFFFF", fig: "#FFCF00", em: "#FFFFFF", sub: "#FFFFFF", h: "#E5261F", hon: "#FFFFFF" },
    waitLine: "#6E6E6C",
    waitInk: "#595957",
    st: { bg: "#F7F7F5", ink: "#111111", w: ["#E5261F", "#1A3FD0", "#111111"], p4bg: "#111111", p4ink: "#FFCF00", p4ink2: "#FFFFFF", p4ring: "#E5261F" },
    dot: "#E5261F",
  },
};

export const themeData = (k: ThemeKey): Theme => THEME[k];

/** 輪の色（CSS 3D でも WebGL でも同じ値を使う） */
export const themeRings = (k: ThemeKey): Theme["rings"] => THEME[k].rings;

/** CSS 変数（--mt-*）。ページの外側の要素に style で付ける。値はここだけにある */
export function themeStyle(k: ThemeKey): Record<string, string> {
  const t = THEME[k];
  const v: Record<string, string> = {
    "--mt-bg": t.bg,
    "--mt-bg-l": t.bgL,
    "--mt-bg-d": t.bgD,
    "--mt-ink": t.ink,
    "--mt-halo": t.halo,
    "--mt-acc": t.acc,
    "--mt-acc-h": t.accH,
    "--mt-acc-hon": t.accHon,
    "--mt-focus": t.focus,
    "--mt-veil": t.veil,
    "--mt-sh0": `rgba(${t.shadow},${t.shadowA})`,
    "--mt-sh1": `rgba(${t.shadow},${(t.shadowA * 0.4).toFixed(3)})`,
    "--mt-sh2": `rgba(${t.shadow},0)`,
    "--mt-live": t.live.bg,
    "--mt-live-on": t.live.on,
    "--mt-live-fig": t.live.fig,
    "--mt-live-em": t.live.em,
    "--mt-live-sub": t.live.sub,
    "--mt-live-h": t.live.h,
    "--mt-live-hon": t.live.hon,
    "--mt-wait-line": t.waitLine,
    "--mt-wait-ink": t.waitInk,
    "--mt-st-bg": t.st.bg,
    "--mt-st-ink": t.st.ink,
    "--mt-st-w0": t.st.w[0],
    "--mt-st-w1": t.st.w[1],
    "--mt-st-w2": t.st.w[2],
    "--mt-p4-bg": t.st.p4bg,
    "--mt-p4-ink": t.st.p4ink,
    "--mt-p4-ink2": t.st.p4ink2,
    "--mt-p4-ring": t.st.p4ring,
  };
  t.rings.forEach((r, i) => {
    v[`--mt-r${i}-band`] = r.band;
    v[`--mt-r${i}-ink`] = r.ink;
    v[`--mt-r${i}-edge`] = r.edge;
    v[`--mt-r${i}-bandb`] = r.bandb;
    v[`--mt-r${i}-inkb`] = r.inkb;
    v[`--mt-r${i}-shc`] = r.shc;
  });
  return v;
}
