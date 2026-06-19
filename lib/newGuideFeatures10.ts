import type { Feature, FeatureArticle } from "./data";

// ═══════════════════════════════════════════════════════
// 街ガイド特集 第8弾 — 自動生成（脱テンプレ・複数ペルソナ）
//   画像: Wikimedia Commons をビジョン照合（被写体・地域一致を確認）で採用・HTTP200確認済み
//   事実: 各スポットを WebSearch 検証＋監査＋個別校閲
// ═══════════════════════════════════════════════════════

export const NEWGUIDE10_FEATURES: Feature[] = [
  {
    "id": "kyoto-toji-temple",
    "no": "G10-01",
    "tag": "観光",
    "kicker": "TOJI",
    "title": "東寺 半日モデルコース。五重塔と立体曼荼羅をめぐる",
    "sub": "観光 / TOJI",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Toji-Nandaimon_2015.jpg/1280px-Toji-Nandaimon_2015.jpg"
  },
  {
    "id": "kyoto-daigoji",
    "no": "G10-02",
    "tag": "観光",
    "kicker": "DAIGOJI",
    "title": "醍醐寺を歩く。五重塔と三宝院の庭",
    "sub": "京都・伏見区醍醐／DAIGOJI",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Daigoji_Kyoto01s5s4110.jpg/1280px-Daigoji_Kyoto01s5s4110.jpg"
  },
  {
    "id": "kyoto-kamo-shrines",
    "no": "G10-03",
    "tag": "さんぽ",
    "kicker": "KAMO SHRINES",
    "title": "上賀茂・下鴨を歩く。糺の森と賀茂の二社",
    "sub": "KAMO SHRINES｜京都・北区／左京区",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/KamigamoJinjya_Saiden.jpg/1280px-KamigamoJinjya_Saiden.jpg"
  },
  {
    "id": "nara-tanzan-shrine",
    "no": "G10-04",
    "tag": "さんぽ",
    "kicker": "TANZAN",
    "title": "談山神社を歩く。多武峰の十三重塔と紅葉",
    "sub": "山ふところの社で、藤の昔と朱の秋に出会う",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/061202_Tanzan-jinja_Sakurai_Nara_pref_Japan01s8.jpg/1280px-061202_Tanzan-jinja_Sakurai_Nara_pref_Japan01s8.jpg"
  },
  {
    "id": "hyogo-takeda-castle",
    "no": "G10-06",
    "tag": "観光",
    "kicker": "TAKEDA CASTLE",
    "title": "竹田城跡。天空の城と雲海の朝",
    "sub": "雲海と山城を、ふもとから頂きまで一日かけて味わう",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/%E7%AB%B9%E7%94%B0%E5%9F%8E%E8%B7%A1_-_panoramio.jpg/1280px-%E7%AB%B9%E7%94%B0%E5%9F%8E%E8%B7%A1_-_panoramio.jpg"
  },
  {
    "id": "hyogo-awaji-akashi",
    "no": "G10-07",
    "tag": "海",
    "kicker": "AWAJI",
    "title": "淡路島。明石海峡大橋と花と海の島",
    "sub": "北の橋から南の渦へ、海ぞいを縦に走るドライブ",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Akashi_Bridge.JPG/1280px-Akashi_Bridge.JPG"
  },
  {
    "id": "shiga-biwako-terrace",
    "no": "G10-08",
    "tag": "絶景",
    "kicker": "BIWAKO TERRACE",
    "title": "びわ湖テラス。山上から望む琵琶湖の大パノラマ",
    "sub": "湖西の稜線へ、ロープウェイで一気に標高1,100mの水景を見上げる",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Biwako_Valley_-_panoramio_%286%29.jpg/1280px-Biwako_Valley_-_panoramio_%286%29.jpg"
  },
  {
    "id": "wakayama-kimiidera-wakaura",
    "no": "G10-09",
    "tag": "さんぽ",
    "kicker": "KIMIIDERA",
    "title": "紀三井寺と和歌浦を歩く。名草の海辺と古社",
    "sub": "和歌山市・名草山の麓から、万葉に詠まれた潟の岸へ",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/%E7%B4%80%E4%B8%89%E4%BA%95%E5%AF%BA2_-_panoramio.jpg/1280px-%E7%B4%80%E4%B8%89%E4%BA%95%E5%AF%BA2_-_panoramio.jpg"
  },
  {
    "id": "aichi-korankei",
    "no": "G10-10",
    "tag": "紅葉",
    "kicker": "KORANKEI",
    "title": "香嵐渓。待月橋ともみじの渓谷",
    "sub": "巴川がきざんだ谷を、朱の橋から飯盛山の頂へ。色づく木立を歩いて登る秋",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Korankei5.jpg/1280px-Korankei5.jpg"
  },
  {
    "id": "aichi-okazaki-castle",
    "no": "G10-11",
    "tag": "観光",
    "kicker": "OKAZAKI CASTLE",
    "title": "岡崎城 半日モデルコース。家康生誕の城と八丁味噌",
    "sub": "天守からビスタライン、そして味噌蔵へ",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Okazaki_Castle_2023.jpg/1280px-Okazaki_Castle_2023.jpg"
  },
  {
    "id": "shizuoka-fujinomiya",
    "no": "G10-12",
    "tag": "さんぽ",
    "kicker": "FUJINOMIYA",
    "title": "富士宮を歩く。浅間大社の湧玉池と富士の伏流水",
    "sub": "水音をたどって、富士の西麓をひと巡り",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Wakutamaike.JPG/1280px-Wakutamaike.JPG"
  },
  {
    "id": "shizuoka-oigawa-sumata",
    "no": "G10-13",
    "tag": "自然",
    "kicker": "OIGAWA",
    "title": "大井川・寸又峡。SLと夢のかけ橋",
    "sub": "茶畑を蒸気が縫い、渓谷に橋が架かる。鉄道で深まる大井川の奥へ",
    "image": "https://upload.wikimedia.org/wikipedia/commons/7/77/Flickr3_027_Oigawa_Railway_C56_44_and_49616.jpg"
  },
  {
    "id": "hokkaido-toyako",
    "no": "G10-14",
    "tag": "絶景",
    "kicker": "TOYAKO",
    "title": "洞爺湖。火山と湖の絶景めぐり",
    "sub": "噴火が刻んだ地形を、湖上と山上から読み解く",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Mount_Showa-shinzan_01.jpg/1280px-Mount_Showa-shinzan_01.jpg"
  },
  {
    "id": "hokkaido-shiretoko",
    "no": "G10-15",
    "tag": "自然",
    "kicker": "SHIRETOKO",
    "title": "知床。世界自然遺産の原生の岬",
    "sub": "陸の道が尽きるところから、流氷が育てた森と海を歩く",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/140829_Ichiko_of_Shiretoko_Goko_Lakes_Hokkaido_Japan01s5.jpg/1280px-140829_Ichiko_of_Shiretoko_Goko_Lakes_Hokkaido_Japan01s5.jpg"
  },
  {
    "id": "kagoshima-kirishima",
    "no": "G10-16",
    "tag": "さんぽ",
    "kicker": "KIRISHIMA",
    "title": "霧島神宮を歩く。朱の社殿と高千穂の山々",
    "sub": "天孫降臨の伝説が眠る山あいを、湯けむりとともに辿る半日",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Kirishima-Jingu_Washing-hands.jpg/1280px-Kirishima-Jingu_Washing-hands.jpg"
  }
];

export const NEWGUIDE10_FEATURE_ARTICLES: Record<string, FeatureArticle> = {
  "kyoto-toji-temple": {
    "id": "kyoto-toji-temple",
    "no": "G10-01",
    "articleType": "course",
    "kicker": "TOJI",
    "title": "東寺 半日モデルコース。五重塔と立体曼荼羅をめぐる",
    "titleHTML": "東寺 半日モデルコース。<br>五重塔と立体曼荼羅をめぐる",
    "subtitle": "観光 / TOJI",
    "lede": "京都駅の南、近鉄でひと駅の場所に、平安京の記憶をそのまま残す寺がある。東寺は794年の平安京遷都の2年後、延暦15年（796年）に国家鎮護の官寺として羅城門の東に建てられ、のちに空海へ託されて真言密教の根本道場となった。観光地として華やかというより、仏像と建築が静かに密度を持って積み重なっている場所、というのが歩いてみての実感に近い。この半日コースは、敷地の南端からまっすぐ北へ進むのではなく、まず塔を遠目に確かめ、堂内で曼荼羅を体で受け止め、最後に空海の私的な空間へ降りていく――拝む対象が大きな建築から人の像へと縮んでいく順で組み立てた。午前のうちに門をくぐり、昼前に境内を出るくらいの分量で考えている。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Toji-Nandaimon_2015.jpg/1280px-Toji-Nandaimon_2015.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "東寺 南大門",
        "cuisine": "重要文化財・門",
        "area": "京都市南区",
        "purpose": "9:15ごろ。境内の南の入口。ここで全体の伽藍配置を確かめてからコースを始める",
        "desc": "九条通に面して建つ境内最大の門で、もとは三十三間堂の西門だった建物を明治期に移築したと伝わる。八脚門の堂々とした構えの先に、金堂・講堂・五重塔が境内の軸に沿って並ぶ。この門をくぐった瞬間に、東寺が個々の堂の集まりではなく、軸線を意識して設計された官寺だったことが体でわかるので、最初に通る門としてふさわしい。門の手前から五重塔が境内の奥に覗く眺めも見ておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Toji-Nandaimon_2015.jpg/1280px-Toji-Nandaimon_2015.jpg"
        ],
        "specs": [
          {
            "k": "種別",
            "v": "重要文化財・八脚門"
          },
          {
            "k": "位置",
            "v": "境内南端・九条通沿い"
          },
          {
            "k": "通行",
            "v": "境内入口（拝観受付は堂エリア）"
          }
        ],
        "transit": "近鉄東寺駅から徒歩約10分／JR京都駅八条口から徒歩約15分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "東寺 五重塔",
        "cuisine": "国宝・塔",
        "area": "京都市南区",
        "purpose": "9:25ごろ。まず外から全景を仰ぎ、この日の基準点にする",
        "desc": "高さ約55mの木造塔で、現在のものは寛永21年（1644年）に徳川家光が再建奉納した五代目にあたる。落雷などで四度失われながら同じ姿で建て直されてきた歴史そのものが、この塔が京都駅周辺の空に長く目印であり続けた理由を物語っている。初層内部は柱や壁に密教世界が極彩色で描かれた空間だが、ふだんは非公開で、特別公開の期間にだけ扉が開く。まずは外から全景を仰いで、コースの起点にしたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Kyoto_To-ji_Pagode_02.jpg/1280px-Kyoto_To-ji_Pagode_02.jpg"
        ],
        "specs": [
          {
            "k": "高さ",
            "v": "約55m（木造塔）"
          },
          {
            "k": "指定",
            "v": "国宝"
          },
          {
            "k": "初層内拝",
            "v": "特別公開時のみ（要事前確認）"
          }
        ],
        "transit": "南大門から境内を北へ進み、有料エリア南東隅へ。近鉄東寺駅から徒歩約10分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "東寺 金堂",
        "cuisine": "国宝・本堂",
        "area": "京都市南区",
        "purpose": "9:40ごろ。有料エリアに入って向かう、東寺の本尊を安置する中心の堂",
        "desc": "創建時の堂は焼失し、現在の建物は桃山時代の慶長8年（1603年）に豊臣秀頼の発願で再建された。屋根の中央が一段高く持ち上がる構えは、和様に大仏様の手法を取り込んだもので、内部に入ると薬師如来を中尊とする薬師三尊が見上げるほどの大きさで迎える。台座をぐるりと十二神将が囲む配置は、堂そのものが一つの仏の世界として設計されていることを伝えてくる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Japan_2020_Golden_Hall%2C_Toji.jpg/1280px-Japan_2020_Golden_Hall%2C_Toji.jpg"
        ],
        "specs": [
          {
            "k": "本尊",
            "v": "薬師三尊像"
          },
          {
            "k": "再建",
            "v": "慶長8年（1603年）"
          },
          {
            "k": "拝観時間",
            "v": "8:00〜17:00（受付終了16:30・公式で要確認）"
          }
        ],
        "transit": "五重塔から拝観路を北西へすぐ（近鉄東寺駅から徒歩約10分）"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "東寺 講堂（立体曼荼羅）",
        "cuisine": "重要文化財・堂",
        "area": "京都市南区",
        "purpose": "10:00ごろ。このコースの核心。21躯の仏像が組む立体の曼荼羅の中に立つ",
        "desc": "空海が密教の教えを目に見える形で示そうと構想した堂で、堂内には大日如来を中心に如来・菩薩・明王・天部など21躯の仏像が立体曼荼羅として配置されている。平面の図像ではなく像の群れが空間に並ぶため、どこに立つかで仏どうしの関係が変わって見え、絵解きの図とはまったく違う体験になる。多くが平安時代の作で、密教彫刻の出発点を間近で確かめられるのがこの堂ならではの価値だ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Kyoto_To-ji_Kodo_Innen_1.jpg/1280px-Kyoto_To-ji_Kodo_Innen_1.jpg"
        ],
        "specs": [
          {
            "k": "構成",
            "v": "21躯の立体曼荼羅"
          },
          {
            "k": "中尊",
            "v": "大日如来"
          },
          {
            "k": "拝観時間",
            "v": "8:00〜17:00（受付終了16:30・公式で要確認）"
          }
        ],
        "transit": "金堂のすぐ北隣（近鉄東寺駅から徒歩約10分）"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "東寺 御影堂（大師堂）",
        "cuisine": "国宝・堂",
        "area": "京都市南区",
        "purpose": "10:30ごろ。有料エリアを出たあとに立ち寄る、拝観無料の祈りの場で半日を締める",
        "desc": "空海がかつて住房とした場所に建つ堂で、現在の建物は康暦2年（1380年）の再建で国宝に指定されている。堂内には弘法大師坐像と、空海の念持仏と伝わる秘仏の不動明王坐像が祀られ、今も毎朝、空海へ食事を供える生身供（しょうじんく）が続けられている。拝観料のかからない区域で、観光というより手を合わせに来る人が多く、線香の匂いと静けさが境内のほかの堂とは違う時間を作っている。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Kyoto_Toji_Mieido_C0973.jpg/1280px-Kyoto_Toji_Mieido_C0973.jpg"
        ],
        "specs": [
          {
            "k": "指定",
            "v": "国宝（大師堂）"
          },
          {
            "k": "本尊",
            "v": "弘法大師坐像・不動明王坐像（秘仏）"
          },
          {
            "k": "拝観",
            "v": "無料区域"
          }
        ],
        "transit": "講堂から境内を北西へ徒歩数分（近鉄東寺駅から徒歩約10分）"
      }
    ],
    "sideArticles": [
      {
        "t": "醍醐寺を歩く。五重塔と三宝院の庭",
        "h": "/feature/kyoto-daigoji",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Daigoji_Kyoto01s5s4110.jpg/1280px-Daigoji_Kyoto01s5s4110.jpg"
      },
      {
        "t": "上賀茂・下鴨を歩く。糺の森と賀茂の二社",
        "h": "/feature/kyoto-kamo-shrines",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/KamigamoJinjya_Saiden.jpg/1280px-KamigamoJinjya_Saiden.jpg"
      }
    ],
    "quote": "塔を仰ぎ、堂で曼荼羅に囲まれ、最後に空海の住まいへ。大きな建築から人の像へと、視線が静かに降りていく半日。",
    "quoteCite": "マチノワ編集部",
    "closing": "9時すぎに近鉄東寺駅を出て、住宅地の路地を抜けると南大門が見えてくる。門前で一度立ち止まって全体の配置を眺めたら、有料エリアの拝観受付へ。9時半ごろ金堂へ入り、薬師三尊の量感に慣れたところで隣の講堂へ移ると、10時前後には立体曼荼羅の真ん中に立っている。仏像群をひと回りして外へ出れば、北西側の御影堂は10時半ごろ。ここは拝観無料の祈りの場なので、線香の匂いのなか弘法大師像に手を合わせて静かに過ごしたい。11時に再び五重塔を見上げて全体を写真に収め、11時半には門を出て京都駅方面へ。半日でも、平安京以来の時間がそれなりの重さで残るはずだ。なお金堂・講堂・五重塔は有料拝観エリア、南大門と御影堂は無料区域で、初層内拝の有無や各堂の料金・受付時間は時期で動く。出かける前に東寺の公式サイトで最新の案内を見ておくと安心できる。"
  },
  "kyoto-daigoji": {
    "id": "kyoto-daigoji",
    "no": "G10-02",
    "articleType": "guide",
    "kicker": "DAIGOJI",
    "title": "醍醐寺を歩く。五重塔と三宝院の庭",
    "titleHTML": "醍醐寺を歩く。<br>五重塔と三宝院の庭",
    "subtitle": "京都・伏見区醍醐／DAIGOJI",
    "lede": "地下鉄醍醐駅の地上に出ると、市街の喧騒がすっと遠のく。住宅地のゆるい坂を上っていくにつれ、空気にどこか湿った土と杉の匂いがまじりはじめる。総門をくぐった瞬間、左右に伸びる桜並木の枝が頭上で交差して、夏の光をやわらかく漉していた。砂利を踏む自分の足音がやけに大きく聞こえる。秀吉が花見に酔いしれたという山裾の寺は、観光地の顔をしながら、奥へ進むほど静けさを深くしていく。きょうはこの参道を、玄関の庭から山際の池まで、ゆっくりたどってみることにする。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Daigoji_Kyoto01s5s4110.jpg/1280px-Daigoji_Kyoto01s5s4110.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "三宝院庭園",
        "cuisine": "庭園・国宝書院",
        "area": "京都市伏見区醍醐",
        "purpose": "歩きはじめの一服。醍醐寺の玄関口で、桃山の庭と向き合う",
        "desc": "総門を入ってまず右手に現れるのが、この寺の本坊にあたる三宝院だ。表書院の縁に腰を下ろすと、目の前に池泉の庭がひらける。慶長3年の醍醐の花見にあたって秀吉自身が基本設計を引いたと伝わる庭で、刈り込みの曲線と力強い石組みが同居している。視線が吸い寄せられるのは、池のほとりに据えられた藤戸石。歴代の天下人が手元に置きたがったというこの一石が庭の重心になっていて、ただ美しいだけでなく、権力者が石ひとつに込めた執着まで透けて見えてくるのがこの庭の面白さだ。縁先に座ったまま、しばらく動けなくなる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Daigozi_09.jpg/1280px-Daigozi_09.jpg"
        ],
        "specs": [
          {
            "k": "指定",
            "v": "国の特別史跡・特別名勝"
          },
          {
            "k": "見どころ",
            "v": "藤戸石・表書院（国宝）"
          },
          {
            "k": "備考",
            "v": "庭の一部は特別拝観で公開"
          }
        ],
        "transit": "地下鉄東西線「醍醐」駅②番出口から徒歩約10分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "仁王門（西大門）",
        "cuisine": "山門・重要文化財",
        "area": "京都市伏見区醍醐",
        "purpose": "伽藍への入口。二体の金剛力士に見上げられて山域へ入る",
        "desc": "三宝院を出て参道を奥へ進むと、朱の柱が目に飛び込んでくる。下醍醐の伽藍へ入る門で、秀頼が慶長10年に再建させたものだ。立ち止まって見上げると、左右の金剛力士像の筋肉の張りに気圧される。口を開いた阿形と、結んだ吽形。実はこの二体、門より四百年あまり古い長承3年に勢増・仁増という仏師が彫ったもので、もとは南大門に立っていたという。新しい門に古い仁王が収まっているこのちぐはぐさを知ってから見上げると、像の表情がいっそう生々しい。ここをくぐると、空気がまた一段ひんやりする。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Daigoji_Nioumon.JPG/1280px-Daigoji_Nioumon.JPG"
        ],
        "specs": [
          {
            "k": "再建",
            "v": "慶長10年（1605）"
          },
          {
            "k": "金剛力士像",
            "v": "重要文化財・平安後期作"
          }
        ],
        "transit": "三宝院前から参道を東へ徒歩約3分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "醍醐寺 金堂",
        "cuisine": "本堂・国宝",
        "area": "京都市伏見区醍醐",
        "purpose": "伽藍の中心。本尊と向き合い、寺の信仰の芯に触れる",
        "desc": "仁王門の先、木立が切れて広い空が戻ってくるあたりに、どっしりと構えているのが金堂だ。屋根の反りが大きく、近づくほど軒の深さに包まれる感覚がある。堂の内には本尊の薬師如来が座す。面白いのは、この建物そのものが京都生まれではないこと。秀吉の命で紀州湯浅の寺から運ばれ、慶長5年に秀頼の代で組み上がったと伝わる。つまり目の前の柱や梁は、海を越え山を越えて醍醐の地に据え直された材なのだ。そう思って格子の奥を覗くと、薄暗がりにともる灯が、よその土地の記憶ごとこの堂を照らしているように見えてくる。手を合わせる人の背中が、しんと静かだった。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Daigoji_Kyoto01s5s4110.jpg/1280px-Daigoji_Kyoto01s5s4110.jpg"
        ],
        "specs": [
          {
            "k": "指定",
            "v": "国宝"
          },
          {
            "k": "本尊",
            "v": "薬師如来坐像"
          },
          {
            "k": "落慶",
            "v": "慶長5年（1600）"
          }
        ],
        "transit": "仁王門から参道を直進、徒歩約2分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "醍醐寺 五重塔",
        "cuisine": "国宝・塔",
        "area": "京都市伏見区醍醐",
        "purpose": "下醍醐の象徴。京都府内で現存最古の木造塔を仰ぐ",
        "desc": "金堂から少し南へ目を移すと、木々の上に塔身が抜けている。天暦5年に醍醐天皇の冥福を願って建てられたこの五重塔は、京都府内に現存する木造建築のなかで最も古い。高さおよそ38メートルのうち、上に伸びる相輪だけで全体の三分の一を占めるという独特の均衡で、だから見上げると塔がやけに天へ向かって長く感じられる。千年のあいだ、応仁の乱の戦火も京都の度重なる災いもくぐり抜けて、この一塔だけが倒れずに残った。初層内部の板壁には両界曼荼羅などが描かれているが、通常は外からの拝観で、塔の内側を覗ける機会はかぎられる。芝に立って首を反らせ、相輪の先が空に溶けていくのをただ眺めていた。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Daigo-ji_National_Treasure_World_heritage_Kyoto_%E5%9B%BD%E5%AE%9D%E3%83%BB%E4%B8%96%E7%95%8C%E9%81%BA%E7%94%A3_%E9%86%8D%E9%86%90%E5%AF%BA_%E4%BA%AC%E9%83%BD030.JPG/1280px-Daigo-ji_National_Treasure_World_heritage_Kyoto_%E5%9B%BD%E5%AE%9D%E3%83%BB%E4%B8%96%E7%95%8C%E9%81%BA%E7%94%A3_%E9%86%8D%E9%86%90%E5%AF%BA_%E4%BA%AC%E9%83%BD030.JPG"
        ],
        "specs": [
          {
            "k": "指定",
            "v": "国宝"
          },
          {
            "k": "建立",
            "v": "天暦5年（951）"
          },
          {
            "k": "高さ",
            "v": "約38メートル"
          }
        ],
        "transit": "金堂から南へすぐ、徒歩約1分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "弁天堂",
        "cuisine": "お堂・池畔",
        "area": "京都市伏見区醍醐",
        "purpose": "下醍醐のいちばん奥。水鏡の朱堂で歩きを締める",
        "desc": "伽藍を抜けてさらに奥へ歩くと、参道は林泉と呼ばれる小さな池のほとりに行き着く。池の縁に建つ朱塗りの弁天堂は昭和初期、醍醐天皇千年の御忌に合わせて建てられた比較的新しい堂で、祀られているのは音楽や学芸の神とされる弁才天だ。けれど新旧はここではあまり意味をなさない。秋にかえでや銀杏が色づくと、朱の堂と燃える葉が水面に映り込んで、池がもう一つの絵を抱える。この日はまだ青葉だったが、それでも水鏡に逆さまの堂が静かに揺れていて、伽藍の重厚さとはまた違う、息のつける景色だった。橋を渡る足音だけが、こつ、こつと響いていた。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Bentendo_Hall%2C_Daigo-ji.jpg/1280px-Bentendo_Hall%2C_Daigo-ji.jpg"
        ],
        "specs": [
          {
            "k": "建立",
            "v": "昭和5年（1930）"
          },
          {
            "k": "見頃",
            "v": "秋の紅葉期"
          }
        ],
        "transit": "五重塔から参道を奥へ徒歩約5分、林泉の奥"
      }
    ],
    "sideArticles": [
      {
        "t": "東寺 半日モデルコース。五重塔と立体曼荼羅をめぐる",
        "h": "/feature/kyoto-toji-temple",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Toji-Nandaimon_2015.jpg/1280px-Toji-Nandaimon_2015.jpg"
      },
      {
        "t": "上賀茂・下鴨を歩く。糺の森と賀茂の二社",
        "h": "/feature/kyoto-kamo-shrines",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/KamigamoJinjya_Saiden.jpg/1280px-KamigamoJinjya_Saiden.jpg"
      }
    ],
    "quote": "奥へ歩くほど、寺は静かになっていく",
    "quoteCite": "マチノワ編集部",
    "closing": "弁天池のほとりのベンチで、しばらく水面を眺めていた。来た道を振り返ると、玄関先の磨かれた庭から、桃山の権勢を映す堂宇、平安以来の塔、そして山の縁の小さな弁天堂まで、千年分の時間がひと続きの参道に並んでいたことに気づく。醍醐寺は広い。一日かけても上醍醐の山上までは届かなかった。それでも下醍醐をゆっくり歩いただけで、足の裏に残る砂利の感触ごと、この寺の懐の深さが伝わってくる。なお、拝観の区分や料金、特別公開の有無は時期で変わるので、出かける前に醍醐寺の公式サイトに一度目を通しておくと迷わない。坂を下りる頃には、入ってきたときの匂いがもう懐かしかった。"
  },
  "kyoto-kamo-shrines": {
    "id": "kyoto-kamo-shrines",
    "no": "G10-03",
    "articleType": "guide",
    "kicker": "KAMO SHRINES",
    "title": "上賀茂・下鴨を歩く。糺の森と賀茂の二社",
    "titleHTML": "上賀茂・下鴨を歩く。<br>糺の森と賀茂の二社",
    "subtitle": "KAMO SHRINES｜京都・北区／左京区",
    "lede": "朝のうちに北区へ上がってしまうのがいい。バスを降りて鳥居をくぐると、まず空気の湿り気と光の差し方が変わる。境内を流れる細い御手洗川の、浅くて澄んだ水音。その向こうに朱の楼門が立ち、白い砂を円錐に盛り上げた二つの立砂が、よく晴れた朝の光を受けている。京都の市街地の喧騒からほんの少し外れただけで、ここはもう別の時間が流れている。賀茂川をさかのぼった先の上賀茂と、その川がもう一本の流れと出会う三角州のほとりの下鴨——二つの社を、川と森をたどりながら南へ歩いていく半日の話。",
    "date": "2026-06-14",
    "reading": "約5分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/KamigamoJinjya_Saiden.jpg/1280px-KamigamoJinjya_Saiden.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "上賀茂神社（賀茂別雷神社）",
        "cuisine": "神社",
        "area": "京都市北区上賀茂本山",
        "purpose": "賀茂の信仰のはじまりを、立砂と川の流れる境内で感じる",
        "desc": "朱の一の鳥居をくぐると、芝生の参道がまっすぐ二の鳥居まで伸びている。その先、細殿の前に現れるのが、円錐形にきれいに盛られた二つの砂の山——立砂だ。これは社の北にそびえる神山にかたどったもので、ご祭神が天から降り立ったと伝わる山影を、砂で写し取っている。玄関先の盛り塩や、鬼門にまく清めの砂は、もとをたどればこの二つの山にゆきつくという。境内を歩いていて何より印象に残るのは、ならの小川がさらさらと流れ続けていること。神社というと静止した荘厳さを思い浮かべるけれど、ここはずっと水が動いていて、音がやまない。橋を渡り、せせらぎ沿いに進むと、まだ夏の朝なのに足もとだけ涼しい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/KamigamoJinjya_Saiden.jpg/1280px-KamigamoJinjya_Saiden.jpg"
        ],
        "specs": [
          {
            "k": "拝観",
            "v": "境内自由（特別拝観は別途）"
          },
          {
            "k": "見どころ",
            "v": "立砂・細殿・ならの小川"
          }
        ],
        "transit": "地下鉄烏丸線「北山」駅から市バス4系統で約15分、「上賀茂神社前」下車すぐ（徒歩なら北山駅から約25分）"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "糺の森",
        "cuisine": "森・参道",
        "area": "京都市左京区下鴨泉川町",
        "purpose": "原生の森のトンネルをくぐって、下鴨の社へ近づく",
        "desc": "賀茂川沿いに南へ下り、左京区へ入ると、ふいに道の先が暗くなる。糺の森だ。ケヤキやエノキ、ムクノキの巨木が頭上で枝を組み、参道は緑のトンネルになっている。十二万平方メートルあまりというこの森は、平安より前の山城のおもかげを今に伝える原生林で、世界遺産の一部にも数えられている。一歩入ると、さっきまで照りつけていた日ざしがふっと和らぎ、体感の温度がはっきり下がるのがわかる。鳥の声と、足もとを流れる泉川のかすかな水音だけが響く。『方丈記』を書いた鴨長明は、この森に縁のある家に生まれた。木洩れ日の落ちる土の道を踏みしめながら、八百年前の人も同じ薄暗がりを歩いたのかと思うと、足取りがすこし慎重になる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/%E7%B3%BA%E3%81%AE%E6%A3%AE_20260208.jpg/1280px-%E7%B3%BA%E3%81%AE%E6%A3%AE_20260208.jpg"
        ],
        "specs": [
          {
            "k": "区分",
            "v": "原生林・世界遺産（下鴨神社境内）"
          },
          {
            "k": "歩く",
            "v": "森を貫く約600mの表参道"
          }
        ],
        "transit": "京阪・叡電「出町柳」駅から徒歩約12分／市バス「糺ノ森」下車すぐ"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "河合神社",
        "cuisine": "神社",
        "area": "京都市左京区下鴨泉川町",
        "purpose": "森のなかの摂社で、手鏡のかたちの絵馬に願いをこめる",
        "desc": "森の参道を南側から入ってすぐ、左手にこぢんまりとした社が現れる。下鴨神社の摂社・河合神社で、ご祭神は神武天皇の母にあたる玉依姫命。女性を守る神として古くから信仰を集めてきた。ここで目を引くのが、手鏡そっくりのかたちをした鏡絵馬だ。表に描かれたのっぺりした顔に、自分の化粧道具や色鉛筆で目鼻を描き入れ、裏に願いと名を記して奉納する。机の上に並んだ奉納済みの絵馬を眺めていると、描き手それぞれの「なりたい顔」がにじんでいて、しばらく見飽きない。森の奥には、鴨長明が晩年を過ごしたという小さな庵を復元した建物も置かれている。賑やかな本宮とは違う、森にうずもれた静かな時間がここには流れている。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/%E6%B2%B3%E5%90%88%E7%A5%9E%E7%A4%BE_-_panoramio_%281%29.jpg/1280px-%E6%B2%B3%E5%90%88%E7%A5%9E%E7%A4%BE_-_panoramio_%281%29.jpg"
        ],
        "specs": [
          {
            "k": "区分",
            "v": "下鴨神社 摂社"
          },
          {
            "k": "授与",
            "v": "鏡絵馬（最新の初穂料は社頭で確認を）"
          }
        ],
        "transit": "糺の森の南部、表参道入口のそば／市バス「糺ノ森」下車徒歩約3分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "下鴨神社（賀茂御祖神社）",
        "cuisine": "神社",
        "area": "京都市左京区下鴨泉川町",
        "purpose": "森を抜けた先、朱の楼門と湧き水の社で森歩きを締める",
        "desc": "森が途切れると、視界がひらけて朱塗りの楼門がそびえる。下鴨神社、正しくは賀茂御祖神社。上賀茂の祖にあたる神々を祀る古社で、上賀茂とあわせて賀茂の二社と呼ばれる。門をくぐる手前、左手には相生社があり、二本の木が途中で一本に結ばれた御神木・連理の賢木が立つ。縁結びの木として知られるこの一本は、何代も植え継がれてきたものだという。本殿に手を合わせたあと、ぜひ立ち寄りたいのが御手洗社。社殿が湧き水の池の上に建てられていて、夏には足を浸して無病息災を願う神事も営まれる。みたらし団子の名は、この池に湧く水の泡にちなむと伝わる。森の冷気と湧き水の冷たさが地続きで、上流から流れてきた水の物語が、ここでひとつ閉じる感覚があった。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Kyoto_Shimogamo-jinja_Romon_7.jpg/1280px-Kyoto_Shimogamo-jinja_Romon_7.jpg"
        ],
        "specs": [
          {
            "k": "拝観",
            "v": "境内自由（大炊殿などの特別拝観は別途）"
          },
          {
            "k": "見どころ",
            "v": "楼門・相生社・御手洗社"
          }
        ],
        "transit": "京阪・叡電「出町柳」駅から徒歩約12分／市バス「下鴨神社前」下車すぐ"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "賀茂大橋と鴨川デルタ",
        "cuisine": "川辺",
        "area": "京都市上京区・左京区（出町柳）",
        "purpose": "二つの川が出会う三角州で、半日の川歩きを締めくくる",
        "desc": "下鴨神社の参道を南へ抜けきると、急に空が大きくひらける。賀茂大橋のたもと、西から下ってきた賀茂川と東からの高野川がちょうど合流する地点で、その股のあいだに突き出した緑の三角州が、鴨川デルタと呼ばれる場所だ。川面には亀や千鳥をかたどった飛び石が点々と並び、子どもも大人も、めいめいの調子で対岸へぴょんぴょんと渡っていく。土手に腰を下ろして見ていると、上賀茂で立砂のあいだを流れていたならの小川も、糺の森を潤していた泉川も、結局はこの一本の流れへ集まってくるのだとわかる。ばらばらに歩いた半日が、足もとの水で一つにつながる。橋の上から眺めると、二色の川がVの字に交わって、ゆっくりと南へ去っていくのが見えた。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/A_crossing_pathway_with_stepping_stones_at_Kamo_River%2C_Kyoto%2C_Japan.jpg/1280px-A_crossing_pathway_with_stepping_stones_at_Kamo_River%2C_Kyoto%2C_Japan.jpg"
        ],
        "specs": [
          {
            "k": "立地",
            "v": "賀茂川・高野川の合流点"
          },
          {
            "k": "歩く",
            "v": "デルタの飛び石・川べりの土手"
          }
        ],
        "transit": "京阪・叡電「出町柳」駅からすぐ"
      }
    ],
    "sideArticles": [
      {
        "t": "東寺 半日モデルコース。五重塔と立体曼荼羅をめぐる",
        "h": "/feature/kyoto-toji-temple",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Toji-Nandaimon_2015.jpg/1280px-Toji-Nandaimon_2015.jpg"
      },
      {
        "t": "醍醐寺を歩く。五重塔と三宝院の庭",
        "h": "/feature/kyoto-daigoji",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Daigoji_Kyoto01s5s4110.jpg/1280px-Daigoji_Kyoto01s5s4110.jpg"
      }
    ],
    "quote": "川の音が、ずっと足もとについてくる。",
    "quoteCite": "マチノワ編集部",
    "closing": "出町柳の駅前まで降りてきて、ふり返ると、歩いてきた方角の空がまだ森の緑をうっすら映している気がした。上賀茂で見た二つの砂の山、糺の森のひんやりした薄暗がり、御手洗の湧き水の冷たさ——別々の場所のはずなのに、ぜんぶ一本の川の話としてつながっている。賀茂の二社は、神社を巡ったというより、川をひとつ下ったという感覚で終わる。汗ばんだ手のひらを、最後にもう一度デルタの流れにひたした。冷たい。半日ぶんの暑さが、そこからすっと抜けていった。なお、拝観時間や授与品の値段は折にふれて変わるので、出かける前にそれぞれの社の公式の案内に目を通しておくと安心だ。"
  },
  "nara-tanzan-shrine": {
    "id": "nara-tanzan-shrine",
    "no": "G10-04",
    "articleType": "guide",
    "kicker": "TANZAN",
    "title": "談山神社を歩く。多武峰の十三重塔と紅葉",
    "titleHTML": "談山神社を歩く。<br>多武峰の十三重塔と紅葉",
    "subtitle": "山ふところの社で、藤の昔と朱の秋に出会う",
    "lede": "桜井駅の南口でバスを待っていると、山の方から冷えた空気が下りてくる。揺られること二十数分、谷を縫う道を登りつめた終点で降りると、もう町の音はどこにもない。耳に残るのは沢の水と、足もとを踏む落ち葉の乾いた音だけ。多武峰の懐に抱かれた談山神社は、参道の杉木立に光が斜めに差し込み、その奥にだけ朱の色がともっているような場所だ。秋なら、その朱が境内じゅうの紅葉と溶け合う。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/061202_Tanzan-jinja_Sakurai_Nara_pref_Japan01s8.jpg/1280px-061202_Tanzan-jinja_Sakurai_Nara_pref_Japan01s8.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "十三重塔",
        "cuisine": "塔・重要文化財",
        "area": "奈良・桜井(多武峰)",
        "purpose": "境内に入って最初に目を奪われる、社のシンボルを仰ぐ",
        "desc": "参道を登って楼門の脇に出ると、檜皮の屋根を十三段に積み上げた塔がいきなり視界を埋める。木造の十三重塔としては現存する例が他に見当たらず、いま建つのは室町期に再建されたもの。藤原鎌足の墓塔と伝えられ、高さは十七メートルほど。石塔の十三重なら各地にあるが、これは木で組み上げられているところに談山神社ならではの凄みがある。秋には足もとから梢まで紅葉が塔を取り巻き、朱でも金でもない、層を重ねた木の色が一段ずつ空へ伸びていく。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/061202_Tanzan-jinja_Sakurai_Nara_pref_Japan01s8.jpg/1280px-061202_Tanzan-jinja_Sakurai_Nara_pref_Japan01s8.jpg"
        ],
        "specs": [
          {
            "k": "形式",
            "v": "木造十三重塔(室町期再建)"
          },
          {
            "k": "拝観料",
            "v": "大人600円・小人300円"
          },
          {
            "k": "拝観時間",
            "v": "8:30〜16:30(最終受付16:00)"
          }
        ],
        "transit": "桜井駅南口から奈良交通コミュニティバスで約25分、終点「談山神社」下車、参道を登ってすぐ"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "拝殿",
        "cuisine": "社殿・重要文化財",
        "area": "奈良・桜井(多武峰)",
        "purpose": "朱塗りの舞台に上がり、吊り灯籠ごしに谷を見下ろす",
        "desc": "塔から石段をひと登りすると、山の斜面に張り出すように朱塗りの拝殿が建つ。永正十七年(一五二〇年)の造営と伝わる舞台造で、外周をぐるりと吊り灯籠が縁取っている。板敷きに上がって欄干にもたれると、さっき見上げた塔が今度は眼下に沈み、谷の紅葉が一望のもとに広がる。中央の天井には香木が使われているとも言われ、堂内には独特の気配が漂う。社殿の朱と窓外の紅が一枚の絵のように重なるのは、この高さに拝殿が架けられているからこそだ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Tanzan_jinja_lanterns_at_balcony.jpg/1280px-Tanzan_jinja_lanterns_at_balcony.jpg"
        ],
        "specs": [
          {
            "k": "造営",
            "v": "永正17年(1520年)・舞台造"
          },
          {
            "k": "見どころ",
            "v": "外周を巡る吊り灯籠"
          }
        ],
        "transit": "十三重塔から石段を上がった一段高い場所、本殿の手前"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "東殿(恋神社)",
        "cuisine": "摂社・縁結び",
        "area": "奈良・桜井(多武峰)",
        "purpose": "鎌足の妻・鏡女王を祀る社に手を合わせる",
        "desc": "本殿の華やぎから少し離れ、回廊を抜けて東へ下ると、ひっそりとした東殿に出る。祀られているのは鏡女王、鎌足の妻にあたる人で、万葉の歌人・額田王の姉とも伝わる。和歌に長け、情の深い恋の歌を残したことから、いつしか縁結びの社として親しまれるようになった。境内の壮大な社殿群とは対照的に、ここだけは女性的なやわらかさがあり、結びの磐座に触れて願をかける参拝者の姿が絶えない。歴史の表舞台ではなく、その傍らに立った人を祀る場所だ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Tanzan-jinja%2C_touden-1.jpg/1280px-Tanzan-jinja%2C_touden-1.jpg"
        ],
        "specs": [
          {
            "k": "祭神",
            "v": "鏡女王"
          },
          {
            "k": "ご利益",
            "v": "縁結び"
          }
        ],
        "transit": "本殿から回廊を抜け、東へ下った一角"
      }
    ],
    "sideArticles": [
      {
        "t": "東寺 半日モデルコース。五重塔と立体曼荼羅をめぐる",
        "h": "/feature/kyoto-toji-temple",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Toji-Nandaimon_2015.jpg/1280px-Toji-Nandaimon_2015.jpg"
      },
      {
        "t": "醍醐寺を歩く。五重塔と三宝院の庭",
        "h": "/feature/kyoto-daigoji",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Daigoji_Kyoto01s5s4110.jpg/1280px-Daigoji_Kyoto01s5s4110.jpg"
      }
    ],
    "quote": "谷をひとつ越えた先に、藤の昔も朱の秋もそのまま残っている",
    "quoteCite": "マチノワ編集部",
    "closing": "石段を下りきって振り返ると、十三重塔の最上層だけが木々の上に頭を出していて、ここがやはり山の社だったと思い知る。藤原の世のはじまりも、二人の密談も、千年以上の時を経てなお、この谷の静けさの底に沈んでいる。帰りのバスまでの間、もう一度拝殿の前へ戻り、朱の柱越しに塔を見上げてしまった。観光地として急いで見て回るには惜しい、ゆっくりと足の運びに任せたくなる山だった。なお拝観時間や紅葉まつりの日程は折々に変わるので、出かける前に神社の公式の案内に目を通しておくと安心だ。"
  },
  "hyogo-takeda-castle": {
    "id": "hyogo-takeda-castle",
    "no": "G10-06",
    "articleType": "guide",
    "kicker": "TAKEDA CASTLE",
    "title": "竹田城跡。天空の城と雲海の朝",
    "titleHTML": "竹田城跡。<br>天空の城と雲海の朝",
    "subtitle": "雲海と山城を、ふもとから頂きまで一日かけて味わう",
    "lede": "雲海は、待つものだ。秋から初冬、よく晴れて冷え込んだ夜が明ける前後、円山川から立ちのぼった霧が谷を満たし、標高354メートルの古城山の石垣だけが白い海の上に取り残される。その一瞬を見たいなら、向かい合う二つの立ち位置を覚えておくとよい。城そのものに登って霧を足元に見下ろすか、対岸の山腹から城が海に浮かぶさまを正面に望むか。同じ朝でも、どちらに立つかで風景はまるで別物になる。この特集は、その雲海と山城という一点に絞り、霧が晴れたあとの城下までを歩いてつなぐ。出発は夜明け前。だからこそ、列車で着くなら駅舎の灯りから一日が始まる。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/%E7%AB%B9%E7%94%B0%E5%9F%8E%E8%B7%A1_-_panoramio.jpg/1280px-%E7%AB%B9%E7%94%B0%E5%9F%8E%E8%B7%A1_-_panoramio.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "竹田城跡",
        "cuisine": "城跡・国史跡",
        "area": "兵庫県朝来市和田山町竹田",
        "purpose": "雲海に浮かぶ石垣の縄張りを、頂上から足元に見下ろす",
        "desc": "穴太積みの石垣がほぼ完存し、天守台から南千畳・北千畳・花屋敷へと伸びる縄張りを地上で歩いて確かめられるのが、ここが「天空の城」と呼ばれる理由の核心だ。秋から初冬の冷え込んだ朝、円山川の霧が城を取り囲むと、自分が立つ石垣の列だけが雲の上に残る。雲海は気象が揃った日にしか出ないが、晴れていても標高354メートルからの但馬の山並みは見応えがある。石垣保護のため立入区域とルートが決められており、足元は滑りやすいので歩きやすい靴で。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/%E7%AB%B9%E7%94%B0%E5%9F%8E%E8%B7%A1_-_panoramio.jpg/1280px-%E7%AB%B9%E7%94%B0%E5%9F%8E%E8%B7%A1_-_panoramio.jpg"
        ],
        "specs": [
          {
            "k": "観覧料",
            "v": "高校生以上500円／中学生以下無料（現金・PayPay）"
          },
          {
            "k": "支払い",
            "v": "登山道の料金所で支払い"
          },
          {
            "k": "観覧時間",
            "v": "季節で変動・要公式確認"
          },
          {
            "k": "見頃",
            "v": "雲海は例年9〜11月の早朝"
          }
        ],
        "transit": "JR播但線・竹田駅から表米神社登山道・駅裏登山道で徒歩約40分。車は山城の郷駐車場から西登山道で約40分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "立雲峡",
        "cuisine": "展望地・自然公園",
        "area": "兵庫県朝来市和田山町竹田",
        "purpose": "対岸の朝来山から、雲海に浮かぶ城を正面に望む",
        "desc": "城に登るのではなく、谷を挟んだ朝来山の中腹から竹田城跡そのものを眺めるための場所。第1展望台まで上がると、霧が出た朝には石垣の城が雲の海にぽつんと浮かぶ「天空の城」の定番構図が正面に開ける。2021年に第1展望台よりさらに高い「立雲峡テラス」が整備され、ガラスのモニュメント越しに城へ光の道が伸びるように撮れる仕掛けも置かれた。登山口で1人300円の環境整備協力金を渡してから登る。展望台までは未舗装の山道なので、ヘッドライトと滑りにくい靴を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/20101106Rituunkyo.JPG/1280px-20101106Rituunkyo.JPG"
        ],
        "specs": [
          {
            "k": "協力金",
            "v": "1人300円（登山口で）"
          },
          {
            "k": "第1展望台",
            "v": "駐車場から徒歩約40分"
          },
          {
            "k": "第2展望台",
            "v": "徒歩約20分"
          },
          {
            "k": "立雲峡テラス",
            "v": "2021年整備・光の道天望所"
          }
        ],
        "transit": "JR竹田駅から車で約5分。専用駐車場から第1展望台まで徒歩約40分、第2展望台まで約20分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "竹田駅",
        "cuisine": "鉄道駅・観光案内",
        "area": "兵庫県朝来市和田山町竹田",
        "purpose": "城下の一日を始める起点。駅舎そのものが城下町の表情",
        "desc": "1906年(明治39年)開業の黒瓦・木造の駅舎が今も使われ、ホームに立つと正面の古城山に城跡を背負って見える構図になる。駅舎内に観光案内があり、竹田城跡のパンフレットや登山道の最新情報を確かめてから歩き出せるのが、夜明け前に動く雲海狙いの旅では心強い。車中心の城だが、列車で来ればこの古い駅から表米神社登山道や寺町通りへそのまま徒歩で入れる。駅前から城へ向かう天空バスも季節運行される。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/1/10/JR_Takeda_Station.jpg"
        ],
        "specs": [
          {
            "k": "開業",
            "v": "1906年(明治39年)"
          },
          {
            "k": "駅舎",
            "v": "黒瓦の木造駅舎・観光案内併設"
          },
          {
            "k": "路線",
            "v": "JR播但線"
          },
          {
            "k": "登山口まで",
            "v": "駅から各登山道へ徒歩圏"
          }
        ],
        "transit": "JR播但線。和田山駅から1駅、姫路方面からも直通あり"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "表米神社",
        "cuisine": "神社・文化財",
        "area": "兵庫県朝来市和田山町竹田",
        "purpose": "城へ最も近い登山口の一つ。石積みの相撲桟敷を見る",
        "desc": "格技を好んだと伝わる表米宿彌命を祀る社で、参道脇の広場に半円形の石積み段型桟敷が残るのが他にない見どころ。中央の土俵を六段の石積みが半円に囲み、野外の観覧席のような構えで、県指定の文化財になっている。歌舞伎を上演したとも伝わる舞台も向き合って立つ。この境内が表米神社登山道の入口にあたり、竹田城へ向かう前に立ち寄って手を合わせる人も多い。早朝の登城前なら、薄明かりの石段が静かだ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/%E8%A1%A8%E7%B1%B3%E7%A5%9E%E7%A4%BE%E7%9B%B8%E6%92%B2%E6%A1%9F%E6%95%B7%E3%81%A8%E8%88%9E%E5%8F%B0.JPG/1280px-%E8%A1%A8%E7%B1%B3%E7%A5%9E%E7%A4%BE%E7%9B%B8%E6%92%B2%E6%A1%9F%E6%95%B7%E3%81%A8%E8%88%9E%E5%8F%B0.JPG"
        ],
        "specs": [
          {
            "k": "見どころ",
            "v": "半円形石積段型の相撲桟敷"
          },
          {
            "k": "指定",
            "v": "兵庫県指定文化財"
          },
          {
            "k": "祭神",
            "v": "表米宿彌命"
          },
          {
            "k": "登山口",
            "v": "表米神社登山道の入口"
          }
        ],
        "transit": "JR竹田駅から徒歩約5分。境内から表米神社登山道で竹田城跡へ徒歩約40分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "山城の郷",
        "cuisine": "観光交流施設・食事処",
        "area": "兵庫県朝来市和田山町殿",
        "purpose": "車利用の起点。但馬牛で雲海登山の前後を補う",
        "desc": "車で来た場合に城へ最も近づける施設で、ここから先の中腹へは一般車が入れず、西登山道を歩くか天空バス・タクシーに乗り換える、いわば登城の関所にあたる。背後に竹田城跡を望むテラスがあり、レストランでは但馬牛や地元野菜を使った料理が出る。雲海狙いで暗いうちに山へ入る前の腹ごしらえにも、下山後の一息にも使える。秋の土日祝には早朝の朝食営業が組まれる時期もあり、登城前に温かいものを口にできるのはありがたい。営業時間は時期で動くので公式で確かめたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Asago_Yamajiro-no-sato.jpg/1280px-Asago_Yamajiro-no-sato.jpg"
        ],
        "specs": [
          {
            "k": "駐車場",
            "v": "一般110台・大型は要予約"
          },
          {
            "k": "西登山道",
            "v": "ここから城へ徒歩約40分"
          },
          {
            "k": "食事",
            "v": "但馬牛・地元野菜の料理"
          },
          {
            "k": "営業",
            "v": "時期で変動・要公式確認"
          }
        ],
        "transit": "JR竹田駅からバス・タクシーで約10分。播但道・和田山ICから約10分"
      }
    ],
    "sideArticles": [
      {
        "t": "淡路島。明石海峡大橋と花と海の島",
        "h": "/feature/hyogo-awaji-akashi",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Akashi_Bridge.JPG/1280px-Akashi_Bridge.JPG"
      },
      {
        "t": "東寺 半日モデルコース。五重塔と立体曼荼羅をめぐる",
        "h": "/feature/kyoto-toji-temple",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Toji-Nandaimon_2015.jpg/1280px-Toji-Nandaimon_2015.jpg"
      }
    ],
    "quote": "海の上に城だけが残る朝は、年に何度もない。だから人は、暗いうちから山を登る。",
    "quoteCite": "マチノワ編集部",
    "closing": "霧が引いたあとの城下は、登山とはまったく違う時間が流れている。石垣の頂で見た雲海と、ふもとの表米神社に残る円形の相撲桟敷を、同じ一日のなかに収められるのが、この街の懐の深さだ。観覧時間や料金、登山道の開門時刻は季節で細かく変わり、雲海そのものは気象次第。出かける前に朝来市や各施設の公式情報へ一度目を通しておけば、暗い山道で迷うことも、開門前に立ち尽くすこともない。マチノワ編集部としては、初訪なら無理に雲海狙いで一発勝負にせず、晴れた城歩きそのものを目的に据えることを勧めたい。霧は、また来ればいい。"
  },
  "hyogo-awaji-akashi": {
    "id": "hyogo-awaji-akashi",
    "no": "G10-07",
    "articleType": "guide",
    "kicker": "AWAJI",
    "title": "淡路島。明石海峡大橋と花と海の島",
    "titleHTML": "淡路島。明石海峡大橋と<br>花と海の島",
    "subtitle": "北の橋から南の渦へ、海ぞいを縦に走るドライブ",
    "lede": "淡路島の面白さは、ハンドルを握ると見えてくる。島の北端では神戸とつなぐ巨大な吊橋が頭上をまたぎ、南端まで下りれば瀬戸内と太平洋がせめぎ合って海がうずを巻く。その間を縫う海ぞいの道は、左右で景色の色がまるで違う。東は大阪湾の青、西は夕日を受ける播磨灘。今回は車を一台、北から南へ走らせる前提で組んだ。橋のたもとで魚を食べ、丘の上で花の絨毯を見下ろし、神話の小島に立ち寄り、最後は船で渦の真上まで出る。橋と海、この二つだけを道しるべに島を縦断する一日を描いてみた。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Akashi_Bridge.JPG/1280px-Akashi_Bridge.JPG",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "明石海峡大橋",
        "cuisine": "橋・展望",
        "area": "兵庫県神戸市垂水区〜淡路市",
        "purpose": "ドライブの起点。神戸と淡路島をつなぐ吊橋を、車で渡り、たもとから見上げる",
        "desc": "神戸市垂水と淡路市岩屋を結ぶ橋長3,911メートルの吊橋で、主塔と主塔の間隔は1,991メートル。1998年の開通時、この中央支間長は世界の吊橋で最も長かった。淡路島ドライブはたいていこの橋を渡ることから始まるが、ただ通過するだけではもったいない。橋の建設に携わったスタッフが案内役を務め、海面上およそ300メートルの主塔頂上まで管理用通路で登る「ブリッジワールド」という体験ツアーがあり、例年春から秋にかけて開催される。普段は立ち入れない橋の内部を歩いて頂上から海峡を見渡せるのは、この橋ならではの登り方だ。開催日や予約方法は運営する本州四国連絡高速道路の公式案内で確かめてほしい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Akashi_Bridge.JPG/1280px-Akashi_Bridge.JPG"
        ],
        "specs": [
          {
            "k": "橋長",
            "v": "3,911m（中央支間1,991m）"
          },
          {
            "k": "開通",
            "v": "1998年"
          },
          {
            "k": "塔頂体験",
            "v": "ブリッジワールド（春〜秋に開催／要予約）"
          }
        ],
        "transit": "淡路島側は神戸淡路鳴門自動車道・淡路ICからすぐ。神戸側は山陽電鉄・舞子公園駅やJR舞子駅から徒歩圏"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "道の駅あわじ",
        "cuisine": "道の駅・食",
        "area": "兵庫県淡路市岩屋",
        "purpose": "橋を真上に仰ぐたもとで、淡路の海の幸を昼に",
        "desc": "島の最北端、明石海峡大橋の橋脚のすぐ足もとに広がる道の駅で、芝生に出ると橋桁が頭上を覆うように迫る。橋の真下からこの巨大さを仰げる場所はそう多くない。食事処では春から初夏にかけて水揚げされる生しらすを丼にした名物が知られ、店によっては年に十万食を超えるという。鮮度が落ちやすい生しらすは産地でこそ味わいたい一品だ。海鮮丼や穴子、淡路牛を使った料理まで揃うので、橋を見上げながらの昼食地点として動線にはまりやすい。店ごとに営業時間が分かれているため、目当てがあれば公式サイトで時間を見ておくとよい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/0/07/Michinoeki-awaji.jpg"
        ],
        "specs": [
          {
            "k": "立地",
            "v": "明石海峡大橋のたもと・島最北端"
          },
          {
            "k": "名物",
            "v": "生しらす丼（春〜初夏が旬）"
          },
          {
            "k": "確認",
            "v": "店舗ごとに営業時間が異なる（公式で確認）"
          }
        ],
        "transit": "淡路ICから車で約5分。明石海峡大橋のたもと、島の最北端"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "絵島",
        "cuisine": "景勝地・神話",
        "area": "兵庫県淡路市岩屋",
        "purpose": "国生み神話の伝承地に立ち寄り、橋とは別の島の時間を感じる",
        "desc": "岩屋港のかたわらに浮かぶ小さな岩の島で、長い年月の風化と波で削られた砂岩の地層が縞模様をなし、夕日や月明かりに照らされると表情が変わる。古くから歌に詠まれ、日本の国土が生まれたという国生み神話の「オノコロ島」の伝承地のひとつにも数えられてきた。橋の壮大さに圧倒された目には、この小島の静けさが対照的に映る。港のすぐ脇なので車を停めて数分立ち寄れる手軽さも、北部を巡る合間の一息にちょうどいい。海面に映る姿が美しいとされ、夕刻の光をねらって寄るのもおすすめだ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Awajicity.ejima.jpg/1280px-Awajicity.ejima.jpg"
        ],
        "specs": [
          {
            "k": "由来",
            "v": "国生み神話「オノコロ島」伝承地のひとつ"
          },
          {
            "k": "見どころ",
            "v": "波と風が削った縞模様の砂岩"
          },
          {
            "k": "駐車",
            "v": "岩屋港の駐車場を利用"
          }
        ],
        "transit": "淡路ICから車で約5分、岩屋港のすぐそば。駐車は岩屋港の駐車場を利用"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "兵庫県立公園 あわじ花さじき",
        "cuisine": "花畑・展望",
        "area": "兵庫県淡路市楠本",
        "purpose": "標高300mの斜面いっぱいの花畑越しに、海と橋を見下ろす",
        "desc": "島北部の丘の上、標高およそ300メートルの斜面に約15ヘクタールの花畑が広がる公園で、花の絨毯の向こうに大阪湾と明石海峡が一望できる。海に向かってなだらかに下る地形そのものが展望席のようになっているのが、この場所の名「さじき（桟敷）」の由来だ。畑は年に三度ほど植え替えられ、春は菜の花の黄色、夏はサルビアやクレオメ、秋はコスモスと、訪れる時季で斜面の色が一変する。入園は無料で、駐車料金だけで楽しめるのもうれしい。花の見ごろは季節で動くので、何が咲いているかは公式の花カレンダーで確かめてから向かいたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Awaji_Balcony_flower_in_2013_11.JPG/1280px-Awaji_Balcony_flower_in_2013_11.JPG"
        ],
        "specs": [
          {
            "k": "標高・規模",
            "v": "約300m／約15ha"
          },
          {
            "k": "花期",
            "v": "年3回植え替え（春の菜の花・秋のコスモスなど）"
          },
          {
            "k": "料金",
            "v": "入園無料（駐車料金別途）"
          }
        ],
        "transit": "淡路ICから車で約15分。北部の丘陵地の上にあり、駐車場利用"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "道の駅福良（うずしおドームなないろ館）",
        "cuisine": "道の駅・拠点",
        "area": "兵庫県南あわじ市福良",
        "purpose": "島南端の港で渦見物の準備を整える、ドライブ後半の拠点",
        "desc": "島の南端、福良港に面した道の駅で、館内には展望スペースや水産加工品の売店、食事処が集まり、鳴門海峡の渦潮見物の出発点になっている。隣には無料の足湯があり、淡路人形浄瑠璃を上演する常設館「淡路人形座」も近い。長い海ぞいの運転で疲れた足を足湯で休め、次の観潮船の時刻まで土産を眺めて待つ、という過ごし方が自然にできる。次に紹介するうずしおクルーズの乗船券もこの港で扱うので、潮の時刻に合わせて行動を組むなら、まずここを集合地点にすると段取りがつけやすい。営業時間や定休日は変わることがあるため公式情報で確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Michi-no-eki_Fukura_ac_%281%29.jpg/1280px-Michi-no-eki_Fukura_ac_%281%29.jpg"
        ],
        "specs": [
          {
            "k": "立地",
            "v": "福良港・島南端の観光拠点"
          },
          {
            "k": "併設",
            "v": "無料の足湯／近くに淡路人形座"
          },
          {
            "k": "役割",
            "v": "うずしおクルーズの乗船拠点"
          }
        ],
        "transit": "西淡三原ICから車で約15分。福良港に面し、うずしおクルーズの乗船拠点を兼ねる"
      },
      {
        "rank": "SPOT 06",
        "rankNum": 6,
        "name": "うずしおクルーズ（福良港発）",
        "cuisine": "観潮船・海上体験",
        "area": "兵庫県南あわじ市福良",
        "purpose": "ドライブの終点。船で鳴門海峡の渦の真上まで出る",
        "desc": "福良港から出る観潮船で、瀬戸内海と太平洋がぶつかる鳴門海峡まで進み、潮流が生む渦を間近に見るおよそ一時間のクルーズだ。大潮の前後には渦の直径が大きく育つこともあり、海面が渦を巻きながら流れ落ちていく光景は陸からは決して見られない。淡路島側からこの渦へ船で出られる港は限られており、橋で島へ入った旅を「海に出て締めくくる」かたちにできるのがこの航路の魅力だ。渦の勢いは潮の満ち引きに左右されるため、見ごろの時刻は日によって変わる。出航時刻と渦の予想時刻は運航事業者の潮見表で必ず合わせてから予約したい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Naruto_-_panoramio_%281%29.jpg/1280px-Naruto_-_panoramio_%281%29.jpg"
        ],
        "specs": [
          {
            "k": "所要",
            "v": "約1時間のクルーズ"
          },
          {
            "k": "出航",
            "v": "福良港（道の駅福良）"
          },
          {
            "k": "渦の見ごろ",
            "v": "潮の時刻次第（公式の潮見表で確認）"
          }
        ],
        "transit": "福良港（道の駅福良）から出航。西淡三原ICから車で約15分"
      }
    ],
    "sideArticles": [
      {
        "t": "竹田城跡。天空の城と雲海の朝",
        "h": "/feature/hyogo-takeda-castle",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/%E7%AB%B9%E7%94%B0%E5%9F%8E%E8%B7%A1_-_panoramio.jpg/1280px-%E7%AB%B9%E7%94%B0%E5%9F%8E%E8%B7%A1_-_panoramio.jpg"
      },
      {
        "t": "東寺 半日モデルコース。五重塔と立体曼荼羅をめぐる",
        "h": "/feature/kyoto-toji-temple",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Toji-Nandaimon_2015.jpg/1280px-Toji-Nandaimon_2015.jpg"
      }
    ],
    "quote": "橋をくぐって島へ入り、渦を見て島を出る。淡路島は、海の上の入口と出口で挟まれている。",
    "quoteCite": "マチノワ編集部",
    "closing": "北の橋から南の渦まで、走行距離にしておよそ50キロ強。信号の少ない海ぞいの道なので、寄り道を足しても日が暮れる前に一周のかたちが見えてくる。潮の満ち引きで渦の見ごろ時刻は毎日ずれるため、クルーズや渦の見学を旅の軸に据えるなら、出発前に運航事業者が公開している潮見表で時刻を合わせておくと一日の組み立てが楽になる。花の植え替え時期や各施設の営業時間も折々で変わるので、訪ねる前にそれぞれの公式ページに一度目を通しておくと安心だ。橋を見上げて始まり、渦を見下ろして終わる。淡路島のドライブは、その縦の一本で十分に語り尽くせる。"
  },
  "shiga-biwako-terrace": {
    "id": "shiga-biwako-terrace",
    "no": "G10-08",
    "articleType": "guide",
    "kicker": "BIWAKO TERRACE",
    "title": "びわ湖テラス。山上から望む琵琶湖の大パノラマ",
    "titleHTML": "びわ湖テラス。<br>山上から望む琵琶湖の大パノラマ",
    "subtitle": "湖西の稜線へ、ロープウェイで一気に標高1,100mの水景を見上げる",
    "lede": "琵琶湖は、湖畔に立っているうちは「対岸まで広い湖」でしかない。ところが比良山地の稜線まで一気に高度を上げると、見えるものが反転する。水面が足元へ沈み、湖が空とつながる弧を描き、晴れた日には対岸の山並みや京都・大阪方向の市街までが一枚の絵におさまる。びわ湖バレイのロープウェイは、その「上から眺める湖」へ短時間で運んでくれる入口だ。今回は山麓駅からゴンドラで打見山へ上がり、蓬莱山の頂までリフトを乗り継ぎ、稜線上を風を切って滑り降りるアクティビティまで、高度を上げるごとに変わる琵琶湖の表情を追ってたどる。グリーンシーズン（おおむね4月下旬〜11月下旬）に開く施設なので、訪れる時期と運行状況は出発前に確かめておきたい。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Biwako_Valley_-_panoramio_%286%29.jpg/1280px-Biwako_Valley_-_panoramio_%286%29.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "びわ湖バレイ ロープウェイ",
        "cuisine": "山岳ロープウェイ",
        "area": "滋賀県大津市木戸",
        "purpose": "湖岸の高さから一気に稜線へ。山上絶景への入口となる空中区間",
        "desc": "標高差およそ780m、全長1,783mの区間を結ぶこのロープウェイは、121人乗りのゴンドラが最高で秒速12mまで上がり、同型としては国内でも最速級の運行速度で知られる。乗り込んで数分のうちに、窓の外で琵琶湖の見え方がどんどん変わっていくのがこの乗り物の醍醐味で、麓では平面に見えていた湖が、高度を増すごとに奥行きを持った水景へと立ち上がっていく。山上の眺めは、まずこの数分の上昇から始まる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Biwako_Valley_-_panoramio_%286%29.jpg/1280px-Biwako_Valley_-_panoramio_%286%29.jpg"
        ],
        "specs": [
          {
            "k": "区間長",
            "v": "約1,783m"
          },
          {
            "k": "高低差",
            "v": "約780m"
          },
          {
            "k": "ゴンドラ",
            "v": "121人乗り・最高約12m/秒"
          },
          {
            "k": "所要",
            "v": "山頂まで約5分"
          }
        ],
        "transit": "JR湖西線 志賀駅から江若交通バスで約10分、山麓駅下車すぐ"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "蓬莱山 山頂エリア",
        "cuisine": "山頂・展望地",
        "area": "滋賀県大津市木戸（蓬莱山 山頂・標高1,174m）",
        "purpose": "比良山地の高みから、湖と山並みを同時に視界へ収める",
        "desc": "蓬莱山は比良山地のなかでも高い部類に入る1,174mの頂で、打見山のテラスからリフトを乗り継いで到達できる。打見山が「湖そのもの」と向き合う場所なら、こちらは南東に琵琶湖、南西に比良の稜線という二方向の風景を一度に背負える点が違う。なだらかな草地の山頂部を歩きながら、足を運ぶ角度ごとに湖と山のバランスが入れ替わっていくので、稜線散歩そのものが眺望の一部になる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/%E8%93%AC%E8%8E%B1%E5%B1%B1%E5%B1%B1%E9%A0%82.jpg/1280px-%E8%93%AC%E8%8E%B1%E5%B1%B1%E5%B1%B1%E9%A0%82.jpg"
        ],
        "specs": [
          {
            "k": "標高",
            "v": "1,174m"
          },
          {
            "k": "位置づけ",
            "v": "比良山地の主要峰"
          },
          {
            "k": "アクセス",
            "v": "リフト乗り継ぎ"
          },
          {
            "k": "眺望",
            "v": "琵琶湖＋比良山系"
          }
        ],
        "transit": "ロープウェイ山頂駅からリフトを乗り継いで山頂へ"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "ジップラインアドベンチャー",
        "cuisine": "山上アクティビティ",
        "area": "滋賀県大津市木戸（びわ湖バレイ 山上エリア）",
        "purpose": "眺めるだけでなく、湖を背に空中を滑って稜線の高さを体感する",
        "desc": "山上の森にワイヤーを渡し、滑車にぶら下がって滑空する全6コースのアトラクション。最長区間は169mに及び、眼下に琵琶湖を望みながら飛べるのが立地ならではで、テラスの「見る絶景」とは別の角度から山の高さを体に刻める。風や運行の都合で稼働状況は日々変わり、同じ山上エリアの空中アスレチック施設は時期によって休止・整備が入ることもあるため、挑戦するなら当日の運行案内を先に確認しておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Biwako_Valley_-_panoramio_%2815%29.jpg/1280px-Biwako_Valley_-_panoramio_%2815%29.jpg"
        ],
        "specs": [
          {
            "k": "コース",
            "v": "全6コース"
          },
          {
            "k": "最長区間",
            "v": "約169m"
          },
          {
            "k": "眺め",
            "v": "滑空中に琵琶湖を一望"
          },
          {
            "k": "稼働",
            "v": "天候・整備で変動"
          }
        ],
        "transit": "ロープウェイ山頂駅から徒歩圏内"
      }
    ],
    "sideArticles": [
      {
        "t": "東寺 半日モデルコース。五重塔と立体曼荼羅をめぐる",
        "h": "/feature/kyoto-toji-temple",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Toji-Nandaimon_2015.jpg/1280px-Toji-Nandaimon_2015.jpg"
      },
      {
        "t": "醍醐寺を歩く。五重塔と三宝院の庭",
        "h": "/feature/kyoto-daigoji",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Daigoji_Kyoto01s5s4110.jpg/1280px-Daigoji_Kyoto01s5s4110.jpg"
      }
    ],
    "quote": "湖を見下ろした瞬間、その大きさが初めて腑に落ちる。",
    "quoteCite": "マチノワ編集部",
    "closing": "同じ琵琶湖でも、湖岸から眺めるのと、稜線から見下ろすのとでは別の湖に見える。ロープウェイで一気に高度を稼ぎ、リフトを乗り継いで蓬莱山の頂まで上がれば、視界は文字どおり一回りする。最後にジップラインで稜線を滑り降りれば、湖を真正面に置いたまま体ごと景色へ飛び込む感覚が待っている。山上の天気と湖面のコンディションは時間ごとに移ろうので、午前と午後で表情の違いを楽しむのもいい。営業期間・運行時間・料金やアクティビティの稼働状況はシーズンや天候で動くため、計画前にびわ湖バレイの公式案内で現況を押さえておくと、当日の動きがぐっと楽になる。"
  },
  "wakayama-kimiidera-wakaura": {
    "id": "wakayama-kimiidera-wakaura",
    "no": "G10-09",
    "articleType": "guide",
    "kicker": "KIMIIDERA",
    "title": "紀三井寺と和歌浦を歩く。名草の海辺と古社",
    "titleHTML": "紀三井寺と和歌浦を歩く。<br>名草の海辺と古社",
    "subtitle": "和歌山市・名草山の麓から、万葉に詠まれた潟の岸へ",
    "lede": "朝の早い電車を降りると、潮の匂いが先にやってきた。名草山の斜面に張りついた甍の上で、まだ淡い陽が砂を含んだように白んでいる。鳥の声と、どこかで水を打つ音。和歌浦という土地は、海と山と古い社が肩を寄せ合うようにして、ひとつの入江を抱いている。きょうは紀三井寺の石段から歩きはじめて、万葉の歌人たちが立ち止まった潟の岸まで、海沿いをゆっくり下っていくことにした。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/%E7%B4%80%E4%B8%89%E4%BA%95%E5%AF%BA2_-_panoramio.jpg/1280px-%E7%B4%80%E4%B8%89%E4%BA%95%E5%AF%BA2_-_panoramio.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "紀三井寺",
        "cuisine": "寺院",
        "area": "和歌山市紀三井寺",
        "purpose": "名草山の中腹に立つ西国三十三所の古刹。海を一望する石段から街歩きを始める起点に",
        "desc": "JR紀三井寺駅から住宅地を抜けると、楼門の先に二百三十段あまりの石段がまっすぐ伸びていた。一段ずつ登るほどに息は上がるが、振り返るたびに和歌浦の海が視界に広がっていく。寺名の由来になった三つの湧き水——清浄水・楊柳水・吉祥水——がいまも岩肌から落ちていて、口に含むとひやりと冷たい。境内の桜は和歌山に春の訪れを告げる標本木として気象台が観測する木で、開花宣言の基準になっている。登りきった本堂前からの眺めは、ここまでの石段の苦労をすっかり忘れさせてくれた。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/%E7%B4%80%E4%B8%89%E4%BA%95%E5%AF%BA2_-_panoramio.jpg/1280px-%E7%B4%80%E4%B8%89%E4%BA%95%E5%AF%BA2_-_panoramio.jpg"
        ],
        "specs": [
          {
            "k": "拝観料",
            "v": "大人400円ほか（最新は公式で確認）"
          },
          {
            "k": "石段",
            "v": "本堂まで231段"
          }
        ],
        "transit": "JR紀三井寺駅から徒歩約10分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "玉津島神社",
        "cuisine": "神社",
        "area": "和歌山市和歌浦中",
        "purpose": "和歌の神を祀る古社。入江を歩く前に、この土地が「歌枕」だった由来に触れる",
        "desc": "海沿いを西へ下り、奠供山(てんぐやま)の麓に着くと玉津島神社の鳥居が見えてきた。和歌の神さまを祀る社で、聖武天皇が行幸した折に山部赤人が「若の浦に潮満ち来れば潟を無み」と詠んだ、まさにその場所にあたる。境内の片隅には小野小町が着物の袖を掛けたと伝わる袖掛塀が残り、万葉歌碑が木陰にぽつりと立っている。観光地らしい賑わいはなく、参拝する人の足音だけが砂利に響いて、ここが千年以上前から歌に詠まれてきた岸辺なのだと静かに納得させられた。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Tamatsushima-jinja1.jpg/1280px-Tamatsushima-jinja1.jpg"
        ],
        "specs": [
          {
            "k": "祭神",
            "v": "稚日女尊・神功皇后ほか（和歌の神）"
          },
          {
            "k": "見どころ",
            "v": "万葉歌碑・小野小町袖掛塀"
          }
        ],
        "transit": "バス停「玉津島神社前」下車すぐ"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "和歌浦天満宮",
        "cuisine": "神社",
        "area": "和歌山市和歌浦西",
        "purpose": "急な石段の上に建つ学問の社。楼門から入江を見下ろす眺めが待っている",
        "desc": "玉津島から少し歩くと、山の斜面にしがみつくように建つ天満宮の急な石段が現れた。菅原道真を祀り、太宰府・北野と並んで三菅廟のひとつに数えられる古社だという。息を切らして登り、重要文化財の楼門をくぐったところで足が止まった。朱塗りの門の額縁の向こうに、和歌浦の入江がそっくり収まっている。本殿の壁は狩野・土佐両派の絵師が手がけた極彩色の彫刻で覆われていて、潮風に何百年もさらされたとは思えないほど色が残っていた。登ってきた者だけが受け取れる眺めと社殿だった。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Wakaura_Tenmangu_romon.jpg/1280px-Wakaura_Tenmangu_romon.jpg"
        ],
        "specs": [
          {
            "k": "文化財",
            "v": "本殿・楼門が国の重要文化財"
          },
          {
            "k": "ご利益",
            "v": "学問・受験"
          }
        ],
        "transit": "バス停「権現前」下車徒歩約5分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "和歌の浦（片男波）",
        "cuisine": "海辺・干潟",
        "area": "和歌山市和歌浦南",
        "purpose": "万葉歌に詠まれた潟が残る砂洲。社を巡ったあと、ここで海風に当たる",
        "desc": "石段を下りて不老橋を渡ると、視界がいっぺんに開けた。片男波は和歌浦湾に細長く伸びる砂洲で、千二百メートルほどの砂浜がゆるく弧を描いている。「片男波」という地名そのものが、赤人の歌「潟を無み」から生まれたものだと知ると、足元の砂までが急に由緒あるものに思えてくる。夏は海水浴で賑わうらしいが、訪れた日は人もまばらで、潟に渡り鳥が降りていた。隣の片男波公園には芝生広場や日本庭園が整えられていて、海と歌枕を眺めながらひと休みするのにちょうどよかった。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Wakanoura_viewed_from_Mount_Takozushi.jpg/1280px-Wakanoura_viewed_from_Mount_Takozushi.jpg"
        ],
        "specs": [
          {
            "k": "砂浜",
            "v": "全長約1,200m"
          },
          {
            "k": "遊泳期間",
            "v": "夏季（7〜8月ごろ）"
          }
        ],
        "transit": "バス停「不老橋」下車徒歩約10分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "雑賀崎漁港",
        "cuisine": "漁港・集落",
        "area": "和歌山市雑賀崎",
        "purpose": "斜面に家々が積み上がる漁村。入江歩きの終点で、海に張り出す集落と灯台へ",
        "desc": "和歌浦の奥へ奥へと海沿いを進むと、道の先に雑賀崎の集落が現れた。崖のような急斜面に家々がびっしりと積み重なり、白い壁と窓が段々畑のように海へせり出している。その景観から地中海の漁村になぞらえて語られることもあるが、軒先に干された網や、坂道に置かれた発泡スチロールの箱が、ここが現役の漁村であることを思い出させてくれる。岬の先の番所庭園は、かつて紀州藩が異国船を見張った番所跡で、紀州青石の磯が海に突き出している。灯台のそばまで歩くと、朝に登った名草山が入江の対岸に小さく霞んで見えた。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Saikazaki_Fishing_harbor.jpg/1280px-Saikazaki_Fishing_harbor.jpg"
        ],
        "specs": [
          {
            "k": "地形",
            "v": "急斜面に密集する漁村集落"
          },
          {
            "k": "立ち寄り",
            "v": "番所庭園・雑賀埼灯台"
          }
        ],
        "transit": "雑賀崎循環バス「雑賀崎遊園」下車徒歩約10分"
      }
    ],
    "sideArticles": [
      {
        "t": "東寺 半日モデルコース。五重塔と立体曼荼羅をめぐる",
        "h": "/feature/kyoto-toji-temple",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Toji-Nandaimon_2015.jpg/1280px-Toji-Nandaimon_2015.jpg"
      },
      {
        "t": "醍醐寺を歩く。五重塔と三宝院の庭",
        "h": "/feature/kyoto-daigoji",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Daigoji_Kyoto01s5s4110.jpg/1280px-Daigoji_Kyoto01s5s4110.jpg"
      }
    ],
    "quote": "潟を無み——千二百年前の歌人が見た干潟の名残りが、いまも入江の底でひと息ついている。",
    "quoteCite": "マチノワ編集部",
    "closing": "雑賀崎の灯台の下まで来て、ようやく振り返った。朝に登った名草山が、入江の向こうにずいぶん小さく見える。海に張り出した家並みが夕方の光をためて、白い壁がほんのり橙に染まりはじめていた。和歌浦というのは、結局のところ歩いてつなぐ場所なのだと思う。社から社へ、潟から岬へ、距離はどれもわずかなのに、そのあいだに山部赤人の歌があり、菅公の伝説があり、漁師たちの暮らしが挟まっている。脚は少し疲れたけれど、海のそばを一日歩いた身体は妙に軽い。各所の拝観時間や料金は折々に変わるので、出かける前に公式の案内をのぞいておくと安心して回れる。次に来るなら、潮の引いた朝にもう一度この岸を歩いてみたい。"
  },
  "aichi-korankei": {
    "id": "aichi-korankei",
    "no": "G10-10",
    "articleType": "guide",
    "kicker": "KORANKEI",
    "title": "香嵐渓。待月橋ともみじの渓谷",
    "titleHTML": "香嵐渓。<br>待月橋ともみじの渓谷",
    "subtitle": "巴川がきざんだ谷を、朱の橋から飯盛山の頂へ。色づく木立を歩いて登る秋",
    "lede": "愛知・豊田の山あい、足助川と巴川がぶつかるあたりで、川が長い時間をかけて削った谷が香嵐渓だ。その色づきは自然まかせではなく、人の手から始まっている。古くから地元の人々が飯盛山の斜面へカエデを植え足してきたと伝わり、その積み重ねが今のもみじの山をかたちづくった。だから香嵐渓のもみじは、ただ眺める景色というより、誰かが残した手仕事の続きを歩く感覚に近い。この特集は、渓谷ぞいを散歩する一日として組んだ。川面に映る朱の橋を見上げ、川べりの苔と杉の匂いをかぎ、低い山の頂まで登って谷を見下ろす。足元の落ち葉を踏む音まで含めて、紅葉の渓谷さんぽを味わってほしい。色づきの盛りはおおむね十一月の半ばから下旬、夜の灯りがともる期間もある。日程や料金は動くので、出かける前に各施設の知らせをのぞいておくと安心だ。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Korankei5.jpg/1280px-Korankei5.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "待月橋",
        "cuisine": "橋・景観",
        "area": "愛知県豊田市足助町",
        "purpose": "渓谷の中心にかかる朱塗りの橋から、川と紅葉を一望する",
        "desc": "香嵐渓のほぼ中心、巴川をまたいで架かる朱塗りの橋。橋の上は視界がひらけ、左右の斜面の色づきを同じ高さで見渡せる。河原まで下りると、紅葉を背にした赤い橋の弧がそのまま川面に映り、上から見るのとはまるで違う絵になる。この一枚を撮るために河原へ降りる人が多いのも、ここならではの楽しみ方だ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Korankei5.jpg/1280px-Korankei5.jpg"
        ],
        "specs": [
          {
            "k": "またぐ川",
            "v": "巴川"
          },
          {
            "k": "色づきの目安",
            "v": "11月中旬〜下旬"
          },
          {
            "k": "夜の灯り",
            "v": "もみじまつり期間に点灯（日程は要確認）"
          }
        ],
        "transit": "名鉄豊田線・浄水駅からとよたおいでんバス（さなげ足助線）で「香嵐渓」下車、徒歩約5分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "香嵐渓",
        "cuisine": "渓谷",
        "area": "愛知県豊田市足助町",
        "purpose": "川沿いの遊歩道をたどり、谷全体のもみじを歩いて味わう",
        "desc": "巴川が浸食してできた渓谷で、巴橋から香嵐橋までの約1kmが散策路になっている。1930年に大阪毎日新聞社主の山本彦一が「香嵐渓」と名づけたと伝わり、それまでは名のなかった谷だ。川面すれすれを歩ける区間があるのが特徴で、見上げる紅葉と、足元の流れに散った葉を同時に楽しめる。盛りには木立全体が頭上を覆い、トンネルを抜けるように歩ける。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/%E9%A6%99%E5%B5%90%E6%B8%93_-_panoramio_-_%E3%82%AD%E3%83%A7%E3%83%88%E3%82%A5%E3%83%BC.jpg/1280px-%E9%A6%99%E5%B5%90%E6%B8%93_-_panoramio_-_%E3%82%AD%E3%83%A7%E3%83%88%E3%82%A5%E3%83%BC.jpg"
        ],
        "specs": [
          {
            "k": "散策区間",
            "v": "巴橋〜香嵐橋 約1km"
          },
          {
            "k": "名づけ",
            "v": "1930年に「香嵐渓」と命名"
          },
          {
            "k": "歩く時間",
            "v": "片道およそ20〜30分"
          }
        ],
        "transit": "「香嵐渓」バス停からすぐ。巴橋から香嵐橋まで川沿い約1kmの谷"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "飯盛山",
        "cuisine": "里山・展望",
        "area": "愛知県豊田市足助町",
        "purpose": "谷を見下ろす低山の頂へ登り、もみじの斜面を上から眺める",
        "desc": "香嵐渓の中心にそびえる標高251mの円錐形の山で、街道からの比高は130mほど。整った形から古くは神が天下る聖なる山とされ、山頂近くには磐座も伝わる。今このもみじの多くは、大正末から昭和の初めに地元の人々が植えたもので、その数は4000本ともいわれる。香積寺脇の登山口から20〜30分登れば、谷の色づきを足の下に見下ろす視点が手に入る。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/6/64/Iimoriyama_aichi.jpg"
        ],
        "specs": [
          {
            "k": "標高",
            "v": "251m"
          },
          {
            "k": "登り時間",
            "v": "登山口から約20〜30分"
          },
          {
            "k": "もみじの本数",
            "v": "約4000本といわれる"
          }
        ],
        "transit": "香積寺の参道が登山口。山頂まで徒歩約20〜30分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "三州足助屋敷",
        "cuisine": "民俗施設・体験",
        "area": "愛知県豊田市足助町",
        "purpose": "渓谷さんぽの締めに、山里の手仕事と暮らしをのぞく",
        "desc": "明治から昭和30年頃までの山あいの農家の暮らしを再現した「生きた民俗資料館」。わら草履、機織り、桶屋、紙すき、鍛冶屋、炭焼きなど十種ほどの手仕事を、実際の職人が日々実演しているのが他にない点で、見るだけでなく一部は体験もできる。色づいた谷を歩いたあと、その同じ山里で人がどう暮らしてきたかをのぞくと、香嵐渓の風景に厚みが出る。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Sansyu_Asuke_Yashiki_2019-11_ac_%281%29.jpg/1280px-Sansyu_Asuke_Yashiki_2019-11_ac_%281%29.jpg"
        ],
        "specs": [
          {
            "k": "開館",
            "v": "9:00〜17:00（入場は16:30まで）"
          },
          {
            "k": "入館料",
            "v": "大人300円・高校生以下100円（体験は別途／最新は公式で確認）"
          },
          {
            "k": "休館",
            "v": "木曜ほか（11月は無休、要確認）"
          }
        ],
        "transit": "待月橋から徒歩約5分"
      }
    ],
    "sideArticles": [
      {
        "t": "岡崎城 半日モデルコース。家康生誕の城と八丁味噌",
        "h": "/feature/aichi-okazaki-castle",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Okazaki_Castle_2023.jpg/1280px-Okazaki_Castle_2023.jpg"
      },
      {
        "t": "東寺 半日モデルコース。五重塔と立体曼荼羅をめぐる",
        "h": "/feature/kyoto-toji-temple",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Toji-Nandaimon_2015.jpg/1280px-Toji-Nandaimon_2015.jpg"
      }
    ],
    "quote": "川が削った谷を、人が植え継いだもみじが彩る。眺めるより、歩いて確かめたくなる秋だ。",
    "quoteCite": "マチノワ編集部",
    "closing": "四つのスポットは、橋から川べり、山頂、里の暮らしへと、谷のなかで高さも視点も少しずつ変わっていく。半日もあれば一巡りできる距離だが、待月橋の下で川面の照り返しを眺めたり、足助屋敷で職人の手元をのぞいたりしていると、思いのほか時間が溶ける。盛りの時期は人も多く、灯りのともる夜は雰囲気が一変するので、昼と夜どちらを軸にするかで歩き方は変わってくる。最新の見頃や催しの予定は、豊田市足助観光協会などの案内で確かめてから向かってほしい。"
  },
  "aichi-okazaki-castle": {
    "id": "aichi-okazaki-castle",
    "no": "G10-11",
    "articleType": "course",
    "kicker": "OKAZAKI CASTLE",
    "title": "岡崎城 半日モデルコース。家康生誕の城と八丁味噌",
    "titleHTML": "岡崎城 半日モデルコース。<br>家康生誕の城と八丁味噌",
    "subtitle": "天守からビスタライン、そして味噌蔵へ",
    "lede": "乙川と伊賀川が合流する低地に開けた岡崎は、徳川家康が産声をあげた城下町でありながら、いまも町なかの川風と味噌蔵の匂いが日常の中に溶けている。この半日は、家康が生まれた本丸から歩きはじめ、城の真上に鎮座する社、家光が三キロ先まで引いた一直線の眺望、そして江戸初期から桶を守り続ける味噌蔵へと、「家康ゆかり」をひとつの線でつないで歩く設計にした。城だけ見て帰るのはもったいない、という土地である。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Okazaki_Castle_2023.jpg/1280px-Okazaki_Castle_2023.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "岡崎城",
        "cuisine": "城・天守",
        "area": "愛知・岡崎",
        "purpose": "9:30。本丸の天守に上がり、乙川を見下ろして一日の起点をつかむ",
        "desc": "徳川家康が松平竹千代として生まれた城そのもの。現在の天守は1959年に三層五階で復興されたもので、最上階からは城の足元を乙川と伊賀川が囲む地形が一望でき、なぜここに城が築かれたかが体感としてわかる。日本100名城にも数えられ、家康の人生がここから始まったという一点で、町歩きの起点にこれ以上ふさわしい場所はない。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Okazaki_Castle_2023.jpg/1280px-Okazaki_Castle_2023.jpg"
        ],
        "specs": [
          {
            "k": "天守入館",
            "v": "大人200円・小人100円（家康館との2館共通券あり）"
          },
          {
            "k": "開館",
            "v": "9:00〜17:00（入館は16:30まで）"
          },
          {
            "k": "料金確認先",
            "v": "岡崎おでかけナビ（岡崎市観光協会）公式"
          }
        ],
        "transit": "名鉄名古屋本線「東岡崎」駅から徒歩約15分／愛知環状鉄道「中岡崎」駅から徒歩約15分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "龍城神社",
        "cuisine": "神社",
        "area": "愛知・岡崎",
        "purpose": "10:30。天守を下りてすぐ本丸の社へ。城と神社が同じ場所に重なる珍しさを味わう",
        "desc": "天守の真横、本丸にそのまま鎮座する社で、家康と猛将・本多忠勝を御祭神としてまつる。築城のときに龍が現れ城の井戸から水を噴き上げて昇天したという昇龍伝説が社名の由来で、城の守り神がそのまま境内になっている構図は、城めぐりの途中でふと足を止めるのにちょうどいい。御朱印も授与されている。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Tatsuki_shrine_-_%E9%BE%8D%E5%9F%8E%E7%A5%9E%E7%A4%BE_-_panoramio_%283%29.jpg/1280px-Tatsuki_shrine_-_%E9%BE%8D%E5%9F%8E%E7%A5%9E%E7%A4%BE_-_panoramio_%283%29.jpg"
        ],
        "specs": [
          {
            "k": "祭神",
            "v": "徳川家康公・本多忠勝公ほか"
          },
          {
            "k": "所在",
            "v": "岡崎城本丸（岡崎公園内）"
          },
          {
            "k": "授与所",
            "v": "御朱印あり／頒布時間は公式の案内を確認"
          }
        ],
        "transit": "岡崎城天守のすぐ隣、本丸内。岡崎公園内を徒歩約2分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "三河武士のやかた家康館",
        "cuisine": "歴史展示館",
        "area": "愛知・岡崎",
        "purpose": "11:00。城の隣の展示館で、家康と三河武士団の歩みを正午前にひととおりさらう",
        "desc": "誕生から天下統一までの家康の生涯と、それを支えた三河武士たちを通史で見せる岡崎公園内の展示施設。刀や槍、兜を実際に持ち上げてその重さを確かめられる体験コーナーがあり、天守で外から城を眺めたあとに「中の人々」を知ると、午前の城めぐりが一気に立体的になる。城とセットの2館共通券を使えるのもここまでの流れに沿う。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/The_Iyeyasu_And_Mikawa_Bushi_Museum_2019-12_ac.jpg/1280px-The_Iyeyasu_And_Mikawa_Bushi_Museum_2019-12_ac.jpg"
        ],
        "specs": [
          {
            "k": "入館",
            "v": "大人360円・小人200円（岡崎城との2館共通券あり）"
          },
          {
            "k": "開館",
            "v": "9:00〜17:00（入館は16:30まで）"
          },
          {
            "k": "料金確認先",
            "v": "岡崎おでかけナビ（岡崎市観光協会）公式"
          }
        ],
        "transit": "岡崎公園内、岡崎城から徒歩約3分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "大樹寺",
        "cuisine": "寺院・歴史的眺望",
        "area": "愛知・岡崎",
        "purpose": "11:50。城から少し北上し、総門越しに岡崎城を望む一直線の眺めを確かめる",
        "desc": "松平氏・徳川家の菩提寺で、桶狭間の戦いの後に今川の人質だった若き家康が逃げ込み、住職から「厭離穢土 欣求浄土」の言葉を授かった場所として知られる。最大の見どころは、三代将軍家光が祖父生誕の地を望めるようにと伽藍を配置した「ビスタライン」。本堂から三門・総門を通して約3km先の岡崎城が一直線に見通せる眺望が、約370年にわたり守られている。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/J%C5%8Dd%C5%8Dzan_Sh%C5%8Dan-in_Daiju-ji_Temple_20230120_09.jpg/1280px-J%C5%8Dd%C5%8Dzan_Sh%C5%8Dan-in_Daiju-ji_Temple_20230120_09.jpg"
        ],
        "specs": [
          {
            "k": "宝物拝観",
            "v": "大人400円・小中学生200円ほか"
          },
          {
            "k": "見どころ",
            "v": "総門越しに岡崎城を望むビスタライン"
          },
          {
            "k": "料金確認先",
            "v": "岡崎おでかけナビ／岡崎市公式"
          }
        ],
        "transit": "名鉄「東岡崎」駅から名鉄バス大樹寺行で終点下車、徒歩約10分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "カクキュー八丁味噌（八丁味噌の郷）",
        "cuisine": "味噌蔵・産業観光",
        "area": "愛知・岡崎",
        "purpose": "13:30。城から旧八丁村へ移り、二夏二冬を越えた味噌蔵を見て味で半日を締める",
        "desc": "岡崎城から西へ八丁（約870m）の旧八丁村で、江戸初期から伝統製法の八丁味噌を造り続ける蔵元。大豆と塩を大きな木桶に仕込み、職人が重石を円錐状に積み上げて二夏二冬じっくり寝かせる仕込み蔵を、見学で間近に見られる。城名の由来と同じ「八丁」という地名が味噌そのものの名になっている点が、この町ならではの締めくくりにふさわしい。味噌料理の食事処も併設する。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Kaku-q_Hacchomiso-no-sato_03.JPG/1280px-Kaku-q_Hacchomiso-no-sato_03.JPG"
        ],
        "specs": [
          {
            "k": "工場見学",
            "v": "無料（10:00〜16:00／回ごとの開始時刻あり）"
          },
          {
            "k": "売店",
            "v": "9:00〜17:00"
          },
          {
            "k": "見学回確認先",
            "v": "カクキュー八丁味噌 公式サイト"
          }
        ],
        "transit": "愛知環状鉄道「中岡崎」駅から徒歩約5分／名鉄「岡崎公園前」駅からも至近"
      }
    ],
    "sideArticles": [
      {
        "t": "香嵐渓。待月橋ともみじの渓谷",
        "h": "/feature/aichi-korankei",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Korankei5.jpg/1280px-Korankei5.jpg"
      },
      {
        "t": "東寺 半日モデルコース。五重塔と立体曼荼羅をめぐる",
        "h": "/feature/kyoto-toji-temple",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Toji-Nandaimon_2015.jpg/1280px-Toji-Nandaimon_2015.jpg"
      }
    ],
    "quote": "川と味噌蔵の匂いのなかに、家康の原点がそのまま残っている町。",
    "quoteCite": "マチノワ編集部",
    "closing": "9:30に岡崎公園へ入り、まず復興天守へ上がって乙川を見下ろす。10:30すぎに本丸の龍城神社へ手を合わせ、家康館で甲冑の重みに触れたら正午前後。ここで一度東岡崎駅方面へ戻り、バスで北上して11:50ごろ大樹寺へ。総門越しに城を望むビスタラインを確かめてから、13:30前後に中岡崎駅そばのカクキューへ移動し、味噌蔵見学と味噌だれの一皿で締める。城・社・眺望・蔵を一筆書きでつなぐ、半日の家康行脚である。料金や見学回の時間はちょこちょこ変わるので、出かける前に各施設の公式案内で最新を押さえておくと迷わない。"
  },
  "shizuoka-fujinomiya": {
    "id": "shizuoka-fujinomiya",
    "no": "G10-12",
    "articleType": "guide",
    "kicker": "FUJINOMIYA",
    "title": "富士宮を歩く。浅間大社の湧玉池と富士の伏流水",
    "titleHTML": "富士宮を歩く。<br>浅間大社の湧玉池と富士の伏流水",
    "subtitle": "水音をたどって、富士の西麓をひと巡り",
    "lede": "富士宮の朝は、水の音から始まる。駅前の通りを抜けて大社へ向かうと、車の気配が遠のき、かわりに澄んだ流れの音がどこからともなく耳に届く。見上げれば、晴れた日には正面に富士が立っている。この街の水は、その白い山に降った雪と雨が、何十年もかけて溶岩の層をくぐり、いまここで湧き出したもの——そう知ってから歩くと、足元を流れる一本の用水路さえ、急によそよそしくなくなる。きょうは、その水の出どころをたどって西麓をのんびり巡ってみたい。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Wakutamaike.JPG/1280px-Wakutamaike.JPG",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "富士山本宮浅間大社",
        "cuisine": "神社",
        "area": "静岡県富士宮市",
        "purpose": "水めぐりの起点となる総本宮",
        "desc": "駅から大鳥居をくぐると、朱塗りの楼門の向こうに富士が見える、という贅沢な参道がまっすぐ続いている。ここは全国に千三百ほどある浅間神社の総本宮で、祀られているのはほかでもない、目の前にそびえる富士山そのもの。社殿の背後で湧き出す水を訪ねるための入口として、まずこの境内に立ってみたい。参拝は無料で、開門の時刻は季節によってかなり前後する。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Fujinomiya_Hongu_Sengen_Taisha_Honden.jpg/1280px-Fujinomiya_Hongu_Sengen_Taisha_Honden.jpg"
        ],
        "specs": [
          {
            "k": "参拝",
            "v": "境内自由・無料"
          },
          {
            "k": "開門",
            "v": "季節により変動（公式で確認）"
          }
        ],
        "transit": "JR身延線・富士宮駅から徒歩約10分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "湧玉池",
        "cuisine": "湧水池",
        "area": "静岡県富士宮市",
        "purpose": "富士の伏流水が湧き出す源を見る",
        "desc": "本殿の脇から東へ回ると、急に空気がひんやりする。これが湧玉池。富士に染み込んだ水がここで日に三十万トンほども湧き、水温は真夏でも真冬でも十三度前後とほとんど変わらない。水底の砂のあちこちから細かな気泡がゆらゆら立ちのぼるのが、湧き出している証拠だ。かつて富士へ登る行者はこの水で身を清めてから山に向かったといい、いまも国の特別天然記念物として守られている。手元の柄杓で触れる水の冷たさが、いちばん雄弁にこの土地の地下を語ってくれる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Wakutamaike.JPG/1280px-Wakutamaike.JPG"
        ],
        "specs": [
          {
            "k": "指定",
            "v": "国の特別天然記念物"
          },
          {
            "k": "水温",
            "v": "通年で約13度"
          }
        ],
        "transit": "浅間大社境内（富士宮駅から徒歩約10分）"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "白糸の滝",
        "cuisine": "滝",
        "area": "静岡県富士宮市",
        "purpose": "伏流水が崖一面から落ちる景を見る",
        "desc": "街を離れてバスで北へ向かうと、田畑の向こうに富士が大きくなってくる。遊歩道を下りた先で待っているのが白糸の滝。一本の太い流れではなく、幅百五十メートルほどの湾曲した崖の全面から、無数の細い水が絹糸のように垂れ落ちている。これも富士の伏流水で、水を通す新しい溶岩の層と通さない古い層の境目から、地中の水がそのまま染み出して滝になっているのだという。滝そのものの拝観は無料、近くの市営駐車場だけ有料なので、料金や開いている時間は最新の案内を見ておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Shiraito_Falls_%28Fujinomiya%29.jpg/1280px-Shiraito_Falls_%28Fujinomiya%29.jpg"
        ],
        "specs": [
          {
            "k": "幅",
            "v": "約150メートル"
          },
          {
            "k": "拝観",
            "v": "無料（駐車場は有料）"
          }
        ],
        "transit": "富士宮駅から富士急静岡バスで約30分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "田貫湖",
        "cuisine": "湖",
        "area": "静岡県富士宮市",
        "purpose": "湖面に映る逆さ富士を眺める",
        "desc": "さらに奥、朝霧高原の一角まで足を延ばすと田貫湖が開ける。周囲三・三キロほどの湖の真東に富士が据わり、風のない朝には水面が鏡になって、上下に二つの富士が向き合う逆さ富士が現れる。四月と八月の二十日ごろには、山頂から朝日が昇ってダイヤモンド富士になる数日があり、その時季は早朝から人が湖畔に集まる。湧玉池や滝で出会った水が、ここでは静かな湖の鏡となって富士を映し返している——同じ水の、まったく違う表情だ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/070127_tanuki-fuji.jpg/1280px-070127_tanuki-fuji.jpg"
        ],
        "specs": [
          {
            "k": "周囲",
            "v": "約3.3キロ"
          },
          {
            "k": "見もの",
            "v": "逆さ富士・ダイヤモンド富士"
          }
        ],
        "transit": "富士宮駅から休暇村富士行きバスで約50分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "静岡県富士山世界遺産センター",
        "cuisine": "博物館",
        "area": "静岡県富士宮市",
        "purpose": "歩いてきた水の循環を建物そのもので味わう",
        "desc": "湖から街へ戻り、最後に大社のすぐ近くまで来たら、逆さ富士のかたちをした建物に立ち寄りたい。県産ヒノキの木格子を組んだ逆円錐の展示棟が、前面に張られた水盤に映ると、上下が反転して正立した富士に見える、という坂茂の設計だ。館内は壁面の映像を見ながら螺旋のスロープを登る疑似富士登山になっていて、一般三百円で入れる。開館は九時から夕方まで、夏は延びる。一日たどってきた『富士に降って、地に湧いて、また映る』水の循環を、建物の側からもう一度なぞれる場所として、締めくくりにちょうどいい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Mt.fuji_World_Heritage_Centre%2CShizuoka.jpg/1280px-Mt.fuji_World_Heritage_Centre%2CShizuoka.jpg"
        ],
        "specs": [
          {
            "k": "入館料",
            "v": "一般300円"
          },
          {
            "k": "休館",
            "v": "第3火曜ほか"
          }
        ],
        "transit": "富士宮駅から徒歩約8分"
      }
    ],
    "sideArticles": [
      {
        "t": "大井川・寸又峡。SLと夢のかけ橋",
        "h": "/feature/shizuoka-oigawa-sumata",
        "img": "https://upload.wikimedia.org/wikipedia/commons/7/77/Flickr3_027_Oigawa_Railway_C56_44_and_49616.jpg"
      },
      {
        "t": "東寺 半日モデルコース。五重塔と立体曼荼羅をめぐる",
        "h": "/feature/kyoto-toji-temple",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Toji-Nandaimon_2015.jpg/1280px-Toji-Nandaimon_2015.jpg"
      }
    ],
    "quote": "湧玉池の水は一年じゅう十三度前後。覗き込むと、底の砂から銀の粒が静かに立ちのぼっていた。",
    "quoteCite": "マチノワ編集部",
    "closing": "夕方、駅へ戻る道で、また水路のせせらぎとすれ違った。朝に聞いたのと同じ音のようでいて、もう少しやわらかく聞こえる。富士に降ったものが地下で長い時間をかけてここまで来て、池になり、滝になり、湖の鏡になっていた——一日かけて、その同じ水にかたちを変えて何度も出会った気がする。山に登らなくても、富士はずっとそばにいた。なお、各所の参拝時間や料金、行事の予定はときどき改まるので、出かける前に公式の案内でいちど確かめておくと安心して歩ける。"
  },
  "shizuoka-oigawa-sumata": {
    "id": "shizuoka-oigawa-sumata",
    "no": "G10-13",
    "articleType": "guide",
    "kicker": "OIGAWA",
    "title": "大井川・寸又峡。SLと夢のかけ橋",
    "titleHTML": "大井川・寸又峡。<br>SLと夢のつり橋",
    "subtitle": "茶畑を蒸気が縫い、渓谷に橋が架かる。鉄道で深まる大井川の奥へ",
    "lede": "大井川という旅は、車窓から始まって車窓に帰っていく。静岡の真ん中を北へ遡るこの谷では、移動そのものが目的地になる。新金谷を出た蒸気機関車が茶畑の緑を黒い煙でなぞり、その先では電気を動力に変えたトロッコ列車がダム湖の上に浮かぶ駅へと客を運ぶ。線路の旅が深まるところに寸又峡の吊橋が待っていて、足元には翡翠色の水が流れている——鉄路と渓谷が交互に主役を譲り合う。この特集は「鉄道と渓谷」の一点に絞り、列車に揺られながら奥大井の水辺と橋をたどる道筋を追う。なお2022年の台風で本線の川根温泉笹間渡〜千頭は不通が続いており、奥へはバスや井川線への乗り継ぎが要る。運行区間・ダイヤ・運賃は時期で動くので、出発前に各鉄道・町営バスの公式案内で最新を当たってほしい。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/7/77/Flickr3_027_Oigawa_Railway_C56_44_and_49616.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "大井川鐵道のSL（新金谷駅発）",
        "cuisine": "鉄道・蒸気機関車",
        "area": "静岡県島田市金谷",
        "purpose": "煙を上げて茶畑を走る本物の蒸気機関車に乗る／撮る",
        "desc": "全国でいくつかの鉄道がSLを走らせているが、大井川鐵道は動態保存の蒸気機関車を毎日のように営業列車として走らせ続けてきた稀有な路線で、客車も昭和の旧型をそのまま使う。新金谷を出た列車は大井川に沿って茶畑のなかを進み、新茶の季節には濃い緑の畝を黒煙が横切る、ここでしか撮れない一枚が生まれる。台風被害のため現在の蒸気・電気急行は新金谷〜川根温泉笹間渡の運転で、千頭方面へは家山から町営バスへ乗り継ぐ。きかんしゃトーマス号の運転日や指定席の予約方法、運賃は変動するため公式サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/7/77/Flickr3_027_Oigawa_Railway_C56_44_and_49616.jpg"
        ],
        "specs": [
          {
            "k": "起点",
            "v": "新金谷駅（島田市金谷）"
          },
          {
            "k": "現在の運転区間",
            "v": "新金谷〜川根温泉笹間渡"
          },
          {
            "k": "車両",
            "v": "蒸気・電気急行／きかんしゃトーマス号など"
          },
          {
            "k": "予約・運賃",
            "v": "列車により指定。公式サイトで確認"
          }
        ],
        "transit": "新金谷駅はJR金谷駅から大井川本線で1駅。東京・名古屋方面からはJR東海道線で金谷へ"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "寸又峡 夢のつり橋",
        "cuisine": "吊橋・渓谷",
        "area": "静岡県榛原郡川根本町",
        "purpose": "翡翠色の水面に架かる吊橋を渡り、渓谷をひと巡りする",
        "desc": "ダム湖がたたえる独特の青緑——光の加減で翡翠にも見える水の色が、この吊橋を特別なものにしている。長さ約90mの板の橋が大間ダム湖の上に細く渡され、足元の隙間から水面がのぞく。橋は一方通行で一度に渡れる人数も限られるため、温泉街の駐車場から遊歩道を歩き、橋を渡って尾崎坂展望台へ抜け、約90分の周回路で戻ってくるのが定番の歩き方だ。混雑期は橋の手前で待ち時間が出ることもある。バスの本数は多くないので、行きと帰りの時刻は事前に町営バスの案内で押さえておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Yume-no-Tsuribashi_%2840896906290%29.jpg/1280px-Yume-no-Tsuribashi_%2840896906290%29.jpg"
        ],
        "specs": [
          {
            "k": "所在",
            "v": "寸又峡（川根本町）"
          },
          {
            "k": "橋の長さ",
            "v": "約90m・大間ダム湖上"
          },
          {
            "k": "歩き方",
            "v": "温泉街から周回路で約90分"
          },
          {
            "k": "アクセス",
            "v": "千頭駅からバス約40分＋徒歩"
          }
        ],
        "transit": "千頭駅前から寸又峡線の路線バスで約40分、寸又峡温泉下車。温泉街から遊歩道を歩く"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "奥大井湖上駅",
        "cuisine": "鉄道・秘境駅",
        "area": "静岡県榛原郡川根本町",
        "purpose": "ダム湖に突き出した湖上の駅とレインボーブリッジを渡る／見下ろす",
        "desc": "接岨湖の真ん中、湖に張り出した小さな半島の先端だけに設けられた駅で、両側を奥大井レインボーブリッジという赤い鉄橋が支えている。列車を降りると周囲はほぼ水面と山で、線路の脇に細い歩道が付いていて橋を歩いて渡れるのがこの駅の醍醐味。駅の南側の高台に上がれば、湖に浮かぶ駅とそこへ伸びる赤い橋を一望できる撮影地がある。井川線は2026年7月1日から1日上下各5本の予約制観光列車へ切り替わる予定で、乗車には事前予約が要る。受付開始時期や運賃は公式の案内で確かめてから計画を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Okuoikojo_Station_c._2019.jpg/1280px-Okuoikojo_Station_c._2019.jpg"
        ],
        "specs": [
          {
            "k": "路線",
            "v": "大井川鐵道 井川線"
          },
          {
            "k": "立地",
            "v": "接岨湖・レインボーブリッジ中央"
          },
          {
            "k": "千頭から",
            "v": "約1時間"
          },
          {
            "k": "2026年7月〜",
            "v": "予約制観光列車（1日上下各5本）"
          }
        ],
        "transit": "千頭駅から井川線（南アルプスあぷとライン）で約1時間。2026年7月以降は予約制の観光列車"
      }
    ],
    "sideArticles": [
      {
        "t": "富士宮を歩く。浅間大社の湧玉池と富士の伏流水",
        "h": "/feature/shizuoka-fujinomiya",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Wakutamaike.JPG/1280px-Wakutamaike.JPG"
      },
      {
        "t": "東寺 半日モデルコース。五重塔と立体曼荼羅をめぐる",
        "h": "/feature/kyoto-toji-temple",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Toji-Nandaimon_2015.jpg/1280px-Toji-Nandaimon_2015.jpg"
      }
    ],
    "quote": "線路を奥へ辿るほど、渓谷の水は青くなる。",
    "quoteCite": "マチノワ編集部",
    "closing": "茶畑の蒸気から渓谷の吊橋まで、この谷の見どころはどれも「渡る」ことと結びついている。鉄橋を渡る蒸気機関車を眺め、ダム湖に架かる奥大井湖上駅を歩き、寸又峡の谷をまたぐ夢のつり橋に足を乗せる。本線の不通でひと続きの直通こそ叶わないが、その分だけ列車・バス・徒歩を組み合わせる旅心が試される土地でもある。井川線は2026年7月から予約制の観光列車へ移るなど、足回りは年々変わっていく。回りたい順番と乗り継ぎ時刻は、訪ねる季節に合わせて各社の公式時刻表で組み直してから出かけてほしい。"
  },
  "hokkaido-toyako": {
    "id": "hokkaido-toyako",
    "no": "G10-14",
    "articleType": "guide",
    "kicker": "TOYAKO",
    "title": "洞爺湖。火山と湖の絶景めぐり",
    "titleHTML": "洞爺湖。<br>火山と湖の絶景めぐり",
    "subtitle": "噴火が刻んだ地形を、湖上と山上から読み解く",
    "lede": "洞爺湖を「きれいな湖」とだけ眺めて帰るのは、少しもったいない。この円い湖はおよそ11万年前の巨大噴火でできたカルデラに水がたまったもので、中央に浮かぶ中島も、湖を見下ろす昭和新山も、すべて地下のマグマが地表に書き残した痕跡だ。火山は遠い過去の話ではなく、昭和新山は1940年代の噴火で麦畑が盛り上がって生まれた山であり、有珠山は20世紀だけで複数回噴火している。つまりここでは「絶景」と「生きている火山」が同じ風景の中に同居している。湖の水面、火口の噴煙、隆起した赤い岩肌。そのコントラストを、湖上の船、山上のロープウェイ、高台の展望台と視点を変えながら追いかけると、洞爺湖の地形そのものが立体的に見えてくる。今回は火山と湖という一本の軸で、その読み解き方を案内する。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Mount_Showa-shinzan_01.jpg/1280px-Mount_Showa-shinzan_01.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "洞爺湖（中島・洞爺湖汽船）",
        "cuisine": "カルデラ湖",
        "area": "北海道虻田郡洞爺湖町",
        "purpose": "巨大噴火が生んだカルデラ湖の成り立ちを、湖上から体感する起点",
        "desc": "ほぼ円形の洞爺湖は、約11万年前の大噴火でできた窪地に水がたまったカルデラ湖で、湖の真ん中に浮かぶ中島は、そのあとの火山活動で湖底から盛り上がってできた島だ。つまり湖と島は別の時代の噴火の産物で、それを一度に見渡せるのが双胴の遊覧船。大島・弁天島・観音島・饅頭島からなる中島には夏季に大島で上陸でき、島内の博物館で湖がどう形づくられたかをたどれる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Lake-Toya_-_panoramio.jpg/1280px-Lake-Toya_-_panoramio.jpg"
        ],
        "specs": [
          {
            "k": "形態",
            "v": "支笏洞爺国立公園内のカルデラ湖"
          },
          {
            "k": "湖上アクセス",
            "v": "洞爺湖汽船の遊覧船。夏季は約30分間隔、冬季は約60分間隔"
          },
          {
            "k": "中島上陸",
            "v": "夏季のみ大島に下船可。期間や運航は公式で確認を"
          }
        ],
        "transit": "洞爺湖温泉バスターミナルから徒歩約5分の遊覧船乗り場が起点。JR洞爺駅からは温泉街行きバスで約20分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "昭和新山",
        "cuisine": "溶岩ドーム（特別天然記念物）",
        "area": "北海道有珠郡壮瞥町",
        "purpose": "「火山が生まれる瞬間」を記録した、世界的にも珍しい新しい山を間近に見る",
        "desc": "昭和新山は、1940年代の有珠山の噴火活動でそれまで麦畑だった土地が数年かけて隆起してできた、生まれたばかりの火山だ。粘り気の強い溶岩が押し上げた溶岩ドームで、地表近くの土が熱で焼かれて赤茶けた岩肌になり、今も山肌のあちこちから白い噴気が上がっている。誕生の過程を地元の郵便局長・三松正夫が克明に記録したことでも知られ、その観測ぶりは山麓の記念館で触れられる。山には立ち入らず麓から眺めるのが基本だ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Mount_Showa-shinzan_01.jpg/1280px-Mount_Showa-shinzan_01.jpg"
        ],
        "specs": [
          {
            "k": "標高",
            "v": "約398m（1944〜45年の隆起で誕生）"
          },
          {
            "k": "見学",
            "v": "麓から外観を眺める形。登山・立ち入りは不可"
          },
          {
            "k": "駐車場",
            "v": "有料駐車場あり"
          }
        ],
        "transit": "JR洞爺駅からバスで約30分、または道央自動車道・虻田洞爺湖ICから車で約15分。有珠山ロープウェイ山麓駅と隣接"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "有珠山ロープウェイ・火口原展望台",
        "cuisine": "ロープウェイ／展望台",
        "area": "北海道有珠郡壮瞥町",
        "purpose": "活火山の火口と、その向こうの洞爺湖を一望にする高さを稼ぐ",
        "desc": "昭和新山の隣に立つ有珠山は、20世紀に何度も噴火を繰り返してきた活火山。ロープウェイで山頂駅まで上がり、遊歩道を数分歩いた先の火口原展望台に立つと、1977年の噴火でできた火口が眼下に広がり、今も水蒸気を上げる生々しい地形を見下ろせる。振り返れば洞爺湖と中島、足元に昭和新山という、火山と湖を一画面に収める眺めが待っている。点検運休の日もあるため、運行状況は事前に公式で確かめておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/130922_Usuzan_Ropeway_Sobetsu_Hokkaido_Japan04s3.jpg/1280px-130922_Usuzan_Ropeway_Sobetsu_Hokkaido_Japan04s3.jpg"
        ],
        "specs": [
          {
            "k": "区間",
            "v": "山麓駅〜有珠山頂駅 片道約6分"
          },
          {
            "k": "料金",
            "v": "おとな往復1,600円ほど・こども往復800円ほど（最新は公式で確認を）"
          },
          {
            "k": "見どころ",
            "v": "山頂駅から徒歩約7分の火口原展望台と洞爺湖展望台"
          }
        ],
        "transit": "昭和新山の山麓駅から乗車。片道約6分で有珠山頂駅へ。山頂駅から遊歩道を歩いて火口原展望台へ"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "サイロ展望台",
        "cuisine": "展望台",
        "area": "北海道虻田郡洞爺湖町",
        "purpose": "湖・中島・火山群をひとつの構図に収め、地形の全体像をつかむ",
        "desc": "湖を北西の高台から見下ろすこの展望台は、洞爺湖の円い水面、中央の中島、湖の南に連なる有珠山と昭和新山までを一度に視界へ入れられる場所だ。これまで船から、山頂から見てきた地形を、ここで俯瞰すると「カルデラに水がたまり、その縁を火山が固める」という洞爺湖の構造が一枚の風景として腑に落ちる。売店や、湖を望むウッドデッキに面したカフェも併設され、ソフトクリーム片手に景色を眺める時間が取りやすい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/20181106_Toyako_5251_%2848429928132%29.jpg/1280px-20181106_Toyako_5251_%2848429928132%29.jpg"
        ],
        "specs": [
          {
            "k": "眺望",
            "v": "洞爺湖・中島・有珠山・昭和新山を一望"
          },
          {
            "k": "併設",
            "v": "売店・喫茶コーナー・ウッドデッキのカフェ"
          },
          {
            "k": "営業",
            "v": "売店は日中営業。時間や催しは公式で確認を"
          }
        ],
        "transit": "洞爺湖の西岸、国道230号沿いの高台。洞爺湖温泉から車で約15分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "洞爺湖温泉街",
        "cuisine": "温泉地",
        "area": "北海道虻田郡洞爺湖町",
        "purpose": "湖畔で一日を締め、火山の恵みである湯と湖上花火で旅を結ぶ",
        "desc": "湖のすぐ際まで宿が並ぶこの温泉街は、火山地帯ならではの湯がわく場所で、めぐり歩きの締めくくりにちょうどいい。春から秋にかけては毎夜、船が湖上を移動しながら花火を打ち上げる催しが続き、湯気の向こうや客室・露天風呂から、湖面に映る光をゆったり眺められるのが洞爺湖ならでは。花火の開催期間や時刻は年によって変わるので、訪れる前に観光協会の案内で日程を確かめておくとよい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/%E6%B4%9E%E7%88%BA%E6%B9%96%E6%B8%A9%E6%B3%89%E8%A1%97.JPG/1280px-%E6%B4%9E%E7%88%BA%E6%B9%96%E6%B8%A9%E6%B3%89%E8%A1%97.JPG"
        ],
        "specs": [
          {
            "k": "泉質の背景",
            "v": "火山地帯の温泉地。湖畔に宿が集まる"
          },
          {
            "k": "夜の楽しみ",
            "v": "船が移動しながら上げる湖上花火（例年春〜秋の夜開催）"
          },
          {
            "k": "起点",
            "v": "遊覧船・バスターミナルが徒歩圏でめぐりの拠点に"
          }
        ],
        "transit": "JR洞爺駅からバスで約20分の洞爺湖温泉バスターミナル一帯。遊覧船乗り場まで徒歩約5分"
      }
    ],
    "sideArticles": [
      {
        "t": "知床。世界自然遺産の原生の岬",
        "h": "/feature/hokkaido-shiretoko",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/140829_Ichiko_of_Shiretoko_Goko_Lakes_Hokkaido_Japan01s5.jpg/1280px-140829_Ichiko_of_Shiretoko_Goko_Lakes_Hokkaido_Japan01s5.jpg"
      },
      {
        "t": "東寺 半日モデルコース。五重塔と立体曼荼羅をめぐる",
        "h": "/feature/kyoto-toji-temple",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Toji-Nandaimon_2015.jpg/1280px-Toji-Nandaimon_2015.jpg"
      }
    ],
    "quote": "水をたたえた円い湖と、いまも湯気を上げる火口。洞爺湖では、絶景と火山が地続きで並んでいる。",
    "quoteCite": "マチノワ編集部",
    "closing": "洞爺湖をめぐっていると、「静かな湖」と「荒々しい火山」が反対のものではなく、同じ大地の表と裏なのだと感じられてくる。噴火がカルデラをつくり、そこに水がたまって湖になり、その湖をいまも火山が縁取っている。湖面の青、火口の白い噴煙、昭和新山の赤い岩肌を一日でたどれば、風景の見え方は来る前と確実に変わっているはずだ。なお、ロープウェイや遊覧船の運航は天候や点検で休止することがあり、温泉街の催しも年によって日程が動く。出かける前に、各施設の公式発表で最新の状況を一度のぞいておくと安心だ。"
  },
  "hokkaido-shiretoko": {
    "id": "hokkaido-shiretoko",
    "no": "G10-15",
    "articleType": "guide",
    "kicker": "SHIRETOKO",
    "title": "知床。世界自然遺産の原生の岬",
    "titleHTML": "知床。<br>世界自然遺産の原生の岬",
    "subtitle": "陸の道が尽きるところから、流氷が育てた森と海を歩く",
    "lede": "知床がほかの観光地と決定的に違うのは、人間の都合がいちばん後回しになっている点だ。半島の先へ向かう道路は途中でぷつりと途切れ、その先は車も歩道も入れない。ヒグマが暮らす森には人のほうが入る時間と人数を制限される。冬にはオホーツクの流氷が栄養を運び込み、それが海から森までの食物連鎖をまるごと支えている——この海と陸が一続きの生態系であることが評価され、知床は2005年に世界自然遺産に登録された。だからここでの楽しみ方は「征服」ではなく「お邪魔する」感覚に近い。木道の手すりの内側から原生の森をのぞき、断崖の上から湧き水の滝を見下ろし、船の上から人の歩けない岬を仰ぐ。立ち入れない場所が多いからこそ、許された場所での景色が濃い。斜里町ウトロを起点に、その濃さを味わう五つの場所をたどる。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/140829_Ichiko_of_Shiretoko_Goko_Lakes_Hokkaido_Japan01s5.jpg/1280px-140829_Ichiko_of_Shiretoko_Goko_Lakes_Hokkaido_Japan01s5.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "知床五湖",
        "cuisine": "原生林の湖沼群",
        "area": "北海道斜里町",
        "purpose": "世界自然遺産の森と湖を、ヒグマの領域に踏み込まずに歩く",
        "desc": "原生林に点在する五つの湖を、二つの異なる歩き方で味わえる場所。全長約800mの高架木道は電気柵に守られて全期間無料・手続き不要で歩け、一湖のほとりからは知床連山とオホーツク海が一望でき、風のない朝には雪をのせた山並みが水面に映り込む。一方、地上遊歩道はヒグマの生活圏そのものを通るため、植生保護期はレクチャー受講、ヒグマ活動期(おおむね5月中旬〜7月末)は登録ガイドの引率が必須という、人間の側が条件を満たして初めて入れる仕組みになっている。この『湖を見るために人が手続きする』逆転こそ知床五湖ならではの体験だ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/140829_Ichiko_of_Shiretoko_Goko_Lakes_Hokkaido_Japan01s5.jpg/1280px-140829_Ichiko_of_Shiretoko_Goko_Lakes_Hokkaido_Japan01s5.jpg"
        ],
        "specs": [
          {
            "k": "高架木道",
            "v": "約800m・無料・手続き不要"
          },
          {
            "k": "地上遊歩道",
            "v": "時季によりレクチャー受講かガイド引率が必須"
          },
          {
            "k": "確認先",
            "v": "知床五湖フィールドハウス公式の最新案内で時季ごとの条件を確認"
          }
        ],
        "transit": "JR知床斜里駅からバス約90分。ウトロ温泉バスターミナルからも路線バス・観光船連絡などでアクセス"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "オシンコシンの滝",
        "cuisine": "名瀑",
        "area": "北海道斜里町",
        "purpose": "ウトロへ向かう道沿いで、知床へ入る『門』のような滝を見上げる",
        "desc": "ウトロへ続く国道334号のすぐ脇で、岩肌を流れ落ちる途中から流れが二筋に分かれる姿から『双美の滝』とも呼ばれる。日本の滝百選の一つで、滝名はエゾマツの群生地を意味するアイヌ語に由来する。横手の階段を上れば流れのすぐ間近まで近づけ、水しぶきと音に包まれながら見上げる構図になるのが、遠望で終わらないこの滝の見どころ。道路から数分で行き来でき、知床中心部へ入る前の景色の切り替わりとして立ち寄りやすい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/2/20/Oshinkoshin_Falls_%28Shiretoko%29_%E3%82%AA%E3%82%B7%E3%83%B3%E3%82%B3%E3%82%B7%E3%83%B3%E3%81%AE%E6%BB%9D%28%E7%9F%A5%E5%BA%8A%29.jpg"
        ],
        "specs": [
          {
            "k": "形状",
            "v": "途中で二筋に分かれる『双美の滝』"
          },
          {
            "k": "立ち寄り",
            "v": "横の階段で滝のすぐ近くまで。駐車場あり"
          },
          {
            "k": "選定",
            "v": "日本の滝百選・知床八景の一つ"
          }
        ],
        "transit": "JR知床斜里駅から車約30分。ウトロ温泉バスターミナルから斜里方面行きバスで約8分、オシンコシンの滝下車すぐ"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "知床峠",
        "cuisine": "山岳道路の峠",
        "area": "北海道斜里町",
        "purpose": "ウトロと羅臼を結ぶ峠から、半島の背骨である羅臼岳を間近に望む",
        "desc": "ウトロと羅臼を山越えで結ぶ国道334号の頂点で、標高約738m。目の前に半島の主峰・羅臼岳がそびえ、晴れた日には根室海峡の向こうに国後島まで見渡せることがある。この道は雪に閉ざされる冬の間は完全に閉鎖され、例年おおむね5月前後の開通から11月初旬の閉鎖までしか越えられない——通れる季節そのものが限られている点が、知床の自然条件の厳しさを一番素直に物語っている。開通直後には道路脇に雪の壁が残ることもあり、季節の移ろいが景色に直結する峠だ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/%E7%9F%A5%E5%BA%8A%E5%B3%A0%E3%81%8B%E3%82%89%E7%BE%85%E8%87%BC%E5%B2%B3_20120906_-_panoramio.jpg/1280px-%E7%9F%A5%E5%BA%8A%E5%B3%A0%E3%81%8B%E3%82%89%E7%BE%85%E8%87%BC%E5%B2%B3_20120906_-_panoramio.jpg"
        ],
        "specs": [
          {
            "k": "標高",
            "v": "約738m"
          },
          {
            "k": "通行期",
            "v": "おおむね春〜11月初旬。冬期は通行止め"
          },
          {
            "k": "確認先",
            "v": "開通・通行状況は道路管理者の公式発表で事前確認を"
          }
        ],
        "transit": "ウトロ市街から国道334号(知床横断道路)で車。峠は標高約738m。冬期は通行止め"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "フレペの滝",
        "cuisine": "断崖の滝・遊歩道",
        "area": "北海道斜里町",
        "purpose": "川を持たない不思議な滝を、海へ落ちる断崖の上から見る",
        "desc": "知床連山に降った雨や雪が地下に染み込み、高さ約100mの断崖の割れ目からじわりと湧き出してオホーツク海へ落ちる滝。流れ込む川を持たず、染み出した水が涙の雫のように岩肌を伝う様子から『乙女の涙』の愛称で親しまれる。注目したいのは、この滝が断崖の下からではなく、草原の遊歩道を抜けた崖の上から見下ろす形で姿を現すこと。知床自然センターから続く道はおおむね平坦で歩きやすいが、ここもヒグマの生息域のため出没状況により通行が見合わされることがある。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/%E3%83%95%E3%83%AC%E3%83%9A%E3%81%AE%E6%BB%9D_-_panoramio_%281%29.jpg/1280px-%E3%83%95%E3%83%AC%E3%83%9A%E3%81%AE%E6%BB%9D_-_panoramio_%281%29.jpg"
        ],
        "specs": [
          {
            "k": "落差",
            "v": "断崖は高さ約100m"
          },
          {
            "k": "成り立ち",
            "v": "地下水が崖の割れ目から湧き出す『乙女の涙』"
          },
          {
            "k": "歩程",
            "v": "知床自然センターから往復約2km・滝まで約20分"
          }
        ],
        "transit": "知床自然センターを起点に遊歩道で片道約1km(往復約2km)、滝まで徒歩約20分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "ウトロ港(知床岬クルーズ)",
        "cuisine": "港・観光船発着",
        "area": "北海道斜里町",
        "purpose": "陸路では立ち入れない半島先端を、海側から仰ぎ見る",
        "desc": "知床のハイライトは、実は陸から歩いて行けない場所に集まっている。半島の先へ続く道路は途中で途切れ、その先の断崖や滝、知床岬まではウトロ港発の観光船からしか見られない。船はプユニ岬やカムイワッカの滝、ルシャ湾、カシュニの滝などをたどりながら、運航コースによっては片道で岬の突端付近まで進む。海側からだからこそ、人の手が一切届かない原生の海岸線が連なる様子と、運がよければ岩場で過ごすヒグマの姿を遠望できる。歩けない領域を眺める唯一の手段が船だという点に、知床の境界線がはっきり表れている。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/140828_Utoro_Port_Shari_Hokkaido_Japan04bs.jpg/1280px-140828_Utoro_Port_Shari_Hokkaido_Japan04bs.jpg"
        ],
        "specs": [
          {
            "k": "コース",
            "v": "滝めぐり・ヒグマ観察・知床岬など所要が分かれる"
          },
          {
            "k": "見どころ",
            "v": "陸路で行けない断崖・滝・知床岬を海から望む"
          },
          {
            "k": "運航",
            "v": "便・コース・運休は各船会社の公式で要確認"
          }
        ],
        "transit": "ウトロ市街の港から各観光船が発着。JR知床斜里駅からバスでウトロへ"
      }
    ],
    "sideArticles": [
      {
        "t": "洞爺湖。火山と湖の絶景めぐり",
        "h": "/feature/hokkaido-toyako",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Mount_Showa-shinzan_01.jpg/1280px-Mount_Showa-shinzan_01.jpg"
      },
      {
        "t": "東寺 半日モデルコース。五重塔と立体曼荼羅をめぐる",
        "h": "/feature/kyoto-toji-temple",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Toji-Nandaimon_2015.jpg/1280px-Toji-Nandaimon_2015.jpg"
      }
    ],
    "quote": "道が途切れた先にこそ、知床の本体がある。",
    "quoteCite": "マチノワ編集部",
    "closing": "五つの場所に共通するのは、どこも「ここまで」という境界を感じさせることだ。木道の先、車道の先、遊歩道の柵の向こう、船が引き返す岬——人が入れる範囲はいつも手前で止まり、その先に原生の領域が広がっている。その線引きこそが、知床を世界自然遺産たらしめている設計そのものだと言っていい。なお知床五湖の地上遊歩道はヒグマの活動状況で歩き方や受付方法が時季ごとに変わり、横断道路やシャトルバスの運行も季節で大きく動く。出かける前に、知床斜里町観光協会や各施設の公式発信で当日の状況をひと通り確かめておくと安心だ。境界の手前に立つだけで、この半島が守ろうとしているものの大きさは十分に伝わってくる。"
  },
  "kagoshima-kirishima": {
    "id": "kagoshima-kirishima",
    "no": "G10-16",
    "articleType": "guide",
    "kicker": "KIRISHIMA",
    "title": "霧島神宮を歩く。朱の社殿と高千穂の山々",
    "titleHTML": "霧島神宮を歩く。<br>朱の社殿と高千穂の山々",
    "subtitle": "天孫降臨の伝説が眠る山あいを、湯けむりとともに辿る半日",
    "lede": "朝の参道は、まだ少しひんやりしている。杉木立のあいだから差し込む光が石畳に縞をつくり、ときどき鳥の声が頭上をかすめていく。坂をのぼりきると、緑の奥にいきなり朱が立ち上がった。霧島神宮の社殿だ。色を見た瞬間、空気の密度が変わる気がする。背後には高千穂の峰々が霞んでいて、ここがただの神社ではなく、山そのものを拝む場所なのだと、足の裏でわかる。きょうはここを起点に、湯けむりの立つ谷あいまでゆっくり下っていこうと思う。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Kirishima-Jingu_Washing-hands.jpg/1280px-Kirishima-Jingu_Washing-hands.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "霧島神宮",
        "cuisine": "神社",
        "area": "鹿児島県霧島市霧島田口",
        "purpose": "天孫降臨神話のニニギノミコトを祀る山あいの古社。歩きの起点に",
        "desc": "参道を抜けて最初に目に飛び込むのは、緑のなかに据えられた朱塗りの社殿だ。いま立っているこの本殿・幣殿・拝殿は江戸期に薩摩藩主の島津吉貴が寄進したもので、2022年に国宝へ指定された。彫刻や極彩色の細部を見上げていると首が痛くなるほどで、山の社殿としては異例の華やかさだと感じる。境内の右手奥に回ると、樹齢八百年ともいわれる御神木の大杉が立っていて、見上げた幹の太さに思わず足が止まる。この一本が南九州じゅうの杉の祖だと伝わると聞けば、なおさら手を合わせたくなる場所だ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Kirishima-Jingu_Washing-hands.jpg/1280px-Kirishima-Jingu_Washing-hands.jpg"
        ],
        "specs": [
          {
            "k": "祭神",
            "v": "ニニギノミコト"
          },
          {
            "k": "社殿",
            "v": "本殿・幣殿・拝殿が国宝"
          },
          {
            "k": "御神木",
            "v": "樹齢約800年の大杉"
          }
        ],
        "transit": "JR日豊本線・霧島神宮駅からバス約15分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "高千穂峰",
        "cuisine": "山・登山",
        "area": "鹿児島県霧島市・宮崎県境",
        "purpose": "山頂に天逆鉾が刺さる霧島連峰第二峰。神話の舞台を仰ぐ",
        "desc": "社殿で背中越しに見えていた峰の正体が、これだ。標高1,574メートル、霧島連峰では二番目に高いこの成層火山の頂には、ニニギノミコトが突き立てたと伝わる青銅の天逆鉾が刺さっている。登るなら標高およそ970メートルの高千穂河原から鳥居をくぐり、古宮址を経て御鉢の火口縁を辿るのが定番で、ざらつく火山砂の斜面に足を取られながらの道のりだ。山頂まで行かずとも、河原のビジターセンターから仰ぐ円錐形の山容だけで、ここが「天から神が降りた」と語り継がれてきた理由が腑に落ちる。登山道や開通状況は気象で変わるため、入山前に最新の案内を確かめたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Mt.Takachiho_2015.jpg/1280px-Mt.Takachiho_2015.jpg"
        ],
        "specs": [
          {
            "k": "標高",
            "v": "1,574m"
          },
          {
            "k": "登山口",
            "v": "高千穂河原（約970m）"
          },
          {
            "k": "山頂",
            "v": "天逆鉾"
          }
        ],
        "transit": "登山口の高千穂河原まで霧島神宮駅からバス・車"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "丸尾滝",
        "cuisine": "滝",
        "area": "鹿児島県霧島市牧園町高千穂",
        "purpose": "温泉水を含み青みを帯びて落ちる、道沿いの滝",
        "desc": "山を下って国道沿いを進むと、車道のすぐ脇でいきなり水音が大きくなる。高さ23メートル、幅16メートルの簾のように広がって落ちるのが丸尾滝だ。ふつうの渓流の滝と違って、この滝は上流に湧く温泉の水を集めて流れているため、光の加減で滝つぼが乳青色に澱んで見えることがある。湯の里らしい滝で、温泉地のなかにこういう景物が当たり前に組み込まれているのが霧島らしい。橋の上から眺めると、晴れた日には水しぶきに小さな虹がかかることもあって、しばらく足を止めてしまう。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/b/b7/%E4%B8%B8%E5%B0%BE%E3%81%AE%E6%BB%9D.jpg"
        ],
        "specs": [
          {
            "k": "規模",
            "v": "高さ約23m・幅約16m"
          },
          {
            "k": "水の特徴",
            "v": "上流の温泉水を含む"
          }
        ],
        "transit": "霧島神宮駅からバスで丸尾方面、丸尾バス停から徒歩圏"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "霧島温泉郷（丸尾温泉）",
        "cuisine": "温泉",
        "area": "鹿児島県霧島市牧園町高千穂",
        "purpose": "山と滝を歩いた足をほどく、湯けむりの谷あい",
        "desc": "滝から谷をもう少し下ると、あちこちから白い湯けむりが立ちのぼる一帯に出る。霧島温泉郷の中心、丸尾の集落だ。単純温泉のやわらかな湯もあれば、湯の花の香る硫黄泉もあって、宿や日帰り湯ごとに湯の表情が違うのが歩いていて面白い。荷物を解かずとも、通りに面した足湯にこしかけて靴を脱げば、それだけで一日歩いた疲れがほどけていく。山頂の神話も、青い滝つぼも、最後はこの湯けむりへ続いていたのだと、湯気のなかでぼんやり思う。営業日や料金は施設ごとに異なるので、立ち寄り先は事前に確かめておくとよい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Maruo_Onsen_Kirishima01n4592.jpg/1280px-Maruo_Onsen_Kirishima01n4592.jpg"
        ],
        "specs": [
          {
            "k": "泉質",
            "v": "単純温泉・硫黄泉など"
          },
          {
            "k": "立ち寄り",
            "v": "足湯あり"
          }
        ],
        "transit": "霧島神宮駅からバスで丸尾下車すぐ"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "えびの高原",
        "cuisine": "高原・自然",
        "area": "宮崎県えびの市",
        "purpose": "火口湖をめぐる、霧島の屋根を歩く締めくくり",
        "desc": "余力があれば、谷から県境を越えて標高約1,200メートルのえびの高原まで足を伸ばしたい。韓国岳のふもとに開けたこの高原には、白紫池・六観音御池・不動池という三つの火口湖が点在し、それらを繋ぐ池めぐりの遊歩道が一周二時間ほどで歩ける。湖面の色が池ごとに違い、とりわけ不動池のコバルトに澄んだ水は、火山ガスが溶け込んでできた色だと知ると見え方が変わる。社殿から始まった一日が、最後は山の上の静かな水辺で終わる。風の通り道に立つと、霧島がひとつの大きな火山の地形なのだと、ここでようやく全体像が掴める。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Mount_Karakuni_from_Ebino_Plateau.jpg/1280px-Mount_Karakuni_from_Ebino_Plateau.jpg"
        ],
        "specs": [
          {
            "k": "標高",
            "v": "約1,200m"
          },
          {
            "k": "見どころ",
            "v": "火口湖の池めぐり"
          }
        ],
        "transit": "霧島温泉郷から県道・車でアクセス"
      }
    ],
    "sideArticles": [
      {
        "t": "東寺 半日モデルコース。五重塔と立体曼荼羅をめぐる",
        "h": "/feature/kyoto-toji-temple",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Toji-Nandaimon_2015.jpg/1280px-Toji-Nandaimon_2015.jpg"
      },
      {
        "t": "醍醐寺を歩く。五重塔と三宝院の庭",
        "h": "/feature/kyoto-daigoji",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Daigoji_Kyoto01s5s4110.jpg/1280px-Daigoji_Kyoto01s5s4110.jpg"
      }
    ],
    "quote": "朱の色を見た瞬間、空気の密度が変わる。ここは社殿ではなく、山を拝む場所なのだ。",
    "quoteCite": "マチノワ編集部",
    "closing": "谷を下りきって湯に足を浸すと、半日かけて歩いた距離が、ふくらはぎのあたりにじんわり戻ってくる。朱の社殿、山頂に刺さった逆鉾の伝説、青く澱む滝つぼ、池をめぐる風。どれも別々の場所のようでいて、足で繋いでみると一続きの山の物語だったと気づく。霧島は、見にいく土地というより歩いて染み込ませる土地なのかもしれない。湯から上がる頃には日が傾いて、来た道の杉の影が長く伸びていた。なお、各施設の参拝時間や料金、登山道の状況は折にふれて変わるので、出かける前に公式の案内へ目を通しておくと安心して歩ける。（マチノワ編集部）"
  }
};
