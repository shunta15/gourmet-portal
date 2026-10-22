import { Fragment } from "react";

/**
 * 店名・見出しの文字を、「語の途中」で折り返さないように並べる(「八幡野ダイビングセ / ンター」「ビューティ / ー」を防ぐ)。
 * 日本語の文は、どの文字の間でも折り返せるので、カタカナ(と長音「ー」)の連なり・ハイフンでつながる英数字の語を 1 つの塊にして、
 * 塊の途中では折らない(.vk-nb = word-break: keep-all)。カタカナの塊は直後の「・」「＆」を含める(行の頭に「・」が来ない)。
 * 塊の前後・漢字やひらがなの間・「、」の後ろでは今までどおり折れる。
 * 1 つの塊が 1 行より長いとき(「フォレストアドベンチャー」のような 10 字以上の名前が、狭いカードに入るとき)だけは、
 *   (1) 塊の中の「よくあるカタカナ語」(アドベンチャー・センター・ビューティー など。COMPOUND)の切れ目で折る(語の間に <wbr> を置く。隣り合う .vk-nb の間は keep-all で折れないため)
 *   (2) それも無ければ、はみ出さないよう塊の中で折る(.vk-nb の overflow-wrap: anywhere)
 * 塊の前後には <wbr> を置く(親が word-break: auto-phrase でも、漢字・ひらがなと塊の境目で折れるように。行頭禁則の文字の前・開き括弧の後ろには置かない)。
 * 文字は 1 字も変えない(読み上げ・コピー・検索はそのまま)。状態を持たない(サーバーでもクライアントでも使える)。.vk-nb は common/base.css。
 */
const RUN = /([ァ-ヺー]{2,}[・＆]?|[A-Za-z0-9]+(?:[-'’][A-Za-z0-9]+)+)/;

/** 名前によく入るカタカナ語。10 字以上の塊を、この語の切れ目で折れるようにする(どれも、前後に 2 字以上残るときだけ) */
const COMPOUND = [
  "アドベンチャー", "アクティビティ", "ビューティー", "フィットネス", "グランピング", "ペットホテル", "ペットショップ", "ダイビング", "ボクシング", "トリミング",
  "レストラン", "クリニック", "ホスピタル", "スクール", "スタジオ", "センター", "ガーデン", "ビレッジ", "ヴィレッジ", "コテージ", "ブリーダー", "アカデミー",
  "フォレスト", "ワンダフル", "ジュニア", "ショップ", "サロン", "キャンプ", "リゾート", "クラフト", "ヒーリング", "ライフ", "スポーツ", "パーク", "プラザ", "ランド",
  "カフェ", "ホテル", "ハウス", "ホーム", "ゴルフ", "ヨガ", "ダンス", "ジム", "ドッグ", "キャット",
  "パーソナル", "トレーニング", "オープン", "ウォーター", "ダイバー", "インストラクター", "レッスン", "プライベート", "プログラム", "カスタム", "メンテナンス", "コンディショニング",
  "リラクゼーション", "ボディメイク", "ダイエット", "ストレッチ", "ピラティス", "ファッション", "アクセサリー", "フォト", "スタジアム", "コース", "ルーム", "ガイド", "ツアー",
].sort((a, b) => b.length - a.length);

/** 10 字以上の塊を、COMPOUND の語の直後で分ける(分けた両側が 2 字以上のときだけ)。分けられなければそのまま 1 つ */
export function splitRun(run: string): string[] {
  if (run.length < 10) return [run];
  const cuts = new Set<number>();
  for (const w of COMPOUND) {
    let i = run.indexOf(w);
    while (i >= 0) {
      const end = i + w.length;
      if (end < run.length) cuts.add(end);
      if (i > 0) cuts.add(i);
      i = run.indexOf(w, i + 1);
    }
  }
  const pts = [...cuts].filter((c) => c >= 2 && run.length - c >= 2).sort((a, b) => a - b);
  if (pts.length === 0) return [run];
  const out: string[] = [];
  let prev = 0;
  for (const c of pts) {
    if (c - prev < 2) continue;
    out.push(run.slice(prev, c));
    prev = c;
  }
  out.push(run.slice(prev));
  return out;
}

/** 塊の前に折れ目を置いてよいか(前の文字が開き括弧なら置かない) / 塊の後ろに置いてよいか(次の文字が「。」「、」「」」など行の頭に来てはいけない文字なら置かない) */
const NO_BREAK_AFTER = /[「『（(【〔［\[]$/;
const NO_BREAK_BEFORE = /^[。、，．）)」』】〕］\]！？!?・ー…:：;；]/;

export default function Nm({ text }: { text: string }) {
  // split(RUN) は「塊でない部分・塊・塊でない部分…」の順(先頭が塊のときは先頭に空文字が入る)。奇数番目が塊
  const parts = text.split(RUN);
  return (
    <>
      {parts.map((t, i) => {
        if (t === "") return null;
        if (i % 2 === 0) return <Fragment key={i}>{t}</Fragment>;
        // 塊の前後に <wbr>(折れ目)を置く。親が word-break: auto-phrase のとき、漢字・ひらがなと塊の境目で折れなくなり、
        // 「八幡野ダイビングセンター」全体が 1 つの句と見なされて塊の途中で折れるため(2026-10-22 確認)
        const prev = parts[i - 1] ?? "";
        const next = parts[i + 1] ?? "";
        return (
          <Fragment key={i}>
            {prev !== "" && !NO_BREAK_AFTER.test(prev) ? <wbr /> : null}
            {splitRun(t).map((u, k) => (
              <Fragment key={k}>
                {k > 0 ? <wbr /> : null}
                <span className="vk-nb">{u}</span>
              </Fragment>
            ))}
            {next !== "" && !NO_BREAK_BEFORE.test(next) ? <wbr /> : null}
          </Fragment>
        );
      })}
    </>
  );
}
