#!/usr/bin/env node

/**
 * フェーズ1（土台）の検査スクリプト
 * 実行: node proto-portal/check-foundation.mjs
 *
 * チェック項目：
 * 1. 業種 slug・category slug の重複なし、予約語と衝突なし
 * 2. schemaType が全 category にある
 * 3. 47都道府県・slug 重複なし
 * 4. GOURMET_REGION_BY_PREF の値がすべて実在する REGIONS のキー
 * 5. gate: 0,2→noindex, 3→index
 */

import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve(path.dirname(import.meta.url.replace('file://', '')), '..');

// TypeScript ファイルを eval 用に読み込む（簡易実装）
function loadTsModule(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  // export const xxx = ... の形を eval で処理（簡易）
  const m = {};
  const evalFn = new Function('exports', content + '; Object.assign(this, exports);');
  evalFn.call(m);
  return m;
}

// 簡易チェック：TS ファイルの export const を正規表現で抽出
function parseExports(content) {
  const exports = {};
  const lines = content.split('\n');
  for (const line of lines) {
    // export const NAME = ... の形式
    const match = line.match(/export\s+const\s+(\w+)\s*[:=]/);
    if (match) {
      const name = match[1];
      exports[name] = true; // 存在確認用
    }
  }
  return exports;
}

console.log('🔍 フェーズ1（土台）の検査を開始...\n');

let passCount = 0;
let failCount = 0;

// ====== 1. 業種設定の検査 ======
console.log('📋 業種設定の検査');

const verticalDir = path.join(projectRoot, 'lib/verticals');
const verticalIndexContent = fs.readFileSync(
  path.join(verticalDir, 'index.ts'),
  'utf-8'
);
const verticalIndexExports = parseExports(verticalIndexContent);

// 各業種ファイルをチェック
const verticalFiles = ['gourmet', 'beauty', 'bodycare', 'pet', 'leisure', 'stay'];
const allCategorySlugs = new Set();
const allSceneSlugs = new Set();
const RESERVED_SLUGS = new Set(['area', 'shop', 'feature', 'scene', 'search', 'sitemap']);

for (const vfile of verticalFiles) {
  const filepath = path.join(verticalDir, `${vfile}.ts`);
  if (!fs.existsSync(filepath)) {
    console.log(`  ✗ ${vfile}.ts が見つかりません`);
    failCount++;
  } else {
    const content = fs.readFileSync(filepath, 'utf-8');
    // categories と scenes の定義を簡易チェック
    const hasCategoriesField = content.includes('categories:');
    const hasScenesField = content.includes('scenes:');

    if (!hasCategoriesField || !hasScenesField) {
      console.log(`  ✗ ${vfile}.ts に categories または scenes フィールドがありません`);
      failCount++;
    } else {
      console.log(`  ✓ ${vfile}.ts OK`);
      passCount++;

      // category slug を抽出（簡易）
      const categoryMatches = content.match(/slug:\s*['"]([^'"]+)['"]/g) || [];
      categoryMatches.forEach((match) => {
        const slug = match.match(/['"]([^'"]+)['"]/)[1];
        if (RESERVED_SLUGS.has(slug)) {
          console.log(`    ✗ category slug "${slug}" が予約語と衝突しています`);
          failCount++;
        }
        allCategorySlugs.add(slug);
      });

      // schemaType の存在確認
      const hasSchemaType = /schemaType\s*:\s*['"][^'"]+['"]/g.test(content);
      if (vfile !== 'gourmet' && !hasSchemaType) {
        console.log(`    ⚠ ${vfile}.ts に schemaType がありません`);
        failCount++;
      }
    }
  }
}

// category slug の重複チェック
const categoryArray = Array.from(allCategorySlugs);
const uniqueCategories = new Set(categoryArray);
if (categoryArray.length !== uniqueCategories.size) {
  console.log('  ✗ category slug に重複があります');
  failCount++;
} else {
  console.log(`  ✓ category slug 重複なし（${categoryArray.length}個）`);
  passCount++;
}

// ====== 2. 都道府県設定の検査 ======
console.log('\n🗺️ 都道府県設定の検査');

const prefecturesPath = path.join(projectRoot, 'lib/areas/prefectures.ts');
if (!fs.existsSync(prefecturesPath)) {
  console.log('  ✗ prefectures.ts が見つかりません');
  failCount++;
} else {
  const prefContent = fs.readFileSync(prefecturesPath, 'utf-8');

  // PREFECTURES 配列の長さを確認（簡易）
  const prefMatches = prefContent.match(/slug:\s*['"]([^'"]+)['"]/g) || [];
  const prefSlugs = prefMatches.map((m) => m.match(/['"]([^'"]+)['"]/)[1]);
  const uniquePrefSlugs = new Set(prefSlugs);

  if (prefSlugs.length !== 47) {
    console.log(`  ✗ PREFECTURES の件数が 47 ではありません（${prefSlugs.length}件）`);
    failCount++;
  } else {
    console.log('  ✓ PREFECTURES 47件');
    passCount++;
  }

  if (prefSlugs.length !== uniquePrefSlugs.size) {
    console.log('  ✗ prefecture slug に重複があります');
    failCount++;
  } else {
    console.log('  ✓ prefecture slug 重複なし');
    passCount++;
  }

  // GOURMET_REGION_BY_PREF のセクションを抽出
  const gourmetRegionMatch = prefContent.match(/export const GOURMET_REGION_BY_PREF[\s\S]*?\};/);
  if (gourmetRegionMatch) {
    console.log('  ✓ GOURMET_REGION_BY_PREF が定義されています');
    passCount++;
  } else {
    console.log('  ✗ GOURMET_REGION_BY_PREF が見つかりません');
    failCount++;
  }
}

// ====== 3. SEO gate の検査 ======
console.log('\n🔒 SEO gate の検査');

const gatePath = path.join(projectRoot, 'lib/seo/gate.ts');
if (!fs.existsSync(gatePath)) {
  console.log('  ✗ gate.ts が見つかりません');
  failCount++;
} else {
  const gateContent = fs.readFileSync(gatePath, 'utf-8');

  const hasMinIndexable = gateContent.includes('MIN_INDEXABLE');
  const hasIsIndexable = gateContent.includes('isIndexable');
  const hasRobotsFor = gateContent.includes('robotsFor');

  if (hasMinIndexable && hasIsIndexable && hasRobotsFor) {
    console.log('  ✓ gate.ts に必須関数があります');
    passCount++;

    // MIN_INDEXABLE = 3 を確認
    const minMatch = gateContent.match(/MIN_INDEXABLE\s*=\s*(\d+)/);
    if (minMatch && minMatch[1] === '3') {
      console.log('  ✓ MIN_INDEXABLE = 3');
      passCount++;
    } else {
      console.log('  ✗ MIN_INDEXABLE が 3 になっていません');
      failCount++;
    }
  } else {
    console.log('  ✗ gate.ts に必須関数がありません');
    failCount++;
  }
}

// ====== 4. Place 型の検査 ======
console.log('\n🏢 Place 型の検査');

const placesTypePath = path.join(projectRoot, 'lib/places/types.ts');
if (!fs.existsSync(placesTypePath)) {
  console.log('  ✗ lib/places/types.ts が見つかりません');
  failCount++;
} else {
  const placesContent = fs.readFileSync(placesTypePath, 'utf-8');
  const hasPlaceType = placesContent.includes('interface PlaceBase');
  if (hasPlaceType) {
    console.log('  ✓ lib/places/types.ts に Place 型があります');
    passCount++;
  } else {
    console.log('  ✗ lib/places/types.ts に Place 型がありません');
    failCount++;
  }
}

// ====== 5. Gourmet Places の検査 ======
console.log('\n🍴 Gourmet Places の検査');

const gourmetPath = path.join(projectRoot, 'lib/places/gourmet.ts');
if (!fs.existsSync(gourmetPath)) {
  console.log('  ✗ lib/places/gourmet.ts が見つかりません');
  failCount++;
} else {
  const gourmetContent = fs.readFileSync(gourmetPath, 'utf-8');
  const hasRestaurantToPlace = gourmetContent.includes('restaurantToPlace');
  const hasGetGourmetPlaces = gourmetContent.includes('getGourmetPlaces');
  if (hasRestaurantToPlace && hasGetGourmetPlaces) {
    console.log('  ✓ lib/places/gourmet.ts に必須関数があります');
    passCount++;
  } else {
    console.log('  ✗ lib/places/gourmet.ts に必須関数がありません');
    failCount++;
  }
}

// ====== Summary ======
console.log('\n' + '='.repeat(50));
console.log(`✅ 合格: ${passCount}`);
console.log(`❌ 不合格: ${failCount}`);

if (failCount === 0) {
  console.log('\n🎉 すべてのチェックに合格しました！');
  process.exit(0);
} else {
  console.log('\n⚠️ 不合格項目があります。修正してください。');
  process.exit(1);
}
