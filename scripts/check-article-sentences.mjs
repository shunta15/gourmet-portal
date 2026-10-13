#!/usr/bin/env node
// 生成直後の記事の文を、型ごとの語で調べる検査（AI の自己申告に頼らない・決定的）。
//
// 背景（2026-10-13・オーナー指示）:
//   サイトは画面に出す直前に、次の型の文を文ごと取り除いている
//   （lib/otherSiteRatings.ts / lib/thinSentences.ts）。ところが記事を作る側（local-pipeline.sh）は
//   「自己チェック」を claude に頼むだけで、同じ型を機械的に見つけて止める検査が無かった。
//   画面で落とす文は ID ごと・文の完全一致の表なので、新しく生成した記事の文は表に無く、そのまま出てしまう。
//   → 生成の時点で、同じ型を機械的に見つけて、公開前に書き直させる／その文を落とす。
//
// 型（thin_dropped_sentences の実例に合わせた）:
//   R  他サイト（食べログ・Google の口コミ・SNS など）の評価・口コミ・点数に触れる文
//   A  分からなかった・確認できなかったことを書く文
//   B  調べ方の舞台裏を書く文
//   C  どの店にも言える決まり文句・締めの定型・記事の案内文（「編集部イチオシ」「これ、地味に効く。」 など）
//   D  行ったふり（来店したかのような体験・感想）
//   E  裏付けの無い評価・人気（「支持されている」「評判」「人気」「親しまれている」「おすすめ」 など）
//
// 使い方:
//   node scripts/check-article-sentences.mjs <記事ID>             検査。当たりがあれば exit 1
//   node scripts/check-article-sentences.mjs <記事ID> --fix       安全に落とせる文だけ lib/teleapo-features.ts から落とす
//                                                                  （落とせない文が残れば exit 1・全部直れば exit 0）
//   node scripts/check-article-sentences.mjs --all [--types=A,C]  全記事の件数と例（誤検出の確認用・書き込まない）
//   --file=<path>  対象のファイルを差し替える（試験用。既定は lib/teleapo-features.ts）
//   --json         結果を JSON で出す
//
// --fix の方針: 「文ごと取るだけ」（書き換え・言い換え・書き足しはしない）。次の場合は触らず「要書き直し」で残す:
//   ・取ると、その欄（lede / 視点の説明 / quote / closing など）が空になる
//   ・取った次の文が「そのため」「ただし」「それは」のように前の文に頼る書き出しで、意味が通らなくなるおそれがある
//   ・見出し（視点の name）・subtitle に当たった（取ると欄ごと消えるので書き直しが必要）
//
// 照合は文字列の語の検出だけ。店名・記事ID の照合には使わない（中間一致の禁止は店名⇔記事IDの話）。

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';

// ------------------------------------------------------------------
// 型ごとの語（誤検出を避けるため、できるだけ具体的な言い回しに絞る）
//   strong = 機械で落としてよい確度の高い言い回し（--fix の対象）
//   weak   = 書き直しは求めるが、事実（メニュー名・実用の注意）と区別がつかないので機械では落とさない
// ------------------------------------------------------------------

const re = (parts) => new RegExp(parts.join('|'));

/** 賞・選出（残す。口コミ語の判定には当てない） */
const AWARD = /百名店|ミシュラン|ビブグルマン|Bib|アワード|Award|受賞|選出|選ばれ/i;

/** A: 分からなかった・確認できなかったことを書く */
const A_STRONG = re([
  '確認(?:でき(?:ない|なかった|ず|ません|ていない)|が取れ(?:ない|ず|て(?:いない|おらず))|は取れ)',
  '裏付け(?:が|は)?(?:取れ|得られ|とれ|できな)',
  '裏付けとなる',
  '(?:情報|記載|公式|公開|詳細|詳しい|具体的|正確|データ|案内|サイト|SNS|掲載|一次)[^。]{0,24}(?:分から|わから|見当たら|見つから|読み取れ)(?:ない|なかった|ず|ません)',
  '断定(?:は(?:でき|避け)|でき(?:ない|ず)|しにく)',
  '触れ(?:られ(?:て|ず|ない)|て(?:い|お)ら?(?:ない|ず))',
  '(?:公開|案内|掲載|記載)(?:され|し)て(?:いない|おらず|いません)',
  '(?:公開|案内|掲載|記載)(?:が|は)(?:ない|なく|見当たら)',
  '明らかにされて(?:いない|おらず)',
  '情報(?:は|が)(?:少な|乏し|限られ|不足)',
  '非公開',
  '一次情報',
  '知る手がかり',
  '手がかり(?:は|が)(?:少な|乏し|ない|限られ)',
  '示すことができ(?:ない|ず)',
  '判断(?:しきれ|でき(?:ない|ず))',
]);
const A_WEAK = re([
  '(?:分|わ)から(?:ない|なかった|ず)(?:部分|点|こと)',
]);

/** B: 調べ方・書き手の舞台裏 */
const B_STRONG = re([
  '(?:ここでは|ここまでは?)[^。]{0,30}(?:確認(?:でき)?た|裏付け|公開(?:情報|され)|事実だけ)',
  '確認でき(?:た|ている)(?:事実|情報|範囲|内容)',
  '踏み込(?:ま|め)',
  'あらためて断っ',
  '先に正直',
  '正直なところ[^。]{0,6}(?:書|言)',
  '断っておき',
  'お断り',
  '(?:公開|掲載)(?:して|されて)(?:いる|おり)(?:写真|画像)',
  '写真から[^。]{0,6}(?:読み取|わか|分か|確認)',
  '調べ(?:た|て)(?:限り|範囲)',
  '調べてみ(?:る|た)',
  '出典(?:を|は)[^。]{0,6}(?:探|あた|たど)',
  '業態から(?:導|読み|見え)',
  '一般的に見えてくる',
]);
const B_WEAK = re([
  '写真から見え',
  '情報源',
]);

/** C: どの店にも言える決まり文句・締めの定型・記事の案内文 */
const C_STRONG = re([
  '編集部(?:の)?イチオシ',
  'と聞(?:いたら|けば)[^。]{0,20}(?:思い出|名前が挙が|名前を挙げ|思い浮かべ|真っ先|まず)',
  '(?:覚えておき(?:たい)?|覚えておいて(?:損は)?(?:ない|ありません)?|記憶しておきたい|思い出(?:したい|しておきたい|していい|してほしい)|名前が挙が(?:る|ってほしい|ってくる|ってもおかしくない)|名前を(?:挙げ|覚え)(?:たい|ておきたい)|候補に(?:入れ|挙げ|加え)(?:て(?:おきたい|ほしい|よい))?|選択肢に(?:加え|入れ)(?:て)?(?:おきたい|やすい|ほしい))[^。]{0,16}(?:一軒|店|お店|存在|名前|住所|場所)(?:だ|です|である|だろう|だと思う|と言える|といえる|になる)?。?$',
  '(?:一軒|店|お店|存在|名前)を(?:頭の隅に置|記憶し|覚えてお)',
  '頼りになる(?:一軒|存在|店)',
  'ぜひ(?:訪れて|訪ねて|立ち寄って)(?:み)?(?:て)?(?:ほしい|ください)',
  '地味に(?:効く|大きい)',
  '(?:5|五|５)つの(?:ポイント|視点)[^。]{0,16}(?:紹介|読み解|見て|分けて|解説|から)',
  '(?:この記事|本記事|今回)(?:では|は|で)[^。]{0,40}(?:紹介|見ていき|読み解|ご案内|整理)',
  '(?:見ていく|見ていきたい|読み解いていく|紐解いていく|紹介していく)。?$',
  '^それが、?[^。]{0,16}(?:本質|醍醐味|強み|価値|正体|面白さ)(?:だ|である|でもある|になっている)',
  '^(?:しかし|だが|ただ)、?(?:ここ|この店|[^。、]{1,14})(?:は|も)(?:違う|逆だ)',
  '通(?:う|いたくなる)理由はここにある',
  '使い方はさまざまだ',
]);
const C_WEAK = re([]);

/** D: 行ったふり（来店したかのような書き手の体験・感想） */
const D_STRONG = re([
  '感じた。?$',
  '感じられた。?$',
  '感じさせられた',
  '印象に残った',
  '印象的だった',
  '心に残った',
  '気がする。?$',
  '実際に[^。]{0,12}(?:みないと|でしか|してみて初めて)',
  'ひとくち(?:食べ|口に)(?:る|た)と',
  '一口(?:食べ|口に)(?:る|た)と',
  '口にした(?:瞬間|とたん)',
  '(?:伺った|いただいた|頂いた|食べた|訪れた)ところ',
  '筆者',
  '編集部(?:員)?(?:が|は)[^。]{0,10}(?:訪れ|食べ|飲|伺|取材|行っ)',
  '取材(?:した|で|に伺)',
]);
const D_WEAK = re([
  '食べてみると',
  '訪れてみると',
  '足を運んでみると',
  '入ってみると',
  '(?:私|わたし)(?:たち)?(?:は|が)',
]);

/** E: 裏付けの無い評価・人気（店の評判を語る言い回しは strong。おすすめ・人気の語そのものは weak） */
const E_STRONG = re([
  '支持(?:され|を集|を得)',
  '親しまれ',
  '愛され',
  '評判',
  '好評',
  '定評',
  '名店',
  '実力派',
  '知る人ぞ知る',
  '口コミで広が',
  '高く評価',
  '高評価',
  '評価(?:が|も)高',
  '評価され',
  '評価を(?:得|受け|集め)',
  '定番(?:店|の店|スポット)',
  '地元に定着',
  'として定着',
  '人気(?:店|の一軒|のお店|の店|を集|を博|が高|No|ナンバー|メニュー|商品)',
  '一番人気|人気ナンバー',
  '話題の(?:店|一軒)',
]);
const E_WEAK = re([
  '人気',
  '(?:おすすめ|オススメ)(?!(?:する|します|したい|いたします))',
  '(?:お勧め|お薦め)(?!(?:する|します|したい|いたします))',
  '重宝',
]);
// 実用の注意（「…をお勧めする」）・メニュー名や黒板の「おすすめ」は事実なので weak にも当てない
const E_FACT_CONTEXT = /(?:お勧め|おすすめ|お薦め|オススメ)(?:する|します|したい|いたします)|(?:その日|季節|今月|本日|日替わり)の?(?:お勧め|おすすめ)|「(?:お勧め|おすすめ)」|(?:おすすめ|お勧め)[ぁ-んァ-ヶー一-龥]{0,6}(?:コース|セット|メニュー|ランチ|三種|定食|ドリンク|宴会|品|一品)/;

/** R2: 口コミ・レビューの中身を引く文（賞・選出の語があれば当てない） */
const R2_RE = /口コミ|クチコミ|レビュー|書き込み/;

const TYPE_LABEL = {
  R: '他サイトの評価・口コミ',
  A: '分からなかったことを書く文',
  B: '調べ方の舞台裏',
  C: '決まり文句・締めの定型・記事の案内文',
  D: '行ったふり',
  E: '裏付けの無い評価・人気',
};

// ------------------------------------------------------------------
// 他サイト評価の判定は lib/otherSiteRatings.ts（画面で落とす側）と同じ関数を使う（単一の定義）
// ------------------------------------------------------------------
let stripRating = null;
try {
  const m = await import(new URL('../lib/otherSiteRatings.ts', import.meta.url).href);
  stripRating = m.stripOtherSiteRating;
} catch {
  stripRating = null; // 読めない環境では R2_RE だけで判定する（警告は --verbose 以外では出さない）
}

/** 1 文を調べて、当たった型・語・機械で落としてよいか(auto)を返す（当たらなければ null） */
export function classifySentence(sentence) {
  const s = String(sentence).trim();
  if (!s) return null;
  if (stripRating) {
    let stripped = s;
    try { stripped = stripRating(s); } catch { stripped = s; }
    if (stripped !== s) return { type: 'R', word: '他サイトの点数・評価・件数', auto: true };
  }
  if (R2_RE.test(s) && !AWARD.test(s)) return { type: 'R', word: s.match(R2_RE)[0], auto: true };
  // strong を型の順に、見つからなければ weak を型の順に
  const strong = [['A', A_STRONG], ['B', B_STRONG], ['D', D_STRONG], ['C', C_STRONG], ['E', E_STRONG]];
  for (const [type, r] of strong) {
    const m = s.match(r);
    if (m) return { type, word: m[0], auto: true };
  }
  const weak = [['A', A_WEAK], ['B', B_WEAK], ['D', D_WEAK], ['E', E_WEAK]];
  for (const [type, r] of weak) {
    const m = s.match(r);
    if (!m) continue;
    if (type === 'E' && E_FACT_CONTEXT.test(s)) continue;
    return { type, word: m[0], auto: false };
  }
  return null;
}

// ------------------------------------------------------------------
// teleapo-features.ts の読み取り（記事ごとのブロックから文章欄を取り出す）
// ------------------------------------------------------------------

const DEFAULT_FILE = fileURLToPath(new URL('../lib/teleapo-features.ts', import.meta.url));
// 文章欄: 記事本体の lede / quote / closing / subtitle、視点の name（見出し）と desc
const FIELD_RE = /^(\s*)(lede|quote|closing|subtitle|desc|name):(\s*)"((?:[^"\\]|\\.)*)"/gm;

function articleBlocks(src) {
  const marks = [];
  for (const m of src.matchAll(/^\s*id:\s*"([^"]+)"\s*,/gm)) marks.push({ id: m[1].normalize('NFC'), at: m.index });
  return marks.map((x, i) => ({ id: x.id, start: x.at, end: i + 1 < marks.length ? marks[i + 1].at : src.length }));
}

/** 文に分ける（「。」「！」「？」の直後で切る。区切りは前の文に付ける） */
export function splitSentences(text) {
  return String(text).split(/(?<=[。！？])/).filter((x) => x.length > 0);
}

/** ブロックの文章欄を { field, valueStart, valueEnd, raw } の配列にする（src 上の位置つき） */
function fieldsOf(src, block) {
  const body = src.slice(block.start, block.end);
  const out = [];
  FIELD_RE.lastIndex = 0;
  let m;
  while ((m = FIELD_RE.exec(body))) {
    const valueStart = block.start + m.index + m[0].length - m[4].length - 1; // 先頭の " の次
    out.push({ field: m[2], raw: m[4], valueStart, valueEnd: valueStart + m[4].length });
  }
  return out;
}

const DANGLING_START = /^(?:そのため|それゆえ|だからこそ|だから|そこで|そして|また|ただし|しかし|だが|それでも|もっとも|つまり|それは|それが|これは|これが|そこが|そこは|その上|そのうえ|さらに|なお)/;

/** 1 記事の検査。{ hits: [{field, index, sentence, type, word, fixable, reason}], fields } */
export function inspectArticle(src, id) {
  const block = articleBlocks(src).find((b) => b.id === id.normalize('NFC'));
  if (!block) return null;
  const fields = fieldsOf(src, block);
  const hits = [];
  for (const f of fields) {
    const sentences = splitSentences(f.raw);
    sentences.forEach((sent, index) => {
      const c = classifySentence(sent.replace(/\\n/g, ' '));
      if (!c) return;
      hits.push({ field: f.field, fieldStart: f.valueStart, index, sentence: sent, ...c });
    });
    // 取れるかどうかの判定（欄ごとに）
    const hitIdx = new Set(hits.filter((h) => h.fieldStart === f.valueStart).map((h) => h.index));
    for (const h of hits.filter((x) => x.fieldStart === f.valueStart)) {
      let reason = null;
      if (!h.auto) reason = '語だけでは事実（メニュー名・実用の注意）と区別がつかないので、機械では落とさない（書き直しで対応）';
      else if (f.field === 'name' || f.field === 'subtitle') reason = '見出し・サブタイトルは取ると欄ごと消えるので書き直しが必要';
      else if (sentences.length === hitIdx.size) reason = 'この欄の文が全部当たっていて、取ると欄が空になる';
      else {
        // この文（と、続けて当たっている文）を取った後に最初に残る文
        const next = sentences.findIndex((_, i) => i > h.index && !hitIdx.has(i));
        if (next !== -1 && DANGLING_START.test(sentences[next].trim())) {
          reason = '次の文が「そのため」「ただし」のように前の文に頼る書き出しで、取ると意味が通らなくなるおそれがある';
        }
      }
      h.fixable = reason === null;
      h.reason = reason;
    }
  }
  return { id: block.id, hits, fieldCount: fields.length };
}

/** 落とせる文を src から取り除いた新しい src を返す */
export function applyFix(src, result) {
  const fixable = result.hits.filter((h) => h.fixable);
  // 位置ずれを避けるため、後ろの欄・後ろの文から処理する
  const byField = new Map();
  for (const h of fixable) {
    const arr = byField.get(h.fieldStart) || [];
    arr.push(h);
    byField.set(h.fieldStart, arr);
  }
  let out = src;
  const starts = [...byField.keys()].sort((a, b) => b - a);
  for (const start of starts) {
    // 現在の src 上でこの欄の値の範囲を取り直す（後ろ側から処理しているので start は有効）
    const re = /((?:[^"\\]|\\.)*)"/y;
    re.lastIndex = start;
    const m = re.exec(out);
    if (!m) continue;
    const raw = m[1];
    const sentences = splitSentences(raw);
    const drop = new Set(byField.get(start).map((h) => h.index));
    const kept = sentences.filter((_, i) => !drop.has(i)).join('');
    out = out.slice(0, start) + kept + out.slice(start + raw.length);
  }
  return out;
}

// ------------------------------------------------------------------
// CLI
// ------------------------------------------------------------------

function parseArgs(argv) {
  const flags = {};
  const pos = [];
  for (const a of argv) {
    if (a.startsWith('--')) {
      const [k, ...rest] = a.slice(2).split('=');
      flags[k] = rest.length ? rest.join('=') : true;
    } else pos.push(a);
  }
  return { flags, pos };
}

function report(result, asJson) {
  if (asJson) return;
  console.log(`📝 文の検査: ${result.id} — 当たり ${result.hits.length}文`);
  for (const h of result.hits) {
    const mark = h.fixable ? '落とせる' : '要書き直し';
    console.log(`   [${h.type}:${TYPE_LABEL[h.type]}] ${h.field}(${h.index + 1}文目)「${h.word}」 ${mark}${h.reason ? '（' + h.reason + '）' : ''}`);
    console.log(`      ${h.sentence.trim().slice(0, 120)}`);
  }
}

async function main() {
  const { flags, pos } = parseArgs(process.argv.slice(2));
  const file = typeof flags.file === 'string' ? flags.file : DEFAULT_FILE;
  const src = readFileSync(file, 'utf-8');

  if (flags.all) {
    const want = typeof flags.types === 'string' ? new Set(flags.types.split(',')) : null;
    const total = { R: 0, A: 0, B: 0, C: 0, D: 0, E: 0 };
    let articlesHit = 0;
    const blocks = articleBlocks(src);
    const examples = [];
    for (const b of blocks) {
      const r = inspectArticle(src, b.id);
      const hits = r.hits.filter((h) => !want || want.has(h.type));
      if (hits.length) articlesHit++;
      for (const h of hits) { total[h.type]++; examples.push({ id: b.id, ...h }); }
    }
    console.log(JSON.stringify({ articles: blocks.length, articlesHit, byType: total }));
    if (flags.examples) for (const e of examples) console.log(`${e.id}\t${e.type}\t${e.field}\t${e.word}\t${e.sentence.trim().slice(0, 100)}`);
    return 0;
  }

  const id = pos[0];
  if (!id) {
    console.error('usage: node scripts/check-article-sentences.mjs <記事ID> [--fix] | --all [--types=A,C] [--examples]');
    return 2;
  }
  let result = inspectArticle(src, id);
  if (!result) {
    console.error(`❌ 記事ID「${id}」が ${file} に見つからない`);
    return 2;
  }
  if (!flags.json) report(result, false);

  if (flags.fix && result.hits.some((h) => h.fixable)) {
    const fixed = applyFix(src, result);
    writeFileSync(file, fixed);
    const after = inspectArticle(fixed, id);
    console.log(`✂️  落とせる文 ${result.hits.filter((h) => h.fixable).length}文を ${file} から落とした`);
    result = after;
    if (!flags.json) report(result, false);
  }

  if (flags.json) console.log(JSON.stringify(result));
  if (result.hits.length === 0) {
    if (!flags.json) console.log('✅ 型 R/A/B/C/D/E に当たる文なし');
    return 0;
  }
  return 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(await main());
}
