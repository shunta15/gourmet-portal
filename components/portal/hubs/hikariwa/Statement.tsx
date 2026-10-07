import type { HubItem } from "@/lib/portal/hub";
import { glowRgb } from "@/lib/portal/hubs/hikariwa/colors";
import StatementFx from "./StatementFx";

/* ───────────── オーナーの言葉（コンセプト 1 の本文。一字一句そのまま。COPY.md） ───────────── */
/** 段落ごと。段落の中の行（改行）は、配列の要素 */
const BODY: { lines: string[]; kind?: "lead" | "pair" }[] = [
  {
    kind: "lead",
    lines: ["マチノワは、街にある魅力的なお店と人をつなぎ、そこから新しい出会いや交流を生み出していく地域ポータルサイトです。"],
  },
  { kind: "pair", lines: ["お店を知ることが、人との出会いにつながる。", "人との出会いが、街への愛着につながる。"] },
  {
    lines: ["ひとつひとつの出会いを「輪」に変え、その輪が街全体へと広がっていく。", "マチノワは、そんな地域のつながりが生まれるきっかけをつくります。"],
  },
];

/** 「輪」の字だけを取り出して、まわりに小さな光の輪を付ける（文字は 1 字も変えない） */
function Line({ text }: { text: string }) {
  const i = text.indexOf("「輪」");
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i + 1)}
      <span className="hk-wa">輪</span>
      {text.slice(i + 2)}
    </>
  );
}

/**
 * 下のブロック: 本文の全文を、暗い地に白い明朝で、静かに大きく組む。
 * 左の細い光の糸に、段落ごとの小さな輪（つながる）。スクロールで 1 段落ずつ現れる（スクリプトなしでは最初から見える）。
 */
export default function Statement({ items }: { items: HubItem[] }) {
  const colors = items.map((it) => glowRgb(it.color));
  const kinds = items.map((it) => (it.live ? "live" : it.enter ? "quiet" : "faint") as "live" | "quiet" | "faint");
  return (
    <section className="hk-st" aria-label="マチノワについて">
      <div className="hk-st-in">
        {BODY.map((p, i) => (
          <p key={i} className={p.kind}>
            {p.lines.map((ln, li) => (
              <span key={li}>
                {li > 0 ? "\n" : null}
                <span className="l">
                  <Line text={ln} />
                </span>
              </span>
            ))}
          </p>
        ))}
      </div>
      <StatementFx colors={colors} kinds={kinds} />
    </section>
  );
}
