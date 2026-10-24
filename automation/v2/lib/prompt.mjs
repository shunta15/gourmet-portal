/**
 * automation/v2/lib/prompt.mjs — 1 店ぶんの指示文を作る(automation/v2/prompts/*.md の差し込み)
 * 元の指示文: automation/自動記事作成_生成プロンプト_最終版.md。直した点:
 *  - 削除済みの道具(sheets-mark-done / ledger-add など)・commit / push / デプロイ / シートへの書き込みの手順を外した
 *  - 出力は決まった JSON ファイル 1 つ。最後は COMPLETED / FAILED の 1 行
 *  - 「待つ」「聞く」「委譲」を禁止。店の特定は第1段の結果(店名・住所・電話・cid)を正とする
 *  - 文の決まり(2026-10-25 オーナー決定)を入れた
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { REPO, V2, abs, readJson } from "./util.mjs";

const tpl = (n) => readFileSync(path.join(V2, "prompts", n), "utf8");
const fill = (s, m) => s.replace(/\{\{([A-Z_]+)\}\}/g, (_, k) => (k in m ? String(m[k]) : `{{${k}}}`));

/** lib/verticals/<業種>.ts から、種類の slug と名前を読む */
export function categoriesOf(vEn) {
  const src = readFileSync(abs(`lib/verticals/${vEn}.ts`), "utf8");
  const out = [];
  for (const m of src.matchAll(/\{\s*slug:\s*'([^']+)',\s*name:\s*'([^']+)',\s*schemaType:/g)) out.push({ slug: m[1], name: m[2] });
  return out;
}

// build-places.mjs の ALLOWED_TAGS と同じ(ここを変えたら build-places.mjs も変える)
export const ALLOWED_TAGS = {
  beauty: ["当日予約可", "夜遅くまで営業", "個室あり", "メンズ歓迎", "子連れ可", "駅近"],
  bodycare: ["夜遅くまで営業", "土日営業", "予約なし可", "女性スタッフ", "駅近"],
  pet: [],
  stay: ["温泉", "ペット同伴", "一人旅", "記念日", "素泊まり"],
  activity: ["子連れ", "初心者歓迎", "手ぶらでOK", "雨の日", "駐車場あり"],
  sports: ["初心者歓迎", "体験あり", "24時間営業", "女性専用", "子ども向け"],
  life: ["体験あり", "子ども向け", "駅近", "駐車場あり", "予約制"],
};
/** 特集記事(店の特集)を持つ業種。ステイは店の記事だけ(features-stay.json は無い) */
export const HAS_FEATURE = new Set(["activity", "sports"]);

const EXAMPLE_ARTICLE = {
  stay: "lodging-8",
  beauty: "beauty-10",
  bodycare: "bodycare-9",
  pet: "pet-11",
  activity: "leisure-1251",
  sports: "sports-679",
  life: "life-85",
};
const EXAMPLE_FEATURE = { activity: "leisure-1251", sports: "sports-679" };

const SECTION_HINT = {
  stay: "例: 「場所と予約」「客室とお風呂」「食事」。客室・風呂・食事・予約の方法など、宿を選ぶのに役立つ事実を。",
  beauty: "例: 「アクセスと連絡先」「メニューの内容」「店の特色」。",
  bodycare: "例: 「アクセスと連絡先」「施術の内容」「店の特色」。効果・効能・治る・改善などの言葉は使わない(施術の名前と内容の事実だけ)。",
  pet: "例: 「場所と利用のしかた」「店の特色」。動物の扱い・予約の流れなど、実用の事実を。",
  activity: "例: 「体験の内容」「集合場所とアクセス」「準備と注意」。安全・予約・季節・対象年齢など実用の事実を。",
  sports: "例: 「設備と利用区分」「営業時間と休み」「教室・体験」。",
  life: "例: 「場所と連絡先」「内容」。",
};

/** 見本の紹介記事を作業フォルダに写す(notes・facts は付けない) */
function writeExamples(vEn, work) {
  const vsDir = abs("automation/vertical-stores");
  const ek = EXAMPLE_ARTICLE[vEn];
  const f = path.join(vsDir, "articles", `${ek}.json`);
  if (existsSync(f)) {
    const a = readJson(f);
    delete a.notes;
    delete a.facts;
    delete a.key;
    writeFileSync(path.join(work, "example-article.json"), JSON.stringify(a, null, 2) + "\n");
  }
  const fk = EXAMPLE_FEATURE[vEn];
  if (fk) {
    const ff = path.join(vsDir, "features", `${fk}.json`);
    if (existsSync(ff)) {
      const x = readJson(ff);
      const a = x.article || {};
      writeFileSync(
        path.join(work, "example-feature.json"),
        JSON.stringify(
          {
            kicker: a.kicker, title: a.title, titleHTML: a.titleHTML, subtitle: a.subtitle, lede: a.lede, summary: x.summary,
            ranking: (a.ranking || []).slice(0, 3).map((r) => ({ name: r.name, cuisine: r.cuisine, area: r.area, purpose: r.purpose, desc: r.desc, specs: r.specs })),
            quote: a.quote, closing: a.closing,
          },
          null,
          2,
        ) + "\n",
      );
    }
  }
}

/** グルメの見本: lib/teleapo-features.ts のうち、機械の検査に 1 文も引っかからない最近の記事 */
export async function pickGourmetExample(work, { classify, features }) {
  const ids = Object.keys(features);
  const tail = ids.slice(-60).reverse();
  for (const id of tail) {
    const a = features[id];
    if (!a?.ranking?.length || !a.ranking.every((r) => r.desc)) continue;
    const texts = [a.title, a.subtitle, a.lede, a.quote, a.closing, ...a.ranking.flatMap((r) => [r.name, r.desc])].filter(Boolean);
    const bad = texts.some((t) => String(t).split(/(?<=[。！？])/).some((s) => classify(s)));
    if (bad) continue;
    const ex = {
      kicker: a.kicker, title: a.title, titleHTML: a.titleHTML, subtitle: a.subtitle, lede: a.lede,
      ranking: a.ranking.map((r) => ({ name: r.name, cuisine: r.cuisine, area: r.area, desc: r.desc, specs: r.specs })),
      quote: a.quote, closing: a.closing,
    };
    writeFileSync(path.join(work, "example.json"), JSON.stringify(ex, null, 2) + "\n");
    return id;
  }
  return null;
}

function filesBlock(work) {
  const L = [];
  const site = readJson(path.join(work, "site.json"), { pages: [] });
  L.push("  - 読むファイルの一覧(絶対パス):");
  L.push(`    - ${work}/store.json`);
  site.pages.forEach((p, i) => L.push(`    - ${work}/site/page${i + 1}.txt … ${p.url}(${p.chars} 字)`));
  if (site.pages.length === 0) L.push("    - (公式サイトの文字は取れていません)");
  const man = readJson(path.join(work, "cand", "manifest.json"), { items: [] });
  L.push(`  - 写真の候補(${man.items.length} 枚。Read で 1 枚ずつ見る。ID・元・元の大きさ):`);
  for (const m of man.items) L.push(`    - ${m.id}: ${work}/cand/${m.id}.jpg(${m.source === "maps" ? "Google マップ" : "公式サイト"}・${m.width}x${m.height})`);
  return L.join("\n");
}

/** 指示文を作って work/prompt.md に書く。返り値は指示文 */
export function buildPrompt({ store, work, outFile, rewriteNote }) {
  const vEn = store.verticalEn;
  const common = fill(tpl("common.md"), {
    KEY: store.key,
    MAP_NAME: store.mapName,
    MAP_ADDRESS: store.mapAddress,
    MAP_PHONE: store.mapPhone || "(なし)",
    CID: store.cid,
    MAP_URL: store.mapUrl,
    MAP_CATEGORY: store.info?.category || "(なし)",
    OFFICIAL: store.officialUrl || "(公式サイトとして使える URL なし)",
    VERTICAL: store.vertical,
    WORK: work,
    OUT: outFile,
    FILES: filesBlock(work),
  });
  let body;
  if (vEn === "gourmet") {
    body = fill(tpl("gourmet.md"), { WORK: work, OUT: outFile });
  } else {
    const hasFeature = HAS_FEATURE.has(vEn);
    const cats = categoriesOf(vEn).map((c) => `${c.slug}(${c.name})`).join(" / ");
    const tags = ALLOWED_TAGS[vEn].length ? ALLOWED_TAGS[vEn].map((t) => `「${t}」`).join("・") : "(この業種は札を付けない。tags は空配列)";
    const featureBlock = hasFeature
      ? `## 店の特集記事(feature)(店ページから飛ぶ、もう 1 本の記事)
見本は \`${work}/example-feature.json\`。紹介記事(article)と同じ事実から、**店の特集記事** も書く(事実を足さない・article と同じ文を丸写ししない)。
- \`kicker\`(店名の英字表記+地名・大文字)/ \`title\` / \`titleHTML\`(title に <br> と <em>…</em> を足した形)/ \`subtitle\`(「種類 / 都道府県市区町村 / 特徴」を " / " でつなぐ)/ \`lede\`(導入。事実が足りなければ短く)/ \`summary\`(ページの説明文。80〜130 字)
- \`ranking\`: **3〜5 個**のポイント(\`name\` 見出し・\`cuisine\` 小さな分類ラベル・\`area\` 市区町村・\`purpose\` 「どんなことを知りたい人へ」・\`desc\` 本文 200〜450 字・\`specs\` 事実の表 1〜3 つ \`{"k","v"}\`)。事実が足りなければ個数を減らす(3 個に満たなければ feature だけ省略し、article だけ書く)。
- \`quote\`(編集部のひとこと。事実のまとめ 2〜3 文)/ \`closing\`(最後に。実用の事実で終える)
- title・見出しに「人気」「おすすめ」「無料」「円」を入れない。
`
      : "";
    body = fill(tpl("vertical.md"), {
      WORK: work,
      OUT: outFile,
      VERTICAL: store.vertical,
      FEATURE_TITLE_SUFFIX: hasFeature ? "(と、店の特集記事)" : "",
      EXAMPLE_FEATURE_NOTE: hasFeature ? `、特集記事の見本は \`${work}/example-feature.json\`` : "",
      CATEGORY_LIST: cats,
      SECTION_HINT: SECTION_HINT[vEn] || "",
      ROOMS_RULE: vEn === "stay" ? "- `rooms`: 客室・サイト・コテージなどの種類の名前(名前だけ・最大 8。公式サイトにあるものだけ)。\n" : "",
      ALLOWED_TAGS: tags,
      FEATURE_BLOCK: featureBlock,
      PHOTOPLAN_NOTE: hasFeature ? "(紹介記事の写真は全部使う。特集記事の主役と各ポイントの写真は featurePlan で選ぶ)" : "(紹介記事に使う写真は use=true の全部)",
      PHOTOPLAN_FEATURE: hasFeature
        ? "- `featurePlan.hero`: 特集記事の主役の写真 1 枚(use=true の中から。無ければ null)。`featurePlan.points`: feature.ranking と同じ長さの配列で、各ポイントに合う写真の ID(1 枚)。合う写真が無いポイントは null(空の枠のまま)。同じ写真を 2 回使わない。\n"
        : "",
      ROOMS_JSON: vEn === "stay" ? '    "rooms": [ { "name": "..." } ],\n' : "",
      FEATURE_JSON: hasFeature
        ? '  "feature": { "kicker": "...", "title": "...", "titleHTML": "...", "subtitle": "...", "lede": "...", "summary": "...", "ranking": [ { "name": "...", "cuisine": "...", "area": "...", "purpose": "...", "desc": "...", "specs": [ { "k": "...", "v": "..." } ] } ], "quote": "...", "closing": "..." },\n  "featurePlan": { "hero": "g01", "points": ["g02", null, "s01"] },\n'
        : "",
    });
    writeExamples(vEn, work);
  }
  let prompt = common + body;
  if (rewriteNote) prompt += `\n\n# 書き直し(1 回だけ)\n前回の結果ファイル \`${outFile}\` を機械で検査したところ、次の問題がありました。**該当の文だけを、事実のまま直して** 同じファイルを上書きしてください(他は変えない。新しい事実を足さない)。\n${rewriteNote}\n`;
  writeFileSync(path.join(work, rewriteNote ? "prompt-rewrite.md" : "prompt.md"), prompt);
  return prompt;
}
