# PageMotion(data 属性で動く汎用の動き)

既存の class・DOM は変えず、要素に `data-mo-*` 属性を付けるだけで動く。属性が無い要素・ページには何も起きない。

## 置き方

各業種の外枠に 1 つだけ置く(複数あっても `<html data-mo-fx>` の印で 1 つ目だけが動く)。

```tsx
import PageMotion from "@/components/portal/motion/PageMotion";

<PageMotion />
<section>
  <h2 data-mo="wipe">見出し</h2>
  <ul data-mo-group="100">
    <li data-mo="up">…</li>
    <li data-mo="up">…</li>
  </ul>
  <div style={{ overflow: "hidden" }} data-mo-p="zoom"><img src="…" alt="" /></div>
</section>
```

`prefers-reduced-motion: reduce` では JS は何もせず、CSS が全部「表示済み」にする。JS が無い環境でも最初から見える。

## 属性一覧

| 属性 | 値 | 働き |
| --- | --- | --- |
| `data-mo` | `up`(既定・空でも可) / `fade` / `left` / `right` / `zoom` / `pop` / `wipe` / `blur` / `draw` | 画面に入ると 1 回だけ出る(`is-in` が付く)。`draw` は stroke の SVG の線が描かれる(path に `pathLength="1"` が要る) |
| `data-mo-group` | 数値(ms。空なら 80) | 中の `[data-mo]` を順番 × この値だけずらす(最大 12 番目で頭打ち。`--mo-d`) |
| `data-mo-delay` | ms | その要素の遅れ。順番より優先 |
| `data-mo-px` | -0.3〜0.3 | 画面中心とのずれ × 倍率で縦に動く(視差。`--mo-y`) |
| `data-mo-p` | 空 / `zoom` | 画面を通り抜ける進み具合 0〜1 を `--mo-p` に書く。`zoom` は直下の `img` が最大 6% 寄る |
| `data-mo-hover` | `lift` / `zoom` / `tilt` / `sweep`(空白区切りで複数可) | 触ったときの反応。lift = 3px 浮く、zoom = 中の img が寄る、tilt = 傾く(マウスのみ)、sweep = 明るさだけ上げる |
| `data-mo-press` | (なし) | 押している間 scale .97(スマホのタップ用) |
| `data-mo-live` | `kb` / `float` / `sway` | ずっと動く。kb = 写真のゆっくりした寄り、float = ふわふわ、sway = ゆらゆら。画面外・非表示タブでは止まる |
| `data-mo-live-delay` | 秒 | `animation-delay` |

`data-mo-p` の値は各業種の CSS で自由に使える。例: `scale: calc(1 + var(--mo-p, 0) * .06)`。

## 注意

- `tilt` は `transform` を使う。**既に `transform` のある要素には付けない**(上書きされる)。
- `zoom`(hover / `data-mo-p`)・`kb` は画像がはみ出すので、**入れ物に `overflow: hidden`** を付ける。
- `data-mo` は `opacity` / `translate` / `scale` / `clip-path` / `filter` の `transition` を持つ。**自分で `transition` を持つ要素に付けると上書きされる**ので、親(または内側のラッパー)に付ける。
- 文字や顔写真に重なる飾りを `data-mo-px` で動かさない(位置がずれて読めなくなる)。
- `data-mo-px` / `lift` / `float` は `translate`、`data-mo-live="sway"` は `rotate`、`kb` / `zoom` / `pop` は `scale` を使う。同じ要素に同じプロパティを使う属性を重ねない。

## 同じ要素に重ねてよい組み合わせ(ここに無い組み合わせは、親子に分けて付ける)

| 組み合わせ | 可否 | 理由 |
| --- | --- | --- |
| `data-mo` + `data-mo-hover="zoom"` | 可 | zoom は中の img だけを触る |
| `data-mo` + `data-mo-hover="lift"` | 可 | hover 中だけ 0.35s、戻りは出現と同じ 0.9s(柔らかく戻る) |
| `data-mo` + `data-mo-hover="tilt"` | 可(tilt は transform の無い要素だけ) | 両方の transition を持つ規則がある |
| `data-mo`(up/fade/left/right/wipe) + `data-mo-press` | 可 | 同上 |
| `data-mo="pop"` / `"zoom"` + `data-mo-press` | 不可 | scale を取り合う |
| `data-mo` + `data-mo-px` / `data-mo-live="float"` | 不可 | translate を取り合う |
| `data-mo-hover="zoom"` + `data-mo-live="kb"`(同じ img) | 不可 | scale を取り合う(animation が勝つ) |
| `data-mo="wipe"` を自分の `clip-path` を持つ要素に | 不可 | 斜めの切り抜きが消える |
| `data-mo-hover="sweep"` を自分の `filter` を持つ要素に | 不可 | drop-shadow 等が消える |
| `data-mo-hover="zoom"` を既に hover で拡大する img の入れ物に | 不可 | 二重になる |
