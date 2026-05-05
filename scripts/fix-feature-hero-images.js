#!/usr/bin/env node
/**
 * FEATURE_ARTICLES の heroImage を、ranking[0] の店舗名で RESTAURANTS を検索し、
 * 実店舗の heroImages[0] に差し替えるスクリプト。
 * ranking各RankItemのimages[0]も同様に差し替える。
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../lib/data.ts');
const content = fs.readFileSync(DATA_PATH, 'utf8');

// ============================================================
// Step 1: RESTAURANTS の name → heroImages[0] マッピングを構築
// RESTAURANTSブロックを正確に抽出してから処理する
// ============================================================

const restaurantsStart = content.indexOf('export const RESTAURANTS');
const featureArticlesStart = content.indexOf('export const FEATURE_ARTICLES');

// RESTAURANTSブロック（RESTAURANTS定義〜FEATURE_ARTICLES定義の直前）
const restaurantsBlock = content.slice(restaurantsStart, featureArticlesStart);

const restaurantMap = {}; // name -> heroImages[0]

// 各店舗エントリを抽出: id: "rXXX" から始まる行を起点に
// heroImages配列の最初のURLを取得
const rBlocks = restaurantsBlock.split(/(?=\n  \{[\s\S]*?id:\s*"r\d+")/).filter(b => b.includes('id: "r'));

console.log(`店舗ブロック分割数: ${rBlocks.length}`);

for (const block of rBlocks) {
  const nameMatch = block.match(/\bname:\s*"([^"]+)"/);
  if (!nameMatch) continue;
  const name = nameMatch[1];

  // heroImages 配列内の最初のURL（ローカルパスも含む）
  const heroImagesMatch = block.match(/heroImages:\s*\[\s*\n\s*"([^"]+)"/);
  if (heroImagesMatch) {
    restaurantMap[name] = heroImagesMatch[1];
    continue;
  }
  // heroImages が1行形式の場合
  const heroImagesInlineMatch = block.match(/heroImages:\s*\[\s*"([^"]+)"/);
  if (heroImagesInlineMatch) {
    restaurantMap[name] = heroImagesInlineMatch[1];
  }
}

console.log(`RESTAURANTS マッピング構築完了: ${Object.keys(restaurantMap).length} 件`);

// ============================================================
// Step 2: FEATURE_ARTICLESを解析
// ============================================================

const beforeFeature = content.slice(0, featureArticlesStart);
const featureContent = content.slice(featureArticlesStart);
const featureLines = featureContent.split('\n');

// Pass 1: 各記事のranking store nameリストを収集（順番を保持）
const articleRankNames = {}; // articleId -> [name1, name2, ...]

{
  let curArticleId = null;
  let inRankingBlock = false;
  let rankingDepth = 0;

  for (let i = 0; i < featureLines.length; i++) {
    const line = featureLines[i];

    const articleIdMatch = line.match(/^\s+"(feature-[^"]+)":\s*\{/);
    if (articleIdMatch) {
      curArticleId = articleIdMatch[1];
      inRankingBlock = false;
      rankingDepth = 0;
      continue;
    }

    if (!curArticleId) continue;

    if (!inRankingBlock && line.match(/^\s+ranking:\s*\[/)) {
      inRankingBlock = true;
      rankingDepth = 1;
      continue;
    }

    if (!inRankingBlock) continue;

    for (const ch of line) {
      if (ch === '[') rankingDepth++;
      if (ch === ']') rankingDepth--;
    }
    if (rankingDepth <= 0) {
      inRankingBlock = false;
      continue;
    }

    const rankNameMatch = line.match(/^\s+name:\s*"([^"]+)"/);
    if (rankNameMatch) {
      if (!articleRankNames[curArticleId]) articleRankNames[curArticleId] = [];
      articleRankNames[curArticleId].push(rankNameMatch[1]);
    }
  }
}

console.log(`記事数: ${Object.keys(articleRankNames).length}`);

// ============================================================
// Step 3: 差し替え実行
// ============================================================

let matchedArticles = 0;
let unmatchedArticles = [];
let matchedRankItems = 0;
let unmatchedRankItems = [];

let newFeatureContent = featureContent;

const articleKeys = Object.keys(articleRankNames);
for (const articleId of articleKeys) {
  const rankNames = articleRankNames[articleId];
  if (!rankNames || rankNames.length === 0) continue;

  const firstName = rankNames[0];
  const realImage = restaurantMap[firstName];

  const articleStartPattern = `"${articleId}":`;
  const articleStartIdx = newFeatureContent.indexOf(articleStartPattern);
  if (articleStartIdx === -1) continue;

  const nextArticleMatch = newFeatureContent.indexOf('\n  "feature-', articleStartIdx + 1);
  const articleBlockEnd = nextArticleMatch !== -1 ? nextArticleMatch : newFeatureContent.length;
  const articleBlock = newFeatureContent.slice(articleStartIdx, articleBlockEnd);

  let newArticleBlock = articleBlock;

  // heroImage 差し替え（Unsplash画像のみ対象）
  const heroImageMatch = articleBlock.match(/heroImage:\s*"(https:\/\/images\.unsplash\.com\/[^"]+)"/);
  if (heroImageMatch) {
    if (realImage) {
      // URLパラメータを除いた実画像URL（?w=1200を付与）
      const baseRealImage = realImage.split('?')[0];
      const newHeroUrl = realImage.startsWith('http')
        ? `${baseRealImage}?w=1200`
        : realImage; // ローカルパスの場合はそのまま
      newArticleBlock = newArticleBlock.replace(
        heroImageMatch[0],
        `heroImage: "${newHeroUrl}"`
      );
      matchedArticles++;
    } else {
      unmatchedArticles.push({ id: articleId, firstName });
    }
  }

  // ranking内のRankItem.images 差し替え
  const rankingStart = newArticleBlock.indexOf('    ranking: [');
  if (rankingStart !== -1) {
    let depth = 0;
    let rankingEnd = rankingStart;
    for (let ci = rankingStart; ci < newArticleBlock.length; ci++) {
      const ch = newArticleBlock[ci];
      if (ch === '[') depth++;
      if (ch === ']') {
        depth--;
        if (depth === 0) {
          rankingEnd = ci + 1;
          break;
        }
      }
    }

    let rankingContent = newArticleBlock.slice(rankingStart, rankingEnd);
    let newRankingContent = rankingContent;

    // 各RankItemのnameとimages[0]を対応付けて差し替え
    let searchPos = 0;
    while (true) {
      const nameSearchStr = newRankingContent.slice(searchPos);
      const nameMatch = nameSearchStr.match(/name:\s*"([^"]+)"/);
      if (!nameMatch) break;

      const itemName = nameMatch[1];
      const nameRelPos = nameSearchStr.indexOf(nameMatch[0]);
      const nameAbsPos = searchPos + nameRelPos;
      const realItemImage = restaurantMap[itemName];

      // このname以降の最初のimages(Unsplash)を探す
      const afterName = newRankingContent.slice(nameAbsPos);
      const imagesMatch = afterName.match(/images:\s*\["(https:\/\/images\.unsplash\.com\/[^"]+)"/);
      if (imagesMatch) {
        const imagesRelPos = afterName.indexOf(imagesMatch[0]);
        const imagesAbsPos = nameAbsPos + imagesRelPos;

        if (realItemImage) {
          const baseRealItemImage = realItemImage.split('?')[0];
          const newImgUrl = realItemImage.startsWith('http')
            ? `${baseRealItemImage}?w=800`
            : realItemImage;
          const oldStr = imagesMatch[0];
          const newStr = `images: ["${newImgUrl}"`;
          newRankingContent =
            newRankingContent.slice(0, imagesAbsPos) +
            newStr +
            newRankingContent.slice(imagesAbsPos + oldStr.length);
          matchedRankItems++;
          // 次の検索位置（新しい文字列の長さに応じてずらす）
          searchPos = imagesAbsPos + newStr.length;
        } else {
          unmatchedRankItems.push({ article: articleId, name: itemName });
          searchPos = imagesAbsPos + imagesMatch[0].length;
        }
      } else {
        // imagesがUnsplashでなければ次のnameへ
        searchPos = nameAbsPos + nameMatch[0].length;
      }
    }

    newArticleBlock = newArticleBlock.slice(0, rankingStart) + newRankingContent + newArticleBlock.slice(rankingEnd);
  }

  // 元のarticleBlockをnewArticleBlockで置換
  newFeatureContent =
    newFeatureContent.slice(0, articleStartIdx) +
    newArticleBlock +
    newFeatureContent.slice(articleStartIdx + articleBlock.length);
}

// ============================================================
// Step 4: 書き戻し
// ============================================================
const newContent = beforeFeature + newFeatureContent;
fs.writeFileSync(DATA_PATH, newContent, 'utf8');

// ============================================================
// Step 5: 結果レポート
// ============================================================
console.log('\n===== 差し替え結果 =====');
console.log(`記事heroImage 差し替え成功: ${matchedArticles} / ${articleKeys.length}`);
console.log(`記事heroImage 差し替え失敗（RESTAURANTS未登録）: ${unmatchedArticles.length} 件`);
console.log(`RankItem images 差し替え成功: ${matchedRankItems} 件`);
console.log(`RankItem images 差し替え失敗（RESTAURANTS未登録）: ${unmatchedRankItems.length} 件`);

if (unmatchedArticles.length > 0) {
  console.log('\n--- 差し替えできなかった記事（ranking[0]がRESTAURANTSに未登録）---');
  unmatchedArticles.forEach(({ id, firstName }) => {
    console.log(`  ${id}: "${firstName}"`);
  });
}

const uniqueUnmatchedItems = [...new Set(unmatchedRankItems.map(i => i.name))];
console.log(`\nRESTAURANTS未登録のユニーク店舗名: ${uniqueUnmatchedItems.length} 件`);

console.log('\nlib/data.ts の更新完了');
