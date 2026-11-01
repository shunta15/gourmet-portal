# 暖簾 2 本番化(ページ担当向けの約束)

設計: `components/portal/gnoren/REAL_PLAN.md`(必ず先に読む)。試作の作り: `components/portal/gnoren/README.md`(`--u`・パレット・書体・Shell)。
ブランチ `feat/gourmet-noren2`(worktree `gp-k-gnoren`)。この README の「土台」は土台担当が作った。ページ担当は **土台(`common/`・`real/common/`・`app/gourmet/layout.tsx`)を編集しない**。足したいものは自分のフォルダに置く(どうしても共通に要るときは統合担当に頼む)。

## 6 ページと担当の置き場所

| 本物の URL | 内部パス(page.tsx) | 担当の部品 | データ変換(サーバー専用) | Shell の page |
|---|---|---|---|---|
| /gourmet | `app/gourmet/page.tsx` | `real/top/` | `lib/portal/gnoren/top.ts` | `"top"` |
| /search | `app/gourmet/search/page.tsx` | `real/search/` | `lib/portal/gnoren/search.ts` | `"search"` |
| /restaurant | `app/gourmet/restaurant/page.tsx` | `real/search/`(札の並び) | `lib/portal/gnoren/search.ts` | `"shop"` |
| /restaurant/<id> | `app/gourmet/restaurant/[id]/page.tsx` | `real/shop/` | `lib/portal/gnoren/shop.ts` | `"shop"` |
| /feature/<id> | `app/gourmet/feature/[id]/page.tsx` | `real/article/` | `lib/portal/gnoren/article*.ts` | `"feature"` |
| /feature | `app/gourmet/feature/page.tsx` | `real/featurelist/` | `lib/portal/gnoren/featurelist.ts` | `"feature"` |

- 自分が触ってよい範囲 = 自分の `app/gourmet/.../page.tsx`・`components/portal/gnoren/real/<自分>/`・`lib/portal/gnoren/<自分>.ts`・`public/_portal/gnoren/<自分>/`(飾り画像を足すとき)。
- `components/portal/gnoren/<top|search|shop|feature|featurelist>/`(試作の部品・CSS)は**読むだけ・import するだけ**。試作 `/proto-gourmet/n` を壊さないため編集しない。CSS は試作の CSS を import して使い、実データで必要な追加だけ `real/<自分>/real.css` に足す。
- クラス名の接頭辞は試作と同じ(`gn-top-` `gn-search-` `gn-shop-` `gn-feat-` `gn-fl-`)。追加分は `gn-top-r-` のように `-r-` を挟むと衝突しない。
- page.tsx は **`generateMetadata`・`metadata`・JSON-LD・`generateStaticParams`・`dynamicParams`・`assertPortalLive()`・`notFound()` の部分を残し**、描画する部品だけ差し替える。**`export const revalidate` は書かない**(ISR は管理画面の保存で作り直す。`lib/revalidatePlan.ts`)。

## 枠(Shell)の使い方 — layout ではなく各 page.tsx で付ける

`app/gourmet/layout.tsx` は **フォント 3 つ + base.css + `assertPortalLive()` だけ**(`NorenFrame` はやめた)。ヘッダー・フッターは各 page.tsx が付ける(ナビの下線のタブがページごとに違うため)。

```tsx
import Shell from "@/components/portal/gnoren/common/Shell";
import { GN_LIVE_LINKS } from "@/components/portal/gnoren/common/nav";

export default async function Page() {
  assertPortalLive();
  // …データ取得…
  return (
    <Shell page="top" links={GN_LIVE_LINKS}>
      <main>…</main>
    </Shell>
  );
}
```

- `links` の既定は `GN_LIVE_LINKS`(省略してよいが、読みやすさのため明示を推奨)。`GnLinks = { top, search, shopList, feature, saved }`。本番 = `{ top:'/gourmet', search:'/search', shopList:'/restaurant', feature:'/feature', saved:'/list' }`。試作は `GN_PROTO_LINKS`(試作の 5 ページはもう渡してある)。
- Header: ロゴ → `links.top`・虫眼鏡 → `links.search`・ハート → `links.saved`。ナビは `gnNav(links)`(トップ/さがす/店舗紹介/特集)。
- Footer: 見本の構成のまま、いちばん下に小さな 1 行「マチノワ トップ(/)・動画(/videos)・写真(/photos)」(12〜13px の灰色)。
- `<main>` はページ側で書く。**Shell の中に旧い枠(NorenFrame / withLegacyFrame)を入れ子にしない**。

### 【暫定】まだ差し替えていないページの旧い枠 — `withLegacyFrame`

layout から NorenFrame を外したので、**今の 6 つの page.tsx は旧部品のまま、末尾で `export default withLegacyFrame(LegacyPage)`(feature/page.tsx は `withLegacyFrame(NewFeatureIndexPage)`)として旧い枠(`components/portal/noren/NorenFrame` = 旧ヘッダー・フッター・紙・grain・Boot・noren.css/dye.css/ground.css)を付けている**。つまり差し替え前の見た目は今までどおり。
- 差し替えるとき: 自分の page.tsx で `LegacyPage` を `export default async function Page(` に戻し、`withLegacyFrame` の import と末尾の export を**消し**、`<Shell …>` で包む。
- `common/legacyFrame.tsx` は 6 ページすべてが外れたら統合担当が消す(担当は消さない)。
- 旧部品が必要とする CSS(`noren.css`・`dye.css`・`ground.css`・フォント brush/latin)は NorenFrame が import するので、旧枠を外したページでは読み込まれない。新部品は暖簾 2 の CSS だけで描くこと(旧 `vN-` `vBk-` `vI-` のクラスに頼らない)。

## 土台の道具(`components/portal/gnoren/real/common/`)

`import { … } from "@/components/portal/gnoren/real/common"`(index)。ただし **`'use client'` の部品が import してよいのは `types`・`text`・`links` だけ**(`@/components/portal/gnoren/real/common/text` のように個別に)。`img.ts` はサーバー用(lib/portal/noren/shop.ts 等を読む)なので、クライアントからは import しない(結果の URL 文字列だけ props で渡す)。

| 名前 | 種類 | 内容 |
|---|---|---|
| `GnArticleVM` | 型 | 特集記事ビュー(REAL_PLAN.md の定義そのまま)。変換 = `lib/portal/gnoren/article.ts`、描画 = `real/article` の `ArticleView` |
| `GnShopCard` | 型 | 店の札 `{ id, name, href, img?, nearest?, desc?, tags, cuisineKeys, region, town?, sceneSlugs, isNew? }`。軽い(クライアントへ渡せる。約 509 件で数百 KB に収める) |
| `allShopPhotos(r)` | サーバー | 店の全写真 = `heroImagesOf(r)`→`r.gallery`→`r.image` の和集合・重複除去・`isUsableFeatureImage`(食べログ/_placeholder/表示禁止)除外。空配列もある(0 枚なら写真の節を出さない) |
| `imgProps(src, w, sizes?)` | サーバー | `{ src, srcSet?, sizes? }`。`/restaurants/`・Wikimedia・Unsplash は縮小版、他はそのまま。`<img {...imgProps(u, 640)} loading="lazy" decoding="async" alt="" />`。sizes 既定は札の幅(`CARD_SIZES`)。幅いっぱいの写真は `"100vw"` 等を渡す |
| `paragraphs(text, target=110)` | 純関数 | `lib/portal/photoFeature/build.ts` の `paragraphs` と同じ挙動(「\n」の 2 文字と実改行で段落に分け、文を約 110 字にまとめる。末尾 28 字未満は前へ) |
| `firstSentences(text, n)` | 純関数 | 本文の先頭 n 文(。！？区切り)。紹介 2 行 = `firstSentences(desc, 2)` |
| `isPriceSpec(k)` | 純関数 | 項目名に 予算・料金・価格・¥・￥・円 を含むか。specs の金額行を除くのに使う(`!isPriceSpec(k)`) |
| `fmtDate(s)` | 純関数 | ISO・`YYYY-MM-DD`・`YYYY/MM/DD` → `YYYY.MM.DD`(読めなければ元の文字列) |
| `shopHref(id)` | 純関数 | `/restaurant/<id>` |
| `featureHref(id)` | 純関数 | `lib/portal/noren/onePage.ts` の `featureHrefOf` と同じ(今は `NOREN_ONE_PAGE=false` なので常に `/feature/<id>`) |
| `searchHref({region,cuisine,scene,q,town})` | 純関数 | `/search?q=&region=&town=&cuisine=&scene=`(空は付けない)。タグは `?tag=` を自分で足す |

共通の見た目の道具(`common/` = 試作と同じ): `Shell`・`SectionHeading`・`Decor`(`Townscape`/`LeafSpray`/`Twig`)・`.gn-linen`・`.gn-script`・`.gn-mincho`・`.gn-wrap`・`--u`・パレット変数(試作 README 参照)。

## `'use client'` の規約(CLAUDE.md「クライアントバンドル規約」・postbuild で検査)
- `'use client'` の部品、およびそこから import される部品は `@/lib/data`・`lib/*Features*`・`lib/teleapo-*`・`real/common/img.ts`(サーバー用)を import しない。
- データはサーバーの page.tsx / `lib/portal/gnoren/*.ts` で整形し、軽い props(`GnShopCard[]`・`GnArticleVM` 等)で渡す。型は `import type`。
- 画像は CSS background-image ではなく `<img>` + `imgProps`。ファーストビュー以外は `loading="lazy" decoding="async"`。

## 確認コマンド
- `npx tsc --noEmit` と `npm run lint`(自分の担当ぶんは必ず 0 エラー)。
- ローカル: `PORTAL_LAUNCHED=1 npx next dev -p <空きポート>`(公開スイッチ OFF だと /gourmet 系は 404)。自分で起動した dev サーバーだけ止める。
- `npm run build`(postbuild の bundle 検査を含む)は重いので、統合担当が全体で 1 回回す。担当は `'use client'` の import に気を付けるだけでよい。
- 試作 `/proto-gourmet/n`・`/proto-gourmet/n/search` などが 200 で今までどおり出ること(`Shell` に links を渡している)。

## 見本の仮の言葉を出さない
REAL_PLAN.md「共通の決まり」を厳守(架空の店名・人名・値段・住所電話・日付・見本のキャッチコピー・「準備中」・数の直書きを出さない。値段を新しく出さない。人の発言を作らない)。
