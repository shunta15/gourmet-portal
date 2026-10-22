/** 本番の形で出す行き先（全部、本番 https://machinowa.tokyo に実在するページ。2026-10-20 に curl で 200 を確認）。 */
export const PROD_SEARCH = "/find"; // 総合サイトのサイト内検索（共通ヘッダーの検索と同じ。?q= で検索語を受ける）
export const PROD_NAV: [string, string][] = [["お店を探す", "/search"], ["特集を読む", "/feature"], ["エリアから探す", "/search"], ["駅から探す", "/station"], ["動画で見る", "/videos"], ["マチノワについて", "/about"]];
/** メニュー（ヘッダー右の三本線）。業種 8 つと、探し方・読みもの・案内(prod.css の区切り線は 8 番め・13 番めの後ろ。並べ替えるときは合わせる) */
export const PROD_MENU: [string, string][] = [
  ["グルメ", "/gourmet"], ["ビューティー", "/beauty"], ["ボディケア", "/bodycare"], ["ペット", "/pet"], ["ステイ", "/stay"], ["アクティビティ", "/activity"], ["スポーツ", "/sports"], ["くらし", "/life"],
  ["お店を探す", "/search"], ["地図から探す", "/map"], ["駅から探す", "/station"], ["動画で見る", "/videos"], ["特集を読む", "/feature"],
  ["マチノワについて", "/about"], ["お問い合わせ", "/contact"],
];
/** フッターの 2 つのリスト。利用規約・プライバシーポリシーのページは本番にまだ無いので出さない */
export const PROD_FOOT: { l: [string, string][]; r: [string, string][]; copy: string } = {
  l: [["マチノワについて", "/about"], ["掲載をご検討の方へ", "/contact"], ["特集記事", "/feature"], ["掲載基準", "/editorial/guidelines"]],
  r: [["地図から探す", "/map"], ["駅から探す", "/station"], ["動画で探す", "/videos"], ["お問い合わせ", "/contact"]],
  copy: "© マチノワ", // 本番の共通フッター（components/portal/PortalFooter.tsx）と同じ表記
};
