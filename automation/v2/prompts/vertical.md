
# 業種: {{VERTICAL}} — 店の紹介記事{{FEATURE_TITLE_SUFFIX}}を書く
この店は、マチノワの「{{VERTICAL}}」の店ページ(住所・営業時間などはサイトが別に出す)に載せる紹介記事を持ちます。
見本(事実だけで書かれた既存の記事)は `{{WORK}}/example-article.json`{{EXAMPLE_FEATURE_NOTE}}。**型と語り口の見本であって、内容を真似してはいけません。**

## 種類(category)
この店の種類を、次の slug から 1 つ選ぶ(決められないときは失敗の出口): {{CATEGORY_LIST}}
`category.evidence` に、選んだ根拠(Google マップの業種の表示・公式サイトの事実)を 1 文で書く。

## 紹介記事(article)の書き方(です・ます調。見本のとおり)
- `headline`: その店を事実だけで言う 1〜2 文(例「長野県野沢温泉村、長坂ゴンドラ乗り場の目の前にある小さなホテル。洋室・和室・和洋室がある」)。料金・人気・おすすめは入れない。
- `lede`: 2〜3 文。「<住所の市区町村>にある「店名」です。」で始め、いちばん大事な事実を続ける。
- `sections`: 2〜4 つ(各 `heading` と `body`)。1 つの body は 100〜260 字ほど。事実の足りない節は作らない。
  {{SECTION_HINT}}
  住所・電話・営業時間は、サイトが別に出すので、節に長く書かない(アクセスの説明に必要な範囲だけ)。営業時間は書くなら Google マップの表と同じにする。
- `menus`: 公式サイトで名前が分かる主なメニュー・コース・体験の名前(最大 8。名前だけ。料金は入れない)。無ければ空配列。
{{ROOMS_RULE}}- `tags`: 店の特徴の札。使えるのは {{ALLOWED_TAGS}} だけ。付けるには、その事実を裏付ける facts の番号(`factIndex`。facts の配列の 0 始まりの位置)が要る。根拠が無ければ付けない(空配列でよい)。
- `placeOverride`: 通常は書かない(省略)。

{{FEATURE_BLOCK}}
## 写真の割り当て(photoPlan){{PHOTOPLAN_NOTE}}
- `photos` には、cand/manifest.json にある **全部の候補** について、use / what / kind / reason を書く。使う写真(use=true)は **全部が店ページに載ります**(枚数の上限は無い)。使えない写真だけ use=false にする。
{{PHOTOPLAN_FEATURE}}
## 出力ファイル `{{OUT}}` の形(これ以外のキーは足さない)
```json
{
  "status": "ok",
  "category": { "slug": "...", "evidence": "..." },
  "article": {
    "headline": "...",
    "lede": "...",
    "sections": [ { "heading": "...", "body": "..." } ],
    "menus": [ { "name": "..." } ],
{{ROOMS_JSON}}    "tags": [ { "tag": "...", "factIndex": 0 } ]
  },
{{FEATURE_JSON}}  "photos": [ { "id": "g01", "use": true, "what": "...", "kind": "exterior", "reason": "" } ],
  "facts": [ { "claim": "...", "source": "https://... か maps", "quote": "..." } ],
  "sources": [ { "label": "公式サイト", "url": "https://..." } ],
  "notes": "判断に迷った点があれば 1〜2 文(任意)"
}
```
`sources` には、実際に事実を取った公式サイトのページ(label は「公式サイト」「公式サイト(客室)」など)を入れる。Google マップは機械が足すので入れなくてよい。
