/**
 * 写真の出典 /photo-credits（サーバー）。総合トップ（/。components/portal/hproto/machi2）で使っている Wikimedia Commons の写真の出典を、1 枚ずつ表にして出す。
 * 中身は components/portal/hproto/machi2/credits.json（scripts/pet-free-images.mjs の --credit が書いた記録。fs は使わず import する）。
 * 見た目は周りのページ（/about・/editorial/guidelines）と同じ枠（PeripheryFrame）。
 */
import PeripheryFrame from "./PeripheryFrame";
import { Hero, Sec } from "./parts";
import credits from "@/components/portal/hproto/machi2/credits.json";
import "./photoCredits.css";

type Credit = {
  slot: string;
  commonsTitle: string;
  pageUrl: string;
  author: string;
  license: string;
  licenseUrl: string;
  note?: string;
};

/** 枠（slot）→ 使っている場所の言い方 */
const PLACE: Record<string, string> = {
  "cat-gourmet": "業種の札「グルメ」",
  "cat-beauty": "業種の札「ビューティー」",
  "cat-stay": "業種の札「ステイ」",
  "sl-s-spring": "特集スライド「春」",
  "sl-s-summer": "特集スライド「夏」",
  "sl-s-autumn": "特集スライド「秋」",
  "sl-s-winter": "特集スライド「冬」",
  "sl-v-gourmet": "特集スライド「グルメ」",
  "sl-v-beauty": "特集スライド「ビューティー」",
  "sl-v-bodycare": "特集スライド「ボディケア」",
  "sl-v-pet": "特集スライド「ペット」",
  "sl-v-leisure": "特集スライド「おでかけ」",
  "sl-v-stay": "特集スライド「ステイ」",
  "card-video": "読みもの「動画で見る」",
};

/** 「File:」を外した題 */
const titleOf = (t: string) => t.replace(/^File:/, "");

export default function PhotoCreditsView() {
  const rows = (credits as Credit[]).map((c) => ({ ...c, place: PLACE[c.slot] ?? c.slot }));
  return (
    <PeripheryFrame>
      <Hero
        eyebrow="Photo credits"
        title="写真の出典"
        lead={
          <>
            総合トップで使っている写真のうち、Wikimedia Commons から借りているものの出典です。
            いずれも、下に示す許諾のもとで利用しています。写真は枠に合わせて切り抜き・縮小しています。
          </>
        }
      />
      <Sec id="pp-credits-hub" mark="出典" title="総合トップ" note={`${rows.length} 枚`} k={0}>
        <table className="pp-credits">
          <thead>
            <tr>
              <th scope="col">使っている場所</th>
              <th scope="col">題</th>
              <th scope="col">作者</th>
              <th scope="col">許諾</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.slot}>
                <td data-l="使っている場所">{c.place}</td>
                <td data-l="題">
                  <a href={c.pageUrl} target="_blank" rel="noopener noreferrer">{titleOf(c.commonsTitle)}</a>
                </td>
                <td data-l="作者">{c.author}</td>
                <td data-l="許諾">
                  <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer license">{c.license}</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Sec>
      <p className="pp-note">
        題のリンクは Wikimedia Commons の各ファイルのページ、許諾のリンクは許諾文書（Creative Commons）です。出典の誤りにお気づきの方は、お問い合わせからお知らせください。
      </p>
    </PeripheryFrame>
  );
}
