// 手描き風の木と建物の小さな絵（SVG の <symbol>）。どの町でも使える一般的な形だけ（実在の塔・名所は描かない）。
// 原点（0,0）が根元（木）・足元（建物）。大きさは 1 単位 = 1px（描くときに scale で大きさを替える）。
// 線は細いインク色、色は淡い水彩のにじみ。

const INK = "#4a5a52";
const TRUNK = "#5b4a3c";

/** 木: 幹と枝が葉のかたまりの中に透けて見える。かたまりは、丸い葉の房を 4〜5 個重ねたもの（房ごとに色を少し替え、細いインクの輪郭と、明るい部分・影を水彩のように） */
function tree(id, { h = 38, w = 30, c1, c2, c3, seed = 1 }) {
  const rx = w / 2;
  const base = -h * 0.42; // 葉のかたまりの中心の高さ
  // 房: [中心 x, 中心 y, 半径]
  const lobes = [
    [-rx * 0.42, base + h * 0.04, rx * 0.58],
    [rx * 0.44, base + h * 0.02, rx * 0.6],
    [0, base - h * 0.22, rx * 0.62],
    [-rx * 0.1, base + h * 0.1, rx * 0.5],
    [rx * 0.05, base - h * 0.02, rx * 0.46],
  ].map(([x, y, r], i) => [x + Math.sin(seed * 3 + i) * 0.8, y + Math.cos(seed * 5 + i) * 0.8, r * (0.94 + 0.1 * Math.sin(seed + i * 2))]);
  const tones = [c1, c2, c1, c3, c2];
  const lobeSvg = lobes.map(([x, y, r], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${tones[i]}" stroke="${INK}" stroke-width=".55"/>`).join("");
  const light = lobes.slice(0, 3).map(([x, y, r]) => `<path d="M${(x - r * 0.62).toFixed(1)} ${(y - r * 0.1).toFixed(1)}A${(r * 0.7).toFixed(1)} ${(r * 0.7).toFixed(1)} 0 0 1 ${(x + r * 0.2).toFixed(1)} ${(y - r * 0.68).toFixed(1)}" fill="none" stroke="#fffbe8" stroke-width="${(r * 0.22).toFixed(1)}" stroke-linecap="round" opacity=".55"/>`).join("");
  const shade = lobes.slice(1, 4).map(([x, y, r]) => `<path d="M${(x + r * 0.2).toFixed(1)} ${(y + r * 0.72).toFixed(1)}A${(r * 0.8).toFixed(1)} ${(r * 0.8).toFixed(1)} 0 0 0 ${(x + r * 0.72).toFixed(1)} ${(y - r * 0.1).toFixed(1)}" fill="none" stroke="${c3}" stroke-width="${(r * 0.3).toFixed(1)}" stroke-linecap="round" opacity=".5"/>`).join("");
  const top = base - h * 0.2;
  return `<symbol id="${id}" overflow="visible">
<ellipse cx="2" cy="1" rx="${(rx * 0.85).toFixed(1)}" ry="2.6" fill="#7a6e4a" opacity=".2"/>
<path d="M-1.1 0Q-.7 ${(-h * 0.2).toFixed(1)} -.9 ${(base + 2).toFixed(1)}L1.3 ${(base + 2).toFixed(1)}Q.9 ${(-h * 0.2).toFixed(1)} 1.1 0Z" fill="${TRUNK}" stroke="${INK}" stroke-width=".4"/>
${lobeSvg}${shade}${light}
<path d="M0 ${(base + 3).toFixed(1)}L${(-rx * 0.34).toFixed(1)} ${(base - 3).toFixed(1)}M0 ${(base + 1).toFixed(1)}L${(rx * 0.3).toFixed(1)} ${(base - 4).toFixed(1)}M0 ${(base - 2).toFixed(1)}L${(rx * 0.05).toFixed(1)} ${top.toFixed(1)}" stroke="${TRUNK}" stroke-width=".8" fill="none" stroke-linecap="round" opacity=".6"/>
</symbol>`;
}

/** 細長い木（ポプラ風）とふたこぶの木 */
function slim(id, { c1, c2 }) {
  return `<symbol id="${id}" overflow="visible">
<path d="M-.7 0L-.5 -14L.8 -14L.8 0Z" fill="${TRUNK}" opacity=".85"/>
<path d="M0 -44C-9 -38 -10 -22 -7 -14C-3 -10 3 -10 7 -14C10 -22 9 -38 0 -44Z" fill="${c1}" stroke="${INK}" stroke-width=".55" stroke-linejoin="round"/>
<path d="M-3 -38C-7 -32 -6 -24 -4 -20C-1 -26 -1 -32 -3 -38Z" fill="${c2}" opacity=".85"/>
<path d="M0 -14L-4 -24M0 -16L4 -26M0 -22L0 -36" stroke="${TRUNK}" stroke-width=".6" fill="none" opacity=".7"/>
</symbol>`;
}

/** 小さな家: 切妻の屋根・壁・窓・戸 */
function house(id, { roof, wall, w = 22, h = 14, door = "#b9855a", stories = 1 }) {
  const rh = 9;
  const H = h * stories;
  const wins = [];
  for (let s = 0; s < stories; s++) for (let i = 0; i < 2; i++) wins.push(`<rect x="${(-w * 0.32 + i * w * 0.42).toFixed(1)}" y="${(-H + 3 + s * h).toFixed(1)}" width="${(w * 0.2).toFixed(1)}" height="4" fill="#cfe3ea" stroke="${INK}" stroke-width=".4"/>`);
  return `<symbol id="${id}" overflow="visible">
<ellipse cx="3" cy="1" rx="${(w * 0.62).toFixed(1)}" ry="2.8" fill="#7a6e4a" opacity=".22"/>
<path d="M${-w / 2} 0V${-H}H${w / 2}V0Z" fill="${wall}" stroke="${INK}" stroke-width=".55" stroke-linejoin="round"/>
<path d="M${-w / 2 - 2} ${-H}L0 ${-H - rh}L${w / 2 + 2} ${-H}Z" fill="${roof}" stroke="${INK}" stroke-width=".55" stroke-linejoin="round"/>
<path d="M${-w / 2 + 2} ${-H - 1.5}L0 ${-H - rh + 1.5}" stroke="#fff" stroke-width=".7" opacity=".5" fill="none"/>
${wins.join("")}
<rect x="${(w * 0.12).toFixed(1)}" y="-7" width="${(w * 0.2).toFixed(1)}" height="7" fill="${door}" stroke="${INK}" stroke-width=".4"/>
</symbol>`;
}

/** 小さな店: ひさし（縞）・大きな窓 */
function shop(id, { awn1, awn2, wall, w = 24 }) {
  const stripes = [];
  const n = 6;
  for (let i = 0; i < n; i++) stripes.push(`<path d="M${(-w / 2 + (i * w) / n).toFixed(1)} -14h${(w / n).toFixed(1)}l${(i % 2 ? 1.2 : -1.2).toFixed(1)} 5h${(-w / n).toFixed(1)}z" fill="${i % 2 ? awn1 : awn2}"/>`);
  return `<symbol id="${id}" overflow="visible">
<ellipse cx="3" cy="1" rx="${(w * 0.62).toFixed(1)}" ry="2.8" fill="#7a6e4a" opacity=".22"/>
<path d="M${-w / 2} 0V-20H${w / 2}V0Z" fill="${wall}" stroke="${INK}" stroke-width=".55" stroke-linejoin="round"/>
<path d="M${-w / 2 - 1} -20L${-w / 2 + 2} -25H${w / 2 - 2}L${w / 2 + 1} -20Z" fill="#c9bfa8" stroke="${INK}" stroke-width=".5" stroke-linejoin="round"/>
${stripes.join("")}
<rect x="${(-w * 0.38).toFixed(1)}" y="-8.5" width="${(w * 0.52).toFixed(1)}" height="8" fill="#e9f1f0" stroke="${INK}" stroke-width=".45"/>
<rect x="${(w * 0.22).toFixed(1)}" y="-9" width="${(w * 0.16).toFixed(1)}" height="9" fill="#a9825e" stroke="${INK}" stroke-width=".4"/>
</symbol>`;
}

/** 低いビル（街の建物の一般的な形）: 窓の格子 */
function block(id, { wall, roof, w = 18, h = 30 }) {
  const win = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) win.push(`<rect x="${(-w / 2 + 2 + c * ((w - 4) / 3)).toFixed(1)}" y="${(-h + 4 + r * ((h - 6) / 4)).toFixed(1)}" width="${((w - 4) / 3 - 1.4).toFixed(1)}" height="${((h - 6) / 4 - 2).toFixed(1)}" fill="#d9e6ea" stroke="${INK}" stroke-width=".3"/>`);
  return `<symbol id="${id}" overflow="visible">
<ellipse cx="3" cy="1" rx="${(w * 0.62).toFixed(1)}" ry="2.8" fill="#7a6e4a" opacity=".22"/>
<path d="M${-w / 2} 0V${-h}H${w / 2}V0Z" fill="${wall}" stroke="${INK}" stroke-width=".55" stroke-linejoin="round"/>
<path d="M${-w / 2 - 1} ${-h}H${w / 2 + 1}V${-h - 3}H${-w / 2 - 1}Z" fill="${roof}" stroke="${INK}" stroke-width=".5" stroke-linejoin="round"/>
${win.join("")}
</symbol>`;
}


/** 小さな舟（帆かけ舟）: 水の上のあしらい */
function boat(id, { sail = "#fffdf4", hull = "#6d86ad" }) {
  return `<symbol id="${id}" overflow="visible">
<path d="M-12 0Q0 6 12 0L9 -4H-9Z" fill="${hull}" stroke="${INK}" stroke-width=".5" stroke-linejoin="round"/>
<path d="M0 -4V-26" stroke="${INK}" stroke-width=".7"/>
<path d="M1.5 -25Q10 -14 9 -6H1.5Z" fill="${sail}" stroke="${INK}" stroke-width=".5" stroke-linejoin="round"/>
<path d="M-1.5 -22Q-8 -13 -8 -6H-1.5Z" fill="${sail}" stroke="${INK}" stroke-width=".5" stroke-linejoin="round" opacity=".95"/>
<path d="M-14 3q3-2 6 0t6 0t6 0t6 0t6 0" stroke="#fff" stroke-width=".8" fill="none" opacity=".9"/>
</symbol>`;
}

export const TREE_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "s1", "s2"];
export const BOAT_IDS = ["w1", "w2"];
export const HOUSE_IDS = ["h1", "h2", "h3", "h4", "k1", "k2", "b1", "b2"];

export function symbolDefs(used) {
  const all = [
    tree("t1", { h: 40, w: 32, c1: "#a9c9a0", c2: "#cfe3bf", c3: "#6f9c7c", seed: 1 }),
    tree("t2", { h: 36, w: 30, c1: "#b8d49a", c2: "#dcebb4", c3: "#82a866", seed: 2 }),
    tree("t3", { h: 42, w: 34, c1: "#9fc4b4", c2: "#c8e0d2", c3: "#5f8f82", seed: 3 }),
    tree("t4", { h: 32, w: 26, c1: "#e6d98e", c2: "#f4ecbc", c3: "#b9a85a", seed: 4 }),
    tree("t5", { h: 38, w: 30, c1: "#8fb98f", c2: "#bdd9b0", c3: "#547f5f", seed: 5 }),
    tree("t6", { h: 34, w: 32, c1: "#a8cfa0", c2: "#d2e8c4", c3: "#6e9a78", seed: 6 }),
    slim("s1", { c1: "#9cc2a6", c2: "#c9e0cb" }),
    slim("s2", { c1: "#b9d69a", c2: "#dcecb8" }),
    house("h1", { roof: "#d98f6a", wall: "#f6efdc" }),
    house("h2", { roof: "#7f93b3", wall: "#f4f1e6", w: 24 }),
    house("h3", { roof: "#c9a36c", wall: "#f8f1df", w: 20, stories: 2 }),
    house("h4", { roof: "#9fb59a", wall: "#f3eddb", w: 22 }),
    shop("k1", { awn1: "#e2905a", awn2: "#fbf3e0", wall: "#f5efdd" }),
    shop("k2", { awn1: "#4f6c9c", awn2: "#fbf3e0", wall: "#f3ecd8", w: 22 }),
    boat("w1", { hull: "#6d86ad" }),
    boat("w2", { hull: "#d98f6a" }),
    block("b1", { wall: "#f1ead6", roof: "#c7bba3" }),
    block("b2", { wall: "#eadfc8", roof: "#b9b09b", w: 16, h: 36 }),
  ];
  // 使われている記号だけを返す（ファイルを小さくするため）
  return all.filter((x) => !used || used.has(x.match(/id="([a-z]\d)"/)[1])).join("\n");
}
