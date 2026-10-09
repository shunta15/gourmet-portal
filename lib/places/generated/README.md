# lib/places/generated

`beauty.json` と `bodycare.json` は **自動生成**です。手で編集しないでください。

- 作る道具: `automation/vertical-stores/build-places.mjs`
  - 材料: `automation/vertical-stores/gbp/*.json`（Google マップで特定した店。`verdict` が「一致」だけ）と `automation/vertical-stores/articles/<キー>.json`（紹介記事）
  - 既定は `pilot.json` の店で記事がある店だけ。`--all` で「一致」の全店
- 店 ID の台帳: `automation/vertical-stores/ids.json`（追記だけ。一度払い出した ID は変えない）
- 除外した店と理由: `automation/vertical-stores/unmapped.json`
- 直したいとき: 材料（gbp / articles）か build-places.mjs を直して、作り直す
- 読む側: `lib/places/newVerticals.ts`（`getPlaces('beauty' | 'bodycare')` から使う）
