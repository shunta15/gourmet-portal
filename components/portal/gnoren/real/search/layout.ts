// さがすの絞り込みの札の置き方(試作 search/data.ts の見本の座標。--u の単位)。選択肢の数は見本と同じ(料理 7・エリア 8・シーン 7)で、
// 名前は実データ(料理 = BROAD_GROUPS・エリア = 店数の多い地域・シーン = 店数の多いシーン)なので、エリア・シーンの x・幅は等間隔にした。
// 料理は見本の名前(和食〜カフェ・甘味)と BROAD_GROUPS が同じなので、見本の座標・アイコン・色をそのまま使う。
export const CUISINE_LOOK: Record<string, { icon: string; tone: "green" | "cream" | "red" | "tan"; x: number; w: number; ty: number; fs: number }> = {
  wa: { icon: "bowl", tone: "green", x: 187, w: 86, ty: 0, fs: 16 },
  yo: { icon: "fork", tone: "cream", x: 287, w: 92, ty: 0, fs: 15 },
  chu: { icon: "steamer", tone: "red", x: 393, w: 106, ty: 1, fs: 13.5 },
  men: { icon: "ramen", tone: "cream", x: 515, w: 104, ty: 2, fs: 14.5 },
  niku: { icon: "skewer", tone: "green", x: 635, w: 117, ty: 5, fs: 14.5 },
  sake: { icon: "bottle", tone: "red", x: 767, w: 139, ty: 5, fs: 14.5 },
  cha: { icon: "cup", tone: "tan", x: 923, w: 118, ty: 3, fs: 14 },
};
/** エリア 8: 見本の左端 187・右端 1044 の間を 8 等分 */
export const AREA_X = (i: number) => 187 + i * 107.5;
export const AREA_W = 101;
/** シーン 7: 見本の左端 187・右端 1043 の間を 7 等分 */
export const SCENE_X = (i: number) => 187 + i * 122.5;
export const SCENE_W = 110;
