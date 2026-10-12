/**
 * 写真が主役の形（1 店 1 ページ）の、2 つの字の「自動の決め方」（表に無い店・記事に当てる。純関数。fs・process は使わない）。
 *  1. autoGateUnits: 入口の暖簾（WebGL の布）に染め抜く字。店名から、業態・料理名・支店名・地名・読みがなを外して屋号の核を取る。
 *  2. autoNrWord: 視点（見どころ）の頭に掛ける小さな暖簾の語。見出しの中の、名詞らしい漢字・カタカナの連なりを選ぶ。
 * どちらも、決めた字が屋号・見出しとして読めるかを一覧で目で見て、おかしいものは featured.ts の ID の表で個別に直す（表が先、無ければここの自動）。
 * 店名・見出しに無い字・語は作らない（切り出すだけ）。
 */

/* ───────────────────────── 1. 入口の暖簾の字 ───────────────────────── */

/** 暖簾に染め抜く字は 7 字（語）まで。PC は 1 枚に 1〜2 字・スマホは 3 枚まで（Gate.tsx の distribute）。これを超える名前は自動では決めない（null。表で決める） */
export const GATE_MAX_UNITS = 7;

/** 業態・料理名・店の種類の語（屋号の核にならない語）。長い語を先に */
const DESC_WORDS = [
  "イタリア料理", "フランス料理", "日本料理", "中華料理", "韓国料理", "沖縄料理", "郷土料理", "欧風料理", "創作料理", "シーフード", "カジュアル",
  "ダイニング", "レストラン", "リストランテ", "トラットリア", "オステリア", "イタリアン", "フレンチ", "ビストロ", "スペイン", "ライブ",
  "お食事処", "食事処", "定食屋", "居酒屋", "喫茶", "カフェ", "珈琲", "コーヒー", "ベーカリー", "お好み焼き", "グルテンフリー", "ジンギスカン",
  "ホルモン", "ステーキ", "鉄板", "焼き鳥", "焼鳥", "焼肉", "近江牛", "和牛", "炭火", "ラーメン", "らーめん", "拉麺", "つけ麺", "担々麺", "汁なし",
  "蕎麦", "そば", "うどん", "饂飩", "ピザ", "薪窯", "串カツ", "串揚げ", "天ぷら", "天丼", "うなぎ", "鰻", "海鮮", "鮮魚", "寿司", "鮨", "すし", "割烹", "会席", "懐石",
  "中華", "和食", "洋食", "洋めし", "創作", "個室", "地酒", "炉端", "酒場", "食堂", "ワイン", "バル", "バー", "麺や", "キッチン",
  "dining", "kitchen", "restaurant", "bistro", "cafe", "café", "coffee", "bar", "lunch", "beans", "shop", "steak", "house",
].sort((a, b) => b.length - a.length);

/** 句の区切り・つなぎの字 */
const JOIN = /^[\s・･·\-–—_/／|｜,，.。、!！?？♪★☆&＆「」『』"“”'’~～〜()（）[\]【】:：]+$/;

const isLatinWord = (s: string) => /^[A-Za-z0-9&'.é\-]+$/.test(s);
const hasJa = (s: string) => /[\u3040-\u30ff\u4e00-\u9fff]/.test(s);

/** 店名のかっこ・読みがな・別の屋号などを落とす */
function cleanName(raw: string): string {
  let s = raw.normalize("NFKC");
  s = s.replace(/[【\[][^】\]]*[】\]]/g, " ");
  const q = s.match(/[『「]([^』」]+)[』」]/);
  if (q) s = q[1];
  s = s.replace(/\([^)]*\)/g, " ");
  s = s.replace(/\s+[/]\s+.*$/, " ");
  s = s.replace(/\s*-[^\s-]+-\s*/g, " ");
  s = s.replace(/-[A-Za-z]+\s*$/, " ");
  s = s.replace(/\s+by\s+.*$/i, " ");
  s = s.replace(/[〜~][^〜~]*[〜~]/g, " ");
  return s.replace(/[\s　]+/g, " ").trim();
}

/** 日本語の字と欧文の境目・欧文の語の境目（大文字の始まり）で、空白がなくても語に分ける */
function splitSegments(s: string): string[] {
  const out: string[] = [];
  for (const part of s.split(" ").filter(Boolean)) {
    // 日本語の連なり / 欧文の連なり に分ける
    const runs = part.match(/[A-Za-z0-9&'.éÉ\-]+|[^A-Za-z0-9&'.éÉ\-]+/g) ?? [part];
    for (const r of runs) {
      if (/^[A-Za-z]/.test(r) && /[a-z][A-Z]/.test(r)) {
        // OyatsuBoxPiyo → Oyatsu / Box / Piyo（小文字のあとの大文字で分ける）
        out.push(...r.replace(/([a-z])([A-Z])/g, "$1 $2").split(" "));
      } else out.push(r);
    }
  }
  return out.filter((x) => x.length > 0);
}

const descWordRe = (w: string) => new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
/** 語（業態・料理名）だけでできた連なりか（つなぎの字は無視） */
function isPureDesc(seg: string): boolean {
  let t = seg;
  for (const w of DESC_WORDS) t = t.replace(new RegExp(descWordRe(w).source, "gi"), "");
  t = t.replace(/[と・&＆の\s]/g, "");
  return t.length === 0;
}
/** 業態・料理名の語で終わる連なりか（「讃岐うどん」「海カフェ」「寿司割烹」など） */
function endsWithDesc(seg: string): boolean {
  return DESC_WORDS.some((w) => seg.toLowerCase().endsWith(w.toLowerCase()));
}
/** 先頭から、業態・料理名の語を続けて落とす（残りが 2 字以上のときだけ）。落としたあとの「の」「と」も落とす */
function stripLeadingDesc(seg: string): string {
  let t = seg;
  let changed = true;
  while (changed) {
    changed = false;
    for (const w of DESC_WORDS) {
      if (t.toLowerCase().startsWith(w.toLowerCase())) {
        const rest = t.slice(w.length).replace(/^の/, "");
        if (Array.from(rest).length >= 2) {
          t = rest;
          changed = true;
        }
        break;
      }
    }
  }
  return t;
}

/** 欧文の語の字: 欧文だけの屋号で 1 語・5 字以下なら 1 字ずつ、それより長ければ語ごと（日本語の字と並ぶときも語ごと） */
function latinUnits(words: string[], alone: boolean): string[] {
  if (alone && words.length === 1 && words[0].length <= 5) return Array.from(words[0]);
  return words;
}

/**
 * 店名から、入口の暖簾に染め抜く字（1 字ずつの並び。欧文の語は 1 つ）を決める。
 * 規則: ① かっこ・読みがな（-ひろ-・（アンジェロ））・別の屋号（" / …"）・「by …」を落とす → ② 空白と日本語/欧文の境目で分ける
 *  → ③ 業態・料理名（居酒屋・カフェ・寿司割烹…）だけの区切り・支店名（本店・○○店・○○の店）・地名（area にある）・つなぎ（& ・）を外す。外すと何も残らなければ外さない
 *  → ④ 先頭に業態・料理名が続くときは外す（残りが 2 字以上のとき）。業態の語で終わる区切りに、屋号らしい区切りが続くときは、前の区切りを外す
 *  → ⑤ 漢字・かなは 1 字ずつ（「・」「ー以外の記号」は落とす。長音「ー」は残す）。欧文は 5 字以下の 1 語なら 1 字ずつ・長ければ語ごと。
 * 7 字（語）を超える・何も残らないときは null（表で決める）。
 */
export function autoGateUnits(name: string, area = ""): string[] | null {
  const segs0 = splitSegments(cleanName(name));
  if (segs0.length === 0) return null;
  const place = area.split("・").pop()?.replace(/[市区町村郡]$/, "") ?? "";
  const isBranch = (s: string) => /^(?:本店|支店|[^\s]{1,6}店|[^\s]{1,10}の店|専門店)$/.test(s) && !isLatinWord(s);
  const isPlace = (s: string) => hasJa(s) && Array.from(s).length >= 2 && place.length >= 2 && (place.includes(s) || s.includes(place));
  let segs = segs0.filter((s) => !JOIN.test(s));
  const latinOnly = segs.every((s) => isLatinWord(s) || hasJa(place) && isPlace(s));
  const keep = segs.filter((s) => !isBranch(s) && !isPlace(s) && (latinOnly ? true : !isPureDesc(s)));
  if (keep.length > 0) segs = keep;
  else {
    const k2 = segs.filter((s) => !isBranch(s) && !isPlace(s));
    if (k2.length > 0) segs = k2;
  }
  // 業態の語で終わる区切りに、屋号らしい区切りが続くとき（日本語どうし）は、前の区切りを外す
  if (segs.length >= 2) {
    const head = segs[0];
    if (hasJa(head) && endsWithDesc(head) && segs.slice(1).some((s) => !isPureDesc(s)) && Array.from(head).length <= 8) segs = segs.slice(1);
  }
  // 欧文だけの名前は、語をそのまま全部使う（業態の語も屋号の一部として）。長ければ null（表で決める）
  // 先頭の業態の語（空白なしでつながっているもの）を落とす
  if (segs.length >= 1 && !isLatinWord(segs[0])) {
    const t = stripLeadingDesc(segs[0]);
    if (t !== segs[0]) segs = [t, ...segs.slice(1)];
  }
  // 字に分ける
  const units: string[] = [];
  let latin: string[] = [];
  const alone = segs.every(isLatinWord);
  const flush = () => {
    if (latin.length) units.push(...latinUnits(latin, alone));
    latin = [];
  };
  for (const s of segs) {
    if (isLatinWord(s)) {
      latin.push(s.replace(/^[-&]+|[-&]+$/g, ""));
      continue;
    }
    flush();
    for (const ch of Array.from(s)) if (!JOIN.test(ch)) units.push(ch);
  }
  flush();
  const out = units.filter((u) => u.length > 0);
  if (out.length === 0 || out.length > GATE_MAX_UNITS) return null;
  return out;
}

/* ───────────────────────── 2. 小さな暖簾の語 ───────────────────────── */

/** 一般的すぎる語・見出しの核にならない語（小さな暖簾には選ばない） */
const NR_STOP = new Set([
  "毎日", "妥協", "最良", "最高", "最適", "最大", "最小", "最初", "最後", "最近", "最寄", "本質", "本気", "一筋", "普通", "日常", "普段", "非日常", "特別", "独自", "独特", "個性", "個人", "自然",
  "時間", "時間帯", "空間", "場所", "営業", "営業時間", "営業情報", "営業設計", "営業形態", "営業スタイル", "昼間営業", "利用", "提供", "展開", "重視", "工夫", "魅力", "特徴", "実際", "目安", "使い方", "使い分け", "組み合わせ",
  "全体", "全部", "全国各地", "以上", "以下", "以外", "以内", "週末", "平日", "休日", "曜日", "昼夜", "昼間", "夜間", "今日", "明日", "必要", "可能", "確認", "要確認", "予約", "確保", "選択", "選択肢", "対応", "実現",
  "維持", "継続", "追加", "充実", "用意", "構成", "構造", "設計", "運営", "経営", "管理", "準備", "計画", "手配", "対象", "内容", "状況", "条件", "基本", "基準", "方法", "方針", "考え方", "気軽", "気楽", "快適", "安心",
  "安定", "安価", "手頃", "適度", "適切", "十分", "充分", "多様", "多彩", "豊富", "豊か", "複数", "単独", "同時", "同士", "両方", "双方", "余裕", "余白", "余韻", "雰囲気", "居心地", "心地", "心地よさ", "使い勝手",
  "過ごし方", "楽しみ方", "味わい方", "選び方", "目的", "理由", "意味", "意識", "印象", "感覚", "風景", "景色", "光景", "様子", "表情", "姿勢", "距離", "範囲", "規模", "程度", "数字", "金額", "値段", "料金", "価格", "価格帯", "予算",
  "公式情報", "成立", "徒歩圏", "徒歩", "一皿", "一軒", "一杯", "一品", "一人", "一枚", "一日", "一席", "一室", "一角", "ひとり", "リズム", "スタイル", "サービス", "アクセス", "オリジナル", "スマート", "コンパクト", "ボリューム",
  "リピーター", "オンライン", "ビジネス", "セレクト", "プラン", "メニュー", "ランチ", "ディナー", "スタッフ", "全席", "全席禁煙", "禁煙", "喫煙", "店内空間", "空間設計", "地域密着", "来店", "来店前", "店内", "店構", "客席", "座席", "総座席",
  "カフェメニュー", "近隣", "周辺", "立地", "駅近", "駅前", "中心部", "市内", "町中", "町中華", "街中", "商店街",
  "判断", "価値", "事実", "前提", "希少性", "圧倒的", "体験", "主役", "顧客", "再開", "夕方", "メートル", "キャラクター", "夜型営業", "二部制営業", "営業日", "清潔感", "定休", "不定休", "放題", "貸切", "法事",
  "無理", "登場", "位置", "ルート", "完結", "自由", "自分", "更新", "水準", "学生", "規模感", "便利", "手作", "徹底", "調理", "平日", "料金設計", "価格戦略", "価格設計", "営業体制", "配慮", "注意点", "何度目", "何時", "合間",
  "向き", "中心", "距離", "位置取り", "来店", "価格", "通り", "素材", "最低", "一通り", "直結", "気前", "両方", "東京", "マネー", "コード", "現金", "電話", "会計", "仕切", "駅", "数分", "徒歩数分", "徒歩五分", "徒歩十五分", "徒歩三分", "ロケーション", "スペース", "チーフ", "ランク", "カード", "ドラム", "ユリ", "デパート", "ガラス", "ルール", "ダレ", "クロス",
]);

/** 助数詞（数のあとにつく字）。「二十席」「八百円」「時半」のような数の言い方は、語にしない */
const NUM_START = /^[一二三四五六七八九十百千万〇]+/;
const COUNTER = /[時円席分歳種品名台軒本枚人階畳号年月日回度個店半弱超以]/;

/** 連なり（漢字・カタカナ。漢字の間の「ヶ・ケ・ノ」は連なりに含める）。切られた語（長すぎる連なりの一部）は出さない */
const NR_RUN = /[\u4e00-\u9fff々](?:[ヶケノ]?[\u4e00-\u9fff々])*(?:[みりき][\u4e00-\u9fff々]+)?|[ァ-ヶー]+/g;

const SPECIFIC_RE = /駅|町|通|橋|市|区|山|川|港|寺|神社|公園|温泉|屋$/;

/** 連なりを、小さな暖簾に掛けられる語（漢字 2〜5 字・カタカナ 2〜6 字）にする。使えなければ null。next は連なりの直後の 2 字（動詞の語幹・名詞化の送りがなを見分ける） */
function nrCandidate(run: string, next = "", ignoreStop = false, prev = ""): string | null {
  let w = run;
  // 直前が助詞以外のひらがな（そば屋出身 の「屋出身」など）の連なりは、語の途中なので使わない
  if (/[ぁ-ん]/.test(prev) && !/[のをがにでとはもへやか]/.test(prev)) return null;
  const kataRun = /^[ァ-ヶー]+$/.test(run);
  if (!kataRun && /^[ぁ-ん]/.test(next)) {
    const c = next[0];
    const c2 = next[1] ?? "";
    // 名詞の形の送りがな（仕込み・手作り・焼き・磯部揚げ）は、語に含める。「の・を・が…」の助詞に続く連なりはそのまま。それ以外のひらがなが続く連なりは、動詞・形容詞の語幹（見極める・活かす）なので使わない
    if (/[みりちきびげ]/.test(c) && Array.from(run).length >= 2 && (c2 === "" || !/[ぁ-ん]/.test(c2) || /[のをがにでとはもへやか]/.test(c2))) w = run + c;
    else if (!/[のをがにでとはもへやかまよ]/.test(c)) return null;
  }
  // 「○○駅徒歩」「○○駅南口」のように駅のあとに続く字は、駅までにする
  const ek = w.indexOf("駅");
  if (ek >= 1 && ek < w.length - 1) w = w.slice(0, ek + 1);
  const len = Array.from(w).length;
  const kata = /^[ァ-ヶー]+$/.test(w);
  if (kata ? len < 2 || len > 6 : len < 2 || len > 5) return null;
  if (!ignoreStop && NR_STOP.has(w)) return null;
  if (!kata) {
    const num = w.match(NUM_START);
    if (num) {
      const rest = w.slice(num[0].length);
      if (rest.length === 0 || (COUNTER.test(rest[0]) && Array.from(rest).length <= 2) || rest[0] === "駅") return null;
    }
    if (COUNTER.test(w[0]) && len <= 3) return null;
    if (/^[ぁ-ん]/.test(w)) return null;
    if (/[はがをにでと]$/.test(w) && len <= 2) return null;
  }
  if (/^ー/.test(w)) return null;
  if (!kataRun && (/[的]$/.test(w) || (/[性感]$/.test(w) && len >= 3))) return null;
  return w;
}

/**
 * 見出しから、小さな暖簾に掛ける語（2〜5 字）を選ぶ。見出しの中にある連なりだけを切り出す（作らない）。
 * 候補: 漢字（2〜5 字）・カタカナ（2〜6 字）の、途中で切られていない連なり。一般的すぎる語（NR_STOP）・数の言い方・使用済みの語を外す。
 * 点: 駅名・固有名らしい語、カタカナの名詞、3〜4 字の語を高く、見出しの前のほうの語をわずかに高く。無ければ見出しの最初の漢字・カタカナの 2 字。
 */
export function autoNrWord(name: string, used: ReadonlySet<string> = new Set()): string {
  const text = name.normalize("NFC");
  const firstEnd = text.search(/[、。]/);
  const cands: { w: string; score: number }[] = [];
  for (const m of text.matchAll(NR_RUN)) {
    const w = nrCandidate(m[0], text.slice((m.index ?? 0) + m[0].length, (m.index ?? 0) + m[0].length + 2), false, text[(m.index ?? 0) - 1] ?? "");
    if (!w || used.has(w)) continue;
    const at = m.index ?? 0;
    const len = Array.from(w).length;
    const kata = /^[ァ-ヶー]+$/.test(w);
    let score = kata ? (len >= 3 ? 5 : 2) : len === 3 ? 4 : len === 4 ? 5 : len === 5 ? 3 : 2;
    if (SPECIFIC_RE.test(w)) score += 3;
    if (firstEnd < 0 || at < firstEnd) score += 1.5;
    score -= at / 80;
    cands.push({ w, score });
  }
  cands.sort((a, b) => b.score - a.score);
  if (cands.length > 0) return cands[0].w;
  // 一般的すぎる語しかないときは、その中でいちばん前のものを使う（途中で切った字は出さない）
  for (const m of text.matchAll(NR_RUN)) {
    const w = nrCandidate(m[0], text.slice((m.index ?? 0) + m[0].length, (m.index ?? 0) + m[0].length + 2), true, text[(m.index ?? 0) - 1] ?? "");
    if (w && !used.has(w) && w !== "駅") return w;
  }
  // それも無ければ、見出しの最初の漢字・カタカナの連なり（2 字以上）
  for (const m of text.matchAll(NR_RUN)) if (!used.has(m[0]) && Array.from(m[0]).length >= 2 && m[0] !== "駅") return Array.from(m[0]).slice(0, 5).join("");
  return Array.from(text).filter((ch) => /[\u3040-\u30ff\u4e00-\u9fff]/.test(ch)).slice(0, 2).join("");
}
