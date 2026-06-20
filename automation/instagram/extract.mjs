// lib/data.ts から店舗データ（r系ID）を抽出して JSON 化する。
// TypeScript コンパイラ API で AST 解析するので、正規表現パースより堅牢。
// 課金なし・ローカル完結。
//   使い方:  node automation/instagram/extract.mjs
//   出力:    automation/instagram/output/restaurants.json
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = path.join(ROOT, "lib/data.ts");
const OUT = path.join(ROOT, "automation/instagram/output/restaurants.json");

// 投稿文生成に使うフィールドだけ拾う（画像配列などは hero/gallery のみ）
const WANT = new Set([
  "id", "name", "cuisine", "area", "region", "desc", "address", "hours",
  "closed", "seats", "nearest", "phone", "budget", "tags", "body",
  "googleRating", "googleReviewCount", "image", "heroImages", "gallery",
]);

function literal(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal).filter((v) => v !== undefined);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  return undefined; // スプレッドや式は無視
}

const source = fs.readFileSync(SRC, "utf8");
const sf = ts.createSourceFile("data.ts", source, ts.ScriptTarget.Latest, true);
const stores = [];

function visit(node) {
  if (ts.isObjectLiteralExpression(node)) {
    const obj = {};
    for (const p of node.properties) {
      if (!ts.isPropertyAssignment(p)) continue;
      const key = ts.isIdentifier(p.name) || ts.isStringLiteral(p.name) ? p.name.text : null;
      if (key && WANT.has(key)) obj[key] = literal(p.initializer);
    }
    // 店舗オブジェクトの判定: id が r数字 で name を持つ
    if (typeof obj.id === "string" && /^r\d+$/.test(obj.id) && obj.name) {
      stores.push(obj);
    }
  }
  ts.forEachChild(node, visit);
}
visit(sf);

stores.sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));
fs.writeFileSync(OUT, JSON.stringify(stores, null, 2));
console.log(`抽出: ${stores.length} 店舗 → ${path.relative(ROOT, OUT)}`);
console.log(`ID範囲: ${stores[0]?.id} 〜 ${stores[stores.length - 1]?.id}`);
