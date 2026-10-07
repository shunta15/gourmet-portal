/**
 * 総合サイト（公開スイッチ ON のビルド）の巡回検査。
 *
 *   PORTAL_LAUNCHED=1 npm run build && PORTAL_LAUNCHED=1 npx next start -p 3242   # 別ターミナルで
 *   node proto-portal/crawl.mjs [--base http://localhost:3242]
 *
 * - 主要 URL が 200、存在しない URL が 404、canonical・JSON-LD（パース可・パンくず）・robots（新業種は件数ゲートで noindex、
 *   総合トップ・/gourmet は index）・title/description の重複なし・見出し・パンくず表示と JSON-LD の一致・共有画像・
 *   内部リンク切れなし・SNS/共有ボタン・サイト内検索（/find・/search-index.json）を調べる。
 * - 最後に `PROBLEMS N` を出す。N が 0 なら合格。1 以上なら終了コード 1。
 * - 公開スイッチ OFF のビルドの検査は compare-off.mjs（main との比較）。この巡回は ON 専用。
 */
// `next dev` はキャッシュの書き出し中などに接続を切ることがある（ECONNRESET）。本番ビルド（next start）では起きないので、通信だけ数回やり直す
const fetch0 = globalThis.fetch;
globalThis.fetch = async (...a) => {
  for (let i = 0; ; i++) {
    try {
      return await fetch0(...a);
    } catch (e) {
      if (i >= 3) throw e;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
};
const argv = process.argv.slice(2);
const argi = argv.indexOf('--base');
const B = (argi >= 0 ? argv[argi + 1] : 'http://localhost:3242').replace(/\/$/, '');
const ok200=['/','/gourmet','/beauty','/beauty/area/tokyo','/beauty/hair','/beauty/hair/tokyo','/bodycare/seitai/osaka','/pet','/pet/trimming','/leisure/onsen/kanagawa','/stay/area/hokkaido','/stay/ryokan','/bodycare/scene/weekend-open','/beauty/scene/late-night','/area/tokyo','/area/aichi','/area/okinawa','/beauty/sitemap.xml','/station','/station/kyoto','/station/kyoto/祇園四条','/station/hyogo/神戸三宮','/station/tokyo/蒲田','/station/niigata/直江津','/station/sitemap.xml','/videos','/videos/sv-nazatu-1','/videos/sv-nazatu-review','/videos/sitemap.xml','/map','/map?pref=kyoto','/station/kyoto/祇園四条?open=1','/find?q=三宮','/find?q=京都','/find','/find?q=zzzz','/photos','/photos/sitemap.xml','/omakase','/omakase?r=kinki&who=solo&b=3000&m=men','/list','/station/kyoto/烏丸/和食・割烹'];
const exp404=['/beauty/area/xxx','/beauty/nosuch','/beauty/shop/abc','/beauty/hair/tokyo/nosuchcity','/area/nosuch','/station/tokyo/存在しない駅','/station/nosuch','/station/nosuch/駅','/videos/nosuch'];
const seen=new Map();const get=async u=>{if(seen.has(u))return seen.get(u);const r=await fetch(B+encodeURI(u),{redirect:'manual'});const t=r.status===200&&!u.endsWith('.xml')?await r.text():'';const v={s:r.status,t};seen.set(u,v);return v};
const bad=[];
for(const u of exp404){const r=await get(u);if(r.s!==404)bad.push(`expected404 ${u} -> ${r.s}`)}
const links=new Set();
for(const u of ok200){const r=await get(u);if(r.s!==200){bad.push(`expected200 ${u} -> ${r.s}`);continue}if(u.endsWith('.xml'))continue;
 const h=r.t;const robots=(h.match(/<meta name="robots" content="([^"]+)"/)||[])[1];const canon=(h.match(/<link rel="canonical" href="([^"]+)"/)||[])[1];const title=(h.match(/<title>([^<]*)<\/title>/)||[])[1];
 const lds=[...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>m[1]);let ldOk=true,bc=false;for(const l of lds){try{const j=JSON.parse(l);if(JSON.stringify(j).includes('BreadcrumbList'))bc=true}catch{ldOk=false}}
 const isNew=!['/','/gourmet'].includes(u);
 if(u.startsWith('/station')){const cnt=+((h.match(/class="mp-pg-count"><b>(\d+)<\/b>/)||[])[1]??-1);const wantIndex=cnt>=3;if(cnt<0)bad.push(`no count ${u}`);else if(wantIndex===/noindex/.test(robots||''))bad.push(`station robots mismatch ${u} count=${cnt} (${robots})`);console.log('   station count',cnt,'expect',wantIndex?'index':'noindex')}
 else if(u.startsWith('/videos')){const hasVO=lds.some(l=>/"@type":"VideoObject"/.test(l));const sm=(await get('/videos/sitemap.xml')).s===200?await (await fetch(B+'/videos/sitemap.xml')).text():'';const inSm=sm.includes('https://machinowa.tokyo'+u+'</loc>');
   const wantIndex=u==='/videos'?inSm:hasVO;if(wantIndex===/noindex/.test(robots||''))bad.push(`videos robots mismatch ${u} hasVideoObject=${hasVO} inSitemap=${inSm} (${robots})`);if(hasVO!==inSm&&u!=='/videos')bad.push(`videos VideoObject/sitemap mismatch ${u}`);console.log('   videos: VideoObject',hasVO,'inSitemap',inSm,'expect',wantIndex?'index':'noindex')}
 else if(u==='/photos'){const sm=await (await fetch(B+'/photos/sitemap.xml')).text();const inSm=sm.includes('https://machinowa.tokyo/photos</loc>');if(inSm===/noindex/.test(robots||''))bad.push(`photos robots mismatch inSitemap=${inSm} (${robots})`);console.log('   photos inSitemap',inSm,'expect',inSm?'index':'noindex')}
 else if(u.startsWith('/omakase')){const stated=u.includes('?');if(stated===!/noindex/.test(robots||''))bad.push(`omakase robots mismatch ${u} (${robots}) 答えの無い /omakase だけ index`);console.log('   omakase',stated?'答えあり → noindex':'答えなし → index')}
 else if(isNew&&!/noindex/.test(robots||''))bad.push(`not noindex ${u} (${robots})`);
 else if(!isNew&&/noindex/.test(robots||''))bad.push(`should be index ${u} (${robots})`);
 const expCanon='https://machinowa.tokyo'+(u==='/'?'':u.split('?')[0]);if(canon&&decodeURI(canon)!==expCanon&&!(u==='/'&&canon==='https://machinowa.tokyo'))bad.push(`canonical ${u} -> ${canon}`);if(!canon)bad.push(`no canonical ${u}`);
 if(!ldOk)bad.push(`ld+json parse fail ${u}`);if(u!=='/'&&u!=='/gourmet'&&!bc)bad.push(`no breadcrumb ${u}`);
 if(/マチノワマチノワ/.test(title||''))bad.push(`dup title ${u}`);
 console.log(u.padEnd(26),r.s,'|',title,'|',robots,'| ld',lds.length);
 for(const m of h.matchAll(/href="(\/[^"#?]*)"/g)){const l=m[1];if(!/^\/(_next|restaurants\/|videos\/)/.test(l)&&!/\.(css|js|png|jpg|webp|ico|svg)$/.test(l))links.add(decodeURI(l))}}
let n=0;for(const l of links){const r=await get(l);n++;if(r.s>=400)bad.push(`link ${r.s} ${l}`)}
console.log('links checked',n);
// ───── SEO・品質の仕上げ（2026-10-04）: 総合ページの title/description 重複・見出し・パンくず一致・共有画像 ─────
const isPortalUrl=u=>{const p=u.split('?')[0];const f=p.split('/')[1];return p==='/'||['area','station','videos','map','find','photos','list','beauty','bodycare','pet','leisure','stay'].includes(f)};
const portal=[...seen.entries()].filter(([u,v])=>v.s===200&&v.t&&isPortalUrl(u)&&!u.endsWith('.xml'));
console.log('portal pages (html):',portal.length);
const byCanon=new Map();
const dec=x=>{try{return decodeURI(x)}catch{return x}};
const ogUrls=new Set();
for(const [u,v] of portal){
  const h=v.t;
  const canon=dec((h.match(/<link rel="canonical" href="([^"]*)"/)||[])[1]||u);
  if(byCanon.has(canon))continue; // /map と /map?pref=… のように canonical が同じものは1ページ扱い
  byCanon.set(canon,{u,h});
}
const tmap=new Map(),dmap=new Map();
for(const [canon,{u,h}] of byCanon){
  const title=(h.match(/<title>([^<]*)<\/title>/)||[])[1]||'';
  const desc=(h.match(/<meta name="description" content="([^"]*)"/)||[])[1]||'';
  if(!title)bad.push(`no title ${u}`);if(!desc)bad.push(`no description ${u}`);
  (tmap.get(title)||tmap.set(title,[]).get(title)).push(u);(dmap.get(desc)||dmap.set(desc,[]).get(desc)).push(u);
  // 見出し: h1 は1つ・最初の見出しが h1・階層が飛ばない
  const hs=[...h.matchAll(/<h([1-6])[\s>]/g)].map(m=>+m[1]);
  const h1=hs.filter(x=>x===1).length;
  if(h1!==1)bad.push(`h1 count ${h1} ${u}`);
  if(hs[0]!==1)bad.push(`first heading is h${hs[0]} ${u}`);
  for(let i=1;i<hs.length;i++)if(hs[i]-hs[i-1]>1){bad.push(`heading skip h${hs[i-1]}->h${hs[i]} ${u}`);break}
  if((h.match(/<main[\s>]/g)||[]).length!==1)bad.push(`main count ${(h.match(/<main[\s>]/g)||[]).length} ${u}`);
  if((h.match(/<footer[\s>]/g)||[]).length<1)bad.push(`no footer ${u}`);
  // パンくず: 表示と JSON-LD（BreadcrumbList）が一致
  const nav=(h.match(/<nav class="mp-crumbs[^"]*"[^>]*>([\s\S]*?)<\/nav>/)||[])[1];
  const lds=[...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>{try{return JSON.parse(m[1])}catch{return null}}).filter(Boolean);
  const bc=lds.find(j=>j['@type']==='BreadcrumbList');
  if(u!=='/'){
    if(!nav)bad.push(`no visible breadcrumb ${u}`);
    else if(bc){
      const items=[...nav.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map(m=>({name:m[1].replace(/<[^>]+>/g,'').trim(),href:(m[1].match(/href="([^"]*)"/)||[])[1]}));
      const ld=bc.itemListElement;
      if(items.length!==ld.length)bad.push(`breadcrumb count visible ${items.length} vs ld ${ld.length} ${u}`);
      else items.forEach((it,i)=>{
        if(it.name!==ld[i].name)bad.push(`breadcrumb name "${it.name}" vs ld "${ld[i].name}" ${u}`);
        const want=dec(ld[i].item).replace('https://machinowa.tokyo','')||'/';
        const got=it.href?dec(it.href):canon.replace('https://machinowa.tokyo','')||'/';
        if(got!==want&&!(i===ld.length-1&&!it.href&&want===(dec(canon).replace('https://machinowa.tokyo','')||'/')))bad.push(`breadcrumb href "${got}" vs ld "${want}" ${u}`);
      });
    }
  }
  // 共有画像: 総合サイト用（/og/...）・twitter も同じ・大きい画像
  const og=(h.match(/<meta property="og:image" content="([^"]*)"/)||[])[1];
  const tw=(h.match(/<meta name="twitter:image" content="([^"]*)"/)||[])[1];
  const card=(h.match(/<meta name="twitter:card" content="([^"]*)"/)||[])[1];
  const ogw=(h.match(/<meta property="og:image:width" content="([^"]*)"/)||[])[1];
  if(!og||!/^https:\/\/machinowa\.tokyo\/og\//.test(og))bad.push(`og:image not /og/ ${u} -> ${og}`);
  else{ogUrls.add(og.replace(/&amp;/g,'&'));}
  if(tw!==og)bad.push(`twitter:image != og:image ${u}`);
  if(card!=='summary_large_image')bad.push(`twitter:card ${card} ${u}`);
  if(ogw!=='1200')bad.push(`og:image:width ${ogw} ${u}`);
  const tt=(h.match(/<meta name="twitter:title" content="([^"]*)"/)||[])[1];
  const ot=(h.match(/<meta property="og:title" content="([^"]*)"/)||[])[1];
  if(tt!==ot||/全国飲食店ポータル/.test((h.match(/<meta name="twitter:description" content="([^"]*)"/)||[])[1]||''))bad.push(`twitter text inherited from gourmet ${u}`);
}
for(const [t,us] of tmap)if(us.length>1)bad.push(`duplicate title "${t}" x${us.length}: ${us.slice(0,3).join(' , ')}`);
for(const [d,us] of dmap)if(us.length>1)bad.push(`duplicate description "${d.slice(0,40)}…" x${us.length}: ${us.slice(0,3).join(' , ')}`);
// 共有画像の URL が 200 / image/png（駅の画像は件数が多いので、先頭・等間隔の標本）
const allOg=[...ogUrls];const stOg=allOg.filter(x=>x.includes('/og/station/'));const nonSt=allOg.filter(x=>!x.includes('/og/station/'));
const stSample=stOg.filter((_,i)=>i%Math.max(1,Math.floor(stOg.length/30))===0).slice(0,30);
let ogChecked=0;const ogSizes=[];
for(const o of [...nonSt,...stSample]){const r=await fetch(B+o.replace('https://machinowa.tokyo',''));const ct=r.headers.get('content-type')||'';const buf=Buffer.from(await r.arrayBuffer());ogChecked++;ogSizes.push(buf.length);
  if(r.status!==200||!/image\/png/.test(ct)||buf.length<2000||buf.readUInt32BE(16)!==1200||buf.readUInt32BE(20)!==630)bad.push(`og image ${r.status} ${ct} ${buf.length}B ${o}`);}
console.log(`og images: distinct ${allOg.length} (station ${stOg.length}), fetched ${ogChecked}, bytes min ${Math.min(...ogSizes)} max ${Math.max(...ogSizes)}`);
console.log('unique titles',tmap.size,'unique descriptions',dmap.size,'of',byCanon.size,'portal pages');

// ───── SNS・共有ボタン・サイト内検索（2026-10-04） ─────
{
  const decC = (x) => { try { return decodeURIComponent(x) } catch { return x } };
  // 共有ボタン: 店ページは ShopActions（行動ボタン6案。どの案でも role="group" aria-label="この店を共有" の中に LINE・X・Facebook のリンクとコピーのボタン）、
  // それ以外のページは ShareButtons（data-share）。店の SNS・公式サイトは ShopActions の行（data-sa-id="instagram" など。値がある項目だけ）
  const snsPages = ['/restaurant/r21','/restaurant/r204','/restaurant/r23','/restaurant/r01','/station/kyoto/祇園四条','/station/hyogo/神戸三宮','/area/tokyo','/videos/sv-nazatu-1'];
  const kindOfShareHref = (href) => /^https:\/\/social-plugins\.line\.me\//.test(href) ? 'line' : /^https:\/\/twitter\.com\/intent\/tweet/.test(href) ? 'x' : /^https:\/\/www\.facebook\.com\/sharer\//.test(href) ? 'facebook' : null;
  // 開き <div> の対応する閉じ </div> までを切り出す（入れ子を数える）
  const divBlock = (h, openIdx) => {
    const re = /<(\/?)div\b[^>]*>/g; re.lastIndex = openIdx;
    let depth = 0, m;
    while ((m = re.exec(h))) { depth += m[1] ? -1 : 1; if (depth === 0) return h.slice(openIdx, re.lastIndex) }
    return null;
  };
  let shareChecked = 0, snsChecked = 0, extChecked = 0;
  for (const u of snsPages) {
    const r = await get(u); if (r.s !== 200) { bad.push(`sns page ${u} -> ${r.s}`); continue }
    const h = r.t;
    const canon = decodeURI((h.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '');
    let anchors, copyBtn;
    if (u.startsWith('/restaurant/')) {
      const gi = h.search(/<div[^>]*role="group"[^>]*aria-label="この店を共有"[^>]*>/);
      const group = gi >= 0 ? divBlock(h, gi) : null;
      if (!group) { bad.push(`share group missing ${u}`); continue }
      anchors = [...group.matchAll(/<a [^>]*href="([^"]+)"[^>]*>/g)].map(m => ({ k: kindOfShareHref(m[1].replace(/&amp;/g, '&')), tag: m[0] }));
      copyBtn = [...group.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)].some(m => /コピー/.test(m[1]));
    } else {
      const group = h.match(/<div[^>]*data-share=""[^>]*>[\s\S]*?<\/div>\s*(?:<input[^>]*>)?\s*<p[^>]*role="status"/);
      anchors = [...h.matchAll(/<a [^>]*data-share-kind="([a-z]+)"[^>]*>/g)].map(m => ({ k: m[1], tag: m[0] }));
      copyBtn = /<button[^>]*data-share-kind="copy"/.test(h);
      if (!group) { bad.push(`share group missing ${u}`); continue }
    }
    if (anchors.map(a => a.k).join() !== 'line,x,facebook' || !copyBtn) bad.push(`share controls ${u}: ${anchors.map(a => a.k)} copy=${copyBtn}`);
    for (const a of anchors) {
      const href = (a.tag.match(/href="([^"]+)"/) || [])[1]?.replace(/&amp;/g, '&');
      const target = /target="_blank"/.test(a.tag), rel = (a.tag.match(/rel="([^"]+)"/) || [])[1] || '';
      if (!target || !/noopener/.test(rel) || !/noreferrer/.test(rel)) bad.push(`share link rel/target ${u} ${a.k}`);
      const pat = { line: /^https:\/\/social-plugins\.line\.me\/lineit\/share\?url=([^&]+)$/, x: /^https:\/\/twitter\.com\/intent\/tweet\?url=([^&]+)&text=([^&]+)$/, facebook: /^https:\/\/www\.facebook\.com\/sharer\/sharer\.php\?u=([^&]+)$/ }[a.k];
      const m = href && pat && href.match(pat);
      if (!m) { bad.push(`share href format ${u} ${a.k}: ${href}`); continue }
      const shared = decC(m[1]);
      if (!/^https:\/\/machinowa\.tokyo\/[\x21-\x7e]*$/.test(shared)) bad.push(`share url not absolute/ASCII-encoded ${u} ${a.k}: ${shared}`);
      if (decodeURI(shared) !== canon) bad.push(`share url != canonical ${u} ${a.k}: ${decodeURI(shared)} vs ${canon}`);
      if (/%25[0-9A-Fa-f]{2}/.test(m[1]) === false && /%[0-9A-Fa-f]{2}/.test(shared)) bad.push(`share url not double-encoded ${u} ${a.k}`);
      if (a.k === 'x' && !decC(m[2]).trim()) bad.push(`share x text empty ${u}`);
      shareChecked++;
    }
  }
  // 店の SNS ボタン（グルメ店ページの行動ボタン。data-sa-id が SNS・公式サイトの種類のもの）: 値がある店だけ・URL・rel/target
  const SOCIAL_IDS = new Set(['instagram', 'x', 'tiktok', 'facebook', 'line', 'website']);
  const expectSns = { '/restaurant/r21': { instagram: 'https://www.instagram.com/tuki.to.sakura/' }, '/restaurant/r204': { instagram: 'https://www.instagram.com/mugentei_yakiniku/' }, '/restaurant/r23': { x: 'https://x.com/sweetscafe719' }, '/restaurant/r01': {} };
  for (const [u, want] of Object.entries(expectSns)) {
    const h = (await get(u)).t;
    const got = {};
    for (const m of h.matchAll(/<a [^>]*data-sa-id="([a-z]+)"[^>]*>/g)) {
      if (!SOCIAL_IDS.has(m[1])) continue; // 電話・地図・予約などの行は対象外
      const href = (m[0].match(/href="([^"]+)"/) || [])[1];
      got[m[1]] = href;
      if (!/target="_blank"/.test(m[0]) || !/rel="noopener noreferrer"/.test(m[0])) bad.push(`sns link rel/target ${u} ${m[1]}`);
      snsChecked++;
    }
    if (JSON.stringify(got) !== JSON.stringify(want)) bad.push(`sns buttons ${u}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);
    if (/data-sa-id="(tiktok|facebook|line|website)"/.test(h)) bad.push(`unexpected sns kind ${u}`);
  }
  // 外部リンク（http で始まる href）で別タブを開くものは rel に noopener noreferrer
  for (const [u, v] of seen) {
    if (v.s !== 200 || !v.t || u.endsWith('.xml')) continue;
    const f = u.split('?')[0].split('/')[1]; if (!(u === '/' || ['area','station','videos','map','find','photos','omakase','list','beauty','bodycare','pet','leisure','stay','restaurant'].includes(f))) continue;
    for (const m of v.t.matchAll(/<a [^>]*href="(https?:\/\/[^"]+)"[^>]*>/g)) {
      if (!/target="_blank"/.test(m[0])) continue;
      if (!/rel="[^"]*noopener[^"]*noreferrer[^"]*"|rel="[^"]*noreferrer[^"]*noopener[^"]*"/.test(m[0])) bad.push(`external _blank link without rel ${u}: ${m[1].slice(0, 60)}`);
      extChecked++;
    }
  }
  console.log(`sns/share: share links ${shareChecked}, sns buttons ${snsChecked}, external _blank links ${extChecked}`);
  // /find の中身
  for (const [q, must] of [['三宮', '神戸三宮駅'], ['京都', '京都府'], ['きょうと', '京都府']]) {
    const t = (await get('/find?q=' + q)).t;
    if (!t.includes(must)) bad.push(`/find?q=${q} に ${must} が無い`);
    if (!/<meta name="robots" content="noindex/.test(t)) bad.push(`/find?q=${q} not noindex`);
  }
  const fz = (await get('/find?q=zzzz')).t; if (!/見つかりませんでした/.test(fz)) bad.push('/find?q=zzzz の0件表示が無い');
  // 候補データ
  const rs = await fetch(B + '/search-index.json'); const jtxt = await rs.text();
  let jj = null; try { jj = JSON.parse(jtxt) } catch {}
  const gz = (await import('node:zlib')).gzipSync(Buffer.from(jtxt)).length;
  console.log(`search-index.json: status ${rs.status} ${rs.headers.get('content-type')} items ${jj?.items?.length} raw ${jtxt.length}B gzip ${gz}B`);
  if (rs.status !== 200 || !/json/.test(rs.headers.get('content-type') || '') || !jj || jj.items.length < 1000 || gz > 200 * 1024) bad.push(`search-index.json NG status=${rs.status} items=${jj?.items?.length} gzip=${gz}`);
  // 候補データの中身: 種類ごとの件数・URL の形
  const kc = {}; for (const it of jj?.items ?? []) kc[it[0]] = (kc[it[0]] || 0) + 1;
  console.log('  kinds', JSON.stringify(kc));
  for (const it of jj?.items ?? []) if (!/^\/[^\s]*$/.test(it[3])) bad.push(`index href format ${it[3]}`);
  // 候補の飛び先は実在する（種類ごとに標本。駅・店・街は先頭と等間隔）
  const byKind = {}; for (const it of jj?.items ?? []) (byKind[it[0]] ||= []).push(it);
  let linkOk = 0;
  for (const [k, list] of Object.entries(byKind)) {
    const step = Math.max(1, Math.floor(list.length / 25));
    for (let i = 0; i < list.length; i += step) { const r = await get(list[i][3]); linkOk++; if (r.s !== 200) bad.push(`index link ${r.s} ${list[i][3]}`) }
  }
  console.log('  index sample links checked', linkOk);
}

// ───── 公開スイッチ ON の確認（robots.txt・sitemap.xml・/portal-home の扱い）─────
{
  const rb = await (await fetch(B + '/robots.txt')).text();
  for (const p of ['/sitemap.xml','/station/sitemap.xml','/beauty/sitemap.xml','/bodycare/sitemap.xml','/pet/sitemap.xml','/leisure/sitemap.xml','/stay/sitemap.xml','/videos/sitemap.xml','/photos/sitemap.xml'])
    if (!rb.includes(`Sitemap: https://machinowa.tokyo${p}\n`) && !rb.trimEnd().endsWith(`Sitemap: https://machinowa.tokyo${p}`)) bad.push(`robots.txt に ${p} が無い`);
  if (!/Disallow: \/admin\//.test(rb)) bad.push('robots.txt の Disallow が変わった');
  const sm = await (await fetch(B + '/sitemap.xml')).text();
  if (!sm.includes('<loc>https://machinowa.tokyo/gourmet</loc>')) bad.push('sitemap.xml に /gourmet が無い');
  if (!sm.includes('<loc>https://machinowa.tokyo</loc>')) bad.push('sitemap.xml に / が無い');
  const ph = await fetch(B + '/portal-home', { redirect: 'manual' });
  if (![307, 308].includes(ph.status) || (ph.headers.get('location') || '').replace(/^https?:\/\/[^/]+/, '') !== '/') bad.push(`/portal-home は / へ redirect のはず: ${ph.status} ${ph.headers.get('location')}`);
  console.log('robots.txt sitemaps:', (rb.match(/^Sitemap: /gm) || []).length, '/ sitemap.xml has /gourmet:', sm.includes('/gourmet'), '/ /portal-home ->', ph.status, ph.headers.get('location'));
}

console.log('PROBLEMS',bad.length);console.log(bad.slice(0,60).join('\n'));
if (bad.length) process.exitCode = 1;
