// Instagram投稿文を Claude API でバッチ生成する。
//
// ⚠️⚠️ 実行すると Anthropic API の課金が発生します。必ず事前にユーザー承認を得てから実行すること。
//        （無断実行禁止 / まず10件で実測コストを出す運用）
//
// 前提: 先に `node automation/instagram/extract.mjs` で output/restaurants.json を生成しておく。
// 使い方:
//   ANTHROPIC_API_KEY=sk-... node automation/instagram/generate.mjs r234 r235 r236   # 指定ID
//   ANTHROPIC_API_KEY=sk-... BATCH=002 node automation/instagram/generate.mjs        # 全店舗
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const restaurants = JSON.parse(fs.readFileSync(path.join(DIR, "output/restaurants.json"), "utf8"));
const systemSpec = fs.readFileSync(path.join(DIR, "caption-prompt.md"), "utf8");

const ids = process.argv.slice(2);
const targets = ids.length ? restaurants.filter((r) => ids.includes(r.id)) : restaurants;
if (!targets.length) { console.error("対象店舗なし。IDを確認してください。"); process.exit(1); }

// 品質優先: opus。コスト優先に切り替えるなら claude-sonnet-4-6。
const MODEL = process.env.MODEL || "claude-opus-4-8";
const client = new Anthropic(); // ANTHROPIC_API_KEY を環境変数から読む

const out = [];
let inTok = 0, outTok = 0;
for (const r of targets) {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 1200,
    system: systemSpec,
    messages: [{ role: "user", content: `次の店舗データからInstagram投稿文を1つ作って。\n\n${JSON.stringify(r, null, 2)}` }],
  });
  const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
  inTok += msg.usage.input_tokens; outTok += msg.usage.output_tokens;
  out.push(`## ${r.id} ${r.name}（${r.cuisine}／${r.area}）\n画像: public/restaurants/${r.id}/\n\n\`\`\`\n${text}\n\`\`\``);
  console.error(`✓ ${r.id} ${r.name}`);
}

const batch = process.env.BATCH || "latest";
const file = path.join(DIR, `output/captions-${batch}.md`);
fs.writeFileSync(file, `# Instagram投稿文 バッチ${batch}（自動生成 / model=${MODEL}）\n\n${out.join("\n\n---\n\n")}\n`);
console.error(`\n保存: ${path.relative(path.join(DIR, "../.."), file)}`);
console.error(`実測トークン: in=${inTok} out=${outTok}（${targets.length}件）→ この数字でコストを実測報告する`);
