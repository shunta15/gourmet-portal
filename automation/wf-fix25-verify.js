export const meta = {
  name: 'machinowa-fix25-verify',
  description: '誤掲載25スポットの新候補を開いて、正しい地点/エリアの1枚を厳格に選ぶ',
  phases: [{ title: 'Verify' }],
}
const items = typeof args === 'string' ? JSON.parse(args) : args
const SCHEMA = {
  type: "object", additionalProperties: false, required: ["id", "spot", "chosen", "verdict", "reason"],
  properties: {
    id: { type: "string" }, spot: { type: "integer" },
    chosen: { type: "integer", minimum: -1, maximum: 9 },
    verdict: { type: "string", enum: ["ok", "area", "reject"] },
    reason: { type: "string" },
  }
}
function p(it) {
  const path = `/Users/shunta/claude/gourmet-portal/automation/fix25-cand.json`
  return `あなたはマチノワの画像校閲者（最重要＝正しい地点・正しい地域の写真であること）。\n\n対象スポット: id="${it.id}", spot=${it.spot}, 名称「${it.name}」, エリア「${it.area}」。\nReadツールで ${path} を読み、その中から id="${it.id}" かつ spot=${it.spot} の要素を探し、candidates[]（各 index・localPath・tag(specific/area)）を得る。\n\n各candidateの localPath を Readツールで開いて実際に見て判定:\n- まず tag=specific（その地点そのもの）を優先的に確認。「${it.name}」の実物が明確に写っていれば verdict="ok"、その index を chosen に。\n- specificで適切な物が無ければ tag=area（同じ街・エリアの代表的実景）を見て、エリアが確実に正しければ verdict="area"、その index を chosen に。\n- 【別の都道府県・別の都市・全く別の場所・地図/図表/ロゴ/看板のみ/人物ポートレート/無関係被写体】は絶対に選ばない。良いものが一つも無ければ chosen=-1, verdict="reject"。\n\n迷ったら地域(都市)の正しさを最優先。{id, spot, chosen, verdict, reason} を返す。id="${it.id}", spot=${it.spot}。`
}
phase('Verify')
const out = await parallel(items.map((it) => () => agent(p(it), { label: `v:${it.id}#${it.spot}`, phase: 'Verify', schema: SCHEMA })))
const ok = out.filter(Boolean)
let okC = 0, areaC = 0, rej = 0
for (const v of ok) { if (v.verdict === 'ok') okC++; else if (v.verdict === 'area') areaC++; else rej++; }
log(`完了 ${ok.length} / ok ${okC} / area ${areaC} / reject ${rej}`)
return { verdicts: ok, ok: okC, area: areaC, reject: rej }
