# 暖簾2 本番化の設計(2026-11-02 オーナー決定「暖簾2 で決定。公開まで持ってって。既存の記事とかも全て書き換えて」)

対象: グルメの本番 6 種のページを、試作 `/proto-gourmet/n`(components/portal/gnoren)と同じ見た目で、**実在の店・記事のデータ**で出す。
「既存の記事を全て書き換える」= 記事 760 本(公開 609 + 限定公開 151)の**表示**を暖簾2 の形にする。**本文の文章・DB は書き換えない**(事実を作らない)。

| 本物の URL | 内部パス(page.tsx はそのまま使う) | 見本 | 新しい中身 |
|---|---|---|---|
| /gourmet | app/gourmet/page.tsx | 1 トップ | `gnoren/real/top` |
| /search | app/gourmet/search/page.tsx | 2 さがす | `gnoren/real/search` |
| /restaurant | app/gourmet/restaurant/page.tsx | 無し | `gnoren/real/search` の札の並び(見出し「店舗紹介」・24 店/ページ) |
| /restaurant/<id> | app/gourmet/restaurant/[id]/page.tsx | 3 店 | `gnoren/real/shop` |
| /feature/<id> | app/gourmet/feature/[id]/page.tsx | 4 店の特集記事 | `gnoren/real/article`(店 1 軒 582・シーン別まとめ 24・街歩き 154 の 3 種とも) |
| /feature | app/gourmet/feature/page.tsx | 5 特集一覧 | `gnoren/real/featurelist` |

## 変えないもの
- URL・next.config.ts の rewrites/redirects・canonical・metadata・JSON-LD・robots(index/noindex)・sitemap・OG 画像。**page.tsx の generateMetadata と JSON-LD の部分は残し、描画する部品だけ差し替える。**
- 限定公開(lib/unlisted.ts)151 店・151 記事: 一覧・さがす・sitemap に出さず noindex、直接 URL は 200。非表示 4 店(lib/hiddenStores.ts)は出さない。
- 他サイト評価の除去(lib/otherSiteRatings.ts)はデータ層で掛かったまま。
- ISR: `export const revalidate` を**書かない**(main の perf/isr-on-save の決まり)。`dynamicParams = true`・`generateStaticParams = liveStaticParams(...)` は今のまま。
- 試作 `/proto-gourmet/n`(仮データ版)は壊さない(Shell に links を渡せるようにして、試作は試作のリンクのまま)。
- 他業種・総合トップ・/videos・/photos・/list・404 は触らない。

## 置き場所(担当ごとに分ける。common/ と real/common/ は土台担当だけが触る)
```
components/portal/gnoren/
  common/            既存(Shell/Header/Footer/...)。土台担当が「links prop」「フッター小リンク」を足す
  real/common/       土台担当: 型・画像・リンク・文の共通の道具(サーバー専用 OK)
  real/top/  real/search/  real/shop/  real/article/  real/featurelist/   各ページ担当
lib/portal/gnoren/   サーバー専用のデータ変換(店→札、記事→記事ビュー)。各ページ担当が自分のファイル名で置く(top.ts, search.ts, shop.ts, article*.ts, featurelist.ts)
public/_portal/gnoren/   飾りの画像はそのまま使う。見本から切り出した「店・料理・人物の写真」は本番では使わない
```
クラス名の接頭辞は試作と同じ(`gn-top-` `gn-search-` `gn-shop-` `gn-feat-` `gn-fl-`)。CSS は試作の CSS を**複製せず import して使い**、実データで必要な追加だけ `real/<page>/real.css` に足す(見た目は見本と同じに保つ)。

## 共通の決まり(全ページ)
1. **見本の仮の言葉を出さない。** 架空の店名(あかり食堂・風待ち・四季の味 たなか 等)・人名(佐藤 健一)・値段(1,380円 等)・架空の住所電話(マチノワ市・03-1234-5678)・架空の日付(2024.xx)・見本のキャッチコピー(「布越しに見える、街の美味しい景色。」「街の、あたたかな食卓を訪ねて」「食でつながる…」「今、読みたい」等)・「準備中」・「509 店舗/41 エリア」の直書き。数は必ずデータから数える。
   - トップの見出し・リードは、今の本番の文(lib/portal/noren/entranceCopy.ts にある確定済みの文)を一字一句使う。無い箇所は店・記事の実データの文か、ナビの語(「店をさがす」「店舗紹介」「特集」)だけ。
   - 英字の飾り(MACHINOWA GOURMET / GOOD FOOD / GOOD NEIGHBORS の筆記体)はサイトの飾りとして残してよい。
2. **配置と札の枚数は変えない。** 見本の枚数(トップ: 料理 7・エリア 8・シーン 6・特集 4。さがす: 料理 7・エリア 8・シーン 7。特集一覧: 布札 7・新着 5・注目 1)は実データで**必ず埋める**。
   - 料理 7 = lib/cuisineBroad.ts の BROAD_GROUPS(見本と名前まで同じ)。
   - エリア 8 = 店数の多い地域(REGIONS の key)上位 8。さがすの ?region= は 41 地域すべてを受けるので、8 の丸の下に小さな「ほかの地域」の select を 1 つだけ置く(見本に無い唯一の追加。理由: 旧 URL /region/<key> → /search?region=<key> の 41 地域を受けるため)。
   - シーン 6/7 = lib/scenes.ts の 12 種から店数の多い順(トップ 6・さがす 7)。
   - 特集一覧の布札 7 のテーマは、実在の記事が 1 本以上ある分け方で 7 つ(担当が lib/portal/noren/featureList.ts の THEME_GROUPS・lib/scenes.ts・街歩き・地域別から選び、理由を README に書く)。
3. **写真は実物だけ。** 店の写真は `heroImagesOf(r)` と `r.gallery`・`r.image` の和集合(重複除去・lib/portal/noren/usableImage.ts の isUsableFeatureImage で食べログ/_placeholder/表示禁止を除外)。記事は buildPhotoFeature と同じ出どころ(店の写真 + lib/featureSpotPhotos)。
   - 枠より写真が少ないときは、**空の枠を残さず詰める**(ギャラリー 5 枠に 2 枚なら 2 枚の並びにする。0 枚ならその節を出さない)。AI 画像・見本の切り出し写真・真っ黒な仮画像(featureSingle.ts の DUMMY)で埋めない。
   - `/restaurants/` 配下の画像は `sized(url, w)` / `sizedSrcSet(url)`(lib/imageUrl.ts)で縮小版を使い、ファーストビュー以外は `loading="lazy" decoding="async"`。
   - 暖簾・提灯・葉・小枝・街並み線画・麻の布・地図の絵(トップ・さがすの日本地図の意味で使うもの)は**サイトの飾り**なので残してよい。
4. **値段を新しく出さない。** 見本の「おすすめ定食 1,380円」のような金額の枠は作らない。店の budget・specs の「予算」「料金」行は出さない。本文の文章は変えない(本文中の金額は現状維持)。
5. **人の名前・発言を作らない。** 見本の「店主 佐藤 健一さん」の枠は、データに店主名が無いので**出さない**。代わりに記事の `quote`(マチノワ編集部の言葉)をメモ紙の引用に使う(quoteCite はデータの値)。
6. **'use client' の部品から `@/lib/data`・`lib/*Features*`・`lib/teleapo-*` を import しない**(scripts/check-client-bundle.sh が build を落とす)。データはサーバーの page.tsx / lib/portal/gnoren/*.ts で整形し、軽い props で渡す。
7. スマホ(≤768px)は試作と同じ(縦 1 列・本文 14px 以上・押す所 44px 以上・横スクロール無し)。
8. 文言の禁止: 「公式サイトによると」等の出どころの言い回し・「その他」・「No.1」・星・口コミ・他サイト評価。「おすすめ・人気・厳選」は可。

## 共通の土台(土台担当。最初に 1 名)
- `git merge origin/main`(競合なしを確認済み。ISR の決まりを取り込む)。
- `common/nav.ts`: `GnLinks` 型 `{ top, search, shopList, feature, saved }` と、本番用 `GN_LIVE_LINKS = { top:'/gourmet', search:'/search', shopList:'/restaurant', feature:'/feature', saved:'/list' }`、試作用 `GN_PROTO_LINKS`(今の /proto-gourmet/n 系)。`Shell`/`Header`/`Footer` に `links` prop(既定 GN_LIVE_LINKS)。試作の 5 ページは `links={GN_PROTO_LINKS}` を渡す。Header の虫眼鏡 → links.search、ハート → links.saved。
- `Footer`: 見本の構成はそのまま、いちばん下に小さな 1 行「マチノワ トップ(/)・動画(/videos)・写真(/photos)」を足す(グルメから総合トップ・動画・写真へ戻る道が無くなるため。既存 FootSmall の文言を使う)。
- `app/gourmet/layout.tsx`: NorenFrame → gnoren の Shell + フォント(試作 layout と同じ fonts.ts の className と base.css)。`page` の下線は各 page.tsx から渡せるように、Shell を layout ではなく各 page.tsx で使う構成でもよい(担当が判断。ただし 6 ページとも同じ方法)。
- `real/common/`: `img.ts`(店の全写真を集める `allShopPhotos(r)`、記事の写真列)、`text.ts`(行の分割 `splitLines(text, maxChars)`、金額行の除外 `isPriceSpec(k)`)、`links.ts`(店ページ・記事ページ・さがすの絞り込み URL を作る)、`types.ts`(下の記事ビューの型)。
- `real/README.md`: 各ページ担当への約束(上の表・置き場所・型)。

### 記事ビューの型(土台担当が `real/common/types.ts` に置く。記事担当 2 名が同じ型を使う)
```ts
export type GnArticleVM = {
  id: string; kind: 'single' | 'roundup' | 'walk';
  kicker: string; title: string; subtitle?: string; lede: string[]; date: string; // 日付は記事の date(YYYY.MM.DD)
  hero?: { src: string; alt: string };                      // 無い記事は無し(5 本)
  chapters: Array<{                                          // 見本の章 01/02/03 の組を章の数だけ繰り返す(1〜6)
    no: string; label: string; heading: string; body: string[];
    photos: Array<{ src: string; alt: string }>;             // 0〜3 枚。無ければ写真無しの章
    note?: string;                                           // メモ紙(短い一文)。無ければ出さない
    shop?: { id?: string; name: string; href?: string; info: Array<[string, string]> }; // まとめ・街歩きの店/スポット
  }>;
  quote?: { text: string; cite: string };                    // 編集部の言葉(メモ紙の引用)
  closing?: string[];
  shop?: { id: string; name: string; href: string; info: Array<[string, string]>; mapsUrl?: string }; // 店 1 軒の記事で対の店があるとき(376 本)
  related: Array<{ id: string; title: string; href: string; img?: string; date?: string }>;
};
```

## 各ページの決まり
### トップ(`real/top`)
- 統計 3 = 掲載店数(getAllRestaurants の件数)・地域数(その店の region の種類数)・料理分類 7。
- 料理 7 の写真 = その分類の店の写真を 1 枚(店 ID の若い順で最初に写真のある店)。エリア 8 の縦写真 = その地域の店の写真。シーン 6 の写真 = そのシーンの店の写真。特集 4 = 日付の新しい記事 4 本(lib/data.ts の FEATURES 178 本から。見出し=title、サブ=subtitle か lede の先頭、写真=heroImage)。
- 見出し h1・リード・各節のリード・ボタンの文は entranceCopy.ts の確定文を使う。ボタンのリンク先は links。

### さがす(`real/search`)
- サーバー: 今の app/gourmet/search/page.tsx と同じく `getAllRestaurants()` → `toSearchShop` 相当の軽い札データ(509 件・約 270KB)を props で渡す。
- クライアント(SearchView を実データ用に改造): URL の `?q= ?region= ?town= ?cuisine= ?scene= ?tag= ?page=` を読む(useSearchParams)。今の NorenSearch と同じ意味で絞る(scene は lib/portal/noren/sceneMatch.ts の規則。クライアントに持ち込めない場合は、サーバーで店ごとに scene のスラッグ配列を付けて渡す)。1 ページ 24 店・`?page=`。並べ替え 3 種(おすすめ=今の既定順・新着・名前)。グリッド/リスト切替・ハートは lib/portal/savedList(あれば)に繋ぐ。
- 札: 店名・最寄り(nearest)・紹介 2 行(desc の先頭)・タグ 2(tags から)・写真は店の最初の写真。
- 「地図から探す」の板: 既存の地域ピンの日本地図(components/portal/noren/OpenSearchBlock の地図部分を流用可)を出し、ピン=/search?region=。「準備中」は出さない。
- 店舗紹介一覧(/restaurant): 同じ札の並び。見出し「店舗紹介」と件数、24 店/ページ、絞り込み無し(今の app/gourmet/restaurant/page.tsx の決まり)。

### 店(`real/shop`)
- 店名は 1 行(`r.name`)+読み(lib/portal/readings.ts があれば)。ヒーロー = 全写真の 1 枚目(無ければ暖簾の布だけ)。
- ヒーローの短冊 3 本 = `r.highlights` の先頭 3(無ければ desc を文で分けた先頭 3)。紹介文 = desc。タグ 3 = 料理分類・地域・シーン(店の tags から)。
- 「おすすめメニュー」4 枠 → **「この店のおすすめ」**: highlights / body の段落 / desc から 4 項目(名前+説明。値段無し)。写真はギャラリーに使わなかった写真があれば添える。
- ギャラリー 5 枠 = 全写真(ヒーロー除く)を詰めて並べる。0 枚なら節ごと出さない。
- 「利用シーン」4 枠 = 店の tags に合う lib/scenes.ts のシーン(店数の多い順に最大 4)。写真は残りの写真、無ければ文だけ。
- 店舗情報 7 行 = 住所・営業時間・定休日・電話・席数・アクセス(nearest)の**あるものだけ**(「禁煙・喫煙」はデータに無いので出さない。予算は出さない)。地図 = 今の店ページ(components/portal/pages/gourmet-noren-shop.tsx)と同じ Google マップの出し方。
- 関連記事 = 対の記事(ARTICLE_STORE_ID_BY_FEATURE の逆引き)を先頭に、lib/portal/noren/shopFeatures.ts の featuresOfShop(最大 3)。対の記事があるときはヒーロー近くに「この店の特集記事を読む →」(見本の「店舗の詳細を見る」と対になる導線)。

### 特集記事(`real/article`。2 名: A=部品、B=変換)
- A(部品 `ArticleView`): `GnArticleVM` を受けて見本 4 の見た目で描く。**PC も固定高さ(1448u)をやめ、章の組を縦に繰り返す可変高さ**にする(各章の中の配置・写真の置き方・メモ紙の位置は見本の章 01/02/03 の組をそのまま使い、章の数だけ互い違いに繰り返す)。見出し・本文は `white-space: nowrap` をやめ、幅で折り返す(1 行約 30 字は CSS の幅で自然に出す)。写真 0〜3 枚で崩れない。店主の枠は無し。帯(見本の「おすすめ定食」)は `closing` の文の帯にする。右下の店舗情報の箱と「店舗の詳細を見る →」は `shop` があるときだけ。
- B(変換 `lib/portal/gnoren/article.ts`): 3 種の記事 → `GnArticleVM`。
  - 店 1 軒(isSingleShopFeature): 章 = ranking の POINT ごと(3〜5)。heading=name、body=desc を段落に、photos=buildPhotoFeature と同じ出どころで章に 0〜3 枚ずつ配る(合計は実在の枚数まで)、note=specs の 1 行(金額を除く)。`ranking[i].purpose` は内部の指示文なので**出さない**。shop = 対の店(pairedShopOfFeature ではなく ARTICLE_STORE_ID_BY_FEATURE の完全一致で引く)。
  - シーン別まとめ(isSceneShopFeature): 章 = 店ごと(3〜6)。heading=店の heading か店名、body=desc、photos=その店の images、shop={name, href=/restaurant/<id>, info=specs(予算を除く)}。
  - 街歩き・コース: 章 = スポットごと(3〜6)。photos=images(Wikimedia の外部 URL のまま)、shop={name, info=specs(料金を除く)}、href 無し。
  - 非表示店の記事 2 本は今までどおり出さない。限定公開は noindex のまま出す。
- 既存の振り分け表(onePage.ts・onePageUnlisted.ts)に**依存しない**(表に無い 38 本も isSingleShopFeature で店 1 軒として出す)。

### 特集一覧(`real/featurelist`)
- 布札 7 = 7 テーマ(上の決まり)。押すと同じページ内のそのテーマの節へ。各節にそのテーマの記事の札(FEATURES 178 本。店 1 軒の記事は並べない=今の決まり)。
- 新着 5 = 日付の新しい 5 本。注目 1 = 新着の 1 本目。日付は記事の date。写真は heroImage。
- URL の `?region= ?theme= ?tag= ?q=` は今のページが受けるので、絞り込みがあるときは結果の節だけを出す(見本の上部はそのまま)。

## 確認(担当が自分で・確認役が全体で)
- `npx tsc --noEmit`・`npm run lint`・`npm run build`(postbuild の bundle 検査を含む)。
- ローカル(`PORTAL_LAUNCHED=1 npx next start` か dev)で全 URL を叩く: /gourmet・/search(主要な絞り込み 10 通り)・/restaurant(全ページ)・/restaurant/<全 660 店>・/feature・/feature/<全 760 本>。200 以外 0 件。HTML に見本の仮の語(あかり食堂/風待ち/佐藤 健一/1,380/03-1234-5678/2024./駅周辺/中心街/布越し/準備中)が 0 件。
- 写真が 1 枚も出ない店・記事の数を全件で数えて報告(3 店・5 本の見込み)。
- 見た目: 1086・1440・390 幅で各ページ種(トップ・さがす・店舗紹介一覧・店・店 1 軒記事・まとめ記事・街歩き記事・特集一覧)を撮り、見本と並べる。
