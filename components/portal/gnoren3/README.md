# グルメ試作「暖簾 3」(/proto-gourmet/n3)

オーナーの新しい見本 5 枚(2026-11-01・各 1086×1448px・PC)を **1:1 で再現する試作**。仮の店名・文章・値段・日付も見本のまま入れる(本物への置き換えは後。まず見本を再現)。
暖簾 2(`/proto-gourmet/n`・`components/portal/gnoren/`)は**一切変更しない**。暖簾 3 はそれを写して別に作ってある。
プレビュー・ローカル専用(`assertPreviewOrLocal()`。本番は 404)。noindex。

見本の置き場: `/Users/shunta/claude/reports/machinowa-design/mockups/グルメ_見本_2026-11-01/`
`1_最初.png` `2_さがす.png` `3_店.png` `4_店の特集記事.png` `5_特集一覧.png`

## ルート

| URL | 見本 | ファイル | Shell の page |
|---|---|---|---|
| `/proto-gourmet/n3` | 1 | `app/proto-gourmet/n3/page.tsx` | `"top"` |
| `/proto-gourmet/n3/search` | 2 | `app/proto-gourmet/n3/search/page.tsx` | `"search"` |
| `/proto-gourmet/n3/shop/sample` | 3 | `app/proto-gourmet/n3/shop/sample/page.tsx` | `"shop"` |
| `/proto-gourmet/n3/feature/sample` | 4 | `app/proto-gourmet/n3/feature/sample/page.tsx` | `"feature"` |
| `/proto-gourmet/n3/feature` | 5 | `app/proto-gourmet/n3/feature/page.tsx` | `"feature"` |

いまの 5 つの page.tsx は仮の `<main>`(見出し 1 行)。ページ担当が中身(`components/portal/gnoren3/<自分>/`)に差し替える。
グルメ既存のヘッダー・フッター(SiteShell)は `components/portal/isPortalPath.ts` に `/proto-gourmet` が入っているので出ない(暖簾 2 の時点で追加済み。今回は触っていない)。
ローカルで見る: `PORTAL_LAUNCHED=1 npx next dev -p <空きポート>`(いまは `localhost:6240` で動作中)。

## ファイルの置き場と、ページ担当が編集してよい範囲

```
app/proto-gourmet/n3/layout.tsx          フォント注入 + base.css 読み込み(触らない)
components/portal/gnoren3/
  common/        共通(Shell / Header / Footer / SectionHeading / Decor / icons / nav / fonts / base.css)  ← 触らない
  top/ search/ shop/ feature/ featurelist/   ← 各ページ担当の専用フォルダ(部品・CSS)
public/_portal/gnoren3/
  common/        (今は空。新見本に共通の飾りは無い)
  top/ search/ shop/ feature/ featurelist/   ← 各ページの切り出し画像(webp)
```

**ページ担当が編集してよいのは、自分の `app/proto-gourmet/n3/<自分のルート>/page.tsx`・`components/portal/gnoren3/<自分>/`・`public/_portal/gnoren3/<自分>/` だけ。**
`common/` と `layout.tsx` は触らない。共通に足したいものは自分のフォルダへコピーして使う。
CSS クラスはページ固有の接頭辞を付ける: `gn3-top-` `gn3-search-` `gn3-shop-` `gn3-feat-` `gn3-fl-`(`gn3-` 単独の名前は common が使用中)。
git は `git add <自分のパス>` だけ(`git add -A` 禁止)。

## 暖簾 2 との差分(重要)

| 項目 | 暖簾 2 | 暖簾 3 |
|---|---|---|
| ルート | `/proto-gourmet/n` | `/proto-gourmet/n3` |
| クラス接頭辞 | `.gn-` / `.gn-root` | `.gn3-` / `.gn3-root` |
| CSS 変数 | `--gn-*` | `--gn3-*`(`--u` は `.gn3-root` 内で再定義) |
| フォント変数 | `--gn-mincho` 等 | `--gn3-mincho` / `--gn3-gothic` / `--gn3-script` |
| **ヘッダー** | 白い半透明の帯・絵の上に重なる(absolute・58u) | **濃い茶黒の木の帯・流れの中(55u)・絵に重ならない** |
| ヘッダーの中身 | 暖簾ロゴ + 「マチノワ グルメ」+ 検索/お気に入り | **丸い器のロゴ + 「マチノワ」+ 縦線 + 「街の、うまいが、つながっていく。」/ トップ・さがす・店舗紹介・特集 + 虫眼鏡のみ** |
| ナビの下線 | テラコッタ | **生成りの白** |
| フッター | 生成りの麻地 | 流用。**地をヘッダーと同じ濃い茶黒**に |
| 共通の飾り(townscape 等) | あり | **無し**(新見本に出てこない)。`Decor.tsx` は空の置き場だけ |
| ページの地 | `#faf9f5` | `#ece8dd`(新見本から採色) |

### ★ y 座標の測り方(いちばん間違えやすい)
暖簾 2 はヘッダーが絵に重なっていたので、見本の y をそのまま使えた。**暖簾 3 のヘッダーは流れの中にあり、`children`(`<main>`)は見本の y=55 から始まる。**
つまり `<main>` 内の y = **見本の y − 55**。`calc(var(--u) * (見本の y − 55))` と書く。
ヒーロー画像は見本の y=55 から切り出す(ヘッダーの帯は含めない)。`--gn3-hh`(= 55u)で「見本の y = hh + main 内の y」とも書ける。
スマホ(≤768px)ではヘッダーは 56px の sticky で、`--gn3-hh` も 56px。

## ヘッダーの寸法(見本 1・2・5 の平均。3・4 は全体が右へずれているので 1・2・5 に揃えた)

高さ **55u**(帯 0〜48u + 銅色の桟 48〜55u)。帯の色は見本の 0〜48u の中央値 ≈ `rgb(22,12,6)` = `--gn3-band #170c06`(木目つき)。桟は `rgb(56,26,3)→(110,65,30)→(40,20,8)`。
※ 指示文には「濃紺」とあったが、5 枚の実測は**濃い茶黒(古い木の板)**で、紺ではない。実測に合わせた。

| 部品 | x(u) | y(u) | 備考 |
|---|---|---|---|
| ロゴの器 | 106〜133(幅 27) | 15〜40(高さ 25) | SVG(`BowlMark`)。上に三日月・下にレンズ形 |
| 「マチノワ」 | 150〜253(幅 103) | 16〜37 | 明朝 700・26u・字間 .05em・`-webkit-text-stroke .5u` |
| 縦線 | 273.5 | 22.5〜35 | 幅 1u・生成り 32% |
| 見出し文 | 289〜449(幅 160) | 23〜33 | 明朝 600・9.8u(下限 10px)・字間 .09em |
| ナビ「トップ」 | 644〜675 | 文字 23〜32 | 明朝 600・11.6u・字間 .08em |
| 「さがす」 | 720〜751 | 〃 | |
| 「店舗紹介」 | 792〜838 | 〃 | |
| 「特集」 | 879〜900 | 〃 | 現在のページに下線(y44〜46・高さ 2u・生成りの白) |
| 虫眼鏡 | 959〜971(13×13) | 22〜34 | `SearchIcon`。押す範囲は ±12u 広げてある |

見本とのずれ: 1_最初 と 5_特集一覧 の上端 0〜55u を Playwright(1086px)で撮って比べると、ロゴ・見出し文・ナビ・虫眼鏡の x は ±3u 以内。0〜55u の平均絶対画素差は 16.7 / 19.2(見本は写真の木目・左右の背景が焼き込まれているので、帯の中身を CSS で描くかぎり 0 にはならない)。

## Shell の使い方

```tsx
import Shell from "@/components/portal/gnoren3/common/Shell";
export default function Page() {
  return (
    <Shell page="top">   {/* "top" | "search" | "shop" | "feature" … ナビの下線を引くタブ */}
      <main>…</main>
    </Shell>
  );
}
```
- Shell = `.gn3-root`(幅の基準・パレット・書体)+ ヘッダー + children + フッター。`<main>` はページ側で書く。
- ナビのリンク先: トップ `/proto-gourmet/n3`・さがす `…/search`・店舗紹介 `…/shop/sample`・特集 `…/feature`(`common/nav.ts`)。
- `SectionHeading`(`title` `lead` `href` `linkLabel`): 明朝の見出し + 灰色のリード + 右端の「すべて見る →」。大きさ `--gn3-h-fs`(既定 20u)・色 `--gn3-h-color`。
- `.gn3-linen`(生成りの紙の地)・`.gn3-script`(筆記体)・`.gn3-mincho`・`.gn3-wrap`(幅 1086u の中央寄せ容器)。

## 寸法 `--u`

`--u` = **見本の 1 画素**。PC(>768px)で `--u = min(100cqw, 1440px) / 1086`(画面幅 1086px でちょうど 1px・1440px で約 1.326px・それより広い画面は 1440px で止まる)。
見本で測った数字 N をそのまま `calc(var(--u) * N)` と書く(上の「y − 55」に注意)。小さい字は `max(11px, calc(var(--u) * 10))` のように下限を付ける。
`.gn3-root` は `container-type:inline-size` なので、`position:fixed` の子は `.gn3-root` が基準になる(固定表示は避け absolute / sticky を使う)。
**≤768px では `--u` は 1px 固定**。スマホは `@media (max-width: 768px)` の中で「縦に積む・本文 14px 以上・押す所 44px 以上・横スクロール無し」で組む。

## パレット(`.gn3-root` 内)

| 変数 | 値 | 用途 |
|---|---|---|
| `--gn3-bg` | `#ece8dd` | ページの地(見本 5 の余白の中央値) |
| `--gn3-paper` | `#f6f3ec` | カードの紙 |
| `--gn3-linen` | `#e6e0d2` | 帯の生成り |
| `--gn3-navy` | `#0d1c2b` | 紺の暖簾・紺の帯 |
| `--gn3-red` / `--gn3-red-deep` | `#78201a` / `#5a0f0b` | 赤い暖簾 |
| `--gn3-sand` | `#c9b799` | 麻色の暖簾 |
| `--gn3-band` | `#170c06` | ヘッダー・フッターの木の板 |
| `--gn3-rail` | `#6b4020` | ヘッダー下縁の桟 |
| `--gn3-cream` | `#f3eee6` | 濃い地の上の文字 |
| `--gn3-ink` / `-soft` / `--gn3-muted` / `--gn3-line` | `#26211d` / `#4a423c` / `#6c665c` / `#d4cdbd` | 文字・罫線 |
| `--gn3-terracotta` | `#b35431` | リンク・強調 |

紺・赤・麻色は目で採った近似値。**ページ担当は自分の見本で測り直し、自分のフォルダの CSS で上書きしてよい**(common は触らない)。

## 書体(`common/fonts.ts`・3 ファミリーだけ。増やさない)
`--gn3-f-mincho`(Shippori Mincho 400/500/600/700)・`--gn3-f-gothic`(Zen Kaku Gothic New 400/500/700・`.gn3-root` の既定)・`--gn3-f-script`(Mrs Saint Delafield)。
`font-family: var(--gn3-f-mincho)` のように `--gn3-f-*` を使う。

## 画像
- 写真・飾りは `public/_portal/gnoren3/<top|search|shop|feature|featurelist>/` に webp で置く。見本から切り出し、**2 倍に拡大して保存**(見本は 1086px 幅なので粗い所は後で素材に置き換える前提)。
- 写真の上に焼き込まれた文字は HTML で描き、画像からは消す。
- `/_portal/*` は公開スイッチ OFF のとき next.config.ts で 404。ローカルは `PORTAL_LAUNCHED=1`、Vercel プレビューは常に ON。
