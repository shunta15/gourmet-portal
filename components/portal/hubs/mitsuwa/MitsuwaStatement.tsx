/**
 * 三つの輪 MITSUWA — 下のブロック（サーバー）。コンセプト 2 の本文の全文を、黄の地に黒の極太で大きく組む。
 * 「ひと」「みせ」「まち」の 3 語は、それぞれ小さな輪で囲む。
 * 文言は COPY.md のコンセプト 2 を一字一句（改行・段落の切れ目も原文のとおり）。ここに定数として置く。
 * 文節ごとに折り返さない塊（.ph）にして、句の途中で行が切れないようにする（文字は増減しない）。
 */
const P1 = ["街をつくっているのは、", "そこに暮らす人と、", "街に根付くお店。"];
const P2_HEAD = "マチノワは、";
const P2_TAIL = ["それぞれの魅力をつなぎ、", "地域の新しい輪を", "つくるポータルサイトです。"];
const P3 = ["まだ知らなかったお店との出会い。", "お店を通じて知る、その街ならではの魅力。", "そして、そこから生まれる人と人とのつながり。"];
const P4 = [
  ["マチノワをきっかけに、", "街の中に", "新しい輪が増えていく。"],
  ["そんな場所を", "目指します。"],
];

export default function MitsuwaStatement() {
  return (
    <section className="mws">
      <div className="mws-in">
        <p className="mws-p1">
          {P1.map((t, i) => (
            <span className="ph" key={i}>
              {t}
            </span>
          ))}
        </p>
        <p className="mws-p2">
          <span className="ph">
            {P2_HEAD}「<span className="mws-w" data-w="0">ひと</span>」「<span className="mws-w" data-w="1">みせ</span>」「<span className="mws-w" data-w="2">まち</span>」
          </span>
          {P2_TAIL.map((t, i) => (
            <span className="ph" key={i}>
              {t}
            </span>
          ))}
        </p>
        <p className="mws-p3">
          {P3.map((l, i) => (
            <span className="ln" key={i}>
              <i aria-hidden="true" data-w={i} />
              <span className="tx">{l}</span>
            </span>
          ))}
        </p>
        <span className="mws-deco" aria-hidden="true">
          <i data-w="0" />
          <i data-w="1" />
          <i data-w="2" />
        </span>
        <p className="mws-p4">
          {P4.map((l, i) => (
            <span className="ln" key={i}>
              {l.map((t, j) => (
                <span className="ph" key={j}>
                  {t}
                </span>
              ))}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
