# lib/places/generated

`beauty.json` と `bodycare.json` は **自動生成**です。手で編集しないでください。

- 作る道具: `automation/vertical-stores/build-places.mjs`
  - 材料: `automation/vertical-stores/gbp/*.json`（Google マップで特定した店。`verdict` が「一致」だけ）と `automation/vertical-stores/articles/<キー>.json`（紹介記事）
  - 既定は `pilot.json` の店で記事がある店だけ。`--all` で「一致」の全店
- 店 ID の台帳: `automation/vertical-stores/ids.json`（追記だけ。一度払い出した ID は変えない）
- 除外した店と理由: `automation/vertical-stores/unmapped.json`
- 直したいとき: 材料（gbp / articles）か build-places.mjs を直して、作り直す
- 読む側: `lib/places/newVerticals.ts`（`getPlaces('beauty' | 'bodycare')` から使う）

## 特集記事（features-beauty.json / features-bodycare.json）

こちらも **自動生成**です。手で編集しないでください。

- 作る道具: `automation/vertical-stores/build-features.mjs`（`node automation/vertical-stores/build-features.mjs`。`--dry` で書き込まず要約だけ）
  - 材料: `automation/vertical-stores/features/<キー>.json`（実在の店の特集記事。形は FEATURE.md の「出力」）と、写真 `public/_portal/vshops/<キー>/`
  - 店 ID（`placeId`）は gbp の cid を `ids.json` で引く。台帳に無い店は付かない（特集ページだけが出る）
  - `facts`・`notes`・写真の元 URL は入れない（確認用）。写真の寸法と説明は `<img>` の width / height / alt 用に入れる
  - hero の写真が `public/` に無い記事は載せない（理由を標準出力に出す）
- 読む側: `lib/places/features.ts` → `components/portal/pages/feature.tsx`（`/beauty/feature/<id>`・`/bodycare/feature/<id>`。id は店舗名。日本語のまま）・店ページの「特集記事を読む」（`components/portal/pages/shop.tsx`）
- 店データ側で対象の行を絞るには `build-places.mjs --all --rows beauty:2-129,bodycare:2-133`（既定は絞らない）
