import type { Feature, FeatureArticle } from "./data";

// ═══════════════════════════════════════════════════════
// 街ガイド特集 第7弾（30本・全国エリア拡張）— 自動生成
//   画像: Wikimedia Commons（HTTP200確認済み）／スポットは変更なし
//   2026-06-20 脱テンプレ改修: タイトル/lede/closing/文体/articleType を
//   4ペルソナで多様化（「5選」「対象は/標準動線/向くコースだ」の定型を撤去）
// ═══════════════════════════════════════════════════════

export const NEWGUIDE7_FEATURES: Feature[] = [
  {
    "id": "kansai-namba-dotonbori-walk",
    "no": "KS-05",
    "tag": "食べ歩き",
    "kicker": "NAMBA DOTONBORI WALK",
    "title": "難波から道頓堀へ、食い倒れを歩く。黒門市場の昼から法善寺横丁の夜まで",
    "sub": "黒門市場で串をかじり、道具屋筋を冷やかし、なんばグランド花月の笑い声を背に、グリコサインの灯る戎橋を抜けて、石畳の法善寺横丁で一日を締める。昼の市場から夜の路地まで、大阪ミナミを足の向くまま歩いた記録。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Neon_sign_of_Dotonbori_daytime.JPG"
  },
  {
    "id": "kansai-shinsekai-tsutenkaku",
    "no": "KS-06",
    "tag": "観光",
    "kicker": "SHINSEKAI TSUTENKAKU",
    "title": "新世界・通天閣 下町半日コース。塔の足元から路地、湯けむりへ",
    "sub": "通天閣を見上げて街の地理をつかみ、商店街で写真を撮り、串カツを頬張り、路地を抜けて最後は温泉まで。半径300mに昭和が密集する新世界を、電車を使わず足だけでひと回りする半日の組み立て。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Tsutenkaku%2C_Osaka.jpg/1280px-Tsutenkaku%2C_Osaka.jpg"
  },
  {
    "id": "kansai-tennoji-abeno-family",
    "no": "KS-07",
    "tag": "子連れ",
    "kicker": "TENNOJI ABENO FAMILY",
    "title": "天王寺・あべの、子どもと歩く一日。ハルカスの空からてんしばの芝へ",
    "sub": "あべのハルカスの展望台で空を見て、てんしばの芝に子どもを放し、動物園と美術館を抜けてキューズモールへ。駅を出てすぐの天王寺・阿倍野を、子連れでのんびり歩いた半日の記録。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/View_of_Abeno_Harukas_and_Shitenn%C5%8D-ji_five-storied_pagoda_at_dusk%2C_January_2024_%28clone_version%29_-_9978.jpg/1280px-View_of_Abeno_Harukas_and_Shitenn%C5%8D-ji_five-storied_pagoda_at_dusk%2C_January_2024_%28clone_version%29_-_9978.jpg"
  },
  {
    "id": "kansai-osaka-castle-walk",
    "no": "KS-08",
    "tag": "さんぽ",
    "kicker": "OSAKA CASTLE WALK",
    "title": "大阪城公園を歩く。天守閣からお堀端の城跡さんぽ",
    "sub": "JO-TERRACE OSAKAの朝のコーヒーから極楽橋、天守閣、豊國神社、西の丸庭園の芝生まで。都心の真横に広がる緑と水の城跡を、足の向くまま半日歩いた記録。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Gokurakubashi_Bridge_on_Inner_Moat_of_Osaka_Castle_2.JPG/1280px-Gokurakubashi_Bridge_on_Inner_Moat_of_Osaka_Castle_2.JPG"
  },
  {
    "id": "kansai-tempozan-family",
    "no": "KS-09",
    "tag": "子連れ",
    "kicker": "TEMPOZAN BAY FAMILY",
    "title": "天保山・海遊館 子連れ半日コース。港の水族館から観覧車、海の上へ",
    "sub": "海遊館で大水槽を見て、横丁で昼を食べ、ブロックで遊び、観覧車に上がって、最後は帆船で港へ。小さな子の足でも回りきれる、屋根の多いベイエリアの一日のたどり方。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Octopus_sinensis_%28Osaka_Aquarium_KAIYUKAN%29.jpg/1280px-Octopus_sinensis_%28Osaka_Aquarium_KAIYUKAN%29.jpg"
  },
  {
    "id": "kansai-expo-park-family",
    "no": "KS-10",
    "tag": "子連れ",
    "kicker": "EXPO PARK FAMILY",
    "title": "万博記念公園、子連れで過ごす一日。芝生も水族館もミュージアムも一駅圏",
    "sub": "太陽の塔の足元から自然文化園の芝生へ。そのままニフレル、ららぽーとEXPOCITY、国立民族学博物館まで。屋外と屋内を行き来できる吹田・万博公園の懐の深さを、子どもの機嫌と天気を主役にして楽しむ。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Osaka_Expo%2770_Kodak%2BRicoh_Pavilion.jpg/1280px-Osaka_Expo%2770_Kodak%2BRicoh_Pavilion.jpg"
  },
  {
    "id": "kansai-fushimi-inari-walk",
    "no": "KS-11",
    "tag": "さんぽ",
    "kicker": "FUSHIMI INARI WALK",
    "title": "伏見稲荷を歩く。千本鳥居から稲荷山の辻へ、門前へ下りる一日",
    "sub": "朱の楼門をくぐり、鳥居のトンネルを抜けて稲荷山の四ツ辻まで。下りて東福寺の庭に寄り、参道のいなり寿司で締める深草さんぽ。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Fushimi-Inari-Shrine-Senbon-Torii-2018-Luka-Peternel.jpg/1280px-Fushimi-Inari-Shrine-Senbon-Torii-2018-Luka-Peternel.jpg"
  },
  {
    "id": "kansai-kinkakuji-walk",
    "no": "KS-12",
    "tag": "観光",
    "kicker": "KINKAKUJI KINUKAKE",
    "title": "きぬかけの路、名刹をつなぐ一本道。金閣寺から御室の伽藍へ",
    "sub": "金閣寺・龍安寺・仁和寺。世界遺産の三寺が約2.5kmで地続きになる、京都北山ならではの歩き方。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Water_reflection_of_Kinkaku-ji_Temple_a_sunny_day%2C_Kyoto%2C_Japan.jpg/1280px-Water_reflection_of_Kinkaku-ji_Temple_a_sunny_day%2C_Kyoto%2C_Japan.jpg"
  },
  {
    "id": "kansai-kawaramachi-pontocho-date",
    "no": "KS-13",
    "tag": "デート",
    "kicker": "KAWARAMACHI PONTOCHO DATE",
    "title": "河原町から先斗町へ、鴨川を歩くデート。台所の市場から夜の花街まで",
    "sub": "錦市場の喧騒を抜け、鴨川の河原に腰を下ろし、高瀬川沿いの木屋町から灯りの先斗町へ。最後は四条大橋を渡って祇園白川の石畳まで、水辺づたいに昼と夜を歩きつないでいく。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Wooden_and_bamboo_facades_of_dwellings_with_sudare_in_a_cobbled_street_of_Gion%2C_perspective_effect_with_vanishing_point%2C_Kyoto%2C_Japan.jpg/1280px-Wooden_and_bamboo_facades_of_dwellings_with_sudare_in_a_cobbled_street_of_Gion%2C_perspective_effect_with_vanishing_point%2C_Kyoto%2C_Japan.jpg"
  },
  {
    "id": "kansai-uji-walk",
    "no": "KS-14",
    "tag": "さんぽ",
    "kicker": "UJI WALK",
    "title": "宇治、茶の香りを歩く。平等院から宇治川を渡る半日のさんぽ",
    "sub": "宇治橋通り商店街でひと息ついて、平等院、朝霧橋、宇治上神社、源氏物語ミュージアムへ。世界遺産ふたつを宇治川がつなぐ街を、橋を渡りながら歩く。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Byodoin_Phoenix_Hall_Uji_2009.jpg/1280px-Byodoin_Phoenix_Hall_Uji_2009.jpg"
  },
  {
    "id": "kansai-kitano-ijinkan-date",
    "no": "KS-15",
    "tag": "デート",
    "kicker": "KITANO IJINKAN DATE",
    "title": "北野異人館、坂を上って洋館をさんぽ。風見鶏から海の見える高台へ",
    "sub": "三宮の喧騒を背に北野坂を上ると、国も時代も違う洋館が肩を寄せ合う高台に出る。風見鶏の館から萌黄の館、北野天満神社の石段、うろこの家を抜けて、坂下の異人館カフェで足を休めるまでを、二人で歩いた半日の記録。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Weathercock_House_Kobe_Kitano_Ijinkan_%E9%A2%A8%E8%A6%8B%E9%B6%8F%E3%81%AE%E9%A4%A8%EF%BC%88%E6%97%A7%E3%83%88%E3%83%BC%E3%83%9E%E3%82%B9%E4%BD%8F%E5%AE%85%EF%BC%89.jpg/1280px-Weathercock_House_Kobe_Kitano_Ijinkan_%E9%A2%A8%E8%A6%8B%E9%B6%8F%E3%81%AE%E9%A4%A8%EF%BC%88%E6%97%A7%E3%83%88%E3%83%BC%E3%83%9E%E3%82%B9%E4%BD%8F%E5%AE%85%EF%BC%89.jpg"
  },
  {
    "id": "kansai-sannomiya-nankinmachi-walk",
    "no": "KS-16",
    "tag": "食べ歩き",
    "kicker": "SANNOMIYA NANKINMACHI",
    "title": "三宮から南京町、食べて歩く神戸さんぽ。商店街と中華街を抜けて",
    "sub": "三宮センター街のアーケードから生田神社の杜へ、湯気の立つ南京町を経て元町商店街、東遊園地の芝生まで。神戸の真ん中を、匂いをたどって歩いた半日の記録。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Kobe_Kobe_Chinatown_3.jpg/1280px-Kobe_Kobe_Chinatown_3.jpg"
  },
  {
    "id": "kansai-arima-onsen-walk",
    "no": "KS-17",
    "tag": "さんぽ",
    "kicker": "ARIMA ONSEN WALK",
    "title": "有馬温泉、湯けむりの坂をひと歩き。金の湯から銀の湯へ",
    "sub": "赤い金泉と透明な銀泉、その間をつなぐ石畳の坂。神戸の山あいで、湯と街並みをまとめて歩いた半日の記録。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Kin-no-yu_Arima_Onsen_2013.jpg/1280px-Kin-no-yu_Arima_Onsen_2013.jpg"
  },
  {
    "id": "kansai-nara-park-walk",
    "no": "KS-18",
    "tag": "観光",
    "kicker": "NARA PARK WALK",
    "title": "奈良公園、大仏と鹿のあいだを歩く。駅から東の山手へ半日のさんぽ",
    "sub": "近鉄奈良駅を出てすぐ、興福寺の五重塔が目印になる。鹿の鳴き声と参道の砂利を踏む音を連れて、東大寺・春日大社・若草山へ。世界遺産と野生の鹿が同じ地続きにある、奈良の東側を歩く話。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Todaiji08s3200.jpg/1280px-Todaiji08s3200.jpg"
  },
  {
    "id": "kansai-naramachi-walk",
    "no": "KS-19",
    "tag": "さんぽ",
    "kicker": "NARAMACHI WALK",
    "title": "猿沢池からならまちを歩く。格子と古寺の路地さんぽ",
    "sub": "猿沢池の水面から元興寺の古瓦へ、そして格子の家・御霊神社・奈良町資料館へ。奈良公園のひと筋裏、生活の匂いが残る旧市街をゆっくりたどる一日の覚え書き。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/d/dc/Bakemono_Gagoze.jpg"
  },
  {
    "id": "chubu-nagoya-station-walk",
    "no": "CB-02",
    "tag": "さんぽ",
    "kicker": "NAGOYA STATION WALK",
    "title": "名駅から則武へ、ものづくりの記憶を歩く。展望台の風から赤レンガの庭へ",
    "sub": "スカイプロムナードの風、スカイストリートのガラス越しの線路、衣装替えするナナちゃん人形、ノリタケの森の赤レンガ、トヨタ産業技術記念館の動く機械。名駅から西へ、街がさかのぼっていく。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Midland-Square-and-Nagoya-Building-1.jpg/1280px-Midland-Square-and-Nagoya-Building-1.jpg"
  },
  {
    "id": "chubu-atsuta-jingu-walk",
    "no": "CB-03",
    "tag": "観光",
    "kicker": "ATSUTA JINGU",
    "title": "熱田神宮から水辺へ、半日の参詣コース。杜・古墳・庭園をつないで宮の渡しまで",
    "sub": "草薙神剣を祀る熱田の杜を起点に、剣の宝庫・断夫山古墳・白鳥庭園を経て旧東海道の渡し場跡へ。名古屋南部の信仰と水辺を一筆書きで結ぶ午前発・夕方着の参詣コース。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Atsuta_Shrine.jpg/1280px-Atsuta_Shrine.jpg"
  },
  {
    "id": "chubu-nagoya-port-family",
    "no": "CB-04",
    "tag": "子連れ",
    "kicker": "NAGOYA PORT FAMILY",
    "title": "名古屋港、海を見せに行く子連れの一日。水族館から港の観覧車へ",
    "sub": "地下鉄を降りたら、もう潮の気配。水族館・係留船・展望室・遊園地が徒歩圏に集まる名古屋港ガーデンふ頭を、小さな足の歩幅に合わせて回る。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Port_of_Nagoya_Public_Aquarium.jpg/1280px-Port_of_Nagoya_Public_Aquarium.jpg"
  },
  {
    "id": "chubu-atami-onsen-date",
    "no": "CB-05",
    "tag": "デート",
    "kicker": "ATAMI ONSEN DATE",
    "title": "熱海、海へ下る湯けむりの坂をふたりで歩く。山の大楠から夜のテラスまで",
    "sub": "山際の社で大楠に手を合わせ、高台の城から相模湾を見下ろし、商店街の甘い湯気を抜けて砂浜へ。日が落ちたらテラスでひと息。坂の街・熱海を、ただ海の方へと下りながらたどる随筆。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/%E7%86%B1%E6%B5%B7_Atami_Sun_Beach_-_Feb_10%2C_2008.jpg/1280px-%E7%86%B1%E6%B5%B7_Atami_Sun_Beach_-_Feb_10%2C_2008.jpg"
  },
  {
    "id": "kyushu-tenjin-walk",
    "no": "KY-01",
    "tag": "さんぽ",
    "kicker": "TENJIN WALK",
    "title": "天神で立ち寄りたい、地下と緑の5か所。地下街から那珂川の芝生まで",
    "sub": "九州最大の繁華街・天神。買い物の合間に半径500m圏で寄れる地下街・神社・商店街・屋上庭園・芝生広場を、性格の違いで選んでみた。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/%E5%A4%A9%E7%A5%9E%E4%B8%AD%E5%A4%AE%E5%85%AC%E5%9C%92.JPG/1280px-%E5%A4%A9%E7%A5%9E%E4%B8%AD%E5%A4%AE%E5%85%AC%E5%9C%92.JPG"
  },
  {
    "id": "kyushu-nakasu-kawabata-walk",
    "no": "KY-02",
    "tag": "食べ歩き",
    "kicker": "NAKASU KAWABATA",
    "title": "中洲・川端、夕暮れから屋台までを歩く。櫛田神社の鈴から那珂川の灯りへ",
    "sub": "櫛田神社で手を合わせ、上川端商店街のアーケードを抜け、キャナルシティ博多の運河と博多リバレインモールでひと息ついて、那珂川の中洲屋台へ。博多の夕方が夜に溶けていく道のりを、足の向くまま歩いた記録。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Nakasu_Yatai_Stalls_%2819979437930%29.jpg/1280px-Nakasu_Yatai_Stalls_%2819979437930%29.jpg"
  },
  {
    "id": "kyushu-ohori-park-family",
    "no": "KY-03",
    "tag": "子連れ",
    "kicker": "OHORI PARK FAMILY",
    "title": "大濠公園で過ごす子連れ半日。池の散策から動物園へ",
    "sub": "福岡市中央区、大濠公園駅を起点に。大きな池を中心に美術館・城跡・庭園が集まり、最後は動植物園まで。小さな子ども連れでも移動を詰め込まずに回れる一日のつなぎ方。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/%C5%8Chori_Park_The_pergola_in_Matsushima_%C5%8Chori-k%C5%8Den_Ch%C5%AB%C5%8D-ku_Fukuoka_20260514.jpg/1280px-%C5%8Chori_Park_The_pergola_in_Matsushima_%C5%8Chori-k%C5%8Den_Ch%C5%AB%C5%8D-ku_Fukuoka_20260514.jpg"
  },
  {
    "id": "kyushu-dazaifu-walk",
    "no": "KY-04",
    "tag": "観光",
    "kicker": "DAZAIFU",
    "title": "太宰府、参道から山あいの社まで歩く一日。梅ヶ枝餅の湯気から縁結びの杜へ",
    "sub": "焼きたての餅の匂いに迎えられる表参道から、天満宮の楼門、四王寺山の麓のガラス張りの博物館、枯山水の石庭、そして宝満山に抱かれた竈門神社へ。学問の神さまの門前町を、足の向くままにたどった記録。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/20100719_Dazaifu_Tenmangu_Shrine_3328.jpg/1280px-20100719_Dazaifu_Tenmangu_Shrine_3328.jpg"
  },
  {
    "id": "kyushu-kagoshima-tenmonkan",
    "no": "KY-05",
    "tag": "観光",
    "kicker": "KAGOSHIMA SAKURAJIMA",
    "title": "鹿児島・天文館＆桜島、火山を見上げる一日。湯之平から城山の眺めまで",
    "sub": "桜島フェリーで対岸へ渡り、湯之平展望所で北岳を仰ぐ。仙巌園は桜島を借景に、城山展望台はその全身を一枚に収める。錦江湾を行き来しながら、活火山という一つの主役を角度を変えて眺める鹿児島市の歩き方。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Sakurajima_from_Yunohira_Tenbojo.jpg/1280px-Sakurajima_from_Yunohira_Tenbojo.jpg"
  },
  {
    "id": "hokkaido-sapporo-odori-walk",
    "no": "HK-01",
    "tag": "さんぽ",
    "kicker": "SAPPORO ODORI WALK",
    "title": "札幌の中心を歩く朝さんぽ。二条市場の湯気からテレビ塔の眺めへ",
    "sub": "二条市場で朝食をとり、大通公園の緑をたどって時計台と赤れんが庁舎をめぐり、最後にさっぽろテレビ塔へ。碁盤の目の中心を、足の向くまま歩いた半日の記録。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Former_Hokkaido_Government_Office_Building_%28Red_Brick_Office%29.jpg/1280px-Former_Hokkaido_Government_Office_Building_%28Red_Brick_Office%29.jpg"
  },
  {
    "id": "hokkaido-susukino-night-date",
    "no": "HK-02",
    "tag": "デート",
    "kicker": "SUSUKINO NIGHT DATE",
    "title": "すすきの、灯りを継いで歩く夜のデート。展望台からネオン、そして山頂へ",
    "sub": "JRタワーT38で街が暮れる瞬間を見て、テレビ塔から大通公園の灯りを正面に。すすきの交差点のネオンを抜け、藻岩山の大夜景へ上り、最後は中島公園の水辺で静かに息を整える夜。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Nakajima_Park_Sapporo03bs5s4272.jpg/1280px-Nakajima_Park_Sapporo03bs5s4272.jpg"
  },
  {
    "id": "hokkaido-otaru-canal-date",
    "no": "HK-03",
    "tag": "デート",
    "kicker": "OTARU CANAL DATE",
    "title": "小樽運河から堺町通りへ、ガス灯の半日デートコース",
    "sub": "小樽運河から芸術村、堺町通り、北一硝子三号館、メルヘン交差点の小樽オルゴール堂本館まで。石造倉庫とガス灯の港町を、運河側から南へ一本道で下る。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Otaru_Canal_HDR1.jpg/1280px-Otaru_Canal_HDR1.jpg"
  },
  {
    "id": "chugoku-hiroshima-peace-walk",
    "no": "CG-01",
    "tag": "観光",
    "kicker": "HIROSHIMA CITY WALK",
    "title": "広島・平和記念公園、慰霊と歴史をたどる街歩き。ドームから本通へ",
    "sub": "原爆ドームに始まり、資料館で学び、縮景園と広島城に歴史の層を見て、復興した本通の賑わいへ抜ける。一つの街に重なる「過去」を歩く。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Genbaku_Dome04-r.JPG/1280px-Genbaku_Dome04-r.JPG"
  },
  {
    "id": "chugoku-miyajima-walk",
    "no": "CG-02",
    "tag": "観光",
    "kicker": "MIYAJIMA",
    "title": "宮島、潮と原始林を歩く。大鳥居から弥山の頂へ",
    "sub": "海に立つ朱の大鳥居から、回廊の社殿、塔の岡の高台、商店街の湯気を抜けて、原始林の弥山まで。世界遺産の島を桟橋から一歩ずつたどる宮島さんぽ。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Itsukushima-jinja_torii_at_sunset%2C_Miyajima%2C_Japan%2C_20240816_1812_4144.jpg/1280px-Itsukushima-jinja_torii_at_sunset%2C_Miyajima%2C_Japan%2C_20240816_1812_4144.jpg"
  },
  {
    "id": "kanto-kawagoe-walk",
    "no": "KT-01",
    "tag": "さんぽ",
    "kicker": "KAWAGOE KOEDO WALK",
    "title": "川越、蔵の町を歩くさんぽ。時の鐘から横丁、社寺へ",
    "sub": "黒漆喰の蔵が連なる一番街から、駄菓子の匂う横丁、縁結びの社、五百羅漢の寺まで。江戸の時間がそのまま残る小江戸を、足の向くまま歩いた半日の記録。",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Kawagoe_Toki_no_Kane_1.jpg/1280px-Kawagoe_Toki_no_Kane_1.jpg"
  }
];

export const NEWGUIDE7_FEATURE_ARTICLES: Record<string, FeatureArticle> = {
  "kansai-namba-dotonbori-walk": {
    "id": "kansai-namba-dotonbori-walk",
    "no": "KS-05",
    "articleType": "guide",
    "kicker": "NAMBA DOTONBORI WALK",
    "title": "難波から道頓堀へ、食い倒れを歩く。黒門市場の昼から法善寺横丁の夜まで",
    "titleHTML": "難波から道頓堀へ、食い倒れを歩く。<br>黒門市場の昼から法善寺横丁の夜まで",
    "subtitle": "黒門市場で串をかじり、道具屋筋を冷やかし、なんばグランド花月の笑い声を背に、グリコサインの灯る戎橋を抜けて、石畳の法善寺横丁で一日を締める。昼の市場から夜の路地まで、大阪ミナミを足の向くまま歩いた記録。",
    "lede": "昼前の黒門市場は、鉄板で焼ける魚の脂の匂いと、店先から飛ぶ呼び声でいっぱいだった。ホタテの貝殻がジュッと鳴り、隣ではマグロの大トロが串に刺さって湯気を立てている。ここは大阪・ミナミの胃袋で、難波から道頓堀へと続く一帯は、市場と商店街と劇場と川沿いの繁華街が、ほとんど地続きに折り重なっている。だから歩いて回れる。立ち食いの串をひとつ平らげると、もう次の路地が呼んでいる——そういう街だ。この日は地図を畳んで、昼の市場で腹を満たしてから、グリコサインの灯る方角へ、ゆっくり南へ西へと歩いてみることにした。串の値も公演の予定も日によって動くので、出かける前に各店の公式を一度のぞいておくと安心できる。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Neon_sign_of_Dotonbori_daytime.JPG",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "黒門市場",
        "cuisine": "市場・商店街",
        "area": "大阪市中央区・日本橋",
        "purpose": "昼にここから始める。市場の鮮魚串で腹ごしらえ",
        "desc": "千日前通から南へ約580m続くアーケードに、鮮魚・精肉・青果・飲食など約150の店が並ぶ、古くから「大阪の台所」と呼ばれてきた市場だ。夏のハモ、冬のフグといった季節の魚介を看板に掲げる鮮魚店が多く、注文を受けてからその場で炙るホタテやエビの串焼き、海鮮丼、果物店のフレッシュジュースなど、その場で味わえるメニューがそろう。歩きながらの飲食は避け、店舗のイートインスペースや立ち食いコーナーを利用するのが市場のマナーとして案内されている。プロの料理人が仕入れに通う本物の市場でありながら観光客の食べ歩きにも開かれているのが、この場所ならではの面白さ。多くの店が18時前後に閉まり始めるため、まず昼に訪れて腹ごしらえするのがこのコースの起点になる。価格や営業時間は店ごとに異なり変動もあるため、現地の表示や各店で確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Kuromon_Ichiba_Market_at_Lalaport_Kadoma2.jpg/1280px-Kuromon_Ichiba_Market_at_Lalaport_Kadoma2.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄日本橋駅10番出口 徒歩すぐ"
          },
          {
            "k": "営業",
            "v": "9:00〜18:00頃（店舗により異なる・変動あり）"
          },
          {
            "k": "雨の日",
            "v": "◎ アーケードで濡れにくい"
          },
          {
            "k": "おすすめ時間",
            "v": "午前〜昼（夕方は閉店が増える）"
          }
        ],
        "transit": "日本橋駅 徒歩約5分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "千日前道具屋筋商店街",
        "cuisine": "商店街",
        "area": "大阪市中央区・難波千日前",
        "purpose": "市場のあと冷やかして歩く。料理道具と食品サンプルの街",
        "desc": "全長約150mのアーケードに、包丁・鍋・のれん・食器から業務用厨房機器まで、料理道具と厨房用品の専門店が軒を連ねる商店街だ。もともとプロの飲食店向けに発展した問屋街だが、近年は旅行者にも開かれ、ロウや樹脂でつくる食品サンプルを扱う店が目を引く。にぎり寿司や野菜をかたどったサンプルキーホルダーは大阪らしい土産になり、店によっては食品サンプルづくりの体験も用意されている。黒門市場で食べた料理が、どんな道具から生まれるのかを裏側からのぞけるのがこの街ならではの楽しみ方。黒門市場のすぐ西側に位置するため、食べ歩きの合間に無理なく組み込める。営業時間・定休日・体験の有無は店ごとに異なるため、目当てがあれば事前に確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Sennichimae-doguya-suji_in_201408.JPG/1280px-Sennichimae-doguya-suji_in_201408.JPG"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄なんば駅・南海難波駅 徒歩約3分"
          },
          {
            "k": "用途",
            "v": "料理道具・食品サンプル・土産・体験"
          },
          {
            "k": "雨の日",
            "v": "◎ アーケード商店街"
          },
          {
            "k": "おすすめ時間",
            "v": "昼〜夕方（店舗の営業時間内）"
          }
        ],
        "transit": "なんば駅 徒歩約3分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "なんばグランド花月",
        "cuisine": "劇場",
        "area": "大阪市中央区・難波千日前",
        "purpose": "昼の公演を観るか外観を眺める。大阪の笑いの本拠地",
        "desc": "吉本興業が運営する、大阪の「笑い」の本拠地として知られる常設劇場だ。漫才や落語に加え、民宿や商店を舞台に予期せぬ騒動が起こる「吉本新喜劇」が連日上演され、テレビでおなじみの芸人を生の舞台で見られるのが見どころ。観劇には時間がかかるため、昼公演をコースに組み込むか、難波千日前の街歩きのランドマークとして外観だけ眺めるか、当日の予定に合わせて選びたい。食べ歩きの途中に大阪文化の核心へ寄り道できるのが、この劇場ならではの位置づけだ。観劇料金は座席により異なり改定されることもあるうえ、土日祝や連休は当日券が立ち見のみになる場合もあるため、観たい公演があれば事前予約と最新の料金・上演スケジュールを公式サイトで確認しておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Namba_Grand_Kagetsu.jpg/1280px-Namba_Grand_Kagetsu.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄なんば駅E5番出口 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "観劇は座席により異なる（改定あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "◎ 屋内劇場"
          },
          {
            "k": "おすすめ時間",
            "v": "昼公演（事前予約が安心）"
          }
        ],
        "transit": "なんば駅 徒歩約5分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "道頓堀グリコサイン・戎橋",
        "cuisine": "観光名所・看板",
        "area": "大阪市中央区・道頓堀",
        "purpose": "夕方に撮る。両手を上げたランナーと道頓堀の夜景",
        "desc": "道頓堀川に架かる戎橋の南西袂、川に面して立つグリコの大看板は、昭和10年の初代から数えて現在のもので6代目。両手を上げてゴールするランナーを描いた高さ20m・横幅約10mのLEDサイネージで、日没後から夜にかけて背景の演出が切り替わり、大阪を象徴する夜景として親しまれている。橋の上や、川沿いの遊歩道「とんぼりリバーウォーク」から見上げると迫力があり、ここでしか撮れない一枚になるのがこの場所ならではの理由だ。夕方の日没前後に訪れると、昼の街並みからネオンの夜へと表情が変わる瞬間に立ち会える。戎橋周辺は夕方以降とくに混み合い立ち止まりにくいため、撮影は人の流れを妨げない位置で手早く。点灯時間は変更される場合があるため公式情報の確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/a/ab/Neon_sign_of_Dotonbori_daytime.JPG"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄なんば駅14番出口 徒歩約3分"
          },
          {
            "k": "料金",
            "v": "見学無料"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外（橋上・川沿い）"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方〜夜（日没前後の点灯時）"
          }
        ],
        "transit": "なんば駅 徒歩約3分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "法善寺横丁",
        "cuisine": "横丁・飲食街",
        "area": "大阪市中央区・難波",
        "purpose": "夜に締める。石畳の路地で大阪の夕食",
        "desc": "賑やかな道頓堀のすぐ南側にありながら、長さ約80m・幅約3mの石畳の路地が東西に2本伸びる、昭和の情緒が色濃く残る横丁だ。割烹やバー、お好み焼き、串カツの老舗が軒を寄せ合い、路地の一角には水掛不動として親しまれる法善寺があって、参拝で苔むした不動明王像に水を掛ける人の姿が見られる。道頓堀の喧騒からわずか数歩で、提灯の灯る静かな路地に切り替わる落差が、この横丁ならではの魅力だ。グリコサインで夜景を楽しんだあと、串カツやお好み焼きで大阪らしい夕食をとってコースを締めるのにちょうどよい。各店の営業時間や定休日、予算は店ごとに異なり変動もあるため、混雑期は予約や事前確認をしておくと安心だ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Hozenji_Yokocho_at_night.jpg/1280px-Hozenji_Yokocho_at_night.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄なんば駅・日本橋駅 徒歩約3分"
          },
          {
            "k": "用途",
            "v": "夕食・串カツ・お好み焼き・参拝（水掛不動）"
          },
          {
            "k": "雨の日",
            "v": "○ 路地は屋外だが各店は屋内"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方〜夜（夕食どき）"
          }
        ],
        "transit": "なんば駅 徒歩約3分"
      }
    ],
    "sideArticles": [
      {
        "t": "新世界・通天閣 観光5選。レトロな下町を歩く半日",
        "h": "/feature/kansai-shinsekai-tsutenkaku",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Tsutenkaku%2C_Osaka.jpg/1280px-Tsutenkaku%2C_Osaka.jpg"
      },
      {
        "t": "天王寺・あべの 子連れ5選。ハルカスからてんしばまで",
        "h": "/feature/kansai-tennoji-abeno-family",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/View_of_Abeno_Harukas_and_Shitenn%C5%8D-ji_five-storied_pagoda_at_dusk%2C_January_2024_%28clone_version%29_-_9978.jpg/1280px-View_of_Abeno_Harukas_and_Shitenn%C5%8D-ji_five-storied_pagoda_at_dusk%2C_January_2024_%28clone_version%29_-_9978.jpg"
      }
    ],
    "quote": "魚の匂いに始まり、職人の道具を冷やかし、笑い声をくぐって、ネオンの川を渡り、石畳の路地で締める。難波から道頓堀へ、ミナミの一日を足で味わった。",
    "quoteCite": "マチノワ編集部",
    "closing": "黒門市場で鮮魚の串と海鮮丼に腹を満たしたら、市場のアーケードを抜けて、すぐ西の千日前道具屋筋商店街へ。料理道具と本物そっくりの食品サンプルが並ぶ通りを冷やかしながら歩くと、自然と難波千日前のにぎわいに出る。そこに構えるなんばグランド花月で昼の公演に笑い転げてもいいし、客席が満ちて立ち見になりそうなら外観だけ眺め、近くで甘味をひとつ挟んで休んでもいい。陽が傾きはじめたら道頓堀へ向かい、両手を上げて走るグリコサインが川面に映る戎橋で、暮れていくミナミを眺める。日没の前後はとりわけ人が増えるので、撮るなら立ち止まりすぎず流れに乗るのがいい。締めは法善寺横丁。表通りの喧騒が嘘のように静まる石畳の路地で、串カツやお好み焼きを前にすると、一日歩いた足の疲れも悪くないものに思えてくる。市場の活気、職人の手仕事、劇場の笑い、ネオンの夜景、路地の静けさ——同じ街の違う顔を、半日のうちに続けて味わえたのが何より楽しかった。黒門市場は夕方には店じまいが進むので回るなら昼のうち、食べ歩きは店のイートインを使うのが市場の流儀。雨の日は屋根のある市場・道具屋筋・花月の屋内時間を厚めにとり、戎橋は短く切り上げて早めに横丁の暖簾をくぐると心地よく過ごせる。料金や営業、公演の日程はそのつど変わるものなので、足を運ぶ前に各施設の公式で確かめておきたい。"
  },
  "kansai-shinsekai-tsutenkaku": {
    "id": "kansai-shinsekai-tsutenkaku",
    "no": "KS-06",
    "articleType": "course",
    "kicker": "SHINSEKAI TSUTENKAKU",
    "title": "新世界・通天閣 下町半日コース。塔の足元から路地、湯けむりへ",
    "titleHTML": "新世界・通天閣 下町半日コース。<br>塔の足元から路地、湯けむりへ",
    "subtitle": "通天閣を見上げて街の地理をつかみ、商店街で写真を撮り、串カツを頬張り、路地を抜けて最後は温泉まで。半径300mに昭和が密集する新世界を、電車を使わず足だけでひと回りする半日の組み立て。",
    "lede": "新世界は、1912年にパリやニューヨークを手本に造られた歓楽街がそのまま街として根を張った場所だ。面白いのは、その全部が驚くほど狭い。通天閣を中心に、串カツの名店もレトロな商店街も射的の並ぶ路地も半径300mほどにぎゅっと固まっていて、電車に乗り換える必要がそもそも生じない。だからこのコースは、移動でくたびれる時間をゼロに近づけ、その分を「見る・食べる・浸かる」に全振りする発想で組んだ。まず塔に上がって街の地理を頭に入れ、そこから坂を下るように奥へ奥へと歩く。同じ300mでも、上から俯瞰してから歩くと路地の意味が変わって見えてくる。半日でちょうど飽きが来ないところまで巡って終える、欲張りすぎない一周にしている。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Tsutenkaku%2C_Osaka.jpg/1280px-Tsutenkaku%2C_Osaka.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "通天閣",
        "cuisine": "展望台",
        "area": "大阪市浪速区・新世界",
        "purpose": "最初に上る。新世界の中心から街全体を見渡して位置をつかむ",
        "desc": "新世界の真ん中にそびえる高さ約108mの展望タワーで、現在のものは2代目にあたる。見どころは5階の「黄金の展望台」（地上87.5m）で、2012年の100周年を機に豊臣秀吉の黄金の茶室にちなんだ金色の内装に生まれ変わり、ここに幸運の神様ビリケンが鎮座する。足の裏をなでて願をかけるのが古くからの習わしで、新世界がかつて遊園地ルナパークだった時代から続く名物だ。さらに上の屋外展望台に出れば、串カツ店の看板が並ぶ下町の屋根越しに大阪の街を360度見渡せる。最初に上って街の地理をつかんでおくと、このあとの散策がぐっと歩きやすくなる。展望料金は改定されることがあるため、訪問前に公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Tsutenkaku%2C_Osaka.jpg/1280px-Tsutenkaku%2C_Osaka.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "堺筋線 恵美須町駅・各線 新今宮駅 徒歩約5〜10分"
          },
          {
            "k": "料金",
            "v": "一般展望台＋特別屋外展望台 大人1,500円ほか（変動あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "○ 屋内展望台は天候不問"
          },
          {
            "k": "おすすめ時間",
            "v": "午前（散策前に上る）"
          }
        ],
        "transit": "堺筋線 恵美須町駅 徒歩約5分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "通天閣本通商店街",
        "cuisine": "商店街",
        "area": "大阪市浪速区・新世界",
        "purpose": "通天閣を正面に見ながら歩く。新世界らしい写真はここで撮る",
        "desc": "地下鉄堺筋線・恵美須町駅の3番出口を上がると正面に通天閣がそびえ、その足元へ約200mまっすぐ伸びるのがこの商店街だ。新世界の中でも通天閣を真正面から画面いっぱいに収められる数少ない場所で、SNSや観光写真で見かける「商店街の奥に通天閣」という構図はここで撮れる。アーケードの両側には射的や手裏剣投げといったレトロゲーム、クレーンゲーム、土産物店が並び、比較的夜遅くまで営業しているので一日中にぎわう。歩きながら頭上のド派手な立体看板を見上げるだけでも、昭和の歓楽街として造られた街の名残が伝わってくる。通天閣からだるまへ向かう動線上にあるので、立ち止まって写真を撮りながら自然に抜けられる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Shinsekai_and_Tsutenkaku_Tower.jpg/1280px-Shinsekai_and_Tsutenkaku_Tower.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "堺筋線 恵美須町駅 徒歩すぐ"
          },
          {
            "k": "用途",
            "v": "写真撮影・食べ歩き・散策"
          },
          {
            "k": "雨の日",
            "v": "○ アーケードで濡れにくい"
          },
          {
            "k": "おすすめ時間",
            "v": "昼（通天閣を正面に望む）"
          }
        ],
        "transit": "堺筋線 恵美須町駅 徒歩すぐ"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "串かつ だるま 新世界総本店",
        "cuisine": "串カツ店",
        "area": "大阪市浪速区・新世界",
        "purpose": "昼食はここで。新世界発祥といわれる串カツの総本店で味わう",
        "desc": "1929年（昭和4年）創業と伝わる串カツの老舗で、新世界に複数ある「だるま」の総本店にあたる。カウンター中心のこぢんまりした店構えながら、薄づきの衣をさっと揚げた串カツは新世界の食文化を語るうえで外せない一皿だ。卓上の共用ソースは「二度漬け禁止」が鉄の掟で、一度くぐらせたら衣に染みたソースだけで食べきるのが流儀。これは衛生を保つために生まれた新世界共通のルールで、初めてでも店の張り紙どおりにすれば戸惑わない。看板には強面の人物像が掲げられ、新世界らしい押し出しの強さも名物になっている。昼どきや休日は行列ができやすいので、時間に余裕をもって並びたい。メニューや価格は変わることがあるため、最新情報は公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Kushikatsu_Tanaka_America-Mura.jpg/1280px-Kushikatsu_Tanaka_America-Mura.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "堺筋線 恵美須町駅・各線 新今宮駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "串カツ1本数百円〜（変動あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "○ 店内飲食"
          },
          {
            "k": "おすすめ時間",
            "v": "昼食（混雑前の早めが安心）"
          }
        ],
        "transit": "堺筋線 恵美須町駅 徒歩約5分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "ジャンジャン横丁（南陽通商店街）",
        "cuisine": "商店街",
        "area": "大阪市浪速区・新世界",
        "purpose": "食後に抜ける。狭い路地の立ち呑みと射的を楽しむ",
        "desc": "正式名称は南陽通商店街で、かつて店先から三味線や太鼓の「ジャンジャン」という音が響いたことが愛称の由来とされる。幅の狭いアーケードが約180m続き、串カツ・寿司・うどん・立ち呑み居酒屋といった庶民的な店がびっしりと軒を連ねる。観光地化した本通とは趣が異なり、昼から赤い顔で一杯やる常連客や、現役で営業する囲碁将棋クラブなど、地元の生活感がそのまま残っているのがこの路地ならではの面白さだ。肩がぶつかりそうな細さなので、串カツやどて焼きは店舗の飲食スペースで味わい、食べ歩きは控えてゆっくり南へ抜けていくと、新世界の「素のままの下町」を体感できる。動物園前駅・新今宮駅側へ抜けられるので、最後のスパワールドへもそのまま歩いて向かえる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/North_entrance_of_Janjan-Yokocho_Shopping_Street.jpg/1280px-North_entrance_of_Janjan-Yokocho_Shopping_Street.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "御堂筋線 動物園前駅・各線 新今宮駅 徒歩すぐ"
          },
          {
            "k": "用途",
            "v": "飲食・立ち呑み・散策"
          },
          {
            "k": "雨の日",
            "v": "○ アーケードで濡れにくい"
          },
          {
            "k": "おすすめ時間",
            "v": "昼〜夕方"
          }
        ],
        "transit": "御堂筋線 動物園前駅 徒歩すぐ"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "スパワールド ホテル&リゾート（旧・世界の大温泉）",
        "cuisine": "温浴施設",
        "area": "大阪市浪速区・新世界",
        "purpose": "締めに浸かる。歩き疲れた体を各国テーマの風呂で温めて解散",
        "desc": "新世界の南の入口に建つ大型温浴施設で、長く「スパワールド世界の大温泉」の名で親しまれてきたが、2023年7月の25周年リニューアルで「SPAWORLD HOTEL&RESORT（スパワールド ホテル&リゾート）」へ名称を改め、客室を増やしたリゾート施設へと生まれ変わった。看板の温泉ゾーンは健在で、ヨーロッパ各国やアジアをテーマにした浴室を月替わりで男女入れ替えながら楽しめるのが特徴だ。古代ローマ風の風呂から地中海風の露天まで、まるで各国を巡るように湯めぐりできるので、半日歩いた足をほぐす締めにちょうどいい。岩盤浴や季節営業のプールもあり、天候に左右されない屋内施設なので雨の日の逃げ込み先としても頼りになる。営業形態や料金が変更されることがあるため、訪問前に公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Osaka_City_Trum_2201_in_Shinsekai_20130502.jpg/1280px-Osaka_City_Trum_2201_in_Shinsekai_20130502.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "御堂筋線 動物園前駅・JR 新今宮駅 徒歩すぐ"
          },
          {
            "k": "料金",
            "v": "入館料あり（変動あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "◎ 全館屋内"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方（散策の締めに）"
          }
        ],
        "transit": "御堂筋線 動物園前駅 徒歩すぐ"
      }
    ],
    "sideArticles": [
      {
        "t": "難波・道頓堀 食べ歩き5選。グリコサインから法善寺横丁まで",
        "h": "/feature/kansai-namba-dotonbori-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Neon_sign_of_Dotonbori_daytime.JPG"
      },
      {
        "t": "天王寺・あべの 子連れ5選。ハルカスからてんしばまで",
        "h": "/feature/kansai-tennoji-abeno-family",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/View_of_Abeno_Harukas_and_Shitenn%C5%8D-ji_five-storied_pagoda_at_dusk%2C_January_2024_%28clone_version%29_-_9978.jpg/1280px-View_of_Abeno_Harukas_and_Shitenn%C5%8D-ji_five-storied_pagoda_at_dusk%2C_January_2024_%28clone_version%29_-_9978.jpg"
      }
    ],
    "quote": "塔の上から街を見下ろし、串カツの煙をくぐり、路地を抜けて湯に沈む。乗り換えなしで昭和の大阪をまるごと一周する、足だけの半日。",
    "quoteCite": "マチノワ編集部",
    "closing": "午前のうちに堺筋線・恵美須町駅から通天閣本通商店街を抜けて塔の足元へ。最初に通天閣の黄金の展望台へ上がり、ビリケンに会いつつ、これから歩く範囲を上から眺めて地理を体に入れておく。下りたら本通商店街へ。通天閣を正面に据えたあの新世界らしい一枚は、ここのレトロな看板の下で撮るのがいい。写真を済ませたら串かつ だるま 新世界総本店へ流れ込み、発祥の地といわれる総本店で昼の串カツを腹に入れる。ソースの二度漬けは御法度、という一点だけ頭に置いておけばいい。満たされたお腹でジャンジャン横丁（南陽通商店街）の細い路地に分け入り、立ち呑みや射的、囲碁将棋の看板が肩を寄せ合う一本道を南へ抜ける。締めはスパワールド ホテル&リゾートで各国テーマの湯に体を沈め、歩き通した足をほどいて解散。展望から温泉まで、その間ずっと徒歩数分という密度がこの街の妙味だ。土日は展望台の券売所に列が伸びやすく、横丁も串カツ店も昼から賑わうので、混む時間を少し外すと動きやすい。雨でも、屋根のある本通とジャンジャン横丁のアーケード、屋内のスパワールドをつなげばほとんど濡れずに回れる。入場料や営業時間は折に触れて見直されるので、出かける前に各施設の公式情報へ一度目を通しておくと安心だ。"
  },
  "kansai-tennoji-abeno-family": {
    "id": "kansai-tennoji-abeno-family",
    "no": "KS-07",
    "articleType": "guide",
    "kicker": "TENNOJI ABENO FAMILY",
    "title": "天王寺・あべの、子どもと歩く一日。ハルカスの空からてんしばの芝へ",
    "titleHTML": "天王寺・あべの、子どもと歩く一日。<br>ハルカスの空からてんしばの芝へ",
    "subtitle": "あべのハルカスの展望台で空を見て、てんしばの芝に子どもを放し、動物園と美術館を抜けてキューズモールへ。駅を出てすぐの天王寺・阿倍野を、子連れでのんびり歩いた半日の記録。",
    "lede": "エレベーターの扉が開くと、まず光が来る。地上300m、あべのハルカスのハルカス300に立つと、大阪平野が床の縁まで広がって、さっきまで歩いていた天王寺駅の周りが小さな模型のように見える。子どもは窓に手のひらを押しつけて「あれ、なに」と聞いてくる。あの緑が、これから行くてんしばの芝生で、その隣の木立が動物園。高い場所からひとめで一日の地図がつかめてしまうのが、この街の不思議なところだ。天王寺・阿倍野は、超高層ビルと芝生広場、動物園、美術館が天王寺駅を中心に半径数百メートルにぎゅっと寄り集まっていて、ベビーカーを押しても段差に行く手をふさがれない。屋内の施設と屋外の公園が地続きで、子どもの機嫌や空模様しだいで行き先を入れ替えられる。だから今日は時刻表を決めずに、上から下へ、空から芝へと、子どもの足の速さにあわせて歩いていくことにした。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/View_of_Abeno_Harukas_and_Shitenn%C5%8D-ji_five-storied_pagoda_at_dusk%2C_January_2024_%28clone_version%29_-_9978.jpg/1280px-View_of_Abeno_Harukas_and_Shitenn%C5%8D-ji_five-storied_pagoda_at_dusk%2C_January_2024_%28clone_version%29_-_9978.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "あべのハルカス ハルカス300（展望台）",
        "cuisine": "展望台",
        "area": "大阪市阿倍野区・阿倍野",
        "purpose": "朝いちに昇る。地上300mから大阪平野を見渡し、街の地図をつかむ",
        "desc": "高さ300mの「あべのハルカス」最上部、58〜60階に設けられた展望台。60階の回廊は四方を全面ガラスで囲まれ、足元には天王寺公園の緑、遠くには生駒山や大阪湾までが一望できる。エレベーターで一気に最上階へ上がる演出があり、小さな子どもにとっては乗り物そのものが体験になる。58階の吹き抜け「天空庭園」はベンチやカフェがあり、ベビーカーでも回りやすい。朝いちに昇って街全体を見渡しておくと、このあと歩く動物園や芝生の位置関係が子どもにも伝わりやすい。料金は大人2,000円ほか（入場料金改定の予定あり）。料金・営業時間は変更される場合があるため、訪問前に公式サイトで最新情報を確認してほしい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/View_of_Abeno_Harukas_and_Shitenn%C5%8D-ji_five-storied_pagoda_at_dusk%2C_January_2024_%28clone_version%29_-_9978.jpg/1280px-View_of_Abeno_Harukas_and_Shitenn%C5%8D-ji_five-storied_pagoda_at_dusk%2C_January_2024_%28clone_version%29_-_9978.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR天王寺駅・近鉄大阪阿部野橋駅 直結すぐ"
          },
          {
            "k": "料金",
            "v": "大人2,000円ほか（改定予定あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "◎ 全館屋内"
          },
          {
            "k": "おすすめ時間",
            "v": "午前（朝いち）"
          }
        ],
        "transit": "JR・近鉄・各線天王寺／大阪阿部野橋駅 直結すぐ"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "てんしば（天王寺公園エントランスエリア）",
        "cuisine": "芝生広場",
        "area": "大阪市天王寺区・天王寺公園エントランス",
        "purpose": "昼に立ち寄る。広い芝生で子どもを放し、ここで昼食をとる",
        "desc": "天王寺駅から動物園・美術館へ向かう入口に広がる、約7,000平方メートルの芝生広場を中心としたエリア。カフェやレストラン、コンビニ、屋内外の有料あそび場「ボーネルンド プレイヴィル」などが芝生を囲み、子どもを芝生で遊ばせながら大人が交代で食事や休憩をとれる構成になっている。正面奥にあべのハルカスがそびえ、芝生に寝転ぶと高層ビルと空が同時に視界に入るのがこの場所ならではの眺めだ。動物園・美術館へそのまま歩いて入れる動線上にあり、一日コースの中継地点として使いやすい。開園は朝7時から夜まで（店舗ごとに営業時間が異なる）。各店舗の営業時間は変更される場合があるため、訪問前に公式サイトで確認してほしい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Varied_tit_at_Tenn%C5%8Dji_Park_in_Osaka%2C_January_2016.jpg/1280px-Varied_tit_at_Tenn%C5%8Dji_Park_in_Osaka%2C_January_2016.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR天王寺駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "芝生広場は入場無料（あそび場・飲食は別途）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外中心（屋内あそび場あり）"
          },
          {
            "k": "おすすめ時間",
            "v": "昼（昼食・休憩）"
          }
        ],
        "transit": "JR・各線天王寺駅 徒歩約5分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "天王寺動物園",
        "cuisine": "動物園",
        "area": "大阪市天王寺区・茶臼山",
        "purpose": "午後の主役。サバンナの草食動物やゾウを見ながらぐるりと一周する",
        "desc": "1915年開園、都市の中心部にありながら約11万平方メートルの敷地を持つ歴史ある動物園。キリンやシマウマが同じ放飼場に放たれる「アフリカサバンナゾーン」や、生息環境を再現した展示が見どころで、檻越しではない開けた景観の中で動物を観察できる。駅とてんしばから地続きで入れるため、ベビーカーのまま芝生から動物園へ流れ込めるのがこのエリアならではの利点だ。園内は起伏があり一周に時間がかかるので、子どもの体力に合わせて見たいゾーンを絞るとよい。入園料は大人500円ほかと手頃。原則月曜休園で開園時間も季節で変わるため、休園日・営業時間は訪問前に公式サイトで確認してほしい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Flight_Aviary%2C_Tennoji_Zoo_2024.jpg/1280px-Flight_Aviary%2C_Tennoji_Zoo_2024.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR天王寺駅・大阪メトロ動物園前駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "大人500円ほか（変動あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外中心"
          },
          {
            "k": "おすすめ時間",
            "v": "午後（昼食後）"
          }
        ],
        "transit": "大阪メトロ動物園前駅 徒歩約5分／JR天王寺駅 徒歩約5分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "大阪市立美術館",
        "cuisine": "美術館",
        "area": "大阪市天王寺区・茶臼山",
        "purpose": "夕方前に立ち寄る。名画とカフェで一息つき、子どもにも本物を見せる",
        "desc": "天王寺公園内、茶臼山のふもとに建つ重厚な美術館。約2年半の大規模改修を経て2025年にリニューアルオープンし、新たなエントランスと、展示室以外の多くを無料ゾーンとする「ひらかれたミュージアム」へと生まれ変わった。無料ゾーンには名園「慶沢園」を望むカフェとテラスがあり、観覧チケットがなくても建築と庭を楽しめるため、動物園で歩き疲れた家族の休憩地点として立ち寄りやすい。日本・東洋の美術を中心とした所蔵品は質量ともに厚く、子どもに本物の絵や仏像を見せる導入にもよい。コレクション展は一般300円ほか・中学生以下無料。観覧料・開館時間・展示内容は変更される場合があるため、訪問前に公式サイトで確認してほしい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Osaka_municipal_museum_of_art01s3200.jpg/1280px-Osaka_municipal_museum_of_art01s3200.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR天王寺駅 徒歩約7分"
          },
          {
            "k": "料金",
            "v": "コレクション展 一般300円ほか・中学生以下無料（変動あり）"
          },
          {
            "k": "雨の日",
            "v": "◎ 屋内（無料ゾーン・カフェあり）"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方前（休憩がてら）"
          }
        ],
        "transit": "JR・各線天王寺駅 徒歩約7分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "あべのキューズモール",
        "cuisine": "商業施設",
        "area": "大阪市阿倍野区・阿倍野",
        "purpose": "締めに使う。屋内で休憩・買い物・夕食をすませてから解散する",
        "desc": "天王寺駅・阿倍野駅に直結する、約240店舗からなる大型ショッピングモール。授乳室やベビー休憩室、子ども向けの遊び場や飲食店が館内に揃い、ママ・パパ向けの便利ガイドも用意されているため、屋外で遊んだあとの「締め」に最適だ。3階のスカイコートは段差の少ない屋外デッキで、ベビーカーのまま外気に当たりながら休める。駅直結ゆえ、子どもが疲れていてもそのまま改札へ抜けられる動線の良さが、一日の最後に効いてくる。営業時間は店舗により異なる（物販はおおむね10:00〜21:00、飲食はより遅くまで）。各店舗の営業時間は変更される場合があるため、訪問前に公式サイトで確認してほしい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Abeno_Q%27s_Mall.jpg/1280px-Abeno_Q%27s_Mall.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "大阪メトロ天王寺駅 徒歩約2分（駅直結）"
          },
          {
            "k": "料金",
            "v": "入館無料（飲食・買い物は別途）"
          },
          {
            "k": "雨の日",
            "v": "◎ 駅直結・屋内"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方（締め・夕食）"
          }
        ],
        "transit": "大阪メトロ天王寺駅 徒歩約2分（駅直結）"
      }
    ],
    "sideArticles": [
      {
        "t": "難波・道頓堀 食べ歩き5選。グリコサインから法善寺横丁まで",
        "h": "/feature/kansai-namba-dotonbori-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Neon_sign_of_Dotonbori_daytime.JPG"
      },
      {
        "t": "新世界・通天閣 観光5選。レトロな下町を歩く半日",
        "h": "/feature/kansai-shinsekai-tsutenkaku",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Tsutenkaku%2C_Osaka.jpg/1280px-Tsutenkaku%2C_Osaka.jpg"
      }
    ],
    "quote": "高い空も広い芝も、動物も名画も、駅を出てすぐに並んでいる。子どもの歩幅で天王寺・あべのを一日歩いた、その手ざわりの記録。",
    "quoteCite": "マチノワ編集部",
    "closing": "ハルカスを降りて駅の西側へ回ると、てんしばの芝生が待っている。子どもは靴のまま走り出し、こちらは木陰に腰を下ろして昼を食べた。芝の上では時間の進みがゆっくりになる。腹がふくれたところで、隣の天王寺動物園へ。アフリカサバンナの草食動物の長い影や、ゾウの大きな背中を、柵にあごをのせて飽きずに眺める時間が午後の真ん中にある。少し疲れが見えたら、園内の大阪市立美術館へ。ひんやりした館内で名画を見て、カフェで一息つくと、子どもにも本物を見た顔つきが少し残る。最後はあべのキューズモールに入って、屋根の下で休んで買い物をして、夕食をすませて駅へ向かう。歩いてみて思ったのは、性格のまるで違う体験が、乗り換えなしの徒歩圏に重なっているということ。子どもが歩けなくなっても、すぐ駅や屋内に逃げ込める。だから無理がない。ただ、てんしばと動物園は屋外が主役だから、夏は日差し、冬は冷えがそのまま体にくる。帽子や上着は一枚多めがいい。空が崩れそうな日は、芝と動物園を短めに切り上げて、ハルカス300・美術館・キューズモールの屋根のある三つをつないで歩けば、ほとんど濡れずに一日が成り立つ。動物園は月曜が休みのことが多く、開園時間も季節で動く。料金や営業も折々で変わるので、出かける前にそれぞれの公式ページをのぞいて、今日の数字を確かめてから家を出てほしい。"
  },
  "kansai-osaka-castle-walk": {
    "id": "kansai-osaka-castle-walk",
    "no": "KS-08",
    "articleType": "guide",
    "kicker": "OSAKA CASTLE WALK",
    "title": "大阪城公園を歩く。天守閣からお堀端の城跡さんぽ",
    "titleHTML": "大阪城公園を歩く。<br>天守閣からお堀端の城跡さんぽ",
    "subtitle": "JO-TERRACE OSAKAの朝のコーヒーから極楽橋、天守閣、豊國神社、西の丸庭園の芝生まで。都心の真横に広がる緑と水の城跡を、足の向くまま半日歩いた記録。",
    "lede": "電車を降りると、ビル街のざわめきがふっと遠のく。大阪城公園駅の改札を抜けた先には、もう石垣の気配と土の匂いがある。都心のすぐ隣に約105ヘクタールの緑とお堀が広がっているのだと頭ではわかっていても、信号も渡らないうちに鳥の声と木陰に包まれるのは、いつ来ても不思議だ。まずはJO-TERRACE OSAKAでコーヒーを一杯買い、湯気越しに園内のほうを見やる。今日は本丸の高みにある天守閣を先に仰いでから、坂を下りるようにお堀端と芝生へ抜けていくつもりだ。上り坂で息を切らすのは前半に済ませて、後半は水辺をゆっくり味わいたい——そんな気分で、紙コップを片手に歩き出す。なお、各施設の入場料や開いている時間は折々で見直されるので、出かける前にそれぞれの公式ページを覗いておくと安心だ。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Gokurakubashi_Bridge_on_Inner_Moat_of_Osaka_Castle_2.JPG/1280px-Gokurakubashi_Bridge_on_Inner_Moat_of_Osaka_Castle_2.JPG",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "JO-TERRACE OSAKA",
        "cuisine": "複合商業施設",
        "area": "大阪市中央区・大阪城公園",
        "purpose": "朝の集合と腹ごしらえ。駅前で食料と飲み物を整えてから城へ向かう",
        "desc": "JR大阪城公園駅の改札を出て西へすぐ、公園の入口に建つ低層の複合商業施設で、カフェやレストラン、ベーカリーなど飲食店を中心に20店舗以上が並ぶ。広い大阪城公園には園内に売店が点在するものの選択肢は限られるため、歩き始める前にここで朝食やコーヒー、散策中の飲み物を確保しておくと園内で食事処を探して歩き回らずに済む。芝生広場に面したテラス席もあり、城へ向かう前後の休憩点として使い勝手がよい。営業時間は店舗ごとに異なり変動もあるため、目当ての店がある場合は訪問前に公式サイトでの確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/JO-TERRACE_OSAKA_201909_002.jpg/1280px-JO-TERRACE_OSAKA_201909_002.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR大阪城公園駅 徒歩約1分（目安）"
          },
          {
            "k": "用途",
            "v": "飲食・休憩（入場無料）"
          },
          {
            "k": "雨の日",
            "v": "◎ 屋内店舗中心"
          },
          {
            "k": "おすすめ時間",
            "v": "朝（出発前の腹ごしらえ）"
          }
        ],
        "transit": "JR大阪城公園駅 徒歩約1分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "極楽橋",
        "cuisine": "橋",
        "area": "大阪市中央区・大阪城公園",
        "purpose": "本丸へ渡る前に立ち止まる。内堀越しに天守閣を正面から仰ぐ",
        "desc": "内堀をまたいで本丸の北側へと渡る橋で、橋の中ほどに立つと、水をたたえた内堀の向こうに天守閣がほぼ正面に立ち上がって見える。園内でも天守と水面を一枚に収めやすい撮影ポイントとして知られ、本丸へ上がる前のひと呼吸として立ち止まる価値がある。大阪城公園駅側から青屋門を抜けて南下する動線上にあり、駅から天守へ向かう道すがら自然に通りかかる位置にあるのも歩く順番として都合がよい。橋そのものに料金はかからず、いつでも渡れる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Gokurakubashi_Bridge_on_Inner_Moat_of_Osaka_Castle_2.JPG/1280px-Gokurakubashi_Bridge_on_Inner_Moat_of_Osaka_Castle_2.JPG"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR大阪城公園駅 徒歩約8分（目安）"
          },
          {
            "k": "料金",
            "v": "無料"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外・雨天は足元注意"
          },
          {
            "k": "おすすめ時間",
            "v": "午前（本丸へ上がる前）"
          }
        ],
        "transit": "JR大阪城公園駅 徒歩約8分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "大阪城天守閣",
        "cuisine": "天守・展望台",
        "area": "大阪市中央区・大阪城公園",
        "purpose": "本丸の中心。展望台から街と城跡を一望し、城の歴史を見る",
        "desc": "本丸にそびえる大阪城のシンボルで、内部は豊臣秀吉や大坂の陣にまつわる資料を展示するミュージアムになっており、最上階の展望台からは天守を取り囲む緑とお堀、そして市街地までを360度見渡せる。標高の高い本丸の頂点に立つため、このあと歩く西の丸庭園や水辺を上から俯瞰してから下りていくと、城跡全体の地形が頭に入って残りの散策が分かりやすくなる。土日や桜・行楽シーズンは入館待ちの列ができやすいので、開館直後の午前を狙うと比較的スムーズだ。入館料や開館時間は変更される場合があるため、訪問前に公式サイトでの確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Osaka_Castle_02bs3200.jpg/1280px-Osaka_Castle_02bs3200.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR森ノ宮駅・大阪城公園駅 徒歩約15〜20分（目安）"
          },
          {
            "k": "料金",
            "v": "大人1,200円（変動あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "○ 内部は屋内展示"
          },
          {
            "k": "おすすめ時間",
            "v": "午前（開館直後）"
          }
        ],
        "transit": "JR森ノ宮駅・大阪城公園駅 徒歩約15〜20分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "大阪城 豊國神社",
        "cuisine": "神社",
        "area": "大阪市中央区・大阪城公園",
        "purpose": "本丸を下りて参拝。出世開運を願う秀吉ゆかりの社",
        "desc": "天守閣のある本丸の南、桜門のすぐ近くに鎮座する神社で、豊臣秀吉公をはじめ秀頼公・秀長卿を祀る。農民から天下人へと上りつめた秀吉公にあやかり、出世開運の社として信仰を集めてきたのが特徴で、境内には立派な秀吉像も立つ。天守閣から桜門を抜けて西の丸庭園へ向かう動線のちょうど途中にあるため、本丸見学のあと参拝してから水辺へ下りる流れが組みやすい。御朱印を受けることもできる。授与の時間帯は決まっているため、御朱印などを希望する場合は事前に公式サイトで確認しておくとよい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Sanshuden_Hall_of_Hokoku_Shrine_in_Osaka_Castle.JPG/1280px-Sanshuden_Hall_of_Hokoku_Shrine_in_Osaka_Castle.JPG"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR森ノ宮駅 徒歩約15分（目安）"
          },
          {
            "k": "料金",
            "v": "参拝無料"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外参拝"
          },
          {
            "k": "おすすめ時間",
            "v": "昼（本丸見学のあと）"
          }
        ],
        "transit": "JR森ノ宮駅 徒歩約15分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "西の丸庭園",
        "cuisine": "庭園",
        "area": "大阪市中央区・大阪城公園",
        "purpose": "最後にひと休み。広い芝生から天守を眺めて締める",
        "desc": "本丸の西側に広がる有料の庭園で、約6.5ヘクタールの芝生越しに天守閣を望める開放的な眺めが見どころだ。塀の外からは得られない、天守を背景に芝生が一面に広がる構図はこの庭園ならではで、桜の名所としても知られ、シーズンには観桜ナイターが催される。坂や階段の多い本丸見学のあと、平らな芝生でゆったり腰を下ろして城を眺めれば、半日のさんぽを心地よく締めくくれる。原則として月曜が休園で、開園時間も季節によって変わるため、訪問前に公式サイトでの確認を。入園は有料。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/d/dc/Site_of_%C5%8Csaka-j%C5%8Ddai%27s_Residence.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR森ノ宮駅 徒歩約15分（目安）"
          },
          {
            "k": "料金",
            "v": "高校生以上200円（変動あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外の芝生庭園"
          },
          {
            "k": "おすすめ時間",
            "v": "午後（散策の締め）"
          }
        ],
        "transit": "JR森ノ宮駅 徒歩約15分"
      }
    ],
    "sideArticles": [
      {
        "t": "難波・道頓堀 食べ歩き5選。グリコサインから法善寺横丁まで",
        "h": "/feature/kansai-namba-dotonbori-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Neon_sign_of_Dotonbori_daytime.JPG"
      },
      {
        "t": "新世界・通天閣 観光5選。レトロな下町を歩く半日",
        "h": "/feature/kansai-shinsekai-tsutenkaku",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Tsutenkaku%2C_Osaka.jpg/1280px-Tsutenkaku%2C_Osaka.jpg"
      }
    ],
    "quote": "ビルの真横に石垣と水。天守を仰いでから芝生へ下りる、緑のなかの城跡さんぽ。",
    "quoteCite": "マチノワ編集部",
    "closing": "コーヒーで腹ごしらえを済ませたら、極楽橋へ向かう。内堀の水面に空がそのまま映り込み、橋のたもとで立ち止まると、堀の向こうに天守閣が正面から立ち上がってくる。ここで一度足を止めるのが、この公園のいちばん気持ちのいい瞬間かもしれない。橋を渡って本丸へ上がり、天守閣の展望台に立てば、足元の城跡と遠くのビル群が同じ視界に収まって、自分がいかに街なかの森を歩いているのかがよくわかる。展示を順に見て城の来歴をたどったあと、桜門のほうへ石段を下りていく。少し脇に入ると豊國神社が静かに構えていて、出世開運を願う秀吉ゆかりの社だと知ると、参道のひんやりした空気までありがたく感じられる。最後は天守を背に西の丸庭園へ。広い芝生に腰を下ろし、さっき上った天守をのんびり眺めていると、半日歩いた足の疲れがほどけていく。園内は石畳や坂、階段が多いので、歩きやすい靴で来てよかったと毎度思う。庭園は曜日や季節で閉まっていることもあり、天守閣も桜や行楽の頃には入館の列が伸びるから、開いている時間や休みは出発前に各施設の公式で確かめておきたい。雨の降る日なら、橋や庭園での長居は控えめにして、天守の屋内展示とJO-TERRACEでの食事や買い物に時間を寄せればいい。芝生から立ち上がり、もう一度天守を見上げて、街へ戻る道をたどる。"
  },
  "kansai-tempozan-family": {
    "id": "kansai-tempozan-family",
    "no": "KS-09",
    "articleType": "course",
    "kicker": "TEMPOZAN BAY FAMILY",
    "title": "天保山・海遊館 子連れ半日コース。港の水族館から観覧車、海の上へ",
    "titleHTML": "天保山・海遊館 子連れ半日コース。<br>港の水族館から観覧車、海の上へ",
    "subtitle": "海遊館で大水槽を見て、横丁で昼を食べ、ブロックで遊び、観覧車に上がって、最後は帆船で港へ。小さな子の足でも回りきれる、屋根の多いベイエリアの一日のたどり方。",
    "lede": "天保山が子連れに優しいのは、見どころが散らばっていないからだと思う。大阪メトロ中央線・大阪港駅を出れば、海遊館も観覧車も室内のレゴ施設も観光船も、どれも徒歩で数分。施設と施設のあいだに長い歩きが挟まらないので、ぐずる前に次の楽しみへ移れるし、ベビーカーでも段取りが崩れにくい。しかも屋根のある場所が多く、外の天気に一日を握られにくい。この半日コースは、水族館・横丁ごはん・室内遊び・観覧車・港クルーズという性格の違う体験を、子どもの集中が切れる手前で次々につなぐつもりで組んだ。朝いちばんの海遊館から始めて、海の上で締めくくる順番にしてある。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Octopus_sinensis_%28Osaka_Aquarium_KAIYUKAN%29.jpg/1280px-Octopus_sinensis_%28Osaka_Aquarium_KAIYUKAN%29.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "海遊館",
        "cuisine": "水族館",
        "area": "大阪市港区・天保山",
        "purpose": "開館直後に入る。最上階から下りながら太平洋大水槽を一周する",
        "desc": "天保山の中心にある海遊館は、建物の上層から下りながら水槽を見ていく独自の順路を持つ水族館だ。中央を貫く「太平洋」大水槽はジンベエザメが泳ぐことで知られ、フロアを下りるごとに同じ水槽を別の深さから眺められるため、子どもが飽きずに最後まで歩き通しやすい。屋内で天候に左右されず、ベビーカーでも回りやすい動線になっているので、一日の起点に向く。開館直後は比較的空いており、人気の大水槽前でも子どもを抱き上げてゆっくり見せられる。入館は閉館の1時間前までで、土日祝や長期休暇は混雑するため、チケットの事前購入が役立つ。入館料や営業時間は季節で変わるので、訪問前に公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Octopus_sinensis_%28Osaka_Aquarium_KAIYUKAN%29.jpg/1280px-Octopus_sinensis_%28Osaka_Aquarium_KAIYUKAN%29.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "大阪メトロ中央線 大阪港駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "大人2,700円・小中学生1,400円・幼児700円ほか(変動あり)"
          },
          {
            "k": "雨の日",
            "v": "◎ 全館屋内"
          },
          {
            "k": "おすすめ時間",
            "v": "開館直後の午前"
          }
        ],
        "transit": "大阪メトロ中央線 大阪港駅 徒歩約5分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "天保山マーケットプレース",
        "cuisine": "商業施設",
        "area": "大阪市港区・天保山",
        "purpose": "昼食と休憩に使う。昭和レトロの横丁で港の食事をとる",
        "desc": "海遊館のすぐ隣に建つ天保山マーケットプレースは、飲食店と土産物店が集まる商業施設で、子連れの昼食・休憩の拠点として使いやすい。館内の「なにわ食いしんぼ横丁」は昭和の下町の街並みを再現した一画で、お好み焼きや串もの、たこ焼きといった大阪らしい味を、レトロな路地を歩きながら選べるのが特徴だ。屋内なので天候を気にせず、ベビーカーのまま移動できる。海遊館・観覧車・観光船のいずれからも徒歩すぐの位置にあり、午前の水族館と午後の遊びの間にはさむ食事休憩にちょうどよい。店舗の入れ替わりや営業時間、休館日は変わることがあるため、目当ての店がある場合は訪問前に公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/LEGOLAND_Discovery_Center_Osaka.jpg/1280px-LEGOLAND_Discovery_Center_Osaka.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "大阪メトロ中央線 大阪港駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "入館無料(飲食・買い物は別途)"
          },
          {
            "k": "雨の日",
            "v": "◎ 全館屋内"
          },
          {
            "k": "おすすめ時間",
            "v": "昼食どき(正午前後)"
          }
        ],
        "transit": "大阪メトロ中央線 大阪港駅 徒歩約5分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "レゴランド・ディスカバリー・センター大阪",
        "cuisine": "屋内アトラクション施設",
        "area": "大阪市港区・天保山",
        "purpose": "午後の室内遊びに使う。ブロックの体験コーナーで遊ぶ",
        "desc": "天保山マーケットプレース内にあるレゴランド・ディスカバリー・センター大阪は、レゴブロックをテーマにした屋内型の体験施設だ。大阪の街並みをブロックで再現したジオラマや、自分でブロックを組んで遊べるコーナー、子ども向けのライド・アトラクションなどがそろい、未就学児から小学生まで体を動かしながら長く遊べる。完全な屋内施設なので、午後の天候が崩れても予定を変えずに過ごせるのが利点だ。マーケットプレース内にあるため、昼食をとった流れでそのまま入りやすい。混雑時は入場制限がかかることがあり、日時指定の前売券が役立つ。営業時間・入場料・対象年齢の条件は変わることがあるため、訪問前に公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/LEGOLAND_Discovery_Center_Osaka.jpg/1280px-LEGOLAND_Discovery_Center_Osaka.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "大阪メトロ中央線 大阪港駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "公式サイトで要確認(前売・プランあり/変動)"
          },
          {
            "k": "雨の日",
            "v": "◎ 全館屋内"
          },
          {
            "k": "おすすめ時間",
            "v": "午後(昼食後)"
          }
        ],
        "transit": "大阪メトロ中央線 大阪港駅 徒歩約5分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "天保山大観覧車",
        "cuisine": "観覧車",
        "area": "大阪市港区・天保山",
        "purpose": "夕方前に乗る。高さ112mから港と大阪湾を見渡す",
        "desc": "天保山マーケットプレースに隣接して立つ天保山大観覧車は、直径100m・高さ約112.5mの大型観覧車で、1周およそ15分かけて港の上空をゆっくり回る。晴れた日には眼下に大阪港、遠くに生駒の山並みや明石海峡大橋、六甲方面まで見渡せ、午前に海遊館で見た海を今度は空から眺め直す体験になる。ゴンドラは座って乗れるため、たくさん歩いて疲れた子どもの休憩も兼ねられるのがファミリーに向く点だ。海遊館やマーケットプレースから徒歩すぐで、屋外施設のため強風や荒天時には運休することがある。乗車料金や運行時間は変わることがあるので、訪問前に公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Tempozan_Giant_Ferris_Wheel_upwards_view.jpg/1280px-Tempozan_Giant_Ferris_Wheel_upwards_view.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "大阪メトロ中央線 大阪港駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "1人800円前後(変動あり)"
          },
          {
            "k": "雨の日",
            "v": "○ ゴンドラは乗車可(強風時は運休あり)"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方前(午後遅め)"
          }
        ],
        "transit": "大阪メトロ中央線 大阪港駅 徒歩約5分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "帆船型観光船サンタマリア",
        "cuisine": "観光船",
        "area": "大阪市港区・天保山",
        "purpose": "締めに乗る。海遊館西はとばから出航し港を巡る",
        "desc": "海遊館西はとばから出航する帆船型観光船サンタマリアは、コロンブスの旗艦をモチーフに大きく造られた観光クルーズ船で、デイクルーズはおよそ45分かけて大阪ベイエリアの名所を海上から巡る。甲板や船内から港の景色を眺められ、観覧車で上空から見た港を、最後は水面の高さから見直す締めくくりになる。乗り場が海遊館のすぐ近くにあるため、午後の動線にそのまま組み込みやすいのも子連れにうれしい。幼児は大人1名につき1名まで無料の設定があり、海遊館とのセット券も用意されている。屋外・水上の運航のため荒天時は運休することがあり、運航スケジュールは時期で変わる。出航時刻や料金は訪問前に公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Santa_Mar%C3%ADa%2C_Osaka_Aqua_Bus_-_Oct_3%2C_2025.jpg/1280px-Santa_Mar%C3%ADa%2C_Osaka_Aqua_Bus_-_Oct_3%2C_2025.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "大阪メトロ中央線 大阪港駅 徒歩約7分"
          },
          {
            "k": "料金",
            "v": "デイクルーズ 大人1,800円・小学生900円ほか(変動あり)"
          },
          {
            "k": "雨の日",
            "v": "△ 運航は天候次第(荒天運休あり)"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方(一日の締め)"
          }
        ],
        "transit": "大阪メトロ中央線 大阪港駅 徒歩約7分(海遊館西はとば)"
      }
    ],
    "sideArticles": [
      {
        "t": "難波・道頓堀 食べ歩き5選。グリコサインから法善寺横丁まで",
        "h": "/feature/kansai-namba-dotonbori-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Neon_sign_of_Dotonbori_daytime.JPG"
      },
      {
        "t": "新世界・通天閣 観光5選。レトロな下町を歩く半日",
        "h": "/feature/kansai-shinsekai-tsutenkaku",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Tsutenkaku%2C_Osaka.jpg/1280px-Tsutenkaku%2C_Osaka.jpg"
      }
    ],
    "quote": "海遊館の大水槽から横丁ごはん、室内遊び、観覧車、そして帆船まで。歩きを最小限にして、性格の違う遊びを子どもの集中に合わせてつないだ天保山の半日。",
    "quoteCite": "マチノワ編集部",
    "closing": "朝は海遊館の開館に合わせて入りたい。最上階まで上がって、太平洋大水槽を見ながら下りていくと、ジンベエザメの前で子どもの足が自然と止まる。ひとめぐりしたら天保山マーケットプレースへ移って、昭和レトロの横丁で港を眺めながら昼と休憩を。午後は屋根の下が心地よい時間帯なので、レゴランド・ディスカバリー・センター大阪でブロックの体験コーナーに腰を据える。遊び疲れる前に外へ出て、高さ112メートルの天保山大観覧車へ。港と大阪湾がいちどに見渡せて、ここで一日の景色が一段上がる。締めは海遊館西はとばから出る帆船型観光船サンタマリア。デッキで風を受けながら港を巡れば、子どもにとっては陸の遊びとは別の海の時間になる。観覧車とサンタマリアは外と水上が舞台なので、強風や荒天だと動かないことがある。その日は二つを後ろに回し、海遊館・横丁・レゴ施設の屋内三つだけでも十分に一日が立つように組み替えればいい。海遊館は土日祝や長期休みにかなり混むので、時間指定や事前購入があると入口でつまずかずにすむ。入館料も乗り物の料金も運航のダイヤも折々で変わるから、出かける前に各施設の今の案内をのぞいておくと安心だ。"
  },
  "kansai-expo-park-family": {
    "id": "kansai-expo-park-family",
    "no": "KS-10",
    "articleType": "guide",
    "kicker": "EXPO PARK FAMILY",
    "title": "万博記念公園、子連れで過ごす一日。芝生も水族館もミュージアムも一駅圏",
    "titleHTML": "万博記念公園、子連れで過ごす一日。<br>芝生も水族館もミュージアムも一駅圏",
    "subtitle": "太陽の塔の足元から自然文化園の芝生へ。そのままニフレル、ららぽーとEXPOCITY、国立民族学博物館まで。屋外と屋内を行き来できる吹田・万博公園の懐の深さを、子どもの機嫌と天気を主役にして楽しむ。",
    "lede": "子連れで遠出するとき、いちばん怖いのは「天気が崩れたら行き場がない」ことだ。その点で大阪・吹田の万博記念公園エリアは、子ども連れにとってずるいくらい間口が広い。大阪万博跡地に残った広大な芝生公園で思い切り走らせておいて、雲行きが怪しくなったら駅をはさんだ向かいのEXPOCITYへ逃げ込めばいい。屋外で体力を発散させてから屋内施設へ移る、という子連れならではの王道の組み立てが、ここではほぼ移動なしで成立する。シンボルの太陽の塔を見上げ、自然文化園の芝生とすべり台で遊び、ニフレルで生きものに触れ、ららぽーとEXPOCITYで腹ごしらえし、国立民族学博物館で世界一周する——これだけのものが一駅圏にそろっていて、子どもの体力と空模様を見ながら好きに足し引きできる。ベビーカーや帽子は持っていきたいし、各施設の料金や開いている時間、休みの日や予約の要否は折々で変わるので、出かける前にそれぞれの公式サイトをのぞいておくと当日が楽になる。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Osaka_Expo%2770_Kodak%2BRicoh_Pavilion.jpg/1280px-Osaka_Expo%2770_Kodak%2BRicoh_Pavilion.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "太陽の塔",
        "cuisine": "塔・モニュメント",
        "area": "吹田市・万博記念公園",
        "purpose": "まず足元で見上げる。万博のシンボルから一日を始める",
        "desc": "岡本太郎が1970年の大阪万博のために制作した高さ約70mのシンボルで、現在も万博記念公園の中央にそびえている。子連れではまず足元から見上げるだけでも迫力があり、正面の「黄金の顔」、背面の「黒い太陽」と表情が違う点を親子で見比べるのが楽しい。内部は耐震改修を経て公開され、塔内をつらぬく「生命の樹」を階段で見上げる観覧ができるが、内部観覧は原則として事前予約制で、自然文化園とは別に入館の手続きが要る。ベビーカーでは塔内の階段を上れないため、小さな子と入る場合は事前に対応を確認しておきたい。料金や予約の要否、休館日は変更されることがあるため、訪問前に公式サイトでの確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Osaka_Expo%2770_Kodak%2BRicoh_Pavilion.jpg/1280px-Osaka_Expo%2770_Kodak%2BRicoh_Pavilion.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "大阪モノレール万博記念公園駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "外から見るのは無料／内部観覧は別料金・要予約（公式サイトで要確認）"
          },
          {
            "k": "雨の日",
            "v": "△ 内部観覧は屋内・外観は雨天可"
          },
          {
            "k": "おすすめ時間",
            "v": "午前（開園直後）"
          }
        ],
        "transit": "大阪モノレール万博記念公園駅 徒歩約5分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "万博記念公園 自然文化園",
        "cuisine": "公園・遊具広場",
        "area": "吹田市・万博記念公園",
        "purpose": "芝生で走らせる。大型すべり台で思い切り遊ばせる",
        "desc": "太陽の塔を含む万博記念公園の主要部を占める広大な園地で、芝生広場や花畑、林の中を歩ける空中観察路ソラードなどが入園料だけで楽しめる。子連れの目当てになるのが遊具広場「やったねの木」で、高さ・長さのある大型ローラーすべり台があり、体力のある小学生は何度でも滑り直したくなる。塔の足元から遊具広場まで距離があるので、未就学児はベビーカーがあると移動がぐっと楽になる。日陰の少ない芝生エリアが多いため、夏は帽子と水分、レジャーシートを用意したい。入園料や開園時間、休園日（水曜になりやすい）は変更されることがあるため、訪問前に公式サイトでの確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Japanese_garden_scenery_at_Expo%E2%80%9970_Commemorative_Park_in_Osaka%2C_November_2017_-_146.jpg/1280px-Japanese_garden_scenery_at_Expo%E2%80%9970_Commemorative_Park_in_Osaka%2C_November_2017_-_146.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "大阪モノレール万博記念公園駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "自然文化園・日本庭園共通 大人260円・小中80円（公式サイトで要確認）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外中心・遊具は濡れる"
          },
          {
            "k": "おすすめ時間",
            "v": "午前〜昼"
          }
        ],
        "transit": "大阪モノレール万博記念公園駅 徒歩約5分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "ニフレル（NIFREL）",
        "cuisine": "ミュージアム（水族館・動物園・美術館）",
        "area": "吹田市・千里万博公園",
        "purpose": "昼から屋内へ。生きものを間近で見て触れる",
        "desc": "EXPOCITY内にある、水族館・動物園・美術館の枠を超えた展示施設で、「感性にふれる」をコンセプトに、いろや動き、すがたといったテーマごとに生きものを見せる構成になっている。ホワイトタイガーやワオキツネザル、ミニカバなどが同じ館内で見られ、放し飼いに近いゾーンでは小動物が来園者のすぐ近くを通ることもあり、子どもの「近い！」という驚きを引き出しやすい。屋内施設なので、午前に屋外で遊んだあとの昼下がりや、雨の日の避難先として使いやすい。混雑日は入館待ちが出るため、時間に余裕を持って向かいたい。料金や営業時間は変更されることがあるため、訪問前に公式サイトでの確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Nifrel%2C_Expocity%2C_Suita%2C_Osaka_-_Apr_12%2C_2019.jpg/1280px-Nifrel%2C_Expocity%2C_Suita%2C_Osaka_-_Apr_12%2C_2019.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "大阪モノレール万博記念公園駅 徒歩約2分"
          },
          {
            "k": "料金",
            "v": "大人2,400円・小中1,200円・幼児(3歳〜)700円（公式サイトで要確認）"
          },
          {
            "k": "雨の日",
            "v": "◎ 全館屋内"
          },
          {
            "k": "おすすめ時間",
            "v": "昼過ぎ"
          }
        ],
        "transit": "大阪モノレール万博記念公園駅 徒歩約2分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "ららぽーとEXPOCITY",
        "cuisine": "商業施設",
        "area": "吹田市・千里万博公園",
        "purpose": "遅めの昼食と休憩。フードコートで一息つく",
        "desc": "ニフレルや観覧車などと同じEXPOCITYの一角を占める大型商業施設で、約300の専門店に加えてレストランやフードコートがそろう。子連れの一日の組み立てでは、屋外と屋内をはしごしたあとの遅めの昼食や、おやつ・授乳・おむつ替えといった休憩拠点として組み込みやすいのが利点だ。フードコートは席数が多く、子ども連れでもメニューを選びやすい。ベビー用品や子ども服の店もあり、忘れ物の補充が利く点も家族には心強い。閉店時間まで開いているので、夕方まで遊んでから立ち寄る流れにも無理がない。営業時間や各店の入れ替えは変更されることがあるため、訪問前に公式サイトでの確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/%E3%83%91%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%B3%E3%82%B9%E4%B8%AD%E3%81%AEBsGravity%E3%83%A1%E3%83%B3%E3%83%90%E3%83%BC.jpg/1280px-%E3%83%91%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%B3%E3%82%B9%E4%B8%AD%E3%81%AEBsGravity%E3%83%A1%E3%83%B3%E3%83%90%E3%83%BC.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "大阪モノレール万博記念公園駅 徒歩約2分"
          },
          {
            "k": "料金",
            "v": "入場無料（飲食・買い物は別途）"
          },
          {
            "k": "雨の日",
            "v": "◎ 全館屋内"
          },
          {
            "k": "おすすめ時間",
            "v": "昼〜夕方"
          }
        ],
        "transit": "大阪モノレール万博記念公園駅 徒歩約2分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "国立民族学博物館",
        "cuisine": "博物館",
        "area": "吹田市・万博記念公園",
        "purpose": "締めに世界一周。本物の民具で文化にふれる",
        "desc": "万博記念公園の自然文化園内にある、文化人類学・民族学をテーマにした国立の博物館で、世界各地で集めた民具や衣装、楽器、乗り物などを地域ごとに大量に展示している。実物の大きさや作りを間近で見られるため、教科書の写真とは違う「本物の手ざわり」を子どもに感じさせやすいのが、ここならではの強みだ。高校生以下は常設展示が無料で、家族で立ち寄りやすい。展示は広く、全部を回ると相当歩くので、子どもの体力に合わせて見る地域を絞るのがコツ。屋内施設なので一日の締めや雨の日の軸に向く。観覧料・開館時間・休館日（水曜になりやすい）は変更されることがあるため、訪問前に公式サイトでの確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Rujak_truck_at_Minpaku_2.jpg/1280px-Rujak_truck_at_Minpaku_2.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "大阪モノレール万博記念公園駅 徒歩約15分（園内含む）"
          },
          {
            "k": "料金",
            "v": "常設展示 大人780円・高校生以下無料（公式サイトで要確認）"
          },
          {
            "k": "雨の日",
            "v": "◎ 全館屋内"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方（締め）"
          }
        ],
        "transit": "大阪モノレール万博記念公園駅 徒歩約15分"
      }
    ],
    "sideArticles": [
      {
        "t": "難波・道頓堀 食べ歩き5選。グリコサインから法善寺横丁まで",
        "h": "/feature/kansai-namba-dotonbori-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Neon_sign_of_Dotonbori_daytime.JPG"
      },
      {
        "t": "新世界・通天閣 観光5選。レトロな下町を歩く半日",
        "h": "/feature/kansai-shinsekai-tsutenkaku",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Tsutenkaku%2C_Osaka.jpg/1280px-Tsutenkaku%2C_Osaka.jpg"
      }
    ],
    "quote": "芝生で走らせて、雨なら屋内へ。子どもの体力と空模様に合わせて自由に組み替えられる、吹田・万博公園の一日。",
    "quoteCite": "マチノワ編集部",
    "closing": "子連れの一日は、太陽の塔の足元に立つところから始めたい。見上げるほど大きいシンボルは、それだけで子どもの目を引きつける格好のスタート地点だ。そのまま自然文化園に入って芝生に放てば、あとは大型すべり台と広場が勝手に体力を削ってくれる。ここで午前中をたっぷり使い、子どもがくたびれてきた昼すぎに屋内へ移るのがちょうどいい。EXPOCITY側のニフレルは生きものを間近で見て触れられるので、走り疲れた体を休めながらも飽きさせない。お腹がすいたらららぽーとEXPOCITYのフードコートへ。ベビーカーでも入りやすく、子どもの好物が見つかりやすいのもありがたい。まだ機嫌がもつようなら、締めに国立民族学博物館で世界の民具に触れて一日を閉じる。雨に降られた日は、芝生の時間を早めに切り上げて、ニフレル・ららぽーと・民博の屋内三施設を軸に組み直せばいい。公園が広いぶん歩く距離はそれなりにあり、夏場は日差しも強いので、こまめな給水と日陰での休憩を惜しまずに。太陽の塔の内部観覧は事前予約が前提で、各施設とも週の半ばに休みが入りやすいから、回る順番と時刻は当日の開園・開館時間に合わせて。最終的な料金や休みの予定は、訪ねる前に公式で一度たしかめておくと安心だ。"
  },
  "kansai-fushimi-inari-walk": {
    "id": "kansai-fushimi-inari-walk",
    "no": "KS-11",
    "articleType": "guide",
    "kicker": "FUSHIMI INARI WALK",
    "title": "伏見稲荷を歩く。千本鳥居から稲荷山の辻へ、門前へ下りる一日",
    "titleHTML": "伏見稲荷を歩く。千本鳥居から稲荷山の辻へ、<br>門前へ下りる一日",
    "subtitle": "朱の楼門をくぐり、鳥居のトンネルを抜けて稲荷山の四ツ辻まで。下りて東福寺の庭に寄り、参道のいなり寿司で締める深草さんぽ。",
    "lede": "JR稲荷駅の改札を出ると、もう正面に朱の楼門が立っている。京都市の南東、稲荷山のふもとに広がる深草は、全国に三万社あるという稲荷神社の総本宮を抱えた門前町で、参道には線香ではなく油揚げと焼き物のにおいが流れている。境内はいつでも開いていて、誰かに拝観料を払うわけでもない。だからこの街は、時刻表に縛られずに歩ける。今日は楼門から本殿へ手を合わせ、奥へ続く鳥居の連なりをくぐり、思いきって稲荷山の中腹まで登ってみる。山を下りたら少し足をのばして東福寺の庭を眺め、最後はまた門前に戻ってくる。坂のある一日になるはずだ。拝観や食事にかかるものは時季や店で動くから、出かける前に各施設の最新案内へ目を通しておくと安心して歩ける。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Fushimi-Inari-Shrine-Senbon-Torii-2018-Luka-Peternel.jpg/1280px-Fushimi-Inari-Shrine-Senbon-Torii-2018-Luka-Peternel.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "伏見稲荷大社",
        "cuisine": "神社",
        "area": "京都市伏見区・深草",
        "purpose": "朝に参拝。楼門と本殿から一日を始める",
        "desc": "全国の稲荷神社の総本宮で、稲荷大神を祀り、商売繁盛や五穀豊穣の信仰を集めてきた古社だ。JR稲荷駅を出るとすぐ目の前に朱塗りの大鳥居と楼門が立ち、駅からほぼ歩かずに境内へ入れるのが伏見稲荷ならではの強み。豊臣秀吉が母の病平癒を願って寄進したと伝わる楼門の奥に本殿があり、まずここで手を合わせてから山へ向かうのが昔ながらの順路になっている。境内は終日開いていて拝観料もかからないため、人の少ない朝のうちに本殿まわりをゆっくり巡るのがおすすめだ。授与所の開く時間など一部の対応は時間帯で変わるため、訪問前に公式サイトでの確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Romon%2C_Fushimi_Inari-taisha%2C_Kyoto%2C_West_view_20190416_1.jpg/1280px-Romon%2C_Fushimi_Inari-taisha%2C_Kyoto%2C_West_view_20190416_1.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR稲荷駅すぐ／京阪伏見稲荷駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "境内参拝無料"
          },
          {
            "k": "雨の日",
            "v": "○ 楼門・本殿は屋根あり"
          },
          {
            "k": "おすすめ時間",
            "v": "朝（人が少ない）"
          }
        ],
        "transit": "JR稲荷駅 徒歩約1分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "千本鳥居",
        "cuisine": "鳥居参道",
        "area": "京都市伏見区・深草",
        "purpose": "本殿の奥へ。朱の鳥居のトンネルをくぐる",
        "desc": "本殿の奥から奥社奉拝所へと続く参道に、朱塗りの鳥居がすき間なく連なる一帯が千本鳥居だ。「千本」は数の正確さではなく「数えきれないほど多い」という意味で、実際には山全体で一万基を超える鳥居が奉納されている。願いが通る、または通ったお礼として鳥居を奉納する習わしが江戸期以降に広まり、その積み重ねがこの朱のトンネルを形づくった。途中で参道が二手に分かれて両側に鳥居が立つ区間があり、奥へ進むほど人がまばらになっていく。光の入り方が変わる朝のうちに歩くと、鳥居の朱が際立って見える。狭い一方通行区間もあるため、立ち止まっての撮影は譲り合いを。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Fushimi-Inari-Shrine-Senbon-Torii-2018-Luka-Peternel.jpg/1280px-Fushimi-Inari-Shrine-Senbon-Torii-2018-Luka-Peternel.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR稲荷駅 徒歩約5分（本殿の奥）"
          },
          {
            "k": "料金",
            "v": "無料"
          },
          {
            "k": "雨の日",
            "v": "△ 鳥居の下だが足元に注意"
          },
          {
            "k": "おすすめ時間",
            "v": "早朝（混雑前）"
          }
        ],
        "transit": "JR稲荷駅 徒歩約5分（本殿奥）"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "稲荷山・四ツ辻",
        "cuisine": "展望地・参道",
        "area": "京都市伏見区・深草",
        "purpose": "山を登る。中腹の辻で京都南部を見渡す",
        "desc": "奥社からさらに鳥居をくぐって登っていくと、稲荷山の中腹にあたる四ツ辻に出る。標高約233mの稲荷山は山そのものが信仰の対象で、頂上の一ノ峰まで参道がぐるりと一周しているが、四ツ辻はその分岐点であり、京都市南部の街並みを一望できる眺望地として知られる。ここには古くからの茶屋があって、いなり寿司やきつねうどん、わらび餅などで休憩でき、ベンチに腰かけて景色を眺める人が多い。本殿からここまで片道おおむね30分、石段が続くので歩きやすい靴で。時間と体力に応じて、ここで引き返すか山頂へ一周するかを決めるとよい。茶屋の営業時間は変わることがあるため公式の案内で確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/View_of_Kyoto_from_Mount_Inari.jpg/1280px-View_of_Kyoto_from_Mount_Inari.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR稲荷駅から山道徒歩約40分（本殿から約30分）"
          },
          {
            "k": "用途",
            "v": "展望・休憩（茶屋あり）"
          },
          {
            "k": "雨の日",
            "v": "✕ 山道のため雨天は不向き"
          },
          {
            "k": "おすすめ時間",
            "v": "午前（明るいうちに登る）"
          }
        ],
        "transit": "JR稲荷駅から徒歩で山道約40分（本殿から約30分）"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "東福寺",
        "cuisine": "寺院",
        "area": "京都市東山区・本町",
        "purpose": "午後に拝観。通天橋と方丈庭園を巡る",
        "desc": "伏見稲荷から京阪で一駅、臨済宗東福寺派の大本山で、奈良の東大寺と興福寺から一字ずつ取って名づけられた京都の大伽藍だ。境内の谷(洗玉澗)に架かる通天橋から見下ろす渓谷の眺めが名高く、橋の上から木々の海を一望できる構図はこの寺ならではのもの。近代庭園を代表する方丈の八相の庭は、市松模様の苔と石が配された幾何学的な意匠で知られ、通天橋とあわせて回ると見ごたえがある。広い境内は伏見稲荷とは対照的に静かで、山歩きのあとに落ち着いて庭を眺めるのに向く。通天橋の拝観は有料で、紅葉期は拝観時間や受付の扱いが変わり大変混雑する。最新の拝観時間・料金は公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Kyoto_Tofuku-ji_Tsuten-kyo_05.jpg/1280px-Kyoto_Tofuku-ji_Tsuten-kyo_05.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR・京阪 東福寺駅 徒歩約10分"
          },
          {
            "k": "料金",
            "v": "通天橋 大人600円ほか（紅葉期は変動あり・公式で要確認）"
          },
          {
            "k": "雨の日",
            "v": "○ 伽藍・方丈は雨でも巡れる"
          },
          {
            "k": "おすすめ時間",
            "v": "午後（紅葉期は早め）"
          }
        ],
        "transit": "JR・京阪 東福寺駅 徒歩約10分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "伏見稲荷参道（表参道商店街）",
        "cuisine": "商店街",
        "area": "京都市伏見区・深草",
        "purpose": "締めは食べ歩き。門前のいなり寿司と焼き物",
        "desc": "JR稲荷駅から大社へ向かう参道沿いに、土産物店や食事処、露店が並ぶ門前のにぎわいエリアだ。名物はやはりいなり寿司で、なかでも創業を1540年と伝える老舗「祢ざめ家」は、店名を豊臣秀吉が名づけたという由緒を持ち、いなり寿司や鯖寿司で知られる。稲荷の使いであるキツネにちなみ、油揚げを使った甘辛いいなり寿司が門前グルメの中心に据えられているのが、ほかの寺社の参道とは違う伏見稲荷らしさだ。すずめやうずらの焼き物といった珍しい一品を出す店もあり、山を下りたあとの締めに立ち寄るのにちょうどよい。食べ歩きは混雑時のマナーとして、購入した店舗の飲食スペースやベンチを使うと安心だ。店ごとに営業時間や定休日が異なるため、目当てがある場合は事前に各店の公式情報で確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Romon%2C_Fushimi_Inari-taisha%2C_Kyoto%2C_West_view_20190416_1.jpg/1280px-Romon%2C_Fushimi_Inari-taisha%2C_Kyoto%2C_West_view_20190416_1.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR稲荷駅すぐ（参道沿い）"
          },
          {
            "k": "用途",
            "v": "食べ歩き・土産"
          },
          {
            "k": "雨の日",
            "v": "○ 店内飲食に切り替え可"
          },
          {
            "k": "おすすめ時間",
            "v": "昼〜夕方（下山後）"
          }
        ],
        "transit": "JR稲荷駅 徒歩約1分（参道沿い）"
      }
    ],
    "sideArticles": [
      {
        "t": "金閣寺・きぬかけの路 観光5選。北山の名刹を巡る",
        "h": "/feature/kansai-kinkakuji-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Water_reflection_of_Kinkaku-ji_Temple_a_sunny_day%2C_Kyoto%2C_Japan.jpg/1280px-Water_reflection_of_Kinkaku-ji_Temple_a_sunny_day%2C_Kyoto%2C_Japan.jpg"
      },
      {
        "t": "河原町・先斗町デート5選。鴨川沿いの夜を歩く",
        "h": "/feature/kansai-kawaramachi-pontocho-date",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Wooden_and_bamboo_facades_of_dwellings_with_sudare_in_a_cobbled_street_of_Gion%2C_perspective_effect_with_vanishing_point%2C_Kyoto%2C_Japan.jpg/1280px-Wooden_and_bamboo_facades_of_dwellings_with_sudare_in_a_cobbled_street_of_Gion%2C_perspective_effect_with_vanishing_point%2C_Kyoto%2C_Japan.jpg"
      }
    ],
    "quote": "朱の楼門から鳥居の奥へ、山の辻へ。登って下りて、また門前のにおいに帰ってくる深草の一日。",
    "quoteCite": "マチノワ編集部",
    "closing": "楼門の前に立つと、まずここから一日が始まるのだと体が分かる。伏見稲荷大社の本殿に手を合わせ、ふりかえれば人の流れはみな同じ方へ吸い込まれていく。その奥が千本鳥居だ。朱の柱が二列に分かれ、トンネルのように頭上を覆い、足を止めると背後の喧騒が急にやわらぐ。鳥居を抜けてもまだ道は続く。せっかくなので、そのまま稲荷山を登ってみる。石段が幾度も折り返し、息が上がってきたあたりで稲荷山・四ツ辻に出る。ここで京都南部の屋根の海がひらけ、登ってきた甲斐を風が運んでくる。標高はそう高くないが、山道なので靴だけは歩きやすいものにしておきたい。来た道を辻から下りたら、いったん京阪で東福寺へ。通天橋から谷を見下ろし、方丈庭園の白砂と苔の対比を縁側からゆっくり眺める。紅葉の頃はこの一帯がまるごと混むので、その時季は時間に余裕を見ておくといい。庭で静けさを味わったら、最後はふたたび伏見稲荷参道（表参道商店街）へ戻る。いなり寿司をひとつ立ち食いし、焼き物の香ばしさにつられてもう一品。歩き終えてみると、鳥居の朱、山上の眺め、禅寺の庭、門前の湯気と、ずいぶん違う景色を一日でくぐってきたのだと気づく。雨の脚が強い日は山を三ツ辻あたりで引き返し、屋根のある東福寺の伽藍と参道の食事処に時間をまわせば、濡れずに深草を楽しめる。受付時間や料金はそのつど変わることがあるから、足を運ぶ前に公式の案内を一度のぞいておくと、坂の多いこの一日をより身軽に歩ける。"
  },
  "kansai-kinkakuji-walk": {
    "id": "kansai-kinkakuji-walk",
    "no": "KS-12",
    "articleType": "guide",
    "kicker": "KINKAKUJI KINUKAKE",
    "title": "きぬかけの路、名刹をつなぐ一本道。金閣寺から御室の伽藍へ",
    "titleHTML": "きぬかけの路、名刹をつなぐ一本道。<br>金閣寺から御室の伽藍へ",
    "subtitle": "金閣寺・龍安寺・仁和寺。世界遺産の三寺が約2.5kmで地続きになる、京都北山ならではの歩き方。",
    "lede": "京都の寺めぐりは、たいてい電車やバスで点と点を結ぶことになる。けれど衣笠山の麓だけは事情が違う。「きぬかけの路」という一本の観光道路に、金閣寺・龍安寺・仁和寺という世界遺産が約2.5kmの間隔で並び、寺の門を出てそのまま次の門まで歩いていける。乗り換えも待ち時間もなく、緑の多い緩やかな坂道がそのまま参道のように続く——これが北山という土地の、ほかにはない楽しみ方だ。金色の楼閣、白砂の石庭、御室の大伽藍と、性格のまるで違う名刹を「徒歩で連続して」体感できるのは、この一本道があるからこそ。さらに足を延ばせば天神信仰の社や足利将軍家ゆかりの静かな庭も射程に入る。この記事では、北山を一本道でつなぐという視点から、五つの場所をたどってみたい。なお拝観料や受付時間は折々で見直されるので、出かける前に各寺の公式情報へ目を通しておくと安心だ。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Water_reflection_of_Kinkaku-ji_Temple_a_sunny_day%2C_Kyoto%2C_Japan.jpg/1280px-Water_reflection_of_Kinkaku-ji_Temple_a_sunny_day%2C_Kyoto%2C_Japan.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "金閣寺（鹿苑寺）",
        "cuisine": "寺院（世界遺産）",
        "area": "京都市北区・金閣寺町",
        "purpose": "午前に拝観。鏡湖池に映る金色の舎利殿から一日を始める",
        "desc": "臨済宗相国寺派の禅寺で、正式名を鹿苑寺という。三層の楼閣「舎利殿」の二層・三層に金箔が施され、目の前に広がる鏡湖池の水面に金色の姿が映り込むのがこの寺ならではの見どころだ。室町三代将軍・足利義満の山荘を寺に改めたもので、池泉回遊式の庭園をぐるりと一周しながら、角度を変えて舎利殿を眺められる順路になっている。逆光になりにくい午前中の早い時間に訪れると、水鏡の反射がいっそう美しい。拝観料は大人500円ほど（変動あり）、開門は朝9時から。拝観料や時間は変更される場合があるため、訪問前に公式サイトでの確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Water_reflection_of_Kinkaku-ji_Temple_a_sunny_day%2C_Kyoto%2C_Japan.jpg/1280px-Water_reflection_of_Kinkaku-ji_Temple_a_sunny_day%2C_Kyoto%2C_Japan.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "市バス「金閣寺道」下車 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "大人500円ほど（変動あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "△ 池庭中心で屋外を歩く"
          },
          {
            "k": "おすすめ時間",
            "v": "午前（開門直後）"
          }
        ],
        "transit": "市バス「金閣寺道」 徒歩約5分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "龍安寺",
        "cuisine": "寺院（世界遺産・枯山水庭園）",
        "area": "京都市右京区・龍安寺御陵ノ下町",
        "purpose": "石庭の縁側に座る。十五の石と白砂に静かに向き合う",
        "desc": "細川勝元が室町時代に創建した禅寺で、方丈南庭の枯山水「石庭」で世界的に知られる。東西約25m、南北約10mの白砂の庭に大小15個の石を配し、樹木も花も置かない徹底した抽象表現が特徴だ。どの位置から眺めても15個すべてを一度に見渡せないよう石が配置されていると伝えられ、縁側に腰を下ろして石数を数えてみるのがこの寺ならではの楽しみ方になる。方丈裏には「吾唯足知（われ ただ たるを しる）」を刻んだつくばいもある。きぬかけの路を金閣寺から西へ歩いて来られる位置にあり、拝観料は大人600円ほど（変動あり）。拝観時間や料金は変更されることがあるため、公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/RyoanJi-Dry_garden.jpg/1280px-RyoanJi-Dry_garden.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "嵐電北野線「龍安寺」駅 徒歩約10分"
          },
          {
            "k": "料金",
            "v": "大人600円ほど（変動あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "○ 縁側から石庭を眺められる"
          },
          {
            "k": "おすすめ時間",
            "v": "午前〜昼"
          }
        ],
        "transit": "嵐電北野線「龍安寺」駅 徒歩約10分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "仁和寺",
        "cuisine": "寺院（世界遺産・門跡寺院）",
        "area": "京都市右京区・御室大内",
        "purpose": "御室の伽藍を巡る。国宝の金堂と御殿で王朝建築を味わう",
        "desc": "宇多天皇が平安時代に開いた真言宗御室派の総本山で、皇族が住職を務めた門跡寺院として格式高い伽藍を伝える。御所紫宸殿を移築した国宝の金堂、重要文化財の五重塔や御影堂が並び、寝殿造の流れをくむ御殿では襖絵や枯山水・池泉の庭を回廊から眺められるのがこの寺ならではの体験だ。境内には背が低く遅咲きで知られる「御室桜」の林もあり、京都の桜のしんがりを飾る。御殿拝観は大人800円ほど（変動あり）、桜まつり期間は特別入山料が別に必要になることがある。料金・公開内容は変わるため、訪問前に公式サイトでの確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Exterior_facade_of_Kannon_Hall_Buddhist_temple_with_Goshikimaku_Buddhist_flags_Ninna-ji_Kyoto_Japan.jpg/1280px-Exterior_facade_of_Kannon_Hall_Buddhist_temple_with_Goshikimaku_Buddhist_flags_Ninna-ji_Kyoto_Japan.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "嵐電北野線「御室仁和寺」駅 徒歩約3分"
          },
          {
            "k": "料金",
            "v": "御殿 大人800円ほど（変動あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "○ 御殿は屋内から庭を鑑賞できる"
          },
          {
            "k": "おすすめ時間",
            "v": "昼"
          }
        ],
        "transit": "嵐電北野線「御室仁和寺」駅 徒歩約3分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "北野天満宮",
        "cuisine": "神社",
        "area": "京都市上京区・馬喰町",
        "purpose": "夕方前に参拝。学問の神を祀る天神信仰の総本社へ",
        "desc": "菅原道真を祀り、全国に約1万2千社あるとされる天満宮・天神社の信仰の中心となる古社。桃山建築の流れをくむ豪壮な社殿と楼門が見どころで、受験生の合格祈願や撫でると利益があるという「神牛」の像でも親しまれている。道真ゆかりの梅が境内一帯に植えられ、早春には梅苑が公開されてこの社ならではの香りに包まれる。境内の参拝は無料で、梅苑など一部は別途入苑料が必要。きぬかけの路の三寺からは嵐電北野線で北野白梅町方面へ移動するとつなげやすい。開門時間や梅苑の公開期間は変わるため、訪問前に公式サイトでの確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Kitano-tenmangu_Kyoto_Japan41s3s4592.jpg/1280px-Kitano-tenmangu_Kyoto_Japan41s3s4592.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "嵐電北野線「北野白梅町」駅 徒歩約10分"
          },
          {
            "k": "料金",
            "v": "境内参拝無料（梅苑等は別料金・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外の参道を歩く"
          },
          {
            "k": "おすすめ時間",
            "v": "午後"
          }
        ],
        "transit": "嵐電北野線「北野白梅町」駅 徒歩約10分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "等持院",
        "cuisine": "寺院（庭園）",
        "area": "京都市北区・等持院北町",
        "purpose": "締めくくりに静かな庭を。足利将軍家の木像と向き合う",
        "desc": "足利尊氏が創建した足利将軍家の菩提寺で、霊光殿には歴代足利将軍の木像が並ぶ。観光客の波からやや外れた落ち着いた寺で、夢窓疎石の作と伝わる池泉回遊式の庭園を、書院の縁側に座って抹茶とともに眺められるのがこの寺ならではの過ごし方だ。心字池や芙蓉池を中心に、衣笠山を借景とした庭が広がり、一日の終わりに静けさを取り戻すのにふさわしい。歴代将軍の木像が一堂に会する空間は、京都でもここでしか見られない。拝観料は大人600円ほど（変動あり）、抹茶は別料金。拝観時間・料金は変わることがあるため、訪問前に公式サイトでの確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Toji-in_Temple_and_Ritsumeikan_Universityl_%28Ritsumeikan_University%2C_Kyoto%2C_Japan%29.JPG/1280px-Toji-in_Temple_and_Ritsumeikan_Universityl_%28Ritsumeikan_University%2C_Kyoto%2C_Japan%29.JPG"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "嵐電北野線「等持院・立命館大学衣笠キャンパス前」駅 徒歩約7分"
          },
          {
            "k": "料金",
            "v": "大人600円ほど（抹茶別・変動あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "○ 書院から庭を眺められる"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方（締めくくり）"
          }
        ],
        "transit": "嵐電北野線「等持院・立命館大学衣笠キャンパス前」駅 徒歩約7分"
      }
    ],
    "sideArticles": [
      {
        "t": "伏見稲荷さんぽ5選。千本鳥居から稲荷山を歩く",
        "h": "/feature/kansai-fushimi-inari-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Fushimi-Inari-Shrine-Senbon-Torii-2018-Luka-Peternel.jpg/1280px-Fushimi-Inari-Shrine-Senbon-Torii-2018-Luka-Peternel.jpg"
      },
      {
        "t": "河原町・先斗町デート5選。鴨川沿いの夜を歩く",
        "h": "/feature/kansai-kawaramachi-pontocho-date",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Wooden_and_bamboo_facades_of_dwellings_with_sudare_in_a_cobbled_street_of_Gion%2C_perspective_effect_with_vanishing_point%2C_Kyoto%2C_Japan.jpg/1280px-Wooden_and_bamboo_facades_of_dwellings_with_sudare_in_a_cobbled_street_of_Gion%2C_perspective_effect_with_vanishing_point%2C_Kyoto%2C_Japan.jpg"
      }
    ],
    "quote": "金色の舎利殿、十五の石の枯山水、御室の伽藍——歩いて続けて出会えるのが、きぬかけの路という名所だ。",
    "quoteCite": "マチノワ編集部",
    "closing": "一本道を歩く醍醐味は、寺ごとに空気が切り替わっていく落差にある。出発はやはり金閣寺。鏡湖池の水面に金色の舎利殿が映り込む朝の光景で気持ちを引き上げたら、きぬかけの路を西へ。次の龍安寺では一転して言葉が消える。縁側に腰を下ろし、十五の石と白砂だけの庭にしばらく向き合う時間は、歩いてきたからこそ深く沈み込める。さらに西へ進めば仁和寺の御室。国宝の金堂と御殿が広がる伽藍は王朝建築の風格そのもので、屋内に上がれば雨の日でも落ち着いて庭を眺められる懐の深さがある。ここから少し趣を変えて、嵐電北野線で北野天満宮へ。学問の神を祀る天神信仰の総本社で、楼門と社殿に参る。締めくくりは等持院。足利将軍家の木像が並ぶ堂と静かな庭が、賑わいから離れた余韻を残してくれる。坂道や歩道の狭い区間もあるので歩きやすい靴で、桜と紅葉の盛りは金閣寺・仁和寺が特に混み合うことも頭の片隅に。受付の締め切りは閉門より早めに設定されている寺が多いため、午後は時間に余白を持って動きたい。料金や特別公開の有無は変わることがあるので、当日の詳細は各寺の発信で押さえておくと迷いがない。一本の道が、世界遺産をひと続きの一日に変えてくれる。"
  },
  "kansai-kawaramachi-pontocho-date": {
    "id": "kansai-kawaramachi-pontocho-date",
    "no": "KS-13",
    "articleType": "guide",
    "kicker": "KAWARAMACHI PONTOCHO DATE",
    "title": "河原町から先斗町へ、鴨川を歩くデート。台所の市場から夜の花街まで",
    "titleHTML": "河原町から先斗町へ、鴨川を歩くデート。<br>台所の市場から夜の花街まで",
    "subtitle": "錦市場の喧騒を抜け、鴨川の河原に腰を下ろし、高瀬川沿いの木屋町から灯りの先斗町へ。最後は四条大橋を渡って祇園白川の石畳まで、水辺づたいに昼と夜を歩きつないでいく。",
    "lede": "錦市場のアーケードに足を踏み入れると、出汁の湯気と串ものの匂い、店先の呼び声が一気に押し寄せてくる。河原町を中心に、鴨川を挟んだ木屋町・先斗町、そして橋向こうの祇園白川まで、台所の市場と川辺の遊歩道と花街の細い路地が半径1kmほどのなかに折り重なっていて、昼に賑わう顔と夜に灯る顔がまるで別の街のように入れ替わる。この一帯を、地図の上の点と点ではなく、二人で歩いて地続きにたどってみたい——そう思って、東の寺町側から市場に入り、川へ下り、水を追いかけるように南へ、そして橋を渡って白川へと抜ける道のりをたどった。食べ歩きで小腹を満たし、川風で火照りを冷まし、灯りの路地で一日を締める。歩く速度でしか見えてこない京都の中心を、そのまま書き留めていく。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Wooden_and_bamboo_facades_of_dwellings_with_sudare_in_a_cobbled_street_of_Gion%2C_perspective_effect_with_vanishing_point%2C_Kyoto%2C_Japan.jpg/1280px-Wooden_and_bamboo_facades_of_dwellings_with_sudare_in_a_cobbled_street_of_Gion%2C_perspective_effect_with_vanishing_point%2C_Kyoto%2C_Japan.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "錦市場",
        "cuisine": "商店街・市場",
        "area": "京都市中京区・錦小路通",
        "purpose": "昼に食べ歩きで腹ごしらえ。東の寺町側から入って西へ抜ける",
        "desc": "寺町通から高倉通まで錦小路通に約400mにわたって続く、「京の台所」と呼ばれる商店街。鮮魚や京野菜、漬物、湯葉、だし巻き玉子など百数十軒の専門店が軒を連ね、料亭や旅館の仕入れを支えてきた歴史を持つ。アーケードに覆われているため天候に左右されにくく、串やひと口サイズで売る店が多いので、二人で少しずつ分け合いながら食べ歩くのに向く。多くの店が夕方には閉まるため、昼から夕方前の早い時間に組み込むのがこのコースの起点として理にかなっている。なお、食べ歩きは歩きながらではなく店先や各店の飲食スペースを利用するのがマナーとされる。営業時間や定休日は店ごとに異なるため、訪問前に各店の公式情報で確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Nishiki_Market%2C_Kyoto_-_Flickr_-_Sergiy_Galyonkin.jpg/1280px-Nishiki_Market%2C_Kyoto_-_Flickr_-_Sergiy_Galyonkin.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "阪急京都河原町駅・地下鉄四条駅 徒歩約4分"
          },
          {
            "k": "営業",
            "v": "多くの店が10:00〜18:00頃（店により異なる・要公式確認）"
          },
          {
            "k": "雨の日",
            "v": "◎ アーケードで濡れにくい"
          },
          {
            "k": "おすすめ時間",
            "v": "昼〜夕方前"
          }
        ],
        "transit": "阪急京都河原町駅 徒歩約4分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "鴨川（鴨川納涼床）",
        "cuisine": "川辺・遊歩道",
        "area": "京都市中京区・先斗町（鴨川西岸）",
        "purpose": "夕方前に河原へ下りる。川沿いを歩いて段に腰を下ろしひと息",
        "desc": "京都の街なかを南北に流れる鴨川は、三条大橋から四条大橋にかけての河川敷が散策の定番。水辺に下りられる遊歩道や階段状の護岸が整い、川面を渡る風を感じながら歩いたり、河原に並んで腰を下ろして休んだりできる。等間隔に座るカップルの光景は京都の夏の風物詩として知られる。初夏から秋にかけては西岸の料理店が川にせり出す「納涼床(川床)」を設け、川の上で食事を楽しめるのもこの一帯ならでは。床は例年5月から10月頃の季節限定で、この期間外は床が出ておらず利用できないため、訪れる時期に注意したい。利用には予約が要る店が多い。河原は屋外のため日没後は冷えるので一枚羽織るものがあると安心だ。床の営業期間や予約条件は変わることがあるため、利用前に各店の公式情報で確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Kamo_River_Kyoto.jpg/1280px-Kamo_River_Kyoto.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "阪急京都河原町駅・京阪祇園四条駅 徒歩約3分"
          },
          {
            "k": "料金",
            "v": "河原の散策は無料／納涼床は店により異なる（季節限定・要予約・要公式確認）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外。雨天時は散策・床とも控えめに"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方（日没前後）"
          }
        ],
        "transit": "阪急京都河原町駅 徒歩約3分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "木屋町通",
        "cuisine": "通り・川沿い散策路",
        "area": "京都市中京区・木屋町",
        "purpose": "高瀬川沿いに南北を散策。桜並木と水辺の灯りを楽しむ",
        "desc": "鴨川の一筋西、高瀬川に沿って南北に延びる通り。江戸時代に開かれた運河・高瀬川のせせらぎに沿って柳や桜が植えられ、川沿いに飲食店やバーが連なる。春は四条〜五条あたりの夜桜が見どころで、日が落ちると水面に灯りが映って情緒が増す。鴨川の開けた河原とは対照的に、細い水路と街並みが近い距離で寄り添う散策路で、河原町の喧騒からひと筋入っただけで雰囲気が変わるのがこの通りの面白さだ。先斗町とは目と鼻の先なので、夕食前の腹ごなしの散歩として無理なくつなげられる。店の営業時間は各店で異なるため、入店前に確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/%E9%AB%98%E7%80%AC%E5%B7%9D2583.JPG/1280px-%E9%AB%98%E7%80%AC%E5%B7%9D2583.JPG"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "阪急京都河原町駅 徒歩約5分"
          },
          {
            "k": "用途",
            "v": "川沿い散策・夜桜（春）・飲食"
          },
          {
            "k": "雨の日",
            "v": "○ 散策は傘が要るが屋内店も多い"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方〜夜"
          }
        ],
        "transit": "阪急京都河原町駅 徒歩約5分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "先斗町",
        "cuisine": "花街・路地",
        "area": "京都市中京区・先斗町",
        "purpose": "夜に路地へ。鴨川と高瀬川の間の石畳で夕食をとる",
        "desc": "鴨川と高瀬川に挟まれ、三条通の一筋南から四条通まで約500m南北に続く、京都を代表する花街のひとつ。車の入れない細い石畳の小路の両側に、お茶屋や京料理店、バーがびっしりと並ぶ。通りの東側には鴨川を望む座敷や、初夏から秋は納涼床を構える店もあり、川を眺めながらの夕食はこの路地ならではの体験だ。灯りがともる夜は昼間とまったく違う表情を見せ、二人でゆっくり歩くだけでも雰囲気がある。通りは狭く夜は混み合い、石畳に段差もあるため歩きやすい靴が安心。店ごとに予算や予約の要否、営業時間が大きく異なるので、夕食に使う店は事前に公式情報で確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Pontocho_by_Wolfiewolf_in_Nabeyacho%2C_Kyoto.jpg/1280px-Pontocho_by_Wolfiewolf_in_Nabeyacho%2C_Kyoto.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "京阪祇園四条駅・阪急京都河原町駅 徒歩約3〜5分"
          },
          {
            "k": "料金",
            "v": "散策は無料／飲食は店により異なる（要公式確認）"
          },
          {
            "k": "雨の日",
            "v": "○ 散策は傘要・屋内の飲食店が中心"
          },
          {
            "k": "おすすめ時間",
            "v": "夜（灯りがともる時間帯）"
          }
        ],
        "transit": "京阪祇園四条駅 徒歩約3分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "祇園白川・巽橋",
        "cuisine": "町並み・橋",
        "area": "京都市東山区・祇園（河原町からは四条大橋を渡った隣接エリア）",
        "purpose": "締めに白川沿いへ。石畳と小橋で京都らしい夜景を眺めて解散",
        "desc": "四条大橋を東へ渡った祇園の一角、白川の流れに沿って続く石畳の小道と、そこに架かる小さな石橋・巽橋の界隈。河原町・木屋町から見ると鴨川を越えた東山区側の隣接エリアにあたる。一帯は伝統的建造物群保存地区に選ばれ、格子と犬矢来の続く町家、白川のせせらぎ、柳と桜が織りなす京都らしい風景が凝縮されている。先斗町の華やかな路地とはまた違う、静かで落ち着いた夜の雰囲気が、一日の締めくくりにふさわしい。巽橋のたもとは記念の一枚を残す人も多い名所だが、生活と営業の場でもあるため、撮影や声量には配慮を。夜は街灯が控えめで足元が暗いので、川べりでは段差に注意したい。ライトアップの実施状況は時期により変わるため、事前に確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Wooden_and_bamboo_facades_of_dwellings_with_sudare_in_a_cobbled_street_of_Gion%2C_perspective_effect_with_vanishing_point%2C_Kyoto%2C_Japan.jpg/1280px-Wooden_and_bamboo_facades_of_dwellings_with_sudare_in_a_cobbled_street_of_Gion%2C_perspective_effect_with_vanishing_point%2C_Kyoto%2C_Japan.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "京阪祇園四条駅 徒歩約3分"
          },
          {
            "k": "料金",
            "v": "散策無料"
          },
          {
            "k": "雨の日",
            "v": "○ 石畳が濡れて滑りやすい点に注意"
          },
          {
            "k": "おすすめ時間",
            "v": "夜（締めの散策）"
          }
        ],
        "transit": "京阪祇園四条駅 徒歩約3分"
      }
    ],
    "sideArticles": [
      {
        "t": "伏見稲荷さんぽ5選。千本鳥居から稲荷山を歩く",
        "h": "/feature/kansai-fushimi-inari-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Fushimi-Inari-Shrine-Senbon-Torii-2018-Luka-Peternel.jpg/1280px-Fushimi-Inari-Shrine-Senbon-Torii-2018-Luka-Peternel.jpg"
      },
      {
        "t": "金閣寺・きぬかけの路 観光5選。北山の名刹を巡る",
        "h": "/feature/kansai-kinkakuji-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Water_reflection_of_Kinkaku-ji_Temple_a_sunny_day%2C_Kyoto%2C_Japan.jpg/1280px-Water_reflection_of_Kinkaku-ji_Temple_a_sunny_day%2C_Kyoto%2C_Japan.jpg"
      }
    ],
    "quote": "市場の湯気、鴨川の川風、高瀬川に映る灯り、そして白川の石畳。水辺をたどって昼から夜へと歩きつなぐ、京都の真ん中のデートさんぽ。",
    "quoteCite": "マチノワ編集部",
    "closing": "錦市場は東の寺町側から入るのがいい。狭い通りを西へ押されるように進めば、漬物や生麩、串の一本までつまみ食いで自然と腹がふくれていく。多くの店が夕方には早じまいするので、市場は明るいうちにくぐり抜けてしまうのが正解だ。四条河原町へ出たら鴨川の河川敷へ下りる。三条方面へ川沿いを歩き、等間隔に座るカップルの列に倣って河原の段に腰を下ろせば、市場の喧騒が川音にほどけていく。火照りが引いたら木屋町通へ。高瀬川の細い流れに沿って南北を行き来すると、水面に灯りが落ちはじめ、昼の街がゆっくり夜へ傾いていくのがわかる。日が暮れたら先斗町の路地へ入る。鴨川と高瀬川に挟まれた石畳に提灯が連なり、どこかの店で夕食を。通りは細く、夜は人で混み合い段差もあるから、足元はスニーカーのような歩きやすい靴が安心だ。締めは四条大橋を渡って祇園白川へ。巽橋のたもとで白川の流れと石畳を眺めれば、昼の市場から始まった一日が、ここでようやく夜の静けさに着地する。鴨川の河原は屋外で日が落ちると冷えるので一枚羽織るものを、そして鴨川納涼床(川床)を狙うなら例年初夏から秋の季節限定ゆえ営業の有無は出かける前に確かめておきたい。各店の料金や開いている時間も移ろいやすいので、行き先が決まったらその都度、公式の案内に目を通しておくと安心だ。"
  },
  "kansai-uji-walk": {
    "id": "kansai-uji-walk",
    "no": "KS-14",
    "articleType": "guide",
    "kicker": "UJI WALK",
    "title": "宇治、茶の香りを歩く。平等院から宇治川を渡る半日のさんぽ",
    "titleHTML": "宇治、茶の香りを歩く。<br>平等院から宇治川を渡る半日のさんぽ",
    "subtitle": "宇治橋通り商店街でひと息ついて、平等院、朝霧橋、宇治上神社、源氏物語ミュージアムへ。世界遺産ふたつを宇治川がつなぐ街を、橋を渡りながら歩く。",
    "lede": "JR宇治駅を出ると、空気にうっすら茶葉の匂いが混じっている。焙じる香りなのか、すれ違う店先の暖簾のせいなのか。それを追うように宇治橋通り商店街へ入れば、抹茶のソフトクリームやだんごを手にした人とよくすれ違う。立ち止まってひとつつまむのが、この街の歩き出しにちょうどいい。商店街を抜けて少し行けば平等院があり、その先には宇治川が流れている。京都の中心から奈良線でわずかな道のりなのに、川音と橋と寺社が一日のなかで何度も表情を入れ替えていく。西岸の華やいだ伽藍から橋を渡って東岸の静かな社へ、水の流れに沿って歩くのが宇治の楽しみだ。拝観料や開館時間はその時々で変わるので、出かける前に各施設の公式ページをのぞいておくと安心して回れる。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Byodoin_Phoenix_Hall_Uji_2009.jpg/1280px-Byodoin_Phoenix_Hall_Uji_2009.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "宇治橋通り商店街",
        "cuisine": "商店街",
        "area": "宇治市宇治・宇治橋通り",
        "purpose": "まず歩く。茶どころの空気の中で抹茶スイーツをつまむ",
        "desc": "JR宇治駅から平等院方面へまっすぐ延びる商店街で、お茶屋や飲食店など約70店舗が軒を連ねる。宇治橋のたもとから続くこの通りは茶問屋の歴史が色濃く、抹茶のソフトクリームやだんご、茶そばなど、宇治茶を使った甘味と軽食を歩きながら味わえるのが散策の入り口にちょうどいい。白壁に格子の茶商建築が点在し、店先に漂う焙じ茶の香りそのものが宇治らしさを伝えてくれる。立ち寄る店によって混雑や行列ができることがあるため、平等院の拝観時間から逆算して早めに切り上げたい。各店の営業時間や定休日は変動するため、目当ての店がある場合は公式サイトやSNSで事前に確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Byodoin_Omote-Sando_Street.jpg/1280px-Byodoin_Omote-Sando_Street.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR宇治駅 徒歩約3分／京阪宇治駅 徒歩約7分"
          },
          {
            "k": "料金",
            "v": "通り自体は無料（飲食は各店による）"
          },
          {
            "k": "雨の日",
            "v": "△ アーケードはなく屋外歩き中心"
          },
          {
            "k": "おすすめ時間",
            "v": "午前（散策の入り口に）"
          }
        ],
        "transit": "JR宇治駅 徒歩約3分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "平等院",
        "cuisine": "寺院（世界遺産）",
        "area": "宇治市宇治・蓮華",
        "purpose": "午前にじっくり。阿字池ごしに鳳凰堂を正面から眺める",
        "desc": "十円硬貨の意匠でも知られる鳳凰堂を中心とする、平安時代の浄土信仰を今に伝える世界遺産だ。阿字池の対岸から眺めると、左右に翼を広げたような中堂と尾廊が水面に映り込み、鳳凰が舞い降りた姿になぞらえられた建築美をひと目で実感できる。境内のミュージアム鳳翔館では、雲中供養菩薩像や旧鳳凰など堂内の宝物を間近に鑑賞でき、雨でも見ごたえがある。鳳凰堂の内部拝観は別料金・定員制で時間が区切られているため、希望する場合は入山後すぐに受付を済ませておきたい。庭園・鳳翔館は大人700円ほど、鳳凰堂内部は別途必要だが、拝観料や受付時間は変更されることがあるため公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Byodoin_Phoenix_Hall_Uji_2009.jpg/1280px-Byodoin_Phoenix_Hall_Uji_2009.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR宇治駅／京阪宇治駅 徒歩約10分"
          },
          {
            "k": "料金",
            "v": "庭園+鳳翔館 大人700円ほか（変動あり）／鳳凰堂内部は別途"
          },
          {
            "k": "雨の日",
            "v": "○ 鳳翔館は屋内で鑑賞可"
          },
          {
            "k": "おすすめ時間",
            "v": "午前（混雑前・順光で正面を撮れる）"
          }
        ],
        "transit": "JR宇治駅 徒歩約10分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "朝霧橋",
        "cuisine": "歩行者専用橋（宇治公園）",
        "area": "宇治市宇治塔川・宇治公園",
        "purpose": "昼すぎに渡る。朱塗りの橋から宇治川の上流を見渡す",
        "desc": "宇治川の中州に浮かぶ塔の島・橘島（中の島）と東岸の宇治上神社方面をつなぐ、朱塗りの歩行者専用橋だ。平等院のある西岸から東岸へ移動する自然な通り道になっており、橋の中ほどから上流を望むと、流れの速い宇治川と山並みが額縁のように広がる。たもとには宇治十帖の「宇治の恋物語」を題材にした石像が立ち、源氏物語の舞台としての宇治を歩いて感じられるのもこの場所ならではだ。中の島は桜やもみじが植えられた憩いの広場で、季節ごとに表情が変わる。屋外のため日差しや川風を受けやすく、増水時は通行が規制されることもあるので、足元と天候に注意して渡りたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Uji_bridge5.jpg/1280px-Uji_bridge5.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "京阪宇治駅 徒歩約7分／JR宇治駅 徒歩約10分"
          },
          {
            "k": "料金",
            "v": "無料"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外・増水時は通行規制の場合あり"
          },
          {
            "k": "おすすめ時間",
            "v": "昼すぎ（西岸から東岸への移動時に）"
          }
        ],
        "transit": "京阪宇治駅 徒歩約7分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "宇治上神社",
        "cuisine": "神社（世界遺産）",
        "area": "宇治市宇治山田",
        "purpose": "午後に参拝。日本最古とされる本殿で静けさに浸る",
        "desc": "宇治川の東岸、山裾の木立に抱かれて建つ世界遺産で、応神天皇・仁徳天皇・菟道稚郎子をまつる。国宝の本殿は平安時代後期の建立とされ、現存する神社建築としては国内最古級と伝わる、宇治さんぽの核となる一社だ。流造の三殿を一棟の覆屋で守る独特の構えや、これも国宝の拝殿の伸びやかな屋根は、華やかな平等院とは対照的な静かな格を漂わせる。境内には「桐原水」と呼ばれる湧水が今も残り、宇治七名水のうち現存する唯一のものとして知られる。境内の参拝は無料だが、参拝できる時間帯が決まっているため、夕方に回す場合は受付終了時刻を公式サイトで確認しておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/DSC21849%2C_Ujigami_Shrine%2C_Uji_City%2C_Japan.jpg/1280px-DSC21849%2C_Ujigami_Shrine%2C_Uji_City%2C_Japan.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "京阪宇治駅 徒歩約10分／JR宇治駅 徒歩約20分"
          },
          {
            "k": "料金",
            "v": "境内参拝は無料"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外参拝が中心"
          },
          {
            "k": "おすすめ時間",
            "v": "午後（朝霧橋を渡った流れで）"
          }
        ],
        "transit": "京阪宇治駅 徒歩約10分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "宇治市源氏物語ミュージアム",
        "cuisine": "博物館",
        "area": "宇治市宇治東内",
        "purpose": "仕上げに屋内で。宇治十帖の世界を映像と模型で辿る",
        "desc": "源氏物語の最後を飾る「宇治十帖」の舞台であることにちなんだ、宇治ならではのテーマ博物館だ。平安貴族の暮らしを伝える牛車や寝殿造の模型、物語の名場面を再現した展示、オリジナル映像などで、文字で読むだけでは掴みにくい王朝世界を立体的に体感できる。宇治上神社からほど近く、屋内でゆっくり過ごせるため、半日歩いた締めくくりや雨の日の時間調整に向く。開館は午前9時から午後5時ごろ（入館は閉館30分前まで）で、月曜（祝日の場合は翌日）が休館。入館料は600円ほどだが、料金・開館時間・展示内容は変更されることがあるため、訪問前に宇治市公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Genji_museum09s3s4380.jpg/1280px-Genji_museum09s3s4380.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "京阪宇治駅 徒歩約6分／JR宇治駅 徒歩約16分"
          },
          {
            "k": "料金",
            "v": "大人600円ほか（変動あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "◎ 全館屋内"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方（散策の締めくくりに）"
          }
        ],
        "transit": "京阪宇治駅 徒歩約6分"
      }
    ],
    "sideArticles": [
      {
        "t": "伏見稲荷さんぽ5選。千本鳥居から稲荷山を歩く",
        "h": "/feature/kansai-fushimi-inari-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Fushimi-Inari-Shrine-Senbon-Torii-2018-Luka-Peternel.jpg/1280px-Fushimi-Inari-Shrine-Senbon-Torii-2018-Luka-Peternel.jpg"
      },
      {
        "t": "金閣寺・きぬかけの路 観光5選。北山の名刹を巡る",
        "h": "/feature/kansai-kinkakuji-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Water_reflection_of_Kinkaku-ji_Temple_a_sunny_day%2C_Kyoto%2C_Japan.jpg/1280px-Water_reflection_of_Kinkaku-ji_Temple_a_sunny_day%2C_Kyoto%2C_Japan.jpg"
      }
    ],
    "quote": "茶の香りに誘われて橋を渡るうち、華やかな鳳凰堂と静かな古社が、一本の川でつながっていく。",
    "quoteCite": "マチノワ編集部",
    "closing": "商店街でつまんだ甘味の余韻が残るうちに、平等院の門をくぐる。阿字池の水面に鳳凰堂が映り込む正面の眺めは、写真で何度見ても実物の前ではしばらく動けなくなる。屋根の上で羽を広げる一対の鳳凰を見上げ、鳳翔館で当時の意匠を辿ってから門前へ戻る。そこから宇治川に下りて朝霧橋へ。朱塗りの欄干に手をかけて上流を見渡すと、川風がまっすぐ通り抜けて、さっきまでの伽藍の華やかさが嘘のように静かになる。橋を渡りきった対岸が、もう宇治上神社の参道だ。木立に囲まれた境内に入れば、日本最古とされる本殿が、観光地のざわめきから一歩引いたところで静まっている。手を合わせて振り返ると、来た道がもうずいぶん遠く感じられる。仕上げは源氏物語ミュージアムへ。屋内で宇治十帖の世界を映像と模型で辿りながら、歩いてきた橋や川がそのまま物語の舞台だったことに気づく。屋外の朝霧橋や中の島は日差しと川風を受けやすいので、雨や暑さの日は平等院鳳翔館とこのミュージアムでゆっくり時間を取るといい。ミュージアムは月曜が休みになることが多く（祝日なら翌日）、平等院鳳凰堂の内部は定員制で別途要予約ということもあるから、その日の開いている時間は公式で一度たしかめておくと歩く順番も組みやすい。世界遺産ふたつと一杯の茶を、川を渡りながらつないで歩いた半日。駅に戻る頃にはまた、どこからか焙じる香りが漂ってくる。"
  },
  "kansai-kitano-ijinkan-date": {
    "id": "kansai-kitano-ijinkan-date",
    "no": "KS-15",
    "articleType": "guide",
    "kicker": "KITANO IJINKAN DATE",
    "title": "北野異人館、坂を上って洋館をさんぽ。風見鶏から海の見える高台へ",
    "titleHTML": "北野異人館、坂を上って洋館をさんぽ。<br>風見鶏から海の見える高台へ",
    "subtitle": "三宮の喧騒を背に北野坂を上ると、国も時代も違う洋館が肩を寄せ合う高台に出る。風見鶏の館から萌黄の館、北野天満神社の石段、うろこの家を抜けて、坂下の異人館カフェで足を休めるまでを、二人で歩いた半日の記録。",
    "lede": "三宮駅を出て北を向くと、ビルの隙間の向こうに坂がせり上がっているのが見える。北野坂だ。人波をかき分けて緩い勾配を上っていくと、店の看板が少しずつ少なくなり、代わりに石畳の目地や、生け垣の緑、見上げる位置に立つ三角屋根が増えてくる。明治から大正にかけて各国の貿易商が住んだ「異人館」が、いまも坂沿いに点在するエリアだ。国も建てられた年も違う洋館が、半径500mほどの狭い高台に肩を寄せ合っている。汗ばむ頃に最初の館が現れる——その一段ずつ街が遠ざかっていく感覚が、北野を歩く楽しさの芯にある。デートで来るなら、急がず坂の勾配ごと味わってほしい。以下は、坂を上りきって高台を踏み、また下りてくるまでの順に歩いたときの覚え書きだ。なお各館の入館料や開館時間は折々に見直されるので、出かける前にそれぞれの公式サイトで一度たしかめておくと安心できる。",
    "date": "2026-06-13",
    "reading": "約8分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Weathercock_House_Kobe_Kitano_Ijinkan_%E9%A2%A8%E8%A6%8B%E9%B6%8F%E3%81%AE%E9%A4%A8%EF%BC%88%E6%97%A7%E3%83%88%E3%83%BC%E3%83%9E%E3%82%B9%E4%BD%8F%E5%AE%85%EF%BC%89.jpg/1280px-Weathercock_House_Kobe_Kitano_Ijinkan_%E9%A2%A8%E8%A6%8B%E9%B6%8F%E3%81%AE%E9%A4%A8%EF%BC%88%E6%97%A7%E3%83%88%E3%83%BC%E3%83%9E%E3%82%B9%E4%BD%8F%E5%AE%85%EF%BC%89.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "風見鶏の館（旧トーマス住宅）",
        "cuisine": "異人館（重要文化財）",
        "area": "神戸市中央区・北野町",
        "purpose": "坂を上ってまず入る。北野のシンボル、赤レンガの洋館",
        "desc": "北野坂を上りきった広場に立つ、北野を代表する洋館。明治42年（1909年）ごろにドイツ人貿易商ゴットフリート・トーマス氏の自邸として建てられ、設計はドイツ人建築家ゲオルク・デ・ラランデが手がけた。北野で唯一、外壁に赤レンガを積んだ重厚なつくりで、尖塔の上に立つ風見鶏がそのまま館の名と北野のシンボルになっている。館内は重厚な書斎や子ども部屋が当時の意匠のまま残り、ドイツの市民住宅の暮らしぶりを間近に見られる。広場は記念写真の定番で、ここを起点に二人で異人館巡りを始めるのに向く。入館料は隣の萌黄の館との2館券もあり、料金は改定されることがあるため、訪問前に公式サイトで最新の金額を確認したい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Weathercock_House_Kobe_Kitano_Ijinkan_%E9%A2%A8%E8%A6%8B%E9%B6%8F%E3%81%AE%E9%A4%A8%EF%BC%88%E6%97%A7%E3%83%88%E3%83%BC%E3%83%9E%E3%82%B9%E4%BD%8F%E5%AE%85%EF%BC%89.jpg/1280px-Weathercock_House_Kobe_Kitano_Ijinkan_%E9%A2%A8%E8%A6%8B%E9%B6%8F%E3%81%AE%E9%A4%A8%EF%BC%88%E6%97%A7%E3%83%88%E3%83%BC%E3%83%9E%E3%82%B9%E4%BD%8F%E5%AE%85%EF%BC%89.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "各線三宮駅 徒歩約15分／新神戸駅 徒歩約15分"
          },
          {
            "k": "料金",
            "v": "入館料あり・萌黄の館との2館券あり（変動あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "◎ 館内見学が主体"
          },
          {
            "k": "おすすめ時間",
            "v": "午後の早め（混雑前）"
          }
        ],
        "transit": "各線三宮駅 徒歩約15分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "萌黄の館",
        "cuisine": "異人館（重要文化財）",
        "area": "神戸市中央区・北野町",
        "purpose": "風見鶏の館のすぐ隣へ。淡い緑の洋館と街を見るサンルーム",
        "desc": "風見鶏の館のすぐ隣に立つ、淡い萌黄色（黄緑）の下見板に包まれた洋館。明治36年（1903年）にアメリカ総領事ハンター・シャープ氏の邸宅として建てられ、こちらも国の重要文化財に指定されている。見どころは2階のサンルームで、出窓から坂下の神戸の街並みを見渡せ、白を基調にした室内に外光が回る明るい空間が二人でゆっくり過ごすのに向く。赤レンガの風見鶏の館と並べて見ると、同じ北野でも国や時代で洋館の表情がこれだけ違うことがよく分かり、二館を続けて回る価値がある。入館料は単独券のほか風見鶏の館との2館券があり、開館時間や休館日とあわせて訪問前に公式サイトで確認しておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/b/b7/%E8%90%8C%E9%BB%84%E3%81%AE%E9%A4%A8_-_panoramio.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "各線三宮駅 徒歩約15分／新神戸駅 徒歩約15分"
          },
          {
            "k": "料金",
            "v": "入館料400円（変動あり・公式確認）"
          },
          {
            "k": "営業",
            "v": "9:30〜18:00（変動あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "◎ 館内見学が主体"
          }
        ],
        "transit": "各線三宮駅 徒歩約15分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "北野天満神社",
        "cuisine": "神社",
        "area": "神戸市中央区・北野町",
        "purpose": "風見鶏の館の真上へ。石段を上って高台から街と海を望む",
        "desc": "風見鶏の館の真上、石段を上りつめた高台に鎮座する神社。治承4年（1180年）、平清盛が福原に都を移した際、都の守り神として京都の北野天満宮から勧請したのが始まりと伝わり、学問の神・菅原道真公を祀る。北野の地名そのものの由来になった社でもある。参道の石段を上りきると、眼下に風見鶏の館の赤い屋根と尖塔、その先に神戸の市街が広がり、北野でも見晴らしのよい高台のひとつとして街と海を一望できる。境内は参拝自由で拝観料はかからず、坂の途中のひと息と展望、二人での参拝をまとめて済ませられるのが立ち寄る理由だ。開門時間が決まっているので、夕方に回る場合は閉門時刻を公式サイトで確認しておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Haiden_of_Kitano_Tenman_Shrine_in_Kitano-cho%2C_Kobe_01.jpg/1280px-Haiden_of_Kitano_Tenman_Shrine_in_Kitano-cho%2C_Kobe_01.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "各線三宮駅 徒歩約15分／新神戸駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "参拝自由・拝観料なし"
          },
          {
            "k": "雨の日",
            "v": "△ 石段・屋外の眺めが主体"
          },
          {
            "k": "おすすめ時間",
            "v": "高台の眺めが映える午後"
          }
        ],
        "transit": "各線三宮駅 徒歩約15分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "うろこの家＆展望ギャラリー",
        "cuisine": "異人館（登録有形文化財）",
        "area": "神戸市中央区・北野町",
        "purpose": "坂を少し下って入る。魚のうろこ模様の壁とヨーロッパ絵画",
        "desc": "外壁を覆う天然石スレートが魚のうろこのように見えることから名づけられた洋館で、神戸で最初に一般公開された異人館として知られ、国の登録有形文化財に指定されている。元は居留地に建てられ、後に北野へ移築されたという経緯を持つ。館内にはアンティーク家具やマイセンの磁器などが並び、西隣の展望ギャラリーにはユトリロやビュッフェ、トロワイヨンといったヨーロッパの近・現代絵画の名作が常設展示されている。建築・調度・絵画を一棟でまとめて味わえる密度が、ここに立ち寄る理由だ。前庭の猪の像「ポルチェリーノ」も写真の定番。入館料・開館時間は季節で変わるため、訪問前に公式サイトで確認したい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Uroko_house01s3200.jpg/1280px-Uroko_house01s3200.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "各線三宮駅 徒歩約15分（シティーループ「北野異人館」下車すぐ）"
          },
          {
            "k": "料金",
            "v": "大人1,000円（変動あり・公式確認）"
          },
          {
            "k": "営業",
            "v": "4〜9月 9:00〜18:00／10〜3月 9:00〜17:00（変動あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "◎ 館内・ギャラリー見学が主体"
          }
        ],
        "transit": "各線三宮駅 徒歩約15分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "スターバックス コーヒー 神戸北野異人館店（北野物語館）",
        "cuisine": "カフェ（登録有形文化財）",
        "area": "神戸市中央区・北野町",
        "purpose": "帰りの北野坂沿いで締める。洋館の中でひと休み",
        "desc": "北野坂を下る帰り道に立つ、洋館「北野物語館」を活用したカフェ。建物は明治40年（1907年）にアメリカ人M.J.シェー氏の住宅として建てられたコロニアル様式の木造2階建てで、国の登録有形文化財に指定されている。阪神・淡路大震災で被災したのち現在地に移築・再建され、2009年から地域の文化を伝える店舗として営業している。注文はいつものメニューでも、アンティーク調度の並ぶ洋館の一室に腰を下ろせるのがこの店ならでは。異人館巡りの締めに、坂歩きの疲れを取りながら洋館の余韻にひたれるのが立ち寄る理由だ。時間帯によっては混み合うので、ゆっくり過ごしたいなら時間に余裕をもって。営業時間は変わることがあるため、公式の店舗情報で確認したい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Kitano_Street_Kobe01s5s4110.jpg/1280px-Kitano_Street_Kobe01s5s4110.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "各線三宮駅 徒歩約10分（北野坂沿い）"
          },
          {
            "k": "料金",
            "v": "ドリンク代（メニューにより変動）"
          },
          {
            "k": "営業",
            "v": "8:00〜22:00（変動あり・公式確認）"
          },
          {
            "k": "用途",
            "v": "散策の締めのカフェ休憩"
          }
        ],
        "transit": "各線三宮駅 徒歩約10分"
      }
    ],
    "sideArticles": [
      {
        "t": "三宮・南京町 食べ歩き5選。中華街と商店街をめぐる",
        "h": "/feature/kansai-sannomiya-nankinmachi-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Kobe_Kobe_Chinatown_3.jpg/1280px-Kobe_Kobe_Chinatown_3.jpg"
      },
      {
        "t": "有馬温泉さんぽ5選。金の湯・銀の湯と湯本坂",
        "h": "/feature/kansai-arima-onsen-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Kin-no-yu_Arima_Onsen_2013.jpg/1280px-Kin-no-yu_Arima_Onsen_2013.jpg"
      }
    ],
    "quote": "一段上るごとに三宮の音が遠ざかり、振り返ると神戸の街と海が広がっている。北野は、坂を上る足の運びそのものが景色になる街だ。",
    "quoteCite": "マチノワ編集部",
    "closing": "坂を上りきって最初に迎えてくれるのは、赤レンガに尖塔をのせた風見鶏の館。北野のシンボルとして写真でさんざん見ていたはずなのに、実物を前にすると屋根の風見鶏の細さに足が止まる。煉瓦の重さと装飾の軽やかさが同居していて、室内に入ると窓のひとつひとつから坂下の街がのぞけた。隣へ数歩で萌黄の館。淡い緑の壁が陽を吸ってやわらかく、二階のサンルームに腰を落ち着けると、ガラス越しの光が床に格子模様を落としている。二館を見比べると、同じ「洋館」でも色も骨格もこんなに違うのかと、つい二人で言い合いたくなる。\n\n風見鶏の館の真上へ続く石段を上れば、北野天満神社。社殿の前に立つと視界がふっと開けて、洋館の屋根越しに神戸の街と海が遠くまで見えた。ここがこの散歩のいちばん高い場所で、上ってきた坂のごほうびのような眺めだ。参拝を済ませ、来た石段を少し下ってうろこの家＆展望ギャラリーへ。魚の鱗のような天然石を一面に貼った外壁は近づくほど質感が濃く、館内にはヨーロッパの絵画や調度が並んでいて、外の坂とはまた違う時間が流れている。じっくり見ていると、いつのまにか光が傾いて、白壁や赤レンガが午後の色に染まり始めていた。\n\n帰りは下りの北野坂を惰性にまかせて歩く。締めくくりは坂沿いの北野物語館——いまはスターバックス コーヒー 神戸北野異人館店として開いている洋館だ。木の階段や暖炉の残る室内でコーヒーを手にすると、上ってきた坂も、高台で見た海も、ひと続きの記憶として落ち着いてくる。坂と石段の多い街なので、歩きやすい靴で来たほうが一日を最後まで楽しめる。陽射しの強い時季は日陰の少ない坂でこまめに水を飲み、混みやすい休日は開館直後か夕方寄りに館をのぞくと落ち着いて回れた。雨の足音が混じる日は、眺めが主役の天満神社は短めに切り上げ、館内をゆっくり味わえるうろこの家やこの異人館カフェに長く居ると、それはそれで雨の北野らしい。写真を撮りながら、坂の勾配ごと神戸の異国情緒を歩く——そんな半日になった。"
  },
  "kansai-sannomiya-nankinmachi-walk": {
    "id": "kansai-sannomiya-nankinmachi-walk",
    "no": "KS-16",
    "articleType": "guide",
    "kicker": "SANNOMIYA NANKINMACHI",
    "title": "三宮から南京町、食べて歩く神戸さんぽ。商店街と中華街を抜けて",
    "titleHTML": "三宮から南京町、食べて歩く神戸さんぽ。<br>商店街と中華街を抜けて",
    "subtitle": "三宮センター街のアーケードから生田神社の杜へ、湯気の立つ南京町を経て元町商店街、東遊園地の芝生まで。神戸の真ん中を、匂いをたどって歩いた半日の記録。",
    "lede": "三宮の駅を出ると、まず耳に届くのはアーケードの天井に反響する人の声だ。神戸の中心は、ターミナルも繁華街も中華街も神社も公園も、ぜんぶ歩いて行ける距離に折り重なっている。東西に長く伸びた屋根付きの商店街がその背骨で、空模様を気にせず軒下をつないで進めるのがありがたい。坂もほとんどなく、足取りは自然と気楽になる。この道のいいところは、目的地を決めずに匂いと人の流れについていけば、勝手に次の場所へたどり着いてしまうことだ。豚まんの湯気、ごま油、線香、コーヒー。そういうものに引っぱられて、三宮から元町へ、半日かけてのんびり食べ歩いた。中華街は店ごとの会計が基本なので、現金と小銭をいくらか多めにポケットへ入れておくと、行列の前で慌てずにすむ。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Kobe_Kobe_Chinatown_3.jpg/1280px-Kobe_Kobe_Chinatown_3.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "神戸三宮センター街",
        "cuisine": "商店街",
        "area": "神戸市中央区・三宮町",
        "purpose": "昼前にスタート。アーケードを歩いて神戸の繁華街の空気をつかむ",
        "desc": "三宮駅の西側、フラワーロードから鯉川筋まで東西約600mにわたって伸びる、神戸を代表する大型アーケード商店街。高く広い屋根に覆われ、雨の日でも濡れずに歩けるのがこのコースの起点に向く理由だ。ファッションや雑貨、書店から飲食店までが密集し、休日には多くの人でにぎわう。ここではがっつり食べるより、軽くドリンクやスイーツをつまみながら街の雰囲気に体を慣らすのがちょうどよい。脇道に入ると個性的な小店も多く、寄り道の楽しみがある。営業時間は店舗ごとに異なるため、目当ての店がある場合は事前に公式情報で確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Kobe_20140430_165653.jpg/1280px-Kobe_20140430_165653.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR三ノ宮駅・各線三宮駅 徒歩約2分"
          },
          {
            "k": "用途",
            "v": "散策・買い物・軽食（入場無料）"
          },
          {
            "k": "雨の日",
            "v": "◎ アーケードで全天候"
          },
          {
            "k": "おすすめ時間",
            "v": "昼前（混む前）"
          }
        ],
        "transit": "各線三宮駅 徒歩約2分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "生田神社",
        "cuisine": "神社",
        "area": "神戸市中央区・下山手通",
        "purpose": "繁華街の中で一息。縁結びの古社に参拝してから中華街へ向かう",
        "desc": "「神戸」という地名の由来とも伝わる、約1800年の歴史をもつ古社。繁華街のすぐ北にありながら、境内の奥に源平合戦ゆかりの「生田の森」が広がり、都心とは思えない静けさに切り替わるのがこの場所ならではだ。主祭神の稚日女尊にちなみ縁結びの神様として親しまれ、参拝者が絶えない。三宮センター街からは北へ歩いてすぐで、食べ歩きの合間に立ち寄りやすい立地。境内の参拝は無料だが、特別拝観や祈祷などは別途料金がかかる場合がある。拝観時間はおおむね朝7時から日没までが目安。御朱印やお守りを授かるのもよい。授与の受付時間や行事日程、料金は変わることがあるため、訪問前に公式サイトで確認しておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Ikuta_jinja_kobe_15.jpg/1280px-Ikuta_jinja_kobe_15.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "各線三宮駅 徒歩約10分"
          },
          {
            "k": "料金",
            "v": "境内参拝無料（特別拝観・祈祷等は別。最新は公式確認）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外参道は傘が必要"
          },
          {
            "k": "おすすめ時間",
            "v": "正午前後"
          }
        ],
        "transit": "各線三宮駅 徒歩約10分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "南京町",
        "cuisine": "中華街",
        "area": "神戸市中央区・元町通〜栄町通",
        "purpose": "コースの主役。焼き小籠包や豚まんを買って広場で味わう",
        "desc": "横浜・長崎と並ぶ日本三大中華街のひとつで、元町通から栄町通にまたがる東西約270mの範囲に多くの中華の店が軒を連ねる。東の長安門、西の西安門、南の海栄門に囲まれ、中心に建つあずまや(南京町広場)が待ち合わせの目印だ。焼き小籠包や豚まん、角煮まんなど手で持てる軽食が豊富で、このコースの食べ歩きの中心になる。ただし南京町では歩きながら食べることを控える案内が出ており、買ったものはこの広場や各店の飲食スペースなど決められた場所で味わうのがマナー。会計は店ごとなので現金を用意しておくと回りやすい。人気の店は昼前から行列ができることがあるため、早めの時間帯が狙い目だ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Kobe_Kobe_Chinatown_3.jpg/1280px-Kobe_Kobe_Chinatown_3.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR・阪神元町駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "食べ歩き1人1,000〜2,000円目安（変動あり・各店で確認）"
          },
          {
            "k": "雨の日",
            "v": "○ 路地は屋根なしだが店内多数"
          },
          {
            "k": "おすすめ時間",
            "v": "開店直後の昼（行列回避）"
          }
        ],
        "transit": "JR・阪神元町駅 徒歩約5分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "神戸元町商店街",
        "cuisine": "商店街",
        "area": "神戸市中央区・元町通",
        "purpose": "中華街から西へ続けて。老舗の甘味とアーケードを楽しむ",
        "desc": "元町駅すぐの1番街から神戸駅寄りの6丁目まで、約1.2kmにわたって伸びる歴史ある商店街。明治の開港期から続く老舗が点在し、130年を超える歩みを重ねてきた。南京町の西側にそのまま接しているため、中華で小腹を満たしたあと自然に流れ込めるのがこの動線の強みだ。デンマークチーズケーキで知られる甘味の店など、食後のスイーツに向く一軒も多い。長いアーケードに覆われ雨でも歩けるので、天候が崩れた日の避難先としても頼りになる。店ごとに定休日や営業時間が異なるため、目当ての店があれば事前確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/7/7a/Motomachi_shopping_district.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR・阪神元町駅 徒歩約3分"
          },
          {
            "k": "用途",
            "v": "甘味・買い物・休憩（入場無料）"
          },
          {
            "k": "雨の日",
            "v": "◎ アーケードで全天候"
          },
          {
            "k": "おすすめ時間",
            "v": "午後の食後"
          }
        ],
        "transit": "JR・阪神元町駅 徒歩約3分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "東遊園地",
        "cuisine": "都市公園",
        "area": "神戸市中央区・加納町",
        "purpose": "締めは芝生でひと休み。歩き疲れた足を都心の公園で休める",
        "desc": "三宮の南側、フラワーロードに面した約2.7ヘクタールの都市公園。2023年のリニューアルで芝生広場が大きく広がり、カフェレストランを備えた拠点施設も加わって、都心にいながらピクニック気分で過ごせる場所に生まれ変わった。歩道からフラットに芝生へ入れる開放感があり、食べ歩きで歩き続けた一日の締めに腰を下ろして休むのにちょうどよいのが、ここを最後に置く理由だ。広場ではマルシェやイベントが開かれることもある。三宮駅からフラワーロードを南へ歩けばたどり着ける。屋外中心のため、雨天時は無理せず手前の商店街で締めるのも一案。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Higashi_Yuenchi_Park_from_Kobe_City_Hall.jpg/1280px-Higashi_Yuenchi_Park_from_Kobe_City_Hall.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "各線三宮駅 徒歩約10分"
          },
          {
            "k": "料金",
            "v": "入園無料"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外中心（施設内で回避可）"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方（締めの休憩）"
          }
        ],
        "transit": "各線三宮駅 徒歩約10分"
      }
    ],
    "sideArticles": [
      {
        "t": "北野異人館デート5選。坂の上の洋館街を歩く",
        "h": "/feature/kansai-kitano-ijinkan-date",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Weathercock_House_Kobe_Kitano_Ijinkan_%E9%A2%A8%E8%A6%8B%E9%B6%8F%E3%81%AE%E9%A4%A8%EF%BC%88%E6%97%A7%E3%83%88%E3%83%BC%E3%83%9E%E3%82%B9%E4%BD%8F%E5%AE%85%EF%BC%89.jpg/1280px-Weathercock_House_Kobe_Kitano_Ijinkan_%E9%A2%A8%E8%A6%8B%E9%B6%8F%E3%81%AE%E9%A4%A8%EF%BC%88%E6%97%A7%E3%83%88%E3%83%BC%E3%83%9E%E3%82%B9%E4%BD%8F%E5%AE%85%EF%BC%89.jpg"
      },
      {
        "t": "有馬温泉さんぽ5選。金の湯・銀の湯と湯本坂",
        "h": "/feature/kansai-arima-onsen-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Kin-no-yu_Arima_Onsen_2013.jpg/1280px-Kin-no-yu_Arima_Onsen_2013.jpg"
      }
    ],
    "quote": "三宮のアーケードから南京町、元町まで。匂いと人の流れに任せて歩く、神戸の真ん中の食べ歩きさんぽ。",
    "quoteCite": "マチノワ編集部",
    "closing": "歩き出しは神戸三宮センター街から。屋根の下を西へ流れていく人波に混ざって、神戸の繁華街の空気をまず体に入れる。ショーウィンドウを冷やかしているうちに、少し北へ気が向いて生田神社へ。繁華街のすぐ裏手とは思えない静けさで、縁結びの古社に手を合わせると、さっきまでの賑わいが嘘のように遠くなる。参拝を終えて南西へ下っていくと、赤い門と提灯が見えてくる。ここが今日の主役、南京町だ。焼き小籠包の鉄板がじゅうじゅう鳴り、豚まんの蒸籠から湯気が噴き上がる。買ったものは歩きながらではなく、中央の南京町広場のあずまやや各店の飲食スペースで味わうのがこの街の作法だから、湯気の立つ皿を手に空いた席を探すのも含めて楽しみたい。人気店は昼前から列が伸びるので、お腹が空いているなら開店すぐを狙うのが賢い。食べ足りた頃には、そのまま西へ続く元町商店街へ。老舗の甘味で口を甘くしながらアーケードを冷やかし歩き、最後はフラワーロード沿いの東遊園地へ抜けた。芝生に腰を下ろして、歩き疲れた足を都心のど真ん中で投げ出すと、食べてばかりだった半日がようやく落ち着く。雨に降られた日は、屋根のある三宮センター街・南京町・元町商店街の三つを軸にして、屋外の東遊園地は短く切り上げるか省き、アーケードのカフェで締めれば濡れずにすむ。中華街の各店も商店街の店も、定休日や営業時間はばらばらで料金も時期で動くから、気になる店があれば出かける前に公式の案内を一度のぞいておくと安心だ。"
  },
  "kansai-arima-onsen-walk": {
    "id": "kansai-arima-onsen-walk",
    "no": "KS-17",
    "articleType": "guide",
    "kicker": "ARIMA ONSEN WALK",
    "title": "有馬温泉、湯けむりの坂をひと歩き。金の湯から銀の湯へ",
    "titleHTML": "有馬温泉、湯けむりの坂をひと歩き。<br>金の湯から銀の湯へ",
    "subtitle": "赤い金泉と透明な銀泉、その間をつなぐ石畳の坂。神戸の山あいで、湯と街並みをまとめて歩いた半日の記録。",
    "lede": "六甲の北側へ回り込むと、空気がふっとやわらかくなる。神戸市北区の山あいに抱かれた有馬温泉は、日本三名泉のひとつに数えられる古い湯の街で、駅を出た瞬間からどこか湯のにおいが鼻先をかすめる気がした。鉄分で赤褐色に染まった「金泉」と、無色透明の「銀泉」。性格のまるで違う二つの湯がひとつの町に湧くというのが、ここの妙な贅沢さだ。石畳の坂に木造の宿と土産物店が肩を寄せ合い、湯けむりが路地の上をゆるく流れていく。今日は宿には泊まらず、足だけでこの町を端から端まで味わってみる。坂を上っては湯につかり、また歩く。金の湯で温まり、湯本坂を抜け、温泉寺で町の来し方に触れ、炭酸泉源公園で土から湧く水をひとくち、最後に銀の湯でさっぱりと締める——そんな順で歩いた半日を、見たまま書き留めておく。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Kin-no-yu_Arima_Onsen_2013.jpg/1280px-Kin-no-yu_Arima_Onsen_2013.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "有馬本温泉 金の湯",
        "cuisine": "日帰り温泉",
        "area": "神戸市北区・有馬町",
        "purpose": "まず入る。有馬名物・赤褐色の金泉で体を温める",
        "desc": "有馬温泉を代表する公営の外湯で、含鉄塩化物泉である「金泉」を気軽に楽しめる。空気に触れると鉄分が酸化して赤褐色に濁るのが金泉の特徴で、保温効果が高く、湯上がり後も体の芯がぽかぽかと続くと言われる。建物前には足湯と飲泉場が設けられ、入浴しない人でも雰囲気を味わえるのがこの場所ならではの楽しみ方だ。駅から温泉街へ入ってすぐの位置にあるため、有馬さんぽの起点にしやすい。料金は平日と土日祝で異なり、繁忙期には特定日料金が適用されることもある。営業時間・定休日・料金は変更される場合があるため、訪問前に公式サイトでの確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Kin-no-yu_Arima_Onsen_2013.jpg/1280px-Kin-no-yu_Arima_Onsen_2013.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "神戸電鉄 有馬温泉駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "大人 650〜800円程度（曜日・時期で変動、公式確認）"
          },
          {
            "k": "雨の日",
            "v": "◎ 屋内の温泉施設"
          },
          {
            "k": "おすすめ時間",
            "v": "午前（さんぽの起点に）"
          }
        ],
        "transit": "神戸電鉄 有馬温泉駅 徒歩約5分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "湯本坂",
        "cuisine": "商店街",
        "area": "神戸市北区・有馬町",
        "purpose": "ゆっくり上る。石畳と木造の街並みで食べ歩き",
        "desc": "金の湯のそばから温泉街の奥へと続く石畳のゆるやかな坂道で、有馬本街道とも呼ばれる温泉街のメインストリートだ。両側には木造の宿や土産物店、炭酸せんべいや佃煮の店が軒を連ね、レトロな赤いポストや古い建物が残る昔ながらの湯の街の風情を歩きながら味わえる。坂の途中から脇道に入ると寺社や泉源にも通じており、有馬の見どころを結ぶ背骨のような通りになっている。道幅が狭く上り坂のため、食べ歩きや街並み観賞をしながらマイペースに歩くのに向く。店ごとの営業時間や定休日は異なるため、目当ての店があれば事前に確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Arima_Onsen_Yumotozaka02s3872.jpg/1280px-Arima_Onsen_Yumotozaka02s3872.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "神戸電鉄 有馬温泉駅 徒歩約7分"
          },
          {
            "k": "用途",
            "v": "街歩き・食べ歩き・土産探し"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外の坂道（傘で散策可）"
          },
          {
            "k": "おすすめ時間",
            "v": "昼（昼食と街歩きを兼ねて）"
          }
        ],
        "transit": "神戸電鉄 有馬温泉駅 徒歩約7分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "温泉寺",
        "cuisine": "寺院",
        "area": "神戸市北区・有馬町",
        "purpose": "坂の上で一息。有馬開湯の歴史に触れる",
        "desc": "奈良時代の僧・行基が衰えていた有馬温泉を復興した際に開いたと伝わる古刹で、本尊は薬師如来。地元では「薬師さん」と呼ばれて親しまれてきた。湯本坂を上った高台にあり、有馬の温泉文化の起点として語られる場所だけに、湯めぐりの合間に立ち寄ると街の成り立ちが立体的に見えてくるのがこの寺ならではの味わいだ。隣接する念仏寺や善福寺とあわせて、寺社が集まる静かな一画を形成しており、温泉街の喧騒からひと息つける。境内は自由に参拝できることが多いが、堂内拝観や行事の有無、時間は時期によって異なるため、訪問前に確認しておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Onsenji_Kobe01s3200.jpg/1280px-Onsenji_Kobe01s3200.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "神戸電鉄 有馬温泉駅 徒歩約6分"
          },
          {
            "k": "拝観",
            "v": "境内参拝可（堂内拝観・時間は公式確認）"
          },
          {
            "k": "雨の日",
            "v": "○ 屋根のある堂と境内"
          },
          {
            "k": "おすすめ時間",
            "v": "昼過ぎ（坂歩きの休憩に）"
          }
        ],
        "transit": "神戸電鉄 有馬温泉駅 徒歩約6分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "炭酸泉源公園",
        "cuisine": "泉源・公園",
        "area": "神戸市北区・有馬町",
        "purpose": "立ち寄る。湧き出す天然炭酸水を味見する",
        "desc": "有馬名物・炭酸せんべいの原料にもなった天然の炭酸泉が湧き出す泉源を整備した小さな公園だ。社のような屋根の下に置かれた丸い石の中央から冷たい炭酸水がこんこんと湧き、かつては飲泉場として親しまれてきた。鉄分と炭酸を含むためほのかに金気のある独特の味わいで、炭酸せんべいがこの湯から生まれた背景を、味と湧出の様子から実感できるのがこの場所ならではの体験になっている。金の湯から坂を少し上った位置にあり、湯本坂や寺社めぐりと自然につながる。湧水の飲用可否や状態は時期により変わるため、現地の表示に従ってほしい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/%E7%82%AD%E9%85%B8%E6%B3%89%E6%BA%90%E5%85%AC%E5%9C%92_%E7%A5%9E%E6%88%B8%E5%B8%82%E5%8C%97%E5%8C%BA%E6%9C%89%E9%A6%AC%E7%94%BA_Dec_8%2C_2024.jpg/1280px-%E7%82%AD%E9%85%B8%E6%B3%89%E6%BA%90%E5%85%AC%E5%9C%92_%E7%A5%9E%E6%88%B8%E5%B8%82%E5%8C%97%E5%8C%BA%E6%9C%89%E9%A6%AC%E7%94%BA_Dec_8%2C_2024.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "神戸電鉄 有馬温泉駅 徒歩約15分"
          },
          {
            "k": "料金",
            "v": "見学自由（公園）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外の泉源(短時間向き)"
          },
          {
            "k": "おすすめ時間",
            "v": "昼〜午後（散策の途中で）"
          }
        ],
        "transit": "神戸電鉄 有馬温泉駅 徒歩約15分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "有馬温泉 銀の湯",
        "cuisine": "日帰り温泉",
        "area": "神戸市北区・有馬町",
        "purpose": "最後に入る。無色透明の銀泉でさっぱり締める",
        "desc": "金の湯と並ぶ有馬の公営外湯で、こちらは無色透明の「銀泉」を楽しめる。炭酸を含む泉とラジウムを含む泉を用いた湯は、赤褐色の金泉とは対照的にさらりとした入り心地で、坂歩きで火照った体を最後に整えるのに向く。同じ温泉街で性質のまったく異なる二つの湯を一日で味わえるのが有馬の醍醐味で、金の湯と銀の湯を両方巡ってこそその違いがはっきり分かるのがこの施設ならではの魅力だ。湯本坂の上手、寺社が集まる一画の近くにあり、さんぽの締めくくりに立ち寄りやすい。金の湯との二館共通入浴券が用意されることもある。営業時間・定休日・料金は変わる場合があるため公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/170811_Gin-no-yu_Arima_Onsen_Kobe_Japan01bs.jpg/1280px-170811_Gin-no-yu_Arima_Onsen_Kobe_Japan01bs.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "神戸電鉄 有馬温泉駅 徒歩約10分"
          },
          {
            "k": "料金",
            "v": "大人 550〜700円程度（曜日で変動、公式確認）"
          },
          {
            "k": "雨の日",
            "v": "◎ 屋内の温泉施設"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方（さんぽの締めに）"
          }
        ],
        "transit": "神戸電鉄 有馬温泉駅 徒歩約10分"
      }
    ],
    "sideArticles": [
      {
        "t": "北野異人館デート5選。坂の上の洋館街を歩く",
        "h": "/feature/kansai-kitano-ijinkan-date",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Weathercock_House_Kobe_Kitano_Ijinkan_%E9%A2%A8%E8%A6%8B%E9%B6%8F%E3%81%AE%E9%A4%A8%EF%BC%88%E6%97%A7%E3%83%88%E3%83%BC%E3%83%9E%E3%82%B9%E4%BD%8F%E5%AE%85%EF%BC%89.jpg/1280px-Weathercock_House_Kobe_Kitano_Ijinkan_%E9%A2%A8%E8%A6%8B%E9%B6%8F%E3%81%AE%E9%A4%A8%EF%BC%88%E6%97%A7%E3%83%88%E3%83%BC%E3%83%9E%E3%82%B9%E4%BD%8F%E5%AE%85%EF%BC%89.jpg"
      },
      {
        "t": "三宮・南京町 食べ歩き5選。中華街と商店街をめぐる",
        "h": "/feature/kansai-sannomiya-nankinmachi-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Kobe_Kobe_Chinatown_3.jpg/1280px-Kobe_Kobe_Chinatown_3.jpg"
      }
    ],
    "quote": "赤い金泉に温まって、石畳の坂をひと歩き。湯と町をまるごと味わう、有馬の半日さんぽ。",
    "quoteCite": "マチノワ編集部",
    "closing": "朝のうちにまず金の湯へ。有馬名物の赤い湯にゆっくり身を沈めると、芯から温まって、これから坂を上る足にも力が入る。湯あがりの体で湯本坂へ向かえば、石畳と木造の街並みが緩やかにせり上がっていき、湯気の立つ蒸し物や炭酸せんべいをつまみながら、寄り道ばかりで一向に前へ進まない。坂を上りきったあたりで温泉寺に立ち寄り、有馬の湯がどれほど古くから人を迎えてきたのかに静かに触れる。下る途中、炭酸泉源公園で湧き出す天然の炭酸水をひとくち味見すると、しゅわりと舌を刺す独特の感触に思わず笑ってしまった。歩き疲れた体を最後に銀の湯へ預け、無色透明の銀泉でさっぱり締めれば、金と銀、二つの名湯を一日で踏破した満足が残る。坂と階段の多い町だから、足元は履き慣れた靴がいい。週末や紅葉の季節は人出が多く、外湯に入場待ちが出ることもある。雨の日は外を急ぎ足にして、その分を金の湯・銀の湯のぬくもりや、湯本坂の軒下にゆずればいい。外湯の入浴料や各施設の休みは折々で変わるので、出かける前にそれぞれの公式情報をのぞいておくと安心だ。"
  },
  "kansai-nara-park-walk": {
    "id": "kansai-nara-park-walk",
    "no": "KS-18",
    "articleType": "guide",
    "kicker": "NARA PARK WALK",
    "title": "奈良公園、大仏と鹿のあいだを歩く。駅から東の山手へ半日のさんぽ",
    "titleHTML": "奈良公園、大仏と鹿のあいだを歩く。<br>駅から東の山手へ半日のさんぽ",
    "subtitle": "近鉄奈良駅を出てすぐ、興福寺の五重塔が目印になる。鹿の鳴き声と参道の砂利を踏む音を連れて、東大寺・春日大社・若草山へ。世界遺産と野生の鹿が同じ地続きにある、奈良の東側を歩く話。",
    "lede": "近鉄奈良駅の階段を上がると、人の流れがもう東を向いている。ゆるい坂の先に興福寺の五重塔が立っていて、それを目印に歩き出すと、芝生が現れたあたりで最初の鹿に出会う。柵もなければ案内係もいない。世界遺産の境内と野生の鹿が、同じ一枚の地面の上にただ並んでいる——それが奈良公園一帯のいちばん不思議なところだ。坂は急がず、見どころと見どころの距離も近い。だから地図を握りしめるより、塔から大仏へ、大仏から朱塗りの社へと、目に入った方角へ素直に足を運べばいい。駅側の興福寺から東の山手まで、標高をすこしずつ上げながら歩いていくこの道を、午前の光から夕方の眺めまで、順にたどってみる。拝観料や開いている時間は施設ごとに違い、季節でも動くので、出かける前にそれぞれの公式情報をのぞいておくと安心だ。",
    "date": "2026-06-13",
    "reading": "約8分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Todaiji08s3200.jpg/1280px-Todaiji08s3200.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "興福寺",
        "cuisine": "寺院",
        "area": "奈良市登大路町・奈良公園",
        "purpose": "午前のはじめに。駅から最も近い世界遺産で奈良に入る",
        "desc": "近鉄奈良駅から最も近い世界遺産で、奈良観光の入口にちょうどよい。境内には朱色の中金堂や室町期再建の東金堂（国宝）が建ち、国宝館では阿修羅像をはじめとする天平の名仏がまとめて拝める。シンボルの五重塔は現在、明治以来約120年ぶりの保存修理に入り全体を素屋根で覆っているため当面その姿は見られないが、その分だけ仏像群と伽藍の歴史を間近に味わえるのがいまの興福寺だ。中金堂・東金堂・国宝館は個別拝観のほか共通券もある。拝観料や開門時間は変わることがあるため、訪問前に公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/K%C5%8Dfuku-ji_HDSR_IMG_3374.jpg/1280px-K%C5%8Dfuku-ji_HDSR_IMG_3374.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "近鉄奈良駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "国宝館700円・中金堂500円・東金堂300円ほか（共通券あり・変動あり）"
          },
          {
            "k": "雨の日",
            "v": "○ 国宝館・各堂は屋内"
          },
          {
            "k": "おすすめ時間",
            "v": "午前（開門直後）"
          }
        ],
        "transit": "近鉄奈良駅 徒歩約5分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "奈良公園（鹿）",
        "cuisine": "公園",
        "area": "奈良市・奈良公園",
        "purpose": "移動しながら出会う。参道沿いで野生の鹿とふれあう",
        "desc": "興福寺から東大寺へ歩く間そのものが、このスポットだ。芝生の広がる園内には約1,000頭以上の鹿が暮らし、参道や売店のそばで鹿せんべいをねだってくる。ここの鹿は餌付けされたペットではなく国の天然記念物に指定された野生動物で、おじぎのような仕草を見せる一方、せんべいを焦らすと噛んだり頭を突いたりすることもある。袋や地図など紙類を口に入れさせない、急に驚かせない、という距離感が楽しむコツだ。園内にゴミ箱はなく、食べ物のゴミは鹿の誤食を防ぐため必ず持ち帰りたい。入園は無料で、東大寺へ向かう動線にそのまま重なる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Shika_senbei_2017.jpg/1280px-Shika_senbei_2017.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "近鉄奈良駅 徒歩約8分"
          },
          {
            "k": "料金",
            "v": "入園無料（鹿せんべいは別途）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外・鹿は雨天でもいる"
          },
          {
            "k": "おすすめ時間",
            "v": "移動の道中いつでも"
          }
        ],
        "transit": "近鉄奈良駅 徒歩約8分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "東大寺 大仏殿",
        "cuisine": "寺院",
        "area": "奈良市雑司町・奈良公園",
        "purpose": "昼の主役。南大門の仁王像を抜けて奈良の大仏に対面する",
        "desc": "奈良といえばここ、という旅の主役。参道入口の南大門には運慶・快慶らが手がけた高さ8mを超える金剛力士像が左右に立ち、門をくぐるだけなら無料で見上げられる。その奥の大仏殿（金堂）に、像高約15mの盧舎那仏、いわゆる奈良の大仏が座る。正面の幅約57m・棟までの高さ約49mという巨大な木造建築の堂内に入ると、見上げる角度そのものが他では得られない体験になる。柱の根元には大仏の鼻の穴と同じ大きさといわれる穴があり、家族連れが列をつくる名物だ。大仏殿は拝観料が必要で、開門時間は季節により変わる。最新の時間と料金は訪問前に公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Todaiji08s3200.jpg/1280px-Todaiji08s3200.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "バス「東大寺大仏殿・春日大社前」徒歩約5分"
          },
          {
            "k": "料金",
            "v": "大人800円（南大門は無料・変動あり）"
          },
          {
            "k": "雨の日",
            "v": "○ 大仏殿は屋内"
          },
          {
            "k": "おすすめ時間",
            "v": "昼前後"
          }
        ],
        "transit": "市内循環バス「東大寺大仏殿・春日大社前」徒歩約5分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "春日大社",
        "cuisine": "神社",
        "area": "奈良市春日野町・奈良公園",
        "purpose": "午後に参る。朱塗りの社殿と苔むす石灯籠の参道を歩く",
        "desc": "奈良公園の東奥、御蓋山のふもとに鎮座する全国の春日神社の総本社。朱塗りの社殿へ続く長い表参道には、奉納された石灯籠が苔をまといながら数千基並び、樹々の間を抜ける光と相まって独特の静けさをつくる。回廊に吊られた釣燈籠の連なりも美しく、東大寺の豪壮さとは対照的なきめ細やかな美が味わえるのがこの社の魅力だ。境内に入って参拝するだけなら自由で、御本殿を中門前から間近に拝む特別参拝は別途初穂料がかかる。東大寺からは公園内を南へたどれば徒歩圏。特別参拝の受付時間や初穂料は変わることがあるため、公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Kasuga_Taisha_Shrine_%40_Nara.jpg/1280px-Kasuga_Taisha_Shrine_%40_Nara.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "バス「春日大社本殿」下車すぐ"
          },
          {
            "k": "料金",
            "v": "参拝自由・御本殿特別参拝は別途初穂料（変動あり）"
          },
          {
            "k": "雨の日",
            "v": "△ 参道は屋外・回廊は雨宿り可"
          },
          {
            "k": "おすすめ時間",
            "v": "午後"
          }
        ],
        "transit": "バス「春日大社本殿」下車すぐ（東大寺から徒歩圏）"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "若草山",
        "cuisine": "山・展望地",
        "area": "奈良市雑司町・奈良公園",
        "purpose": "締めに上る。芝の斜面から奈良の街と公園を一望する",
        "desc": "奈良公園の東に芝生でなだらかに覆われた標高342mの山で、一日の締めくくりにふさわしい展望地だ。三つの笠を重ねたような三笠の形が特徴で、ふもとのゲートから入山して芝の斜面を上ると、東大寺大仏殿の大屋根や奈良市街、晴れた日には生駒の山並みまで一続きに見渡せる。山頂付近にも鹿が草を食む姿があり、街を眼下にした稜線歩きはここならではの景色になる。入山は有料で、開山期間（毎年3月第3土曜〜12月第2日曜）と9:00〜17:00という時間が決まっており、冬季や夜間は上れない。当日の開山状況・入山料は訪問前に公式情報で確認しておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/090124_wakakusa_yamayaki.jpg/1280px-090124_wakakusa_yamayaki.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "バス「春日大社本殿」徒歩約10分"
          },
          {
            "k": "料金",
            "v": "入山150円ほか（変動あり・公式確認）"
          },
          {
            "k": "営業",
            "v": "9:00〜17:00／開山3月第3土曜〜12月第2日曜（冬季閉山・公式確認）"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方（閉山前の時間に注意）"
          }
        ],
        "transit": "バス「春日大社本殿」徒歩約10分"
      }
    ],
    "sideArticles": [
      {
        "t": "ならまちさんぽ5選。格子の町家と古寺を歩く",
        "h": "/feature/kansai-naramachi-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/d/dc/Bakemono_Gagoze.jpg"
      },
      {
        "t": "難波・道頓堀 食べ歩き5選。グリコサインから法善寺横丁まで",
        "h": "/feature/kansai-namba-dotonbori-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Neon_sign_of_Dotonbori_daytime.JPG"
      }
    ],
    "quote": "大仏、鹿、朱塗りの社、街を見下ろす芝の山。奈良の半日は、駅から東へ歩くだけで揃ってしまう。",
    "quoteCite": "マチノワ編集部",
    "closing": "朝のうちに興福寺の境内へ入り、五重塔を見上げてから東へ向かう。参道では鹿がのんびり寝そべっていたり、まっすぐ近づいてきたりするが、鹿せんべい以外の食べ物や紙袋は口に入れさせず、急に驚かせないのが奈良での礼儀だ。東大寺では、南大門の金剛力士像に見下ろされながら門をくぐり、大仏殿で奈良の大仏に対面する。ここで昼をはさむのがちょうどいい。午後は春日大社へ。苔むした石灯籠が続く参道を抜けると、朱塗りの社殿が森の奥に現れる。締めくくりは若草山。芝の斜面を上りきると、歩いてきた公園と奈良の街並みがひと続きに見渡せて、半日の道のりがそのまま足元に広がっている。一点だけ、若草山は上れる季節と時間が決まっているので、雨や冬の夕方にあたりそうな日は、屋根のある東大寺ミュージアムや興福寺国宝館へ寄り道して、国宝の仏像とゆっくり向き合うのもいい。歩き終えてみると、塔と大仏と社と眺めが、ばらばらの観光地ではなく一本の道としてつながっていたことに気づく。それが、駅から東へ歩くだけの奈良の心地よさだと思う。"
  },
  "kansai-naramachi-walk": {
    "id": "kansai-naramachi-walk",
    "no": "KS-19",
    "articleType": "guide",
    "kicker": "NARAMACHI WALK",
    "title": "猿沢池からならまちを歩く。格子と古寺の路地さんぽ",
    "titleHTML": "猿沢池からならまちを歩く。<br>格子と古寺の路地さんぽ",
    "subtitle": "猿沢池の水面から元興寺の古瓦へ、そして格子の家・御霊神社・奈良町資料館へ。奈良公園のひと筋裏、生活の匂いが残る旧市街をゆっくりたどる一日の覚え書き。",
    "lede": "猿沢池のほとりに立つと、水面の向こうに興福寺の五重塔が逆さに揺れている。鹿の鳴き声も、土産物屋の呼び声も、池をひとつ隔てるだけで遠くなる。ならまちは、そういう境目のすぐ内側にある街だ。世界遺産・元興寺の旧境内を芯に、江戸の頃から続く格子戸の町家が細い路地に肩を寄せ合い、奥には古書店や小さなカフェの灯がともる。奈良公園の大伽藍を見上げたあとに、もう少しだけ静かな道を歩きたくなる——この記事は、そんな気分のままに池から街の奥へと足を運んだ半日の記録である。観光寺院の華やぎとはまた別の、暮らしの層を踏みしめる時間だと思ってもらえればいい。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/d/dc/Bakemono_Gagoze.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "猿沢池",
        "cuisine": "池・景観スポット",
        "area": "奈良市・登大路町／南都八景",
        "purpose": "午前に立つ。池越しに興福寺の五重塔をまず一望する",
        "desc": "興福寺の放生池として伝わる周囲約360mの池で、ならまち歩きの起点に向く。北側に石段の五十二段が伸び、その上に興福寺の五重塔がそびえるため、水面に塔と柳が映り込む眺めは「猿沢池の月」として南都八景に数えられてきた。岸辺をひと回りしても十数分ほどで、池のほとりから三条通や興福寺、そして南のならまちへと三方向に動けるのがこの場所ならではの利点だ。朝のうちは観光客もまばらで、塔を入れた写真を落ち着いて撮りやすい。入場は自由で料金もかからないため、集合と地図合わせの場所としても使いやすい。周辺の柳並木は季節で表情が変わる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/5/50/Five-storied_pagoda_of_the_Kofuku-Ji_Temple_and_the_Historic_Pond_called_Sarusaw-ike_%28NBY_7128%29.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "近鉄奈良駅 徒歩約8分／JR奈良駅 徒歩約15分"
          },
          {
            "k": "料金",
            "v": "散策自由・無料"
          },
          {
            "k": "雨の日",
            "v": "△ 屋根のない屋外"
          },
          {
            "k": "おすすめ時間",
            "v": "午前（光がやわらかい時間帯）"
          }
        ],
        "transit": "近鉄奈良駅 徒歩約8分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "元興寺",
        "cuisine": "寺院（世界遺産）",
        "area": "奈良市・中院町／ならまち",
        "purpose": "午前から正午に拝観。日本最古の瓦が葺かれた屋根を見上げる",
        "desc": "「古都奈良の文化財」として世界遺産に登録される寺院で、ならまちはこの元興寺のかつての広大な境内に町家が広がってできた一帯だ。見どころは国宝の極楽坊本堂と禅室で、僧坊を改造した堂の屋根の一部には、飛鳥・奈良時代の丸瓦と平瓦が今も葺かれている。丸瓦も平瓦も重ね合わせる「行基葺き」の古式が間近で見られ、現存する日本最古級の瓦として知られる点が、ほかの大寺とは違うこの寺ならではの魅力だ。境内には無数の石仏・石塔を集めた浮図田もあり、秋には萩が彩る。拝観時間は夕方前に受付を終えるため、午前から正午にかけて訪れると落ち着いて見て回れる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/d/dc/Bakemono_Gagoze.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "近鉄奈良駅 徒歩約15分／JR奈良駅 徒歩約20分"
          },
          {
            "k": "料金",
            "v": "大人500円程度（特別展期間は変動あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "○ 堂内拝観あり"
          },
          {
            "k": "おすすめ時間",
            "v": "午前〜正午（受付は夕方前に終了）"
          }
        ],
        "transit": "近鉄奈良駅 徒歩約15分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "ならまち格子の家",
        "cuisine": "町家（資料館）",
        "area": "奈良市・元興寺町／ならまち",
        "purpose": "午後に入る。奥へ細長い町家の造りを実際に歩いて体感する",
        "desc": "ならまちの伝統的な町家を再現した施設で、間口が狭く奥に細長い「うなぎの寝床」と呼ばれる造りを、実際に上がって歩きながら確かめられるのがここならではの体験だ。表からは見えない通り庭や中庭、明かり取りの工夫など、外観の格子だけでは分からない町家の機能性が内側から理解できる。ならまちでは外観が美しい町家は多いものの、内部にゆっくり上がれる場所は限られるため、街の建物群を見る前後にここを挟むと路地歩きの解像度が上がる。入館は無料で、月曜などの休館日がある。畳に座って中庭を眺めながら一息つける静かな場所でもある。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Koushinoie_nara1.jpg/960px-Koushinoie_nara1.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR京終駅 徒歩約10分／近鉄奈良駅 徒歩約20分"
          },
          {
            "k": "料金",
            "v": "入館無料"
          },
          {
            "k": "雨の日",
            "v": "◎ 屋内中心"
          },
          {
            "k": "おすすめ時間",
            "v": "午後（休館日は公式で確認）"
          }
        ],
        "transit": "JR京終駅 徒歩約10分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "御霊神社",
        "cuisine": "神社",
        "area": "奈良市・薬師堂町／ならまち",
        "purpose": "午後に参拝。狛犬の足止め祈願と縁結びにふれる",
        "desc": "ならまちで古くから「ごりょうさん」と親しまれる神社で、約1200年前に創建されたと伝わる。南門両脇の狛犬の足元には、家出人の足止まりや縁結び、商売繁盛を願って赤い紐を結ぶ「狛犬の足止め祈願」の風習があり、無数の紐が結ばれた光景はこの神社ならではのものだ。境内には縁結びで知られる末社・出世稲荷神社もあり、ならまちで最も親しまれる縁結びの社として参拝者を集めてきた。格子の町家が続く路地の途中に静かに鎮座し、街歩きの動線に自然に組み込みやすい。拝観は無料で、夕方には閉まるため日のあるうちに立ち寄りたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Goryou_jinnja_002.jpg/1280px-Goryou_jinnja_002.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "近鉄奈良駅 徒歩約15分／JR奈良駅 徒歩約20分"
          },
          {
            "k": "料金",
            "v": "参拝無料"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外の参拝中心"
          },
          {
            "k": "おすすめ時間",
            "v": "午後（夕方前に参拝）"
          }
        ],
        "transit": "近鉄奈良駅 徒歩約15分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "奈良町資料館",
        "cuisine": "私設資料館",
        "area": "奈良市・西新屋町／ならまち",
        "purpose": "夕方前に締める。軒先の身代わり申を眺めて街歩きを終える",
        "desc": "昭和60年に私設資料館として開かれた施設で、昔の看板や美術品、奈良町の民俗資料、仏像などを無料で公開している。軒先に吊るされる赤い「身代わり申」は、災いや病を代わりに引き受けてくれるという庚申信仰のお守りで、ならまちの町家の軒先で見かけるあの赤い申の由来をここでまとめて知れるのが、この資料館ならではの面白さだ。展示は気軽に見て回れる規模で、身代わり申などのお守りを授かることもできる。街歩きの締めに立ち寄れば、路地で見てきた軒先の風景の意味があとから腑に落ちる。開館時間が短めで休館日もあるため、午後の早めに合わせて訪れたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Naramachi-shiryokan_Nara02n3200.jpg/1280px-Naramachi-shiryokan_Nara02n3200.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "近鉄奈良駅 徒歩約15分／JR京終駅 徒歩約12分"
          },
          {
            "k": "料金",
            "v": "入館無料"
          },
          {
            "k": "雨の日",
            "v": "◎ 屋内展示"
          },
          {
            "k": "おすすめ時間",
            "v": "午後早め（開館時間が短め・公式確認）"
          }
        ],
        "transit": "近鉄奈良駅 徒歩約15分"
      }
    ],
    "sideArticles": [
      {
        "t": "奈良公園・東大寺 観光5選。大仏と鹿に会う半日",
        "h": "/feature/kansai-nara-park-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Todaiji08s3200.jpg/1280px-Todaiji08s3200.jpg"
      },
      {
        "t": "難波・道頓堀 食べ歩き5選。グリコサインから法善寺横丁まで",
        "h": "/feature/kansai-namba-dotonbori-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Neon_sign_of_Dotonbori_daytime.JPG"
      }
    ],
    "quote": "池の水面で塔が揺れる境目から路地へ一歩。鹿のにぎわいを背に、格子と古瓦の奈良をゆっくり踏みしめて歩く。",
    "quoteCite": "マチノワ編集部",
    "closing": "まずは猿沢池で塔の影をしばらく眺め、五十二段の喧騒を避けて南へ折れると、元興寺の門が待っている。極楽坊本堂と禅室の屋根を見上げれば、灰や茶のまだらに混じる古瓦——日本最古と伝わる瓦が、今も雨を受けている事実に少し背筋が伸びる。境内を出て路地を西へ進めば、ならまち格子の家。表は格子で締まり、内は奥へ奥へと細長く伸びる「うなぎの寝床」の造りを、土間を歩きながら身体で覚える。光と影の交互に少し目を慣らしてから、御霊神社へ。狛犬の足にひもを結ぶ足止め祈願と縁結びの言い伝えに手を合わせ、最後は奈良町資料館で軒先に揺れる赤い身代わり申を見上げて、街歩きをそっと閉じる。古寺から町家、神社、資料館へと、奈良の暮らしが薄く積もった層をひと筋ずつめくっていく道のりだった。路地は狭く一方通行も多いので、車より自分の足で測るほうがこの街には合っている。各施設とも夕の早い時間に門を閉じるから、池に着くのは午前の早めがちょうどいい。雨の日なら屋根の下——格子の家、資料館、元興寺の堂内——に長く腰を据え、御霊神社は短く参拝に切り替えれば、濡れずに余韻だけ持ち帰れる。なお拝観料や開館の時間、休館日はその時々で動くものなので、出かける前に各施設の公式の案内で一度たしかめておくと安心だ。"
  },
  "chubu-nagoya-station-walk": {
    "id": "chubu-nagoya-station-walk",
    "no": "CB-02",
    "articleType": "guide",
    "kicker": "NAGOYA STATION WALK",
    "title": "名駅から則武へ、ものづくりの記憶を歩く。展望台の風から赤レンガの庭へ",
    "titleHTML": "名駅から則武へ、ものづくりの記憶を歩く。<br>展望台の風から赤レンガの庭へ",
    "subtitle": "スカイプロムナードの風、スカイストリートのガラス越しの線路、衣装替えするナナちゃん人形、ノリタケの森の赤レンガ、トヨタ産業技術記念館の動く機械。名駅から西へ、街がさかのぼっていく。",
    "lede": "エレベーターの扉が開くと、まず風が来る。ミッドランドスクエアの屋上、スカイプロムナードは地上220mの屋外デッキで、囲うものが少ないぶん名古屋の空気がそのまま頬を撫でる。眼下では、名古屋駅の上に立つ200m級のビルが肩を並べ、その足元から放射状に道が伸びていく。ここから見下ろすと、名駅という街がガラスと鉄の塊に見える。けれど不思議なもので、この駅の西から北へ歩いていくと、塊の表面がだんだん剥がれて、窯業や繊維、自動車といった、この土地が手を動かして育ててきたものの輪郭が現れてくる。高い場所から眺める現在の名駅と、地面に降りてたどる名駅の来歴。同じ街の二つの顔を、半日かけて風上から風下へ歩くように見ていく。各施設の料金や開いている時間は折にふれて変わるので、出かける前に公式の案内へ目を通しておくと安心だ。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Midland-Square-and-Nagoya-Building-1.jpg/1280px-Midland-Square-and-Nagoya-Building-1.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "ミッドランドスクエア 屋外展望台 スカイプロムナード",
        "cuisine": "展望台",
        "area": "名古屋市中村区・名駅",
        "purpose": "まず昼に上る。地上220mの屋外デッキから名古屋を360度見渡す",
        "desc": "トヨタグループ本社も入るミッドランドスクエアのオフィス棟、その44〜46階に設けられた屋外型の展望台で、入場は42階から。地上約220mは名駅エリアの展望スポットでも高い部類に入り、屋根のない通路状のデッキを歩きながら、足元の駅ビル群から遠くの山並みまでを遮るものなく360度見渡せる。屋外ならではの風の感覚と、向かいのJRセントラルタワーズを真横に見るアングルがここの持ち味だ。入場料は平日と土日祝で異なることがあるため、訪問前に公式サイトで最新の料金と営業時間を確認しておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Midland-Square-and-Nagoya-Building-1.jpg/1280px-Midland-Square-and-Nagoya-Building-1.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "各線名古屋駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "有料・平日土日祝で異なる（公式確認）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外デッキのため天候の影響あり"
          },
          {
            "k": "おすすめ時間",
            "v": "昼〜夕方"
          }
        ],
        "transit": "名古屋駅 徒歩約5分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "JRセントラルタワーズ 15階 スカイストリート",
        "cuisine": "展望フロア",
        "area": "名古屋市中村区・名駅",
        "purpose": "ビルを移って無料で眺める。ガラス越しに駅前と鉄道を見下ろす",
        "desc": "名古屋駅の真上にそびえるJRセントラルタワーズの15階、地上約70mに広がる無料の展望フロアで、壁一面がガラス張りになっている。鉄道の街・名古屋らしく、眼下には名古屋駅へ出入りする線路や列車の動きを上から見下ろせるのが、ここならではの眺めだ。ベンチなどはなく長居には向かないが、入場無料で気軽に立ち寄れるため、有料展望台のあとに駅構造を別の角度から眺める二つ目の展望スポットとして組み込みやすい。開放時間が変わることもあるため、立ち寄る前に公式情報で確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Nagoya_Station_JR_Central_Towers_and_JR_Gate_Tower.jpg/1280px-Nagoya_Station_JR_Central_Towers_and_JR_Gate_Tower.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "各線名古屋駅 直結"
          },
          {
            "k": "料金",
            "v": "無料"
          },
          {
            "k": "雨の日",
            "v": "◎ 屋内のガラス張り展望フロア"
          },
          {
            "k": "おすすめ時間",
            "v": "昼または夕方"
          }
        ],
        "transit": "名古屋駅 直結"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "ナナちゃん人形",
        "cuisine": "ランドマーク",
        "area": "名古屋市中村区・名駅",
        "purpose": "駅の西側へ。季節ごとに衣装が変わる待ち合わせの目印を見る",
        "desc": "名古屋駅の太閤通口側、長くこの街の待ち合わせの目印として親しまれてきた高さ6mあまりの巨大マネキン人形だ。季節やイベントごとに大きな衣装が着せ替えられるのが特徴で、訪れるたびに装いが違う。足元にあった名鉄百貨店本店は2026年2月末で営業を終えたが、ナナちゃん人形自体は現在地に残ることが発表されており、運営は名古屋鉄道へ引き継がれ、周辺の通りと合わせて引き続き名駅のアイコンであり続ける。展望台から西の産業エリアへ歩く途中の、ちょうどよい中継点になる。衣装やイベントは時期で変わるため、最新情報は公式の告知で確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/%E3%83%8A%E3%83%8A%E3%81%A1%E3%82%83%E3%82%93%E4%BA%BA%E5%BD%A2_%E5%90%8D%E9%89%84WAO_20250201_1831-2.jpg/1280px-%E3%83%8A%E3%83%8A%E3%81%A1%E3%82%83%E3%82%93%E4%BA%BA%E5%BD%A2_%E5%90%8D%E9%89%84WAO_20250201_1831-2.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "各線名古屋駅 徒歩約2分"
          },
          {
            "k": "用途",
            "v": "屋外のランドマーク・待ち合わせ目印"
          },
          {
            "k": "料金",
            "v": "無料（見学のみ）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外・地下街経由で雨を避けやすい"
          }
        ],
        "transit": "名古屋駅 徒歩約2分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "ノリタケの森",
        "cuisine": "産業文化施設",
        "area": "名古屋市西区・則武新町",
        "purpose": "赤レンガの庭を歩く。陶磁器の街の原点で器づくりに触れる",
        "desc": "世界的な洋食器メーカーであるノリタケの旧工場跡地を整備した文化施設で、明治期に建てられた赤レンガの建物と緑の庭園が一体になっている。名古屋がかつて陶磁器の輸出で栄えた窯業の街だったことを今に伝える場所で、園内のミュージアムでは創業期の貴重なオールドノリタケの作品を見られ、クラフトセンターでは絵付けや生地づくりの工程を間近に見学できる。園内の散策は無料で、ミュージアムなど一部が有料という構成のため、時間に応じて入る範囲を選びやすい。月曜休館で受付終了も早めのため、午後の早い時間に訪れるのがよい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/AEON_MALL_Nagoya_Noritake_Garden_-_2.jpg/1280px-AEON_MALL_Nagoya_Noritake_Garden_-_2.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄東山線 亀島駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "入園無料・ミュージアム等は有料（公式確認）"
          },
          {
            "k": "雨の日",
            "v": "○ 屋内施設中心に回れば対応可"
          },
          {
            "k": "営業",
            "v": "月曜休館・夕方受付終了（公式確認）"
          }
        ],
        "transit": "地下鉄亀島駅 徒歩約5分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "トヨタ産業技術記念館",
        "cuisine": "産業技術博物館",
        "area": "名古屋市西区・則武新町",
        "purpose": "最後に動く機械を見る。繊維機械から自動車までを実演で追う",
        "desc": "トヨタグループ発祥の地である旧豊田紡織工場の建物を活かした博物館で、ノリタケの森に隣接して建つ。創業者・豊田佐吉が手がけた繊維機械から、のちの自動車づくりへと至る技術の流れを、パネルではなく本物の機械の動態展示とスタッフの実演で見せるのが最大の特色だ。糸を紡ぐ織機が実際に動き、自動車館では金属の加工工程まで体感できるため、子どもから大人まで「ものづくりの名古屋」を体で理解できる。全館屋内で雨の日にも強く、解散前にじっくり時間を取りたい。入館料や開館時間、休館日は変わることがあるため公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Toyota_tecno_museum.jpg/1280px-Toyota_tecno_museum.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "名鉄名古屋本線 栄生駅 徒歩約3分"
          },
          {
            "k": "料金",
            "v": "有料（公式確認）"
          },
          {
            "k": "雨の日",
            "v": "◎ 全館屋内"
          },
          {
            "k": "営業",
            "v": "月曜休館・入館は夕方まで（公式確認）"
          }
        ],
        "transit": "名鉄栄生駅 徒歩約3分"
      }
    ],
    "sideArticles": [
      {
        "t": "熱田神宮 観光5選。杜と庭園をめぐる名古屋南部",
        "h": "/feature/chubu-atsuta-jingu-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Atsuta_Shrine.jpg/1280px-Atsuta_Shrine.jpg"
      },
      {
        "t": "名古屋港 子連れ5選。水族館と港で一日遊ぶ",
        "h": "/feature/chubu-nagoya-port-family",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Port_of_Nagoya_Public_Aquarium.jpg/1280px-Port_of_Nagoya_Public_Aquarium.jpg"
      }
    ],
    "quote": "高層ビルの足元から、窯業と自動車のものづくりへ。風の吹くデッキから赤レンガの庭まで、名駅の二つの顔を地続きに歩く。",
    "quoteCite": "マチノワ編集部",
    "closing": "屋上の風で頬を冷やしたら、エレベーターで一気に降りて、向かいのJRセントラルタワーズへ移る。15階のスカイストリートは無料で、ガラスの内側からさっきまでいた高さを今度は別のビルの目線で眺めることになる。眼下を線路が幾筋も束ねて駅へ吸い込まれていくのを見ていると、名駅がまず鉄道の街であることが腑に落ちる。そこから太閤通口へ抜けると、待ち合わせの人だかりの真ん中にナナちゃん人形が立っている。季節ごとに衣装が変わるので、何を着ているかはその日のお楽しみ。ここまでが「現在の名駅」で、人形に背を向けて則武新町の方へ歩き出すと、街が少しずつ時間をさかのぼり始める。やがて現れるノリタケの森は、赤レンガの建物と緑の庭が広がる一画で、足を踏み入れるとビルの硬さが嘘のようにほどける。ここは陶磁器づくりの原点で、土から器が生まれる場所の空気を、庭を歩きながら吸い込める。隣接するトヨタ産業技術記念館へ移ると、締めくくりは静から動へ。繊維機械が糸を紡ぎ、その技術が自動車へと姿を変えていく実演を、機械が現に動く音とともに追える。高い場所の眺めから手仕事の記憶へ、西へ歩くほど時間が巻き戻っていくのがこの道筋のおもしろさだ。ノリタケの森とトヨタ産業技術記念館は曜日によって閉まっていることがあり、夕方には受付が締まるので、後半を楽しみにするなら午後の早い時間に着いておきたい。雨なら屋外のデッキは無理をせず、屋内のスカイストリートと、ほぼ館内で過ごせる記念館に時間を寄せれば、傘をたたんだまま街の記憶をたどれる。開館の有無や受付時間はそのつど変わりうるから、最後にもう一度だけ公式の最新情報を確かめてから出かけてほしい。"
  },
  "chubu-atsuta-jingu-walk": {
    "id": "chubu-atsuta-jingu-walk",
    "no": "CB-03",
    "articleType": "course",
    "kicker": "ATSUTA JINGU",
    "title": "熱田神宮から水辺へ、半日の参詣コース。杜・古墳・庭園をつないで宮の渡しまで",
    "titleHTML": "熱田神宮から水辺へ、半日の参詣コース。<br>杜・古墳・庭園をつないで宮の渡しまで",
    "subtitle": "草薙神剣を祀る熱田の杜を起点に、剣の宝庫・断夫山古墳・白鳥庭園を経て旧東海道の渡し場跡へ。名古屋南部の信仰と水辺を一筆書きで結ぶ午前発・夕方着の参詣コース。",
    "lede": "名古屋駅から南へ電車でわずか十数分。名鉄神宮前駅や地下鉄伝馬町駅のまわりに広がる熱田は、ビル街の名古屋とは時間の流れが違う。中心にあるのは、三種の神器のひとつ草薙神剣を祀る熱田神宮の深い杜。そしてその外側に、東海地方最大の前方後円墳、池泉回遊式の庭園、旧東海道の七里の渡し跡が、半径1km強の徒歩圏にぐるりと収まっている。古代から近世までの名古屋が、歩いて行き来できる距離に折り重なっている街だ。このコースは、その地層を一日で縦に降りていく順番で組んだ。まず杜の静けさに身を置き、神剣の宝物に古代の信仰を見て、そこから古墳・庭園の緑をたどり、最後は堀川沿いの水辺で旅を解く。屋外を歩く区間が長いので、足元は歩き慣れた靴で。各施設の拝観時間や休館日、料金は変わることがあるので、出かける前に公式サイトでひと目だけ確かめておくと安心して回れる。",
    "date": "2026-06-13",
    "reading": "約8分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Atsuta_Shrine.jpg/1280px-Atsuta_Shrine.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "熱田神宮",
        "cuisine": "神社",
        "area": "名古屋市熱田区・神宮",
        "purpose": "午前に参拝。本宮から大楠・こころの小径まで杜を歩く",
        "desc": "三種の神器のひとつ草薙神剣を御霊代として祀り、伊勢の神宮に次ぐお宮として古来あつく崇敬されてきた、熱田の街の核となる神社。鬱蒼とした杜に包まれた本宮へ向かう参道沿いには、樹齢千年とも伝わる大楠や、桶狭間の戦いに勝った織田信長が奉納したと伝わる信長塀が残り、名古屋の古い歴史を足元から感じられる。本宮左手から延びる「こころの小径」は、二〇一二年まで立ち入りが禁じられていた神聖な区域で、現在も入場時間が限られ撮影・飲食は不可。境内は二十四時間開いているが、お守りの授与やこころの小径には時間帯があるため、訪問前に公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Atsuta_Shrine.jpg/1280px-Atsuta_Shrine.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "名鉄神宮前駅 徒歩約3分／地下鉄伝馬町駅 徒歩約5分"
          },
          {
            "k": "拝観料",
            "v": "境内参拝は無料"
          },
          {
            "k": "雨の日",
            "v": "△ 参道は屋外。傘が必要"
          },
          {
            "k": "おすすめ時間",
            "v": "午前（こころの小径は9〜16時）"
          }
        ],
        "transit": "名鉄神宮前駅 徒歩約3分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "熱田神宮宝物館／剣の宝庫 草薙館",
        "cuisine": "博物館",
        "area": "名古屋市熱田区・神宮",
        "purpose": "参拝後に入る。神剣にまつわる宝物と刀剣を間近で見る",
        "desc": "本宮への参道脇にある、熱田神宮ゆかりの宝物を収める施設。宝物館には皇室や将軍家、藩主らから奉納された刀剣・古文書・絵画など約六千点が収蔵され、国宝や重要文化財も含まれる。隣接する「剣の宝庫 草薙館」は、神剣を祀る社にふさわしく刀剣に特化した展示館で、実物の日本刀を間近に見られるほか、伝説の太刀を当時の長さ・重さで再現した模造刀を実際に持ち上げ、その重みを体感できるコーナーがあるのが特徴。屋内なので雨天や夏の暑さの避難先にもなる。拝観料・休館日（毎月最終水曜とその翌日など）は変更されることがあるため、公式サイトでの確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Bunka-Den_%28Treasure_Exhibition_Hall%29_in_Atsuta_Shrine_-_3.jpg/1280px-Bunka-Den_%28Treasure_Exhibition_Hall%29_in_Atsuta_Shrine_-_3.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄熱田神宮伝馬町駅・熱田神宮西駅 徒歩約7分"
          },
          {
            "k": "拝観料",
            "v": "宝物館・草薙館とも大人500円ほか（変動あり）"
          },
          {
            "k": "雨の日",
            "v": "◎ 屋内展示で天候不問"
          },
          {
            "k": "営業",
            "v": "9:00〜16:30（入館16:10／最終水曜とその翌日休ほか）"
          }
        ],
        "transit": "地下鉄熱田神宮伝馬町駅 徒歩約7分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "断夫山古墳",
        "cuisine": "古墳",
        "area": "名古屋市熱田区・旗屋",
        "purpose": "昼に立ち寄る。東海地方最大の前方後円墳の墳丘を仰ぐ",
        "desc": "熱田神宮の南、熱田神宮公園の一角にこんもりと横たわる、全長約一五一メートルの前方後円墳。東海地方では最大級の規模を誇り、国の史跡に指定されている。六世紀ごろの築造とされ、この地方に大きな勢力を持った首長の墓と考えられている。墳丘は木立に覆われ、外周をぐるりと歩きながら前方部と後円部のふくらみを目で追えるのが、図面ではわからないこの古墳ならではの体験だ。公園として無料で開放され、神宮の参拝と庭園散策のあいだに古代の名古屋へ立ち寄れる。墳丘内部への立ち入りには別途許可が必要なため、通常は外周からの見学となる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Danpusan_Kofun-4.jpg/1280px-Danpusan_Kofun-4.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄西高蔵駅 徒歩約6分／熱田神宮西駅 徒歩約8分"
          },
          {
            "k": "料金",
            "v": "無料（公園内）"
          },
          {
            "k": "雨の日",
            "v": "✕ 屋外の墳丘めぐりが中心"
          },
          {
            "k": "用途",
            "v": "古代史の散策・写真"
          }
        ],
        "transit": "地下鉄熱田神宮西駅 徒歩約8分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "白鳥庭園",
        "cuisine": "日本庭園",
        "area": "名古屋市熱田区・熱田西町",
        "purpose": "午後に歩く。池泉回遊式の庭で水と緑の景色を楽しむ",
        "desc": "中部地方の地形を象徴的に写した造りで知られる、名古屋市内では規模の大きい池泉回遊式の日本庭園。木曽の山あいから伊勢湾へ注ぐ水の流れを庭全体で表現し、御嶽山に見立てた築山から流れ落ちる水が池へ至るまでを、歩きながらたどれるよう設計されているのがこの庭ならではの趣向だ。茶室や数寄屋造りの建物が点在し、四季折々に花や紅葉が水面に映る。古墳・神宮の歴史散策のあいだに、緑と水音に包まれてひと息つくのにちょうどよい。月曜休園が基本で、入園は閉園の三十分前まで。開園時間・入園料は変更されることがあるため、訪問前に公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Shirotori_Garden%2C_Atsuta_Ward_Nagoya_2014.jpg/1280px-Shirotori_Garden%2C_Atsuta_Ward_Nagoya_2014.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄熱田神宮西駅 徒歩約10分"
          },
          {
            "k": "入園料",
            "v": "大人300円ほか（変動あり）"
          },
          {
            "k": "雨の日",
            "v": "○ 雨景色も趣。足元に注意"
          },
          {
            "k": "営業",
            "v": "9:00〜17:00（入園16:30／月曜休が基本）"
          }
        ],
        "transit": "地下鉄熱田神宮西駅 徒歩約10分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "宮の渡し公園",
        "cuisine": "公園",
        "area": "名古屋市熱田区・内田町",
        "purpose": "夕方に下りる。旧東海道の渡し場跡で水辺の景色を眺める",
        "desc": "東海道五十三次のうち、宮宿（熱田）と桑名宿を海路で結んだ「七里の渡し」の船着場があった場所を整備した、堀川沿いの水辺の公園。東海道で唯一の海上ルートだったこの渡しは、伊勢へ向かう旅人が船を乗り降りした要所で、ここが熱田が宿場町として栄えた歴史の舞台であることを物語る。園内には湊を照らした常夜灯や時を告げた鐘が復元され、当時の旅情をしのばせる。神宮・古墳・庭園と内陸の歴史をたどってきた一日を、海へ開けた水辺で締めくくれるのがこのコースの妙味だ。屋根のない屋外のため、夕暮れどきは風や冷え込みに備えたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/%E5%AE%AE%E3%81%AE%E6%B8%A1%E3%81%97%E5%85%AC%E5%9C%92%E3%81%AE%E4%BC%8A%E5%8B%A2%E6%B9%BE%E5%8F%B0%E9%A2%A8%E3%81%AE%E8%AA%AC%E6%98%8E%E3%83%91%E3%83%8D%E3%83%AB_-_2.jpg/1280px-%E5%AE%AE%E3%81%AE%E6%B8%A1%E3%81%97%E5%85%AC%E5%9C%92%E3%81%AE%E4%BC%8A%E5%8B%A2%E6%B9%BE%E5%8F%B0%E9%A2%A8%E3%81%AE%E8%AA%AC%E6%98%8E%E3%83%91%E3%83%8D%E3%83%AB_-_2.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄伝馬町駅 徒歩約10分"
          },
          {
            "k": "料金",
            "v": "無料"
          },
          {
            "k": "雨の日",
            "v": "✕ 屋外の水辺。傘が必要"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方（夕景・常夜灯）"
          }
        ],
        "transit": "地下鉄伝馬町駅 徒歩約10分"
      }
    ],
    "sideArticles": [
      {
        "t": "名駅さんぽ5選。高層ビルとものづくりの街を歩く",
        "h": "/feature/chubu-nagoya-station-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Midland-Square-and-Nagoya-Building-1.jpg/1280px-Midland-Square-and-Nagoya-Building-1.jpg"
      },
      {
        "t": "名古屋港 子連れ5選。水族館と港で一日遊ぶ",
        "h": "/feature/chubu-nagoya-port-family",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Port_of_Nagoya_Public_Aquarium.jpg/1280px-Port_of_Nagoya_Public_Aquarium.jpg"
      }
    ],
    "quote": "草薙神剣の杜から旧東海道の渡し場跡まで。名古屋南部の古代と近世を、徒歩でひとつなぎにする半日の参詣コース。",
    "quoteCite": "マチノワ編集部",
    "closing": "朝10時、名鉄神宮前駅に降りたら、まずは熱田神宮の本宮へ。大楠の太い幹を見上げ、こころの小径を抜けて杜の冷気を浴びる(10:00〜11:30)。次は境内東隣、剣の宝庫 草薙館をはじめとする宝物館へ入り、神剣にまつわる宝物と刀剣を間近で受け止める(11:30〜12:30)。南門から街へ出て断夫山古墳へ向かい、東海地方最大の前方後円墳の墳丘を仰ぐと、信仰の対象が古代の権力へと姿を変える(13:00〜13:40)。すぐ隣の白鳥庭園では池泉回遊式の庭をゆっくり一周し、水音と緑で午後の足を休める(13:50〜14:50)。そして最後は旧東海道の七里の渡し跡、宮の渡し公園へ。常夜灯の立つ水辺に夕方の光が落ちるころ、半日の道のりがちょうど解けていく(15:10〜15:30)。杜の静けさ、古墳の土、庭の水、堀川の風と、手触りの違う名古屋を一本の線でたどれるのがこのコースの面白さだ。屋根のない区間が続くので、夏は日差しと水分、冬は冷えへの備えを忘れずに。雨なら屋外を短めにして、宝物館・草薙館の屋内展示に時間を寄せると一日がうまく回る。なお拝観時間・休館日・料金は折々で見直されるため、当日の最終情報は各施設の公式案内でおさえておきたい。"
  },
  "chubu-nagoya-port-family": {
    "id": "chubu-nagoya-port-family",
    "no": "CB-04",
    "articleType": "guide",
    "kicker": "NAGOYA PORT FAMILY",
    "title": "名古屋港、海を見せに行く子連れの一日。水族館から港の観覧車へ",
    "titleHTML": "名古屋港、海を見せに行く子連れの一日。<br>水族館から港の観覧車へ",
    "subtitle": "地下鉄を降りたら、もう潮の気配。水族館・係留船・展望室・遊園地が徒歩圏に集まる名古屋港ガーデンふ頭を、小さな足の歩幅に合わせて回る。",
    "lede": "子どもを連れて港へ行く面白さは、「海」を一日かけて少しずつ見せられるところにある。ガラス越しの大水槽でまず海の生きものに会い、次は本物の船の甲板に立たせ、最後は観覧車のゴンドラから海そのものを見下ろす——同じ「海」でも、見え方がそのつど変わっていく。名古屋港のガーデンふ頭は、地下鉄名港線「名古屋港」駅を降りてすぐの一帯に、水族館も係留船も展望室も遊園地も徒歩圏でひとかたまりになっている。施設どうしが近いぶん、ベビーカーでも移動の負担が小さく、子どもが飽きる前に次の景色へ移れるのがありがたい。だから歩く距離より、海の見せ方の順番を考えてあげたい場所だ。ここで挙げるのは名古屋港駅を起点にした水族館・JETTY・南極観測船ふじ・ポートビル展望室・シートレインランドの5か所。なお名古屋港ポートビル(海洋博物館・展望室)と南極観測船ふじは大会の宿泊拠点整備にともない2026年8月から11月にかけて休館予定とされており、開館の有無や料金は出かける前に各施設の公式ページで一度たしかめておくと安心だ。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Port_of_Nagoya_Public_Aquarium.jpg/1280px-Port_of_Nagoya_Public_Aquarium.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "名古屋港水族館",
        "cuisine": "水族館",
        "area": "名古屋市港区・名古屋港ガーデンふ頭",
        "purpose": "開館直後に入る。イルカやシャチ、ペンギンをまず見る",
        "desc": "ガーデンふ頭の中核となる大型水族館で、北館と南館の2棟構成。北館には大型のメインプールがあり、イルカやシャチ、ベルーガといった海の哺乳類を間近で観察できるのがこの館ならではの特長だ。南館では黒潮の大水槽やペンギン水槽、ウミガメの繁殖施設などを通じて南極への海をたどる構成になっている。イルカパフォーマンスは時間が決まっており、開館直後に入って早めに観覧席を確保すると、混み合う前にゆっくり見られる。ベビーカーでの移動や授乳室など子連れ設備も整う。入館料や開館時間、パフォーマンスの実施時刻は時期によって変わるため、訪問前に公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Port_of_Nagoya_Public_Aquarium.jpg/1280px-Port_of_Nagoya_Public_Aquarium.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄名港線 名古屋港駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "別料金(公式サイトで確認)"
          },
          {
            "k": "雨の日",
            "v": "◎ ほぼ屋内で楽しめる"
          },
          {
            "k": "おすすめ時間",
            "v": "開館直後の午前"
          }
        ],
        "transit": "地下鉄名港線 名古屋港駅 徒歩約5分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "JETTY",
        "cuisine": "飲食・物販複合施設",
        "area": "名古屋市港区・名古屋港ガーデンふ頭",
        "purpose": "水族館の隣で昼食。名古屋めしと子ども向けメニューで休憩",
        "desc": "名古屋港水族館のすぐ隣に建つ飲食・物販の複合施設で、NORTHとWESTの2棟に分かれている。名古屋めしが並ぶフードコートやカフェ、土産物店が集まり、水族館と地続きで移動できるため、子連れの昼食休憩にちょうどよい立地なのがここを動線に組み込む理由だ。フードコート形式の店が多く、メニューを選んで席を取りやすいので、小さな子を連れていても落ち着いて食事ができる。水族館グッズや名古屋土産もここでまとめて買える。営業時間は棟や店舗によって異なり、季節で変動するため、目当ての店がある場合は公式サイトのフロアマップと営業時間を訪問前に確認しておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Aquarium_%2B_Giant_wheel_%2B_Fuji_Icebreaker_-_view_from_the_lighthouse_-_Nagoya_Port_-_Japan_%2815676490678%29.jpg/1280px-Aquarium_%2B_Giant_wheel_%2B_Fuji_Icebreaker_-_view_from_the_lighthouse_-_Nagoya_Port_-_Japan_%2815676490678%29.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄名港線 名古屋港駅 徒歩約5分"
          },
          {
            "k": "用途",
            "v": "昼食・休憩・土産"
          },
          {
            "k": "雨の日",
            "v": "◎ 屋内施設"
          },
          {
            "k": "おすすめ時間",
            "v": "昼食どき(混雑前)"
          }
        ],
        "transit": "地下鉄名港線 名古屋港駅 徒歩約5分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "南極観測船ふじ",
        "cuisine": "博物館船",
        "area": "名古屋市港区・名古屋港ガーデンふ頭",
        "purpose": "昼食後に乗船。本物の船内を歩いて南極の歴史にふれる",
        "desc": "1965年から18年にわたり南極観測に従事し、引退後はガーデンふ頭に係留・公開されている実物の砕氷艦だ。操舵室や医務室、乗組員の居室などが当時のまま残され、本物の観測船の内部を子どもが歩いて回れるのがこの船ならではの体験になる。ヘリコプター格納庫を改装した展示室「南極の博物館」では、南極の自然や観測の歴史を模型や資料で学べる。船内は階段や段差が多く高さもあるため、小さな子からは目を離さないようにしたい。なお愛知・名古屋2026大会の宿泊拠点整備のため、2026年8月1日〜11月30日は休館予定。この期間は乗船できないため、訪問日が重なる場合は事前に公式サイトで開館状況を確認したい。入館は大人300円・小中学生200円ほどで、展望室・海洋博物館との3施設共通券もある。料金や営業時間は変更される場合があるため、公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Main_cabin_Fuji_Icebreaker_-_Nagoya_Port_-_Japan_%2815838197216%29.jpg/1280px-Main_cabin_Fuji_Icebreaker_-_Nagoya_Port_-_Japan_%2815838197216%29.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄名港線 名古屋港駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "大人300円ほど・共通券あり(変動あり)"
          },
          {
            "k": "雨の日",
            "v": "○ 船内見学は屋内中心"
          },
          {
            "k": "おすすめ時間",
            "v": "昼食後の午後"
          }
        ],
        "transit": "地下鉄名港線 名古屋港駅 徒歩約5分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "名古屋海洋博物館・名古屋港ポートビル展望室",
        "cuisine": "展望室・博物館",
        "area": "名古屋市港区・名古屋港ガーデンふ頭",
        "purpose": "夕方前に上がる。地上53mから伊勢湾と港を見渡す",
        "desc": "白い帆をかたどった外観のポートビルにあり、7階の展望室は地上53m。晴れた日には伊勢湾や、遠く御嶽山まで見えることもあり、名古屋港全体を一望できるのがこの場所ならではの眺めだ。3階の名古屋海洋博物館には、船の運転を体験できる操船シミュレータや、コンテナを積み下ろしするガントリークレーンの映像ブースなどがあり、子どもが手を動かして港のしくみを学べる。展望室は大人300円・中学生200円ほど、海洋博物館も同程度で、ふじを含む3施設共通券を使うとまとめて回れる。夏期は夜間延長されることもある。なお愛知・名古屋2026大会の宿泊拠点整備のため、ポートビルは展望室・名古屋海洋博物館を含む全館が2026年8月1日〜11月30日は休館予定。この期間は利用できないため、訪問日が重なる場合は事前に公式サイトで開館状況を確認したい。料金や開館時間は変わることがあるため、公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Nagoya_Port_Building.jpg/1280px-Nagoya_Port_Building.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄名港線 名古屋港駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "展望室・博物館各300円ほど・共通券あり(変動あり)"
          },
          {
            "k": "雨の日",
            "v": "◎ 屋内施設"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方前(晴天時の眺望)"
          }
        ],
        "transit": "地下鉄名港線 名古屋港駅 徒歩約5分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "名古屋港シートレインランド",
        "cuisine": "遊園地",
        "area": "名古屋市港区・名古屋港ガーデンふ頭",
        "purpose": "締めに遊ぶ。高さ85mの観覧車から港を眺める",
        "desc": "入園無料の港の遊園地で、シンボルは高さ85mの大観覧車。観覧車のゴンドラからガーデンふ頭一帯と名古屋港の海を見渡せ、夕方から夜にはイルミネーションが灯るため、一日の締めくくりに港の景色を楽しめるのがこの場所を最後に置く理由だ。観覧車のほかメリーゴーラウンドなど10種類ほどのアトラクションがあり、入園自体は無料で乗り物ごとに料金がかかる仕組み(大観覧車は800円ほど)。小さな子でも乗れる遊具が揃う。営業時間は曜日や季節で変動し、天候で運休することもあるため、訪問前に公式サイトで運行状況を確認しておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/SeaTrain_Lightup.jpg/1280px-SeaTrain_Lightup.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄名港線 名古屋港駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "入園無料・観覧車800円ほど(変動あり)"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外・天候で運休あり"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方〜日没(イルミネーション)"
          }
        ],
        "transit": "地下鉄名港線 名古屋港駅 徒歩約5分"
      }
    ],
    "sideArticles": [
      {
        "t": "名駅さんぽ5選。高層ビルとものづくりの街を歩く",
        "h": "/feature/chubu-nagoya-station-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Midland-Square-and-Nagoya-Building-1.jpg/1280px-Midland-Square-and-Nagoya-Building-1.jpg"
      },
      {
        "t": "熱田神宮 観光5選。杜と庭園をめぐる名古屋南部",
        "h": "/feature/chubu-atsuta-jingu-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Atsuta_Shrine.jpg/1280px-Atsuta_Shrine.jpg"
      }
    ],
    "quote": "大水槽の前で立ち止まり、船の甲板を踏み、観覧車から海を見下ろす。子どもにとっての「海」が、一日のなかで何度も姿を変えていく港の過ごし方。",
    "quoteCite": "マチノワ編集部",
    "closing": "朝いちばんに名古屋港駅から地上へ出たら、開館直後の名古屋港水族館へ。人がまだ少ないうちにイルカやシャチ、ペンギンを見せると、子どもの食いつきがいちばんいい。イルカのパフォーマンス前は観覧席が埋まりやすいので、見たい回が決まっているなら時間を逆算して動くと取りこぼさずに済む。たっぷり遊んでお腹が空いたら、隣のJETTYへ移って昼食。名古屋めしも子ども向けのメニューもそろっているので、海を見ながらひと息つける。午後は本物の南極観測船ふじへ。狭い船内の階段や甲板の段差は、小さい子だと目を離せない場面が出てくるぶん、「ここは本当に南極まで行った船なんだよ」と話してやると、見学が冒険のように変わる。日が傾く前に名古屋港ポートビルの展望室へ上がれば、地上53mから伊勢湾と港がひと続きに見渡せて、午前に見た海の広さが腑に落ちる。締めは名古屋港シートレインランド。高さ85mの観覧車のゴンドラで、一日歩いた港を上からゆっくり見下ろせば、子どもにとってちょうどいい余韻になる。屋外を歩く時間が長いので、夏は日よけと水分、冬は風よけをひとつ多めに。雨の日は外の遊園地を早めに切り上げ、屋内で完結する水族館や船内見学に寄せて組み替えるとよい(休館期間にあたる場合は、開いている施設で組み直すことになる)。施設ごとの料金や休館日、車で行くなら駐車場の案内は変わることがあるので、最新の状況だけは出発前にそれぞれの公式サイトで拾っておきたい。"
  },
  "chubu-atami-onsen-date": {
    "id": "chubu-atami-onsen-date",
    "no": "CB-05",
    "articleType": "guide",
    "kicker": "ATAMI ONSEN DATE",
    "title": "熱海、海へ下る湯けむりの坂をふたりで歩く。山の大楠から夜のテラスまで",
    "titleHTML": "熱海、海へ下る湯けむりの坂をふたりで歩く。<br>山の大楠から夜のテラスまで",
    "subtitle": "山際の社で大楠に手を合わせ、高台の城から相模湾を見下ろし、商店街の甘い湯気を抜けて砂浜へ。日が落ちたらテラスでひと息。坂の街・熱海を、ただ海の方へと下りながらたどる随筆。",
    "lede": "熱海の朝は、潮の匂いより先に湯けむりの気配で始まる。駅を出ると街はもう海に向かって傾いていて、どの路地を選んでも足は自然と下りへ吸い込まれていく。相模湾に面した斜面に温泉宿がせり上がり、山の緑と海の青が、ひとつの視界の中で肩を並べている。私たちはあえて高い方から歩きはじめることにした。まず山際の來宮神社で、樹齢を重ねた大楠の根もとに立つ。見上げると幹のうねりが空を分け、人の声が急に遠くなる。その静けさを胸にしまって、ここから先はずっと海へ向かって坂を下っていくだけ──そんな一日の歩き方を、二人分の歩幅で書きとめてみたい。施設の拝観時間やバスの本数はそのつど移ろうので、出かける前に公式の案内をのぞいておくと安心だ。",
    "date": "2026-06-13",
    "reading": "約8分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/%E7%86%B1%E6%B5%B7_Atami_Sun_Beach_-_Feb_10%2C_2008.jpg/1280px-%E7%86%B1%E6%B5%B7_Atami_Sun_Beach_-_Feb_10%2C_2008.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "來宮神社",
        "cuisine": "神社",
        "area": "熱海市西山町",
        "purpose": "朝いちで参拝。樹齢を重ねた大楠の周りを静かに歩く",
        "desc": "熱海の総鎮守として古くから信仰を集める神社で、境内の奥にそびえる大楠は国の天然記念物に指定され、幹の周囲は約24メートルにおよぶ。幹の周りを一周すると寿命が一年延びる、願いを心に秘めて回ると叶うという言い伝えがあり、この一本のために訪れる参拝客も多い。木漏れ日の差す参道や、夜に灯る大楠のライトアップ、境内のカフェなど、神社でありながら滞在して楽しめる造りも特徴だ。一日の最初に山側のこの場所から始めると、ここから海へと高度を下げていく熱海らしい動線がつくりやすい。参拝時間や御朱印の受付時間は変わることがあるため、訪問前に公式サイトでの確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Kinomiya_Shrine_Haiden.jpg/1280px-Kinomiya_Shrine_Haiden.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR来宮駅 徒歩約5分（熱海駅から一駅・徒歩約18分）"
          },
          {
            "k": "料金",
            "v": "参拝無料"
          },
          {
            "k": "雨の日",
            "v": "○ 屋根のあるカフェや参集殿あり"
          },
          {
            "k": "おすすめ時間",
            "v": "午前（人が少なく静か）"
          }
        ],
        "transit": "JR来宮駅 徒歩約5分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "熱海城",
        "cuisine": "城（展望・観光施設）",
        "area": "熱海市曽我山",
        "purpose": "昼前に高台へ。天守の展望台から相模湾と熱海の街を見渡す",
        "desc": "錦ヶ浦の高台に立つ観光施設で、歴史上の城郭ではなく昭和に建てられた天守風の建物だが、最上階の展望台からは相模湾と熱海の温泉街を一望できる眺めが最大の見どころだ。館内には日本の城に関する展示や江戸の文化を体感できるコーナー、足湯などがあり、天気のよい日は海の向こうに初島や伊豆大島まで望める。山の上に位置するため熱海駅からはバスかタクシーでの移動が基本で、海辺のスポットへ下りていく前にこの高台で街の全体像をつかんでおくと、午後の動線が頭に入りやすい。料金や営業時間、バスの運行は変更される場合があるため、訪問前に公式サイトでの確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Atami_Castle_20120915.jpg/1280px-Atami_Castle_20120915.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR熱海駅からバス・タクシーで約10分"
          },
          {
            "k": "料金",
            "v": "大人1,200円（公式サイトで要確認）"
          },
          {
            "k": "営業",
            "v": "9:00〜17:00（入場16:30まで・公式確認）"
          },
          {
            "k": "おすすめ時間",
            "v": "昼前後（晴天時の展望）"
          }
        ],
        "transit": "JR熱海駅からバス・タクシーで約10分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "熱海銀座商店街",
        "cuisine": "商店街",
        "area": "熱海市銀座町",
        "purpose": "昼下がりに散策。昭和の面影とできたての甘味を食べ歩く",
        "desc": "熱海駅から海へ下る市街地の中心にある商店街で、かつて温泉街の賑わいの核だった通りに、いまも干物店や昭和から続く喫茶店、洋品店が並ぶ。近年は地元の素材を使ったスイーツ店やカフェ、ゲストハウスも増え、レトロな看板の下に新しい店が混じる独特の風景が楽しめる。プリンや温泉まんじゅう、海鮮を使った軽食など食べ歩きの選択肢が多く、海辺へ向かう途中の休憩と腹ごしらえにちょうどよい。アーケードに近い造りで雨に強いのも、海辺の屋外スポットと組み合わせるうえで心強い。各店の営業時間や定休日は店ごとに異なり変わることもあるため、目当てがある場合は事前確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/RZ_Atami_Ginza_Theater_A.jpg/1280px-RZ_Atami_Ginza_Theater_A.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR熱海駅 徒歩約10〜15分（海側へ下る）"
          },
          {
            "k": "料金",
            "v": "散策無料（飲食は店ごと）"
          },
          {
            "k": "雨の日",
            "v": "◎ アーケード状で雨に強い"
          },
          {
            "k": "おすすめ時間",
            "v": "昼下がり（食べ歩き向き）"
          }
        ],
        "transit": "JR熱海駅 徒歩約10〜15分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "熱海サンビーチ",
        "cuisine": "海水浴場・人工海浜",
        "area": "熱海市東海岸町",
        "purpose": "夕方前に波打ち際へ。ヤシ並木の砂浜を二人で歩く",
        "desc": "温泉街の東側に約400メートル続く都市型の人工海浜で、ヤシの並木が植えられた遊歩道に沿って白い砂浜が広がる。波が穏やかで街なかから歩いてアクセスできるため、海水浴シーズン以外でも散歩スポットとして親しまれているのが特徴だ。夏は遊泳でき、それ以外の季節も砂浜と海を眺めながらゆっくり歩ける。夜には砂浜全体がライトアップされ、昼の明るいリゾート感から一転して落ち着いた雰囲気に変わるため、日没をはさんで滞在すると二つの表情を味わえる。遊泳期間や時間、ライトアップの時間は変更されることがあるため、訪問前に公式の観光情報での確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/%E7%86%B1%E6%B5%B7_Atami_Sun_Beach_-_Feb_10%2C_2008.jpg/1280px-%E7%86%B1%E6%B5%B7_Atami_Sun_Beach_-_Feb_10%2C_2008.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR熱海駅 徒歩約15〜20分（バスで「サンビーチ」下車も可）"
          },
          {
            "k": "料金",
            "v": "無料（遊泳期間は公式確認）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外のため雨天は不向き"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方（日没前後）"
          }
        ],
        "transit": "JR熱海駅 徒歩約15〜20分（バス利用可）"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "親水公園ムーンテラス",
        "cuisine": "海浜公園・テラス",
        "area": "熱海市渚町",
        "purpose": "日没後に締めくくる。南欧風テラスでライトアップと夜景を眺める",
        "desc": "熱海港にほど近い渚に整備された海辺の公園で、イタリアの海岸リゾートをイメージしたムーンテラスやスカイデッキ、レインボーデッキなどが続く。サンビーチに隣接しているため、波打ち際の散歩からそのまま歩いて移動でき、一日の締めくくりに組み込みやすい。「恋人の聖地」に認定されており、夜になるとテラス一帯がロマンティックにライトアップされ、海と街の灯りを背景にした夜景が広がるのがこの場所ならではの魅力だ。入園は無料で時間の制約も少ないため、日没を待ってゆっくり過ごせる。ライトアップの時間や点灯状況は変わることがあるため、訪問前に熱海市の公式情報での確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Atami_Moon_terrace.jpg/1280px-Atami_Moon_terrace.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR熱海駅 徒歩約15〜20分（バス「親水公園」下車すぐ）"
          },
          {
            "k": "料金",
            "v": "入園無料"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外のため雨天は不向き"
          },
          {
            "k": "おすすめ時間",
            "v": "日没後（ライトアップ）"
          }
        ],
        "transit": "JR熱海駅 徒歩約15〜20分（バスで「親水公園」下車すぐ）"
      }
    ],
    "sideArticles": [
      {
        "t": "難波・道頓堀 食べ歩き5選。グリコサインから法善寺横丁まで",
        "h": "/feature/kansai-namba-dotonbori-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Neon_sign_of_Dotonbori_daytime.JPG"
      },
      {
        "t": "新世界・通天閣 観光5選。レトロな下町を歩く半日",
        "h": "/feature/kansai-shinsekai-tsutenkaku",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Tsutenkaku%2C_Osaka.jpg/1280px-Tsutenkaku%2C_Osaka.jpg"
      }
    ],
    "quote": "山の社の大楠から、海辺の夜のテラスまで。坂を下るほど、熱海は表情を変えていく。",
    "quoteCite": "マチノワ編集部",
    "closing": "大楠の前で深く息を吸ったら、次は視線を上げに行く。熱海城のある曽我山へ高台を上がると、さっきまで木立にさえぎられていた相模湾が、天守の展望台から一息に開ける。眼下の湯の街と、光をはじく海と、その先のかすむ岬。高いところから一度全体を見渡しておくと、これから下っていく道のりが地図のように胸に収まる。坂を下りきった先で待っているのは、熱海銀座商店街の賑わいだ。昭和の看板が連なるアーケードを、できたての甘味を分け合いながら抜けていく。手のひらに残るほのかな温かさのまま路地を出れば、もう潮風が頬に当たっている。ヤシ並木の続く熱海サンビーチで、私たちは波打ち際まで歩いた。靴の先に砂が触れ、寄せては返す水音が会話の隙間を埋めていく。そして日が傾くころ、隣の親水公園ムーンテラスへ。南欧風の白いテラスに腰を下ろし、海と街にひとつずつ灯がともるのを待つ。山の社で始まった一日が、海辺の夜景でゆっくり閉じていく。坂の多い街だから、歩きやすい靴と、急がない心づもりだけは持って出かけたい。高低差そのものが景色になる街を、二人で一段ずつ下りてきた感触が、帰り道の足にまだ残っている。なお拝観・入場・バス運行などの最新情報は、足を運ぶ前にそれぞれの公式で一度たしかめておきたい。"
  },
  "kyushu-tenjin-walk": {
    "id": "kyushu-tenjin-walk",
    "no": "KY-01",
    "articleType": "ranking",
    "kicker": "TENJIN WALK",
    "title": "天神で立ち寄りたい、地下と緑の5か所。地下街から那珂川の芝生まで",
    "titleHTML": "天神で立ち寄りたい、地下と緑の5か所。<br>地下街から那珂川の芝生まで",
    "subtitle": "九州最大の繁華街・天神。買い物の合間に半径500m圏で寄れる地下街・神社・商店街・屋上庭園・芝生広場を、性格の違いで選んでみた。",
    "lede": "天神を歩くなら、どこか一か所を目指すより、性格の違う場所を順に拾っていくほうが面白い。西鉄福岡（天神）駅と地下鉄の天神・天神南駅が集まる九州最大の繁華街でありながら、ヨーロッパ調の地下道、緑が階段状に積み上がったビル、那珂川沿いの芝生広場までが、ぜんぶ徒歩圏に詰まっているからだ。今回はその中から、地下・地上・緑という「高さ」と「肌ざわり」が一つずつ違う5か所を選んだ。どれも繁華街の真ん中にあって入りやすく、買い物のついでに気軽に寄れる場所ばかり。足湯やお茶を挟んでも財布に響きにくいのも、天神の中心で半日を組み立てるうえでは効いてくる。なお足湯や各施設の料金・開放時間は折々で変わるので、出かける前に公式の案内を一度のぞいておくと確実だ。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/%E5%A4%A9%E7%A5%9E%E4%B8%AD%E5%A4%AE%E5%85%AC%E5%9C%92.JPG/1280px-%E5%A4%A9%E7%A5%9E%E4%B8%AD%E5%A4%AE%E5%85%AC%E5%9C%92.JPG",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "天神地下街",
        "cuisine": "地下街",
        "area": "福岡市中央区・天神",
        "purpose": "午前にスタート。南北約590mの地下街を端まで歩く",
        "desc": "天神地下街は、西鉄福岡（天神）駅・地下鉄天神駅・天神南駅を地下でつなぐ、南北約590mのアーケード型地下街だ。1番街から12番街まで続き、ファッションや書籍、飲食など150ほどの店が並ぶ。特徴は19世紀ヨーロッパの街並みをイメージしてつくられた内装で、唐草模様の天井や石畳調の床、アンティーク調の照明が通路全体に統一され、地下とは思えない落ち着いた空間になっている。天神のほぼ全方向へ地下から直結しているため、ここを起点にすれば天候に左右されず街歩きを始められる。物販はおおむね10:00から、飲食は一部21:00ごろまで営業するが、店舗ごとに時間は異なるため、立ち寄りたい店は公式サイトで確認しておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Tenjin-underground-mall.jpg/1280px-Tenjin-underground-mall.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄天神駅・天神南駅・西鉄福岡（天神）駅 直結"
          },
          {
            "k": "料金",
            "v": "無料（各店舗で買い物可）"
          },
          {
            "k": "雨の日",
            "v": "◎ 全区間が屋内"
          },
          {
            "k": "おすすめ時間",
            "v": "午前（買い物前の散策に）"
          }
        ],
        "transit": "地下鉄天神駅・西鉄福岡（天神）駅 直結"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "警固神社",
        "cuisine": "神社",
        "area": "福岡市中央区・天神",
        "purpose": "地上へ。繁華街の真ん中で参拝し、足湯で一息つく",
        "desc": "警固神社は、天神の中心部・天神2丁目に鎮座する古社で、災いを「警（いまし）め固（かた）める」厄除けの神として知られる。ビルに囲まれた境内ながら、鳥居をくぐると喧騒がふっと和らぐのがこの神社ならではの感覚だ。注目したいのは社殿脇の無料の足湯で、循環式のあたたかい湯に腰かけて足だけ浸かれるようになっており、買い物や歩き疲れの合間にひと息つく地元の人の姿も多い。龍をかたどった蛇口から汲める御神水もあり、繁華街の真ん中で水と緑にふれられる。西鉄福岡（天神）駅から徒歩1分というアクセスの良さも魅力だ。足湯はおおむね9:00〜16:00の利用だが、利用時間や条件は変わることがあり、天候などで休止する場合もあるため、訪問前に公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Kego_Shrine_the_torii_and_Kego_Sand%C5%8D_Tenjin_2-ch%C5%8Dme_Ch%C5%AB%C5%8D-ku_Fukuoka_20231114.jpg/1280px-Kego_Shrine_the_torii_and_Kego_Sand%C5%8D_Tenjin_2-ch%C5%8Dme_Ch%C5%AB%C5%8D-ku_Fukuoka_20231114.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "西鉄福岡（天神）駅 徒歩約1分／地下鉄天神駅 徒歩約3分"
          },
          {
            "k": "料金",
            "v": "参拝無料・足湯無料"
          },
          {
            "k": "雨の日",
            "v": "△ 参拝は屋外"
          },
          {
            "k": "おすすめ時間",
            "v": "昼前（足湯で休憩）"
          }
        ],
        "transit": "西鉄福岡（天神）駅 徒歩約1分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "新天町商店街",
        "cuisine": "商店街",
        "area": "福岡市中央区・天神",
        "purpose": "昼食に。アーケードの大時計を見上げて昼をとる",
        "desc": "新天町商店街は、1946年に生まれた西日本初のアーケード型商店街で、北通り・南通りの2本が交わるように天神2丁目に広がる。ファッションや雑貨、書籍、文具、飲食まで多彩な店が並び、戦後の復興期から天神の買い物の中心を担ってきた歴史ある通りだ。シンボルは「メルヘン広場」に立つ高さ約17mの大時計塔「メルヘンチャイム」で、待ち合わせや時間の決め時刻に音が鳴り、商店街の目印として親しまれている。屋根があるため天候を気にせず歩け、昼食の選択肢も幅広いので、このコースでは昼の食事どころとして組み込みたい。西鉄福岡（天神）駅からすぐという立地で、地下街や警固神社からも徒歩数分で行き来できる。各店の営業時間や定休日は異なるため、公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/9/99/Shintencho_Tenjin_Fukuoka_Jpn_01.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "西鉄福岡（天神）駅 徒歩約1分／地下鉄天神駅 徒歩約3分"
          },
          {
            "k": "料金",
            "v": "無料（各店舗で飲食・買い物）"
          },
          {
            "k": "雨の日",
            "v": "◎ アーケードで濡れにくい"
          },
          {
            "k": "おすすめ時間",
            "v": "昼（食事に）"
          }
        ],
        "transit": "西鉄福岡（天神）駅 徒歩約1分／地下鉄天神駅 徒歩約3分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "アクロス福岡（ステップガーデン）",
        "cuisine": "屋上庭園",
        "area": "福岡市中央区・天神",
        "purpose": "午後に上る。緑の階段を登り、屋上から街を見渡す",
        "desc": "アクロス福岡は、外壁が階段状の緑で覆われた「ステップガーデン」を持つ公民複合施設で、まるで街の真ん中にそびえる小さな山のように見えることから「アクロス山」とも呼ばれる。最大の見どころは、天神中央公園側の屋外入口から約809段・15分ほどかけて緑の斜面を上っていける点で、登るにつれて木々のトンネルや滝の流れが現れ、都心とは思えない登山気分を味わえる。階段には小石が敷かれ、雨上がりでも滑りにくい工夫がされている。最上部の屋上展望台からは博多の街並みや、遠くに能古島・志賀島のシルエットまで見渡せる。ただし展望台の開放は土日祝のみ・10:00〜16:00で、ステップガーデン自体も季節で開園時間が変わり、雨天時は閉園することがあるため、訪問前に公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/%E5%A4%A9%E7%A5%9E%E4%B8%AD%E5%A4%AE%E5%85%AC%E5%9C%92.JPG/1280px-%E5%A4%A9%E7%A5%9E%E4%B8%AD%E5%A4%AE%E5%85%AC%E5%9C%92.JPG"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄天神駅 徒歩約3分（地下通路で直結）"
          },
          {
            "k": "料金",
            "v": "入場無料"
          },
          {
            "k": "雨の日",
            "v": "✕ 屋上は雨天閉鎖あり"
          },
          {
            "k": "おすすめ時間",
            "v": "土日祝の昼〜午後（展望台開放時）"
          }
        ],
        "transit": "地下鉄天神駅 徒歩約3分（地下通路で直結）"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "天神中央公園",
        "cuisine": "都市公園",
        "area": "福岡市中央区・天神",
        "purpose": "締めに。那珂川沿いの芝生で休んで解散する",
        "desc": "天神中央公園は、旧福岡県庁の跡地につくられた都心のオアシスで、芝生広場を中心に、那珂川沿いの水辺と歴史的な建物が調和した都市公園だ。アクロス福岡のすぐ隣にあるため、ステップガーデンを下りてそのまま芝生で休めるのがこのコースならではの流れになる。広い芝生は腰を下ろして街歩きの締めにちょうどよく、川沿いのベンチからは水の流れと対岸のビル群を同時に眺められる。園内には旧県庁時代を伝える赤レンガ風の建物も残り、繁華街の真ん中とは思えないゆったりした時間が流れる。屋外のため天候の影響は受けるが、晴れた日なら買い物や街歩きのクールダウンに最適だ。イベント開催時は一部利用が制限されることがあるため、気になる場合は公式情報で確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Tenjin_Central_Park_the_bank_of_the_Naka_River_Fukuoka_20231219_165743.jpg/1280px-Tenjin_Central_Park_the_bank_of_the_Naka_River_Fukuoka_20231219_165743.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄天神駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "無料"
          },
          {
            "k": "雨の日",
            "v": "✕ 屋外の芝生広場"
          },
          {
            "k": "おすすめ時間",
            "v": "午後（街歩きの締めに）"
          }
        ],
        "transit": "地下鉄天神駅 徒歩約5分"
      }
    ],
    "sideArticles": [
      {
        "t": "中洲・川端 食べ歩き5選。屋台と商店街をめぐる夜",
        "h": "/feature/kyushu-nakasu-kawabata-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Nakasu_Yatai_Stalls_%2819979437930%29.jpg/1280px-Nakasu_Yatai_Stalls_%2819979437930%29.jpg"
      },
      {
        "t": "大濠公園 子連れ5選。池と緑で一日過ごす福岡",
        "h": "/feature/kyushu-ohori-park-family",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/%C5%8Chori_Park_The_pergola_in_Matsushima_%C5%8Chori-k%C5%8Den_Ch%C5%AB%C5%8D-ku_Fukuoka_20260514.jpg/1280px-%C5%8Chori_Park_The_pergola_in_Matsushima_%C5%8Chori-k%C5%8Den_Ch%C5%AB%C5%8D-ku_Fukuoka_20260514.jpg"
      }
    ],
    "quote": "地下街・神社・商店街・屋上庭園・芝生。性格の違う5か所を半日で拾い歩く、天神中心部のセレクト。",
    "quoteCite": "マチノワ編集部",
    "closing": "この5か所の良さは、選びながらも欲張らずに済むところにある。天神地下街は南北約590mのアーケードを端まで歩けば、それだけで一本の散歩道になるし、地上に出てすぐの警固神社は繁華街のど真ん中で手を合わせて足湯までつかえる、肩の力が抜ける場所だ。昼は新天町商店街でアーケードの大時計を見上げながら一息つき、午後はアクロス福岡のステップガーデンへ。緑の階段を上った屋上から街を見渡すと、さっきまで歩いていた地下や商店街の屋根が一望できて、天神の立体感がよく分かる。締めは隣の天神中央公園、那珂川沿いの芝生で足を休めればちょうどいい。屋上の開放は天気や曜日に左右されやすく、階段もそれなりに上るので、雨や足元の悪い日は地下街と新天町を厚めにして緑を軽めにする、くらいの気持ちで選び直せばいい。どこを増やしてどこを削るかは、その日の天気と気分しだいでいい。"
  },
  "kyushu-nakasu-kawabata-walk": {
    "id": "kyushu-nakasu-kawabata-walk",
    "no": "KY-02",
    "articleType": "guide",
    "kicker": "NAKASU KAWABATA",
    "title": "中洲・川端、夕暮れから屋台までを歩く。櫛田神社の鈴から那珂川の灯りへ",
    "titleHTML": "中洲・川端、夕暮れから屋台までを歩く。<br>櫛田神社の鈴から那珂川の灯りへ",
    "subtitle": "櫛田神社で手を合わせ、上川端商店街のアーケードを抜け、キャナルシティ博多の運河と博多リバレインモールでひと息ついて、那珂川の中洲屋台へ。博多の夕方が夜に溶けていく道のりを、足の向くまま歩いた記録。",
    "lede": "夕方の博多は、光の温度がゆっくり下がっていく時間だ。那珂川と博多川にはさまれた一帯に立つと、まだ明るい空の下でアーケードの照明が灯りはじめ、どこからか出汁の匂いが流れてくる。最初に足を止めたのは櫛田神社。博多総鎮守の境内は参拝の人がまばらで、通年で立つ飾り山笠を見上げると、その大きさにいったん歩く速度が止まる。鈴の音を背に通りへ出れば、もう街は夜の支度をはじめていて、この先の数百メートルを、灯りを追いかけるように歩いていくことになった。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Nakasu_Yatai_Stalls_%2819979437930%29.jpg/1280px-Nakasu_Yatai_Stalls_%2819979437930%29.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "櫛田神社",
        "cuisine": "神社",
        "area": "福岡市博多区・上川端町",
        "purpose": "夕方に参拝。博多総鎮守と通年の飾り山笠から歩き出す",
        "desc": "「お櫛田さん」と親しまれる博多の総鎮守で、博多祇園山笠が奉納される神社として知られる。境内には、山笠の建て替え時期にあたる6月をのぞいて一年を通して豪華絢爛な飾り山笠が公開されており、祭り当日でなくても博多文化の象徴を間近に見られるのがこの神社ならではの理由だ。境内の散策に拝観料はかからず、夕方でも開門しているため、食べ歩きのスタート地点として落ち着いて手を合わせてから歩き出せる。山笠以外にも見どころが点在するので、最初に立ち寄って博多の街の成り立ちに触れておきたい。開門時間や授与所の受付時間は変わることがあるため、訪問前に公式情報での確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Kushida_Shrine_the_Hakata_Wall_and_the_inner_sanctuary_1-41_Kami-kawabatamachi_Hakata-ku_Fukuoka_20231120.jpg/1280px-Kushida_Shrine_the_Hakata_Wall_and_the_inner_sanctuary_1-41_Kami-kawabatamachi_Hakata-ku_Fukuoka_20231120.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "櫛田神社前駅 徒歩約2分／中洲川端駅 徒歩約6分"
          },
          {
            "k": "拝観料",
            "v": "境内散策は無料"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外参拝が中心"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方（散策の起点に）"
          }
        ],
        "transit": "地下鉄七隈線 櫛田神社前駅 徒歩約2分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "上川端商店街",
        "cuisine": "商店街",
        "area": "福岡市博多区・上川端町",
        "purpose": "アーケードを北上。土産物と甘味を見ながら食べ歩く",
        "desc": "キャナルシティ博多側と博多リバレイン側をつなぐ全長約400mのアーケード商店街で、博多人形や銘菓の土産店、ラーメン店などが軒を連ねる。屋根に覆われているため天候を気にせず歩けるうえ、櫛田神社からそのまま北東へ抜けられる動線上にあるのがこの商店街を組み込む理由だ。商店街内の「川端ぜんざい広場」では、通常は週末を中心に博多名物の甘いぜんざいが味わえ、中央には飾り山笠が据えられているので、ここでも山笠の迫力を楽しめる。営業日が限られる店もあるため、ぜんざいなど目当てがある場合は訪問前に営業日を確認しておくとよい。食べ歩きの途中で甘味を一つ挟むのにちょうどよい立ち寄り先だ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Kawabata-d%C5%8Dri_INT_the_NW_entrance_of_Kawabata_Shopping_Arcade_Kami-kawabatamachi_Hakata-ku_Fukuoka_20231123.jpg/1280px-Kawabata-d%C5%8Dri_INT_the_NW_entrance_of_Kawabata_Shopping_Arcade_Kami-kawabatamachi_Hakata-ku_Fukuoka_20231123.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "中洲川端駅すぐ／櫛田神社前駅 徒歩約3分"
          },
          {
            "k": "料金",
            "v": "入場無料（飲食・買物は店舗による）"
          },
          {
            "k": "雨の日",
            "v": "◎ アーケードで天候不問"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方（甘味休憩に）"
          }
        ],
        "transit": "地下鉄空港線 中洲川端駅 徒歩約1分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "キャナルシティ博多",
        "cuisine": "複合商業施設",
        "area": "福岡市博多区・住吉",
        "purpose": "運河沿いで休憩。噴水ショーを眺めて夜への気分をつくる",
        "desc": "中央に運河（キャナル）が流れる大型複合施設で、約150店の飲食・物販店のほか、ホテルや劇場、映画館が集まる。運河沿いの広場では音楽に合わせた噴水ショーが日に何度も催され、買い物や食事だけでなく演出そのものを目当てに立ち寄れるのがこの施設ならではの理由だ。櫛田神社・上川端商店街から徒歩数分で、食べ歩きの合間に屋根のある屋内でしっかり休める拠点になる。ラーメンスタジアムなどフード関連の施設もあり、屋台前の軽い腹ごしらえにも使い勝手がよい。噴水ショーの開催時刻は時期により変わるため、タイミングを狙う場合は当日の公式案内で確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Canal_City_Hakata_2011.jpg/1280px-Canal_City_Hakata_2011.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "櫛田神社前駅 1番出口から徒歩約3分／中洲川端駅 徒歩約10分"
          },
          {
            "k": "料金",
            "v": "入場無料（噴水ショーも無料）"
          },
          {
            "k": "雨の日",
            "v": "○ 屋内中心・一部屋外"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方（噴水ショーの時間帯）"
          }
        ],
        "transit": "地下鉄七隈線 櫛田神社前駅（1番出口）徒歩約3分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "博多リバレインモール",
        "cuisine": "複合商業施設",
        "area": "福岡市博多区・下川端町",
        "purpose": "屋台前のひと休み。中洲川端駅直結で雨でも安心",
        "desc": "中洲川端駅に直結する複合施設で、ファッションや雑貨の店に加え、館内には子ども向けの福岡アンパンマンこどもミュージアムも入る。屋台街のある那珂川沿いまで歩いて出やすい立地で、暗くなる前にトイレや休憩を済ませ、屋台での夜に備える最後の屋内拠点として使えるのがこの施設を動線に入れる理由だ。駅直結のため雨の日でも濡れずにたどり着け、家族連れなら子どもを遊ばせてから大人の屋台時間に移る、といった組み立てもしやすい。フロアごとに営業時間や休業日が異なる場合があるため、立ち寄る店舗の営業は事前に確認しておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/%E5%8D%9A%E5%A4%9A%E3%83%AA%E3%83%90%E3%83%AC%E3%82%A4%E3%83%B3%E3%83%A2%E3%83%BC%E3%83%AB_by_TAKASHIMAYA.JPG/1280px-%E5%8D%9A%E5%A4%9A%E3%83%AA%E3%83%90%E3%83%AC%E3%82%A4%E3%83%B3%E3%83%A2%E3%83%BC%E3%83%AB_by_TAKASHIMAYA.JPG"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "中洲川端駅 直結"
          },
          {
            "k": "料金",
            "v": "入館無料（館内施設は有料あり）"
          },
          {
            "k": "雨の日",
            "v": "◎ 駅直結・屋内"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方〜日没前"
          }
        ],
        "transit": "地下鉄空港線 中洲川端駅 直結"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "中洲屋台",
        "cuisine": "屋台街",
        "area": "福岡市博多区・中洲",
        "purpose": "夜に締める。那珂川沿いの屋台で福岡らしい一杯を",
        "desc": "那珂川と博多川にはさまれた中洲のうち、那珂川沿い・清流公園周辺（「福博であい橋」から春吉橋にかけての川べり）に屋台が点在する屋台街で、福岡を代表する夜の食べ歩きスポットだ。単一の店ではなく、清流公園側の川沿いに屋台が連なる集積エリアを指すため、待ち合わせるなら「清流公園周辺」を目安にするとわかりやすい。ラーメンやおでん、焼き物などを川面の灯りを眺めながら立て続けに味わえ、店主や隣の客との距離が近いのがこの屋台街ならではの理由だ。多くの店は夕方18時頃から準備を始め、夜が本番となるため、商店街や施設を回ってから来ると時間がちょうど合う。天候や日曜・祝日で休む屋台が多く、店ごとに営業日や定休が異なるので、目当ての店がある場合は訪問前に確認を。会計方法や価格も店により異なるため、注文前にメニューや料金を確かめておくと安心して締めくくれる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Nakasu_Yatai_Stalls_%2819979437930%29.jpg/1280px-Nakasu_Yatai_Stalls_%2819979437930%29.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "中洲川端駅から徒歩約7分（清流公園周辺の屋台集積地まで）"
          },
          {
            "k": "料金",
            "v": "店舗により異なる（飲食代のみ・変動あり）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外・天候で休業あり"
          },
          {
            "k": "おすすめ時間",
            "v": "夜（18時以降）"
          }
        ],
        "transit": "地下鉄空港線 中洲川端駅 徒歩約7分"
      }
    ],
    "sideArticles": [
      {
        "t": "天神さんぽ5選。地下街と公園が混ざる福岡の中心",
        "h": "/feature/kyushu-tenjin-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/%E5%A4%A9%E7%A5%9E%E4%B8%AD%E5%A4%AE%E5%85%AC%E5%9C%92.JPG/1280px-%E5%A4%A9%E7%A5%9E%E4%B8%AD%E5%A4%AE%E5%85%AC%E5%9C%92.JPG"
      },
      {
        "t": "大濠公園 子連れ5選。池と緑で一日過ごす福岡",
        "h": "/feature/kyushu-ohori-park-family",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/%C5%8Chori_Park_The_pergola_in_Matsushima_%C5%8Chori-k%C5%8Den_Ch%C5%AB%C5%8D-ku_Fukuoka_20260514.jpg/1280px-%C5%8Chori_Park_The_pergola_in_Matsushima_%C5%8Chori-k%C5%8Den_Ch%C5%AB%C5%8D-ku_Fukuoka_20260514.jpg"
      }
    ],
    "quote": "アーケードの生活の匂いから、運河の演出、そして川辺の屋台へ。博多の夕暮れが夜にほどけていく、灯りをたどる道のり。",
    "quoteCite": "マチノワ編集部",
    "closing": "神社を出て北へ向かうと、上川端商店街のアーケードが続いていた。約400メートル、明太子や土産物の店先をのぞき、甘味の香りに足を止めながら進むと、屋根の下にこもった生活の温度がそのまま夕方の賑わいになっていく。アーケードを抜けてキャナルシティ博多に入れば空気が一変し、運河を囲む曲線の建物と噴水ショーの水音が、街歩きの気分をいったん夜の側へ切り替えてくれた。日が落ちきる前に博多リバレインモールでひと休み。中洲川端駅に直結しているから、空模様が怪しくなっても慌てずに済むのがありがたい。そうして外へ出る頃には、那珂川沿いに屋台の赤い灯りがぽつぽつと並びはじめている。準備が整うのはおおむね日が暮れてからで、暖簾をくぐればもう博多の夜だ。神社の静けさ、アーケードの雑踏、運河の水音、そして川面に映る屋台の灯り——どれも徒歩数分の距離でつながっていて、一筆書きのように博多の表情が移り変わっていくのがこの道のおもしろさだった。屋台は天候や曜日で店じまいが早かったり休んだりするし、櫛田神社の飾り山笠も建て替えの時期には姿を見られないことがある。雨脚が強ければアーケードと屋内施設を長めにつないで、川辺は軒先で雨をしのげる一軒だけのぞくくらいに切り替えるのが歩きやすい。屋台の営業日や各施設の時間は移ろうものなので、出かける前にそれぞれの公式情報へ目を通しておくと安心して歩ける。歩き終えて橋の上で振り返ると、昼の余韻と夜の喧騒が一本の川沿いに溶けこんでいた。"
  },
  "kyushu-ohori-park-family": {
    "id": "kyushu-ohori-park-family",
    "no": "KY-03",
    "articleType": "course",
    "kicker": "OHORI PARK FAMILY",
    "title": "大濠公園で過ごす子連れ半日。池の散策から動物園へ",
    "titleHTML": "大濠公園で過ごす子連れ半日。<br>池の散策から動物園へ",
    "subtitle": "福岡市中央区、大濠公園駅を起点に。大きな池を中心に美術館・城跡・庭園が集まり、最後は動植物園まで。小さな子ども連れでも移動を詰め込まずに回れる一日のつなぎ方。",
    "lede": "大濠公園は、周囲約2kmの池を芝生広場や遊歩道が取り囲み、その周りに美術館や城跡、日本庭園までが地下鉄一駅ぶんの距離に寄り集まった、福岡では珍しいほど性格の濃い緑地だ。池畔の道は段差が少なく、ベビーカーを押しても歩きやすい。だからこのコースは、子どもが自由に動ける池と芝生を背骨にしつつ、室内の美術館・歴史の城跡・静かな庭・動物園という手触りの違う場所を、一駅圏のなかで無理なく数珠つなぎにすることを狙った。小さな子を連れていると一日にいくつも回るのは難しいが、ここなら大移動を挟まずに表情の違う体験を重ねられる。入園料や拝観料、休園日は施設ごとに変わりやすいので、出かける前に各施設の公式ページへ一度目を通しておくと安心だ。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/%C5%8Chori_Park_The_pergola_in_Matsushima_%C5%8Chori-k%C5%8Den_Ch%C5%AB%C5%8D-ku_Fukuoka_20260514.jpg/1280px-%C5%8Chori_Park_The_pergola_in_Matsushima_%C5%8Chori-k%C5%8Den_Ch%C5%AB%C5%8D-ku_Fukuoka_20260514.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "大濠公園",
        "cuisine": "公園",
        "area": "福岡市中央区・大濠公園",
        "purpose": "午前に散策。大きな池の周りをベビーカーで一周する",
        "desc": "福岡藩初代藩主・黒田長政が福岡城の外堀として整備した入江を、その後の整備で池として生かした公園で、周囲約2kmの大きな池が街なかにそのまま広がっているのが特徴だ。池に浮かぶ柳島・松島・菖蒲島を橋でつなぐ中の島の遊歩道は段差が少なく、ベビーカーでも歩きやすい。ボートハウスでは手こぎボートや白鳥型の足こぎボートを借りられ、子どもと一緒に水の上から池を眺められる。広い芝生では小さな子どもものびのび動けるため、一日の起点として歩き疲れない時間を過ごしやすい。ボートの料金や営業時間は変動することがあるため、訪問前に公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/%C5%8Chori_Park_The_pergola_in_Matsushima_%C5%8Chori-k%C5%8Den_Ch%C5%AB%C5%8D-ku_Fukuoka_20260514.jpg/1280px-%C5%8Chori_Park_The_pergola_in_Matsushima_%C5%8Chori-k%C5%8Den_Ch%C5%AB%C5%8D-ku_Fukuoka_20260514.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄空港線 大濠公園駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "公園は入園無料（ボートは有料・変動あり）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外中心"
          },
          {
            "k": "おすすめ時間",
            "v": "午前（涼しい時間帯）"
          }
        ],
        "transit": "地下鉄大濠公園駅 徒歩約5分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "福岡市美術館",
        "cuisine": "美術館",
        "area": "福岡市中央区・大濠公園",
        "purpose": "昼前に立ち寄る。屋外彫刻と室内展示で休憩も兼ねる",
        "desc": "大濠公園の南西側に建つ、建築家・前川國男が設計した美術館で、2019年のリニューアルで公園側からのアプローチや園内を見渡すカフェが整えられ、子ども連れでも立ち寄りやすくなった。常設のコレクション展は比較的手ごろな料金で入りやすく、屋外には大きな彫刻が点在しているため、館内に入らずベンチで休みながら作品を眺めるだけでも気分が変わる。空調の効いた室内は、午前に屋外を歩いたあとの休憩スポットとしても向く。展示内容や開館時間、特別展の料金は時期で変わるため、訪問前に公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Fukuoka_art_museum.JPG/1280px-Fukuoka_art_museum.JPG"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄 大濠公園駅・六本松駅 徒歩約10分"
          },
          {
            "k": "料金",
            "v": "コレクション展 大人200円ほど（特別展別・変動あり）"
          },
          {
            "k": "雨の日",
            "v": "◎ 屋内中心"
          },
          {
            "k": "おすすめ時間",
            "v": "昼前（暑さ・雨の避難先に）"
          }
        ],
        "transit": "地下鉄大濠公園駅 徒歩約10分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "舞鶴公園（福岡城跡）",
        "cuisine": "城跡公園",
        "area": "福岡市中央区・城内",
        "purpose": "昼に芝生でお弁当。石垣をのぼって城跡を歩く",
        "desc": "黒田氏の居城だった福岡城の跡地に広がる公園で、大濠公園と隣り合い、石垣や櫓跡が残るなかに広い芝生広場が開けている。天守台跡などの高い場所からは市街を見渡せ、子どもにとっては石段をのぼる小さな冒険になる。広い芝生はレジャーシートを敷いてお弁当を広げるのに向き、走り回っても周囲を気にしにくい。陸上競技場内にはおむつ替えや授乳ができるスペースもあり、小さな子ども連れでも昼の長い休憩を取りやすい。園内は常時開放で入園無料だが、史跡の一部展示施設は開館時間が決まっているため、立ち寄る場合は公式情報を確認したい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Tamon-yagura_Turret_of_Fukuoka_Castle_Ruins_J%C5%8Dnai_Ch%C5%AB%C5%8D-ku_Fukuoka_City_20221018.jpg/1280px-Tamon-yagura_Turret_of_Fukuoka_Castle_Ruins_J%C5%8Dnai_Ch%C5%AB%C5%8D-ku_Fukuoka_City_20221018.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄 大濠公園駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "公園は入園無料"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外中心"
          },
          {
            "k": "おすすめ時間",
            "v": "昼（芝生でのお弁当に）"
          }
        ],
        "transit": "地下鉄大濠公園駅 徒歩約5分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "大濠公園日本庭園",
        "cuisine": "庭園",
        "area": "福岡市中央区・大濠公園",
        "purpose": "午後にひと休み。池泉回遊式の静かな庭をゆっくり歩く",
        "desc": "大濠公園開園50年を記念し、県民の文化遺産として1984年に設けられた築山林泉回遊式の庭園で、池を中心に滝や中島、枯山水や露地を一度に巡れるのが特徴だ。広い大濠公園の賑わいとは対照的に、塀の内側は静けさが保たれ、午後にひと休みしながら子どもに「静かに歩く」時間を体験させやすい。園路はよく整えられ、池のまわりをゆっくり回れる。一般・児童で料金が分かれ、65歳以上は無料。毎週月曜が休園（祝日の場合は翌日）で、6〜8月は閉園時間が延びるなど季節で変わるため、訪問前に公式サイトで開園日と時間を確認したい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/%C5%8Chori_Park_Loop_Path_The_path_near_%C5%8Chori_Park_Japanese_Garden_Park_%C5%8Chorik%C5%8Den_Ch%C5%AB%C5%8D-ku_Fukuoka_20260514.jpg/1280px-%C5%8Chori_Park_Loop_Path_The_path_near_%C5%8Chori_Park_Japanese_Garden_Park_%C5%8Chorik%C5%8Den_Ch%C5%AB%C5%8D-ku_Fukuoka_20260514.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄 大濠公園駅 徒歩約13分"
          },
          {
            "k": "料金",
            "v": "一般250円・児童120円ほど（変動あり）"
          },
          {
            "k": "休園",
            "v": "月曜（祝日の場合は翌日）"
          },
          {
            "k": "おすすめ時間",
            "v": "午後（静かな休憩に）"
          }
        ],
        "transit": "地下鉄大濠公園駅 徒歩約13分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "福岡市動植物園",
        "cuisine": "動物園",
        "area": "福岡市中央区・南公園",
        "purpose": "夕方に締めくくる。動物に会って一日を終える",
        "desc": "大濠公園エリアの南、南公園の丘陵地に広がる動物園と植物園が一体になった施設で、地下鉄七隈線でひと移動すれば子連れでも向かいやすい。段階的なリニューアルが進み、オランウータンとテナガザルを同じ空間で見られるアジア熱帯の渓谷エリアなど、近い距離で動物を観察できる展示が増えている。隣接する植物園には温室や花の見本園もあり、動物だけでなく緑も楽しめるのが一日の締めくくりに向く理由だ。中学生以下は入園無料で、家族での負担が軽い。入園は閉園の30分前までで、休園日や料金が変わることもあるため、訪問前に公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/a/ae/Fukuoka_zoo_entrance.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄七隈線 薬院大通駅 徒歩約15分"
          },
          {
            "k": "料金",
            "v": "大人600円ほど・中学生以下無料（変動あり）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外中心（温室は屋内）"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方（入園は閉園30分前まで）"
          }
        ],
        "transit": "地下鉄七隈線 薬院大通駅 徒歩約15分（バス約6分）"
      }
    ],
    "sideArticles": [
      {
        "t": "天神さんぽ5選。地下街と公園が混ざる福岡の中心",
        "h": "/feature/kyushu-tenjin-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/%E5%A4%A9%E7%A5%9E%E4%B8%AD%E5%A4%AE%E5%85%AC%E5%9C%92.JPG/1280px-%E5%A4%A9%E7%A5%9E%E4%B8%AD%E5%A4%AE%E5%85%AC%E5%9C%92.JPG"
      },
      {
        "t": "中洲・川端 食べ歩き5選。屋台と商店街をめぐる夜",
        "h": "/feature/kyushu-nakasu-kawabata-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Nakasu_Yatai_Stalls_%2819979437930%29.jpg/1280px-Nakasu_Yatai_Stalls_%2819979437930%29.jpg"
      }
    ],
    "quote": "池のほとりを歩き、芝生で寝転び、最後は動物に会う。大きな移動をしないまま、福岡・大濠で表情の違う一日をつなぐ。",
    "quoteCite": "マチノワ編集部",
    "closing": "朝は大濠公園駅で落ち合い、まずは大濠公園の池をベビーカーでゆっくり一周する。浮見堂をのぞき、ボートが浮かぶ水面を眺めながら歩くだけで子どもはご機嫌だ。昼前には池の南西側へ回り、福岡市美術館へ。屋外彫刻に触れ、室内のコレクション展で日差しを避けながらひと休みできる。お昼は隣接する舞鶴公園、福岡城跡の芝生にお弁当を広げ、食後は石垣をのぼって城跡の高低差を歩く。午後は池の北側に戻って大濠公園日本庭園へ。池泉回遊式の静かな景色のなかで、午前から動きづめだった足を一度落ち着かせるのにちょうどいい。締めくくりは地下鉄七隈線で薬院大通方面へ移動し、福岡市動植物園へ。動物に会って一日を終える流れだ。屋外の場所が多いぶん、夏場は帽子と水分、着替えがあると一日を通して楽になる。日本庭園や動植物園は休園日が設けられているので、訪ねる曜日だけは事前に確かめておきたい。雨なら屋外の舞鶴公園や庭園は短めに切り上げ、福岡市美術館の滞在を厚くするほうが、子どもも大人もくたびれずに済む。"
  },
  "kyushu-dazaifu-walk": {
    "id": "kyushu-dazaifu-walk",
    "no": "KY-04",
    "articleType": "guide",
    "kicker": "DAZAIFU",
    "title": "太宰府、参道から山あいの社まで歩く一日。梅ヶ枝餅の湯気から縁結びの杜へ",
    "titleHTML": "太宰府、参道から山あいの社まで歩く一日。<br>梅ヶ枝餅の湯気から縁結びの杜へ",
    "subtitle": "焼きたての餅の匂いに迎えられる表参道から、天満宮の楼門、四王寺山の麓のガラス張りの博物館、枯山水の石庭、そして宝満山に抱かれた竈門神社へ。学問の神さまの門前町を、足の向くままにたどった記録。",
    "lede": "西鉄太宰府駅の改札を出ると、もう香ばしい匂いが鼻先をかすめる。焼きたての梅ヶ枝餅だ。表参道は朝から人の声でほどよくにぎわい、軒先の鉄板で次々と餅が焼かれては、白い湯気を立てている。福岡市の中心から電車でほんの40分。けれど参道に一歩入った途端、空気がふっと門前町のそれに変わる。菅原道真公を祀る太宰府天満宮を中心に、古社も国立博物館も駅から半径1.5kmほどの圏内にまとまっていて、急がなければ半日かけて歩いてまわれる。私はこの日、餅を片手に参道を抜け、本殿に手を合わせ、山の麓の博物館へ上がり、石庭で息をつき、最後に山あいの杜まで足を延ばした。にぎわいから静けさへ、平地から山へ。一歩ごとに表情を変えていく町を、その順にたどっていく。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/20100719_Dazaifu_Tenmangu_Shrine_3328.jpg/1280px-20100719_Dazaifu_Tenmangu_Shrine_3328.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "太宰府天満宮表参道",
        "cuisine": "参道・商店街",
        "area": "太宰府市宰府・表参道",
        "purpose": "午前に歩く。梅ヶ枝餅を片手に天満宮へ向かう",
        "desc": "西鉄太宰府駅の改札を出てすぐ、天満宮の鳥居まで続く約250mの参道に、梅ヶ枝餅店やみやげ店、茶房が軒を連ねる。名物の梅ヶ枝餅は、道真公が愛した梅にちなむ薄い焼き餅で、参道沿いの多くの店が店先で焼きたてを売る(1個およそ130円・変動あり)。歩く楽しみのひとつが、参道の中ほどに立つ隈研吾氏設計のスターバックス太宰府天満宮表参道店で、約2,000本の杉材を斜めに組んだ木のトンネルのような店内が、伝統と現代を結ぶ門前町らしい一軒になっている。焼きたてを食べ歩きしながらゆっくり進むのがこの参道のおすすめの過ごし方だ。価格や営業は店ごとに異なり変動もあるため、気になる店は店頭で確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/%E5%A4%AA%E5%AE%B0%E5%BA%9C%E5%A4%A9%E6%BA%80%E5%AE%AE%E8%A1%A8%E5%8F%82%E9%81%93-IMGP1882b.JPG/1280px-%E5%A4%AA%E5%AE%B0%E5%BA%9C%E5%A4%A9%E6%BA%80%E5%AE%AE%E8%A1%A8%E5%8F%82%E9%81%93-IMGP1882b.JPG"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "西鉄太宰府駅 徒歩約1分"
          },
          {
            "k": "料金",
            "v": "散策自由(梅ヶ枝餅1個約130円・変動あり)"
          },
          {
            "k": "雨の日",
            "v": "○ 軒先・茶房で雨宿り可"
          },
          {
            "k": "おすすめ時間",
            "v": "午前(混雑前)"
          }
        ],
        "transit": "西鉄太宰府駅 徒歩約1分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "太宰府天満宮",
        "cuisine": "神社",
        "area": "太宰府市宰府・天満宮",
        "purpose": "参道を抜けて参拝。学問の神さまへ手を合わせる",
        "desc": "菅原道真公を祀り、全国天満宮の総本宮のひとつとして知られる、太宰府散歩の中心となる社。心字池にかかる三つの太鼓橋を渡って楼門をくぐる参道の構えが美しく、本殿前の御神木「飛梅」は、道真公を慕って京から一夜で飛んできたという伝承で名高い。御本殿は124年ぶりの大改修を経て2026年5月に参拝が再開されており、参道から本殿へと続く境内の流れをあらためてたどれる。受験や学業成就を願う参拝者が多く、絵馬やお守りを求める人で休日はにぎわう。境内の散策・参拝は無料だが、宝物殿などは別途拝観料がかかる。改修や行事の状況は変わることがあるため、訪問前に公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/20100719_Dazaifu_Tenmangu_Shrine_3328.jpg/1280px-20100719_Dazaifu_Tenmangu_Shrine_3328.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "西鉄太宰府駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "境内参拝無料(宝物殿等は別途・変動あり)"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外の参道・境内が中心"
          },
          {
            "k": "おすすめ時間",
            "v": "午前〜昼"
          }
        ],
        "transit": "西鉄太宰府駅 徒歩約5分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "九州国立博物館",
        "cuisine": "博物館",
        "area": "太宰府市石坂・四王寺山麓",
        "purpose": "昼に見学。日本とアジアの交流史を巨大な館でたどる",
        "desc": "太宰府天満宮の裏手から、虹色に光るトンネルと長いエスカレーターを上った先に建つ、日本で4番目に開館した国立博物館。山並みに溶け込むよう設計された蒲鉾型の大屋根とガラス張りの外観が印象的で、四王寺山の緑を背に大きくたわむシルエットそのものが見どころになっている。常設にあたる文化交流展では、旧石器時代から近世まで、日本文化が海を越えたアジアとの交流のなかで育まれてきた歩みを通史でたどれる。天満宮の参拝とトンネルで直結しているため、参道見学からそのまま上がってこられる動線の良さも魅力だ。文化交流展は観覧料が必要で、月曜休館(祝日の場合は翌平日)・9:30開館で入館は閉館の30分前まで。観覧料や特別展の有無は変わることがあるため公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Gate_of_Kyushu_National_Museum_near_Dazaifu_Amusement_Park.JPG/1280px-Gate_of_Kyushu_National_Museum_near_Dazaifu_Amusement_Park.JPG"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "西鉄太宰府駅 徒歩約10分"
          },
          {
            "k": "料金",
            "v": "文化交流展700円ほか(変動あり・公式確認)"
          },
          {
            "k": "営業",
            "v": "9:30〜17:00(入館16:30まで)/月曜休"
          },
          {
            "k": "雨の日",
            "v": "◎ 館内で完結"
          }
        ],
        "transit": "西鉄太宰府駅 徒歩約10分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "光明禅寺",
        "cuisine": "寺院・庭園",
        "area": "太宰府市宰府・参道周辺",
        "purpose": "午後に立ち寄る。枯山水の石庭で一息つく",
        "desc": "太宰府天満宮の参道からほど近く、鎌倉時代に菅原家ゆかりの僧によって創建されたと伝わる禅寺。「仏光石庭」と呼ばれる前庭は、白砂と石組みで光の字をかたどったと言われる枯山水で、にぎやかな参道のすぐそばとは思えない静けさに包まれている。後庭の「一滴海庭」とともに、近代日本を代表する作庭家・重森三玲の手によるとされ、苔と紅葉が季節ごとに表情を変えるため、秋には紅葉の彩りでも親しまれてきた。ただし境内の改修や法要などにより拝観を停止する期間があり、拝観できるのは公開時期に限られることが多い。参道の食べ歩きと社寺参りの合間に庭を眺めて一息つけるが、拝観の受け入れ状況や公開時期・時間・料金は変わることがあるため、立ち寄る前に必ず最新情報の確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/20100719_Dazaifu_Komyozenji_Temple_3246.jpg/1280px-20100719_Dazaifu_Komyozenji_Temple_3246.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "西鉄太宰府駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "拝観料の目安あり(公開時期限定・要事前確認)"
          },
          {
            "k": "雨の日",
            "v": "○ 雨の庭も風情があるが要確認"
          },
          {
            "k": "おすすめ時間",
            "v": "午後・新緑/紅葉期"
          }
        ],
        "transit": "西鉄太宰府駅 徒歩約5分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "宝満宮 竈門神社",
        "cuisine": "神社",
        "area": "太宰府市内山・宝満山麓",
        "purpose": "夕方に参る。山あいの社で縁結びを願う",
        "desc": "太宰府の北東、宝満山のふもとに鎮座する古社で、縁結び・方除け・厄除けの神さまとして親しまれている。表参道のにぎわいとは対照的に、木立に包まれた境内は静かで、晴れた日には展望舎から太宰府の街並みを見渡せる。デザイナーが手がけた洗練された授与所や、色とりどりのお守りも知られ、良縁を願う参拝者が足を運ぶ。秋の紅葉、春の新緑と四季の彩りが豊かなのも、山あいに建つこの社ならではだ。駅からは徒歩だと約2km・約40分かかるため、太宰府駅前(福岡銀行太宰府支店前)のバス停から発着するコミュニティバス「まほろば号」で終点「内山」下車(約10分・運賃100円ほど)、降りてすぐが境内だ。参拝時間やバスの運行は季節で変わるので、戻りの時刻まで含めて事前に確認しておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Kamado_shrine_01.JPG/1280px-Kamado_shrine_01.JPG"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "西鉄太宰府駅+まほろば号 約10分"
          },
          {
            "k": "料金",
            "v": "参拝無料(バス運賃約100円・変動あり)"
          },
          {
            "k": "雨の日",
            "v": "✕ 屋外参拝が中心"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方/紅葉・新緑期"
          }
        ],
        "transit": "西鉄太宰府駅からバス約10分+徒歩すぐ"
      }
    ],
    "sideArticles": [
      {
        "t": "天神さんぽ5選。地下街と公園が混ざる福岡の中心",
        "h": "/feature/kyushu-tenjin-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/%E5%A4%A9%E7%A5%9E%E4%B8%AD%E5%A4%AE%E5%85%AC%E5%9C%92.JPG/1280px-%E5%A4%A9%E7%A5%9E%E4%B8%AD%E5%A4%AE%E5%85%AC%E5%9C%92.JPG"
      },
      {
        "t": "中洲・川端 食べ歩き5選。屋台と商店街をめぐる夜",
        "h": "/feature/kyushu-nakasu-kawabata-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Nakasu_Yatai_Stalls_%2819979437930%29.jpg/1280px-Nakasu_Yatai_Stalls_%2819979437930%29.jpg"
      }
    ],
    "quote": "焼きたての餅の匂いから、楼門、ガラスの大屋根、苔むす石庭、そして山の杜まで。太宰府はひと続きの道の上で、にぎわいと静けさをゆっくり入れ替えていく。",
    "quoteCite": "マチノワ編集部",
    "closing": "朝、表参道で焼きたての梅ヶ枝餅を一つ求め、外側のぱりっとした皮と中の餡の温かさを味わいながらゆっくり歩き出す。店々を眺めるうちに参道は自然と太宰府天満宮へとつながり、楼門をくぐって本殿へ。学問の神さまに手を合わせ、境内の梅の木の下をしばらく歩く。それから本殿の裏手にまわると、トンネルと長いエスカレーターが現れて、四王寺山の麓に建つ九州国立博物館へと運んでくれる。ガラスの大屋根に覆われた巨大な館で、日本とアジアが行き交ってきた長い時間を展示にたどっていると、外の喧噪がすっと遠ざかる。昼は館内や参道で軽くとり、来た道を下る途中で光明禅寺に立ち寄った。枯山水の石庭に向かって縁側に座れば、苔と石だけの静けさが午後の体にちょうどいい。最後は駅前の福岡銀行太宰府支店前からコミュニティバス「まほろば号」に乗り、終点の内山で降りて宝満宮 竈門神社へ。歩けば約2km・40分の山道だから、バスの時刻は先に控えておくと安心だ。宝満山を背にした木立の中の社で縁結びを願い、夕方の風に当たって一日を閉じる。歩いてみてあらためて思うのは、この町が一本の道の上でにぎわいと静けさを行き来させてくれることだった。雨の日なら、屋根のない竈門神社は別の日に譲り、その分博物館の館内をゆっくり見て、参道の茶房やスターバックス太宰府天満宮表参道店で雨宿りをかねて休めばいい。なお、九州国立博物館は月曜が休みで(祝日なら翌平日)朝は9:30から、光明禅寺は法要や改修で拝観できない時期もある。拝観の可否や料金、開いている時間は移ろいやすいので、出かける前に各施設の公式情報にひと目通しておくと、足取りが軽くなる。"
  },
  "kyushu-kagoshima-tenmonkan": {
    "id": "kyushu-kagoshima-tenmonkan",
    "no": "KY-05",
    "articleType": "guide",
    "kicker": "KAGOSHIMA SAKURAJIMA",
    "title": "鹿児島・天文館＆桜島、火山を見上げる一日。湯之平から城山の眺めまで",
    "titleHTML": "鹿児島・天文館＆桜島、火山を見上げる一日。<br>湯之平から城山の眺めまで",
    "subtitle": "桜島フェリーで対岸へ渡り、湯之平展望所で北岳を仰ぐ。仙巌園は桜島を借景に、城山展望台はその全身を一枚に収める。錦江湾を行き来しながら、活火山という一つの主役を角度を変えて眺める鹿児島市の歩き方。",
    "lede": "鹿児島の街では、どこを歩いていても視界の端に桜島がいる。アーケードを抜けた先にも、庭園の松の向こうにも、展望台の手すりの正面にも、噴煙をたなびかせた火山が当たり前のように立っている。この街の観光は、名所をいくつ回ったかよりも、その一つの山をどれだけ近くから、どれだけ違う角度から眺められたかで印象が決まる。だから今回は、火山を「見上げる」「借景に置く」「全身で見渡す」という眺め方の変化を軸に組み立てた。まず桜島フェリーの甲板で海越しに島へ近づき、湯之平展望所では北岳の山肌を真下から仰ぐ。市街へ戻れば仙巌園が島津家の庭の向こうに桜島を据え、城山展望台が市街・錦江湾・火山をまとめて一枚に収める。最後は天文館商店街で、その火山灰の大地が育てた黒豚や白熊にたどり着く。海を一度渡るだけで、桜島の表情はこれだけ移り変わる。なお桜島は活火山で、噴火警戒レベルや風向き次第で立入規制や降灰が出る。運賃や拝観料、運航・営業の時間も折々に見直されるので、出かける前にひと手間、各施設の公式情報に目を通しておくと安心だ。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Sakurajima_from_Yunohira_Tenbojo.jpg/1280px-Sakurajima_from_Yunohira_Tenbojo.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "湯之平展望所",
        "cuisine": "展望所",
        "area": "鹿児島市・桜島",
        "purpose": "午前に登る。桜島の北岳を間近に見上げる",
        "desc": "湯之平展望所は桜島・北岳の四合目、標高373mに位置し、一般の人が立ち入れる桜島の最高地点とされる展望所だ。ここならではなのは、対岸の市街地から海越しに眺める桜島ではなく、ゴツゴツとした溶岩の山肌と噴煙を真下から見上げる距離感で、火山の上に立っていることを体で実感できる点にある。展望所からは振り返れば錦江湾と鹿児島市街も望め、火山と街を一望に収められる。桜島港からは循環バス「サクラジマアイランドビュー」で乗り換えなしに行くことができ、展望所では数分間の停車時間が設けられている。噴火警戒レベルや風向きにより立入や降灰の状況が変わるため、運行状況や規制情報は訪問前に公式サイトで確認しておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Sakurajima_from_Yunohira_Tenbojo.jpg/1280px-Sakurajima_from_Yunohira_Tenbojo.jpg"
        ],
        "specs": [
          {
            "k": "最寄り",
            "v": "桜島港から周遊バスで約40分"
          },
          {
            "k": "料金",
            "v": "展望所は無料／周遊バス1日券あり（変動あり）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外・降灰や視界に注意"
          },
          {
            "k": "おすすめ時間",
            "v": "午前（光が山肌に回る時間帯）"
          }
        ],
        "transit": "桜島港バス停 サクラジマアイランドビューで約40分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "仙巌園",
        "cuisine": "大名庭園",
        "area": "鹿児島市・吉野町",
        "purpose": "昼すぎに歩く。桜島を借景にした島津家の庭を巡る",
        "desc": "仙巌園は、薩摩藩主・島津家の別邸として築かれた大名庭園で、磯庭園の別名でも知られる。最大の見どころは、錦江湾を池に、桜島を築山に見立てた雄大な借景で、庭の正面に本物の火山がそびえる構図はほかの庭園では味わえない。園内には御殿や、世界文化遺産「明治日本の産業革命遺産」の構成資産にも関わる尚古集成館が隣接し、近代日本の工業化に取り組んだ薩摩の歴史にも触れられる。拝観券は仙巌園・尚古集成館・御殿のセット券での販売となっており、ゆっくり回るなら2時間ほどみておきたい。カゴシマシティビューや路線バスの「仙巌園前」下車すぐとアクセスしやすい。営業時間や入園料は変更されることがあるため、訪問前に公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Sakurajima_from_Sengan-en.jpg/1280px-Sakurajima_from_Sengan-en.jpg"
        ],
        "specs": [
          {
            "k": "最寄り",
            "v": "「仙巌園前」バス停 下車すぐ"
          },
          {
            "k": "料金",
            "v": "セット券 大人1,600円ほど（変動あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "△ 庭園は屋外・御殿は屋内で見学可"
          },
          {
            "k": "営業",
            "v": "9:00〜17:00（変動あり・公式確認）"
          }
        ],
        "transit": "「仙巌園前」バス停 下車すぐ"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "城山展望台",
        "cuisine": "展望台",
        "area": "鹿児島市・城山町",
        "purpose": "夕方前に立つ。市街・錦江湾・桜島を一枚に収める",
        "desc": "城山展望台は、市街地の中心にそびえる標高107mの城山にある展望台だ。ここならではなのは、足元に広がる鹿児島市街、その先の錦江湾、対岸の桜島という三つの要素が一つのフレームにきれいに収まる構図で、湾を行き交うフェリーまで見渡せる。城山一帯は西南戦争最後の激戦地でもあり、周辺には西郷洞窟など史跡が点在し、展望のついでに歴史散策も楽しめる。展望台までは自然遊歩道を歩いて登るルートのほか、鹿児島中央駅からカゴシマシティビュー等のバス便で「城山」下車すぐと向かいやすい。夕暮れ時には市街地に灯がともり、桜島のシルエットが浮かぶ時間帯も美しい。展望台自体は屋外のため、天候や風の強い日は足元と服装に注意したい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/View_of_Sakurajima_from_Shiroyama_Park_Observatory_-_Jan_27%2C_2010.jpg/1280px-View_of_Sakurajima_from_Shiroyama_Park_Observatory_-_Jan_27%2C_2010.jpg"
        ],
        "specs": [
          {
            "k": "最寄り",
            "v": "「城山」バス停 下車すぐ"
          },
          {
            "k": "料金",
            "v": "展望台は無料・駐車場あり"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外・視界が悪い日は眺望が限られる"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方前（街と桜島が見やすい時間帯）"
          }
        ],
        "transit": "「城山」バス停 下車すぐ／鹿児島中央駅からシティビュー約25分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "天文館商店街",
        "cuisine": "商店街",
        "area": "鹿児島市・東千石町",
        "purpose": "夕方に歩く。アーケードで郷土グルメと土産をまとめて",
        "desc": "天文館は南九州を代表する繁華街で、複数の通りにアーケードが連なる商店街だ。ここならではなのは、桜島の降灰や強い日差し、雨を避けるためにアーケードが発達してきた背景で、天候を気にせず食べ歩きや買い物を楽しめる点にある。黒豚とんかつやしゃぶしゃぶ、かごしまラーメン、そして夏の名物として知られる「白熊」と呼ばれるかき氷など、鹿児島の郷土グルメが一帯に集まり、土産物店やカフェも揃う。一日の締めくくりに立ち寄れば、夕食と土産選びをまとめて済ませられる。電停「天文館通」を降りてすぐと交通の便もよく、城山展望台や港側からのバス・市電でアクセスしやすい。各店の営業時間や定休日は変わるため、目当ての店は事前に確認しておくと安心だ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/G3_Arcade_of_Temmonkan_Shopping_Street_at_night.jpg/1280px-G3_Arcade_of_Temmonkan_Shopping_Street_at_night.jpg"
        ],
        "specs": [
          {
            "k": "最寄り",
            "v": "市電「天文館通」電停 下車すぐ"
          },
          {
            "k": "用途",
            "v": "郷土グルメ・夕食・土産選び"
          },
          {
            "k": "雨の日",
            "v": "◎ アーケードで濡れずに回れる"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方〜夜（夕食と食べ歩き）"
          }
        ],
        "transit": "市電「天文館通」電停 下車すぐ"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "桜島フェリー",
        "cuisine": "フェリー・ウォーターフロント",
        "area": "鹿児島市・本港新町",
        "purpose": "朝に渡る。甲板から桜島へ近づく15分の航路",
        "desc": "桜島フェリーは、鹿児島港と桜島港を約15分で結ぶ市営の航路で、一日の起点になる。ここならではなのは、料金が手頃で本数も多く、甲板に立っているうちに桜島がぐんぐん近づいてくる短い船旅そのものが観光になる点だ。船内では名物のうどんを味わえる便もあり、海越しに市街地と桜島の両方を眺められる。発着する鹿児島港側のウォーターフロントには、いおワールドかごしま水族館やウォーターフロントパークが隣接し、海と桜島を望む散策スポットがまとまっている。市電「水族館口」電停からは徒歩約6〜8分で乗り場へ向かえる。運航時間は2025年に見直されており、ダイヤや運賃は変更されることがあるため、訪問前に公式サイトで確認しておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/20100721_Sakurajima_Ferry_4243.jpg/1280px-20100721_Sakurajima_Ferry_4243.jpg"
        ],
        "specs": [
          {
            "k": "最寄り",
            "v": "市電「水族館口」電停 徒歩約6〜8分"
          },
          {
            "k": "料金",
            "v": "片道は手頃な運賃（桜島港で支払い・変動あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "○ 船内・ターミナルは屋根あり"
          },
          {
            "k": "おすすめ時間",
            "v": "朝（桜島へ渡る一日の起点に）"
          }
        ],
        "transit": "市電「水族館口」電停 徒歩約6〜8分"
      }
    ],
    "sideArticles": [
      {
        "t": "難波・道頓堀 食べ歩き5選。グリコサインから法善寺横丁まで",
        "h": "/feature/kansai-namba-dotonbori-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Neon_sign_of_Dotonbori_daytime.JPG"
      },
      {
        "t": "新世界・通天閣 観光5選。レトロな下町を歩く半日",
        "h": "/feature/kansai-shinsekai-tsutenkaku",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Tsutenkaku%2C_Osaka.jpg/1280px-Tsutenkaku%2C_Osaka.jpg"
      }
    ],
    "quote": "桜島は遠くから眺める一枚の絵ではなく、近づくほど表情を変える、この街の生きた主役だ。",
    "quoteCite": "マチノワ編集部",
    "closing": "朝は鹿児島港から桜島フェリーに乗る。わずか十五分の航路だが、甲板に出て海風を受けるうち、ぼんやり霞んでいた山肌の谷筋や噴煙の動きまでが見えてくる。対岸に着いたら湯之平展望所へ。北岳の真下に立つと、火山は風景というより頭上にのしかかる質量で、見上げた首がしばらく下りない。昼すぎにフェリーで市街へ戻り、仙巌園を歩く。ここでは桜島が借景になり、島津家の庭石や松越しに、さっき真下から見上げた山が今度は穏やかな絵の一部として収まっている。夕方前には城山展望台へ。市街地と錦江湾、そして桜島の全身が一枚におさまり、午前に近づき午後に借景で眺めた火山を、最後に全体像として見届ける格好になる。日が傾いたら天文館商店街のアーケードへ降りていく。火山灰の降る土地で育った黒豚、夏なら白熊のかき氷、土産物までを屋根の下でまとめて楽しめるので、降灰や雨の日の締めくくりにも向く。屋外の展望が中心の一日だから、風の通る甲板や展望台では一枚羽織れるものがあると過ごしやすい。桜島がどう見えるかは、その日の天気と火山の機嫌しだい。だからこそ何度訪れても、同じ景色には出会わない。"
  },
  "hokkaido-sapporo-odori-walk": {
    "id": "hokkaido-sapporo-odori-walk",
    "no": "HK-01",
    "articleType": "guide",
    "kicker": "SAPPORO ODORI WALK",
    "title": "札幌の中心を歩く朝さんぽ。二条市場の湯気からテレビ塔の眺めへ",
    "titleHTML": "札幌の中心を歩く朝さんぽ。<br>二条市場の湯気からテレビ塔の眺めへ",
    "subtitle": "二条市場で朝食をとり、大通公園の緑をたどって時計台と赤れんが庁舎をめぐり、最後にさっぽろテレビ塔へ。碁盤の目の中心を、足の向くまま歩いた半日の記録。",
    "lede": "朝の創成川沿いは、空気がまだ冷たく澄んでいる。二条市場の路地に入ると、湯気と威勢のいい声、氷の上で光る魚介の匂いがいっぺんに押し寄せてきて、ここで一日が始まるのだと体が分かる。札幌の都心は碁盤の目に整っていて、歩くほどに角ごとの景色が切り替わっていく。市場の活気から大通公園の緑、明治のレンガ、そして塔の上の眺めへ——性格のちがう表情が徒歩圏に折り重なっているのが、この街の中心を歩く面白さだ。海鮮丼の一杯から始めて、足の向くまま西へ、そして空へと上がっていく。市場の店じまいは早く、料金や開いている時間もその日その日で動くから、出かける前に各施設の公式で軽くたしかめておくと安心して歩ける。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Former_Hokkaido_Government_Office_Building_%28Red_Brick_Office%29.jpg/1280px-Former_Hokkaido_Government_Office_Building_%28Red_Brick_Office%29.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "二条市場",
        "cuisine": "市場",
        "area": "札幌市中央区・南三条東",
        "purpose": "朝いちに立ち寄る。海鮮丼で一日を始める",
        "desc": "創成川のすぐ東に並ぶ二条市場は、鮮魚店や乾物店に混じって海鮮丼を出す食堂が軒を連ねる、札幌都心で朝食から動き出せる数少ない場所だ。カニ・ウニ・イクラを盛った丼は1,000円台の手頃なものから豪華なものまで幅があり、丼の店は朝8時前から開く一方で昼過ぎには閉める店も多い。だからこのコースでは、まだ街が動き出す前の時間に市場へ入り、北の海の幸で胃を満たしてから歩き始める順番にしている。場内は通路が狭く活気があるので、混む前の早い時間が落ち着いて選べる。最寄りは地下鉄東西線バスセンター前駅で徒歩約3分、大通駅からも徒歩約7分の徒歩圏だ。価格や営業時間は店ごとに異なり変動もあるため、訪問前に各店や市場の情報で確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Nijo_fish_Market_2014.jpg/1280px-Nijo_fish_Market_2014.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄バスセンター前駅 徒歩約3分／大通駅 徒歩約7分"
          },
          {
            "k": "営業",
            "v": "おおむね7:00〜17:00（店舗で異なる）"
          },
          {
            "k": "雨の日",
            "v": "○ アーケード・店内中心"
          },
          {
            "k": "おすすめ時間",
            "v": "朝（開店〜午前）"
          }
        ],
        "transit": "地下鉄バスセンター前駅 徒歩約3分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "大通公園",
        "cuisine": "公園・緑地",
        "area": "札幌市中央区・大通西",
        "purpose": "緑の遊歩道を西へ歩く。噴水とブロンズ像を眺める",
        "desc": "札幌の都心を東西に約1.5kmにわたって貫く大通公園は、碁盤の目状の市街を南北に分ける緑の帯で、この散歩コースの背骨にあたる。芝生と花壇、噴水、ベンチが連なり、園内にはブロンズ彫刻や記念碑も点在していて、歩くだけで季節の移ろいや街の歴史に触れられる。夏はとうきびワゴン、冬は雪まつりやイルミネーションの会場になるなど、時期ごとに表情が大きく変わるのも、この緑地帯ならではの面白さだ。市場から創成川を渡ってそのまま西へ入れる動線なので、朝食後の腹ごなしを兼ねて遊歩道を歩くのにちょうどよい。屋外のため、天候と季節に合わせた服装で楽しみたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/e/ea/Odori_Park_in_Sapporo_1936.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄大通駅 徒歩約1分／西11丁目駅すぐ"
          },
          {
            "k": "料金",
            "v": "無料（自由散策）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外の遊歩道"
          },
          {
            "k": "おすすめ時間",
            "v": "午前〜日中"
          }
        ],
        "transit": "地下鉄大通駅 徒歩約1分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "札幌市時計台",
        "cuisine": "歴史的建造物",
        "area": "札幌市中央区・北一条西",
        "purpose": "演武場を見学する。開拓期の札幌に触れる",
        "desc": "正式には旧札幌農学校演武場と呼ばれるこの建物は、北海道大学の前身・札幌農学校の演武場として明治期に建てられた、国指定重要文化財だ。白い下見板張りの外観と屋根上の時計塔が、周囲のビル街のなかでひときわ目を引く。館内は1階・2階が公開され、時計塔の機械の仕組みや開拓期の札幌の歩みを伝える展示が並ぶので、外から眺めるだけでなく中に入って成り立ちを知ると印象が深まる。大通公園からも赤れんが庁舎からも近い位置にあり、緑地帯の散策と歴史建築見学を無理なくつなげられる。閉館は17:10ごろで最終入館はその手前のため、午前から昼にかけて立ち寄っておきたい。観覧料や開館時間は変わることがあるため、訪問前に公式情報で確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/2/25/Sapporo_Clock_Tower_Hokkaido_Japan_2.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄大通駅 徒歩約5分（市役所側出口）"
          },
          {
            "k": "料金",
            "v": "観覧料 大人200円（変動あり）"
          },
          {
            "k": "雨の日",
            "v": "◎ 屋内見学中心"
          },
          {
            "k": "おすすめ時間",
            "v": "午前〜昼"
          }
        ],
        "transit": "地下鉄大通駅 徒歩約5分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "北海道庁旧本庁舎（赤れんが庁舎）",
        "cuisine": "歴史的建造物",
        "area": "札幌市中央区・北三条西",
        "purpose": "前庭とレンガの館を見る。展示で北海道の歩みをたどる",
        "desc": "「赤れんが庁舎」の愛称で親しまれるこのアメリカ風ネオ・バロック様式の建物は、約5年に及ぶ大規模改修を経て2025年7月にリニューアル公開された、札幌都心を代表する歴史建築だ。約250万個ともいわれるレンガを積んだ重厚な外観に加え、館内は地域情報やショップ・カフェのフロア、北海道の歴史文化を伝える展示フロアなどに生まれ変わった。中央の八角塔の内部見学が有料オプションとして公開された点も、改修後ならではの見どころだ。手入れされた前庭の池に建物が映る景色は、このコースで絵になる眺めのひとつ。入館料や八角塔の公開時間は変更され得るため、訪問前に公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Former_Hokkaido_Government_Office_Building_%28Red_Brick_Office%29.jpg/1280px-Former_Hokkaido_Government_Office_Building_%28Red_Brick_Office%29.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR札幌駅 徒歩約8分／地下鉄大通駅 徒歩約8分"
          },
          {
            "k": "料金",
            "v": "入館 一般300円ほか（八角塔は別途・変動あり）"
          },
          {
            "k": "雨の日",
            "v": "○ 館内展示中心"
          },
          {
            "k": "おすすめ時間",
            "v": "昼前後"
          }
        ],
        "transit": "JR札幌駅 徒歩約8分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "さっぽろテレビ塔",
        "cuisine": "展望台",
        "area": "札幌市中央区・大通西",
        "purpose": "最後に登る。塔上から大通公園と街並みを見渡す",
        "desc": "大通公園の東端に立つさっぽろテレビ塔は、地上約90mの展望台から、西へ一直線に伸びる緑地帯と碁盤の目の市街を一望できる、このエリアの締めくくりにふさわしいランドマークだ。展望台からは大通公園の全景が真下に広がり、これまで歩いてきた道筋を上から振り返れるのがこのスポットならではの楽しみ方になる。晴れた日には遠く山並みまで見渡せ、日没後は街の灯りが碁盤の目に沿って広がる夜景も楽しめる。展望台の最新の料金や営業時間、イベントによる変更は公式サイトで確認しておきたい。コースの最後にここへ登れば、歩いた一日を眺めとともに締めくくれる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/%E3%81%95%E3%81%A3%E3%81%BD%E3%82%8D%E3%83%86%E3%83%AC%E3%83%93%E5%A1%94%EF%BC%88Sapporo_tv_Tower%EF%BC%89_-_panoramio.jpg/1280px-%E3%81%95%E3%81%A3%E3%81%BD%E3%82%8D%E3%83%86%E3%83%AC%E3%83%93%E5%A1%94%EF%BC%88Sapporo_tv_Tower%EF%BC%89_-_panoramio.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄大通駅 徒歩約5分"
          },
          {
            "k": "料金",
            "v": "展望台 大人1,200円（変動あり）"
          },
          {
            "k": "雨の日",
            "v": "○ 展望は屋内"
          },
          {
            "k": "おすすめ時間",
            "v": "昼〜夕方・夜景"
          }
        ],
        "transit": "地下鉄大通駅 徒歩約5分"
      }
    ],
    "sideArticles": [
      {
        "t": "すすきの夜景デート5選。展望台とネオンの街を歩く",
        "h": "/feature/hokkaido-susukino-night-date",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Nakajima_Park_Sapporo03bs5s4272.jpg/1280px-Nakajima_Park_Sapporo03bs5s4272.jpg"
      },
      {
        "t": "小樽運河デート5選。ガス灯と硝子の街を歩く",
        "h": "/feature/hokkaido-otaru-canal-date",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Otaru_Canal_HDR1.jpg/1280px-Otaru_Canal_HDR1.jpg"
      }
    ],
    "quote": "朝の海鮮丼で温まった体のまま、緑の遊歩道を西へ。レンガの重みに少し背筋が伸びて、最後は塔の上で札幌をひと目に収める。歩いてつないだ、半日の中心。",
    "quoteCite": "マチノワ編集部",
    "closing": "二条市場でほかほかの海鮮丼をかき込み、丼の温もりが残るうちに創成川を渡る。大通公園に入ると視界がふっと開けて、噴水の音とブロンズ像を横目に、緑の遊歩道をただ西へ西へと歩いた。日差しが心地よくて、つい足が止まる。公園を抜けて札幌市時計台へ。演武場のなかは思いのほか静かで、開拓期の札幌が板張りの床から立ちのぼってくるようだった。そこから北へ少し進むと、木立の奥に赤れんが庁舎が現れる。前庭でレンガの館を見上げ、展示をたどって北海道の歩んだ時間に触れると、市場の賑わいとはまた別の、どっしりした手応えが残った。最後は大通公園の東端へ引き返し、さっぽろテレビ塔に登る。さっきまで歩いていた緑の帯がまっすぐ西へ伸び、碁盤の目の街並みが足もとに広がっていて、自分の半日の道のりがそのまま地図になって見えた。市場の湯気から塔の上の眺めまで、ほとんど平坦な道を一筆書きにたどっただけなのに、ずいぶん遠くまで来た気がする。屋外を歩く区間が長いぶん、冬の凍った路面や寒さには一枚多めの上着で備えたい。雨や雪の日は遊歩道を短めに切り上げ、屋内の時計台と赤れんが庁舎、テレビ塔の展望を軸に、地下街を伝って歩けばいい。開いている時間や入館の条件は変わることもあるので、念のため公式で最新をのぞいてから出かけるのをおすすめしたい。"
  },
  "hokkaido-susukino-night-date": {
    "id": "hokkaido-susukino-night-date",
    "no": "HK-02",
    "articleType": "guide",
    "kicker": "SUSUKINO NIGHT DATE",
    "title": "すすきの、灯りを継いで歩く夜のデート。展望台からネオン、そして山頂へ",
    "titleHTML": "すすきの、灯りを継いで歩く夜のデート。<br>展望台からネオン、そして山頂へ",
    "subtitle": "JRタワーT38で街が暮れる瞬間を見て、テレビ塔から大通公園の灯りを正面に。すすきの交差点のネオンを抜け、藻岩山の大夜景へ上り、最後は中島公園の水辺で静かに息を整える夜。",
    "lede": "日が落ちかけた札幌駅前で、まず空の色が変わっていく。JRタワー展望室T38は地上約160m、窓の向こうで碁盤の目の街がひとつ、またひとつと窓灯りをともしていく瞬間を、ふたりで黙って眺めるのにちょうどいい高さだ。札幌中央区は札幌駅から大通、すすきのへと南北にまっすぐ通りが伸びていて、夜の見どころがその軸の上に素直に並ぶ。だからこの夜は、難しい乗り換えを考えずに灯りを継いで歩いていける。高い場所から街を見おろし、地上に降りてネオンの下を歩き、また高い場所へ上る——視点の高さを行き来するほど、同じ札幌の夜が違う表情で立ち上がってくる。終盤の藻岩山だけはこの軸を離れ、市電と無料シャトルバス、ロープウェイともーりすカーを乗り継ぐ少し長い移動になるが、その手間ごと夜のクライマックスだと思えばいい。山頂の営業開始時刻や上り最終便の時刻は季節で動くので、出発前に各施設の公式サイトでその日の運行を一度たしかめておくと、終盤で慌てずにすむ。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Nakajima_Park_Sapporo03bs5s4272.jpg/1280px-Nakajima_Park_Sapporo03bs5s4272.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "JRタワー展望室T38",
        "cuisine": "展望台",
        "area": "札幌市中央区・札幌駅",
        "purpose": "日没前に上る。地上約160mから街が暮れる瞬間を見る",
        "desc": "JR札幌駅直結のJRタワー38階、地上約160mに位置する展望室で、ビルの高層展望室として札幌の街並みを360度見渡せる。入場受付はJRタワーイースト6階からで、駅から一度も外に出ずにたどり着けるため、夕方の冷えや雨を気にせず夜景の起点にできるのが大きな強みだ。日没前後の時間に合わせて上れば、碁盤の目に区切られた市街の灯りがひとつずつ点っていく様子を、面ガラス越しにゆっくり眺められる。営業時間や入場料は変更される場合があるため、訪問前に公式サイトでの確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Sapporo_Sellar_Place_and_JR_Tower_by_takako_tominaga_in_JR_Tower_Square.jpg/1280px-Sapporo_Sellar_Place_and_JR_Tower_by_takako_tominaga_in_JR_Tower_Square.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR札幌駅・地下鉄さっぽろ駅 直結"
          },
          {
            "k": "料金",
            "v": "大人740円（変動あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "◎ 駅直結の屋内展望"
          },
          {
            "k": "おすすめ時間",
            "v": "日没前後"
          }
        ],
        "transit": "JR札幌駅 徒歩約1分（直結）"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "さっぽろテレビ塔 展望台",
        "cuisine": "展望台",
        "area": "札幌市中央区・大通公園",
        "purpose": "大通公園の灯りを正面に見る。塔から低めの夜景を味わう",
        "desc": "大通公園の東端に立つ高さ約147mの電波塔で、地上約90mの展望台からは、西へまっすぐ伸びる大通公園のイルミネーションや街路樹のラインを正面に見下ろせる。T38より低い分だけ街との距離が近く、人や車の動き、公園のベンチや噴水まで見えるのが、この塔ならではの眺めだ。札幌駅から大通までは地下歩行空間でつながっているので、テレビ塔の足元まで地上に出ずに移動でき、夜でも歩きやすい。料金や営業時間、最終入場の時刻は変更される場合があるため、訪問前に公式サイトでの確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Sapporo_TV_tower-20091013-RM-162316.jpg/1280px-Sapporo_TV_tower-20091013-RM-162316.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄大通駅27番出口直結"
          },
          {
            "k": "料金",
            "v": "大人 約1,000円台（変動あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "○ 展望台は屋内"
          },
          {
            "k": "おすすめ時間",
            "v": "夜（点灯後）"
          }
        ],
        "transit": "地下鉄大通駅 徒歩約1分（直結）"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "すすきの交差点（ニッカウヰスキー大看板）",
        "cuisine": "街角・夜景スポット",
        "area": "札幌市中央区・すすきの",
        "purpose": "歩いて見上げる。札幌の夜のシンボルを写真に収める",
        "desc": "札幌駅前通と国道36号が交わるすすきの交差点は、ビルの壁面を彩るニッカウヰスキーの大看板が街のシンボルとして知られる場所だ。グラスと大麦の穂を手にした人物のネオンは背景の色が移り変わり、見上げるたびに表情を変えるため、札幌の夜らしい一枚を撮るならここが定番になる。交差点に面したココノススキノの2階屋外広場からは、雑踏の頭上に看板を見上げる構図で撮れるので、人混みを避けて落ち着いて写真を残したい2人に向く。地下鉄すすきの駅や市電すすきの電停のすぐそばで、次の藻岩山への市電にもそのまま乗り継げる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Sapporo_tram_Susukino_station_platform_20160207_205636.jpg/1280px-Sapporo_tram_Susukino_station_platform_20160207_205636.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄すすきの駅・市電すすきの すぐ"
          },
          {
            "k": "料金",
            "v": "無料"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外（傘・アーケード併用）"
          },
          {
            "k": "おすすめ時間",
            "v": "夜（点灯後）"
          }
        ],
        "transit": "地下鉄すすきの駅 徒歩約1分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "藻岩山山頂展望台",
        "cuisine": "展望台",
        "area": "札幌市中央区・藻岩山",
        "purpose": "夜のクライマックスに上る。山頂で石狩平野まで広がる大夜景を見る",
        "desc": "標高531mの藻岩山の山頂に設けられた展望台で、市電「ロープウェイ入口」電停から無料シャトルバスと、ロープウェイおよび山頂直下を結ぶミニケーブルカー「もーりすカー」を乗り継いで到達する。眼下に石狩平野と札幌市街の光が大きく広がり、街なかの展望台では得られない奥行きのある夜景が楽しめるのが、この山ならではの魅力だ。山頂はデートの締めくくりにふさわしい眺めだが、その分だけ市電・ロープウェイの乗り継ぎ時間と、上り最終便の時刻に動線が左右される。営業開始時刻は季節で変わり（おおむね夏期10:30/冬期11:00）、上り最終便も決まっているため、出発前に必ず確認しておきたい。標高がある分、市街より体感気温が下がるため、夏でも一枚羽織るものを用意したい。運行時間・料金・整備休業の有無は変わることがあるため、訪問前に公式サイトでの確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Sapporo_Mt_Moiwa_Observation_%28184517453%29.jpeg/1280px-Sapporo_Mt_Moiwa_Observation_%28184517453%29.jpeg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "市電ロープウェイ入口＋無料シャトルバス"
          },
          {
            "k": "料金",
            "v": "ロープウェイ+もーりすカー往復 大人2,100円（変動あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "✕ 悪天候・濃霧時は眺望困難"
          },
          {
            "k": "おすすめ時間",
            "v": "夜（営業時間・最終便の時刻を要確認）"
          }
        ],
        "transit": "市電ロープウェイ入口 + 無料シャトルバス・ロープウェイ"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "中島公園",
        "cuisine": "公園",
        "area": "札幌市中央区・中島公園",
        "purpose": "最後に静かに歩く。賑わいの後の水辺でクールダウン",
        "desc": "すすきのの南、地下鉄南北線「中島公園駅」のすぐそばに広がる都市公園で、菖蒲池を中心に木立と園路が整い、24時間出入りできる。ネオンの賑わいから歩いてすぐの場所に、水辺と静けさが残されているのがこの公園の対比的な魅力で、夜景めぐりで高ぶった気持ちを落ち着けて一日を締めるのに向く。秋の紅葉ライトアップや冬の「ゆきあかりin中島公園」など、季節ごとに夜の灯りの催しが開かれることもある。夜間は園内の照明が限られ足元が暗い区間もあるため、池沿いの主要な園路を選んでゆっくり歩きたい。催しの開催時期や時間は年によって変わるため、訪問前に公式の案内で確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Nakajima_Park_Sapporo03bs5s4272.jpg/1280px-Nakajima_Park_Sapporo03bs5s4272.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "地下鉄中島公園駅 徒歩約1分"
          },
          {
            "k": "料金",
            "v": "無料（24時間開放）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外（園路中心に短時間で）"
          },
          {
            "k": "おすすめ時間",
            "v": "夜（締めの散策に）"
          }
        ],
        "transit": "地下鉄中島公園駅 徒歩約1分"
      }
    ],
    "sideArticles": [
      {
        "t": "札幌・大通公園さんぽ5選。時計台とレンガ庁舎を歩く",
        "h": "/feature/hokkaido-sapporo-odori-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Former_Hokkaido_Government_Office_Building_%28Red_Brick_Office%29.jpg/1280px-Former_Hokkaido_Government_Office_Building_%28Red_Brick_Office%29.jpg"
      },
      {
        "t": "小樽運河デート5選。ガス灯と硝子の街を歩く",
        "h": "/feature/hokkaido-otaru-canal-date",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Otaru_Canal_HDR1.jpg/1280px-Otaru_Canal_HDR1.jpg"
      }
    ],
    "quote": "高い場所と歩く場所を行き来するうち、札幌の夜は一枚の地図のようにつながって見えてくる。",
    "quoteCite": "マチノワ編集部",
    "closing": "夕方、JRタワー展望室T38に上がるところから夜が始まる。約160mの窓辺で街が暮れていくのを見届けたら、駅前通の地下歩行空間を南へ。さっぽろテレビ塔の展望台に上れば、今度は大通公園の灯りが正面に低く広がって、さっきの高みとはまるで違う近さで街が見える。塔を降りてそのまま駅前通を下っていくと、すすきの交差点のニッカウヰスキーの大看板が頭上に現れる。ネオンを浴びて見上げるこの一枚は、撮っておくと夜の記念になる。ここから軸を離れ、市電で藻岩山のロープウェイ方面へ向かい、無料シャトルバスとロープウェイ・もーりすカーを乗り継いで山頂展望台へ。石狩平野まで届く大夜景が、この夜のいちばん高いところで待っている。山頂は市街よりぐっと冷えるから、夏でも羽織るものを一枚持っておくと景色をゆっくり味わえる。市電とタクシーで街に戻り、まだ歩く元気が残っていたら、最後は中島公園の水辺をゆっくり。賑わいの余韻を水面に落としながらクールダウンして、夜を閉じる。雨や強風で藻岩山の眺めが望めない日は、無理に上らずT38とテレビ塔の二つの屋内展望にじっくり時間を割き、すすきのは地下街でつなぐと、濡れずに夜景を楽しみ切れる。料金やロープウェイの運行は変わることがあるので、その日の最新は公式の案内で確かめてから出かけてほしい。"
  },
  "hokkaido-otaru-canal-date": {
    "id": "hokkaido-otaru-canal-date",
    "no": "HK-03",
    "articleType": "course",
    "kicker": "OTARU CANAL DATE",
    "title": "小樽運河から堺町通りへ、ガス灯の半日デートコース",
    "titleHTML": "小樽運河から堺町通りへ、<br>ガス灯の半日デートコース",
    "subtitle": "小樽運河から芸術村、堺町通り、北一硝子三号館、メルヘン交差点の小樽オルゴール堂本館まで。石造倉庫とガス灯の港町を、運河側から南へ一本道で下る。",
    "lede": "小樽の面白さは、明治大正の倉庫や銀行がそのまま店や美術館になって、徒歩圏にぎゅっと残っているところにある。だから二人で歩くなら、あちこち散らすより運河から街の奥へ一筋に下っていくのがいい。このコースは小樽駅に近い運河側を起点に、硝子とランプ、オルゴールへと景色が移り変わる流れを大事に組んだ。前半は屋外の運河と建築でゆったり、後半は堺町通りの賑わいと屋内の灯りで温まる、緩急のついた半日だ。食べ歩きの店は夕方に閉まるところも多いので、土産や軽食は明るいうちに。拝観料や各館の営業時間は折に触れて見直されるため、出かける前に施設の公式情報へ目を通しておくと安心できる。",
    "date": "2026-06-13",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Otaru_Canal_HDR1.jpg/1280px-Otaru_Canal_HDR1.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "小樽運河",
        "cuisine": "運河",
        "area": "小樽市港町・運河エリア",
        "purpose": "まず浅草橋街園へ。石造倉庫を背に運河沿いを歩く",
        "desc": "全長約1,140mの小樽運河は、大正期に港の荷役のため海を埋め立てて造られた運河で、対岸に石造倉庫群が並ぶ景観がそのまま残る。なかでも浅草橋街園からの眺めは、緩くカーブする水面と倉庫が一枚に収まる定番の構図で、記念撮影はここから始めたい。散策路には63基のガス灯が並び、夕暮れから夜にかけて灯がともると、昼の港町とはまた違う表情になる。冬季には運河沿いをブルーに照らす「青の運河」のライトアップが行われ、点灯期間や時間は年により変わるため、訪問前に小樽観光協会の公式情報で確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Otaru_Canal_HDR1.jpg/1280px-Otaru_Canal_HDR1.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR小樽駅 徒歩約8〜10分"
          },
          {
            "k": "料金",
            "v": "散策自由（無料）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外。傘・防寒があれば可"
          },
          {
            "k": "おすすめ時間",
            "v": "昼〜夕暮れ（ガス灯点灯前後）"
          }
        ],
        "transit": "JR小樽駅 徒歩約8分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "小樽芸術村",
        "cuisine": "美術館群",
        "area": "小樽市色内1丁目（運河〜堺町の中間）",
        "purpose": "運河からすぐ。ステンドグラスと銀行建築を屋内で見る",
        "desc": "小樽芸術村は、色内1丁目に残る歴史的建造物を活用した5館からなる美術館群で、運河と堺町通りの中間に位置し、運河沿いそのものではなく色内大通り側に建つ。ステンドグラス美術館・旧三井銀行小樽支店・似鳥美術館・西洋美術館・浮世絵美術館で構成される。ステンドグラス美術館は旧高橋倉庫などを転用し、19世紀末から20世紀初頭にイギリスの教会を飾っていたステンドグラスを展示しており、薄暗い倉庫空間に色硝子が浮かぶ。隣接する旧三井銀行小樽支店では、当時の金庫室や格天井を残した銀行建築そのものを見学できる。単館券と5館共通券があり、目的に合わせて選べる。営業時間は季節で変わる（おおむね5〜10月は9:30〜17:00、11〜4月は10:00〜17:00）ため、料金や休館日とあわせて公式サイトでの確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/220721_Former_Mitsui_Bank_Otaru_Branch_Otaru_Hokkaido_Japan02s3.jpg/1280px-220721_Former_Mitsui_Bank_Otaru_Branch_Otaru_Hokkaido_Japan02s3.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR小樽駅 徒歩約10分"
          },
          {
            "k": "料金",
            "v": "単館券・5館共通券あり（変動あり・公式確認）"
          },
          {
            "k": "営業時間",
            "v": "季節で変動・休館日あり（公式確認）"
          },
          {
            "k": "雨の日",
            "v": "◎ 屋内中心"
          }
        ],
        "transit": "JR小樽駅 徒歩約10分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "堺町通り商店街",
        "cuisine": "商店街",
        "area": "小樽市堺町・堺町通り",
        "purpose": "南へ下りながら食べ歩き。早めの時間に土産も済ませる",
        "desc": "堺町通り商店街は、運河側からメルヘン交差点へ向かって約900m続くメインストリートで、明治から昭和初期の石造りの商家や倉庫を生かした店が軒を連ねる。硝子細工やオルゴール、菓子の店が並び、ソフトクリームや海鮮など食べ歩きの選択肢も多いため、2人で店をのぞきながら歩くだけで時間が過ぎる。歴史的建造物をそのまま使った外観が連続するので、通り全体が小樽らしい撮影スポットになる。通りは南北に長く、南端のメルヘン交差点側はJR南小樽駅、北端の運河寄りはJR小樽駅が近い。各店の営業はおおむね日中が中心で、夕方には閉まり始める店もある。土産や食べ歩きは明るい時間に済ませておくと、後半の動線に余裕が出る。営業時間は店ごとに異なるため、目当ての店は公式情報で確認しておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Sakaimachi_street_Otaru_Hokkaido09n.jpg/1280px-Sakaimachi_street_Otaru_Hokkaido09n.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "南端: JR南小樽駅 徒歩約8分／北端: 小樽駅 徒歩約11分"
          },
          {
            "k": "営業",
            "v": "各店おおむね日中（夕方閉店の店も・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "○ 店内移動中心。屋根のない区間あり"
          },
          {
            "k": "おすすめ時間",
            "v": "昼〜夕方前（早めの食べ歩き）"
          }
        ],
        "transit": "南端: JR南小樽駅 徒歩約8分／北端: JR小樽駅寄り"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "北一硝子 三号館",
        "cuisine": "硝子店・カフェ",
        "area": "小樽市堺町・堺町通り",
        "purpose": "ランプの灯る北一ホールで休憩。歩き疲れをここで一息",
        "desc": "北一硝子三号館は、1891年築の石造倉庫を生かした硝子店で、館内の「北一ホール」が休憩スポットになる。ホールでは毎朝手作業で火を入れる167個の石油ランプだけが空間を照らし、薄暗い倉庫の中にランプの灯が揺れる独特の雰囲気の中でお茶や軽食がとれる。硝子製品の販売エリアも併設され、買い物と休憩を一か所でまとめられるのがデート向きだ。堺町通りを歩いてきた後半、ちょうど足が疲れてくる時間帯に立ち寄ると、暗がりのランプに切り替わって気分も変わる。営業時間やラストオーダーは変わることがあるため、公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Kitaichi_glass.JPG/1280px-Kitaichi_glass.JPG"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR南小樽駅 徒歩約8分"
          },
          {
            "k": "料金",
            "v": "入店自由（飲食は別途・変動あり）"
          },
          {
            "k": "雨の日",
            "v": "◎ 屋内"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方前（歩き疲れの休憩に）"
          }
        ],
        "transit": "JR南小樽駅 徒歩約8分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "小樽オルゴール堂 本館",
        "cuisine": "オルゴール店",
        "area": "小樽市住吉町・メルヘン交差点",
        "purpose": "終点のメルヘン交差点へ。蒸気時計とオルゴールで締める",
        "desc": "小樽オルゴール堂本館は、堺町通りの南端・メルヘン交差点に建つオルゴール専門店で、建物は1912年に米穀商の本社屋として建てられた木骨レンガ造を転用した小樽市指定の歴史的建造物だ。総ケヤキ造りの高い吹き抜けのホールに、数多くのオルゴールが並び、購入もできる。店頭には高さ約5.5mの蒸気時計が据えられ、一定時間ごとに蒸気を噴いてメロディを奏でるため、写真スポットとしても多くの人が足を止める。運河から堺町通りを下ってきたコースの終点にあたり、メルヘン交差点まで来れば一本道の街歩きがちょうど完結する。蒸気時計の前で記念撮影をして解散にしたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Orgel_Doh_Otaru_%E5%B0%8F%E6%A8%BD%E9%9F%B3%E6%A8%82%E7%9B%92%E5%A0%82_-_panoramio.jpg/1280px-Orgel_Doh_Otaru_%E5%B0%8F%E6%A8%BD%E9%9F%B3%E6%A8%82%E7%9B%92%E5%A0%82_-_panoramio.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "JR南小樽駅 徒歩約7分"
          },
          {
            "k": "料金",
            "v": "入館無料（商品は別途）"
          },
          {
            "k": "雨の日",
            "v": "◎ 屋内。蒸気時計は屋外"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方（コースの締め・蒸気時計）"
          }
        ],
        "transit": "JR南小樽駅 徒歩約7分"
      }
    ],
    "sideArticles": [
      {
        "t": "札幌・大通公園さんぽ5選。時計台とレンガ庁舎を歩く",
        "h": "/feature/hokkaido-sapporo-odori-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Former_Hokkaido_Government_Office_Building_%28Red_Brick_Office%29.jpg/1280px-Former_Hokkaido_Government_Office_Building_%28Red_Brick_Office%29.jpg"
      },
      {
        "t": "すすきの夜景デート5選。展望台とネオンの街を歩く",
        "h": "/feature/hokkaido-susukino-night-date",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Nakajima_Park_Sapporo03bs5s4272.jpg/1280px-Nakajima_Park_Sapporo03bs5s4272.jpg"
      }
    ],
    "quote": "運河の倉庫街から硝子、ランプ、オルゴールへ。景色が移ろう順に小樽を南へ下る、昼下がりから夕暮れまでの半日デート。",
    "quoteCite": "マチノワ編集部",
    "closing": "昼下がり、JR小樽駅から運河側へ下りて、まずは小樽運河の浅草橋街園で石造倉庫を背に一枚。水面に映る倉庫の輪郭を眺めながら運河沿いを少し歩いたら、すぐ近くの小樽芸術村へ。ステンドグラスの光と旧三井銀行小樽支店の重厚な建築を屋内でゆっくり味わう。外へ出たら堺町通り商店街を南へ。食べ歩きをつまみつつ、閉まるのが早い店もあるので土産はこのあたりで先に確保しておきたい。歩き疲れてきたところで北一硝子 三号館の北一ホールへ入り、無数のランプの灯りに包まれて一息。体が温まったら、終点はメルヘン交差点。蒸気時計の前を通って小樽オルゴール堂 本館でオルゴールの音に耳を澄ませば、ちょうど日が傾く頃になる。運河側からメルヘン交差点まで道がほぼ一本なので迷う心配が少なく、港の倉庫、硝子、ランプ、オルゴールと表情の違う見どころが短い距離で次々に現れるのがこの順番の良さ。冬場は日が落ちるのが早く路面も凍るから、滑りにくい靴と防寒はしっかりと。雪や雨なら芸術村や北一ホール、オルゴール堂といった屋内を厚めに、運河の散策は短めにすれば二人とも快適に過ごせる。なお拝観料やライトアップの時期は変わることがあるので、最終的な金額や時間は当日までに公式で押さえておきたい。"
  },
  "chugoku-hiroshima-peace-walk": {
    "id": "chugoku-hiroshima-peace-walk",
    "no": "CG-01",
    "articleType": "guide",
    "kicker": "HIROSHIMA CITY WALK",
    "title": "広島・平和記念公園、慰霊と歴史をたどる街歩き。ドームから本通へ",
    "titleHTML": "広島・平和記念公園、慰霊と歴史をたどる街歩き。<br>ドームから本通へ",
    "subtitle": "原爆ドームに始まり、資料館で学び、縮景園と広島城に歴史の層を見て、復興した本通の賑わいへ抜ける。一つの街に重なる「過去」を歩く。",
    "lede": "広島の中心部を歩いていて気づくのは、慰霊と日常がすぐ隣にあることだ。太田川の三角州に開けた平らな街では、被爆の記憶をとどめる場所と、人々が買い物をする商店街とが、わずかな距離でつながっている。この街歩きが掘り下げたいのは、その「重なり」だ。原爆ドームと平和記念資料館で被爆の事実に正面から向き合ったあと、縮景園や広島城に足を延ばすと、同じ場所が一度すべてを失い、それでも再び庭園や城跡として立ち直ってきたことが見えてくる。観光名所を効率よく回るのではなく、被爆と復興という一本の歴史の上に、これらの場所がどう連なっているのかを、自分の足で確かめていく歩き方を提案したい。なお拝観料や開園時間は折にふれて見直されるので、出かける前に各施設の公式情報へ一度目を通しておくと安心だ。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Genbaku_Dome04-r.JPG/1280px-Genbaku_Dome04-r.JPG",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "原爆ドーム",
        "cuisine": "世界文化遺産・被爆建造物",
        "area": "広島市中区・大手町",
        "purpose": "朝にまず仰ぐ。川越しに被爆の実相と向き合う",
        "desc": "元安川のほとりに残る原爆ドームは、1945年8月6日の原子爆弾投下でほぼ即時に破壊されながら、爆心地のほぼ直下で爆風を上からほぼ垂直に受けたため骨組みと一部の壁が崩れ残った建物だ。元は広島県産業奨励館として親しまれた建築で、その残された姿が戦争の惨禍と平和への願いを伝える証として保存され、1996年に世界文化遺産に登録された。内部には立ち入れず、周囲の歩道や対岸から外観を仰ぐ形で見学する。朝の早い時間は人も少なく、川面と空を背に静かに向き合える。最寄りの電停がすぐそばにあり、ここから一日の動線が始まる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Genbaku_Dome04-r.JPG/1280px-Genbaku_Dome04-r.JPG"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "広電・原爆ドーム前電停 徒歩約1分"
          },
          {
            "k": "料金",
            "v": "外観見学は無料（内部立入不可）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外のため傘が必要"
          },
          {
            "k": "おすすめ時間",
            "v": "朝（人が少なく静か）"
          }
        ],
        "transit": "広電・原爆ドーム前電停 徒歩約1分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "広島平和記念資料館",
        "cuisine": "資料館",
        "area": "広島市中区・中島町",
        "purpose": "午前にじっくり見学する。被爆の事実を学ぶ",
        "desc": "平和記念公園の南端に建つ広島平和記念資料館は、被爆の実相を遺品や写真、資料で伝える施設で、本館と東館の二棟からなる。焼けた衣服や時計、被爆者が残した記録などの展示は、来館者が事実をていねいにたどれるよう構成されており、子どもから海外からの訪問者まで多くの人が静かに見入る。建物は丹下健三の設計によるもので、原爆ドームと慰霊碑を一直線に結ぶ軸線の上に置かれている点も、公園全体が祈りのために設計されたことを物語る。入館料は大人で数百円ほどと低く抑えられ、中学生以下は無料。見学には少なくとも一時間以上を見ておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Hiroshima_Peace_Memorial_Museum_2008_01.JPG/1280px-Hiroshima_Peace_Memorial_Museum_2008_01.JPG"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "広電・原爆ドーム前電停 徒歩約10分"
          },
          {
            "k": "料金",
            "v": "大人200円ほか（変動あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "◎ 屋内施設で天候不問"
          },
          {
            "k": "おすすめ時間",
            "v": "開館直後（比較的落ち着く）"
          }
        ],
        "transit": "広電・原爆ドーム前電停 徒歩約10分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "縮景園",
        "cuisine": "回遊式庭園（国の名勝）",
        "area": "広島市中区・上幟町",
        "purpose": "午後に歩く。被爆から復元された大名庭園で一息つく",
        "desc": "縮景園は、江戸時代の初めに広島藩主・浅野家の別邸の庭として、武将茶人で家老の上田宗箇が作庭した回遊式庭園だ。中央の池を中心に小さな山や橋を配し、各地の景勝を縮めて写したとされる構成が名の由来とされる。この庭もまた原爆で大きな被害を受けたが、戦後に手入れと復元が重ねられ、いまは国の名勝として四季の草木が楽しめる場所になっている。慰霊の地をめぐったあとにこの庭を歩くと、同じ街が破壊と再生をくぐり抜けてきたことが静かに伝わる。最寄りの電停から近く、広島駅からも徒歩圏で立ち寄りやすい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/20100722_Hiroshima_Shukkeien_4387.jpg/1280px-20100722_Hiroshima_Shukkeien_4387.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "広電・縮景園前電停 徒歩約2分"
          },
          {
            "k": "料金",
            "v": "大人260円ほか（変動あり・公式確認）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外の庭園のため傘が必要"
          },
          {
            "k": "おすすめ時間",
            "v": "午後（光がやわらぐ時間帯）"
          }
        ],
        "transit": "広電・縮景園前電停 徒歩約2分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "広島城",
        "cuisine": "城跡・史跡公園",
        "area": "広島市中区・基町",
        "purpose": "夕方前に巡る。城跡と二の丸を歩いて城下の歴史をたどる",
        "desc": "広島城は、毛利輝元が太田川の三角州に築いた平城で、堀と石垣に囲まれた城跡が市街地の中に広く残る。天守は原爆で倒壊したのち外観復元され長く親しまれてきたが、老朽化に伴い現在は天守内部の見学ができない状況にあり、見学は城跡や復元された二の丸の建物、堀沿いの散策を中心に行うことになる。本丸跡には被爆をくぐり抜けて生き残った樹木も残り、城がたどった歴史の層を感じられる。近年は三の丸の一帯が整備され、土産物店や飲食ができる施設も加わって立ち寄りやすくなった。広い敷地を歩くため、ゆとりを持って時間を確保しておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Main_Gate_of_Hiroshima_Castle%2C_20240817_1510_4303.jpg/1280px-Main_Gate_of_Hiroshima_Castle%2C_20240817_1510_4303.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "アストラムライン・県庁前駅 徒歩約12分"
          },
          {
            "k": "料金",
            "v": "城跡・公園は無料（天守内部は現在見学不可）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外中心、三の丸の屋内施設は利用可"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方前（日が傾く時間帯）"
          }
        ],
        "transit": "アストラムライン・県庁前駅 徒歩約12分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "本通商店街",
        "cuisine": "商店街（アーケード）",
        "area": "広島市中区・本通",
        "purpose": "締めに歩く。復興した街の賑わいの中を抜けて解散",
        "desc": "本通商店街は、広島の中心部を東西に約577メートル貫くアーケード商店街で、地元では「本通り」と呼ばれて親しまれている。被爆で一帯は壊滅したが、戦後の早い時期にアーケードが整えられ、本格的な復興の象徴のひとつとなった通りだ。アパレルや雑貨、飲食店が軒を連ね、いまも一日を通じて多くの人が行き交う。慰霊や歴史をたどってきた一日の締めくくりにこの通りを歩くと、同じ街が取り戻した暮らしの賑わいに触れられる。屋根に覆われているため雨でも歩きやすく、最寄りの電停やバスセンターからも近い。食事や土産選びに立ち寄りやすい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Hiroshima-Hondori_Shopping_Street_at_night.jpg/1280px-Hiroshima-Hondori_Shopping_Street_at_night.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "広電・紙屋町西電停 徒歩約3分"
          },
          {
            "k": "営業",
            "v": "店舗により異なる（公式・各店確認）"
          },
          {
            "k": "雨の日",
            "v": "◎ アーケードで雨天でも歩ける"
          },
          {
            "k": "おすすめ時間",
            "v": "夕方（食事や買い物に)"
          }
        ],
        "transit": "広電・紙屋町西電停 徒歩約3分"
      }
    ],
    "sideArticles": [
      {
        "t": "宮島・厳島神社 観光5選。大鳥居と弥山を歩く",
        "h": "/feature/chugoku-miyajima-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Itsukushima-jinja_torii_at_sunset%2C_Miyajima%2C_Japan%2C_20240816_1812_4144.jpg/1280px-Itsukushima-jinja_torii_at_sunset%2C_Miyajima%2C_Japan%2C_20240816_1812_4144.jpg"
      },
      {
        "t": "難波・道頓堀 食べ歩き5選。グリコサインから法善寺横丁まで",
        "h": "/feature/kansai-namba-dotonbori-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Neon_sign_of_Dotonbori_daytime.JPG"
      }
    ],
    "quote": "慰霊の祈りから庭園の静けさ、城跡を経て賑わいの本通へ。被爆と復興という一つの歴史を、広島の街そのものから読み取る一日。",
    "quoteCite": "マチノワ編集部",
    "closing": "朝はまず原爆ドームを川越しに仰ぐところから始めたい。元安川の水面に映る骨組みは、写真で何度見ていても、その場に立つと言葉が出なくなる。橋を渡って平和記念公園に入り、平和記念資料館でしっかり時間をかけて被爆の事実と向き合う。午前のうちに資料館を訪ねるのには理由があって、開館直後の比較的落ち着いた時間帯のほうが、一点一点の展示に静かに向き合える。慰霊行事の時期や夕方は人が増えるので、朝の数時間が貴重だ。昼食を挟んだら、午後は縮景園へ。回遊式の大名庭園として知られるが、ここも被爆で焼け、長い年月をかけて復元されてきた場所だと知ってから歩くと、池や築山のたたずまいの見え方が変わってくる。園内をひとめぐりしたあとは広島城へ。天守内部の見学は現在できないため、城跡と二の丸・三の丸を中心に、城下の歴史をたどるつもりで巡るとちょうどよい。そして締めは本通商店街。慰霊の場から歩いてきた先に、今を生きる人々の賑わいがある——その落差こそが、この街の復興の重みを最も実感させてくれる。一日歩き通すと、それぞれの場所が別々の名所ではなく、同じ歴史の上に立っていることが体に残る。歩き方の補足を少し。原爆ドーム・平和記念公園・広島城は屋外の移動が中心になるので、夏は日差しと暑さ、冬は冷え込みへの備えがあると歩きやすい。縮景園は開園時間が季節で変わり、春から夏（おおむね3/16〜9/15ごろ）は夕方まで、秋から冬（9/16〜3/15ごろ）は17:00で閉園するため、夕方に立ち寄るなら冬季の早じまいに気をつけたい。雨の日は屋外の縮景園や城跡を短めにして、屋内の平和記念資料館とアーケードに覆われた本通で過ごす時間を厚くすると無理がない。開園・開館時間や料金、施設の公開状況は変わることがあるので、その日の予定を組む前にそれぞれの公式サイトでもう一度たしかめておくとよい。"
  },
  "chugoku-miyajima-walk": {
    "id": "chugoku-miyajima-walk",
    "no": "CG-02",
    "articleType": "guide",
    "kicker": "MIYAJIMA",
    "title": "宮島、潮と原始林を歩く。大鳥居から弥山の頂へ",
    "titleHTML": "宮島、潮と原始林を歩く。<br>大鳥居から弥山の頂へ",
    "subtitle": "海に立つ朱の大鳥居から、回廊の社殿、塔の岡の高台、商店街の湯気を抜けて、原始林の弥山まで。世界遺産の島を桟橋から一歩ずつたどる宮島さんぽ。",
    "lede": "桟橋を降りると、まず潮の匂いが鼻に届く。広島湾に浮かぶ宮島（廿日市市）は、海に立つ朱の大鳥居と、背後にそびえる原始林の弥山（みせん）とが、ひとつの島のなかでひと続きになっている珍しい場所だ。社殿も商店街も歩いてすぐ、山頂をのぞけば道はおおむね平らで、足は自然と海沿いへ向く。その日の潮位ひとつで大鳥居の表情はまるで変わるから、出かける前に潮見表をのぞいておくと、自分がどんな鳥居に会えるのか想像がふくらむ。ここからは、その朱の鳥居から海上の社殿、塔の岡の高台、商店街の湯気を抜け、午後には弥山の頂へ――海の信仰と山の眺めが地続きになる道を、足の運びのまま書いていく。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Itsukushima-jinja_torii_at_sunset%2C_Miyajima%2C_Japan%2C_20240816_1812_4144.jpg/1280px-Itsukushima-jinja_torii_at_sunset%2C_Miyajima%2C_Japan%2C_20240816_1812_4144.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "嚴島神社 大鳥居",
        "cuisine": "鳥居",
        "area": "廿日市市宮島町・厳島神社前",
        "purpose": "まず海辺で迎える。潮位で姿が変わる朱の大鳥居を正面に望む",
        "desc": "桟橋から海沿いの参道を進むと、まず迎えるのが海中に立つ朱塗りの大鳥居だ。現在の鳥居は明治期に再建されたもので、高さ約16.6m・主柱の周り約10mという大規模な木造両部鳥居だ。約3年半に及んだ「令和の大改修」を経て、いまは覆いの取れた本来の姿を間近に見られる。柱が海中の地盤に置かれているだけで自重で立つという独特の構造で、潮が引けば根元まで歩いて近づけ、満潮時には海上に浮かぶように見える。同じ鳥居が時間帯で全く違う表情を見せるのは、潮の満ち引きとともにある宮島ならではの体験だ。干満の時刻は日によって異なるため、訪問前に潮見表で確認しておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Itsukushima-jinja_torii_at_sunset%2C_Miyajima%2C_Japan%2C_20240816_1812_4144.jpg/1280px-Itsukushima-jinja_torii_at_sunset%2C_Miyajima%2C_Japan%2C_20240816_1812_4144.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "宮島桟橋から徒歩約10分（宮島口よりフェリー約10分）"
          },
          {
            "k": "料金",
            "v": "見学無料（社殿は別途昇殿料）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外・遠望中心"
          },
          {
            "k": "おすすめ時間",
            "v": "干潮前後（潮見表で確認）"
          }
        ],
        "transit": "宮島桟橋 徒歩約10分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "嚴島神社",
        "cuisine": "神社",
        "area": "廿日市市宮島町・厳島神社",
        "purpose": "回廊を歩いて参拝。海上に建つ社殿を順路通りにめぐる",
        "desc": "大鳥居を望んだら、そのまま海上に建つ社殿へ向かう。寝殿造の様式を取り入れた社殿群は朱塗りの回廊で結ばれ、満潮時には床下まで海水が入り込み、建物全体が海に浮かんでいるように見える。平清盛の崇敬を受けて現在の規模に整えられたと伝わり、本社本殿や祓殿、対岸に立つ大鳥居までを一直線に配した海上社殿の構成は世界文化遺産に登録されている。順路は一方通行の回廊に沿って進む形で、立ち止まる位置によって大鳥居や五重塔の見え方が変わるのが歩く楽しみだ。昇殿には初穂料がかかり、隣接する宝物館との共通券も用意されている。料金や昇殿時間は変更される場合があるため、訪問前に公式サイトでの確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Itsukushima_Gate.jpg/1280px-Itsukushima_Gate.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "宮島桟橋から徒歩約12分"
          },
          {
            "k": "料金",
            "v": "昇殿料 大人300円（変動あり／宝物館共通券あり）"
          },
          {
            "k": "雨の日",
            "v": "○ 回廊は一部屋根あり"
          },
          {
            "k": "おすすめ時間",
            "v": "午前（満潮時は社殿が海に浮かぶ）"
          }
        ],
        "transit": "宮島桟橋 徒歩約12分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "豊国神社（千畳閣）・五重塔",
        "cuisine": "神社・仏堂",
        "area": "廿日市市宮島町・塔の岡",
        "purpose": "高台に上がる。畳857枚分の大経堂と朱の五重塔を見る",
        "desc": "厳島神社の参拝を終えたら、すぐ裏手の小高い丘へ上がる。豊臣秀吉が大経堂として建立を命じた木造の大広間が豊国神社（千畳閣）で、畳857枚を敷ける広さから千畳閣の通称で親しまれてきた。秀吉の死で工事が途中のまま残されたため天井や壁の一部が未完成のままで、柱だけが連なる開放的な空間に海風が抜ける。床に座ると、額縁のように切り取られた厳島神社と瀬戸内の海を見下ろせるのがこの高台ならではの眺めだ。隣には朱塗りの五重塔が立ち、社殿越しに見える塔の姿は宮島を象徴する構図として知られる。拝観料・拝観時間は変更される場合があるため、公式情報での確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Senjokaku_Toyokuni_Shrine_Miyajima.jpg/1280px-Senjokaku_Toyokuni_Shrine_Miyajima.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "宮島桟橋から徒歩約12分（厳島神社から数分の高台）"
          },
          {
            "k": "料金",
            "v": "千畳閣 大人100円（変動あり／五重塔は外観のみ）"
          },
          {
            "k": "雨の日",
            "v": "○ 千畳閣は屋根あり"
          },
          {
            "k": "おすすめ時間",
            "v": "昼前後（社殿と海を見下ろす）"
          }
        ],
        "transit": "宮島桟橋 徒歩約12分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "宮島表参道商店街",
        "cuisine": "商店街",
        "area": "廿日市市宮島町・清盛通り",
        "purpose": "昼食と食べ歩き。あなごめしと焼き牡蠣、もみじ饅頭を味わう",
        "desc": "高台を下りたら、桟橋と社殿を結ぶ全長約350mの表参道商店街（清盛通り）で昼食をとる。土産物店や飲食店が軒を連ねる島内の中心的な通りで、宮島名物のあなごめしや、その場で焼き上げる焼き牡蠣、各店が独自の味を競うもみじ饅頭の食べ歩きが楽しめる。焼きたてを生地から作る揚げもみじや、しゃもじ発祥の地にちなんだ大杓子の展示など、ここでしか出会えない店構えも多い。通りにはアーケード状の開閉式屋根が備わっており、雨の日でも傘なしで歩き回れるのがこの商店街の強みだ。社殿への行き帰りに自然と通る位置にあるため、昼食と土産選びをまとめて済ませやすい。営業時間は店舗ごとに異なる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/20181111_Machiya_Street_shops.jpg/1280px-20181111_Machiya_Street_shops.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "宮島桟橋から徒歩約5分"
          },
          {
            "k": "営業",
            "v": "店舗により異なる（昼〜夕方中心）"
          },
          {
            "k": "雨の日",
            "v": "◎ 開閉式屋根あり"
          },
          {
            "k": "おすすめ時間",
            "v": "昼（食事と食べ歩き）"
          }
        ],
        "transit": "宮島桟橋 徒歩約5分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "弥山（宮島ロープウエー）",
        "cuisine": "ロープウエー・山",
        "area": "廿日市市宮島町・弥山",
        "purpose": "午後に上がる。獅子岩展望台から瀬戸内の多島美を見渡す",
        "desc": "昼食後は紅葉谷から宮島ロープウエーに乗り、島の最高峰・弥山（標高約535m）へ向かう。循環式と交走式という方式の異なる2本のロープウエーを乗り継いで獅子岩駅まで上がる構成で、ゴンドラからは眼下に広がる瀬戸内の島々を見下ろせる。終点近くの獅子岩展望台からは、大小の島が浮かぶ多島美を一望できるのがこの山ならではの眺めだ。山頂まではさらに片道約30分の登山道が続き、巨岩が連なる弥山本堂やくぐり岩を抜けると、瀬戸内海を360度見渡す山頂展望台に出る。岩場と石段が多いため歩きやすい靴が要る。運賃・運行時間は季節や点検で変わり、繁忙期はweb予約が必要な場合もあるため、訪問前に公式サイトでの確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/View_of_Mount_Misen_near_Miyajima_Station.jpg/1280px-View_of_Mount_Misen_near_Miyajima_Station.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "紅葉谷駅（桟橋から徒歩約25分・無料送迎あり）"
          },
          {
            "k": "料金",
            "v": "ロープウエー往復 大人2,000円（変動あり）"
          },
          {
            "k": "雨の日",
            "v": "△ 強風・荒天時は運休・山頂は視界不良"
          },
          {
            "k": "おすすめ時間",
            "v": "午後（下山時間に余裕を持って）"
          }
        ],
        "transit": "宮島桟橋 徒歩約25分（紅葉谷駅）"
      }
    ],
    "sideArticles": [
      {
        "t": "広島・平和記念公園 観光5選。歴史と庭園、本通を歩く",
        "h": "/feature/chugoku-hiroshima-peace-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Genbaku_Dome04-r.JPG/1280px-Genbaku_Dome04-r.JPG"
      },
      {
        "t": "難波・道頓堀 食べ歩き5選。グリコサインから法善寺横丁まで",
        "h": "/feature/kansai-namba-dotonbori-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Neon_sign_of_Dotonbori_daytime.JPG"
      }
    ],
    "quote": "海の大鳥居から原始林の頂まで、潮と山がひと続きになった世界遺産の島を、足の向くまま歩いてみる。",
    "quoteCite": "マチノワ編集部",
    "closing": "朝、宮島桟橋から海沿いの参道をたどると、波の向こうに嚴島神社の大鳥居が正面に立ち上がる。潮が引いていれば砂の上を根元まで歩いて朱の柱を見上げられるし、満ちていれば海上にぽつんと浮かぶ姿を遠目に味わうことになる――同じ鳥居でも、その日の海しだいで会える顔が違うのがおもしろい。そのまま嚴島神社へ入り、海の上に渡された回廊を順路どおりに歩けば、満潮には床下まで水が満ちて社殿そのものが海に浮かんでいるように見えてくる。回廊を抜けて裏手の塔の岡へ上がると、畳857枚分という千畳閣（豊国神社）の大経堂が広々と口を開け、すぐ脇には朱の五重塔がまっすぐ空へ伸びている。高台から坂を下りれば、清盛通りの宮島表参道商店街。あなごめしの甘辛い匂いと焼き牡蠣のはじける音、もみじ饅頭の焼ける湯気に挟まれて、ここで腹ごしらえを済ませておきたい。午後は紅葉谷から宮島ロープウエーに乗り換え、一気に弥山の懐へ。獅子岩展望台に立つと瀬戸内の多島美が眼下に開け、終点の獅子岩駅から山頂までは岩場や石段の続く片道三十分ほどの登り道だから、足元は歩き慣れた靴で来たい。海上に立つ鳥居と山頂から望む島々――この二つの絶景を一日でつなげられるのは、海と山がひとつの島に同居する宮島ならではだ。雨の日なら、屋根のある商店街での食べ歩きと回廊の覆われた社殿、屋内の千畳閣を軸に組み替え、視界の利かない弥山は晴れた日へ持ち越せばいい。下りのロープウエーで耳に潮騒が戻ってくる頃には、海の信仰と山の眺めを地続きに歩ききった満ち足りた疲れが残っている。なお拝観料やロープウエーの運賃、フェリーや宮島訪問税の扱い、各施設の営業時間は折にふれて見直されるので、出かける前にそれぞれの公式情報へ一度目を通しておくと安心だ。"
  },
  "kanto-kawagoe-walk": {
    "id": "kanto-kawagoe-walk",
    "no": "KT-01",
    "articleType": "guide",
    "kicker": "KAWAGOE KOEDO WALK",
    "title": "川越、蔵の町を歩くさんぽ。時の鐘から横丁、社寺へ",
    "titleHTML": "川越、蔵の町を歩くさんぽ。<br>時の鐘から横丁、社寺へ",
    "subtitle": "黒漆喰の蔵が連なる一番街から、駄菓子の匂う横丁、縁結びの社、五百羅漢の寺まで。江戸の時間がそのまま残る小江戸を、足の向くまま歩いた半日の記録。",
    "lede": "本川越の駅を出て北へ向かうと、空気の色がゆっくり変わっていく。コンクリートのビルが途切れ、軒の低い黒い蔵が両側からせり出してくる。埼玉・川越、都心から電車で三十分ほどの城下町は、なぜか時計の針が緩んでいるように感じる。一番街に入ると、まず見上げてしまうのが木造の櫓だ。時の鐘は今も町の真ん中に立ち、空を区切るように高い。その下を、下駄を鳴らす着物姿の人や、菓子の袋を抱えた家族連れがすれ違っていく。蔵の町から横丁の路地へ、そして表通りを少し離れた社寺へ。歩く距離はそう長くないのに、角を曲がるたびに町の表情が入れ替わる。順路を決めずに、目に留まったものへ近づいていったら、この五つの場所をつなぐことになった。",
    "date": "2026-06-13",
    "reading": "約7分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Kawagoe_Toki_no_Kane_1.jpg/1280px-Kawagoe_Toki_no_Kane_1.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "時の鐘",
        "cuisine": "鐘楼",
        "area": "川越市・幸町（一番街）",
        "purpose": "午前に見上げる。小江戸のシンボルとして町並みの中心に立つ",
        "desc": "一番街の通りからわずかに入った路地に立つ、高さ約16mの木造の鐘楼。現在の塔は明治26年(1893)の川越大火の翌年に再建されたもので、城下町に時を告げてきた歴史をいまに伝える。鐘は毎日6時・12時・15時・18時の4回つかれ、その音は環境省の「残したい“日本の音風景100選”」に選ばれている。塔そのものに登ることはできないが、見上げる構図と背後の薬師神社を含めた一角が川越の象徴的な景観で、12時か15時の鐘の時刻に合わせて訪れると、音とともに小江戸の雰囲気を体感できる。鐘つきの時刻や周辺の状況は変わることがあるため、訪問前に公式情報での確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Kawagoe_Toki_no_Kane_1.jpg/1280px-Kawagoe_Toki_no_Kane_1.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "本川越駅 徒歩約15分／川越駅 徒歩約20分"
          },
          {
            "k": "料金",
            "v": "見学無料"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外・見上げる見学"
          },
          {
            "k": "おすすめ時間",
            "v": "午前（12時・15時の鐘に合わせて）"
          }
        ],
        "transit": "本川越駅 徒歩約15分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "蔵造りの町並み（一番街）",
        "cuisine": "町並み・商店街",
        "area": "川越市・幸町（一番街）",
        "purpose": "通りをそぞろ歩く。黒い蔵造りの商家が並ぶ目抜き通り",
        "desc": "川越観光の表舞台にあたる通りで、30棟あまりの蔵造りの商家が軒を連ね、国の重要伝統的建造物群保存地区に選定されている。黒漆喰の重厚な外壁と分厚い観音扉が特徴で、なかでも寛政4年(1792)建築と伝わる「大沢家住宅」は川越最古級の蔵造りとして国の重要文化財に指定されている。現在も多くの建物が物販店や飲食店として現役で使われており、見るだけでなく買い物や食べ歩きを楽しめるのがこの通りならではの魅力だ。時の鐘もこの通り沿いにあるため、まずここをゆっくり往復してから横丁や社寺へ足を延ばすと動線がまとまる。通りは交通量があり歩道が狭い区間もあるため、混雑時は足元に注意を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Kawagoe_Kuratsukuri_Museum.JPG/1280px-Kawagoe_Kuratsukuri_Museum.JPG"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "本川越駅 徒歩約10分／川越駅 徒歩約15分"
          },
          {
            "k": "料金",
            "v": "散策無料（各店は別途）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外（店内に退避可）"
          },
          {
            "k": "おすすめ時間",
            "v": "午前〜昼（食べ歩きと合わせて）"
          }
        ],
        "transit": "本川越駅 徒歩約10分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "菓子屋横丁",
        "cuisine": "横丁・商店街",
        "area": "川越市・元町（一番街北側）",
        "purpose": "食べ歩く。駄菓子と飴細工の路地でおやつ休憩",
        "desc": "一番街の北西にある石畳の細い路地で、明治の初めに大蓮寺の門前で駄菓子づくりが始まったのが起こりとされる。昭和初期には70軒余りが軒を連ねたといい、現在も20軒ほどの菓子店や駄菓子屋が残る。芋を使った菓子や飴細工、麩菓子、ニッキ飴など、川越らしい素朴なおやつを買い歩けるのがこの横丁ならではの楽しみで、子ども連れでも気軽に立ち寄れる。狭い路地に店が密集しているため、混雑時はゆずり合いながら歩きたい。各店は月曜を定休とするところが多く、営業日や商品は店ごとに異なるため、目当てがある場合は事前に公式情報や店舗で確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Kashiya_yokocho_-02.jpg/1280px-Kashiya_yokocho_-02.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "本川越駅 徒歩約15分／川越駅 徒歩約20分"
          },
          {
            "k": "料金",
            "v": "散策無料（各店は別途）"
          },
          {
            "k": "雨の日",
            "v": "△ 屋外の路地（短時間向き）"
          },
          {
            "k": "おすすめ時間",
            "v": "昼前後（食べ歩きの休憩に）"
          }
        ],
        "transit": "本川越駅 徒歩約15分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "川越氷川神社",
        "cuisine": "神社",
        "area": "川越市・宮下町",
        "purpose": "午後に参拝。縁結びの神様と境内の風情を味わう",
        "desc": "約1500年前の創建と伝わる、川越の総鎮守。祀られる五柱の神々に二組の夫婦神が含まれることから、古くから縁結びの神様として信仰を集めてきた。境内では一日20体限定で授与される「縁結び玉」が知られ、参拝後に手にする人も多い。夏には約2000個の江戸風鈴が境内を彩る祭事「縁むすび風鈴」が開かれ、夕方の風鈴回廊のライトアップが川越の夏の風物詩になっている（開催期間は年により異なる）。一番街から北東へやや歩くため、町並みと横丁を回ったあと午後に訪れる動線が組みやすい。風鈴など季節の祭事や授与品の日程・数量は変わることがあるため、訪問前に公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Kawagoe_Hikawa_Shrine%2C_Kawagoe_City%3B_December_2019_%2810%29.jpg/1280px-Kawagoe_Hikawa_Shrine%2C_Kawagoe_City%3B_December_2019_%2810%29.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "本川越駅 徒歩約20分／川越駅からバス約10分"
          },
          {
            "k": "料金",
            "v": "参拝無料（授与品は別途）"
          },
          {
            "k": "雨の日",
            "v": "○ 社殿・授与所は軒下あり"
          },
          {
            "k": "おすすめ時間",
            "v": "午後（夏は風鈴の夕刻も）"
          }
        ],
        "transit": "本川越駅 徒歩約20分（川越駅からバス約10分）"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "喜多院",
        "cuisine": "寺院",
        "area": "川越市・小仙波町",
        "purpose": "締めに拝観。五百羅漢と江戸城ゆかりの客殿をめぐる",
        "desc": "平安初期の創建と伝わる天台宗の名刹で、「川越大師」として親しまれる。江戸期に徳川家とのつながりが深く、江戸城から移築された「家光誕生の間」「春日局化粧の間」が客殿・書院に残るのがこの寺ならではの見どころだ。境内の五百羅漢は天明2年(1782)から約50年かけて造られた538体の石像群で、一体ごとに表情や仕草が異なり、見て回るだけで時間を忘れる。客殿・五百羅漢などの有料拝観は大人400円が目安で、町歩きの締めくくりに腰を据えて見学するのに向く。拝観時間や料金、休観日は季節により変わり、拝観受付は閉門の30分前に終わるため、訪問前に公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Kawagoe_Kitain_Main_Hall_202011.jpg/1280px-Kawagoe_Kitain_Main_Hall_202011.jpg"
        ],
        "specs": [
          {
            "k": "最寄り駅",
            "v": "本川越駅 徒歩約15分／川越駅 徒歩約20分"
          },
          {
            "k": "料金",
            "v": "拝観 大人400円（変動あり・公式確認を）"
          },
          {
            "k": "雨の日",
            "v": "○ 客殿・書院は屋内拝観"
          },
          {
            "k": "おすすめ時間",
            "v": "午後（閉門前に余裕をもって）"
          }
        ],
        "transit": "本川越駅 徒歩約15分"
      }
    ],
    "sideArticles": [
      {
        "t": "難波・道頓堀 食べ歩き5選。グリコサインから法善寺横丁まで",
        "h": "/feature/kansai-namba-dotonbori-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Neon_sign_of_Dotonbori_daytime.JPG"
      },
      {
        "t": "新世界・通天閣 観光5選。レトロな下町を歩く半日",
        "h": "/feature/kansai-shinsekai-tsutenkaku",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Tsutenkaku%2C_Osaka.jpg/1280px-Tsutenkaku%2C_Osaka.jpg"
      }
    ],
    "quote": "蔵のひんやりした影、横丁の甘い匂い、社の木立の静けさ。性格の違う町の顔が、歩くほどに地続きでつながっていく小江戸・川越。",
    "quoteCite": "マチノワ編集部",
    "closing": "午前のうちに一番街へ入り、まず時の鐘を見上げた。木の櫓は思っていたより高く、見上げる首の角度がそのまま江戸の高さなのだと知る。鐘を背にして蔵造りの町並みをそぞろ歩けば、黒漆喰の壁が陽を吸い込んで、通りはどこか暗く落ち着いている。重い戸を構えた商家が一軒ずつ表情を変え、店先を覗きながら進むうちに足が止まらなくなった。北へ抜けて菓子屋横丁に入ると、空気が一変する。飴を煮る甘い匂いと、駄菓子の派手な色。狭い路地に人の声が反響して、ここだけ祭りのあとのような賑わいが残っている。ひと休みして、今度は東へ。表通りから少し離れた川越氷川神社は、参道に入った途端に音が引いて、木立の影が深くなった。縁結びの社として知られる境内を抜けると、賑わいの記憶がすっと遠のく。最後は南の喜多院へ。並ぶ五百羅漢の顔を一体ずつ眺め、江戸城から移されたという客殿に上がれば、半日歩いた足の疲れも板間のひんやりした感触に溶けていく。一番街は週末ほど人が多く、車道との境も狭いので、写真に夢中になりすぎないほうがいい。横丁の店は休む日もあり、社寺は表通りからやや歩く。雨なら屋外の食べ歩きを早めに切り上げ、客殿や蔵のなかのカフェに腰を据えると、この町はまた違う顔を見せてくれる。拝観の時間や横丁各店の定休、季節の祭事は移ろうものなので、出かける前にそれぞれの公式情報をのぞいておくと安心だ。歩き終えて駅へ戻る頃には、町の時間に少し体が馴染んでいた。"
  }
};
