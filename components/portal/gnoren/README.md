# グルメ試作「暖簾 2」(/proto-gourmet/n)

オーナーの見本 5 枚(2026-10-29・各 1086×1448px・PC)を **1:1 で再現する試作**。仮の店名・文章・値段も見本のまま入れる(本物のデータへの置き換えは後。ルール: まず見本を再現)。
プレビュー・ローカル専用(`assertPreviewOrLocal()`。本番は 404)。検索エンジンには載せない(noindex)。

見本の置き場: `/Users/shunta/claude/reports/machinowa-design/mockups/グルメ_見本_2026-10-29/`
`1_最初.png`(トップ) `2_さがす.png` `3_店.png`(店舗紹介) `4_店の特集記事.png` `5_特集一覧.png`

## ルート

| URL | 見本 | ページ | Shell の page |
|---|---|---|---|
| `/proto-gourmet/n` | 1 | `app/proto-gourmet/n/page.tsx` | `"top"` |
| `/proto-gourmet/n/search` | 2 | `app/proto-gourmet/n/search/page.tsx` | `"search"` |
| `/proto-gourmet/n/shop/sample` | 3 | `app/proto-gourmet/n/shop/sample/page.tsx` | `"shop"` |
| `/proto-gourmet/n/feature/sample` | 4 | `app/proto-gourmet/n/feature/sample/page.tsx` | `"feature"` |
| `/proto-gourmet/n/feature` | 5 | `app/proto-gourmet/n/feature/page.tsx` | `"feature"` |

グルメ既存のヘッダー・フッター(SiteShell)は `components/portal/isPortalPath.ts` に `/proto-gourmet` を足してあるので出ない。
ローカルで見る: `PORTAL_LAUNCHED=1 npx next dev -p <空きポート>`。

## ファイルの置き場

```
app/proto-gourmet/n/layout.tsx        フォント注入 + base.css 読み込み(触らない)
components/portal/gnoren/
  common/        共通(Shell / Header / Footer / SectionHeading / Decor / icons / nav / fonts / base.css)  ← ページ担当は編集しない
  top/ search/ shop/ feature/ featurelist/   ← 各ページ担当の専用フォルダ(部品・CSS)
public/_portal/gnoren/
  common/        townscape.webp leaf-spray.webp twig.webp(共通の飾り)
  top/ search/ shop/ feature/ featurelist/   ← 各ページの切り出し画像(webp)
```

### 役割分担のルール(衝突防止)
各ページ担当が編集してよいのは **自分のページ(`app/proto-gourmet/n/...` の page.tsx)・自分の部品フォルダ(`components/portal/gnoren/<自分>/`)・自分の画像フォルダ(`public/_portal/gnoren/<自分>/`)だけ**。
`common/` は触らない。共通に足したいものがあれば、自分のフォルダへコピーして使う。
CSS は自分のフォルダに置き、クラス名は `gn-top-` `gn-search-` `gn-shop-` `gn-feat-` `gn-fl-` のように **ページ固有の接頭辞**を付ける(`gn-` 単独の名前は common が使用中)。

## Shell の使い方

```tsx
import Shell from "@/components/portal/gnoren/common/Shell";
export default function Page() {
  return (
    <Shell page="top">   {/* "top" | "search" | "shop" | "feature" … ナビの下線を引くタブ */}
      <main>…</main>
    </Shell>
  );
}
```

- Shell = `.gn-root`(幅の基準・パレット・書体) + ヘッダー + children + フッター。`<main>` はページ側で書く。
- **PC のヘッダーは絵の上に重なる**(`position:absolute`・高さ 58u・白い半透明の帯で下の縁が波打つ)。children は見本と同じく **ページの y=0 から**置く(見本の座標をそのまま使える)。ヒーロー画像はヘッダーの下に潜る。
- **≤768px** ではヘッダーは 56px・`position:sticky`・流れの中に入る(重ならない)。ロゴ + ハンバーガー(44px)。開くと 4 つのナビ + 検索/お気に入り(全部 44px 以上)。
- ナビのリンク先: トップ `/proto-gourmet/n`・さがす `/proto-gourmet/n/search`・店舗紹介 `/proto-gourmet/n/shop/sample`・特集 `/proto-gourmet/n/feature`(`common/nav.ts`)。
- `SectionHeading`(`title` `lead` `href` `linkLabel`): 大きな明朝の見出し + 灰色のリード + 右端の「すべて見る →」。見出しの大きさは `--gn-h-fs`(既定 24u)で変える。
- `Decor.tsx`: `<Townscape/>` `<LeafSpray/>` `<Twig/>`(透過 webp の飾り。`className`/`style` で幅・位置を決める。幅は `width: calc(var(--u) * N)`)。
- `.gn-linen`: 麻の紙の地(薄い織り目 + ざらつき。外部画像なし)。`.gn-script`: 筆記体の英字。`.gn-mincho`。

## 寸法: `--u`

`--u` = **見本の 1 画素**。PC(>768px)で `--u = min(100cqw, 1440px) / 1086`(`.gn-root` の幅が基準。画面幅 1086px でちょうど 1px、1440px で約 1.326px、それより広い画面は 1440px で止まる)。

見本の画像で測った数字 N をそのまま書く:

```css
.gn-top-hero { position: absolute; left: calc(var(--u) * 72); top: calc(var(--u) * 347); width: calc(var(--u) * 191); height: calc(var(--u) * 37); }
.gn-top-h1   { font-size: calc(var(--u) * 33); }
```

- 小さい字が潰れる所は `max(11px, calc(var(--u) * 10))` のように下限を付ける。
- `.gn-wrap` = 幅 `1086u` の中央寄せの容器(1440px より広い画面で中身を中央に置く)。横いっぱいの背景は `.gn-root` 直下に置けばよい。
- `.gn-root` は `container-type:inline-size`。`position:fixed` の子は `.gn-root` が基準になるので、固定表示は避けて absolute / sticky を使う。
- **≤768px では `--u` は 1px 固定**(誤って使っても崩れない程度)。スマホは `@media (max-width: 768px)` の中でふつうの px / % / clamp() で書く。見本は PC 版だけなので、「縦に積む・本文 14px 以上・押す所 44px 以上・横スクロール無し」を基本に組む。

## パレット(CSS 変数・`.gn-root` 内で使える)

| 変数 | 値 | 用途 |
|---|---|---|
| `--gn-bg` | `#faf9f5` | ページの地 |
| `--gn-paper` | `#fdfcfa` | 紙・カードの白 |
| `--gn-linen` | `#efeae2` | 統計帯などの生成りの地 |
| `--gn-linen-deep` | `#dccebe` | 暖簾の麻地 |
| `--gn-terracotta` | `#b35431` | ボタン・下線・リンク |
| `--gn-terracotta-deep` | `#9d4025` | ボタンの濃い側 |
| `--gn-red` | `#a5503a` | 赤い暖簾の地 |
| `--gn-red-num` | `#8c2d17` | 大きな数字(509 / 41 / 7) |
| `--gn-green` | `#34452f` | 深い緑の暖簾 |
| `--gn-ink` / `--gn-ink-soft` | `#2a2521` / `#4a423c` | 見出し・本文 |
| `--gn-muted` | `#6f6660` | 灰色の説明文 |
| `--gn-line` | `#d9cfc2` | 罫線 |

## 書体(`common/fonts.ts`・3 ファミリーだけ。増やさない)

| 変数 | 書体 | 用途 |
|---|---|---|
| `--gn-f-mincho` | Shippori Mincho(400/500/600/700) | 見出し・ロゴ・ナビ |
| `--gn-f-gothic` | Zen Kaku Gothic New(400/500/700) | 本文・注記・ボタン(`.gn-root` の既定) |
| `--gn-f-script` | Mrs Saint Delafield | 手書き筆記体の英字(Noren Gallery / Find your area / Good food Good time) |

`font-family: var(--gn-f-mincho)` のように **`--gn-f-*`** を使う(next/font の素の変数 `--gn-mincho` 等にフォールバックを付けたもの)。

## 画像
- 共通の飾り(透過 webp): `/_portal/gnoren/common/townscape.webp`(街並みの線画 784×128)・`leaf-spray.webp`(水彩の葉の枝 384×468)・`twig.webp`(赤茶の小枝 288×228)。見本から背景色を抜いて切り出したもの。
- ページ別の写真・飾りは `public/_portal/gnoren/<top|search|shop|feature|featurelist>/` に webp で置く。見本から切り出して使う(見本は 1086px 幅なので、荒くなる所は後で素材に置き換える)。
- 注意: `/_portal/*` は公開スイッチ OFF のとき next.config.ts で 404。ローカルは `PORTAL_LAUNCHED=1`、Vercel プレビューは常に ON。
