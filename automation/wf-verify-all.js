export const meta = {
  name: 'machinowa-verify-all-images',
  description: '全154本の全スポット画像を1枚ずつ開き、被写体・地域の一致を判定（誤掲載検出）',
  phases: [{ title: 'Audit' }],
}
const ids = typeof args === 'string' ? JSON.parse(args) : args
const SCHEMA = {
  type: "object", additionalProperties: false, required: ["id", "results"],
  properties: {
    id: { type: "string" },
    results: {
      type: "array",
      items: {
        type: "object", additionalProperties: false, required: ["spot", "verdict", "note"],
        properties: {
          spot: { type: "integer" },
          verdict: { type: "string", enum: ["ok", "area", "mismatch"] },
          note: { type: "string" }
        }
      }
    }
  }
}
function p(id) {
  const path = `/Users/shunta/claude/gourmet-portal/automation/verify-art/${id}.json`
  return `あなたはマチノワの画像校閲者（最重要任務＝写真が実物・正しい地域と一致することの担保）。記事id="${id}"。\n\nReadツールで ${path} を読む（spots[{spot,name,localFile}]）。\n各spotについて localFile の画像を必ずReadツールで開いて実際に見る。そのうえで spot の name（その地点/施設の名称。記事idが地域を示す: 例 new-kamakura-* は鎌倉、kansai-* は関西、new-* で横浜/東京近郊など）と照合し、次の3段階で判定:\n- "ok": その地点・施設そのものが明確に写っている（実物一致）。\n- "area": その地点ピンポイントではないが、同じ街・同じエリアの実景である（地域は正しい。街ガイドとして許容範囲）。\n- "mismatch": 【別の都道府県・別の都市・全く別の場所の写真】【地図・図表・ロゴ/看板のみ・人物ポートレート・無関係な被写体】= 誤掲載。これは必ず検出する。\n\n判断に迷うとき、地域(都市)が合っているかを最優先。地域が確実に違えば mismatch。地域は合うが地点が違うなら area。\n\n全spotについて {spot, verdict, note} を返す（noteは「何が写っているか」を簡潔に）。`
}
phase('Audit')
log(`${ids.length}記事の全画像を1枚ずつ目視照合`)
const out = await parallel(ids.map((id) => () => agent(p(id), { label: `audit:${id}`, phase: 'Audit', schema: SCHEMA })))
const ok = out.filter(Boolean)
let cOk = 0, cArea = 0, cMis = 0
const mismatches = []
for (const v of ok) for (const r of (v.results || [])) {
  if (r.verdict === 'ok') cOk++
  else if (r.verdict === 'area') cArea++
  else { cMis++; mismatches.push({ id: v.id, spot: r.spot, note: r.note }) }
}
log(`完了 ${ok.length}/${ids.length}記事 / ok ${cOk} / area ${cArea} / mismatch ${cMis}`)
return { audited: ok.length, ok: cOk, area: cArea, mismatch: cMis, mismatches, verdicts: ok }
