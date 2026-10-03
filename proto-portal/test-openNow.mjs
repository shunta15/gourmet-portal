#!/usr/bin/env node
/**
 * lib/portal/openNow.ts（「今開いている店」の判定）の単体テスト。
 * 実行: node proto-portal/test-openNow.mjs   （Node 22.18 以降。TypeScript をそのまま読み込む）
 *
 * openNow.ts は ../openingHours を拡張子なしで import するので、拡張子なしの相対 import を .ts に解決する
 * 小さな resolve フックをこのスクリプトの中で登録している。
 * 現在時刻は日本時間（+09:00）の固定時刻を渡す。2026-10-05 は月曜日。
 * （実行時に Node が出す MODULE_TYPELESS_PACKAGE_JSON の警告は、.ts を読み込むために出るもので無害）
 */
import { register } from "node:module";
register(
  "data:text/javascript," +
    encodeURIComponent(
      `export async function resolve(s,c,n){try{return await n(s,c)}catch(e){if(s.startsWith('.')&&!/\\.[a-z]+$/.test(s))return n(s+'.ts',c);throw e}}`,
    ),
);
const { weekFromText, getOpenStatus, packWeeks, isOpenState, formatJst } = await import("../lib/portal/openNow.ts");

/** 2026-10-05=月 06=火 07=水 08=木 09=金 10=土 11=日 12=月 18=日（第3日曜） */
const at = (day, hhmm) => new Date(`2026-10-${String(day).padStart(2, "0")}T${hhmm}:00+09:00`);
const st = (hours, closed, when) => getOpenStatus(weekFromText(hours, closed).week, when);

let pass = 0;
let fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`}`);
};
const s = (r) => r.state;

// 1. 通常営業と境界（開店ちょうどは営業中、閉店ちょうどは営業時間外）
t("毎日 11:00〜21:00 / 金12:00 は営業中（閉店まで540分）", st("11:00〜21:00", "年中無休", at(9, "12:00")), { state: "open", leftMin: 540 });
t("開店の1分前は営業時間外", s(st("11:00〜21:00", "年中無休", at(9, "10:59"))), "closed");
t("開店ちょうどは営業中", s(st("11:00〜21:00", "年中無休", at(9, "11:00"))), "open");
t("閉店ちょうどは営業時間外", s(st("11:00〜21:00", "年中無休", at(9, "21:00"))), "closed");

// 2. まもなく閉店（60分以内）
t("閉店の60分前はまもなく閉店", st("11:00〜21:00", "年中無休", at(9, "20:00")), { state: "soon", leftMin: 60 });
t("閉店の61分前はまだ営業中", s(st("11:00〜21:00", "年中無休", at(9, "19:59"))), "open");

// 3. 定休日と曜日指定
const WK = "月-土 17:00 - 23:00（料理L.O. 22:00 / ドリンクL.O. 22:30） / 日祝 17:00 - 22:00（L.O. 21:00）";
t("定休日（火）は18:00でも営業時間外", s(st(WK, "毎週火曜", at(6, "18:00"))), "closed");
t("定休日でない水曜18:00は営業中", s(st(WK, "毎週火曜", at(7, "18:00"))), "open");
t("日曜は22:00まで（21:30 はまもなく閉店）", st(WK, "毎週火曜", at(11, "21:30")), { state: "soon", leftMin: 30 });
t("ラストオーダーは営業時間に影響しない（22:45 は23:00閉店のまもなく閉店）", st(WK, "毎週火曜", at(8, "22:45")), { state: "soon", leftMin: 15 });

// 4. 日またぎ（翌2:00・翌0:00）
t("金曜 17:00〜翌2:00 は土曜 0:30 も営業中", s(st("17:00〜翌2:00", "火曜", at(10, "00:30"))), "open");
t("日またぎの閉店前（土曜 1:30）はまもなく閉店", st("17:00〜翌2:00", "火曜", at(10, "01:30")), { state: "soon", leftMin: 30 });
t("日またぎの閉店後（土曜 2:00）は営業時間外", s(st("17:00〜翌2:00", "火曜", at(10, "02:00"))), "closed");
t("定休日（火）の早朝でも、月曜から続く営業は営業中", s(st("17:00〜翌2:00", "火曜", at(6, "00:30"))), "open");
t("定休日（火）の翌水曜の早朝は営業時間外（火曜の営業が無い）", s(st("17:00〜翌2:00", "火曜", at(7, "01:00"))), "closed");
t("閉店が翌0:00 のとき 23:30 はまもなく閉店", st("17:00〜翌0:00", "無休", at(9, "23:30")), { state: "soon", leftMin: 30 });
t("翌0:00 を過ぎたら営業時間外", s(st("17:00〜翌0:00", "無休", at(10, "00:00"))), "closed");
t("24:00 閉店も同じ", st("10:00〜24:00", "無休", at(9, "23:59")), { state: "soon", leftMin: 1 });

// 5. 昼夜2部（中休みは営業時間外）
const SPLIT = "11:30〜14:30 / 17:30〜22:00";
t("中休み（15:30）は営業時間外", s(st(SPLIT, "月曜", at(6, "15:30"))), "closed");
t("ランチ営業中（12:00）", s(st(SPLIT, "月曜", at(6, "12:00"))), "open");
t("ランチ終了30分前はまもなく閉店", st(SPLIT, "月曜", at(6, "14:00")), { state: "soon", leftMin: 30 });
t("定休日（月曜）は終日営業時間外", s(st(SPLIT, "月曜", at(5, "12:00"))), "closed");

// 6. 日曜をまたぐ範囲（parseOpeningHours は「日〜木」を逆順に読む）
const WRAP = "日〜木 10:00〜翌2:00 / 金・土 10:00〜翌4:00";
t("日〜木に日曜が含まれる（日曜 12:00 は営業中）", s(st(WRAP, "無休", at(11, "12:00"))), "open");
t("木曜の翌2:00 を過ぎた金曜 3:00 は営業時間外", s(st(WRAP, "無休", at(9, "03:00"))), "closed");
t("金曜の翌4:00 までは土曜 2:30 も営業中", s(st(WRAP, "無休", at(10, "02:30"))), "open");

// 7. 「毎日」「平日」の「日」を日曜と読み違えない
t("毎日 17:00-23:00 は月曜 18:00 も営業中", s(st("毎日 17:00 - 23:00", "なし", at(5, "18:00"))), "open");
const WD = "平日 11:00〜14:00 / 土日 11:00〜16:00";
t("平日（火）12:00 は営業中", s(st(WD, "なし", at(6, "12:00"))), "open");
t("平日（火）15:00 は営業時間外", s(st(WD, "なし", at(6, "15:00"))), "closed");
t("土曜 14:30 は営業中（土日は16:00まで）", s(st(WD, "なし", at(10, "14:30"))), "open");

// 8. 第N◯曜の定休
t("第3日曜が休み: 10/18（第3日曜）は営業時間外", s(st("毎日 11:00〜21:00", "月曜・第3日曜", at(18, "12:00"))), "closed");
t("第3日曜が休み: 10/11（第2日曜）は営業中", s(st("毎日 11:00〜21:00", "月曜・第3日曜", at(11, "12:00"))), "open");

// 9. 曜日つきの区切りの後ろに曜日なしの区切りが続く書き方
t("火〜日 11:30-14:00 / 18:00-22:00（月曜休み）は読める: 火曜 19:00 は営業中", s(st("火〜日 11:30-14:00 / 18:00-22:00", "月曜日", at(6, "19:00"))), "open");
t("同じ書き方で定休日が不定休だと曜日が決まらないので不明", s(st("月〜金 11:00〜14:30 / 17:30〜23:00", "不定休", at(6, "19:00"))), "unknown");

// 10. 不明にするもの（推測しない）
t("営業時間が「要確認」は不明", s(st("要確認", "要確認", at(9, "12:00"))), "unknown");
t("営業時間が空は不明", s(st("", "", at(9, "12:00"))), "unknown");
t("括弧の外の※に曜日がある（※月曜は昼のみ）は不明", s(st("11:00〜15:00 / 17:00〜21:30※月曜は昼のみ", "火曜", at(9, "19:00"))), "unknown");
t("括弧の中に曜日がある（土日祝〜21:30）は不明", s(st("11:30〜15:00 / 17:30〜21:00（土日祝〜21:30）", "水曜", at(9, "19:00"))), "unknown");
t("「曜日により異なる」は不明", s(st("月〜土 11:30〜14:00、17:30〜22:00（曜日により異なる）", "日曜", at(9, "12:00"))), "unknown");
t("不定休は、営業時間内なら営業中と言い切らず不明", s(st("17:00〜23:00", "不定休（事前確認推奨）", at(9, "19:00"))), "unknown");
t("不定休でも、営業時間の外なら営業時間外", s(st("17:00〜23:00", "不定休（事前確認推奨）", at(9, "10:00"))), "closed");
t("営業時間に載っていない曜日（定休日の欄にも無い）は不明", s(st("月〜金 11:00〜20:00", "不定休なし", at(10, "12:00"))), "unknown");
t("曜日つき営業時間＋その曜日が定休日と分かれば営業時間外", s(st("月〜金 11:00〜20:00", "土曜・日曜", at(10, "12:00"))), "closed");
t("weekが無い（null）は不明", getOpenStatus(null, at(9, "12:00")), { state: "unknown" });

// 11. 日本時間への換算（UTC で渡しても日本時間で判定する）
t("UTC 03:00 = 日本時間 12:00（金）は営業中", s(getOpenStatus(weekFromText("11:00〜21:00", "無休").week, new Date("2026-10-09T03:00:00Z"))), "open");
t("UTC 前日 15:30 = 日本時間 00:30（金）は、前日（木）17:00〜翌2:00 から続いて営業中", s(getOpenStatus(weekFromText("17:00〜翌2:00", "無休").week, new Date("2026-10-08T15:30:00Z"))), "open");

// 12. 補助
t("isOpenState: open/soon だけ true", ["open", "soon", "closed", "unknown"].map(isOpenState), [true, true, false, false]);
const packed = packWeeks([
  { id: "a", hours: "11:00〜21:00", closed: "無休" },
  { id: "b", hours: "11:00〜21:00", closed: "年中無休" },
  { id: "c", hours: "要確認", closed: "要確認" },
]);
t("packWeeks: 同じ予定は1つにまとめる（a と b が同じ番号）", packed.index.a === packed.index.b && packed.table.length === 2 && packed.table[packed.index.c] === null, true);

t("formatJst: 日本時間の表記（UTC 03:00 → 12:00）", formatJst(new Date("2026-10-09T03:00:00Z")), "10月9日（金）12:00");

console.log(`\n${pass} passed, ${fail} failed (計 ${pass + fail} ケース)`);
process.exit(fail ? 1 : 0);
