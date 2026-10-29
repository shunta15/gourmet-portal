// 新着情報の「日付」の台帳を作る道具。node automation/news-dates/build-news-dates.mjs [--ref origin/main]
//
// 店・特集記事のデータには公開日・追加日の項目が無い(特集記事 FeatureArticle.date は編集上の日付で、サイトに載った日ではない)ので、
// git の履歴から「その店・記事が、いま見える状態で main に入った日」を取る。出どころは main の first-parent の履歴(= マージ/直接コミットの日)。
//   - 店・記事の ID が、データのファイルに初めて入った日。
//   - ただし限定公開(lib/unlisted.ts)・保留(lib/places/newVerticals.ts の HELD_PLACE_IDS)・非表示(lib/hiddenStores.ts)に入っている間は「載っていない」扱い。
//     そこから外れて載った日が日付になる(載ったあと一度隠れて、また載ったら、また載った日)。
//   - 今の ref で見えない ID は台帳に入れない。
//   - 業種の特集記事(specials)は slug で同じ取り方(画面側は、データに date の項目がある特集はその date を表示に使い、台帳は並びの順(同じ日の中)に使う)。
// 出力: lib/portal/newsDates.generated.json  { generatedFrom, stores: { gourmet: {id: ISO}, beauty: {...}, ... }, features: { gourmet: {id: ISO} } }
// 画面側(lib/portal/news.ts)は、いま一覧に出ている店・記事の実データとこの台帳の ID の完全一致で突き合わせる。台帳に無いものは載せない。
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const refArg = process.argv.indexOf("--ref");
const REF = refArg > 0 ? process.argv[refArg + 1] : "origin/main";

const git = (args, opts = {}) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 29, ...opts });
const show = (c, f) => {
  try {
    return git(["show", `${c}:${f}`], { stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return null; // その時点でファイルが無い
  }
};

const PLACE_VERTICALS = ["beauty", "bodycare", "pet", "stay", "activity", "sports", "life"];
const PLACE_ID = /^(be|bo|pe|st|ac|sp|li)\d{4}$/;
const REST_ID = /^r\d+$/;
const nfc = (s) => s.normalize("NFC");

// ファイル → その中の「id」の集合
const idsOf = (text) => {
  const out = new Set();
  if (!text) return out;
  for (const m of text.matchAll(/\bid"?\s*:\s*["'`]([^"'`\n]+)["'`]/g)) out.add(nfc(m[1]));
  return out;
};
// 特集記事(業種の特集)の slug。lib/specials/<業種>.json は "slug": "x"、ボディケアだけ lib/portal/vert/bodygreen/special.ts の slug: "x"
const slugsOf = (text) => {
  const out = new Set();
  if (!text) return out;
  for (const m of text.matchAll(/\bslug"?\s*:\s*["'`]([^"'`\n]+)["'`]/g)) out.add(nfc(m[1]));
  return out;
};
const quotedOf = (text) => {
  const out = new Set();
  if (!text) return out;
  for (const m of text.matchAll(/["']([^"'\n]{1,80})["']/g)) out.add(nfc(m[1]));
  return out;
};

const isFeatureFile = (f) => /^lib\/(newGuideFeatures\d*|newGuideFeaturesKansai|newGuideFeaturesChubu|curatedFeatures|cityGuideFeatures|sceneFeatures)\.ts$/.test(f);
const REST_FILES = ["lib/data.ts", "lib/teleapo-restaurants.ts", "lib/articleStores.ts"];
const BLOCK_FILES = ["lib/unlisted.ts", "lib/hiddenStores.ts", "lib/places/newVerticals.ts"];
const SPECIAL_FILES = {
  beauty: "lib/specials/beauty.json",
  bodycare: "lib/portal/vert/bodygreen/special.ts",
  pet: "lib/specials/pet.json",
  stay: "lib/specials/stay.json",
  sports: "lib/specials/sports.json",
  life: "lib/specials/life.json",
};
const placeFile = (v) => `lib/places/generated/${v}.json`;

// main の first-parent の履歴(古い順)。-m で、マージコミットが第 1 親に対して持ち込んだ変更も拾う
const pathspec = [...REST_FILES, ...BLOCK_FILES, ...PLACE_VERTICALS.map(placeFile), ...Object.values(SPECIAL_FILES), ":(glob)lib/*eature*.ts"];
const log = git(["log", REF, "--first-parent", "-m", "--reverse", "--format=%H %cI", "--", ...pathspec])
  .trim()
  .split("\n")
  .map((l) => l.split(" "))
  .filter((x) => x[0]);
// 同じコミットが -m で 2 回出ることがあるので 1 回に
const seen = new Set();
const commits = log.filter(([h]) => (seen.has(h) ? false : (seen.add(h), true)));

const toJst = (iso) => new Date(iso).toISOString(); // UTC の ISO。画面側で JST の日付にする

const fileCache = new Map(); // file -> {text-derived sets}
const state = { rest: new Map(), feat: new Map(), place: new Map(), special: new Map(), block: new Set() }; // id -> since(ISO)

let prev = null;
const idSetCache = { rest: new Map(), place: new Map(), feat: new Map(), special: new Map(), block: new Map() };

for (const [hash, iso] of commits) {
  const changed = prev
    ? new Set(git(["diff", "--name-only", prev, hash]).trim().split("\n"))
    : null;
  // 第 1 親の列なので prev は直前の first-parent コミット(= hash の第 1 親)
  const touched = (f) => changed === null || changed.has(f);

  for (const f of REST_FILES) if (touched(f)) idSetCache.rest.set(f, idsOf(show(hash, f)));
  for (const v of PLACE_VERTICALS) if (touched(placeFile(v))) idSetCache.place.set(v, idsOf(show(hash, placeFile(v))));
  for (const [v, f] of Object.entries(SPECIAL_FILES)) if (touched(f)) idSetCache.special.set(v, slugsOf(show(hash, f)));
  for (const f of BLOCK_FILES) if (touched(f)) idSetCache.block.set(f, quotedOf(show(hash, f)));
  // 特集のファイル(名前が変わる・消えることがあるので、その時点の lib/ の一覧から)
  const libFiles = git(["ls-tree", "--name-only", hash, "lib/"]).trim().split("\n").filter(isFeatureFile);
  for (const f of [...idSetCache.feat.keys()]) if (!libFiles.includes(f)) idSetCache.feat.delete(f);
  for (const f of libFiles) if (touched(f) || !idSetCache.feat.has(f)) idSetCache.feat.set(f, idsOf(show(hash, f)));

  const blocked = new Set();
  for (const s of idSetCache.block.values()) for (const x of s) blocked.add(x);

  const update = (map, ids) => {
    for (const id of ids) {
      if (blocked.has(id)) continue;
      if (!map.has(id)) map.set(id, iso);
    }
    for (const id of [...map.keys()]) if (!ids.has(id) || blocked.has(id)) map.delete(id);
  };
  const rest = new Set();
  for (const s of idSetCache.rest.values()) for (const x of s) if (REST_ID.test(x)) rest.add(x);
  update(state.rest, rest);
  for (const v of PLACE_VERTICALS) {
    const ids = new Set([...(idSetCache.place.get(v) ?? [])].filter((x) => PLACE_ID.test(x)));
    if (!state.place.has(v)) state.place.set(v, new Map());
    update(state.place.get(v), ids);
  }
  for (const [v, ids] of idSetCache.special) {
    if (!state.special.has(v)) state.special.set(v, new Map());
    update(state.special.get(v), ids);
  }
  const feat = new Set();
  for (const s of idSetCache.feat.values()) for (const x of s) if (!REST_ID.test(x) && !PLACE_ID.test(x)) feat.add(x);
  update(state.feat, feat);
  prev = hash;
}

const obj = (m) => Object.fromEntries([...m.entries()].sort((a, b) => (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : a[0] < b[0] ? -1 : 1)).map(([k, v]) => [k, toJst(v)]));
const out = {
  _note: "自動生成(automation/news-dates/build-news-dates.mjs)。手で編集しない。値は『その ID が、載っている状態で ref の first-parent に入った日時(UTC)』。",
  generatedFrom: { ref: REF, head: git(["rev-parse", REF]).trim(), commitsScanned: commits.length },
  stores: { gourmet: obj(state.rest), ...Object.fromEntries(PLACE_VERTICALS.map((v) => [v, obj(state.place.get(v) ?? new Map())])) },
  features: { gourmet: obj(state.feat) },
  specials: Object.fromEntries(Object.keys(SPECIAL_FILES).map((v) => [v, obj(state.special.get(v) ?? new Map())])),
};
writeFileSync(join(ROOT, "lib/portal/newsDates.generated.json"), JSON.stringify(out, null, 1) + "\n");
console.log("commits", commits.length, "rest", state.rest.size, "feat", state.feat.size, PLACE_VERTICALS.map((v) => `${v}:${state.place.get(v)?.size}`).join(" "), "specials", [...state.special].map(([v, m]) => `${v}:${m.size}`).join(" "));
