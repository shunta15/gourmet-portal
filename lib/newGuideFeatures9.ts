import type { Feature, FeatureArticle } from "./data";

// 自動生成。sideArticlesのリンク表示名を現行タイトルに同期(2026-06-21)。

export const NEWGUIDE9_FEATURES: Feature[] = [
  {
    "id": "tokyo-takao-mountain",
    "no": "G9-01",
    "tag": "自然",
    "kicker": "TAKAOSAN",
    "title": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
    "sub": "天狗の山に残る信仰の道を、杉木立と展望をたどってのぼる",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
  },
  {
    "id": "tokyo-shibamata-walk",
    "no": "G9-02",
    "tag": "さんぽ",
    "kicker": "SHIBAMATA",
    "title": "柴又を歩く。帝釈天の参道と矢切の渡し、寅さんの下町",
    "sub": "江戸川の風と、団子を焼く煙のあいだで",
    "image": "https://upload.wikimedia.org/wikipedia/commons/0/04/Shibamata_Taishakuten.jpg"
  },
  {
    "id": "tokyo-tachikawa-showa",
    "no": "G9-03",
    "tag": "子連れ",
    "kicker": "SHOWA PARK",
    "title": "国営昭和記念公園で一日。立川の大きな原っぱと花畑",
    "sub": "東京・立川｜広い芝生と季節の花で、子どもと丸一日",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Showa_Commemorative_National_Government_Park_1.JPG/1280px-Showa_Commemorative_National_Government_Park_1.JPG"
  },
  {
    "id": "tokyo-fukagawa-walk",
    "no": "G9-04",
    "tag": "さんぽ",
    "kicker": "FUKAGAWA",
    "title": "門前仲町・深川を歩く。八幡さまと庭園、水辺の下町",
    "sub": "FUKAGAWA ── 線香の匂いと水の匂いがまじる、江東の路地をたどって",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Tomioka_Hachiman-gu_2008_August.jpg/1280px-Tomioka_Hachiman-gu_2008_August.jpg"
  },
  {
    "id": "osaka-minoo-falls",
    "no": "G9-05",
    "tag": "自然",
    "kicker": "MINOO FALLS",
    "title": "箕面大滝へ。紅葉の渓谷をたどる滝みち",
    "sub": "大阪・箕面 / 滝と紅葉の渓谷さんぽ",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Minoh_Falls_Minoh_Osaka_pref_Japan08s3.jpg/1280px-Minoh_Falls_Minoh_Osaka_pref_Japan08s3.jpg"
  },
  {
    "id": "osaka-shitennoji-walk",
    "no": "G9-06",
    "tag": "さんぽ",
    "kicker": "SHITENNOJI",
    "title": "四天王寺を歩く。日本仏法最初の官寺と門前の坂",
    "sub": "大阪・天王寺、伽藍と坂と祈りのあいだを",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Shitenno-ji_Temple_%40_Osaka_%2813382942704%29.jpg/1280px-Shitenno-ji_Temple_%40_Osaka_%2813382942704%29.jpg"
  },
  {
    "id": "kyoto-kurama-kibune",
    "no": "G9-07",
    "tag": "さんぽ",
    "kicker": "KURAMA KIBUNE",
    "title": "鞍馬から貴船へ。叡電で抜ける北山の杜と川床",
    "sub": "出町柳で電車を乗り換え、杉木立の山をひとつ越えて、水音のする谷へ降りていく半日",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Eiden_Hachiman_mae_station_20071003.JPG/1280px-Eiden_Hachiman_mae_station_20071003.JPG"
  },
  {
    "id": "kyoto-ohara-sanzen",
    "no": "G9-08",
    "tag": "さんぽ",
    "kicker": "OHARA",
    "title": "大原・三千院を歩く。苔の庭と里の静けさ",
    "sub": "京都・左京大原　石段の参道から、声明の谷へ",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Sanzen-in_%E4%B8%89%E5%8D%83%E9%99%A2_%28KYOTO-JAPAN%29_%284951385058%29.jpg/1280px-Sanzen-in_%E4%B8%89%E5%8D%83%E9%99%A2_%28KYOTO-JAPAN%29_%284951385058%29.jpg"
  },
  {
    "id": "hyogo-nishinomiya-koshien",
    "no": "G9-09",
    "tag": "さんぽ",
    "kicker": "NISHINOMIYA",
    "title": "西宮で立ち寄りたい。甲子園とえびす総本社の街",
    "sub": "球場の歓声、厄除けの寺、桜と酒。海と山にはさまれた一帯を、テーマを変えながら歩く",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/2015_0610_Ivy_of_Koshien_Stadium.jpg/1280px-2015_0610_Ivy_of_Koshien_Stadium.jpg"
  },
  {
    "id": "hyogo-rokko-maya-night",
    "no": "G9-10",
    "tag": "夜景",
    "kicker": "MAYA ROKKO",
    "title": "摩耶山・六甲の夜景。掬星台から1000万ドルの夜",
    "sub": "兵庫・神戸六甲｜灘から中央へ、灯りが満ちる稜線をたどる夜",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/View_of_Kikuseidai_from_Mount_Maya_Kobe.jpg/1280px-View_of_Kikuseidai_from_Mount_Maya_Kobe.jpg"
  },
  {
    "id": "nara-horyuji-course",
    "no": "G9-11",
    "tag": "観光",
    "kicker": "HORYUJI",
    "title": "斑鳩・法隆寺 半日モデルコース。世界最古の木造伽藍",
    "sub": "飛鳥の塔をつなぐ、斑鳩の里の歩き方",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Horyu-ji10s3200.jpg/1280px-Horyu-ji10s3200.jpg"
  },
  {
    "id": "nara-yoshino-walk",
    "no": "G9-12",
    "tag": "自然",
    "kicker": "YOSHINO",
    "title": "吉野山を歩く。蔵王堂と桜の尾根みち",
    "sub": "下千本から上千本へ、咲きのぼる桜と修験の尾根をたどる一日",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Kinpusenji_Yoshino_Nara02n4272.jpg/1280px-Kinpusenji_Yoshino_Nara02n4272.jpg"
  },
  {
    "id": "aichi-inuyama-castle",
    "no": "G9-13",
    "tag": "観光",
    "kicker": "INUYAMA CASTLE",
    "title": "犬山城・城下町 半日モデルコース。国宝天守と門前町",
    "sub": "名鉄犬山駅から歩いてまわる、木曽川を望む城と門前の半日",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Castle_in_Inuyama.JPG/1280px-Castle_in_Inuyama.JPG"
  },
  {
    "id": "aichi-tokoname-walk",
    "no": "G9-14",
    "tag": "さんぽ",
    "kicker": "TOKONAME",
    "title": "常滑やきもの散歩道を歩く。土管坂と招き猫の路地",
    "sub": "煙突の影が落ちる坂道で、足の裏に土の記憶をたどる",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/%E5%B8%B8%E6%BB%91%EF%BC%88%E5%9C%9F%E7%AE%A1%E5%9D%82%EF%BC%89_-_panoramio.jpg/1280px-%E5%B8%B8%E6%BB%91%EF%BC%88%E5%9C%9F%E7%AE%A1%E5%9D%82%EF%BC%89_-_panoramio.jpg"
  },
  {
    "id": "shizuoka-hamamatsu-hamanako",
    "no": "G9-15",
    "tag": "さんぽ",
    "kicker": "HAMAMATSU",
    "title": "浜松・浜名湖で立ち寄りたい。城と湖と砂丘",
    "sub": "天守の見晴らし、湖上を渡るゴンドラ、夕日が抜ける赤鳥居まで",
    "image": "https://upload.wikimedia.org/wikipedia/commons/0/06/Bentenjima_beach_park.JPG"
  },
  {
    "id": "shizuoka-shuzenji-onsen",
    "no": "G9-16",
    "tag": "温泉",
    "kicker": "SHUZENJI",
    "title": "修善寺温泉。竹林の小径と桂川のいで湯",
    "sub": "温泉街さんぽ｜静岡・伊豆",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Chikurin-no-komichi_20110919.jpg/1280px-Chikurin-no-komichi_20110919.jpg"
  },
  {
    "id": "fukuoka-kokura-castle",
    "no": "G9-17",
    "tag": "観光",
    "kicker": "KOKURA CASTLE",
    "title": "小倉城・城下 半日モデルコース。天守と旦過市場",
    "sub": "紫川の橋を渡り、天守から城下の台所へ",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Kokura_Castle_2024-09-04.jpg/1280px-Kokura_Castle_2024-09-04.jpg"
  },
  {
    "id": "fukuoka-munakata-taisha",
    "no": "G9-18",
    "tag": "さんぽ",
    "kicker": "MUNAKATA",
    "title": "宗像大社を歩く。海の正倉院と神宿る島の総社",
    "sub": "福岡・宗像｜MUNAKATA さんぽ",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Hetsu-gu_of_Munakata-taisha-2.jpg/1280px-Hetsu-gu_of_Munakata-taisha-2.jpg"
  },
  {
    "id": "hokkaido-furano-biei",
    "no": "G9-19",
    "tag": "自然",
    "kicker": "FURANO BIEI",
    "title": "富良野・美瑛。花畑の丘と青い池をめぐる",
    "sub": "FURANO BIEI ─ 花畑と丘の自然ドライブ",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/%E3%83%95%E3%82%A1%E3%83%BC%E3%83%A0%E5%AF%8C%E7%94%B0%EF%BC%88Farm_Tomita%EF%BC%89_-_panoramio_%284%29.jpg/1280px-%E3%83%95%E3%82%A1%E3%83%BC%E3%83%A0%E5%AF%8C%E7%94%B0%EF%BC%88Farm_Tomita%EF%BC%89_-_panoramio_%284%29.jpg"
  },
  {
    "id": "hokkaido-noboribetsu-onsen",
    "no": "G9-20",
    "tag": "温泉",
    "kicker": "NOBORIBETSU",
    "title": "登別温泉。地獄谷と湯けむりの渓",
    "sub": "活火山が吐く蒸気を、足の裏まで連れて歩く",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Noboribetu_Jigokudani%EF%BC%8F%E7%99%BB%E5%88%A5%E5%9C%B0%E7%8D%84%E8%B0%B7%EF%BC%92_-_panoramio.jpg/1280px-Noboribetu_Jigokudani%EF%BC%8F%E7%99%BB%E5%88%A5%E5%9C%B0%E7%8D%84%E8%B0%B7%EF%BC%92_-_panoramio.jpg"
  },
  {
    "id": "hiroshima-tomonoura-walk",
    "no": "G9-21",
    "tag": "さんぽ",
    "kicker": "TOMONOURA",
    "title": "鞆の浦を歩く。常夜燈と対潮楼、潮待ちの港",
    "sub": "TOMONOURA / さんぽ",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Fukuzenji_Fukuyama02s4592.jpg/1280px-Fukuzenji_Fukuyama02s4592.jpg"
  },
  {
    "id": "wakayama-koyasan-course",
    "no": "G9-22",
    "tag": "観光",
    "kicker": "KOYASAN",
    "title": "高野山 半日モデルコース。壇上伽藍から奥之院へ",
    "sub": "朱の塔から二kmの杉木立まで、空海の山を歩いてつなぐ",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Konpon_Daito.jpg/1280px-Konpon_Daito.jpg"
  },
  {
    "id": "shiga-hieizan-enryakuji",
    "no": "G9-23",
    "tag": "さんぽ",
    "kicker": "HIEIZAN",
    "title": "比叡山延暦寺を歩く。根本中堂と杉木立の祈り",
    "sub": "滋賀・大津、ケーブルで登る比叡の祈り",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Enryaku-ji_building.jpg/1280px-Enryaku-ji_building.jpg"
  },
  {
    "id": "gunma-tomioka-silk",
    "no": "G9-24",
    "tag": "観光",
    "kicker": "TOMIOKA SILK",
    "title": "富岡製糸場 半日モデルコース。世界遺産の赤れんが",
    "sub": "明治の器械製糸が残した木骨煉瓦の街を、駅前の杜から下り宮まで歩いてつなぐ",
    "image": "https://upload.wikimedia.org/wikipedia/commons/2/2a/Tomioka_Silk_Mill_East_Cocoon_Warehouse05.jpg"
  }
];

export const NEWGUIDE9_FEATURE_ARTICLES: Record<string, FeatureArticle> = {
  "tokyo-takao-mountain": {
    "id": "tokyo-takao-mountain",
    "no": "G9-01",
    "articleType": "guide",
    "kicker": "TAKAOSAN",
    "title": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
    "titleHTML": "高尾山を歩く。薬王院から山頂へ、<br>都心に一番近い霊山",
    "subtitle": "天狗の山に残る信仰の道を、杉木立と展望をたどってのぼる",
    "lede": "新宿から電車一本、一時間足らずで登山口に立てる山が高尾山だ。標高は599メートルとつつましいが、頂までの道のりには真言宗の大本山・薬王院があり、参道には天狗を祀る信仰の気配が満ち、晴れた冬には富士の白い稜線が正面に立ち上がる。観光地でありながら、参道を一歩入れば線香の匂いと鳥の声が満ちる——この記事では「信仰の山を自分の足でのぼる」一日を主役に据えた。ケーブルカーで中腹まで一気に上がってもいいし、表参道を黙々と歩いてもいい。どちらを選んでも、山門をくぐり、男坂を上り、御本社で手を合わせるという霊山ならではの所作が、ただの散歩を巡礼に近いものへと変えてくれる。料金や運行は折々で見直されるので、出かける前に各施設の公式ページにひととおり目を通しておくと安心だ。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "高尾登山電鉄ケーブルカー",
        "cuisine": "乗り物",
        "area": "東京都八王子市",
        "purpose": "登山口から中腹まで一気に標高を稼ぐ、霊山さんぽの起点",
        "desc": "清滝駅と高尾山駅を約6分で結ぶこのケーブルカーは、最急勾配が31度18分。これは日本のケーブルカー路線のなかで最も急な傾斜にあたり、終点近くでは車内に立つと体が後ろへ引かれるほど斜面が立ち上がる。緑の『あおば』と赤の『もみじ』が両駅から同時に発車してすれ違う仕掛けも、上り下りの楽しみのひとつ。歩いて登れば一時間以上かかる中腹まで数分で運んでくれるので、参道歩きに体力を残したい人の強い味方になる。運賃や始発・終発の時刻は改定されることがあるので、公式サイトで出発前に確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/c/cf/Takao_Mountain_Railroad-2.jpg"
        ],
        "specs": [
          {
            "k": "所要",
            "v": "清滝〜高尾山駅 約6分"
          },
          {
            "k": "勾配",
            "v": "最急31度18分"
          },
          {
            "k": "運行",
            "v": "おおむね15分間隔(繁忙期増発)"
          },
          {
            "k": "料金",
            "v": "公式サイトで最新を確認"
          }
        ],
        "transit": "京王高尾線・高尾山口駅から清滝駅まで徒歩約5分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "高尾山薬王院（有喜寺）",
        "cuisine": "寺院",
        "area": "東京都八王子市",
        "purpose": "山中に伽藍を構える霊山の中心、信仰の道のクライマックス",
        "desc": "正式には高尾山薬王院有喜寺といい、成田山・川崎大師と並ぶ真言宗智山派の大本山のひとつ。天平16年(744年)、聖武天皇の勅令で東国鎮護の祈願寺として開かれたと伝わる。本尊は飯縄大権現で、その眷属とされる天狗の像が境内のあちこちに立つのがこの寺ならではの見どころだ。山門をくぐると参道は二手に分かれ、左の男坂は人の煩悩の数と同じ108段の石段、右の女坂はゆるやかなスロープ。坂を上りきった先の御本社(権現堂)は神仏習合の名残をとどめる権現造で、本殿は享保14年の築、東京都の文化財に指定されている。参拝時間や護摩の予定は変わることがあるため、訪ねる前に寺の公式ページを見ておくとよい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
        ],
        "specs": [
          {
            "k": "宗派",
            "v": "真言宗智山派 大本山"
          },
          {
            "k": "本尊",
            "v": "飯縄大権現"
          },
          {
            "k": "開創",
            "v": "天平16年(744年)伝"
          },
          {
            "k": "男坂",
            "v": "108段の石段"
          }
        ],
        "transit": "ケーブルカー高尾山駅から1号路を徒歩約20分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "高尾山さる園・野草園",
        "cuisine": "動物園・植物園",
        "area": "東京都八王子市",
        "purpose": "参道の入口で、高尾の自然と山に棲む生きものに触れる寄り道",
        "desc": "ケーブルカー高尾山駅のすぐそば、参道に上がってまず出会うのがこの施設だ。さる園では70頭を超えるニホンザルが群れで暮らし、飼育員がボスを頂点とした群れの序列やサルの習性を実況さながらに解説してくれる。動物園のケージ越しではなく、群れ社会そのものを見せる構成が高尾らしい。隣接する野草園には、高尾山に古くから自生してきた野草を中心に約300種の植物が植えられ、亜高山帯や一部高山の草花まで季節ごとに表情を変える。薬王院へ向かう前のひと足、山の生態系への導入としてちょうどいい。入園料や開園時間は施設の公式案内で確かめてから訪ねたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Japanese_Macaque_Monkeys%2C_in_Mt_Takao_Monkey_Park%2C_2024.jpg/1280px-Japanese_Macaque_Monkeys%2C_in_Mt_Takao_Monkey_Park%2C_2024.jpg"
        ],
        "specs": [
          {
            "k": "さる園",
            "v": "ニホンザル70頭超"
          },
          {
            "k": "野草園",
            "v": "約300種の植物"
          },
          {
            "k": "駅から",
            "v": "徒歩約3分"
          },
          {
            "k": "料金・時間",
            "v": "公式案内で確認"
          }
        ],
        "transit": "ケーブルカー高尾山駅から徒歩約3分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "高尾山山頂（大見晴園地）",
        "cuisine": "展望地",
        "area": "東京都八王子市",
        "purpose": "霊山さんぽの到達点、西に富士を望む展望広場",
        "desc": "標高599メートルの頂は開けた広場になっていて、西の縁に立つ展望台からは丹沢の山なみ越しに富士山が姿を見せる。条件のそろう冬至前後には、富士の山頂へ日が沈む『ダイヤモンド富士』が拝めることでも知られる。東を向けば八王子や相模原の市街、さらに筑波山や房総半島まで見渡せ、霊山として歩いてきた道のりが一望のもとに広がる。広場の一角には自然や山の歴史を学べる高尾ビジターセンターがあり、常駐スタッフが季節の見どころを教えてくれる。展望台の天気と富士の見え方は日によって大きく変わるので、晴天を狙うなら気象情報を見てから出かけたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Gazing_at_Mount_Fuji_from_Mount_Takao%2C_Minami-Asakawamachi%2C_Hachi%C5%8Dji%2C_Tokyo%2C_Japan%2C_2024_May.jpg/1280px-Gazing_at_Mount_Fuji_from_Mount_Takao%2C_Minami-Asakawamachi%2C_Hachi%C5%8Dji%2C_Tokyo%2C_Japan%2C_2024_May.jpg"
        ],
        "specs": [
          {
            "k": "標高",
            "v": "599メートル"
          },
          {
            "k": "展望",
            "v": "富士山・丹沢・関東平野"
          },
          {
            "k": "冬の名物",
            "v": "ダイヤモンド富士"
          },
          {
            "k": "施設",
            "v": "高尾ビジターセンター"
          }
        ],
        "transit": "薬王院から1号路をさらに徒歩約20分"
      }
    ],
    "sideArticles": [
      {
        "t": "柴又を歩く。帝釈天の参道と矢切の渡し、寅さんの下町",
        "h": "/feature/tokyo-shibamata-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/0/04/Shibamata_Taishakuten.jpg"
      },
      {
        "t": "国営昭和記念公園で一日。立川の大きな原っぱと花畑",
        "h": "/feature/tokyo-tachikawa-showa",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Showa_Commemorative_National_Government_Park_1.JPG/1280px-Showa_Commemorative_National_Government_Park_1.JPG"
      }
    ],
    "quote": "煩悩の数と同じ百八段を上りきると、杉の香りの奥に朱塗りの御本社が見えてくる。",
    "quoteCite": "マチノワ編集部",
    "closing": "山頂で富士を眺めたら、来た道を引き返すのもいいし、稲荷山コースや薬王院裏の道をたどって下るのもいい。高尾山は登るたびに表情を変える山だ。新緑、紅葉、雪、ダイヤモンド富士——季節を変えて何度でも通えるのが、都心に最も近いこの霊山の懐の深さだろう。なお参拝時間や運行ダイヤは季節で動くため、計画の前に薬王院と高尾登山電鉄のサイトで最新を一度確かめておきたい。"
  },
  "tokyo-shibamata-walk": {
    "id": "tokyo-shibamata-walk",
    "no": "G9-02",
    "articleType": "guide",
    "kicker": "SHIBAMATA",
    "title": "柴又を歩く。帝釈天の参道と矢切の渡し、寅さんの下町",
    "titleHTML": "柴又を歩く。帝釈天の参道と矢切の渡し、<br>寅さんの下町",
    "subtitle": "江戸川の風と、団子を焼く煙のあいだで",
    "lede": "京成柴又の駅を出ると、まず鼻先に届くのは醤油の焦げる甘い匂いだ。改札の正面には鞄を提げた寅さんの銅像が立ち、その視線の先へ向かって石畳の道がまっすぐ伸びている。両側の軒からは草だんごを蒸す湯気と、川魚を炙る煙がゆらりと立ちのぼる。耳をすませば、店先で団子を丸める手の音、観光客の笑い声、そして遠くから江戸川を渡ってくる水のにおいを含んだ風。この街は、歩くより先に匂いと音で迎えてくれる。傘を持つか迷うような薄曇りの午後、参道の入口から、ゆっくり足を踏み入れてみる。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/0/04/Shibamata_Taishakuten.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "帝釈天参道（神明会）",
        "cuisine": "商店街",
        "area": "東京都葛飾区柴又",
        "purpose": "団子と川魚の匂いに包まれて歩く、約200mの石畳の門前町",
        "desc": "駅から二天門までのおよそ200メートル、石畳の両側に和菓子屋や川魚料理の店がびっしりと軒を連ねる。この通りの面白さは、半数以上が店舗兼住宅の昔ながらの造りを今も残していること——奥に暮らしの気配を感じさせる構えのまま商いを続けている点にある。なかでも明治の創業という髙木屋老舗は、映画『男はつらいよ』のロケで休憩や着替えの場所として使われたことで知られ、店先では今も信州産のよもぎをたっぷり練り込んだ深緑の草だんごが丸められている。焼きたての煙とよもぎの香りを浴びながら歩くこと自体が、もう柴又の体験の半分だ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Kawachiya_entrance_shibamata_2009.JPG/1280px-Kawachiya_entrance_shibamata_2009.JPG"
        ],
        "specs": [
          {
            "k": "距離",
            "v": "駅〜二天門 約200m"
          },
          {
            "k": "雰囲気",
            "v": "店舗兼住宅の旧い町並み"
          }
        ],
        "transit": "京成金町線・柴又駅から徒歩すぐ"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "柴又帝釈天（題経寺）",
        "cuisine": "寺院",
        "area": "東京都葛飾区柴又7-10-3",
        "purpose": "彫刻に覆われた帝釈堂と、池泉庭園を巡る門前町の中心",
        "desc": "参道を抜けた先で、彫り物に埋め尽くされた二天門が待っている。日光東照宮の陽明門を手本にしたという透かし彫りの門をくぐると、正面の帝釈堂がさらにすごい。お堂の側面外壁に、法華経の説話を題材にした十枚の大きな木彫りが並び、十人の彫刻師がそれぞれ一面ずつ受け持って彫り上げたという。これらは「彫刻ギャラリー」として、屋根付きの回廊から間近に見上げられる。同じ拝観券で見られる邃渓園は、大客殿の前に広がる池泉式の庭で、彫刻の濃密さとは対照的に静かだ。拝観料や開門時間は変わることがあるため、訪れる前に寺の案内で確かめておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/0/04/Shibamata_Taishakuten.jpg"
        ],
        "specs": [
          {
            "k": "拝観",
            "v": "彫刻ギャラリー・邃渓園 共通 大人400円"
          },
          {
            "k": "見どころ",
            "v": "二天門・帝釈堂の法華経説話彫刻"
          }
        ],
        "transit": "京成柴又駅から徒歩約3分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "山本亭",
        "cuisine": "邸宅・庭園",
        "area": "東京都葛飾区柴又7-19-32",
        "purpose": "大正末期の和洋折衷邸宅で、縁側から庭を眺めて一服する",
        "desc": "帝釈天の喧騒から路地を一本入ると、急に音が遠のく。大正末期に建てられたこの邸宅は、書院造りの座敷に洋風の応接間を組み合わせた和洋折衷で、磨き込まれた廊下のひんやりした感触が裸足に心地よい。圧巻は座敷から眺める書院庭園で、滝と池を配した造りは米国の日本庭園専門誌のランキングで上位に選ばれたこともある。畳に腰を下ろし、抹茶を頼んで縁側越しに庭を眺めていると、ここが下町の真ん中だということを忘れてしまう。入館料も手頃なので、参道歩きの中休みにちょうどいい。料金や開館日は公式の案内で確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Japanese_old_style_house_interior_design_2_%E5%92%8C%E5%AE%A4_%28%E3%82%8F%E3%81%97%E3%81%A4%29_%E3%81%AE%E5%86%85%E8%A3%85_%28%E3%81%AA%E3%81%84%E3%81%9D%E3%81%86%29.jpg/1280px-Japanese_old_style_house_interior_design_2_%E5%92%8C%E5%AE%A4_%28%E3%82%8F%E3%81%97%E3%81%A4%29_%E3%81%AE%E5%86%85%E8%A3%85_%28%E3%81%AA%E3%81%84%E3%81%9D%E3%81%86%29.jpg"
        ],
        "specs": [
          {
            "k": "入館",
            "v": "100円"
          },
          {
            "k": "建築",
            "v": "大正末期・和洋折衷"
          },
          {
            "k": "休館",
            "v": "第3火曜ほか"
          }
        ],
        "transit": "柴又帝釈天から徒歩約3分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "矢切の渡し",
        "cuisine": "渡し船",
        "area": "東京都葛飾区柴又・江戸川",
        "purpose": "都内に唯一残る渡し舟で、櫓の音とともに対岸の千葉へ",
        "desc": "山本亭の裏手から土手に上がると、視界がいっぱいに開けて江戸川が流れている。河川敷の野球場の脇に船着場があり、ここから出る矢切の渡しは、今では都内に残る唯一の渡し舟だ。葛飾と対岸の松戸を結ぶこの渡しは江戸時代から続いていて、船頭が櫓を漕ぐと水を切る音だけが響き、参道のにぎわいが嘘のように静まり返る。片道わずか数分の船旅だが、川面すれすれの目線から見上げる空と土手の眺めは、橋を渡るのとはまるで違う。3月中旬から11月末はほぼ毎日、冬場は土日祝などに限って動くので、運航日と時間は事前に確かめておくと取りこぼしがない。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Yagiri_no_watashi_2020-01-19.jpg/1280px-Yagiri_no_watashi_2020-01-19.jpg"
        ],
        "specs": [
          {
            "k": "運賃",
            "v": "大人片道200円"
          },
          {
            "k": "運航",
            "v": "3月中旬〜11月末は毎日／冬季は土日祝ほか"
          }
        ],
        "transit": "柴又帝釈天から徒歩約10分（江戸川河川敷）"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "葛飾柴又寅さん記念館・山田洋次ミュージアム",
        "cuisine": "資料館",
        "area": "東京都葛飾区柴又6-22-19",
        "purpose": "映画『男はつらいよ』の舞台裏と、撮影に使われた茶の間を歩く",
        "desc": "川辺を少し下ったところに、この街を全国に知らしめた映画の記念館がある。見どころは、『男はつらいよ』の団子屋「くるまや」の茶の間や帝釈天参道のセットが、実際の撮影に使われたものを移築・再現して並んでいること。柱の傷や畳の擦れまでがそのままで、スクリーンの向こうにあった世界に上がり込むような感覚になる。隣接する山田洋次ミュージアムでは、監督が手がけた数々の作品を映像と資料でたどれる。映画を観たことがなくても、昭和の下町の暮らしぶりを覗く資料館として楽しめる。入館料や休館日は変更されることがあるので、来館前に公式の案内で確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Inside_the_Tora-san_museum_Jan_6_2022_various_17_44_11_040000.jpeg/1280px-Inside_the_Tora-san_museum_Jan_6_2022_various_17_44_11_040000.jpeg"
        ],
        "specs": [
          {
            "k": "入館",
            "v": "一般500円"
          },
          {
            "k": "見どころ",
            "v": "撮影使用の「くるまや」セット"
          }
        ],
        "transit": "矢切の渡しから江戸川沿いに徒歩約5分"
      }
    ],
    "sideArticles": [
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      },
      {
        "t": "国営昭和記念公園で一日。立川の大きな原っぱと花畑",
        "h": "/feature/tokyo-tachikawa-showa",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Showa_Commemorative_National_Government_Park_1.JPG/1280px-Showa_Commemorative_National_Government_Park_1.JPG"
      }
    ],
    "quote": "団子を焼く煙が途切れた向こうに、いつも川がある。柴又は、参道の賑わいと水辺の静けさが背中合わせに同居する町だ。",
    "quoteCite": "マチノワ編集部",
    "closing": "渡し場から参道へ戻る頃には、日が傾いて石畳が飴色に光っていた。土産の草だんごを提げ、帝釈天の屋根を背に駅へ歩くと、来たときに嗅いだ醤油の匂いがまだ漂っている。寺の彫刻、大正の畳座敷、川を渡る木の舟、そして映画のなかの茶の間——柴又はそれぞれが別々の時代から顔を出しながら、ひとつの下町に溶け合っている。歩き終えてみると、賑やかなはずの参道がどこか懐かしく、静かだったはずの川辺がやけに饒舌に思い出される。なお、各施設の拝観料や渡し舟の運航日は季節で変わるので、出かける前にそれぞれの公式情報で当日の状況を確かめておくと安心だ。また日を改めて、今度は団子を食べ歩きながら、ゆっくり来たいと思う。"
  },
  "tokyo-tachikawa-showa": {
    "id": "tokyo-tachikawa-showa",
    "no": "G9-03",
    "articleType": "guide",
    "kicker": "SHOWA PARK",
    "title": "国営昭和記念公園で一日。立川の大きな原っぱと花畑",
    "titleHTML": "国営昭和記念公園で一日。<br>立川の大きな原っぱと花畑",
    "subtitle": "東京・立川｜広い芝生と季節の花で、子どもと丸一日",
    "lede": "東京ドーム約39個分という園内は、半日では到底回りきれない。けれど「全部見よう」と気負う公園ではない。芝生に寝転んでお弁当を広げ、子どもが原っぱを駆け、花畑のあいだをのんびり歩く——昭和記念公園の正しい遊び方は、むしろ予定を詰め込まないことにある。広いからこそ、行く先を二つか三つに絞って、あいだの移動そのものを散歩として楽しみたい。レンタサイクルやパークトレインを足にすれば、小さな子連れでも奥のエリアまで無理なく届く。春のチューリップから秋のコスモスまで、訪れる季節で表情がまるごと入れ替わるのも、一日を過ごす場所としての底力だ。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Showa_Commemorative_National_Government_Park_1.JPG/1280px-Showa_Commemorative_National_Government_Park_1.JPG",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "多摩都市モノレール 立川北駅",
        "cuisine": "アクセス",
        "area": "東京都立川市",
        "purpose": "車を使わず公園の玄関口まで",
        "desc": "立川は中央線とモノレールが交差する多摩のターミナルで、立川北駅はJR立川駅北口と歩行者デッキでつながっている。地上に降りずデッキを進めば、そのまま公園のあけぼの口方面へ歩いて出られるのが子連れには大きい。多摩都市モノレールは高架を走るため車窓からの見晴らしがよく、移動そのものが小さな子の「乗り物アトラクション」になる。立川北・立川南の二駅は約400mしか離れておらず運賃計算上は同一駅扱いだが、公園へはJR北口に近い立川北側から向かうのがわかりやすい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Tachikawa-Kita_Station_20100919.jpg/1280px-Tachikawa-Kita_Station_20100919.jpg"
        ],
        "specs": [
          {
            "k": "路線",
            "v": "多摩都市モノレール（立川北駅）"
          },
          {
            "k": "公園まで",
            "v": "あけぼの口へ徒歩約7〜8分"
          },
          {
            "k": "運賃",
            "v": "区間制（最新は多摩モノレール公式で確認）"
          }
        ],
        "transit": "JR立川駅と高架デッキで直結／公園あけぼの口まで徒歩約7〜8分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "みんなの原っぱ",
        "cuisine": "芝生広場",
        "area": "東京都立川市",
        "purpose": "一日の拠点になる大きな芝生",
        "desc": "南北約400m・東西約300m、約11ヘクタールという園内中央の芝生広場で、ここが一日の母港になる。レジャーシートを広げてお弁当を食べ、ボール遊びをし、また寝転ぶ——この往復だけで午後が溶けていく。広場の真ん中に枝を広げる高さ20mを超える大ケヤキは、遠くからでもよく目立つ目印で、「あの木のあたり」と言えば家族のあいだで場所が通じる。なお大ケヤキは樹勢回復のため周囲が立ち入り制限となる時期があるので、近づく前に現地の案内を確認したい。原っぱの西側は季節になると花畑に姿を変え、秋にはコスモスが一面を染める。とにかく広いので、子どもが走り出しても視界から消えにくいのが親には安心材料だ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Showa_Commemorative_National_Government_Park_1.JPG/1280px-Showa_Commemorative_National_Government_Park_1.JPG"
        ],
        "specs": [
          {
            "k": "広さ",
            "v": "約11ha（南北約400m×東西約300m）"
          },
          {
            "k": "目印",
            "v": "中央の大ケヤキ（高さ20m超）"
          },
          {
            "k": "向く過ごし方",
            "v": "ピクニック・芝生遊び"
          }
        ],
        "transit": "西立川口・立川口から園内を奥へ／パークトレイン利用も可"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "こどもの森",
        "cuisine": "遊び場",
        "area": "東京都立川市",
        "purpose": "大型遊具で体を動かす時間",
        "desc": "公園の奥、森のゾーンに広がる子ども向けの遊び場の一角。白いドーム状の「雲の海（ふわふわドーム）」は飛び跳ねると全身が弾むトランポリンのような遊具で中学生以下専用、寝そべっても跳ねても自由な大きなネット遊具「虹のハンモック」は小学生以下専用と、年齢で遊び場が分かれているのが特徴だ。ほかに森のとりで、地底の泉、月の丘などが点在し、起伏のある地形そのものが遊具になっている。原っぱからは距離があるので、ここを目指すなら行きか帰りにレンタサイクルやパークトレインを使うと、子どもの足でも体力を残して遊べる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/%E3%81%93%E3%81%A9%E3%82%82%E3%81%AE%E6%A3%AE%E3%80%8C%E9%9B%B2%E3%81%AE%E6%B5%B7%E3%80%8D.jpg/1280px-%E3%81%93%E3%81%A9%E3%82%82%E3%81%AE%E6%A3%AE%E3%80%8C%E9%9B%B2%E3%81%AE%E6%B5%B7%E3%80%8D.jpg"
        ],
        "specs": [
          {
            "k": "主な遊具",
            "v": "雲の海（ふわふわドーム）・虹のハンモック"
          },
          {
            "k": "対象",
            "v": "遊具ごとに年齢区分あり（中学生以下／小学生以下）"
          },
          {
            "k": "場所",
            "v": "園内奥の森のゾーン"
          }
        ],
        "transit": "園内奥の森のゾーン／レンタサイクルやパークトレインが便利"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "渓流広場",
        "cuisine": "花畑・水辺",
        "area": "東京都立川市",
        "purpose": "季節の花と浅い流れを楽しむ",
        "desc": "ゆるやかな流れに沿って約700mにわたって花壇が続く、園内でも花の密度が高い一帯。春はオランダのキューケンホフ公園に倣ってデザインされたという200種以上・約25万球のチューリップが帯のように咲き、ムスカリの青がそのあいだを縫う。流れは浅く、夏には足を浸して涼む子どもの姿も見られる。花の種類と見頃は年や季節で入れ替わるため、いつ何が咲いているかは公園の花だより（公式サイト）で事前に確かめておくと、訪問日を選びやすい。原っぱでの昼食のあと、消化がてら花を見ながら歩く流れがちょうどいい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/%E6%B8%93%E6%B5%81%E5%BA%83%E5%A0%B4_%E3%83%81%E3%83%A5%E3%83%BC%E3%83%AA%E3%83%83%E3%83%97%E3%81%AE%E6%A4%8D%E6%A0%BD.jpg/1280px-%E6%B8%93%E6%B5%81%E5%BA%83%E5%A0%B4_%E3%83%81%E3%83%A5%E3%83%BC%E3%83%AA%E3%83%83%E3%83%97%E3%81%AE%E6%A4%8D%E6%A0%BD.jpg"
        ],
        "specs": [
          {
            "k": "見どころ",
            "v": "約700mのチューリップ（春）／浅い渓流"
          },
          {
            "k": "規模",
            "v": "200種以上・約25万球（チューリップ・年により変動）"
          },
          {
            "k": "確認",
            "v": "花の見頃は公式の花だよりで"
          }
        ],
        "transit": "みんなの原っぱの西側／園内を歩いて移動"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "日本庭園",
        "cuisine": "庭園",
        "area": "東京都立川市",
        "purpose": "一日の締めに静けさを足す",
        "desc": "走り回る原っぱや遊具とは空気が一変する、池を中心に園路をめぐる池泉回遊式の庭園。戦後の東京につくられた日本庭園としては大きな規模で、池に張り出すように建てられた休憩舎「清池軒」は、対岸から見ると水面に浮かんでいるように映る。大きく開いた窓辺に腰かければ、子どもを膝にのせて池を眺めるだけの時間が持てる。園内には盆栽を集めた盆栽苑も併設され、小さな鉢の中に景色を見立てる文化にふれられる。一日遊んで疲れた家族が、帰り際に靴を脱いで一息つく場所として向いている。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Japanese_Garden_%40_Showa_Kinen_Park_%40_Tachikawa_%2810605890575%29.jpg/1280px-Japanese_Garden_%40_Showa_Kinen_Park_%40_Tachikawa_%2810605890575%29.jpg"
        ],
        "specs": [
          {
            "k": "様式",
            "v": "池泉回遊式庭園"
          },
          {
            "k": "見どころ",
            "v": "池に張り出す清池軒・盆栽苑"
          },
          {
            "k": "雰囲気",
            "v": "園内でも静かな落ち着いたエリア"
          }
        ],
        "transit": "園内南東部／砂川口寄り"
      }
    ],
    "sideArticles": [
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      },
      {
        "t": "柴又を歩く。帝釈天の参道と矢切の渡し、寅さんの下町",
        "h": "/feature/tokyo-shibamata-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/0/04/Shibamata_Taishakuten.jpg"
      }
    ],
    "quote": "広さを攻略する公園ではなく、広さに身をあずける公園。",
    "quoteCite": "マチノワ編集部",
    "closing": "園内は無料区域と有料区域に分かれ、中学生以下は入園無料。小さな子を連れた家族にはありがたい設計だ。入園料や開園時間、花の見頃やパークトレインの運行は季節と年によって変わるので、出かける前に公園の公式サイトで最新の状況を一度のぞいておくと、当日の段取りがぐっと楽になる。なお昭島側の旧プール一帯は再整備が進行中で姿を変えつつある。広い公園を一日で攻略しようとせず、原っぱと花畑を軸に、子どもの足取りに合わせて流れていく——それくらいの心づもりが、この場所にはちょうどいい。"
  },
  "tokyo-fukagawa-walk": {
    "id": "tokyo-fukagawa-walk",
    "no": "G9-04",
    "articleType": "guide",
    "kicker": "FUKAGAWA",
    "title": "門前仲町・深川を歩く。八幡さまと庭園、水辺の下町",
    "titleHTML": "門前仲町・深川を歩く。<br>八幡さまと庭園、水辺の下町",
    "subtitle": "FUKAGAWA ── 線香の匂いと水の匂いがまじる、江東の路地をたどって",
    "lede": "朝の清澄白河で地下鉄を降りると、まだ通りはひんやりしている。コーヒーを焙煎する香ばしい匂いが角のどこかから漂い、運河に渡した橋の上で立ち止まると、油を流したような黒い水面に雲が映って揺れていた。深川と呼ばれるこの一帯は、もともと埋め立てと掘割でできた土地で、歩いているとそこかしこに水の気配がついてまわる。これから、庭園の池からはじめて、緑の橋を渡り、線香の煙のたつ門前町まで、水と路地をたどって南へ下ってみる。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Tomioka_Hachiman-gu_2008_August.jpg/1280px-Tomioka_Hachiman-gu_2008_August.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "清澄庭園",
        "cuisine": "庭園",
        "area": "東京都江東区清澄",
        "purpose": "池をめぐって一日のはじまりを静かに整える",
        "desc": "まず門をくぐったのは、回遊式林泉庭園の清澄庭園だった。明治の実業家・岩崎弥太郎が深川の地に造った庭で、池のまわりにはわざわざ全国から取り寄せた名石が点々と据えられている。水ぎわに飛び石が打たれていて、池に張り出すように歩けるのがこの庭ならではで、足もとの石を選びながら進むと、鯉が寄ってきて水面に輪をつくる。開園は朝9時から。入園料は一般150円ほどと気軽だが、料金や時間は変わることがあるので公式の案内で確かめておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Kiyosumi-1.JPG/1280px-Kiyosumi-1.JPG"
        ],
        "specs": [
          {
            "k": "開園",
            "v": "9:00〜17:00（入園は16:30まで）"
          },
          {
            "k": "入園料",
            "v": "一般150円ほど（最新は公式で確認）"
          }
        ],
        "transit": "都営大江戸線・東京メトロ半蔵門線「清澄白河」駅A3出口から徒歩約3分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "木場公園",
        "cuisine": "公園",
        "area": "東京都江東区木場・平野・三好・東陽",
        "purpose": "運河をまたぐ大橋を渡り、空の広い場所でひと息つく",
        "desc": "庭園を出て仙台堀川沿いに東へ歩くと、急に視界が開けて木場公園に出る。ここはかつて貯木場として材木が浮かべられていた土地で、その名残が「木場」という地名に残っている。公園は運河で南・中・北の三つに分かれ、それをつなぐのが弓なりに反った木場公園大橋だ。橋の上まで登ると風が通り、晴れた日には橋の架構の向こうに東京スカイツリーが立っているのが見える。園内の都市緑化植物園はおおむね無料で入れるが、開園時間は事前に確認しておくとよい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/%E6%9C%A8%E5%A0%B4%E5%85%AC%E5%9C%92_-_panoramio.jpg/1280px-%E6%9C%A8%E5%A0%B4%E5%85%AC%E5%9C%92_-_panoramio.jpg"
        ],
        "specs": [
          {
            "k": "開園",
            "v": "常時開園（園内施設は時間あり）"
          },
          {
            "k": "入園料",
            "v": "無料（一部有料施設あり）"
          }
        ],
        "transit": "東京メトロ東西線「木場」駅から徒歩約5分／「清澄白河」駅から徒歩約15分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "深川不動堂",
        "cuisine": "寺院",
        "area": "東京都江東区富岡",
        "purpose": "梵字の本堂と護摩の太鼓に、街の音が一段変わる",
        "desc": "公園から南へ下り、永代通りに合流して門前仲町の参道に入ると、ひときわ目を引く黒い壁が現れる。深川不動堂の本堂で、外壁いっぱいに梵字が連ねて貼り巡らされ、近づくと文字の海に取り囲まれるようだ。成田山新勝寺の東京別院で、江戸の昔から「深川のお不動様」と呼ばれてきた。一日に数回、太鼓と読経の響く護摩祈祷が厳修され、堂の奥から地鳴りのような音がもれてくると、参道の喧騒がふっと遠のく。参拝そのものは無料だが、護摩の時間帯は公式の案内で確かめてから訪ねたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Fukagawa_Fudoson_Chozuya_-_Tokyo%2C_Japan.jpg/1280px-Fukagawa_Fudoson_Chozuya_-_Tokyo%2C_Japan.jpg"
        ],
        "specs": [
          {
            "k": "護摩",
            "v": "1日数回厳修（時間は公式で確認）"
          },
          {
            "k": "参拝",
            "v": "無料"
          }
        ],
        "transit": "東京メトロ東西線「門前仲町」駅1番出口から徒歩約2分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "富岡八幡宮",
        "cuisine": "神社",
        "area": "東京都江東区富岡",
        "purpose": "深川の総鎮守で、八幡さまの石畳に立つ",
        "desc": "不動堂のすぐ隣、参道を抜けた先が富岡八幡宮だ。1627年の創建と伝わる深川の総鎮守で、夏には江戸三大祭のひとつ「深川八幡祭り」の氏子神輿がこの境内から繰り出していく。本殿の脇には大関力士の名を刻んだ横綱力士碑が立ち、江戸の勧進相撲がここを発祥としたことを今に伝えている。境内の奥には金色の装飾をまとった大神輿が納められた建物もあって、覗き込むと薄暗がりのなかで金具が鈍く光っていた。祭礼の日程などは年によって動くので、訪問前に公式で確かめておくと予定が立てやすい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Tomioka_Hachiman-gu_2008_August.jpg/1280px-Tomioka_Hachiman-gu_2008_August.jpg"
        ],
        "specs": [
          {
            "k": "参拝",
            "v": "境内自由"
          },
          {
            "k": "例祭",
            "v": "8月の深川八幡祭り（日程は公式で確認）"
          }
        ],
        "transit": "東京メトロ東西線「門前仲町」駅1番出口から徒歩約3分／都営大江戸線「門前仲町」駅から徒歩約6分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "門前仲町（仲町通り・辰巳新道）",
        "cuisine": "門前町・商店街",
        "area": "東京都江東区門前仲町",
        "purpose": "歩き終わりに、門前町の路地で深川の味と灯りに浸る",
        "desc": "最後は門前仲町の駅へ向かいながら、永代通り沿いの仲町通り商店街をひやかして歩く。旧永代寺の門前町として江戸期からにぎわってきた一帯で、毎月1日・15日・28日の縁日には参道に露店が並ぶ。通りからわずかに脇へ入ると辰巳新道があり、煉瓦敷きの細い路地に小さな店が肩を寄せ合っている。日が傾くと提灯に灯が入り、貝の出汁を炊いた深川めしの湯気と、炭火の匂いが路地にこもって、歩いてきた一日のしめくくりにちょうどいい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Toei_Monzen-nakacho-STA_Gate.jpg/1280px-Toei_Monzen-nakacho-STA_Gate.jpg"
        ],
        "specs": [
          {
            "k": "縁日",
            "v": "毎月1日・15日・28日ごろ"
          },
          {
            "k": "名物",
            "v": "深川めし（あさりの炊き込み・ぶっかけ）"
          }
        ],
        "transit": "東京メトロ東西線・都営大江戸線「門前仲町」駅すぐ"
      }
    ],
    "sideArticles": [
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      },
      {
        "t": "柴又を歩く。帝釈天の参道と矢切の渡し、寅さんの下町",
        "h": "/feature/tokyo-shibamata-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/0/04/Shibamata_Taishakuten.jpg"
      }
    ],
    "quote": "石を踏む音、池に跳ねる鯉の音、護摩を焚く太鼓の音。深川の一日は、耳でも歩ける。",
    "quoteCite": "マチノワ編集部",
    "closing": "門前仲町の駅前まで戻ると、夕方の永代通りはもう人が増えていた。仲町通りの提灯にぽつぽつ灯がともりはじめ、辰巳新道のほうから出汁と炭の匂いが流れてくる。朝に運河で見た黒い水面のことを思い出しながら、今日たどってきた道を頭のなかで巻き戻す。池の石、緑の大橋、八幡さまの石畳、線香の煙。距離にすればたいしたことのない道のりなのに、ずいぶん遠くまで来たような気がするのは、たぶんこの街が水と路地で時間を折りたたんでいるからだ。なお拝観時間や入園料はときどき変わるので、出かける前に各施設の公式の案内をのぞいておくと安心して歩ける。下町は、急がない人にやさしい。"
  },
  "osaka-minoo-falls": {
    "id": "osaka-minoo-falls",
    "no": "G9-05",
    "articleType": "guide",
    "kicker": "MINOO FALLS",
    "title": "箕面大滝へ。紅葉の渓谷をたどる滝みち",
    "titleHTML": "箕面大滝へ。<br>紅葉の渓谷をたどる滝みち",
    "subtitle": "大阪・箕面 / 滝と紅葉の渓谷さんぽ",
    "lede": "梅田から電車で三十分ほど、改札を出るとすぐに山の匂いがする。箕面の楽しみは、目的地の滝そのものよりも、そこへ至る道のほうにある。阪急箕面駅から大滝までは、箕面川のせせらぎに寄り添う約2.8キロのほぼ一本道。舗装され、ゆるやかに高度を上げていくこの「滝道」を、紅葉が天井のように覆う。色づいたカエデやモミジが川面に映り、岩を巻いて落ちる水音と混ざり合う。古刹で水の神に手を合わせ、虫たちの世界をのぞき、揚げたてのもみじの天ぷらを片手に、最後にあの一筋の滝へ。立ち止まっては歩き出すその繰り返し自体が、ここでは目的になる。歩いた距離のぶんだけ、ごほうびが大きくなる道だ。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Minoh_Falls_Minoh_Osaka_pref_Japan08s3.jpg/1280px-Minoh_Falls_Minoh_Osaka_pref_Japan08s3.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "阪急箕面駅と滝道の入口",
        "cuisine": "出発点",
        "area": "大阪府箕面市",
        "purpose": "滝みちのスタート地点。ここで装備と補給を整える",
        "desc": "箕面線の終着である箕面駅は、改札を出て左へ進むとすぐ土産物店や茶店が連なる通りにつながり、そのままが渓谷へ続く滝道の入口になっている。山あいの駅でありながら梅田から乗り換え一回で着いてしまう近さが、この街の独特な立ち位置を物語る。駅前で揚げたてのもみじの天ぷらや弁当を仕込み、ここから川沿いを歩き始めるのが箕面の流儀だ。滝までは舗装路の上り基調なので、底のしっかりした靴で出発したい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/c/c4/Minoo_Station_%28Osaka%29.jpg"
        ],
        "specs": [
          {
            "k": "最寄り",
            "v": "阪急箕面駅(終点)"
          },
          {
            "k": "滝までの距離",
            "v": "約2.8km・徒歩40分前後"
          },
          {
            "k": "入口まで",
            "v": "駅から徒歩約5分"
          }
        ],
        "transit": "阪急箕面線・箕面駅すぐ。終点駅で迷わない"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "瀧安寺",
        "cuisine": "古刹",
        "area": "大阪府箕面市",
        "purpose": "滝道の途中に境内が開ける、水の神を祀る修験の寺",
        "desc": "箕面川の両岸にまたがって境内が広がる瀧安寺は、役行者(役小角)が箕面滝で修行した折に創建したと伝わる本山修験宗の古刹で、ここに祀られる弁財天は日本でも最も古い弁財天のひとつとされる。水の神である弁財天が、豊かな水を落とす大滝を背景に祀られている点が、この渓谷の信仰の核を成している。江戸期に行われた富くじ「箕面富」が宝くじの源流のひとつとされるのも、芸能と財運の神を祀るこの寺ならではの来歴だ。朱塗りの観音堂や瑞雲橋が紅葉に映え、滝道歩きの自然な休憩点になる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Ryuuanji_Kannondou.JPG/1280px-Ryuuanji_Kannondou.JPG"
        ],
        "specs": [
          {
            "k": "宗派",
            "v": "本山修験宗"
          },
          {
            "k": "見どころ",
            "v": "日本最古級の弁財天・瑞雲橋"
          },
          {
            "k": "受付",
            "v": "寺務所10:00〜16:00目安(公式で確認を)"
          }
        ],
        "transit": "阪急箕面駅から滝道を徒歩約10分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "箕面公園昆虫館",
        "cuisine": "博物館",
        "area": "大阪府箕面市",
        "purpose": "渓谷歩きの寄り道に。年中チョウが舞う放蝶園が名物",
        "desc": "滝道の中ほどに建つ箕面公園昆虫館は、ドーム型の放蝶園で一年を通して生きたチョウが舞い、渓谷の生態系を体感できる施設だ。箕面山一帯は古くから昆虫採集のフィールドとして知られ、その自然をそのまま展示に取り込んでいる点が、ただの屋内施設と違うところ。歩き疲れた足を休めつつ、外を歩くだけでは出会えない渓谷の小さな住人たちを間近で観察できる。子ども連れの寄り道先として、滝までの道のりに変化をつけてくれる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Minoh-kontyukan.jpg/1280px-Minoh-kontyukan.jpg"
        ],
        "specs": [
          {
            "k": "入館料",
            "v": "大人280円/中学生以下無料"
          },
          {
            "k": "開館",
            "v": "10:00〜17:00(入館16:30まで)"
          },
          {
            "k": "休館",
            "v": "火曜(祝日は開館)・最新は公式で"
          }
        ],
        "transit": "滝道沿い、瀧安寺と大滝の間"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "箕面大滝",
        "cuisine": "滝",
        "area": "大阪府箕面市",
        "purpose": "滝みちの終着点。落差約33mの一筋を仰ぐ",
        "desc": "滝道の突き当たりで待っているのが、落差およそ33メートルの箕面大滝だ。日本の滝百選にも数えられるこの滝は、岩肌を一気に滑り落ちる白い一筋と、それを縁取るように色づく渓谷の紅葉が同じ視界に収まることで知られる。滝の形が農具の箕(み)を振るう姿に似ていることが「箕面」という地名の由来とされ、滝そのものが街の名の起こりになっている点が他にない。滝壺前は広場になっており、歩き通したあとにここで仰ぎ見る一本の水流は、距離のぶんだけ印象に残る。最盛期は十一月後半から十二月初めにかけて、滝と紅葉が最も濃く重なる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Minoh_Falls_Minoh_Osaka_pref_Japan08s3.jpg/1280px-Minoh_Falls_Minoh_Osaka_pref_Japan08s3.jpg"
        ],
        "specs": [
          {
            "k": "落差",
            "v": "約33m"
          },
          {
            "k": "格付け",
            "v": "日本の滝百選"
          },
          {
            "k": "紅葉の盛り",
            "v": "11月後半〜12月初旬目安"
          }
        ],
        "transit": "阪急箕面駅から滝道を徒歩約40分"
      }
    ],
    "sideArticles": [
      {
        "t": "四天王寺を歩く。日本仏法最初の官寺と門前の坂",
        "h": "/feature/osaka-shitennoji-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Shitenno-ji_Temple_%40_Osaka_%2813382942704%29.jpg/1280px-Shitenno-ji_Temple_%40_Osaka_%2813382942704%29.jpg"
      },
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      }
    ],
    "quote": "水音をたどって歩けば、色は深くなる。",
    "quoteCite": "マチノワ編集部",
    "closing": "滝までたどり着いたら、来た道をそのまま戻るのが基本になる。下りは同じ渓谷でも光の角度が変わり、行きとは違う紅葉が目に入るはずだ。途中の茶店でもみじの天ぷらを買い足し、川のほとりのベンチでひと息つくのもいい。日が傾くと渓谷は急に冷えるので、薄手でも羽織るものを一枚持っておくと安心だ。なお紅葉の最盛期、とりわけ十一月後半の週末は滝道が大変混み合う。昆虫館の休館日や各施設の受付時間、当日の天候による通行規制などは、訪ねる前にそれぞれの公式情報で見ておくと歩きやすい。マチノワ編集部としては、午前の早い時間に駅を出て、人波の前を歩くことをおすすめしたい。"
  },
  "osaka-shitennoji-walk": {
    "id": "osaka-shitennoji-walk",
    "no": "G9-06",
    "articleType": "guide",
    "kicker": "SHITENNOJI",
    "title": "四天王寺を歩く。日本仏法最初の官寺と門前の坂",
    "titleHTML": "四天王寺を歩く。<br>日本仏法最初の官寺と門前の坂",
    "subtitle": "大阪・天王寺、伽藍と坂と祈りのあいだを",
    "lede": "谷町筋のざわめきがふっと遠のく一角がある。石の鳥居をくぐると、車の音が背中に置き去りになって、かわりに鳩の羽音と、どこかで撞かれる鐘の余韻が耳に入ってくる。朱の五重塔が、薄曇りの空を背にまっすぐ立っている。天王寺という街は、上町台地の縁にのって少しずつ傾いていて、だから歩いていると足の裏でその坂をいつも感じる。ここはビル街の真ん中なのに、足元だけが古い時間を残している。きょうはその傾きにそって、伽藍から門前の坂へ、ゆっくり下りていくことにする。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Shitenno-ji_Temple_%40_Osaka_%2813382942704%29.jpg/1280px-Shitenno-ji_Temple_%40_Osaka_%2813382942704%29.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "四天王寺",
        "cuisine": "寺院",
        "area": "大阪市天王寺区",
        "purpose": "中門・五重塔・金堂・講堂が南北一直線に並ぶ伽藍をくぐり、日本仏法最初の官寺の骨格を体で確かめる",
        "desc": "西側の石鳥居をくぐると、まず空気の密度が変わる。聖徳太子の創建と伝わるこの寺は、いまは天台宗から独立した和宗の総本山で、境内の外を歩くだけなら門は終日ひらいている。歩を進めて中心伽藍に入ると、中門・五重塔・金堂・講堂がまっすぐ南北に並ぶ「四天王寺式」の配置が一望できる。寺社の伽藍は時代とともに増改築で複雑になりがちだが、ここはあえて最古級のこの直線形を守りつづけてきた——だから境内に立つと、図面の上を歩いているような不思議な見通しのよさがある。塔は戦火や落雷で幾度も焼け、そのたびに同じ姿で建て直されてきた。今の朱塗りもまた、その長い再建の連なりの先端にある。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Shitenno-ji_Temple_%40_Osaka_%2813382942704%29.jpg/1280px-Shitenno-ji_Temple_%40_Osaka_%2813382942704%29.jpg"
        ],
        "specs": [
          {
            "k": "中心伽藍",
            "v": "入堂は有料(最新は公式の案内で確認)"
          },
          {
            "k": "境内の外周",
            "v": "終日参拝可"
          }
        ],
        "transit": "大阪メトロ谷町線・四天王寺前夕陽ヶ丘駅から南へ徒歩約5分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "四天王寺 亀の池と石舞台",
        "cuisine": "境内・文化財",
        "area": "大阪市天王寺区",
        "purpose": "伽藍の直線から少し離れ、水辺と舞台の周りに流れるゆるい時間に身を置く",
        "desc": "金堂の整然とした緊張から北へ抜けると、急にやわらかい場所に出る。六時礼讃堂の前にひろがる亀の池には、名のとおり無数の亀が甲羅を干していて、堂を拝みにきた人が手すりにもたれて飽かず眺めている。池の中央に架かる石橋の上にあるのが石舞台で、屋根のない四角い石の壇がただ水面に浮かんでいる。普段はがらんとして見えるこの舞台が、聖徳太子の命日にあたる四月二十二日には雅楽の奏でられる晴れの場に変わる——年に一度のその日のために、残りの三百六十四日が静かに用意されている、と思うと見え方が変わる。池のへりは伽藍観光の動線からわずかに外れていて、その分だけ腰を下ろしやすい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Drum_Tower_and_Terrapin_Pond_of_Shitennoji_Temple.JPG/1280px-Drum_Tower_and_Terrapin_Pond_of_Shitennoji_Temple.JPG"
        ],
        "specs": [
          {
            "k": "場所",
            "v": "六時礼讃堂前(境内北側)"
          },
          {
            "k": "雅楽の奉納",
            "v": "聖徳太子の命日まわり"
          }
        ],
        "transit": "中心伽藍の北、六時礼讃堂の前(同一境内)"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "一心寺",
        "cuisine": "寺院",
        "area": "大阪市天王寺区逢阪",
        "purpose": "門前の坂をくだり、遺骨から仏像を造る独特の供養のかたちに触れる",
        "desc": "伽藍の西門を出て坂をくだっていくと、逢坂という名の急な下りに沿って一心寺の現代的な仁王門が見えてくる。ここで知られるのは「お骨佛」という供養のかたちだ。納められた多くの遺骨を粉にし、漆と練り合わせて十年ごとにひと体の阿弥陀仏に造立する——つまり堂内に祀られた仏像そのものが、無数の人の名残でできている。宗派を問わず誰でも納められるこの仕組みのために、線香の煙の絶えない日でも参拝者が静かに列をつくる。坂の途中という立地も効いていて、谷町筋の賑わいから一歩下りた窪みに、街の弔いの感情がそっと溜まっているように感じられる。手を合わせる人の背中が、どれもよく似て見えるのが印象に残った。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Isshinji_%28Osaka_Tennoji-ku%29_hdsr_Temple_S5_39.jpg/1280px-Isshinji_%28Osaka_Tennoji-ku%29_hdsr_Temple_S5_39.jpg"
        ],
        "specs": [
          {
            "k": "特徴",
            "v": "遺骨を仏像に造立する「お骨佛」"
          },
          {
            "k": "納骨",
            "v": "宗派不問"
          }
        ],
        "transit": "四天王寺の南西、逢坂を下って徒歩数分。大阪メトロ谷町線・四天王寺前夕陽ヶ丘駅から徒歩約12分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "安居神社",
        "cuisine": "神社",
        "area": "大阪市天王寺区逢阪",
        "purpose": "大坂夏の陣で散った真田信繁(幸村)終焉と伝わる木陰に立ち、街の静かな一角を歩く",
        "desc": "一心寺の門前から細い参道を入ると、坂の途中に張りつくように安居神社の境内がある。少彦名と菅原道真を祀る小さな社だが、ここが知られるのは別の理由による。慶長二十年(一六一五)の大坂夏の陣で、茶臼山に布陣して徳川本陣に突撃した真田信繁が、傷つき疲れてこの境内で休んでいたところを討たれた——そう伝わる「真田幸村戦死跡之碑」と、腰かけたとされる松の木陰が、いまも参道脇に残る。台地の縁にあたるこの斜面が、当時は見晴らしのきく要地だったことが、立ってみると地形でわかる。四天王寺とは打って変わって、訪れる人もまばらで、葉ずれの音ばかりが耳に届く。歴史の劇的な一場面と、いまのこの静けさの落差が、かえって場所を強く印象づける。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/%E5%AE%89%E5%B1%85%E7%A5%9E%E7%A4%BE_-_panoramio.jpg/1280px-%E5%AE%89%E5%B1%85%E7%A5%9E%E7%A4%BE_-_panoramio.jpg"
        ],
        "specs": [
          {
            "k": "伝承",
            "v": "真田信繁(幸村)終焉の地"
          },
          {
            "k": "境内",
            "v": "戦死跡之碑が残る"
          }
        ],
        "transit": "一心寺のすぐ南。大阪メトロ谷町線・四天王寺前夕陽ヶ丘駅から徒歩約10分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "堀越神社",
        "cuisine": "神社",
        "area": "大阪市天王寺区茶臼山町",
        "purpose": "「一生に一度の願い」を聞くと伝わる社で、坂歩きの締めくくりに静かに手を合わせる",
        "desc": "安居神社から茶臼山町へ抜けると、緑に囲まれた堀越神社にたどり着く。四天王寺の建立と同じころ、聖徳太子が叔父の崇峻天皇を偲んで創建したと伝わる古社で、大阪では昔から「堀越さんは一生に一度の願いを聞いてくれる神さん」と言いならわされてきた。だから願い事をひとつに絞ってから鳥居をくぐる、というのがこの社の作法めいた愉しみになっている。境内には鎮宅霊符尊を祀る末社もあり、家まわりの守りを願って訪ねる人も少なくない。都心の只中とは思えないほど木が深く、参道に入ると音が一段やわらぐ。四天王寺の伽藍から坂を下り、弔いと武将の最期をたどってきた半日の終いに、未来へのささやかな願いをひとつ預ける——そういう順番で歩くと、この社が締めくくりにふさわしく感じられる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Horikoshi-jinja1.jpg/1280px-Horikoshi-jinja1.jpg"
        ],
        "specs": [
          {
            "k": "言い伝え",
            "v": "一生に一度の願いを聞く社"
          },
          {
            "k": "末社",
            "v": "鎮宅霊符尊を祀る"
          }
        ],
        "transit": "茶臼山の北、天王寺公園に近い一角。JR・大阪メトロ天王寺駅から徒歩約7分"
      }
    ],
    "sideArticles": [
      {
        "t": "箕面大滝へ。紅葉の渓谷をたどる滝みち",
        "h": "/feature/osaka-minoo-falls",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Minoh_Falls_Minoh_Osaka_pref_Japan08s3.jpg/1280px-Minoh_Falls_Minoh_Osaka_pref_Japan08s3.jpg"
      },
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      }
    ],
    "quote": "坂を下りるほど、街は祈りの記憶に近づいていく。",
    "quoteCite": "マチノワ編集部",
    "closing": "堀越神社の鳥居を抜けて茶臼山町の通りに戻ると、夕方の光が西へ長く伸びていた。上町台地は西に向かって落ちていく地形で、だから昔の人はこの縁から沈む陽に極楽を重ねたのだと、歩いてみてようやく腑に落ちる。伽藍の整然とした直線、坂沿いに積まれた無数の祈り、武将が息を引きとった木陰、一生に一度の願いを預ける社。テーマはばらばらのようでいて、どれも「ここで手を合わせた誰か」の記憶でつながっている。観光名所をめぐったというより、街が何百年もかけて溜めてきた静けさを少し分けてもらった、そんな半日だった。拝観時間や中心伽藍の入堂料はその時々で変わるので、出かける前にそれぞれの公式の案内に目を通しておくと、歩く段取りがつけやすい。坂を上りなおして駅へ戻る道すがら、もう一度だけ五重塔を振り返った。"
  },
  "kyoto-kurama-kibune": {
    "id": "kyoto-kurama-kibune",
    "no": "G9-07",
    "articleType": "guide",
    "kicker": "KURAMA KIBUNE",
    "title": "鞍馬から貴船へ。叡電で抜ける北山の杜と川床",
    "titleHTML": "鞍馬から貴船へ。<br>叡電で抜ける北山の杜と川床",
    "subtitle": "出町柳で電車を乗り換え、杉木立の山をひとつ越えて、水音のする谷へ降りていく半日",
    "lede": "出町柳の小さなホームに立つと、京都の中心からほんの数駅なのに、もう空気の温度が違う。一両きりの電車が川沿いを北へ走り出すと、窓のすぐ外を木々の枝がかすめていく。市原を過ぎたあたりで、両側からせり出した葉のトンネルに飲み込まれ、車内がふっと緑色に翳る。終点の鞍馬で降りると、線香とも杉ともつかない匂いが鼻をつき、足の裏に伝わる地面はもう山のものだ。ここから杉木立を登り、根の這う尾根を越えて、向こう側の谷へ。水の音をたどって歩く半日のさんぽを記しておきたい。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Eiden_Hachiman_mae_station_20071003.JPG/1280px-Eiden_Hachiman_mae_station_20071003.JPG",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "叡山電車（鞍馬線）",
        "cuisine": "rail",
        "area": "京都市左京区",
        "purpose": "街から北山の登り口まで、谷あいを縫って運んでくれる一両の山岳電車",
        "desc": "出町柳を出た電車は、宝ヶ池で本線と分かれて鞍馬線へ入り、住宅地からみるみる山の懐へ吸い込まれていく。圧巻は市原と二ノ瀬のあいだ、線路の両脇からもみじの枝がアーチを描く「もみじのトンネル」だ。ここを通るとき、車体の側面を大きなガラスで覆った展望列車「きらら」なら、座席が窓側へ少し振ってあり、青葉でも紅葉でも頭上いっぱいの葉ごしに光が降ってくる。歩く前から、もう旅が始まっている区間。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Eiden_Hachiman_mae_station_20071003.JPG/1280px-Eiden_Hachiman_mae_station_20071003.JPG"
        ],
        "specs": [
          {
            "k": "区間",
            "v": "出町柳〜鞍馬"
          },
          {
            "k": "見どころ",
            "v": "市原〜二ノ瀬のもみじのトンネル"
          },
          {
            "k": "車両",
            "v": "展望列車「きらら」ほか"
          }
        ],
        "transit": "出町柳駅から鞍馬駅まで約30分。途中、市原〜二ノ瀬間に車窓の見どころ"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "鞍馬寺",
        "cuisine": "temple",
        "area": "京都市左京区鞍馬本町",
        "purpose": "山そのものを御神体のように歩く、登り坂の参道がある寺",
        "desc": "駅を出てすぐの仁王門をくぐると、いきなり急な石段と九十九折の坂が待っている。途中まではケーブルカーで省略もできるが、できれば歩きたい。両側に杉の巨木が立ち並び、見上げるほど高い梢のあいだから細い光が落ちてくる道は、登るほどに俗世から遠ざかる感覚がある。たどり着いた本殿金堂の前には、宇宙の力が集まるとされる三角形の石畳「金剛床」が敷かれ、両手を広げて立つ人の姿があちこちに見える。拝観の入口で愛山費を納めて入る。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/e/e7/Kurama-dera_temple_gate_-_panoramio.jpg"
        ],
        "specs": [
          {
            "k": "拝観",
            "v": "9:00〜16:15ごろ"
          },
          {
            "k": "愛山費",
            "v": "500円（最新は公式で確認を）"
          },
          {
            "k": "登り",
            "v": "仁王門から本殿まで徒歩約30分"
          }
        ],
        "transit": "鞍馬駅から仁王門まで徒歩約3分。本殿金堂までは九十九折の参道を徒歩約30分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "鞍馬山（木の根道・奥の院）",
        "cuisine": "trail",
        "area": "京都市左京区",
        "purpose": "鞍馬と貴船を、人の足だけでつなぐ尾根越えのハイキング道",
        "desc": "本殿の裏手にまわると舗装が途切れ、ここから先は山道になる。圧巻は尾根筋の「木の根道」で、固い岩盤のせいで地中にもぐれなかった杉の根が、地表をうねるように這って網目を描いている。牛若丸がここで跳躍の修行をしたと語り継がれる場所だ。やがて山深い静けさのなかに奥の院魔王殿が現れ、ここを過ぎると道はひたすら下りに転じる。急な石段を慎重に降りきると、谷底の水音が少しずつ近づいてくる。足ごしらえだけはしっかりと。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/%22Tree_root_path%22_%287057199181%29.jpg/1280px-%22Tree_root_path%22_%287057199181%29.jpg"
        ],
        "specs": [
          {
            "k": "所要",
            "v": "鞍馬本殿〜貴船側 約1時間"
          },
          {
            "k": "難所",
            "v": "木の根道・魔王殿からの下り石段"
          }
        ],
        "transit": "本殿金堂の脇から山道へ。奥の院魔王殿を経て貴船側の西門まで徒歩でおよそ1時間"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "貴船神社",
        "cuisine": "shrine",
        "area": "京都市左京区鞍馬貴船町",
        "purpose": "水を司る神を祀る、灯籠の石段で名高い谷あいの社",
        "desc": "山を下りきって谷の道に出ると、すぐそこが貴船神社の参道だ。本宮へ続く石段の両脇には朱塗りの春日灯籠がずらりと連なり、見上げる構図は写真でよく知られている。ここは古くから水の神を祀る社で、湧き水に浮かべると文字が現れる「水占みくじ」を求める人が御神水のそばに集まる。本宮からさらに渓流をさかのぼると、玉依姫命を祀る奥宮があり、参道のにぎわいから一転して、しんとした空気が満ちている。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/%E8%B2%B4%E8%88%B9%E7%A5%9E%E7%A4%BE_Kibune_Jinja_%28KYOTO-JAPAN%29_%284951368080%29.jpg/1280px-%E8%B2%B4%E8%88%B9%E7%A5%9E%E7%A4%BE_Kibune_Jinja_%28KYOTO-JAPAN%29_%284951368080%29.jpg"
        ],
        "specs": [
          {
            "k": "開門",
            "v": "夏季6:00〜20:00ごろ（季節で変動）"
          },
          {
            "k": "本宮→奥宮",
            "v": "渓流沿い徒歩約15分"
          }
        ],
        "transit": "鞍馬からの山道を西門に降りて参道へ。本宮から奥宮までは渓流沿いに徒歩約15分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "貴船川の川床",
        "cuisine": "dining",
        "area": "京都市左京区鞍馬貴船町",
        "purpose": "川面すれすれに床を組み、水音と涼気のなかで一服する谷の名物",
        "desc": "谷を流れる貴船川の上には、水面すれすれに桟敷の床が組まれ、夏のあいだだけ店が並ぶ。京都の鴨川では「ゆか」と書くこの設えを、ここ貴船では「かわどこ」と呼び分ける。床に座ると足もとを清流が音を立てて流れ、両岸の木陰と相まって、街より体感で数度は涼しい。鮎やあまごといった川魚、鱧、京野菜を組んだ会席が中心だが、流しそうめんを名物にする店もあって気軽に立ち寄れる。雨で増水すると床は閉じるので、訪ねる日は店の最新案内を確かめておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Kibune_Kawadoko01s5s4272.jpg/1280px-Kibune_Kawadoko01s5s4272.jpg"
        ],
        "specs": [
          {
            "k": "時季",
            "v": "おおむね初夏〜初秋（公式で確認を）"
          },
          {
            "k": "呼称",
            "v": "貴船は「かわどこ」"
          }
        ],
        "transit": "貴船神社の参道沿い、貴船川に並ぶ料理旅館・茶屋に点在。おおむね初夏から初秋まで"
      }
    ],
    "sideArticles": [
      {
        "t": "大原・三千院を歩く。苔の庭と里の静けさ",
        "h": "/feature/kyoto-ohara-sanzen",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Sanzen-in_%E4%B8%89%E5%8D%83%E9%99%A2_%28KYOTO-JAPAN%29_%284951385058%29.jpg/1280px-Sanzen-in_%E4%B8%89%E5%8D%83%E9%99%A2_%28KYOTO-JAPAN%29_%284951385058%29.jpg"
      },
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      }
    ],
    "quote": "電車を降りた瞬間に空気がひんやりと変わる。京都の街なかとは、ほんの三十分の距離だとは思えない。",
    "quoteCite": "マチノワ編集部",
    "closing": "貴船川の床に腰を下ろし、足もとを流れていく水を眺めていると、ついさっき汗をかいて越えてきた山が嘘のようだ。鞍馬の杉のひんやりした暗がりと、貴船の水面に揺れる光。同じ北山の表と裏を、自分の足でつないだという実感だけが、火照った体に静かに残っている。帰りは貴船口から、またあの一両の電車に揺られて街へ戻る。半日のうちに山ひとつぶんの時間が流れた、そんな疲れの心地よさを抱えて。なお、川床の営業や各社寺の拝観時間は天候や季節で変わるので、出かける前に公式の案内に目を通しておくと安心だ。"
  },
  "kyoto-ohara-sanzen": {
    "id": "kyoto-ohara-sanzen",
    "no": "G9-08",
    "articleType": "guide",
    "kicker": "OHARA",
    "title": "大原・三千院を歩く。苔の庭と里の静けさ",
    "titleHTML": "大原・三千院を歩く。<br>苔の庭と里の静けさ",
    "subtitle": "京都・左京大原　石段の参道から、声明の谷へ",
    "lede": "バスを降りると、空気がひとつ低い音を立てて落ち着く。八瀬を抜けて山あいに入った大原は、京都の市街から三十分ほどなのに、川の流れと鳥の声しか聞こえない時間がある。呂川(りょせん)の細い水音をたどって石畳の参道をのぼると、両脇に漬物屋がしそ色の暖簾を下げ、湿った苔のにおいが鼻先をかすめる。傘をたたんでも、木々の下ではまだ雨が降っているような気配。ここから先は、急がずに歩いたほうがいい谷だ。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Sanzen-in_%E4%B8%89%E5%8D%83%E9%99%A2_%28KYOTO-JAPAN%29_%284951385058%29.jpg/1280px-Sanzen-in_%E4%B8%89%E5%8D%83%E9%99%A2_%28KYOTO-JAPAN%29_%284951385058%29.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "三千院",
        "cuisine": "天台宗の門跡寺院",
        "area": "京都市左京区大原来迎院町",
        "purpose": "苔の庭と往生極楽院を静かに眺める",
        "desc": "御殿門の石垣をくぐると、まず聚碧園(しゅうへきえん)の池が客殿の縁先に開ける。さらに奥へ進んで有清園(ゆうせいえん)に出ると、杉木立の足元いっぱいに苔がうねり、その緑の海のなかに往生極楽院がぽつんと建っている。堂内には平安期の阿弥陀三尊像(国宝)が安置され、来迎(らいごう)を表すように脇の二尊がわずかに前かがみに座る。見落としたくないのは苔のあいだの「わらべ地蔵」——彫刻家・杉村孝の手による小さな地蔵が数体、苔に半分埋もれて笑っている。観光寺らしからぬこの愛嬌が、大原の入口にふさわしい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Sanzen-in_%E4%B8%89%E5%8D%83%E9%99%A2_%28KYOTO-JAPAN%29_%284951385058%29.jpg/1280px-Sanzen-in_%E4%B8%89%E5%8D%83%E9%99%A2_%28KYOTO-JAPAN%29_%284951385058%29.jpg"
        ],
        "specs": [
          {
            "k": "拝観料",
            "v": "一般700円(11月など季節で変動あり・公式で確認)"
          },
          {
            "k": "拝観時間",
            "v": "9:00〜17:00(冬期は短縮)"
          }
        ],
        "transit": "京都バス「大原」下車、参道を徒歩約10分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "来迎院",
        "cuisine": "天台声明ゆかりの古刹",
        "area": "京都市左京区大原来迎院町",
        "purpose": "声明発祥の谷の静けさにふれる",
        "desc": "三千院の門前から呂川沿いをさらに奥へたどると、参拝客の足音がふっと減る。ここ来迎院は、仁寿年間に円仁が中国の天台山にならって開いたと伝わり、日本の声明(しょうみょう)——仏教声楽の源流とされる大原魚山(ぎょざん)声明が育った場所だ。本堂には平安時代作の薬師・阿弥陀・釈迦の三如来坐像(いずれも重要文化財)が並ぶ。観光の喧噪から一段奥まっているぶん、堂前に立つと谷を渡る風の音だけが残り、かつてここで朝な夕なに響いたという読経の旋律を、つい耳が探してしまう。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/%E4%BA%AC%E9%83%BD%E3%83%BB%E5%A4%A7%E5%8E%9F%E3%81%AB%E3%81%A6_%E6%9D%A5%E8%BF%8E%E9%99%A2_Raig%C5%8D-in_2011.8.28_-_panoramio.jpg/1280px-%E4%BA%AC%E9%83%BD%E3%83%BB%E5%A4%A7%E5%8E%9F%E3%81%AB%E3%81%A6_%E6%9D%A5%E8%BF%8E%E9%99%A2_Raig%C5%8D-in_2011.8.28_-_panoramio.jpg"
        ],
        "specs": [
          {
            "k": "拝観料",
            "v": "400円(宝物展期間は500円)"
          },
          {
            "k": "立地",
            "v": "三千院の奥、参道のさらに山手"
          }
        ],
        "transit": "三千院前から山手へ徒歩約5〜10分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "宝泉院",
        "cuisine": "額縁庭園の寺院",
        "area": "京都市左京区大原勝林院町",
        "purpose": "柱を額に見立てた庭を抹茶とともに",
        "desc": "来た道を少し戻り、勝林院の脇へ折れると宝泉院がある。靴を脱いで書院に上がると、客殿の柱と鴨居が一枚の額縁になって、その向こうに盤桓園(ばんかんえん)の庭が絵のように切り取られている。中心に立つのは樹齢七百年とも言われる五葉松。座って眺めていると、自分の視線の位置で庭の構図が動くのがわかる。拝観料に抹茶と和菓子が含まれ、畳に膝を折って一服しながら、しばし時間を手放す。「立ち去りがたい」という意味の盤桓の名のとおり、腰が重くなる縁側だ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/%E5%AE%9D%E6%B3%89%E9%99%A2_03.JPG/1280px-%E5%AE%9D%E6%B3%89%E9%99%A2_03.JPG"
        ],
        "specs": [
          {
            "k": "拝観料",
            "v": "一般1,000円(抹茶・菓子付き)"
          },
          {
            "k": "拝観時間",
            "v": "9:00〜17:00(受付16:30まで)"
          }
        ],
        "transit": "三千院門前から勝林院方向へ徒歩約3分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "寂光院",
        "cuisine": "平家物語ゆかりの尼寺",
        "area": "京都市左京区大原草生町",
        "purpose": "建礼門院ゆかりの里寺で物語の余韻を",
        "desc": "三千院側の谷をいったん下り、川を渡って西の集落へ。畑のあいだの坂道を上がりきると、苔むした石段の上に寂光院の門が現れる。聖徳太子の創建と伝わるこの尼寺は、『平家物語』の終幕、壇ノ浦から生き延びた建礼門院徳子が余生を送った場所として知られる。本堂や本尊は平成の火災で焼失し再建されているが、境内の汀(みぎわ)の池や老樹のたたずまいに、千年の物語が静かに沈んでいる。三千院の賑わいとは対岸どうし——歩いて渡るからこそ、この寺の孤独な明るさが胸に届く。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/JyakkouinHondo.jpg/1280px-JyakkouinHondo.jpg"
        ],
        "specs": [
          {
            "k": "拝観料",
            "v": "600円"
          },
          {
            "k": "位置",
            "v": "三千院とは大原の谷の反対側"
          }
        ],
        "transit": "大原バス停から谷を挟んだ反対側、徒歩約15分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "大原の里(赤紫蘇畑と棚田)",
        "cuisine": "里山の田園風景",
        "area": "京都市左京区大原(上野町ほか)",
        "purpose": "寺を結ぶ農の風景を歩いて味わう",
        "desc": "寺と寺のあいだを縫う農道こそ、大原のもうひとつの主役だ。背後の山に向かって石積みで段を重ねた棚田が広がり、初夏には一面が赤紫蘇の畑に染まる。大原は何百年も赤しそを育ててきた土地で、混じりけのない紫色とその香りは、しば漬けという京の食を支えてきた。里の駅や直売所には採れたての野菜やしそ加工品が並び、参道で嗅いだあの漬物の匂いの源がここにあると合点がいく。寺の静寂を味わったあとに、この畑の風が、ようやく人の暮らしの体温を運んでくる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Sunset_%2815610551403%29.jpg/1280px-Sunset_%2815610551403%29.jpg"
        ],
        "specs": [
          {
            "k": "見頃",
            "v": "赤紫蘇は初夏〜盛夏"
          },
          {
            "k": "歩き方",
            "v": "三千院と寂光院を結ぶ農道沿い"
          }
        ],
        "transit": "大原バスターミナル周辺から徒歩圏"
      }
    ],
    "sideArticles": [
      {
        "t": "鞍馬から貴船へ。叡電で抜ける北山の杜と川床",
        "h": "/feature/kyoto-kurama-kibune",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Eiden_Hachiman_mae_station_20071003.JPG/1280px-Eiden_Hachiman_mae_station_20071003.JPG"
      },
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      }
    ],
    "quote": "山と水のあいだに、まだ消えていない音がある。",
    "quoteCite": "マチノワ編集部",
    "closing": "来た道を戻るころには、参道のしそ漬けの匂いが朝より濃くなっている。大原はどこも派手ではない。苔がゆっくり石を覆い、声明の余韻が谷に残り、赤紫蘇が夏を待っている——そういう、静かに続いていくものの集まりだ。歩き終えてバスを待つあいだ、急いで見て回らなくてよかった、とぼんやり思う。次に来るなら、雪の朝か、しそが色づく真夏か。同じ参道が、まるで違う顔をしているはずだ。なお拝観時間や料金は季節で動くので、出かける前に各寺の公式の案内に目を通しておくと安心して歩ける。"
  },
  "hyogo-nishinomiya-koshien": {
    "id": "hyogo-nishinomiya-koshien",
    "no": "G9-09",
    "articleType": "ranking",
    "kicker": "NISHINOMIYA",
    "title": "西宮で立ち寄りたい。甲子園とえびす総本社の街",
    "titleHTML": "西宮で立ち寄りたい。<br>甲子園とえびす総本社の街",
    "subtitle": "球場の歓声、厄除けの寺、桜と酒。海と山にはさまれた一帯を、テーマを変えながら歩く",
    "lede": "西宮という地名で真っ先に浮かぶものは、人によって違う。夏の甲子園を思う人、厄除けの門戸厄神を思う人、桜の夙川で育った人、灘の酒どころとして覚えている人。ひとつの街がこれだけ別々の顔で記憶されるのは珍しい。今回はそのバラバラさをそのまま地図にした。球場、寺、川、酒蔵——脈絡がないようでいて、どれも海と六甲の間の狭い土地に同居している。観光名所を網羅するのではなく、「ここに来たならこれは見ておきたい」と編集部が思える五つを、テーマ違いのまま並べた。一日で全部回らなくていい。気になった一つを足がかりに、街の重なりを感じてもらえれば十分だ。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/2015_0610_Ivy_of_Koshien_Stadium.jpg/1280px-2015_0610_Ivy_of_Koshien_Stadium.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "阪神甲子園球場",
        "cuisine": "野球場・スタジアム",
        "area": "兵庫県西宮市甲子園町",
        "purpose": "高校野球と阪神タイガースの本拠地。街の名そのものを全国区にした場所",
        "desc": "1924年（大正13年）の開場以来、ここが「甲子園」という言葉を地名から固有名詞へと押し上げてきた。外野を覆う天然の蔦は球場の象徴で、戦中にいったん刈られながら再生され、いまも季節で色を変える。春夏の高校野球と阪神戦が同じグラウンドで続いてきたこと自体が、この一塊の土地のドラマを濃くしている。試合日とそれ以外で周辺の空気がまるで変わるので、訪問前に開催日程を球場公式で確かめておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/2015_0610_Ivy_of_Koshien_Stadium.jpg/1280px-2015_0610_Ivy_of_Koshien_Stadium.jpg"
        ],
        "specs": [
          {
            "k": "開場",
            "v": "1924年（大正13年）"
          },
          {
            "k": "象徴",
            "v": "外野を覆う蔦の壁"
          },
          {
            "k": "駐車場",
            "v": "専用なし・公共交通推奨"
          }
        ],
        "transit": "阪神本線「甲子園」駅から徒歩約3分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "甲子園歴史館",
        "cuisine": "ミュージアム",
        "area": "兵庫県西宮市甲子園町（甲子園プラス2F）",
        "purpose": "球場・高校野球・タイガースの歴史を一か所でたどる展示施設",
        "desc": "球場の隣に建つ「甲子園プラス」2階を中心に、2022年の移転リニューアルで展示面積を広げた。優勝校の記録や名場面の映像、実際に使われた用具などが並び、球場の外周をなぞるだけでは見えない百年分の蓄積に触れられる。隣の球場とセットで巡ると、グラウンドで起きた出来事の「裏側」が立体的になるのがここならではの価値だ。開館時間は冬季に短縮され、入館料も区分があるため、最新は施設サイトで確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/The_Museum_of_Hanshin_Koshien_Stadium.jpg/1280px-The_Museum_of_Hanshin_Koshien_Stadium.jpg"
        ],
        "specs": [
          {
            "k": "場所",
            "v": "甲子園プラス2F"
          },
          {
            "k": "リニューアル",
            "v": "2022年に移転拡張"
          },
          {
            "k": "休館",
            "v": "月曜（試合日・祝日除く）ほか"
          }
        ],
        "transit": "阪神本線「甲子園」駅から徒歩約8分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "門戸厄神 東光寺",
        "cuisine": "寺院",
        "area": "兵庫県西宮市門戸西町",
        "purpose": "厄除けの寺として関西で広く知られる古刹",
        "desc": "正式には松泰山東光寺といい、弘法大師が嵯峨天皇の病気平癒を祈って創建したと伝わる。厄神明王を祀る「日本三躰厄神」の一つとされ、関西で厄除けといえばまずここが挙がるほど信仰を集めてきた。坂を上った高台に厄神堂や薬師堂、不動堂が並び、毎年1月18・19日の厄除大祭には参道が屋台で埋まる。駅名にまで寺の通称が冠されているのは、この街と寺の結びつきの深さを物語る。大祭まわりの混雑や授与の時間は寺の案内で確かめたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mondoyakujin_omotemon.jpg/1280px-Mondoyakujin_omotemon.jpg"
        ],
        "specs": [
          {
            "k": "正式名",
            "v": "松泰山 東光寺"
          },
          {
            "k": "信仰",
            "v": "厄除け・日本三躰厄神"
          },
          {
            "k": "大祭",
            "v": "1月18・19日"
          }
        ],
        "transit": "阪急今津線「門戸厄神」駅から北西へ約700m"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "夙川河川敷緑地（夙川公園）",
        "cuisine": "公園・桜並木",
        "area": "兵庫県西宮市（夙川沿い）",
        "purpose": "川の両岸に続く桜並木。住宅地の中を貫く春の散歩道",
        "desc": "六甲から海へ下る夙川に沿って、南北におよそ2.8km、両岸に桜が連なる。「日本さくら名所100選」に数えられる並木で、見頃の三月下旬から四月上旬は川面に花びらが流れ、阪急・JR・阪神の三路線の駅がいずれも徒歩圏という珍しい立地のおかげで、電車を降りた瞬間から桜の下を歩ける。終日開放・無料で、花の季節以外も新緑や紅葉が水辺を彩る。開花の進み具合は年によってずれるため、訪ねる前に最新の状況を確かめておくとよい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Shukugawa_Park_in_spring.jpg/1280px-Shukugawa_Park_in_spring.jpg"
        ],
        "specs": [
          {
            "k": "並木",
            "v": "南北 約2.8km"
          },
          {
            "k": "見頃",
            "v": "3月下旬～4月上旬"
          },
          {
            "k": "入園",
            "v": "終日開放・無料"
          }
        ],
        "transit": "阪急神戸線「夙川」駅・JR「さくら夙川」駅・阪神「香櫨園」駅から徒歩すぐ"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "酒ミュージアム（白鹿記念酒造博物館）",
        "cuisine": "ミュージアム・酒蔵",
        "area": "兵庫県西宮市鞍掛町",
        "purpose": "灘五郷の酒づくりを伝える施設。海と六甲が育てた「酒の街」西宮の核心",
        "desc": "清酒「白鹿」の辰馬本家酒造が、伝統の酒造りを後世に残そうと1982年に設けた。明治2年築の酒蔵を活かした酒蔵館では、実際の酒造道具に触れ、仕込みの映像や酒造り唄に向き合える。西宮郷は名水「宮水」が湧く土地で、灘五郷の一角として酒づくりが続いてきた歴史そのものがここに凝縮している。球場や桜とは別の、海寄りの西宮のもう一つの顔だ。記念館の企画展示は時期で入れ替わるので、開館日と内容は公式で確認を。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Hakushika_Memorial_Museum02st3200.jpg/1280px-Hakushika_Memorial_Museum02st3200.jpg"
        ],
        "specs": [
          {
            "k": "設立",
            "v": "1982年（辰馬本家酒造）"
          },
          {
            "k": "酒蔵館",
            "v": "明治2年築の蔵を活用"
          },
          {
            "k": "休館",
            "v": "火曜ほか"
          }
        ],
        "transit": "阪神本線「西宮」駅から徒歩圏（酒蔵が集まる西宮郷）"
      }
    ],
    "sideArticles": [
      {
        "t": "摩耶山・六甲の夜景。掬星台から1000万ドルの夜",
        "h": "/feature/hyogo-rokko-maya-night",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/View_of_Kikuseidai_from_Mount_Maya_Kobe.jpg/1280px-View_of_Kikuseidai_from_Mount_Maya_Kobe.jpg"
      },
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      }
    ],
    "quote": "脈絡のなさこそ、この街の輪郭だ",
    "quoteCite": "マチノワ編集部",
    "closing": "球場の土の匂い、寺の境内の静けさ、川面に散る桜、酒蔵に残る木の香り。西宮の五つは互いに似ていない。だからこそ、どれか一つを選んで訪ねると、残りが気になって街に長居することになる。拝観時間や入館料、催事の日程は折々で変わるので、出かける前にそれぞれの公式情報に目を通しておくと安心だ。次に「西宮」と聞いたとき、あなたの頭にいくつの顔が浮かぶだろう。"
  },
  "hyogo-rokko-maya-night": {
    "id": "hyogo-rokko-maya-night",
    "no": "G9-10",
    "articleType": "guide",
    "kicker": "MAYA ROKKO",
    "title": "摩耶山・六甲の夜景。掬星台から1000万ドルの夜",
    "titleHTML": "摩耶山・六甲の夜景。<br>掬星台から1000万ドルの夜",
    "subtitle": "兵庫・神戸六甲｜灘から中央へ、灯りが満ちる稜線をたどる夜",
    "lede": "日が暮れてからが本番、という街がある。神戸の背骨をなす六甲の稜線は、昼は緑とハイカーのものだが、空が藍に沈むころ眼下の盆地に灯りが一斉に点る。湾に沿って弧を描く港の光、碁盤目に走る市街、その向こうにかすむ大阪のビル群——「100万ドルの夜景」という古い言い回しは、戦後の1953年ごろ、六甲山から見える大阪・尼崎・神戸・芦屋の灯りにかかるひと月ぶんの電気料金が当時の為替で約100万ドル相当と試算されたことに由来すると伝わり、のちに円高や電気代の上昇で「1000万ドル」へと呼びかえられた。摩耶山の掬星台、六甲の天覧台、それぞれ標高も視界も違い、同じ神戸でも切り取られる夜の表情が変わる。この特集は、灯りそのものを目的に山へ登る一夜の道筋。ケーブルとロープウェーを乗り継いで稜線の高みへ上がり、最後は街際の橋まで降りて、近い灯りで締めくくる。なお索道の運行や展望施設の時間は季節や点検で動くので、出かける前にそれぞれの公式案内で当夜の運行を一度たしかめてほしい。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/View_of_Kikuseidai_from_Mount_Maya_Kobe.jpg/1280px-View_of_Kikuseidai_from_Mount_Maya_Kobe.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "摩耶山 掬星台",
        "cuisine": "展望広場",
        "area": "神戸市灘区摩耶山町",
        "purpose": "標高702mから神戸〜大阪の弧を一望する、この夜の起点",
        "desc": "星に手が届くほど近い、と名づけの由来になった山上広場。標高702mという高さは六甲の主要展望地のなかでも高い部類で、灯りまでの距離があるぶん、湾曲した海岸線が一本の光の帯として視界に収まる。眼下の神戸市街から大阪湾を回り込み、晴れた夜は対岸の大阪のビル群までつながって見えるのは、この稜線の張り出した位置ならでは。広場は柵越しに視界が開け、足元に夜景遺産のプレートが埋め込まれている。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/View_of_Kikuseidai_from_Mount_Maya_Kobe.jpg/1280px-View_of_Kikuseidai_from_Mount_Maya_Kobe.jpg"
        ],
        "specs": [
          {
            "k": "標高",
            "v": "約702m"
          },
          {
            "k": "入場",
            "v": "広場は自由(索道は有料)"
          },
          {
            "k": "アクセス",
            "v": "まやビューライン星の駅すぐ"
          },
          {
            "k": "備考",
            "v": "山上は冷えるため防寒を"
          }
        ],
        "transit": "各線三宮駅から市バス18系統で摩耶ケーブル下、まやビューライン乗り継ぎ星の駅すぐ"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "まやビューライン（摩耶ケーブル・摩耶ロープウェー）",
        "cuisine": "索道",
        "area": "神戸市灘区摩耶山町",
        "purpose": "麓から掬星台まで、二つの乗り物を継いで一気に高度を稼ぐ移動そのもの",
        "desc": "麓の摩耶ケーブル駅からケーブルカーで虹の駅へ上がり、そこでロープウェーに乗り換えて星の駅をめざす、二段構えの索道。途中の虹の駅は中腹に開けた踊り場のような場所で、ロープウェーへ乗り換えるあいだに早くも街の光が見え始める。火曜は祝日を除き運休となることが多く、年明けには年次点検で長期運休に入る期間もある。夜間運行や終発の時刻は時季で動くので、登る前に当夜のダイヤを公式で確かめておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Kobe_maya_ropeway03_1920.jpg/1280px-Kobe_maya_ropeway03_1920.jpg"
        ],
        "specs": [
          {
            "k": "区間",
            "v": "ケーブル+ロープウェーの2段"
          },
          {
            "k": "運休",
            "v": "火曜(祝日除く)ほか点検期間"
          },
          {
            "k": "料金",
            "v": "公式の運賃案内で確認を"
          },
          {
            "k": "夜間運行",
            "v": "時季により変動"
          }
        ],
        "transit": "市バス18系統で摩耶ケーブル下、徒歩すぐの摩耶ケーブル駅から乗車"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "六甲ケーブル 天覧台",
        "cuisine": "展望台",
        "area": "神戸市灘区六甲山町",
        "purpose": "摩耶とは別の稜線から、もうひとつの神戸の夜を比べる",
        "desc": "六甲ケーブル六甲山上駅の駅舎屋上が、そのまま展望台になっている。昭和天皇が訪れたことにちなんで名づけられた一角で、標高はおよそ737m。摩耶側より少し西寄りから街を見下ろすため、同じ神戸でも光の重なり方や港の見え方が変わり、二つの山をはしごすると夜景の比較が利く。日本夜景遺産にも数えられる定番で、ケーブルを降りて階段を上がればすぐという身軽さも魅力。催事の時期は入場の扱いが変わることがあるため、最新の案内を見ておくと安心だ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Funicular_of_Rokko_Cable_Line_at_night.jpg/1280px-Funicular_of_Rokko_Cable_Line_at_night.jpg"
        ],
        "specs": [
          {
            "k": "標高",
            "v": "約737m"
          },
          {
            "k": "位置",
            "v": "六甲山上駅の駅舎屋上"
          },
          {
            "k": "アクセス",
            "v": "六甲ケーブルで山上駅へ"
          },
          {
            "k": "料金",
            "v": "催事期は変更あり・公式で確認"
          }
        ],
        "transit": "市バス16系統で六甲ケーブル下、六甲ケーブルで六甲山上駅へ、屋上が天覧台"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "六甲ガーデンテラス（見晴らしの塔）",
        "cuisine": "展望施設",
        "area": "神戸市灘区六甲山町",
        "purpose": "城のような塔と複数のテラスで、角度を変えながら灯りを眺める",
        "desc": "ヨーロッパの城を思わせる「見晴らしの塔」を中心に、石畳の見晴らしのテラスや見晴らしデッキなど、視点の異なる展望スポットがいくつも配されている。塔の階段を上がると神戸・大阪方面に加え、晴れた夜は明石海峡から関西国際空港の灯りまで広く見渡せるのが、西へ大きく開けたこの場所の利点。飲食店やショップもそろうため、稜線で過ごす夜の腰を据えどころにしやすい。営業時間は季節で前後するので、訪ねる前に当日の案内を見ておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Rokko_Garden_Terrace_-_panoramio_-_Nagono.jpg/1280px-Rokko_Garden_Terrace_-_panoramio_-_Nagono.jpg"
        ],
        "specs": [
          {
            "k": "見どころ",
            "v": "見晴らしの塔・複数のテラス"
          },
          {
            "k": "視界",
            "v": "神戸〜明石海峡方面まで"
          },
          {
            "k": "施設",
            "v": "飲食店・ショップ併設"
          },
          {
            "k": "営業",
            "v": "季節で時間変動・公式確認"
          }
        ],
        "transit": "六甲山上駅から六甲山上バスで六甲ガーデンテラス下車すぐ"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "自然体感展望台 六甲枝垂れ",
        "cuisine": "展望建築",
        "area": "神戸市灘区六甲山町",
        "purpose": "ヒノキの格子越しに灯りを切り取る、夜のライトアップも見もの",
        "desc": "「六甲山上に立つ一本の大きな樹」を発想にした、ヒノキの細いフレームを幾重にも組んだ展望建築。木の格子越しに見る街明かりは輪郭が柔らかくにじみ、開けた展望台で見るのとは別物の表情になる。季節ごとに演出を変える光のアート『Lightscape in Rokko』が灯る時期には、建築そのものが夜の作品として浮かび上がるのが、ただの展望台と違うところ。入場は有料で、開館時間は時季で前後するため、夜に合わせて行くなら当日の受付終了時刻を公式で確かめておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Rokko-Shidare_Observatory_from_Rokko_View_Palace.JPG/1280px-Rokko-Shidare_Observatory_from_Rokko_View_Palace.JPG"
        ],
        "specs": [
          {
            "k": "構造",
            "v": "ヒノキフレームの展望建築"
          },
          {
            "k": "入場",
            "v": "有料(大人・小人区分あり)"
          },
          {
            "k": "演出",
            "v": "季節ごとの光のアート"
          },
          {
            "k": "受付",
            "v": "時季で終了時刻変動・公式確認"
          }
        ],
        "transit": "六甲ガーデンテラス内、見晴らしの塔のすぐそば"
      },
      {
        "rank": "SPOT 06",
        "rankNum": 6,
        "name": "ビーナスブリッジ",
        "cuisine": "展望橋",
        "area": "神戸市中央区諏訪山町",
        "purpose": "山を降りた締めに、街際から港の灯りを間近で受け止める",
        "desc": "諏訪山の中腹、金星台と山頂展望台を結んで8の字の螺旋を描くループ橋。標高が山上組よりずっと低いぶん、三宮の高層ビルやメリケンパーク、ハーバーランドの灯りが手の届きそうな近さで迫ってくるのが、稜線の遠景とは正反対の魅力だ。市街地から歩いて上がれて駐車場も無料のため、ケーブルの最終便を逃しても帰りの足を気にせず立ち寄れる。橋へ続く再度山ドライブウェイは深夜に通行止めとなる時間帯があるので、車で向かう場合は通行可能な時間を確認しておくとよい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Kobe_Venus_Bridge02nt3200.jpg/1280px-Kobe_Venus_Bridge02nt3200.jpg"
        ],
        "specs": [
          {
            "k": "形状",
            "v": "8の字の螺旋ループ橋"
          },
          {
            "k": "長さ",
            "v": "約90m"
          },
          {
            "k": "駐車場",
            "v": "無料(約30台)"
          },
          {
            "k": "注意",
            "v": "ドライブウェイは深夜通行止め時間あり"
          }
        ],
        "transit": "三宮駅から市バス7系統で諏訪山公園下、徒歩約20分"
      }
    ],
    "sideArticles": [
      {
        "t": "西宮で立ち寄りたい。甲子園とえびす総本社の街",
        "h": "/feature/hyogo-nishinomiya-koshien",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/2015_0610_Ivy_of_Koshien_Stadium.jpg/1280px-2015_0610_Ivy_of_Koshien_Stadium.jpg"
      },
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      }
    ],
    "quote": "同じ神戸の夜でも、702メートルの掬星台と街際の橋とでは、灯りまでの距離がまるで違う。",
    "quoteCite": "マチノワ編集部",
    "closing": "山上の冷たい空気のなかで遠い灯りを眺め、帰りはケーブルの窓いっぱいに迫る街明かりを浴び、最後にビーナスブリッジで港の光を間近に受け止める——一晩で「遠い夜景」と「近い夜景」を両方味わえるのが、神戸の山が持つ強みだ。索道の終発は早めに切り上がる路線が多く、下りの最終に乗り遅れると一気に下山が難しくなる。終発の時刻も季節や点検で前後するため、当夜の運行と最終便の時間は各施設の公式で必ず押さえ、防寒を一枚足してから出かけたい。灯りは毎晩そこにあるが、それを見上げる時間は、案外短い。（マチノワ編集部）"
  },
  "nara-horyuji-course": {
    "id": "nara-horyuji-course",
    "no": "G9-11",
    "articleType": "course",
    "kicker": "HORYUJI",
    "title": "斑鳩・法隆寺 半日モデルコース。世界最古の木造伽藍",
    "titleHTML": "斑鳩・法隆寺 半日モデルコース。<br>世界最古の木造伽藍",
    "subtitle": "飛鳥の塔をつなぐ、斑鳩の里の歩き方",
    "lede": "大和盆地の北西、田と竹林のあいだに四つの古塔が点在する斑鳩は、聖徳太子の一族が宮を構えた土地だ。中心の法隆寺は七世紀の木組みを今に伝え、その周囲には尼寺や、稲穂の海に立つ三重塔が散らばっている。この記事は朝の早い時間に古墳の石室をのぞくところから始め、法隆寺の伽藍をひと巡りしたあと、太子ゆかりの寺を東へ、塔を北へとたどって午後の早いうちに切り上げる。塔から塔へ歩く道のりそのものが斑鳩の地形と歴史を読む手がかりになる、そんな半日の道順に組んだ。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Horyu-ji10s3200.jpg/1280px-Horyu-ji10s3200.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "藤ノ木古墳",
        "cuisine": "史跡・円墳",
        "area": "奈良・斑鳩",
        "purpose": "9時ごろ。寺の伽藍を見る前に、斑鳩がそもそも古代豪族の里だったことを石室から確かめる起点として。",
        "desc": "法隆寺の西およそ350メートルに残る六世紀後半の円墳で、被葬者が特定されていないのに未盗掘の家形石棺と豪奢な馬具が出たことで知られる。ふだんは覆屋の窓越しに石室をのぞく形だが、その朱の残る石棺を間近に見られるのがこの古墳ならではで、伽藍建立より前の斑鳩の姿を肌で感じられる。春と秋には石室内部の特別公開がある。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Fujinoki_Kofun%2C_entrance.jpg/1280px-Fujinoki_Kofun%2C_entrance.jpg"
        ],
        "specs": [
          {
            "k": "墳形",
            "v": "直径約48mの円墳"
          },
          {
            "k": "見学",
            "v": "通常は窓越しに石室内を観察"
          },
          {
            "k": "特別公開",
            "v": "春・秋に石室内部を公開（時期は公式で確認）"
          },
          {
            "k": "関連施設",
            "v": "斑鳩文化財センター（入館無料）が南に徒歩数分"
          }
        ],
        "transit": "JR法隆寺駅から徒歩約15分、法隆寺南大門前から西へ徒歩約5分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "法隆寺",
        "cuisine": "寺院・世界遺産",
        "area": "奈良・斑鳩",
        "purpose": "9時20分ごろから2時間弱。西院伽藍・大宝蔵院・東院をひと続きに巡る、この半日の中心。",
        "desc": "金堂と五重塔を中心とする西院伽藍は、現存する世界最古の木造建築群として知られ、わずかにふくらむ柱や雲斗・雲肘木の意匠に飛鳥の木工の手つきが残る。大宝蔵院では百済観音像など寺宝に会え、東へ歩けば八角円堂の夢殿が建つ。一つの寺で飛鳥から奈良へと続く時間の層を歩いて追えるのが、ここを長く取りたい理由だ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Horyu-ji10s3200.jpg/1280px-Horyu-ji10s3200.jpg"
        ],
        "specs": [
          {
            "k": "拝観料",
            "v": "一般1,500円（西院・大宝蔵院・東院共通／料金は公式で確認を）"
          },
          {
            "k": "拝観時間",
            "v": "8:00〜17:00（11/4〜2/21は〜16:30）"
          },
          {
            "k": "見どころ",
            "v": "金堂・五重塔・大宝蔵院・夢殿"
          },
          {
            "k": "登録",
            "v": "ユネスコ世界文化遺産"
          }
        ],
        "transit": "JR法隆寺駅から徒歩約20分、または奈良交通バス「法隆寺参道」下車すぐ"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "中宮寺",
        "cuisine": "寺院・尼門跡",
        "area": "奈良・斑鳩",
        "purpose": "11時前後。法隆寺東院を出てそのまま隣へ。木像の微笑と静かに向き合う時間に。",
        "desc": "聖徳太子が母のために建てたと伝わる尼寺で、本尊の菩薩半跏思惟像は飛鳥彫刻でも数少ない木像の傑作として親しまれている。クスノキの黒い艶と、わずかに頬へ寄せた指先がつくる柔らかな表情は写真では伝わりにくく、間近に座って初めて分かる。太子の妃が刺繍したと伝わる天寿国繍帳の残片も寺の宝として伝わる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Ch%C5%ABg%C5%AB-ji_temple_%2C_%E4%B8%AD%E5%AE%AE%E5%AF%BA_-_panoramio_%286%29.jpg/1280px-Ch%C5%ABg%C5%AB-ji_temple_%2C_%E4%B8%AD%E5%AE%AE%E5%AF%BA_-_panoramio_%286%29.jpg"
        ],
        "specs": [
          {
            "k": "拝観料",
            "v": "大人600円（変更され得るため公式で確認を）"
          },
          {
            "k": "拝観時間",
            "v": "3/21〜9/30は9:00〜16:30、10/1〜3/20は〜16:00"
          },
          {
            "k": "本尊",
            "v": "菩薩半跏思惟像（国宝）"
          },
          {
            "k": "寺格",
            "v": "日本最古と伝わる尼寺"
          }
        ],
        "transit": "法隆寺東院伽藍に隣接、夢殿から徒歩すぐ"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "法輪寺",
        "cuisine": "寺院・三重塔",
        "area": "奈良・斑鳩",
        "purpose": "正午すぎ。北の田園地帯へ歩き、再建された塔と飛鳥仏に会う。",
        "desc": "聖徳太子の病気平癒を願って子の山背大兄王が建てたと伝わる寺で、講堂には飛鳥時代の薬師如来坐像や虚空蔵菩薩像が並ぶ。象徴の三重塔は落雷で一度失われ、作家・幸田文らの尽力で昭和に古式どおり再建されたもの。古代と現代の手仕事が重なるこの塔の経緯を知って見上げると、木造塔が永遠ではなく受け継がれる営みだと分かる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Horinji_%28Ikaruga%29%2C_tou.jpg/1280px-Horinji_%28Ikaruga%29%2C_tou.jpg"
        ],
        "specs": [
          {
            "k": "拝観料",
            "v": "大人500円（最新は公式案内で確認を）"
          },
          {
            "k": "拝観時間",
            "v": "3〜11月は8:00〜17:00、12〜2月は〜16:30"
          },
          {
            "k": "本尊ほか",
            "v": "薬師如来坐像・虚空蔵菩薩像（重要文化財）"
          },
          {
            "k": "三重塔",
            "v": "昭和50年に再建"
          }
        ],
        "transit": "中宮寺・法隆寺から北へ徒歩約20分、三井・岡本エリア"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "法起寺",
        "cuisine": "寺院・世界遺産",
        "area": "奈良・斑鳩",
        "purpose": "13時すぎ。田に映る最古の三重塔を見上げて、半日を締めくくる。",
        "desc": "聖徳太子の岡本宮を寺に改めたと伝わり、八世紀初頭に完成した三重塔は現存する日本最古の三重塔として国宝に指定されている。周囲を田に囲まれ、塔だけが里の高みに立つ景観はここでしか得られず、秋にはコスモスが塔の足もとを埋める。法隆寺の整った境内とは対照的な、里に溶け込んだ古塔の姿が斑鳩の余韻になる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Hokki-ji%2C_enkei.jpg/1280px-Hokki-ji%2C_enkei.jpg"
        ],
        "specs": [
          {
            "k": "拝観料",
            "v": "300円（料金は公式で確認を）"
          },
          {
            "k": "拝観時間",
            "v": "8:30〜17:00（11/4〜2/21は〜16:30）"
          },
          {
            "k": "三重塔",
            "v": "現存最古の三重塔（国宝・706年完成）"
          },
          {
            "k": "登録",
            "v": "法隆寺地域の仏教建造物として世界遺産"
          }
        ],
        "transit": "法輪寺から北東へ徒歩約10分、JR法隆寺駅からバス「法起寺」下車すぐ"
      }
    ],
    "sideArticles": [
      {
        "t": "吉野山を歩く。蔵王堂と桜の尾根みち",
        "h": "/feature/nara-yoshino-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Kinpusenji_Yoshino_Nara02n4272.jpg/1280px-Kinpusenji_Yoshino_Nara02n4272.jpg"
      },
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      }
    ],
    "quote": "塔の影が田に落ちるたび、斑鳩は寺の境内ではなく里そのものが古代だったと気づく。",
    "quoteCite": "マチノワ編集部",
    "closing": "9時に藤ノ木古墳で石室をのぞき、9時20分ごろ法隆寺南大門をくぐる。西院伽藍から大宝蔵院、東院の夢殿まで丁寧に見て、11時前後に隣の中宮寺へ。半跏思惟像と向き合ったら、正午を回るころには北の三井・岡本へ足を向ける。再建の塔が立つ法輪寺で飛鳥仏に会い、13時すぎに田の中の法起寺へ。最古の三重塔を見上げて、午後の早い時間に斑鳩を後にする流れだ。各寺の拝観時間と料金は折々に見直されるので、出かける前に各寺の公式案内で最新を一度押さえておくと安心できる。"
  },
  "nara-yoshino-walk": {
    "id": "nara-yoshino-walk",
    "no": "G9-12",
    "articleType": "guide",
    "kicker": "YOSHINO",
    "title": "吉野山を歩く。蔵王堂と桜の尾根みち",
    "titleHTML": "吉野山を歩く。<br>蔵王堂と桜の尾根みち",
    "subtitle": "下千本から上千本へ、咲きのぼる桜と修験の尾根をたどる一日",
    "lede": "吉野山の桜は、平地のソメイヨシノのように一斉に咲いてはくれない。標高の低い下千本から、中千本、上千本、そして奥千本へと、シロヤマザクラの淡い色がひと尾根ずつ標高を駆け上がっていく。だから「いつ満開か」を一点で言い切れないのがこの山で、麓が散り際でも尾根の上はまだ三分咲き、ということが起こる。咲きのぼる桜を追いかけるように尾根道を歩くと、足の下で季節がゆっくり動いていくのが分かる。修験の祈りが千年以上染み込んだ参道を、白く煙る桜越しに登っていく——ここではその尾根みちを、低いところから高いところへ、桜を追う順に歩く。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Kinpusenji_Yoshino_Nara02n4272.jpg/1280px-Kinpusenji_Yoshino_Nara02n4272.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "金峯山寺 蔵王堂",
        "cuisine": "寺院・国宝",
        "area": "奈良県吉野郡吉野町（中千本）",
        "purpose": "尾根歩きの起点。吉野修験の総本山で桜の山の中心",
        "desc": "高さ約34メートル、木造の古建築としては東大寺大仏殿に次ぐ大きさを持つ本堂で、世界遺産に登録されている。中に立つのは青黒い忿怒相の蔵王権現三体——役行者が感得したと伝わる、この山だけの本尊だ。桜はもともと蔵王権現の神木として供えられ、信者が一本また一本と植え継いだことが吉野三万本の始まりとされる。つまりこの山の桜は鑑賞用ではなく祈りの跡で、堂の前に立つとその出発点に居ることになる。通常拝観と特別ご開帳で扱いが分かれるため、参拝可否や拝観の最新案内は金峯山寺の公式で確かめてから向かいたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Kinpusenji_Yoshino_Nara02n4272.jpg/1280px-Kinpusenji_Yoshino_Nara02n4272.jpg"
        ],
        "specs": [
          {
            "k": "拝観",
            "v": "蔵王堂内陣は有料（境内は無料）"
          },
          {
            "k": "見どころ",
            "v": "国宝の本堂と蔵王権現三体"
          },
          {
            "k": "標高帯",
            "v": "中千本"
          }
        ],
        "transit": "近鉄吉野駅からロープウェイ吉野山駅下車、徒歩約10分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "吉水神社 一目千本",
        "cuisine": "神社・世界遺産",
        "area": "奈良県吉野郡吉野町（中千本）",
        "purpose": "尾根の谷を一望する展望点。桜の重なりを横から見る場所",
        "desc": "もとは金峯山寺の僧坊・吉水院で、南北朝期には後醍醐天皇が一時の御所とし、源義経や豊臣秀吉の花見の本陣ともなった、来訪者の名がそのまま日本史になる社だ。境内の山門脇に立つと、向かいの尾根いっぱいに咲く中千本・上千本の桜が谷越しに一望できる——ここが「一目千本」と呼ばれる眺めの起点で、秀吉もこの一点に息をのんだと伝わる。蔵王堂で桜の始まりを見たあと、その桜が尾根を埋めていく全体像をここで俯瞰できるのが歩く順番としての妙味。書院の拝観料や時間は変わることがあるので、入る前に公式の案内を一度見ておくとよい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/%E4%B8%80%E7%9B%AE%E5%8D%83%E6%9C%AC%E6%A1%9C_%28Cherry_blooming_view_from_Yoshimizu_Shrine%29_12_Apr%2C_2014_-_panoramio.jpg/1280px-%E4%B8%80%E7%9B%AE%E5%8D%83%E6%9C%AC%E6%A1%9C_%28Cherry_blooming_view_from_Yoshimizu_Shrine%29_12_Apr%2C_2014_-_panoramio.jpg"
        ],
        "specs": [
          {
            "k": "書院拝観",
            "v": "有料（境内は自由）"
          },
          {
            "k": "眺望",
            "v": "谷越しに中千本・上千本を一望"
          },
          {
            "k": "登録",
            "v": "世界遺産の構成資産"
          }
        ],
        "transit": "蔵王堂から参道を南へ徒歩約7分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "如意輪寺",
        "cuisine": "寺院",
        "area": "奈良県吉野郡吉野町（中千本の谷向かい）",
        "purpose": "尾根の対岸へ寄り道する一拍。後醍醐天皇陵をいだく古刹",
        "desc": "メインの尾根からいったん谷を下り、向かいの斜面に建つため、ここへ足を運ぶと尾根を反対側から振り返る視点が手に入る。後醍醐天皇の勅願寺で、本堂裏の山には京の都へ向けて築かれたという後醍醐天皇陵が静かに眠る。楠木正行が四條畷へ出陣する前に詣で、寺の扉に辞世を鏃で刻んだと伝わり、その扉は今も宝物殿に残る。桜の盛りの参道を歩きながら、南朝の哀史がここだけ時間を止めているような静けさに出会えるのが、本道を外れてでも寄る理由だ。拝観時間は桜期と通常期で異なるため、訪問前に最新を確認しておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Nyoirinji_Yoshino_Nara01n4272.jpg/1280px-Nyoirinji_Yoshino_Nara01n4272.jpg"
        ],
        "specs": [
          {
            "k": "拝観",
            "v": "本堂・宝物殿は有料"
          },
          {
            "k": "ゆかり",
            "v": "後醍醐天皇陵・楠木正行の辞世"
          },
          {
            "k": "位置",
            "v": "尾根の谷向かい"
          }
        ],
        "transit": "中千本から谷を下り対岸へ、徒歩約25分（坂あり）"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "上千本",
        "cuisine": "桜の尾根・景観",
        "area": "奈良県吉野郡吉野町（上千本）",
        "purpose": "咲きのぼる桜を追う登りの核心。山が桜色に染まる帯",
        "desc": "中千本から先は道が一気に勾配を増し、両側の斜面を埋めるシロヤマザクラの帯の中を登っていく。下千本の満開から三、四日遅れて色づくため、麓が散りはじめても上千本はちょうど見頃、という時間差がこの登りの醍醐味だ。古来この山の桜は接ぎ木ではなく実生のシロヤマザクラが主で、白に近い花と赤みを帯びた若葉が同時に出るため、遠目には淡い霞のような色になる——ソメイヨシノの均一なピンクとは別物の柔らかさで、それが谷を一面に覆う。坂はきついが、登るほど見頃の桜に近づいていく構造になっている。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/%E5%90%89%E9%87%8E%E5%B1%B1_%E4%B8%8A%E5%8D%83%E6%9C%AC%E3%81%8B%E3%82%89%E3%81%AE%E7%9C%BA%E3%82%81_2013.4.09_-_panoramio.jpg/1280px-%E5%90%89%E9%87%8E%E5%B1%B1_%E4%B8%8A%E5%8D%83%E6%9C%AC%E3%81%8B%E3%82%89%E3%81%AE%E7%9C%BA%E3%82%81_2013.4.09_-_panoramio.jpg"
        ],
        "specs": [
          {
            "k": "桜",
            "v": "シロヤマザクラ中心"
          },
          {
            "k": "見頃",
            "v": "下千本より数日遅れ"
          },
          {
            "k": "道",
            "v": "急坂の登り参道"
          }
        ],
        "transit": "中千本から急坂の参道を登り徒歩約30分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "花矢倉展望台",
        "cuisine": "展望台",
        "area": "奈良県吉野郡吉野町（上千本）",
        "purpose": "尾根歩きの到達点。下千本まで標高差を一枚に見渡す眺め",
        "desc": "標高およそ600メートル、上千本の坂を登りきった崖のへりに張り出した展望台で、ここまで来ると視界がすとんと開ける。眼下に上千本、その先に中千本と下千本、谷の底に蔵王堂の大屋根までが一望でき、登ってきた尾根がまるごと桜の階段として足元に伸びる。低地から尾根まで咲く時期がずれるこの山では、ここから見下ろすと「いま色づいている帯」と「もう葉桜の帯」が一枚の景色に並んで見えることがある——標高差がそのまま時間差として可視化される、吉野ならではの眺めだ。桜期は手前が交通規制の対象になるため、車で上がる場合は当日の規制と運行を必ず確認したい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Kinpusen-ji_Temple_seen_from_Hanayagura_Observatory_001.jpg/1280px-Kinpusen-ji_Temple_seen_from_Hanayagura_Observatory_001.jpg"
        ],
        "specs": [
          {
            "k": "標高",
            "v": "約600メートル"
          },
          {
            "k": "眺望",
            "v": "上千本から下千本まで一望"
          },
          {
            "k": "注意",
            "v": "桜期は周辺で交通規制あり"
          }
        ],
        "transit": "上千本の坂を登りきった崖上、中千本から徒歩約40分"
      }
    ],
    "sideArticles": [
      {
        "t": "斑鳩・法隆寺 半日モデルコース。世界最古の木造伽藍",
        "h": "/feature/nara-horyuji-course",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Horyu-ji10s3200.jpg/1280px-Horyu-ji10s3200.jpg"
      },
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      }
    ],
    "quote": "咲くのは平らな野ではなく、ひと尾根ずつ。桜は標高を登っていく。",
    "quoteCite": "マチノワ編集部",
    "closing": "花矢倉まで登りきると、来た道がそのまま桜の尾根として眼下に伸びている。さっき手を合わせた蔵王堂の屋根も、その奥に重なって見える。吉野山が「一目千本」と呼ばれてきたのは、桜が密集しているからというより、低地から尾根まで標高差そのものが一枚の景色に畳み込まれているからだ。下りは同じ参道を戻ってもいいし、奥千本側へ抜けて西行庵まで足を延ばしてもいい。ロープウェイは桜の最盛期と一部の曜日以外は代行バスに替わる日があるので、帰りの足は当日の運行を公式の案内で確かめてから動くと安心だ。桜の時期は尾根ごとに見頃が数日ずつずれる。どの高さが今いちばんなのか——それを探りながら登ること自体が、この山の歩き方になる。"
  },
  "aichi-inuyama-castle": {
    "id": "aichi-inuyama-castle",
    "no": "G9-13",
    "articleType": "course",
    "kicker": "INUYAMA CASTLE",
    "title": "犬山城・城下町 半日モデルコース。国宝天守と門前町",
    "titleHTML": "犬山城・城下町 半日モデルコース。<br>国宝天守と門前町",
    "subtitle": "名鉄犬山駅から歩いてまわる、木曽川を望む城と門前の半日",
    "lede": "犬山は、木曽川の流れが愛知と岐阜を分ける川辺の町だ。その崖の上に立つ天守は、室町期の姿を今に伝える現存最古級の木造で、城へ向かう一本道の両側には黒い格子の町家が連なる。城・神社・茶室・門前という性格の異なる場所が、徒歩圏にぎゅっと収まっているのがこの町の地形的な面白さである。そこでこの記事では、まず麓の稲荷で参道の空気に体を慣らし、坂を登って天守からの眺めで一日のピークを先に迎え、下りながら茶室・町並み・祭りの記憶へと「高さを下げていく」順路で半日を組み立てた。午前に着いて昼過ぎまで、川風と石段と団子の煙のなかを歩く。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Castle_in_Inuyama.JPG/1280px-Castle_in_Inuyama.JPG",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "三光稲荷神社",
        "cuisine": "神社",
        "area": "愛知県犬山市",
        "purpose": "10時ごろ。城の石段に取りつく前の最初の一歩",
        "desc": "犬山城がそびえる城山の真下、登城路の入口にあたる位置に鎮座する。境内の銭洗池にはお金を洗うと倍になって戻るという言い伝えがあり、ザルにのせた小銭を御神水ですすぐ参拝者の姿が絶えない。社殿そばに連なるピンクのハート絵馬や朱鳥居の列が写真スポットとして知られ、ここから坂道がそのまま天守へと続く地形なので、城と一緒に立ち寄る順番が自然になっている。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Inuyama_Castle_and_Sanko_Inari_Shrine_from_torii_of_Inuyama_Shrine.JPG/1280px-Inuyama_Castle_and_Sanko_Inari_Shrine_from_torii_of_Inuyama_Shrine.JPG"
        ],
        "specs": [
          {
            "k": "参拝",
            "v": "24時間・無休"
          },
          {
            "k": "銭洗い",
            "v": "銭洗池の御神水"
          },
          {
            "k": "所在地",
            "v": "犬山市犬山北古券41-1"
          }
        ],
        "transit": "名鉄犬山駅西口から徒歩約12分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "国宝 犬山城",
        "cuisine": "城・天守",
        "area": "愛知県犬山市",
        "purpose": "10時半すぎ。半日のいちばん高い場所を先に踏む",
        "desc": "天文6年（1537年）の築造と伝わり、現存する木造天守のなかでも古い様式を残す。見どころは最上階を囲む回縁で、欄干に出ると眼下を木曽川が流れ、対岸の岐阜・各務原から濃尾平野までが一望できる。川がそのまま天然の堀になる断崖の上に建つ立地は、登ってみて初めて腑に落ちる類のもので、急で狭い階段を自分の足で上がるからこそ城の高さが体感できる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Castle_in_Inuyama.JPG/1280px-Castle_in_Inuyama.JPG"
        ],
        "specs": [
          {
            "k": "開城",
            "v": "9:00〜17:00（最終入場16:30）"
          },
          {
            "k": "入場料",
            "v": "大人550円（最新は公式で確認を）"
          },
          {
            "k": "様式",
            "v": "現存最古級の木造天守"
          }
        ],
        "transit": "名鉄犬山駅西口から徒歩約15分、三光稲荷神社から石段で続く"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "日本庭園 有楽苑（国宝茶室 如庵）",
        "cuisine": "庭園・茶室",
        "area": "愛知県犬山市",
        "purpose": "正午前。城の喧騒から静けさへ切り替える一服",
        "desc": "織田信長の弟で茶人として知られた織田有楽斎が建てた茶室・如庵を中心とする庭園で、如庵は現存する国宝の茶室のひとつ。三畳台目という小さな席に、有楽窓と呼ばれる竹を並べた連子窓から差す光が独特の陰影をつくる。城の階段を上がってきた直後にこの静かな草庵へ入ると、同じ「国宝」でも天守の豪壮さとは正反対の、にじり口越しの親密な空間美に気づける。呈茶で一服いただけるのもここならでは。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/J%C5%8D-an_%28Urakuen%29.jpg/1280px-J%C5%8D-an_%28Urakuen%29.jpg"
        ],
        "specs": [
          {
            "k": "休苑",
            "v": "毎週水曜・年末年始ほか"
          },
          {
            "k": "入苑料",
            "v": "大人1,500円・呈茶別（公式で確認を）"
          },
          {
            "k": "茶室",
            "v": "国宝・如庵（三畳台目）"
          }
        ],
        "transit": "犬山城天守から東へ徒歩約7分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "犬山城下町 本町通り",
        "cuisine": "町並み・食べ歩き",
        "area": "愛知県犬山市",
        "purpose": "正午すぎ。坂を下りながら昼を食べ歩きで",
        "desc": "城の大手から名鉄犬山駅方向へまっすぐ南北に延びる目抜き通りで、黒格子の町家が軒を連ねる。江戸期の城下の地割りがほぼそのまま残り、通りの正面に天守が見える「城が見える参道」のような構図が歩いていて楽しい。串に刺した田楽や五平餅、団子といった門前の食べ歩きが沿道に並ぶので、城・茶室で使った時間のあとに、ここで腰を据えず立ち食いで昼を済ませる組み立てがちょうどよい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Inuyamajouka1.jpg/1280px-Inuyamajouka1.jpg"
        ],
        "specs": [
          {
            "k": "店の時間",
            "v": "店舗ごとに異なる（多くは日中）"
          },
          {
            "k": "名物",
            "v": "田楽・五平餅・団子など"
          },
          {
            "k": "通り",
            "v": "城下の地割りが残る本町通り"
          }
        ],
        "transit": "有楽苑から徒歩約8分、城の正面に南北へ延びる"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "どんでん館",
        "cuisine": "資料館",
        "area": "愛知県犬山市",
        "purpose": "13時半ごろ。祭りの記憶を見て駅へ戻る前の締め",
        "desc": "毎年4月の犬山祭で曳かれる三層の車山を、実物のまま屋内に展示する施設。館名は、車山が城下の辻で180度向きを変える所作「どんでん」に由来する。高さ8メートル・重さ3トンを超す車山を、祭りの当日ではなく天井の高い館内でゆっくり見上げられるのがここの値打ちで、からくり人形を載せた山車の細工を間近で観察できる。祭りの日に来られなくても、町を支える年中行事の姿に触れて半日を締められる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Dondenkan_dashi.jpg/1280px-Dondenkan_dashi.jpg"
        ],
        "specs": [
          {
            "k": "開館",
            "v": "9:00〜17:00（入館16:30まで)"
          },
          {
            "k": "入館料",
            "v": "高校生以上100円（公式で確認を）"
          },
          {
            "k": "展示",
            "v": "犬山祭の三層車山 実物"
          }
        ],
        "transit": "本町通り沿い、名鉄犬山駅西口から徒歩約8分"
      }
    ],
    "sideArticles": [
      {
        "t": "常滑やきもの散歩道を歩く。土管坂と招き猫の路地",
        "h": "/feature/aichi-tokoname-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/%E5%B8%B8%E6%BB%91%EF%BC%88%E5%9C%9F%E7%AE%A1%E5%9D%82%EF%BC%89_-_panoramio.jpg/1280px-%E5%B8%B8%E6%BB%91%EF%BC%88%E5%9C%9F%E7%AE%A1%E5%9D%82%EF%BC%89_-_panoramio.jpg"
      },
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      }
    ],
    "quote": "崖の上の天守から木曽川を見下ろし、坂を下りながら町の時間をさかのぼる半日。",
    "quoteCite": "マチノワ編集部",
    "closing": "10時前後に名鉄犬山駅西口を出て、まず三光稲荷神社で銭洗いと朱の鳥居を抜け、そのまま石段を登って10時半すぎに犬山城天守へ。最上階で木曽川と濃尾平野を見渡したら、城を出て東どなりの有楽苑へまわり、正午前に国宝茶室・如庵と庭をひとめぐりする。昼は本町通りに戻って田楽や五平餅をつまみながら町家の通りを下り、最後にどんでん館で犬山祭の三層車山を間近に見て、14時前後に駅へ戻る流れだ。拝観料や呈茶・各館の時間は時期で動くので、出かける前に犬山観光ナビや各施設の公式ページで最新を一度たしかめておくと安心できる。"
  },
  "aichi-tokoname-walk": {
    "id": "aichi-tokoname-walk",
    "no": "G9-14",
    "articleType": "guide",
    "kicker": "TOKONAME",
    "title": "常滑やきもの散歩道を歩く。土管坂と招き猫の路地",
    "titleHTML": "常滑やきもの散歩道を歩く。<br>土管坂と招き猫の路地",
    "subtitle": "煙突の影が落ちる坂道で、足の裏に土の記憶をたどる",
    "lede": "名鉄常滑駅の改札を抜けると、まず迎えてくれるのは音ではなく、においだった。雨上がりの土と、釉薬を焼きしめたあとに残る、かすかに乾いた粉のにおい。坂の上のほうから、煉瓦の煙突が何本も突き出している。火を落としてずいぶん経つはずなのに、まだ昨日まで煙を吐いていたような顔をしている。この街は、平らな場所がほとんどない。歩くということは、ここでは少しずつ高さを変えていくことだった。陶磁器会館で散歩道のマップを一枚もらい、私は足元の傾きに身をあずけるようにして、路地へ入っていく。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/%E5%B8%B8%E6%BB%91%EF%BC%88%E5%9C%9F%E7%AE%A1%E5%9D%82%EF%BC%89_-_panoramio.jpg/1280px-%E5%B8%B8%E6%BB%91%EF%BC%88%E5%9C%9F%E7%AE%A1%E5%9D%82%EF%BC%89_-_panoramio.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "やきもの散歩道（出発点・陶磁器会館）",
        "cuisine": "散策路の起点",
        "area": "愛知県常滑市",
        "purpose": "煙突と窯の街を歩く一日のはじまり",
        "desc": "駅から坂をひとつ越えたところに陶磁器会館があり、ここで一枚の散歩道マップを受け取るところから歩きははじまる。地図には番号の振られた道筋が引かれていて、それを目で追うというより、足で確かめていく感覚に近い。会館を背にして見上げると、丘の斜面に煉瓦の煙突が何本も立っているのが見える。常滑がほかの焼きものの町と違うのは、窯場が観光のために集められたのではなく、坂のある地形にそって自然に積み上がってきたことだ。だから道は気まぐれに折れ、平らな一本道にはならない。歩くたびに視界の高さが変わり、煙突の見え方も変わっていく。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Aichi_Tokoname01n3200.jpg/1280px-Aichi_Tokoname01n3200.jpg"
        ],
        "specs": [
          {
            "k": "歩く距離の目安",
            "v": "短い周回で約1.6km・1時間ほどから"
          },
          {
            "k": "マップ",
            "v": "陶磁器会館で配布"
          }
        ],
        "transit": "名鉄常滑線・常滑駅から東へ徒歩約5〜10分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "土管坂",
        "cuisine": "坂道・景観",
        "area": "愛知県常滑市",
        "purpose": "焼きものでできた坂を踏みしめる",
        "desc": "路地を進んでいくと、ふいに片側の壁が土管でびっしり埋め尽くされた坂にぶつかる。明治期につくられた土管が、もう一方の壁には昭和の焼酎瓶が、規則正しく積まれて壁面になっている。本来は地中に埋めて水を通すための土管が、ここでは立ち上がって街の景色そのものになっているのが、なんとも常滑らしい。足元には、窯から出た焼き損じの陶片を敷きつめた「ケサワ」と呼ばれる滑り止めがあり、雨の坂でも踏ん張れるよう工夫されている。靴の裏に伝わるごつごつした感触が、この坂が見るためではなく、もとは人や荷車が通るためのものだったことを思い出させる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/%E5%B8%B8%E6%BB%91%EF%BC%88%E5%9C%9F%E7%AE%A1%E5%9D%82%EF%BC%89_-_panoramio.jpg/1280px-%E5%B8%B8%E6%BB%91%EF%BC%88%E5%9C%9F%E7%AE%A1%E5%9D%82%EF%BC%89_-_panoramio.jpg"
        ],
        "specs": [
          {
            "k": "壁の素材",
            "v": "明治期の土管と昭和の焼酎瓶"
          },
          {
            "k": "足元",
            "v": "陶片を敷いた滑り止め（ケサワ）"
          }
        ],
        "transit": "名鉄常滑駅から徒歩約8分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "廻船問屋 瀧田家",
        "cuisine": "歴史的建造物",
        "area": "愛知県常滑市",
        "purpose": "坂のとちゅうで海運の街の記憶に立ち寄る",
        "desc": "土管坂を上りきったすぐそばに、黒い板塀をめぐらせた大きな町家が静かに建っている。江戸から明治にかけて、尾張と江戸を船で結んだ尾州廻船で財をなした瀧田家の住まいだ。焼きものの町という顔の裏に、海でものを運んで栄えた時代があったことが、この家にくると腑に落ちる。常滑焼の土管も甕も、もとはこうした船に積まれて各地へ運ばれていった。主屋と土蔵の中には和船の模型や海運の資料が並び、坂歩きでほてった体を、ひんやりした土間で休めることもできる。拝観料や開いている時間はときおり改められるので、立ち寄る前に公式の案内で確かめておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/%E5%BB%BB%E8%88%B9%E5%95%8F%E5%B1%8B%E7%80%A7%E7%94%B0%E5%AE%B6_01.jpg/1280px-%E5%BB%BB%E8%88%B9%E5%95%8F%E5%B1%8B%E7%80%A7%E7%94%B0%E5%AE%B6_01.jpg"
        ],
        "specs": [
          {
            "k": "建物",
            "v": "尾州廻船で栄えた廻船問屋の町家"
          },
          {
            "k": "見どころ",
            "v": "和船模型・海運資料・土間"
          }
        ],
        "transit": "土管坂の坂上側すぐ、徒歩約1分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "登窯（陶榮窯）",
        "cuisine": "窯跡・文化財",
        "area": "愛知県常滑市",
        "purpose": "斜面に這う巨大な窯の前に立つ",
        "desc": "坂をいくつか折れた先で、斜面そのものにのしかかるように、長い窯が横たわっているのに出会う。明治二十年ごろに築かれた連房式の登窯で、二十度ほどの傾きにそって焼成室が八つ連なり、その上に背の高さの違う煙突が十本立ち並ぶ。傾斜を使って下の部屋の熱を上へ上へと送り、薪一回ぶんで段階的に焼き上げる仕組みだ。現存する登窯としては規模が大きく、国の重要有形民俗文化財に指定されている。窯の口をのぞくと、内壁には何十年ぶんもの煤と釉薬が垂れて固まり、てらてらと黒光りしている。火がここで生きていたことが、見るより先に、こもった土と炭のにおいで伝わってくる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Toeiyo01n4272.jpg/1280px-Toeiyo01n4272.jpg"
        ],
        "specs": [
          {
            "k": "築造",
            "v": "明治20年ごろの連房式登窯"
          },
          {
            "k": "指定",
            "v": "国の重要有形民俗文化財"
          }
        ],
        "transit": "やきもの散歩道内、土管坂から徒歩数分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "INAXライブミュージアム",
        "cuisine": "ミュージアム",
        "area": "愛知県常滑市",
        "purpose": "土とタイルの来歴を、手と目でたどる",
        "desc": "散歩道から少し足をのばすと、煉瓦造りの建物が点在する一角に出る。やきものの町で育った会社が、土と焼きものの文化を伝えるために開いた複合施設だ。なかでも「世界のタイル博物館」には、古代オリエントの青い施釉煉瓦から、各国の装飾タイルまでが集められていて、足元にあたりまえにあるタイルが、これほど長い旅をしてきたものかと驚かされる。窯のなかを歩いて体感できる建物や、土をこねて作品をつくれる工房もあり、見るだけでなく手を動かせるのがこの施設の持ち味だ。開館時間や入館料、休館日は見直されることがあるため、出かける前に公式サイトで最新を確認しておくとよい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/INAX_Live_Museum04n4272.jpg/1280px-INAX_Live_Museum04n4272.jpg"
        ],
        "specs": [
          {
            "k": "休館日",
            "v": "公式サイトで最新の開館カレンダーを要確認"
          },
          {
            "k": "見どころ",
            "v": "世界のタイル博物館・体験工房"
          }
        ],
        "transit": "名鉄常滑駅から徒歩約25分、または知多バスで「INAXライブミュージアム前」下車"
      },
      {
        "rank": "SPOT 06",
        "rankNum": 6,
        "name": "とこなめ招き猫通り（とこにゃん）",
        "cuisine": "通り・モニュメント",
        "area": "愛知県常滑市",
        "purpose": "歩き終えて、無数の招き猫に見送られる",
        "desc": "坂を下りきって駅へ戻る道のりは、招き猫が見守る一本道になっている。陶磁器会館から駅へ抜けるこの道の壁には、それぞれ違うご利益をさずける焼きものの招き猫が並び、見上げた擁壁の上からは、とこにゃんと名づけられた巨大な猫の顔が、半身だけのぞかせてこちらを見ている。高さは四メートル近く、幅は六メートルを超える大きさで、首から下がないのは、もともと壁の上にちょこんと顔を出す造形として作られたためだ。常滑が招き猫の生産地として知られてきたことが、この通りにくると一目でわかる。歩き疲れた帰り道に、ずらりと並んだ猫たちに見送られると、なんとなく報われたような気持ちになる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Aichi_Tokoname31n4272.jpg/1280px-Aichi_Tokoname31n4272.jpg"
        ],
        "specs": [
          {
            "k": "とこにゃん",
            "v": "高さ約3.8m・幅約6.3mの招き猫"
          },
          {
            "k": "通り沿い",
            "v": "ご利益違いの陶製招き猫が並ぶ"
          }
        ],
        "transit": "名鉄常滑駅から陶磁器会館へ向かう道沿い、徒歩約5分"
      }
    ],
    "sideArticles": [
      {
        "t": "犬山城・城下町 半日モデルコース。国宝天守と門前町",
        "h": "/feature/aichi-inuyama-castle",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Castle_in_Inuyama.JPG/1280px-Castle_in_Inuyama.JPG"
      },
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      }
    ],
    "quote": "土管は地面に埋めるためのものだったのに、ここでは坂をかたちづくるために立っている。役目を終えた焼きものが、街そのものになっていた。",
    "quoteCite": "マチノワ編集部",
    "closing": "坂を下りきって駅へ戻る道で、靴の裏に乾いた土がうっすらついているのに気づいた。陶土を踏み、土管の壁をなぞり、窯の煤に触れた一日の名残りだ。常滑は、観光地として整えられた街というより、いまも焼きものをつくる人たちの生活道のあいだを、よそ者の私が少し歩かせてもらった、という感触に近い。煙突はもう煙を上げないけれど、坂は変わらずそこにあって、登ったり下ったりするたびに、土の重さを足にわけてくれる。次に来るときは、雨の日のしっとり濡れた土管坂を見てみたいと思いながら、私は改札を抜けた。なお各施設の拝観時間や入館料はときどき見直されるので、出かける前に公式の案内で一度たしかめておくと安心だ。"
  },
  "shizuoka-hamamatsu-hamanako": {
    "id": "shizuoka-hamamatsu-hamanako",
    "no": "G9-15",
    "articleType": "ranking",
    "kicker": "HAMAMATSU",
    "title": "浜松・浜名湖で立ち寄りたい。城と湖と砂丘",
    "titleHTML": "浜松・浜名湖で立ち寄りたい。<br>城と湖と砂丘",
    "subtitle": "天守の見晴らし、湖上を渡るゴンドラ、夕日が抜ける赤鳥居まで",
    "lede": "浜松という街は、市街の真ん中に城があり、西に汽水の浜名湖が広がり、南は遠州灘の砂丘でいきなり太平洋にぶつかる。半日や一日で全部は欲張れないけれど、「街・湖・海」のどれか一つに偏らず、表情の違う場所を選んで並べてみた。歩きやすさより、その土地でしか味わえない手応えを基準にしている。城好きにも、湖の景色目当てにも、砂と風だけが欲しい人にも、どこかで引っかかってくれるはずの五つ。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/0/06/Bentenjima_beach_park.JPG",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "浜松城",
        "cuisine": "城・天守",
        "area": "静岡県浜松市中央区元城町",
        "purpose": "徳川家康ゆかりの城で街と歴史をまず一望する",
        "desc": "若き家康が築き、ここを拠点に天下取りへ歩み出したことから「出世城」と呼ばれてきた一城。野面積みと呼ばれる荒々しい石垣が往時のまま残り、その上に建つ天守の最上階からは浜松の市街地がぐるりと見渡せる。城そのものより、まず街の地形と方角を頭に入れる展望台として最初に立ち寄ると、このあと向かう湖や海の位置関係がつかみやすい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Hamamatsu_Castle%2C_enkei-3.jpg/1280px-Hamamatsu_Castle%2C_enkei-3.jpg"
        ],
        "specs": [
          {
            "k": "天守閣・天守門入場",
            "v": "200円(高校生以上)"
          },
          {
            "k": "開館",
            "v": "8:30〜16:30(最終入場16:20)"
          },
          {
            "k": "駐車場",
            "v": "無料"
          },
          {
            "k": "料金・時間",
            "v": "公式サイトで最新を確認"
          }
        ],
        "transit": "JR浜松駅北口バスターミナルからバス約10分、下車徒歩約6分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "浜名湖オルゴールミュージアム／かんざんじロープウェイ",
        "cuisine": "ミュージアム・ロープウェイ",
        "area": "静岡県浜松市中央区舘山寺町(大草山)",
        "purpose": "湖上を渡るゴンドラと自動演奏楽器の音色を楽しむ",
        "desc": "国内で湖の上を横断するロープウェイはここだけで、浜名湖の内浦を越えて大草山の頂へと運ばれる道のり自体が見どころになっている。山上のミュージアムにはオルゴールや自動演奏オルガン、蓄音機が並び、係の人による実演で当時の音そのものが鳴る。隣接する展望台からは湖が三百六十度に開け、行きのゴンドラと音と眺めがひと続きの体験になるのが、この場所の強みだ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Kanzanji_ropeway.JPG/1280px-Kanzanji_ropeway.JPG"
        ],
        "specs": [
          {
            "k": "ロープウェイ往復",
            "v": "大人840円・小人420円"
          },
          {
            "k": "運行",
            "v": "9:00から約10分間隔"
          },
          {
            "k": "立地",
            "v": "大草山駅に隣接"
          },
          {
            "k": "料金・運行",
            "v": "公式発表を要確認"
          }
        ],
        "transit": "JR浜松駅からバスで浜名湖パルパルへ、かんざんじロープウェイで約4分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "弁天島の赤鳥居",
        "cuisine": "景観スポット",
        "area": "静岡県浜松市中央区舞阪町弁天島",
        "purpose": "干潟の沖に立つ赤鳥居と夕景を眺める",
        "desc": "神社の参道ではなく、観光のシンボルとして昭和四十八年に建てられた高さ約十八メートルの鳥居が、いかり瀬と呼ばれる沖の干潟にぽつんと立っている。背後に社殿がない分、空と水だけを背負って浮かんで見えるのが独特で、冬至の前後には鳥居の枠のちょうど真ん中に夕日が沈み込む。駅から数分で湖畔に出られる近さも、日没を待ってから動ける気軽さにつながっている。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/0/06/Bentenjima_beach_park.JPG"
        ],
        "specs": [
          {
            "k": "鳥居の高さ",
            "v": "約18m"
          },
          {
            "k": "建立",
            "v": "昭和48年(1973年)"
          },
          {
            "k": "最寄り",
            "v": "JR弁天島駅"
          },
          {
            "k": "夕景",
            "v": "冬至前後に鳥居内へ日没"
          }
        ],
        "transit": "JR弁天島駅から徒歩約5分(弁天島海浜公園)"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "中田島砂丘",
        "cuisine": "砂丘・海岸",
        "area": "静岡県浜松市中央区中田島町",
        "purpose": "遠州灘の風が刻む風紋と海を歩く",
        "desc": "東西約四キロにわたって遠州灘沿いに横たわる砂丘で、強い海風が砂の表面に風紋を描き、その模様は風向き次第で日ごとに姿を変える。砂を越えた先がそのまま太平洋の浜という地続きの開放感は、市街から十数分とは思えないほどだ。遠州灘はアカウミガメの産卵地として知られ、夏の終わりから秋の子ガメ観察会など、海の営みに触れられる時季もある。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Nakatajima_sakyu_no_Fumon_20151128.jpg/1280px-Nakatajima_sakyu_no_Fumon_20151128.jpg"
        ],
        "specs": [
          {
            "k": "規模",
            "v": "東西約4km"
          },
          {
            "k": "入場",
            "v": "自由"
          },
          {
            "k": "見どころ",
            "v": "風紋・遠州灘の眺め"
          },
          {
            "k": "観察会",
            "v": "時季限定・公式情報を確認"
          }
        ],
        "transit": "JR浜松駅から遠鉄バスで「中田島砂丘」下車すぐ(約15分)"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "龍潭寺",
        "cuisine": "寺院・庭園",
        "area": "静岡県浜松市浜名区引佐町井伊谷",
        "purpose": "小堀遠州作と伝わる名勝庭園で静けさに浸る",
        "desc": "奥浜名湖の北、井伊氏発祥の地・井伊谷にある古刹で、江戸期に彦根藩主となった井伊家の菩提寺として続いてきた。本堂裏の庭園は小堀遠州の作と伝えられ、築山と石組みで鶴と亀をかたどった構成が国の名勝に指定されている。湖や砂丘の開けた景色のあとに、縁側から苔と石をじっと眺める時間を置くと、同じ浜松でもまるで違う土地に来たような落差が味わえる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Ryotan_Temple_Garden_%2836498447705%29.jpg/1280px-Ryotan_Temple_Garden_%2836498447705%29.jpg"
        ],
        "specs": [
          {
            "k": "拝観料",
            "v": "500円"
          },
          {
            "k": "拝観",
            "v": "9:00〜16:30"
          },
          {
            "k": "庭園",
            "v": "国指定名勝(小堀遠州作と伝承)"
          },
          {
            "k": "拝観時間",
            "v": "公式案内で最新を確認"
          }
        ],
        "transit": "浜松いなさICから車約10分、奥浜名湖・井伊谷"
      }
    ],
    "sideArticles": [
      {
        "t": "修善寺温泉。竹林の小径と桂川のいで湯",
        "h": "/feature/shizuoka-shuzenji-onsen",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Chikurin-no-komichi_20110919.jpg/1280px-Chikurin-no-komichi_20110919.jpg"
      },
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      }
    ],
    "quote": "城下から湖、そして砂丘へ。同じ街の中で景色がこれだけ切り替わる場所もそうない。",
    "quoteCite": "マチノワ編集部",
    "closing": "五つを一本の線で結ぼうとすると、市街の城、西の湖、南の海と方向がばらけるので、興味の濃いところを二、三に絞って巡るほうが満足度は高い。砂丘の風、湖上のゴンドラ、庭の苔——どれも写真より実物が勝つ類いの景色だ。拝観料や運行時間、休館日はそのつど動くので、出かける前に各施設の公式発表をのぞいておくと安心して回れる。"
  },
  "shizuoka-shuzenji-onsen": {
    "id": "shizuoka-shuzenji-onsen",
    "no": "G9-16",
    "articleType": "guide",
    "kicker": "SHUZENJI",
    "title": "修善寺温泉。竹林の小径と桂川のいで湯",
    "titleHTML": "修善寺温泉。<br>竹林の小径と桂川のいで湯",
    "subtitle": "温泉街さんぽ｜静岡・伊豆",
    "lede": "湯けむりの町を歩く楽しみは、目的地までの最短距離を競うことの真逆にある。修善寺温泉では、町の真ん中を桂川が流れ、その両岸を赤い小橋がいくつも結んでいる。橋を渡るたびに視界が切り替わり、川音が近づいたり遠ざかったりする。下駄を鳴らして川沿いを行き、湯に手を浸し、竹のあいだを抜けてまた橋を渡る——歩くこと自体が湯あみの一部になる、そんな町だ。源氏の物語が染みついた古寺から、川面に張り出した発祥の湯まで、せせらぎを道しるべに半日ほど巡ってみたい。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Chikurin-no-komichi_20110919.jpg/1280px-Chikurin-no-komichi_20110919.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "修禅寺",
        "cuisine": "寺",
        "area": "静岡県伊豆市修善寺",
        "purpose": "町の名の由来となった発祥の寺で、源氏一族の悲話の舞台",
        "desc": "温泉場のいちばん奥、石段の上に構える曹洞宗の古刹で、大同2年(807)に弘法大師が開いたと伝わり「修善寺」という地名そのものがこの寺に由来する。鎌倉幕府の二代将軍・源頼家がこの地で短い生涯を閉じたことから、境内には源氏の悲劇がいまも色濃く残り、宝物殿には母・北条政子が子の冥福を祈って寄進した経典なども伝わる。山門前で清める手水が温泉という、湯の町ならではの参拝が体験できるのもここだけ。開門時間や宝物殿の公開時間は季節で変わるため、訪ねる前に公式の案内を見ておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/181124_Shuzenji_Izu_Shizuoka_pref_Japan03s3.jpg/1280px-181124_Shuzenji_Izu_Shizuoka_pref_Japan03s3.jpg"
        ],
        "specs": [
          {
            "k": "宗派",
            "v": "曹洞宗（福地山修禅萬安禅寺）"
          },
          {
            "k": "拝観",
            "v": "境内は無料／宝物殿は有料"
          },
          {
            "k": "開門",
            "v": "おおむね朝〜夕（季節変動・公式確認）"
          },
          {
            "k": "立地",
            "v": "温泉場の最奥・石段上"
          }
        ],
        "transit": "伊豆箱根鉄道修善寺駅から東海バス・伊豆箱根バスで約8分、終点「修善寺温泉」下車すぐ"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "竹林の小径",
        "cuisine": "散策路",
        "area": "静岡県伊豆市修善寺",
        "purpose": "桂川沿いを彩る、温泉街さんぽの中心となる竹の道",
        "desc": "桂川に沿って約400メートル続く石畳の散歩道で、両側から竹が高く張り出し、晴れた日は葉の隙間から落ちる光が足元に揺れる。道の中ほどには竹を組んだ円形のベンチがあり、寝転んで見上げると天を覆う竹の天井が広がる——この「見上げる」体験が小径の名物だ。平成6年から整備された比較的新しい道だが、せせらぎと相まって町に和の情趣を添えている。日が落ちるとライトアップされ、昼とはまるで別の表情に変わる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Chikurin-no-komichi_20110919.jpg/1280px-Chikurin-no-komichi_20110919.jpg"
        ],
        "specs": [
          {
            "k": "長さ",
            "v": "約400m（桂橋〜滝下橋）"
          },
          {
            "k": "見どころ",
            "v": "円形の竹ベンチ／夜のライトアップ"
          },
          {
            "k": "足元",
            "v": "石畳・浴衣でも歩きやすい"
          },
          {
            "k": "料金",
            "v": "散策自由"
          }
        ],
        "transit": "「修善寺温泉」バス停から徒歩約5分、桂橋と滝下橋のあいだ"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "独鈷の湯",
        "cuisine": "史跡（湯）",
        "area": "静岡県伊豆市修善寺",
        "purpose": "修善寺温泉発祥の地とされる、川の中に湧く象徴の湯",
        "desc": "桂川の流れの中に小屋掛けされた湯で、弘法大師が手にした仏具・独鈷杵で川の岩を打って湧かせたという発祥伝説を持つ。町のシンボルとして長く親しまれてきたが、現在は見学のみで入浴や足湯としての利用はできない点に注意したい。それでも川面すれすれに湧く湯気と、橋の上から眺める佇まいは町の原風景そのもの。湯に触れたいなら、すぐそばに無料の足湯「河原湯」が設けられている。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Tokko-no-yu_20110919.jpg/1280px-Tokko-no-yu_20110919.jpg"
        ],
        "specs": [
          {
            "k": "由来",
            "v": "弘法大師の発祥伝説"
          },
          {
            "k": "現状",
            "v": "見学のみ・入浴/足湯は不可"
          },
          {
            "k": "近くの足湯",
            "v": "河原湯（無料）"
          },
          {
            "k": "立地",
            "v": "桂川の川中"
          }
        ],
        "transit": "「修善寺温泉」バス停から徒歩約3分、桂川の川中"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "桂川と恋の橋めぐり",
        "cuisine": "川・橋",
        "area": "静岡県伊豆市修善寺",
        "purpose": "町を貫く清流と、それを結ぶ朱塗りの小橋を渡り歩く",
        "desc": "温泉街の真ん中を流れる桂川には、渡月橋・虎渓橋・桂橋・楓橋・滝下橋という五つの橋が架かり、それぞれに縁結びや夫婦円満など別々の言い伝えが添えられている。橋ごとに川幅も眺めも変わるので、上流から下流へ順に渡っていくと町の地形が体でわかる。二代将軍・頼家と桂という女性の物語が新歌舞伎の舞台になった川でもあり、朱の欄干と竹の緑、川面の湯気が一枚の絵のように重なる。橋から橋への移動そのものが、この町のさんぽの背骨になる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/7/70/Katsura_bridge_20110919_a.jpg"
        ],
        "specs": [
          {
            "k": "橋の数",
            "v": "5つ（渡月・虎渓・桂・楓・滝下）"
          },
          {
            "k": "歩き方",
            "v": "上流〜下流を順に"
          },
          {
            "k": "見どころ",
            "v": "朱の欄干と川面の湯気"
          },
          {
            "k": "料金",
            "v": "散策自由"
          }
        ],
        "transit": "温泉街中心部を貫流、各橋は徒歩で巡れる"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "指月殿と源頼家の墓",
        "cuisine": "史跡",
        "area": "静岡県伊豆市修善寺",
        "purpose": "源氏の悲劇を伝える、伊豆最古とされる木造仏堂",
        "desc": "桂川を挟んで修禅寺の向かいにある小さな仏堂で、北条政子が非業の死を遂げた我が子・頼家の冥福を祈って建てたと伝わる。堂内には宋から伝来したという経巻を手にした釈迦如来坐像が安置され、伊豆でも古い木造仏堂のひとつに数えられる。すぐ脇には二十三歳でこの地に倒れた頼家の墓が静かに並び、賑わう温泉街のすぐ裏手とは思えない沈んだ空気が流れている。湯の華やぎと歴史の翳りが背中合わせにある——それが修善寺という町の奥行きだ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/181124_Shigetsuden_Izu_Shizuoka_pref_Japan02s8.jpg/1280px-181124_Shigetsuden_Izu_Shizuoka_pref_Japan02s8.jpg"
        ],
        "specs": [
          {
            "k": "建立",
            "v": "北条政子が頼家供養に"
          },
          {
            "k": "本尊",
            "v": "釈迦如来坐像（経巻を持つ）"
          },
          {
            "k": "隣接",
            "v": "源頼家の墓"
          },
          {
            "k": "拝観",
            "v": "境内自由（公式で確認）"
          }
        ],
        "transit": "「修善寺温泉」バス停から徒歩約7分、修禅寺の対岸・鹿山の麓"
      },
      {
        "rank": "SPOT 06",
        "rankNum": 6,
        "name": "修善寺虹の郷",
        "cuisine": "テーマパーク",
        "area": "静岡県伊豆市修善寺",
        "purpose": "町歩きの締めに足を延ばす、自然のなかの大型公園",
        "desc": "温泉街の喧騒から少し離れた丘陵に広がる広大なテーマパークで、英国村やカナダ村、日本庭園などが園内を走るミニ鉄道で結ばれている。修善寺の市街さんぽが「川と竹と湯」の凝縮された距離感だとすれば、ここは一転して景色が開け、季節ごとに紅葉やもみじのライトアップが園内を染める。歩き疲れた足にミニ鉄道がちょうどよく、温泉町の余韻に自然の風景を一枚足したいときに向く。開園は時期が限られ料金も改定されることがあるので、訪問前に公式の最新案内を必ず確認しておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/b/b4/Niji-no-Sato-ROMNEY-SL_Izu.JPG"
        ],
        "specs": [
          {
            "k": "見どころ",
            "v": "英国村・日本庭園・ミニ鉄道"
          },
          {
            "k": "営業",
            "v": "期間・休園日あり（公式確認）"
          },
          {
            "k": "所在",
            "v": "伊豆市修善寺4279-3"
          },
          {
            "k": "料金",
            "v": "入園有料（最新は公式で）"
          }
        ],
        "transit": "修善寺駅または温泉街からバス、温泉場中心部から少し離れた高台"
      }
    ],
    "sideArticles": [
      {
        "t": "浜松・浜名湖で立ち寄りたい。城と湖と砂丘",
        "h": "/feature/shizuoka-hamamatsu-hamanako",
        "img": "https://upload.wikimedia.org/wikipedia/commons/0/06/Bentenjima_beach_park.JPG"
      },
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      }
    ],
    "quote": "川音と下駄の音が、町を歩く速度を決めてくれる。",
    "quoteCite": "マチノワ編集部",
    "closing": "どこから歩き出しても、結局は桂川に戻ってくる。それがこの町の地形であり、さんぽの作法でもある。橋を一本ずつ渡り、湯に手を浸し、竹の影で立ち止まる——順路を急かされない時間こそが温泉街の贅沢だ。なお虹の郷など各施設の料金や営業日は季節で動くので、出かける前に公式の案内で今の情報を一度たしかめておくと安心して歩ける。湯上がりの火照りを夕風に冷ましながら、もう一度川沿いを引き返すまでが、修善寺の一日だ。"
  },
  "fukuoka-kokura-castle": {
    "id": "fukuoka-kokura-castle",
    "no": "G9-17",
    "articleType": "course",
    "kicker": "KOKURA CASTLE",
    "title": "小倉城・城下 半日モデルコース。天守と旦過市場",
    "titleHTML": "小倉城・城下 半日モデルコース。<br>天守と旦過市場",
    "subtitle": "紫川の橋を渡り、天守から城下の台所へ",
    "lede": "北九州市の中心、小倉は「川と城が街の真ん中に同居する」めずらしい顔を持つ。紫川がオフィス街を貫き、その西岸に天守が立つ。そこから南東へ、紫川に注ぐ神嶽川のほとりまで歩けば、大正期に育った市場が今も街の台所として動いている。観光地として整いすぎず、生活のにおいが残るのがこの街らしさだ。今回の半日コースは、その「川を境にした二つの小倉」を一本の線でつなぐことをねらった。城側で歴史と庭の静けさにふれ、橋を渡って城下の食へ降りていく――昼前に城をのぼり、昼どきに市場で胃袋を満たす流れで組んでいる。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Kokura_Castle_2024-09-04.jpg/1280px-Kokura_Castle_2024-09-04.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "八坂神社（小倉祇園 八坂神社）",
        "cuisine": "神社",
        "area": "福岡県北九州市小倉北区城内",
        "purpose": "9:30ごろ。城をのぼる前に、城内に鎮座する総鎮守へ参拝してコースを始める",
        "desc": "1617年に細川忠興が小倉藩の総鎮守として創建し、のち昭和に小倉城内の現在地へ移された、城と一体の歴史を持つ神社。毎年7月に城下を太鼓の音で揺らす小倉祇園祭は、この社の夏祭りとして400年余り続いてきた。城の石垣を背にした境内は朝のうちは人も少なく、正門に立つ花崗岩の石鳥居は室町期の作と伝わり福岡県の指定文化財。木造の東楼門とあわせ、ふだんは静かなこの場所が夏には街の熱気の中心になることが、据えられた祭具からも伝わってくる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/140721_Yasaka-jinja_Kitakyushu_Japan02s3.jpg/1280px-140721_Yasaka-jinja_Kitakyushu_Japan02s3.jpg"
        ],
        "specs": [
          {
            "k": "創建",
            "v": "1617年（元和3年）"
          },
          {
            "k": "例祭",
            "v": "小倉祇園祭（7月）"
          },
          {
            "k": "参拝",
            "v": "境内自由・無料"
          }
        ],
        "transit": "JR西小倉駅から徒歩約5分、JR小倉駅から徒歩約15分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "小倉城",
        "cuisine": "城・天守",
        "area": "福岡県北九州市小倉北区城内",
        "purpose": "城の開館に合わせて。コースの主役。天守に上がって関門海峡まで街を見渡す",
        "desc": "細川忠興が築き、のち小笠原氏の居城となった城で、最上階が下層より大きく張り出す「唐造り」と呼ばれる珍しい天守の姿が目を引く。現在の天守は1959年の再建で2019年に展示が一新され、城下の暮らしを体感する仕掛けや床几に腰かけて天守を眺める空間が加わった。最上階からは紫川とビル街の向こうに関門海峡まで見通せ、海と街道が交わる要衝にこの城が置かれた理由が一目でわかる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Kokura_Castle_2024-09-04.jpg/1280px-Kokura_Castle_2024-09-04.jpg"
        ],
        "specs": [
          {
            "k": "天守",
            "v": "1959年再建（2019年リニューアル）"
          },
          {
            "k": "営業",
            "v": "季節で開館時間が変わる（訪問前に公式確認）"
          },
          {
            "k": "入場料",
            "v": "一般500円程度（最新は公式で確認を）"
          }
        ],
        "transit": "JR西小倉駅から徒歩約5分、JR小倉駅から徒歩約15分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "小倉城庭園",
        "cuisine": "日本庭園・資料館",
        "area": "福岡県北九州市小倉北区城内",
        "purpose": "天守のあと。喧騒から離れ、書院と池泉の静けさでひと呼吸おく",
        "desc": "小倉藩主・小笠原氏の下屋敷跡に整えられた庭園で、武家の書院造りを再現した座敷から池と石組みを正面に望める構えになっている。城の展示が「見て体感する」場なのに対し、こちらは縁側に座って庭を眺める「とどまる」時間に向く。書院には抹茶をいただける立礼席もあり、天守を見上げてきた足を畳の上で休めると、同じ城内でも気配ががらりと変わるのを感じられる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/140721_Kokura_Castle_Garden_Kitakyushu_Japan15s3.jpg/1280px-140721_Kokura_Castle_Garden_Kitakyushu_Japan15s3.jpg"
        ],
        "specs": [
          {
            "k": "所在",
            "v": "小倉北区城内1-2"
          },
          {
            "k": "入場料",
            "v": "大人350円程度（変更の場合あり・公式確認）"
          },
          {
            "k": "見どころ",
            "v": "書院・池泉庭園・立礼席の抹茶"
          }
        ],
        "transit": "小倉城天守のすぐ東隣（JR西小倉駅から徒歩約5分）"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "リバーウォーク北九州・紫川",
        "cuisine": "複合施設・河畔",
        "area": "福岡県北九州市小倉北区室町",
        "purpose": "正午すぎ。城側から市場側へ移る橋渡し。川越しに振り返って小倉城を眺める",
        "desc": "紫川の西岸、小倉城・勝山公園と地続きに立つ、赤や黄の壁が連なる複合施設で、その名は「川沿いを歩いてほしい」という発想から付けられた。城と一体的に整備された一帯で、ここを抜けてから紫川の橋を東へ渡るのが二つの小倉をつなぐ動線になる。市が進めた紫川の橋づくりで鴎外橋は「水鳥の橋」として架けられ、橋の上から城側を振り返ると天守と庭の緑、そして都市のビルが一枚におさまる――川が街を分けつつ結んでいることが、この眺めでよくわかる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Murasakigawa_River_and_Riverwalk_Kitakyushu_from_Nakanohashi_Bridge.JPG/1280px-Murasakigawa_River_and_Riverwalk_Kitakyushu_from_Nakanohashi_Bridge.JPG"
        ],
        "specs": [
          {
            "k": "所在",
            "v": "小倉北区室町1-1-1"
          },
          {
            "k": "営業",
            "v": "店舗により10:00〜（営業時間は要確認）"
          },
          {
            "k": "ねらい",
            "v": "川越しの城の眺めと食事休憩"
          }
        ],
        "transit": "JR西小倉駅から徒歩約3分、小倉城と同じ岸を歩いてすぐ"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "旦過市場",
        "cuisine": "市場・商店街",
        "area": "福岡県北九州市小倉北区魚町",
        "purpose": "正午すぎ。コースの締め。城下の台所で遅めの昼と食べ歩きを楽しむ",
        "desc": "大正期に神嶽川沿いの船着きから育った「北九州の台所」で、鮮魚・精肉・青果・惣菜などの店が細い通りに軒を連ねる。2022年の火災を経て被災区画は仮設の「旦過青空市場」での営業へ移り、恒久施設の再建が進む途中にある今の姿そのものが見どころでもある。サバやイワシを糠みそで炊いた郷土料理「ぬか炊き」は店ごとに味が違い、湯気の立つ総菜を片手に路地を抜ける時間は、整った観光地では味わえない生活の手ざわりがある。なお営業区画や店舗の様子は復興の進み具合で変わるため、最新は旦過市場の公式情報で確かめておくとよい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Tanga_Market_20170505_142836.jpg/1280px-Tanga_Market_20170505_142836.jpg"
        ],
        "specs": [
          {
            "k": "成り立ち",
            "v": "大正期からの「北九州の台所」"
          },
          {
            "k": "名物",
            "v": "ぬか炊き（サバ・イワシ）"
          },
          {
            "k": "営業",
            "v": "店舗ごとに異なる（日曜休みの店が多い・要確認）"
          }
        ],
        "transit": "北九州モノレール旦過駅すぐ、JR小倉駅から徒歩約10分"
      }
    ],
    "sideArticles": [
      {
        "t": "宗像大社を歩く。海の正倉院と神宿る島の総社",
        "h": "/feature/fukuoka-munakata-taisha",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Hetsu-gu_of_Munakata-taisha-2.jpg/1280px-Hetsu-gu_of_Munakata-taisha-2.jpg"
      },
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      }
    ],
    "quote": "紫川の一本の流れが、天守の街と市場の街を分けながら、つないでいる。",
    "quoteCite": "マチノワ編集部",
    "closing": "9:30ごろ西小倉駅から歩きはじめ、まず城のたもとの八坂神社で手を合わせる。城の開館に合わせて天守へ上がり、関門海峡まで見渡してから、隣の小倉城庭園で茶席の静けさにひと息。城と同じ岸に立つリバーウォーク北九州を抜け、正午を回ったら紫川の橋を東へ渡って神嶽川沿いの旦過市場へ向かう。湯気の立つぬか炊きや惣菜で遅めの昼をとり、食べ歩きながら市場の路地を抜ければ、午後の早いうちにはモノレール旦過駅か小倉駅へ戻れる。半日でも、城・庭・川・市場という小倉の四つの表情をひと通り味わえる行程だ。各施設の開館時間や拝観料、市場各店の営業日は季節や曜日で変わることがあるので、時刻を決めて回るなら出かける前に小倉城や各施設の公式情報で確かめておくと安心して動ける。"
  },
  "fukuoka-munakata-taisha": {
    "id": "fukuoka-munakata-taisha",
    "no": "G9-18",
    "articleType": "guide",
    "kicker": "MUNAKATA",
    "title": "宗像大社を歩く。海の正倉院と神宿る島の総社",
    "titleHTML": "宗像大社を歩く。<br>海の正倉院と神宿る島の総社",
    "subtitle": "福岡・宗像｜MUNAKATA さんぽ",
    "lede": "東郷の駅でバスを降り、田島の集落へ向かって緩やかに上っていくと、潮の匂いがどこからともなく混じってくる。ここは海の神を祀る土地なのだと、まだ鳥居も見えないうちから体が思い出す。宗像という名は、玄界灘の沖合に浮かぶ沖ノ島、その手前の大島、そして本土の田島という三つの場所に祀られた女神の物語と分かちがたい。今日歩くのは本土の社、辺津宮を起点にした半日ほどの道のりだ。木立の暗がり、苔の匂い、川面の光――順に書きとめていきたい。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Hetsu-gu_of_Munakata-taisha-2.jpg/1280px-Hetsu-gu_of_Munakata-taisha-2.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "宗像大社 辺津宮",
        "cuisine": "神社",
        "area": "福岡県宗像市田島",
        "purpose": "三女神を祀る総社の本土の宮。歩き始めの起点",
        "desc": "太鼓橋を渡って本殿・拝殿の前に立つと、まずその朱の落ち着いた色合いに目がいく。だがこの社の面白さは、本殿の背後に回ったときに現れる。すぐ後ろに第二宮と第三宮が並んでいて、それぞれ沖ノ島の沖津宮、大島の中津宮の御分霊を祀る。海を渡れない日でも、ここに立てば三つの宮すべてに手を合わせられる――本土・大島・沖ノ島という三点の信仰を一か所に畳み込んだ造りそのものが、宗像の祈りのかたちを物語っている。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Hetsu-gu_of_Munakata-taisha-2.jpg/1280px-Hetsu-gu_of_Munakata-taisha-2.jpg"
        ],
        "specs": [
          {
            "k": "参拝時間",
            "v": "9:00〜17:00ごろ（最新は公式の案内で確認を）"
          },
          {
            "k": "祭神",
            "v": "市杵島姫神ほか宗像三女神"
          }
        ],
        "transit": "JR鹿児島本線・東郷駅から西鉄バスで約20分、宗像大社前バス停すぐ"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "宗像大社 神宝館",
        "cuisine": "展示施設",
        "area": "福岡県宗像市田島（辺津宮境内）",
        "purpose": "沖ノ島から出土した奉献品を収める収蔵展示施設",
        "desc": "境内の一角にある建物に入ると、外の明るさが嘘のように照明が沈み、ガラスの向こうで金銅製の馬具や金製の指輪、ペルシャ由来とされるガラス碗の破片が静かに光る。立ち入りの厳しく制限された沖ノ島の祭祀跡から見つかった奉献品はおよそ八万点、そのすべてが国宝に指定され、ここに集められている。沖ノ島が『海の正倉院』と呼ばれる理由を、解説ではなく実物の手触りで理解させてくれる場所だ。料金や開館の時間は変わることがあるので、訪問前に公式サイトで確かめておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Munakata-taisha_museum.jpg/1280px-Munakata-taisha_museum.jpg"
        ],
        "specs": [
          {
            "k": "開館",
            "v": "9:00〜16:30（最終入館16:00）／拝観料あり"
          },
          {
            "k": "見どころ",
            "v": "沖ノ島出土の国宝群（約8万点）"
          }
        ],
        "transit": "辺津宮の境内、本殿前から徒歩すぐ"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "宗像大社 高宮祭場",
        "cuisine": "祭場",
        "area": "福岡県宗像市田島（宗像山中腹）",
        "purpose": "社殿を持たない古代祭祀の場。辺津宮の起源",
        "desc": "本殿の横手から続く参道に入ると、急に空気が湿って、足音だけが大きく響くようになる。杉木立の坂を上りきった先にあるのは、社殿でも建物でもなく、玉垣に囲まれた剥き出しの地面だった。ここは市杵島姫神が降りたとされる地で、屋根も柱もないまま、神を木々や土そのものに見出した古い祭りのかたち――神籬の祭場が、現代まで途切れずに残る。何もないことが、かえってこの社の最も古い記憶を伝えている。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Praying_place_for_Takamiya-Saijo_in_Munakata_Grand_Shrine_%28Hetsu_Shrine%29.JPG/1280px-Praying_place_for_Takamiya-Saijo_in_Munakata_Grand_Shrine_%28Hetsu_Shrine%29.JPG"
        ],
        "specs": [
          {
            "k": "形式",
            "v": "社殿のない屋外の古代祭場"
          },
          {
            "k": "参道",
            "v": "辺津宮から徒歩約7分の上り"
          }
        ],
        "transit": "辺津宮本殿の脇から高宮参道へ。杉木立を約7分上る"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "鎮国寺",
        "cuisine": "寺院",
        "area": "福岡県宗像市吉田",
        "purpose": "宗像大社とゆかりの深い真言宗の古刹",
        "desc": "社をいったん離れ、吉田の集落の方へ坂を下って上り返すと、山裾に鎮国寺の門が現れる。空海が唐からの帰途に開いたと伝わる真言宗御室派の別格本山で、かつては宗像大社の神宮寺、つまり社と一体で祈りを担った寺だった。神と仏が分かれる前のこの土地の信仰の姿が、社と寺がこれだけ近い距離に並ぶ景色によく残っている。本尊の不動明王立像は秘仏で、御開帳は年に一度の四月二十八日に限られる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/%E9%8E%AE%E5%9B%BD%E5%AF%BA%E3%81%AE%E6%8B%9D%E6%AE%BF.jpg/1280px-%E9%8E%AE%E5%9B%BD%E5%AF%BA%E3%81%AE%E6%8B%9D%E6%AE%BF.jpg"
        ],
        "specs": [
          {
            "k": "宗派",
            "v": "真言宗御室派・別格本山"
          },
          {
            "k": "本尊",
            "v": "不動明王立像（秘仏／毎年4月28日御開帳）"
          }
        ],
        "transit": "宗像大社前バス停から徒歩約15分、または東郷駅からタクシーで約15分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "釣川",
        "cuisine": "河川",
        "area": "福岡県宗像市（神湊河口へ）",
        "purpose": "社と海を結ぶ宗像の母なる川。歩き終わりの川辺",
        "desc": "宗像盆地をゆるやかに横切る釣川は、城山あたりに源を発して北西へ十六キロほど下り、神湊で玄界灘に注ぐ。この川がつくった沖積地には縄文・弥生の遺跡が点々と残り、古くから人が暮らし、海と社を行き来してきた道筋でもあった。橋の上から下流を眺めると、川の先に港が、その沖に大島が、さらに見えない沖ノ島が連なっているのが地図のように想像できる。社で手を合わせた方角と、この川が流れていく方角は、同じ海でつながっている。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Tsurikawa_River_from_Satsukibashi_Bridge_5.jpg/1280px-Tsurikawa_River_from_Satsukibashi_Bridge_5.jpg"
        ],
        "specs": [
          {
            "k": "延長",
            "v": "約16.3km、神湊で玄界灘へ注ぐ"
          },
          {
            "k": "歩き方",
            "v": "川沿いに河口・神湊渡船ターミナルへ"
          }
        ],
        "transit": "宗像大社前バス停から神湊方面へ。川沿いに河口の神湊まで"
      }
    ],
    "sideArticles": [
      {
        "t": "小倉城・城下 半日モデルコース。天守と旦過市場",
        "h": "/feature/fukuoka-kokura-castle",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Kokura_Castle_2024-09-04.jpg/1280px-Kokura_Castle_2024-09-04.jpg"
      },
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      }
    ],
    "quote": "三つの宮は海でつながっている。本土に立って、見えない島の方角へ手を合わせる。",
    "quoteCite": "マチノワ編集部",
    "closing": "釣川の橋の上で立ち止まると、半日歩いた道がひと続きの線になってよみがえってきた。社の朱、神宝館の沈んだ照明に浮かぶ金、参道の杉木立、寺の不動の眼差し、そして川が運んでいく光。宗像の信仰は、本土の社で完結せず、いつも見えない海の彼方を指していた。手を合わせる先に島があり、島の向こうに大陸との海の道があった、という距離感が、歩き終えてようやく腑に落ちる。日が傾くと川面の色が変わる。バスの時刻を確かめながら、もう一度だけ沖の方を見て、来た道を戻ることにした。なお拝観の時間や料金は折々に見直されるので、出かける前に各施設の公式の案内に目を通しておくと安心だ。"
  },
  "hokkaido-furano-biei": {
    "id": "hokkaido-furano-biei",
    "no": "G9-19",
    "articleType": "guide",
    "kicker": "FURANO BIEI",
    "title": "富良野・美瑛。花畑の丘と青い池をめぐる",
    "titleHTML": "富良野・美瑛。<br>花畑の丘と青い池をめぐる",
    "subtitle": "FURANO BIEI ─ 花畑と丘の自然ドライブ",
    "lede": "富良野盆地から美瑛の丘へ抜ける数十キロは、ハンドルを握る人のための風景だ。ラベンダーが帯になって紫に染まるのは六月下旬から八月のはじめにかけて。その前後も、ポピーやサルビアが畑を塗り替え、麦やビートの緑が丘のうねりをなぞる。ここでは花の色そのものが地形を見せてくれる──平らに見えた土地が、実は波打っていたことに、満開の畝を目で追って初めて気づく。車を停めて坂を上り、また走り出す。そのリズムを五つの場所でつないでいく旅を組んでみた。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/%E3%83%95%E3%82%A1%E3%83%BC%E3%83%A0%E5%AF%8C%E7%94%B0%EF%BC%88Farm_Tomita%EF%BC%89_-_panoramio_%284%29.jpg/1280px-%E3%83%95%E3%82%A1%E3%83%BC%E3%83%A0%E5%AF%8C%E7%94%B0%EF%BC%88Farm_Tomita%EF%BC%89_-_panoramio_%284%29.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "ファーム富田",
        "cuisine": "観光農園",
        "area": "北海道中富良野町北星",
        "purpose": "富良野のラベンダーを語るならまずここ。色の帯を浴びて旅の調子を整える起点に",
        "desc": "戦後の早い時期からラベンダー栽培を続けてきた農園で、一度は香料需要の縮小で畑を失いかけながらも紫の景色を守り抜いた歴史を持つ。だからこの丘の紫には、ただ美しいだけでない粘りのようなものがにじむ。濃紫早咲などラベンダー数種を畑ごとに植え分け、開花のピークを少しずつずらしてあるため、六月下旬から八月初旬まで見頃が続くのもこの農園ならでは。入園は無料で、ラベンダーソフトクリームを片手に畝の間を歩ける。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/%E3%83%95%E3%82%A1%E3%83%BC%E3%83%A0%E5%AF%8C%E7%94%B0%EF%BC%88Farm_Tomita%EF%BC%89_-_panoramio_%284%29.jpg/1280px-%E3%83%95%E3%82%A1%E3%83%BC%E3%83%A0%E5%AF%8C%E7%94%B0%EF%BC%88Farm_Tomita%EF%BC%89_-_panoramio_%284%29.jpg"
        ],
        "specs": [
          {
            "k": "入園料",
            "v": "無料"
          },
          {
            "k": "ラベンダー見頃",
            "v": "6月下旬〜8月上旬（年により前後）"
          },
          {
            "k": "確認先",
            "v": "営業時間・開花状況は公式サイトで最新を"
          }
        ],
        "transit": "JR富良野線ラベンダー畑駅から徒歩約7分。夏の週末は富良野駅からノロッコ号が臨時運行"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "かんのファーム",
        "cuisine": "花と野菜の生産農園",
        "area": "北海道上富良野町西12線北36号 美馬牛峠",
        "purpose": "富良野と美瑛の境を越える峠で、坂一面の花を見上げる中継地点",
        "desc": "ファーム富田から美瑛へ向かう国道237号が美馬牛峠を上りきるあたりに、斜面ごと花でくるんだような畑が現れる。ラベンダーにサルビア、クレオメなど三十種以上を帯状に植え分けてあり、坂の傾斜がそのまま花の階段に見えるのがこの農園の持ち味だ。平地の花畑では味わえない、見上げる構図が生まれる。農家が営む直売もあり、その場で掘ったじゃがいもやとうもろこしが並ぶ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/%E3%81%8B%E3%82%93%E3%81%AE%E3%83%95%E3%82%A1%E3%83%BC%E3%83%A0_20120905_-_panoramio.jpg/1280px-%E3%81%8B%E3%82%93%E3%81%AE%E3%83%95%E3%82%A1%E3%83%BC%E3%83%A0_20120905_-_panoramio.jpg"
        ],
        "specs": [
          {
            "k": "入園料",
            "v": "無料"
          },
          {
            "k": "開園期間",
            "v": "6月中旬〜10月中旬ごろ"
          },
          {
            "k": "確認先",
            "v": "開花や営業日は公式・観光協会の情報で確認を"
          }
        ],
        "transit": "国道237号沿い、美馬牛峠の坂の上。JR美馬牛駅から徒歩約20分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "四季彩の丘",
        "cuisine": "展望花畑",
        "area": "北海道美瑛町新星第三",
        "purpose": "美瑛側に入って最初の大きな花畑。丘全体を使った色のうねりを体感する",
        "desc": "なだらかな丘の起伏をそのままキャンバスにした花畑で、サルビアやマリーゴールドなどを色ごとに帯状に並べ、丘のカーブに沿って縞模様が波打つ。地形と植栽が一体になった眺めは、平地の花壇では決して出せないもの。トラクターが牽くバスで畑を一周でき、坂の頂からは十勝岳連峰まで見渡せる。アルパカ牧場が併設されているのも子ども連れには嬉しい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/%E5%B1%95%E6%9C%9B%E8%8A%B1%E7%95%91_%E5%9B%9B%E5%AD%A3%E5%BD%A9%E3%81%AE%E4%B8%98.jpg/1280px-%E5%B1%95%E6%9C%9B%E8%8A%B1%E7%95%91_%E5%9B%9B%E5%AD%A3%E5%BD%A9%E3%81%AE%E4%B8%98.jpg"
        ],
        "specs": [
          {
            "k": "入園料",
            "v": "盛夏（7〜9月ごろ）は有料、ほかは無料の運用。最新は要確認"
          },
          {
            "k": "アクセス",
            "v": "美瑛駅から車で約20分"
          },
          {
            "k": "確認先",
            "v": "料金区分・開園期間は公式サイトでご確認を"
          }
        ],
        "transit": "JR富良野線美馬牛駅が最寄り（徒歩は坂道で20分超）。美瑛駅から車で約20分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "パッチワークの路",
        "cuisine": "丘の田園風景・ドライブルート",
        "area": "北海道美瑛町北瑛地区",
        "purpose": "花畑から農村風景へ。畑そのものが描く色の継ぎ接ぎを丘越しに眺める",
        "desc": "区画ごとに小麦や豆、ビート、じゃがいもなどを作り分けた畑が、緑や黄や茶の四角を縫い合わせたように見えることからこの名がついた農道一帯。花壇ではなく作物の畑が織りなす景色なので、季節と年で柄が刷新されるのがこの場所の面白さだ。日産スカイラインのCMで知られるケンとメリーの木、たばこのパッケージになったセブンスターの木など、一本の木が丘の主役になる名所が点在する。あくまで生産者の農地のため、畑には立ち入らず路肩マナーを守って眺めたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Ken_%26_Marry_tree%2C_Sep._2011.jpg/1280px-Ken_%26_Marry_tree%2C_Sep._2011.jpg"
        ],
        "specs": [
          {
            "k": "料金",
            "v": "見学無料（公共の農道）"
          },
          {
            "k": "回り方",
            "v": "車・レンタサイクルで点在する木々を巡る"
          },
          {
            "k": "配慮",
            "v": "農地内立ち入り禁止。駐停車は所定の場所で"
          }
        ],
        "transit": "JR美瑛駅の北〜北西側に広がる農道。車での周遊が前提のエリア"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "白金 青い池",
        "cuisine": "自然景観・池",
        "area": "北海道美瑛町白金",
        "purpose": "ドライブの締めくくり。花の暖色から一転、ひんやりした青の水面で旅を閉じる",
        "desc": "十勝岳の防災工事でできた堰堤に水が溜まり、火山由来の成分を含んだ水が光を散らして青白く発色する人工的な偶然の産物。その水底から立ち枯れたカラマツが灰色の幹を突き出し、青の中に静かな線を引くさまは、富良野の花畑とは対極の無音の風景だ。天気や時間帯、見る角度で青の濃さが変わるので、晴天の午前が比較的見やすいとされる。冬は積雪で水面が隠れる代わりに、夜のライトアップが行われる時季もある。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Aoi-ike_20230712_12.jpg/1280px-Aoi-ike_20230712_12.jpg"
        ],
        "specs": [
          {
            "k": "入場",
            "v": "見学無料（駐車場は有料・普通車1回500円目安）"
          },
          {
            "k": "アクセス",
            "v": "美瑛駅から約18km、白金温泉手前"
          },
          {
            "k": "確認先",
            "v": "駐車時間やライトアップ期間は美瑛町の公式情報で確認を"
          }
        ],
        "transit": "JR美瑛駅から約18km。白金温泉手前、車でのアクセスが基本"
      }
    ],
    "sideArticles": [
      {
        "t": "登別温泉。地獄谷と湯けむりの渓",
        "h": "/feature/hokkaido-noboribetsu-onsen",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Noboribetu_Jigokudani%EF%BC%8F%E7%99%BB%E5%88%A5%E5%9C%B0%E7%8D%84%E8%B0%B7%EF%BC%92_-_panoramio.jpg/1280px-Noboribetu_Jigokudani%EF%BC%8F%E7%99%BB%E5%88%A5%E5%9C%B0%E7%8D%84%E8%B0%B7%EF%BC%92_-_panoramio.jpg"
      },
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      }
    ],
    "quote": "花の色が、丘のかたちを教えてくれる。",
    "quoteCite": "マチノワ編集部",
    "closing": "花は咲く時期も色も毎週移ろうので、何が見頃かは各園や美瑛・富良野の観光協会サイトで出発前にのぞいておくと、立ち寄る順番を決めやすい。入園や駐車の条件も園ごとに違い、季節で変わることがある。富良野の紫から美瑛の青へ──色を追って走るうちに、丘そのものを好きになっているはずだ。文・"
  },
  "hokkaido-noboribetsu-onsen": {
    "id": "hokkaido-noboribetsu-onsen",
    "no": "G9-20",
    "articleType": "guide",
    "kicker": "NOBORIBETSU",
    "title": "登別温泉。地獄谷と湯けむりの渓",
    "titleHTML": "登別温泉。<br>地獄谷と湯けむりの渓",
    "subtitle": "活火山が吐く蒸気を、足の裏まで連れて歩く",
    "lede": "登別温泉が他の湯どころと決定的に違うのは、湯の出どころを「観光できてしまう」ことだ。多くの温泉地は源泉を建物の奥に隠すが、ここでは爆裂火口跡がむき出しのまま渓をつくり、灰白色の岩肌から蒸気が音を立てて噴き上がる。クッタラ火山の活動がこしらえた地形の上に湯の街が乗っているので、地獄谷を覗き、沼から流れ出す川に足を浸し、間欠泉の真下に立つ——その一連が、そのまま「お湯がどこから来るのか」をたどる行為になる。9種もの泉質が湧くのも、この荒々しい地下を持つからこそ。今回はその湯の源を地形ごと味わう道を組んだ。歩くほど硫黄が濃くなる、温泉地そのものが主役の一帯である。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Noboribetu_Jigokudani%EF%BC%8F%E7%99%BB%E5%88%A5%E5%9C%B0%E7%8D%84%E8%B0%B7%EF%BC%92_-_panoramio.jpg/1280px-Noboribetu_Jigokudani%EF%BC%8F%E7%99%BB%E5%88%A5%E5%9C%B0%E7%8D%84%E8%B0%B7%EF%BC%92_-_panoramio.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "登別地獄谷",
        "cuisine": "火山地形・遊歩道",
        "area": "北海道登別市登別温泉町",
        "purpose": "湯の源を真上から見下ろす",
        "desc": "直径約450メートルの爆裂火口跡が、そのまま温泉地の源泉地帯になっている。灰褐色の岩肌のあちこちから蒸気と熱泥が噴き出し、遊歩道の先にある鉄泉池では灰色の湯がぼこぼこと沸く様子を間近で見られる。ここから湧く湯が街の宿へ引かれているため、登別の湯に浸かる前にその出どころを覗ける点がこの谷ならではだ。入場は無料で時間の制限もなく、日没後は遊歩道がライトアップされて岩肌の起伏が浮かび上がる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Noboribetu_Jigokudani%EF%BC%8F%E7%99%BB%E5%88%A5%E5%9C%B0%E7%8D%84%E8%B0%B7%EF%BC%92_-_panoramio.jpg/1280px-Noboribetu_Jigokudani%EF%BC%8F%E7%99%BB%E5%88%A5%E5%9C%B0%E7%8D%84%E8%B0%B7%EF%BC%92_-_panoramio.jpg"
        ],
        "specs": [
          {
            "k": "入場料",
            "v": "無料"
          },
          {
            "k": "見学時間",
            "v": "24時間（夜間はライトアップ）"
          },
          {
            "k": "駐車場",
            "v": "地獄谷駐車場 有料（料金は公式で確認）"
          }
        ],
        "transit": "登別温泉バスターミナルから徒歩約10分。JR登別駅からはバスで約15分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "大湯沼",
        "cuisine": "火口湖",
        "area": "北海道登別市登別温泉町",
        "purpose": "煮える灰黒色の沼を見下ろす",
        "desc": "クッタラ火山の水蒸気爆発でできた周囲約1キロのひょうたん型の火口湖で、表面は灰黒色をしている。沼の底では約130度の硫黄泉が噴き出し続けており、表面でも40〜50度ほどあるため、寒い時季には水面いっぱいから湯気が立ちのぼる。地獄谷とはまた違う「沼ごと煮えている」迫力があり、展望台からは色と湯気の濃淡まで見て取れる。ここから流れ出した湯が、次の足湯スポットの川へと続いている。なお沼へ続く探勝路は冬季に通行止めとなる区間があるため、時期によっては公式で経路を確認したい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Oyunuma_in_Noboribetu%EF%BC%8F%E7%99%BB%E5%88%A5%E3%83%BB%E5%A4%A7%E6%B9%AF%E6%B2%BC_-_panoramio.jpg/1280px-Oyunuma_in_Noboribetu%EF%BC%8F%E7%99%BB%E5%88%A5%E3%83%BB%E5%A4%A7%E6%B9%AF%E6%B2%BC_-_panoramio.jpg"
        ],
        "specs": [
          {
            "k": "見学料",
            "v": "無料"
          },
          {
            "k": "沼の温度",
            "v": "表面で約40〜50度"
          },
          {
            "k": "駐車場",
            "v": "大湯沼駐車場 有料"
          }
        ],
        "transit": "登別地獄谷から遊歩道を歩いて片道約20〜30分。大湯沼駐車場（有料）からは展望地まですぐ"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "大湯沼川天然足湯",
        "cuisine": "天然足湯・遊歩道",
        "area": "北海道登別市登別温泉町",
        "purpose": "源泉の川そのものに足を浸す",
        "desc": "大湯沼からあふれ出した湯がそのまま川になって森の中を流れており、その流れに直接足を浸せる。湯船でも蛇口でもなく、地面を流れる温泉の川に座って入る足湯というのは全国でもめずらしく、夏場で42度ほどとやや熱め。硫黄の香りと木立に囲まれた中、湯の温度を足の裏で確かめながら歩いた疲れを抜ける。タオルを一枚持っていくと快適だ。なお足湯へ続く遊歩道は冬季や荒天時に閉鎖されることがあるので、訪問可否は事前に公式で確かめておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Oyunuma_River_Natural_Footbath.jpg/1280px-Oyunuma_River_Natural_Footbath.jpg"
        ],
        "specs": [
          {
            "k": "料金",
            "v": "無料"
          },
          {
            "k": "利用時間",
            "v": "早朝〜日没（自由）"
          },
          {
            "k": "持ち物",
            "v": "タオル推奨"
          }
        ],
        "transit": "大湯沼川沿いの遊歩道入口から徒歩約5〜10分。大湯沼駐車場が起点に近い"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "泉源公園",
        "cuisine": "間欠泉・公園",
        "area": "北海道登別市登別温泉町",
        "purpose": "噴き上がる間欠泉を真下で見る",
        "desc": "温泉街の中心にありながら、約3時間おきに約80度の湯が高さ8メートルほどまで轟音とともに噴き上がる間欠泉を備えた公園。地獄谷から流れる湯を利用したもので、一度噴き出すと50分ほど続くため、待ち時間さえ合えばじっくり見学できる。園内には鬼の金棒を模したモニュメントが立ち、登別名物の鬼伝説とも結びついている。地獄谷や大湯沼で見た地下の力が、街の真ん中で噴き上がる形になっているのが面白い。噴出のタイミングは前後するので、時刻は公式で確認しておくと待ちぼうけを避けられる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/%E6%B3%89%E6%BA%90%E5%85%AC%E5%9C%92_201406.JPG/1280px-%E6%B3%89%E6%BA%90%E5%85%AC%E5%9C%92_201406.JPG"
        ],
        "specs": [
          {
            "k": "入場料",
            "v": "無料"
          },
          {
            "k": "間欠泉の高さ",
            "v": "ピーク時 約8メートル"
          },
          {
            "k": "噴出間隔",
            "v": "約3時間ごと（時刻は公式で確認）"
          }
        ],
        "transit": "登別温泉バスターミナルから徒歩約5分、極楽通りのすぐ近く"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "のぼりべつクマ牧場",
        "cuisine": "動物施設・ロープウェイ",
        "area": "北海道登別市登別温泉町",
        "purpose": "渓を見下ろす山上から街と眺望を俯瞰する",
        "desc": "温泉街からロープウェイで標高約550メートルの四方嶺山頂へ上がると、ヒグマを間近に観察できる牧場が広がる。狙いはクマだけではなく、山上からは太平洋まで見渡す360度のパノラマと、眼下に広がる原生林やコバルトブルーの倶多楽湖の眺めが開け、足元で覗いた渓のあるこの一帯を今度は俯瞰でとらえ直せる点にある。湯の街がどんな地形の上に乗っているかが一望できるので、地獄谷を歩いたあとに上がると地形の理解が立体的になる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Noboribetsu_Bear_Park_ropeway_entrance_2025.jpg/1280px-Noboribetsu_Bear_Park_ropeway_entrance_2025.jpg"
        ],
        "specs": [
          {
            "k": "入園料",
            "v": "大人・小人とも料金は公式で確認（ロープウェイ込）"
          },
          {
            "k": "ロープウェイ",
            "v": "山頂まで約7分（天候により運休あり）"
          },
          {
            "k": "営業時間",
            "v": "季節で変動（最新は公式で確認）"
          }
        ],
        "transit": "登別温泉バスターミナルから徒歩約5分のロープウェイ山麓駅へ。山頂までゴンドラで約7分"
      }
    ],
    "sideArticles": [
      {
        "t": "富良野・美瑛。花畑の丘と青い池をめぐる",
        "h": "/feature/hokkaido-furano-biei",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/%E3%83%95%E3%82%A1%E3%83%BC%E3%83%A0%E5%AF%8C%E7%94%B0%EF%BC%88Farm_Tomita%EF%BC%89_-_panoramio_%284%29.jpg/1280px-%E3%83%95%E3%82%A1%E3%83%BC%E3%83%A0%E5%AF%8C%E7%94%B0%EF%BC%88Farm_Tomita%EF%BC%89_-_panoramio_%284%29.jpg"
      },
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      }
    ],
    "quote": "湯は蛇口の先ではなく、煮え立つ渓の底から来る",
    "quoteCite": "マチノワ編集部",
    "closing": "蒸気と硫黄を浴びて歩いたあとは、極楽通りに戻って好きな宿の湯に身を沈めるのがいい。さっき覗いた渓の底から、この一滴が来たのだと思いながら浸かると、登別の湯は少し違って感じられるはずだ。なお間欠泉の噴出時刻や各施設の営業・料金は季節で動くうえ、大湯沼や足湯へ抜ける自然探勝路は冬季や悪天候で通行止めになる区間もあるので、出かける前にそれぞれの公式情報で最新を押さえておくと安心して回れる。"
  },
  "hiroshima-tomonoura-walk": {
    "id": "hiroshima-tomonoura-walk",
    "no": "G9-21",
    "articleType": "guide",
    "kicker": "TOMONOURA",
    "title": "鞆の浦を歩く。常夜燈と対潮楼、潮待ちの港",
    "titleHTML": "鞆の浦を歩く。常夜燈と対潮楼、<br>潮待ちの港",
    "subtitle": "TOMONOURA / さんぽ",
    "lede": "バスを降りて路地を抜けると、いきなり海が開けた。湾を囲む家並みのあいだから潮の匂いが立ちのぼり、係留された漁船の舳先が陽を受けて揺れている。ここは瀬戸内のちょうど真ん中、東から流れてきた潮と西から来る潮がぶつかって止まる場所だ。だから昔の船は、ここで潮の向きが変わるのをじっと待った。「潮待ちの港」という言葉が、足元の水面を見ているとすっと腑に落ちる。観光地らしい看板の派手さはなく、ただ古い港町がそのまま息をしている。今日はこの湾を、海沿いから高台へ、また町なかへと、気の向くままに歩いてみる。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Fukuzenji_Fukuyama02s4592.jpg/1280px-Fukuzenji_Fukuyama02s4592.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "福禅寺 対潮楼",
        "cuisine": "寺院・客殿（眺望）",
        "area": "広島県福山市鞆町後地",
        "purpose": "海を見下ろす客殿の畳に座り、瀬戸内の額縁を眺める",
        "desc": "常夜燈から少し坂を上ると、海に面した寺の客殿に出る。元禄の頃に建てられた対潮楼は、座敷の柱と柵がそのまま額縁になって、目の前に弁天島と仙酔島を切り取って見せる。江戸時代には朝鮮通信使を迎える迎賓館にあてられ、ここからの眺めを使節の一人が「日東第一形勝」と書き残した。畳に正座してその景色に向き合うと、なぜ彼らが筆をとったのか、理屈ぬきで伝わってくる。坂本龍馬がいろは丸事件の談判をした座敷でもあり、海と歴史が同じ一枚の窓に収まっている。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Fukuzenji_Fukuyama02s4592.jpg/1280px-Fukuzenji_Fukuyama02s4592.jpg"
        ],
        "specs": [
          {
            "k": "拝観時間",
            "v": "平日9:00／土日祝8:00〜17:00（公式で要確認）"
          },
          {
            "k": "拝観料",
            "v": "大人200円ほど"
          }
        ],
        "transit": "「鞆港」バス停から徒歩約5分、常夜燈から海沿いに北へ"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "いろは丸展示館",
        "cuisine": "資料館（蔵を活用）",
        "area": "広島県福山市鞆町鞆",
        "purpose": "港に残る龍馬の足跡と沈没船の引揚物にふれる",
        "desc": "港のへりに戻ると、白壁の古い蔵が一棟、水際に建っている。慶応三年（1867年）、坂本龍馬と海援隊を乗せたいろは丸が鞆の沖で紀州藩の船と衝突して沈み、龍馬たちは町の回船問屋に数日とどまって賠償交渉にあたった。その舞台となった蔵が、いまは展示館になっている。海底から引き揚げられた大理石のドアノブや船の部品が並び、二階には龍馬が身を隠したと伝わる部屋が再現されている。事件が起きたまさにこの港で物を見られるのが、ここの効きどころだ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Irohamaru_tenjikan03b4592.jpg/1280px-Irohamaru_tenjikan03b4592.jpg"
        ],
        "specs": [
          {
            "k": "開館時間",
            "v": "10:00〜17:00"
          },
          {
            "k": "入館料",
            "v": "公式サイトで確認を"
          }
        ],
        "transit": "常夜燈のすぐそば、港に面した白壁の蔵"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "鞆の浦の町並み（西町）",
        "cuisine": "重要伝統的建造物群保存地区",
        "area": "広島県福山市鞆町後地・西町",
        "purpose": "保存地区の細い路地を、行き先を決めずに歩く",
        "desc": "海沿いを離れて一本内側の路地に入ると、空気がふっと静かになる。江戸期の商家や蔵が連なる西町あたりは2017年に重要伝統的建造物群保存地区に選ばれた一画で、漆喰の壁や格子戸が当時のまま続いていく。商業や鍛冶、酒づくりで栄えた港町の名残で、いまも薬味酒「保命酒」を商う古い店が軒を構える。路地は車がやっと一台通れるほどに細く、角を曲がるたびに違う家紋瓦や格子が現れて飽きない。拠点施設の「鞆てらす」をのぞけば、町をどう守ってきたかも分かる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Busy_streets_of_Tomo-no-Ura.jpg/1280px-Busy_streets_of_Tomo-no-Ura.jpg"
        ],
        "specs": [
          {
            "k": "指定",
            "v": "重要伝統的建造物群保存地区（2017年選定）"
          },
          {
            "k": "散策",
            "v": "屋外・自由（個別の店舗は各営業時間に従う）"
          }
        ],
        "transit": "常夜燈から内陸の路地へ。徒歩で散策"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "仙酔島",
        "cuisine": "島・自然景観",
        "area": "広島県福山市鞆町後地（仙酔島）",
        "purpose": "町を抜けて渡船に乗り、対岸の島で潮の景色を歩く",
        "desc": "町歩きの締めに、港の渡船場から船で湾の向かいへ渡る。いろは丸を模したレトロな船「平成いろは丸」がわずか五分ほどで仙酔島へ運んでくれて、おおむね毎時数便あるから時刻表を気にしすぎなくていい。「あまりの美しさに仙人も酔う」と名づけられた島には人家がなく、赤や青の層が縞をなす五色岩で知られる。ただし五色岩へ続く海岸沿いの遊歩道は台風被害で長く通行止めが続いており、立ち入れる範囲は事前に確認しておきたい。それでも船を降りた浜辺からは、対岸からは見えなかった鞆の町並みが海越しにまとまって望め、この島まで来た甲斐がある。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Tomonoura_-01.jpg/1280px-Tomonoura_-01.jpg"
        ],
        "specs": [
          {
            "k": "渡船",
            "v": "往復 大人240円ほど・約5分"
          },
          {
            "k": "運航",
            "v": "おおむね7:00〜21:00頃／毎時数便（遊歩道の通行可否含め公式で確認を）"
          }
        ],
        "transit": "鞆の市営渡船場から渡船「平成いろは丸」で約5分"
      }
    ],
    "sideArticles": [
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      },
      {
        "t": "柴又を歩く。帝釈天の参道と矢切の渡し、寅さんの下町",
        "h": "/feature/tokyo-shibamata-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/0/04/Shibamata_Taishakuten.jpg"
      }
    ],
    "quote": "東の潮と西の潮が出会って止まる湾。船乗りが風と潮を待った時間が、石畳にも家並みにも残っている。",
    "quoteCite": "マチノワ編集部",
    "closing": "夕方の渡船で本土へ戻るころには、湾の輪郭が淡い藍色に沈んでいた。半日歩いただけなのに、この町ではどこにいても海の気配がついて回った。福禅寺の対潮楼まで坂を上れば瀬戸内が額縁に切り取られ、いろは丸展示館をのぞけば海底に眠った船の物語が立ち上がる。西町の路地を曲がれば船道具屋の匂いがして、振り返ると仙酔島が湾の向こうに静かに横たわっていた。急かされるものが何もない、潮を待つための町。次に来るときは、対潮楼の畳に座って何もせず、ただ仙酔島が暮れていくのを眺めていたい。なお拝観時間や渡船の便、各施設の料金は折々に見直されるので、出かける前に公式の案内をのぞいておくと安心だ。"
  },
  "wakayama-koyasan-course": {
    "id": "wakayama-koyasan-course",
    "no": "G9-22",
    "articleType": "course",
    "kicker": "KOYASAN",
    "title": "高野山 半日モデルコース。壇上伽藍から奥之院へ",
    "titleHTML": "高野山 半日モデルコース。<br>壇上伽藍から奥之院へ",
    "subtitle": "朱の塔から二kmの杉木立まで、空海の山を歩いてつなぐ",
    "lede": "標高八〇〇メートルの盆地に大小百を超える寺院が肩を寄せ合う高野山は、一二〇〇年前に空海が真言密教の道場として開いた山上の宗教都市だ。観光地でありながら、いまも僧侶が暮らし朝夕の勤行が続く生きた信仰の場でもある。この記事は、その二つの核――教えの中心である壇上伽藍と、空海が今も瞑想を続けるとされる奥之院――を西から東へ一本の線で結ぶ。塔の朱が杉の闇へと色を変えていく半日の道行きとして組み立てた。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Konpon_Daito.jpg/1280px-Konpon_Daito.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "大門",
        "cuisine": "総門",
        "area": "和歌山・高野町",
        "purpose": "9:00、山に入る最初の一歩としてここから始める",
        "desc": "高野山の西の境を画す高さ約二五メートルの朱塗りの楼門で、開創以来この地が聖域の入口だった。左右の金剛力士像は、阿形を仏師康意、吽形を法橋運長が手がけたと伝わり、二体一対で参拝者を迎える。晴れた日には楼門の先に淡路島や四国の山影まで見渡せることがあり、街中ではなく山の縁に立っているのだと実感させる場所だ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Daimon_Gate_-_panoramio.jpg/1280px-Daimon_Gate_-_panoramio.jpg"
        ],
        "specs": [
          {
            "k": "拝観",
            "v": "外観は終日。境内自由"
          },
          {
            "k": "料金",
            "v": "見学無料"
          },
          {
            "k": "最寄り",
            "v": "バス停「大門」すぐ"
          },
          {
            "k": "建立",
            "v": "現在の門は1705年再建"
          }
        ],
        "transit": "南海高野線・極楽橋駅からケーブルで高野山駅、りんかんバス千手大門線で「大門」下車すぐ"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "壇上伽藍 根本大塔",
        "cuisine": "寺院・塔",
        "area": "和歌山・高野町",
        "purpose": "9:30ごろ、密教の宇宙観を体で受け止める核として",
        "desc": "壇上伽藍は空海が高野山を開く際に最初に整備に着手した区画で、その中央にそびえる朱の根本大塔は高さ約四八・五メートル。塔の内部に入ると、大日如来を中心に四仏と十六本の柱に描かれた菩薩が立体的に配され、空間そのものが曼荼羅として組まれている。平面の図ではなく塔内を歩いて回ることで教えを体感させる構成は、ここならではの仕掛けだ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Konpon_Daito.jpg/1280px-Konpon_Daito.jpg"
        ],
        "specs": [
          {
            "k": "拝観",
            "v": "8:30〜17:00（受付終了は早め）"
          },
          {
            "k": "料金",
            "v": "塔内拝観500円ほど・最新は公式で"
          },
          {
            "k": "見どころ",
            "v": "内陣の立体曼荼羅"
          },
          {
            "k": "塔高",
            "v": "約48.5m"
          }
        ],
        "transit": "りんかんバス「金堂前」または「霊宝館前」下車、徒歩約3分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "金剛峯寺",
        "cuisine": "寺院",
        "area": "和歌山・高野町",
        "purpose": "10:30前後、白砂の庭で塔の余韻を静める一拍として",
        "desc": "高野山真言宗の総本山で、全国の末寺を束ねる山内の中枢。主殿の奥に広がる蟠龍庭は約二三四〇平方メートルに白川砂と花崗岩を配し、雲海から雌雄一対の龍が奥殿を守る姿を石組みで表現した石庭だ。襖絵や、千人分の米を炊いたという広大な囲炉裏のある台所も見学路に含まれ、寺が一つの行政機構として機能してきた歴史をうかがわせる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Kongobuji_Koyasan01n4272.jpg/1280px-Kongobuji_Koyasan01n4272.jpg"
        ],
        "specs": [
          {
            "k": "拝観",
            "v": "8:30〜17:00（受付16:30まで）"
          },
          {
            "k": "料金",
            "v": "中学生以上1,000円ほど・要確認"
          },
          {
            "k": "見どころ",
            "v": "蟠龍庭の石組み"
          },
          {
            "k": "住所",
            "v": "高野町高野山132"
          }
        ],
        "transit": "壇上伽藍から徒歩約5分、バス停「金剛峯寺前」下車すぐ"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "苅萱堂",
        "cuisine": "堂宇",
        "area": "和歌山・高野町",
        "purpose": "13:00すぎ、奥之院へ向かう前に物語の余韻を一つ拾う",
        "desc": "宿坊・密厳院に属する朱塗りの堂で、女人禁制だった高野山を舞台にした石童丸の伝説を伝える。出家した父・苅萱道心を山に訪ねた子の石童丸が、互いを親子と知りながら名乗れぬまま生涯を終える――その悲話が堂内に連なる絵で語られる。高野聖がこの物語を全国に語り広めた中継点であり、教義の建物が続く山内にあって人間の情を扱う数少ない場所だ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/%E9%AB%98%E9%87%8E%E5%B1%B1_%E8%8B%85%E8%90%B1%E5%A0%822_Koyasan_%28Mount_Koya%29_-_panoramio.jpg/1280px-%E9%AB%98%E9%87%8E%E5%B1%B1_%E8%8B%85%E8%90%B1%E5%A0%822_Koyasan_%28Mount_Koya%29_-_panoramio.jpg"
        ],
        "specs": [
          {
            "k": "拝観",
            "v": "8:00〜17:00 ごろ"
          },
          {
            "k": "料金",
            "v": "拝観無料"
          },
          {
            "k": "見どころ",
            "v": "石童丸物語の絵伝"
          },
          {
            "k": "所属",
            "v": "密厳院"
          }
        ],
        "transit": "千手院橋から奥之院方面へ徒歩約10分、バス停「苅萱堂前」すぐ"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "奥之院",
        "cuisine": "霊域・参道",
        "area": "和歌山・高野町",
        "purpose": "13:30に一の橋を渡り、15:00ごろ御廟橋へ着く半日の終着点",
        "desc": "一の橋から弘法大師御廟まで約二kmの参道が、樹齢数百年の杉に覆われて続く。両側には戦国大名から企業まで二十万基を超えるとされる墓碑や供養塔が並び、立場を越えてこの地に眠ろうとした信仰の厚みが道として可視化されている。御廟橋から先は撮影も控える霊域で、燈籠堂には消えずに灯り続けると伝わる火がある。空海が今も瞑想を続けるとされ、日に二度の食事が捧げられる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Choishi_Path_-_Okunoin_Cemetery_-_Koyasan_-_Japan_-_22_%2847949824922%29.jpg/1280px-Choishi_Path_-_Okunoin_Cemetery_-_Koyasan_-_Japan_-_22_%2847949824922%29.jpg"
        ],
        "specs": [
          {
            "k": "燈籠堂",
            "v": "6:00〜17:00 ごろ"
          },
          {
            "k": "参道",
            "v": "一の橋〜御廟 約2km"
          },
          {
            "k": "撮影",
            "v": "御廟橋から先は不可"
          },
          {
            "k": "料金",
            "v": "参道・参拝は無料"
          }
        ],
        "transit": "一の橋から表参道を徒歩約40分、または「奥の院前」バス停から約1km"
      }
    ],
    "sideArticles": [
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      },
      {
        "t": "柴又を歩く。帝釈天の参道と矢切の渡し、寅さんの下町",
        "h": "/feature/tokyo-shibamata-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/0/04/Shibamata_Taishakuten.jpg"
      }
    ],
    "quote": "朱の大塔で始まり、二万基の灯籠に終わる。色が静けさへ沈んでいく半日。",
    "quoteCite": "マチノワ編集部",
    "closing": "9:00、ケーブルとバスで上がったら西端の大門に立ち、山の入口を仰ぐ。9:30前後に壇上伽藍へ移り、根本大塔の朱と内陣の立体曼荼羅で密教の世界観を体に入れる。10:30ごろ徒歩数分の金剛峯寺で蟠龍庭の白砂に向き合い、台所や襖絵を抜けて呼吸を整える。昼を挟み、千手院橋から東へ向かって13:00すぎに苅萱堂で石童丸の悲話に触れ、そのまま一の橋へ。13:30に最初の橋を渡って奥之院の杉並木に分け入り、二kmの墓碑群を踏みしめながら15:00ごろ御廟橋の手前へ。橋から先は撮影も私語も控える霊域、燈籠堂の灯りに半日を閉じる。拝観料や受付時間は折々で見直されるので、出かける前に各寺と金剛峯寺の公式案内に目を通しておくと安心だ。"
  },
  "shiga-hieizan-enryakuji": {
    "id": "shiga-hieizan-enryakuji",
    "no": "G9-23",
    "articleType": "guide",
    "kicker": "HIEIZAN",
    "title": "比叡山延暦寺を歩く。根本中堂と杉木立の祈り",
    "titleHTML": "比叡山延暦寺を歩く。<br>根本中堂と杉木立の祈り",
    "subtitle": "滋賀・大津、ケーブルで登る比叡の祈り",
    "lede": "坂本の朝は、ケーブル駅の改札の音から始まる。木造の駅舎をくぐると、まだ眠そうな車両が一両、レールの先の斜面へ静かに身を傾けている。動き出せば、窓の外を杉の幹が次々と流れ、谷を隔てた向こうにうっすらと琵琶湖が広がっていく。標高が上がるごとに空気が冷たく澄んでいくのが、肌でわかる。山上に着くころには、ふもとの暮らしの音はもう遠い。ここからは、比叡の祈りの領域だ。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Enryaku-ji_building.jpg/1280px-Enryaku-ji_building.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "坂本ケーブル",
        "cuisine": "ケーブルカー",
        "area": "滋賀県大津市坂本本町",
        "purpose": "麓から山上へ、車窓に琵琶湖を見ながら登る",
        "desc": "昭和2年に開業した全長2025メートルのケーブルで、ふもとの坂本から延暦寺駅まで稜線を縫って登っていく。トンネルを抜けるたびに視界がひらけ、大きくとられた窓の向こうに琵琶湖がせり上がってくる。歩いて登れば数時間かかる高度差を、十一分の揺れにまかせて越えるあいだ、町の屋根が小さくなり、空気がひと息ぶん冷たくなるのがわかる。運賃や運行ダイヤ、冬期の運休は季節で変わるため、訪ねる前に公式の時刻表で確かめておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/2/25/Sakamoto_Cable.jpg"
        ],
        "specs": [
          {
            "k": "全長",
            "v": "2025メートル"
          },
          {
            "k": "所要",
            "v": "約11分"
          }
        ],
        "transit": "ケーブル坂本駅から乗車、ケーブル延暦寺駅まで約11分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "延暦寺 根本中堂（東塔）",
        "cuisine": "国宝・本堂",
        "area": "滋賀県大津市坂本本町",
        "purpose": "延暦寺の中心、不滅の法灯に手を合わせる",
        "desc": "ケーブルを降りて杉木立の坂を下ると、東塔の谷あいに国宝・根本中堂が沈むように建っている。最澄が灯した火を千二百年絶やさず継いできた「不滅の法灯」が、薄暗い内陣の奥でゆれている場所だ。本尊と参拝者の床の高さがほぼ同じになるよう造られた独特の構えで、暗がりに目が慣れるほど、自分が祈りの底に立っていることに気づく。現在は約六十年ぶりの大改修が続き、堂は素屋根に覆われている。屋根の修復を間近で見られる特設の参拝デッキが設けられる一方、本来の外観や堂内拝観のかたちは時期で変わるので、最新の案内を寺の公式サイトで確認してから向かうとよい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Enryakuji_Konponchudo01s5s3200.jpg/1280px-Enryakuji_Konponchudo01s5s3200.jpg"
        ],
        "specs": [
          {
            "k": "区分",
            "v": "国宝"
          },
          {
            "k": "見どころ",
            "v": "不滅の法灯"
          }
        ],
        "transit": "ケーブル延暦寺駅から徒歩約10分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "延暦寺 西塔",
        "cuisine": "寺院エリア",
        "area": "滋賀県大津市坂本本町",
        "purpose": "杉木立の参道を抜け、最澄の御廟へ",
        "desc": "東塔から尾根を北へたどると、人影がふいに減って、足音が杉の幹に吸われていく。本堂の釈迦堂は延暦寺に現存する建物のうち最も古く、もとは三井寺の金堂を秀吉が移したものだという。途中、同じ形のお堂が渡り廊下でつながる「にない堂」の脇を抜け、その奥には最澄が眠る浄土院がある。掃き清められた白砂と苔の庭は息をのむほど静かで、山内でいちばん清浄とされる理由が、立っただけで肌に伝わってくる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Enryaku-ji_building.jpg/1280px-Enryaku-ji_building.jpg"
        ],
        "specs": [
          {
            "k": "本堂",
            "v": "釈迦堂(現存最古)"
          },
          {
            "k": "御廟",
            "v": "浄土院(最澄)"
          }
        ],
        "transit": "東塔からシャトルバスまたは徒歩、釈迦堂まで徒歩約20分"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "延暦寺 横川中堂（横川）",
        "cuisine": "寺院・本堂",
        "area": "滋賀県大津市坂本本町",
        "purpose": "山の北、朱塗りの舞台堂で静けさにひたる",
        "desc": "シャトルバスで山をさらに北へ運ばれると、横川の谷に着く。崖にせり出す舞台造りの上に、朱塗りの横川中堂が浮かんでいる。慈覚大師円仁が開いた区域で、信長の焼き討ちや落雷でたびたび失われ、いまの堂は昭和46年に再建されたものだ。人の声がまばらで、堂をめぐる回廊に立つと、足もとの谷から吹き上げる風の音だけが聞こえてくる。おみくじ発祥と伝わる元三大師堂が近くにあるのもこの一帯だ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Enryaku-ji_Yokokawa-chudo-r.jpg/1280px-Enryaku-ji_Yokokawa-chudo-r.jpg"
        ],
        "specs": [
          {
            "k": "本尊",
            "v": "聖観音菩薩"
          },
          {
            "k": "構造",
            "v": "朱塗りの舞台造り"
          }
        ],
        "transit": "東塔・西塔からシャトルバスで横川下車、徒歩約5分"
      },
      {
        "rank": "SPOT 05",
        "rankNum": 5,
        "name": "ガーデンミュージアム比叡",
        "cuisine": "庭園美術館",
        "area": "京都府京都市左京区／比叡山頂",
        "purpose": "山上の庭で、一日の終わりに花と湖を眺める",
        "desc": "祈りの谷をひと巡りしたあと、標高840メートルの山頂へ足を伸ばす。延暦寺の堂塔は滋賀側だが、この山頂庭園は京都府京都市左京区にあたり、府県境をまたいで歩いてきたことに気づく。1.7ヘクタールの庭にモネの絵を思わせる睡蓮の池やバラの一画が広がり、寺の薄暗さとは打って変わって光があふれている。フランスの設計者の手による庭で、印象派の画家たちが描いた色彩を花で再現しようとしたという成り立ちが、山上という場所と不思議になじむ。例年12月上旬から4月中旬までは冬期休園で、開園期間・開園時間や入園料、睡蓮の見頃も変わるので、訪問前に公式サイトで確かめておきたい。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Garden-museum-hiei01-r.jpg/1280px-Garden-museum-hiei01-r.jpg"
        ],
        "specs": [
          {
            "k": "標高",
            "v": "約840メートル"
          },
          {
            "k": "庭園",
            "v": "睡蓮の池・ローズガーデン"
          }
        ],
        "transit": "比叡山頂バス停から徒歩すぐ、山頂エリア"
      }
    ],
    "sideArticles": [
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      },
      {
        "t": "柴又を歩く。帝釈天の参道と矢切の渡し、寅さんの下町",
        "h": "/feature/tokyo-shibamata-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/0/04/Shibamata_Taishakuten.jpg"
      }
    ],
    "quote": "車両が斜面を登りきる手前、窓いっぱいに杉木立が迫って、しばらく光が翳った。その暗がりが、山に入る合図のようだった。",
    "quoteCite": "マチノワ編集部",
    "closing": "ガーデンミュージアムの柵ごしに、琵琶湖がうっすら光っていた。朝はケーブルの車窓に流れる杉木立から始まり、いまは山上の風のなかに立っている。標高八百を超えると、空気の薄さが祈りの気配と区別できなくなる。下りのケーブルに揺られながら、根本中堂で出会った薄暗がりと、西塔や横川の杉木立に吸い込まれていった鳥の声を思い返した。山を一日歩いたというより、ひとつの長い祈りの内側を通り抜けてきた気がする。なお、ケーブルの運行や各所の拝観時間・料金、根本中堂の改修の進み具合はその時々で変わるので、出かける前に公式の案内へ目を通しておくと安心だ。"
  },
  "gunma-tomioka-silk": {
    "id": "gunma-tomioka-silk",
    "no": "G9-24",
    "articleType": "course",
    "kicker": "TOMIOKA SILK",
    "title": "富岡製糸場 半日モデルコース。世界遺産の赤れんが",
    "titleHTML": "富岡製糸場 半日モデルコース。<br>世界遺産の赤れんが",
    "subtitle": "明治の器械製糸が残した木骨煉瓦の街を、駅前の杜から下り宮まで歩いてつなぐ",
    "lede": "上州富岡は、製糸の音が止んでもなお煉瓦の壁が街の背骨であり続ける町だ。駅を出れば商店街のすぐ先に明治五年創業の工場が残り、そこから少し足をのばせば、参道を下って社殿に向かう珍しい古社が山あいに鎮座する。この記事では、上信電鉄で着いてから半日。駅前の鎮守に寄って息を整え、製糸場では建物を一棟ずつ時間をかけて読み、最後に下り宮で締める。世界遺産を点で見るのではなく、富岡という土地の重なりとして歩いてみたい。",
    "date": "2026-06-14",
    "reading": "約4分",
    "author": "マチノワ編集部",
    "heroImage": "https://upload.wikimedia.org/wikipedia/commons/2/2a/Tomioka_Silk_Mill_East_Cocoon_Warehouse05.jpg",
    "ranking": [
      {
        "rank": "SPOT 01",
        "rankNum": 1,
        "name": "諏訪神社（富岡）",
        "cuisine": "神社",
        "area": "群馬県富岡市富岡",
        "purpose": "10:00、駅を出てまず参拝。製糸場へ向かう前の足慣らしに。",
        "desc": "信州・諏訪大社の分霊を勧請したと伝わる富岡の鎮守で、上州富岡駅のほぼ正面に鎮座する。駅と製糸場のちょうど中間にあたるため、繰糸の喧騒へ踏み込む前のひと呼吸として立ち寄りやすい立地が、この社ならではの役どころだ。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Tomioka_Suwa_jinja.jpg/1280px-Tomioka_Suwa_jinja.jpg"
        ],
        "specs": [
          {
            "k": "所在地",
            "v": "富岡市富岡1130"
          },
          {
            "k": "駅から",
            "v": "上州富岡駅 徒歩約3分"
          },
          {
            "k": "製糸場まで",
            "v": "徒歩約6分（約480m）"
          }
        ],
        "transit": "上信電鉄・上州富岡駅から徒歩約3分"
      },
      {
        "rank": "SPOT 02",
        "rankNum": 2,
        "name": "富岡製糸場 東置繭所",
        "cuisine": "世界遺産・国宝",
        "area": "群馬県富岡市富岡",
        "purpose": "10:20、正門をくぐって最初に対峙する一棟。場内見学の起点に。",
        "desc": "桁行100mを超す木骨煉瓦造の繭倉庫で、正門を入って正面に立ちはだかる。建物内を貫く通路のアーチ、その要石に刻まれた「明治五年」の文字は創業の年そのもので、ここに立つだけで工場の起点に触れられるのが他棟にない見どころ。1階は事務所や作業場、2階に乾かした繭を貯えた。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/2/2a/Tomioka_Silk_Mill_East_Cocoon_Warehouse05.jpg"
        ],
        "specs": [
          {
            "k": "開場",
            "v": "9:00〜17:00（最終入場16:30）／最新は公式で"
          },
          {
            "k": "見学料",
            "v": "大人1,000円ほか／訪問前に公式確認"
          },
          {
            "k": "構造",
            "v": "木骨煉瓦造・桁行100m超"
          }
        ],
        "transit": "上州富岡駅から徒歩約15分／諏訪神社から徒歩約6分"
      },
      {
        "rank": "SPOT 03",
        "rankNum": 3,
        "name": "富岡製糸場 繰糸所",
        "cuisine": "世界遺産・国宝",
        "area": "群馬県富岡市富岡",
        "purpose": "11:00過ぎ、内部公開の本丸へ。場内で時間を取って見たい。",
        "desc": "繭から生糸を繰り出した作業場で、内部が公開されている。柱を中央に立てないトラス構造で長さおよそ140mの大空間を架け、明かり取りの高い天窓から光が落ちる設計は、当時の最新技術を実見できるこの棟だけの体験だ。片倉工業時代に導入され1987年の操業停止まで使われた日産自動車製の自動繰糸機が、今も並んで残る。スマホアプリの無料音声ガイドを使うと解説を聞きながら回れる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Inside_of_Tomioka_Silk_Mill_Silk-reeling_plant.jpg/1280px-Inside_of_Tomioka_Silk_Mill_Silk-reeling_plant.jpg"
        ],
        "specs": [
          {
            "k": "公開",
            "v": "内部見学可"
          },
          {
            "k": "見どころ",
            "v": "トラス構造の大空間と天窓"
          },
          {
            "k": "音声ガイド",
            "v": "アプリで無料利用可"
          }
        ],
        "transit": "東置繭所から場内徒歩すぐ"
      },
      {
        "rank": "SPOT 04",
        "rankNum": 4,
        "name": "一之宮貫前神社",
        "cuisine": "神社",
        "area": "群馬県富岡市一ノ宮",
        "purpose": "14:00、電車で移動して締めの参拝。下り宮の構造を体感する。",
        "desc": "上野国一宮として崇敬を集めてきた古社で、いったん石段を上って総門をくぐると、そこからさらに石段を下った窪地に社殿が建つ「下り宮」。日本三大下り宮にも数えられ、神様を見上げず見下ろす形で参拝へ近づく独特の動線は、平地の製糸場とは対照的で、半日の締めくくりに地形の妙を味わわせてくれる。",
        "images": [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Ichinomiya_nukisaki_jinja_Torii.JPG/1280px-Ichinomiya_nukisaki_jinja_Torii.JPG"
        ],
        "specs": [
          {
            "k": "格式",
            "v": "上野国一宮"
          },
          {
            "k": "特徴",
            "v": "総門から石段を下る下り宮"
          },
          {
            "k": "最寄り",
            "v": "上州一ノ宮駅 徒歩約10〜15分"
          }
        ],
        "transit": "上信電鉄・上州一ノ宮駅から徒歩約10〜15分"
      }
    ],
    "sideArticles": [
      {
        "t": "高尾山を歩く。薬王院から山頂へ、都心に一番近い霊山",
        "h": "/feature/tokyo-takao-mountain",
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Takaosan_Yakuouin_hondo.JPG/1280px-Takaosan_Yakuouin_hondo.JPG"
      },
      {
        "t": "柴又を歩く。帝釈天の参道と矢切の渡し、寅さんの下町",
        "h": "/feature/tokyo-shibamata-walk",
        "img": "https://upload.wikimedia.org/wikipedia/commons/0/04/Shibamata_Taishakuten.jpg"
      }
    ],
    "quote": "煉瓦は焼き継がれ、繭は乾かされ、社は窪地に伏せられる。富岡は、火を入れて待つ町である。",
    "quoteCite": "マチノワ編集部",
    "closing": "10:00に上州富岡駅へ降り立ち、まず駅前の諏訪神社で旅の無事を願う。10:20には製糸場の正門をくぐり、東置繭所のアーチ銘板を見上げてから、11:00過ぎに繰糸所の長大な架構へ。建物を一棟ずつ読み終えたら、13:30の電車で上州一ノ宮へ移動。14:00、貫前神社の総門をくぐって石段を下り、窪地の社殿に参って夕方の便で帰路につく。なお拝観料や開場時間、各施設の開館日・休館は折々で変わるので、出かける前に各施設の公式案内で一度ご確認を。"
  }
};
