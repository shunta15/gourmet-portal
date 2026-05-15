import type { Feature, FeatureArticle, RankItem } from "./data";

const date = "2026-05-15";
const author = "マチノワ編集部";

const IMG = {
  yokohama:       "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Yamashita_Park_%40_Yokohama_%289054590638%29.jpg/1280px-Yamashita_Park_%40_Yokohama_%289054590638%29.jpg",
  kamakura:       "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Tsurugaoka_Hachimangu_001.jpg/1280px-Tsurugaoka_Hachimangu_001.jpg",
  minatomirai:    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Yokohama_Landmark_Tower_and_Minato-Mirai_waterfront_seen_from_the_boat.jpg/1280px-Yokohama_Landmark_Tower_and_Minato-Mirai_waterfront_seen_from_the_boat.jpg",
  chinatown:      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Zenrin-mon_Gate_of_Yokohama_Chinatown_at_night%2C_Jun_2015.jpg/1280px-Zenrin-mon_Gate_of_Yokohama_Chinatown_at_night%2C_Jun_2015.jpg",
  enoshima:       "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Enoshima_20170210-2.jpg/1280px-Enoshima_20170210-2.jpg",
  kamakura_zen:   "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Engakuji%2C_Kamakura.jpg/1280px-Engakuji%2C_Kamakura.jpg",
  shonan:         "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Shonan_Beach_FM.jpg/1280px-Shonan_Beach_FM.jpg",
  odawara:        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Odawara_Castle_20211201.jpg/1280px-Odawara_Castle_20211201.jpg",
  hakone:         "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Owakudani_%40_Hakone_%2810621413133%29.jpg/1280px-Owakudani_%40_Hakone_%2810621413133%29.jpg",
  yokohama_house: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Gaikoukan_no_ie.JPG/1280px-Gaikoukan_no_ie.JPG",
  kanagawa:       "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Mount_Fuji_from_Lake_Ashi_20211202-2.jpg/1280px-Mount_Fuji_from_Lake_Ashi_20211202-2.jpg",
};

function s(n: number, name: string, type: string, area: string, purpose: string, desc: string, imgs: string[], specs: { k: string; v: string }[]): RankItem {
  return { rank: `SPOT ${String(n).padStart(2, "0")}`, rankNum: n, name, cuisine: type, area, purpose, desc, images: imgs, specs };
}
function side(t: string, id: string, img: string) { return { t, h: `/feature/${id}`, img }; }

// NG-102 のみ INDEXABLE（FEATURES + FEATURE_ARTICLES）
// NG-92〜101 → NOINDEX（FEATURE_ARTICLES のみ）
export const NEW_GUIDE_FEATURES_6: Feature[] = [
  { id: "new-kanagawa-weekend", no: "NG-102", tag: "観光", kicker: "KANAGAWA WEEKEND", title: "神奈川週末5選。横浜・鎌倉・箱根を週末で回る", sub: "みなとみらい・鎌倉・箱根。神奈川を週末で満喫するための厳選ルート", image: IMG.kanagawa }];

export const NEW_GUIDE_FEATURE_ARTICLES_6: Record<string, FeatureArticle> = {

  // ─── NG-92 noindex ─────────────────────────────────────────────────────────

  // ─── NG-93 noindex ─────────────────────────────────────────────────────────

  // ─── NG-94 noindex ─────────────────────────────────────────────────────────

  // ─── NG-95 noindex ─────────────────────────────────────────────────────────

  // ─── NG-96 noindex ─────────────────────────────────────────────────────────

  // ─── NG-97 noindex ─────────────────────────────────────────────────────────

  // ─── NG-98 noindex ─────────────────────────────────────────────────────────

  // ─── NG-99 noindex ─────────────────────────────────────────────────────────

  // ─── NG-100 noindex ────────────────────────────────────────────────────────

  // ─── NG-101 noindex ────────────────────────────────────────────────────────

  // ─── NG-102 INDEXABLE ──────────────────────────────────────────────────────
  "new-kanagawa-weekend": {
    id: "new-kanagawa-weekend", no: "NG-102", articleType: "guide",
    kicker: "KANAGAWA WEEKEND",
    title: "神奈川週末5選。横浜・鎌倉・箱根を週末で回る",
    titleHTML: "神奈川週末5選。<br>横浜・鎌倉・箱根",
    subtitle: "みなとみらい・鎌倉・箱根。神奈川を週末で満喫するための厳選ルート",
    lede: "神奈川は横浜・鎌倉・箱根・湘南という全く性格の異なるエリアが隣接する。一泊二日または週末2日間でこれらを組み合わせると、港・寺社・温泉・海岸を凝縮して体験できる。エリアを欲張りすぎず、2〜3箇所に絞った計画が成功のコツ。",
    date, reading: "約5分", author,
    heroImage: IMG.kanagawa,
    ranking: [
      s(1, "横浜・みなとみらい（土曜午前）", "観光・港", "みなとみらい", "初日はみなとみらいで港の景色をスタートに",
        "週末初日の朝はみなとみらいから始めるのがおすすめ。ランドマークタワー・赤レンガ倉庫・大さん橋と港沿いを歩き、午前中に横浜の海を体感する。中華街でのランチも組み合わせやすい。山下公園→大さん橋の徒歩ルートで約2時間。",
        [IMG.minatomirai], [{ k: "最寄り駅", v: "みなとみらい駅/元町・中華街駅" }]),
      s(2, "横浜中華街（土曜ランチ）", "中華・グルメ", "横浜中華街", "みなとみらいの後は中華街でランチ。王道コース",
        "日本最大の中華街は横浜観光のハイライト。ランチの混雑ピーク（12〜13時）を避け、11時30分入りを狙うと比較的スムーズに入れる。食べ歩きメインか、店内でコースかを決めてから入場するのが効率的。",
        [IMG.chinatown], [{ k: "最寄り駅", v: "元町・中華街駅 徒歩5分" }, { k: "混雑", v: "土日の12〜13時はピーク。早めに入るのが賢い" }]),
      s(3, "鎌倉（土曜午後〜夕方）", "寺社・観光", "鎌倉", "横浜から電車で30分。午後の鎌倉は人が減り始める",
        "横浜から鎌倉へはJR横須賀線で約30分。鎌倉は朝〜昼にかけて観光客が最も多く、15時以降は人が減り始める。午後からの北鎌倉→鎌倉ルートで円覚寺・鶴岡八幡宮を静かに参拝できる。",
        [IMG.kamakura], [{ k: "移動", v: "横浜→鎌倉 JR横須賀線 約30分" }]),
      s(4, "箱根湯本（日曜・温泉日帰り）", "温泉・リゾート", "箱根湯本", "二日目は箱根の温泉。小田原経由で行くのがおすすめ",
        "週末2日目は箱根湯本の温泉でリフレッシュ。鎌倉から箱根湯本へは鎌倉→横浜→小田原→箱根湯本の経路。大涌谷・芦ノ湖は体力と時間に応じて組み合わせを調整する。日帰り入浴は午前中に済ませて早めに東京へ戻るのが快適。",
        [IMG.hakone], [{ k: "移動", v: "鎌倉→横浜→小田原→箱根湯本 約2時間" }, { k: "温泉", v: "訪問前に各施設の日帰り受け付けを確認" }]),
      s(5, "湘南経由の帰路（選択肢として）", "移動・海岸", "湘南（茅ヶ崎・藤沢）", "帰りは湘南海岸経由。江の島に寄り道も",
        "箱根から東京に戻る際に小田原→東海道線で茅ヶ崎・藤沢を経由するルートは湘南海岸を車窓から眺められる。時間的余裕があれば藤沢で下車して江の島に立ち寄ることも可能。",
        [IMG.shonan], [{ k: "経路", v: "箱根湯本→小田原→東海道線（品川・東京方面）" }])],
    sideArticles: [
      side("横浜デート5選", "new-minatomirai-date", IMG.minatomirai),
      side("鎌倉・小町通り5選", "new-kamakura-komachi", IMG.kamakura)],
    quote: "神奈川を週末で回るなら「欲張らない」こと。横浜・鎌倉・箱根を全部詰め込むと全部が中途半端になる。2〜3エリアに絞って一つひとつをちゃんと楽しむのが正解。",
    quoteCite: author,
    closing: "【土曜】みなとみらい→中華街（ランチ）→鎌倉（午後参拝）。【日曜】箱根湯本（温泉）→大涌谷or芦ノ湖→湘南経由で帰京。この2日間プランが神奈川週末の定番。",
  },
};
