# 利用シーン特集 — ライター出力の形式

ライターは `automation/scene-articles/out/<記事ID>.json` を1記事1ファイルで書く。
`node automation/scene-articles/emit.mjs --check` で検査、通れば `node automation/scene-articles/emit.mjs` で
`lib/sceneFeatures.ts` が生成される（店名・画像・住所・最寄り駅・営業時間・予算は店データから emit が埋める。ライターは書かない）。
書き方の決まりは [WRITING.md](./WRITING.md)。

## 流れ

1. `node automation/scene-articles/build-candidates.mjs` → `candidates.json`（シーン×街/地域・店ID・店ごとの根拠）
2. 候補を1つ選ぶ（`greedyOrder` の小さい順に選ぶと、同じ店ばかりに偏らない。`usableCount` が 3 未満の候補は避ける）
3. ライターが `out/<記事ID>.json` を書く（店は候補の `storeIds` から選ぶ。候補外の店・新しい店は使わない）
4. `emit.mjs --check` → 違反があれば直す → `emit.mjs`
5. `npx tsc --noEmit` と `npx next build`

## 形式

```json
{
  "id": "scene-lunch-gunma-太田市",
  "scene": "lunch",
  "area": "gunma/太田市",
  "title": "…",
  "subtitle": "…",
  "lede": "…",
  "items": [
    {
      "storeId": "r382",
      "heading": "…",
      "body": "…",
      "factsUsed": ["address: 群馬県太田市…", "hours: 11:00-14:00"]
    }
  ],
  "closing": "…",
  "tags": ["ランチ", "太田市"]
}
```

| キー | 内容 |
|---|---|
| `id` | 記事ID。URL は `/feature/<id>`。使える字は英数・ひらがな・カタカナ・漢字・`-` のみ（スペースや `。/()?&#%` は不可）。ファイル名は `<id>.json`。候補の `suggestedArticleId` を使えば `scene-<シーン>-<地域>[-<街>]` になる |
| `scene` | シーンの slug（`lib/scenes.ts`: date / business / solo / group / girls-night / private-room / pet-friendly / lunch / late-night / sake / bread / soba-udon） |
| `area` | `"<region>"`（地域。例 `"osaka"`）または `"<region>/<街>"`（街。例 `"osaka/大阪市北区"`）。候補の `area` をそのまま使う |
| `title` | 記事タイトル。地域名（街名）とシーン名を入れる |
| `subtitle` | 副題（20〜40字） |
| `lede` | 導入文（150〜500字） |
| `items[]` | 3〜7項目。1店1項目。表示は掲載順（順位ではない） |
| `items[].storeId` | 店ID（`r…`）。その シーン×地域 の候補 `storeIds` に含まれる店だけ |
| `items[].heading` | その店の小見出し。店名の下に出る（40字まで目安） |
| `items[].body` | 本文（120〜600字） |
| `items[].factsUsed` | この項目で使った事実。1つ以上。形式は下記 |
| `closing` | 締め（150〜600字） |
| `tags` | 記事のタグ（文字列の配列。シーン名・街名など） |

## factsUsed の書き方

`"<field>: <値>"`。値は `candidates.json` の `stores[<店ID>]` にある文字列をそのまま写す（emit が店データと突き合わせる）。

| field | 照合先 |
|---|---|
| `address` `nearest` `hours` `closed` `seats` `budget` `cuisine` | その店のデータにその値が含まれる |
| `tag` | その店の `tags` にある（例 `"tag: ランチ"`） |
| `evidence` | `automation/stores500/tag-evidence.json` のその店のタグ根拠（`stores[id].sceneTags[タグ].facts[].evidence`） |

シーンに当たる理由（タグの根拠）を本文で示すときは、その根拠を `factsUsed` にも挙げる。
候補の `storeBasis[店ID].basis` が `"tag-only"` の店は根拠が tags の付与だけ（事実の裏づけなし）。本文でシーン適性を断定せず、店データにある別の事実で書くか、記事から外す。

## emit が止める違反（1件でもあれば何も書き出さない）

- JSON が読めない・必須キーが無い・id の文字が不正・id の重複・既存の特集記事との衝突
- `scene` が無い・`area` の地域/街が無い・その シーン×地域 の該当店が 4 店未満
- 項目数が 3〜7 でない（実写画像のない店を外したあとも 3 以上）
- `storeId` が実在しない・重複・その シーン×地域 の該当店に含まれない
- `factsUsed` が無い・店データに無い値
- 禁止語: 最高・絶品・必ず・屈指・随一・有数・最も、日本一などの最上級、絶対・No.1、素朴・派手さはない、〜らしい、
  星・評価・口コミ・レビュー・評判、年号付き料金、脱テンプレ規約の禁止フレーズ、
  来店体験・取材の創作（「実際に訪れ」「食べてみ」「伺った」「いただいた」など）
- 画像がプレースホルダの店は記事から外れる（外した店の名前が他の本文に残っていたら違反）

警告（止めない）: 「人気」「おすすめ」、文量の目安外、タイトルに地域名/シーン名が無い、シーン適性の根拠を factsUsed に挙げていない店。
