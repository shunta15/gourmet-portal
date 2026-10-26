/**
 * 総合トップのリンク先。2026-10-26 オーナー指示「総合トップから各業種以外に飛べるようになってるところは全て一旦消す。このあとページ動線を考える」で、
 * 業種 8 つ以外への行き先(お店を探す /search・特集 /feature・地図 /map・駅 /station・動画 /videos・検索 /find・マチノワについて /about・お問い合わせ /contact・掲載基準 /editorial/guidelines)を外した。
 * 動線が決まったら、ここに足し直す(元の一覧は git の履歴: 31aebd5f の prodData.ts)。
 */
/** メニュー（ヘッダー右の三本線）。業種 8 つだけ */
export const PROD_MENU: [string, string][] = [
  ["グルメ", "/gourmet"], ["ビューティー", "/beauty"], ["ボディケア", "/bodycare"], ["ペット", "/pet"], ["ステイ", "/stay"], ["アクティビティ", "/activity"], ["スポーツ", "/sports"], ["くらし", "/life"],
];
/** フッターの著作表記(リンクのリストは外した) */
export const PROD_FOOT_COPY = "© マチノワ"; // 本番の共通フッター（components/portal/PortalFooter.tsx）と同じ表記
