import { RESTAURANTS, REGIONS, type RegionKey } from "@/lib/data";
import ProgressRefresher from "./Refresher";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Progress — マチノワ運用ダッシュボード",
  robots: { index: false, follow: false },
};

const TARGETS: { id: string; name: string }[] = [
  { id: "r01", name: "やきとり嶋家" },
  { id: "r02", name: "キツネノアトチ" },
  { id: "r03", name: "鶏居酒屋pao福" },
  { id: "r04", name: "お喜楽イタリア創作料理 Basta Basta" },
  { id: "r05", name: "手羽だるま 緑橋店" },
  { id: "r06", name: "らーめん渡邉" },
  { id: "r07", name: "中国菜 たな華" },
  { id: "r08", name: "やまみ" },
  { id: "r09", name: "ももやき酒場 雄火屋" },
  { id: "r10", name: "第三共進丸" },
  { id: "r12", name: "社交酒場イム" },
  { id: "r13", name: "KITEYA" },
  { id: "r14", name: "焼肉ホルモン 肉ぶくろ" },
  { id: "r15", name: "あんさんぶる" },
  { id: "r16", name: "ほたる珈房" },
  { id: "r17", name: "白泉堂" },
  { id: "r18", name: "居酒屋 浅い月会い 大阪城北詰駅前店" },
  { id: "r19", name: "おばんざいと炭火焼 小次郎" },
  { id: "r20", name: "アンナンブルー izumi168" },
  { id: "r21", name: "月と桜" },
  { id: "r22", name: "Michikusa Coffee Brewers" },
  { id: "r23", name: "上町珈琲" },
  { id: "r24", name: "居酒屋天佑 せがれ" },
];

export default function ProgressPage() {
  const byId = new Map(RESTAURANTS.map((r) => [r.id, r]));
  const live = TARGETS.filter((t) => byId.has(t.id));
  const pending = TARGETS.filter((t) => !byId.has(t.id));

  const regionCounts = (Object.keys(REGIONS) as RegionKey[]).reduce<
    Record<string, number>
  >((acc, k) => {
    acc[k] = RESTAURANTS.filter((r) => r.region === k).length;
    return acc;
  }, {});

  const updated = new Date().toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });

  return (
    <main
      style={{
        padding: "32px 24px",
        fontFamily:
          "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace",
        background: "#0f0e0c",
        color: "#f4efe3",
        minHeight: "100vh",
        fontSize: 13,
        lineHeight: 1.6,
      }}
    >
      <ProgressRefresher intervalMs={15000} />
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <h1 style={{ fontSize: 22, margin: 0, letterSpacing: 2 }}>
            MACHINOWA · PROGRESS
          </h1>
          <div style={{ opacity: 0.6, fontSize: 11 }}>
            auto-refresh 15s · {updated}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <Stat
            label="LIVE"
            value={`${live.length}`}
            sub={`/ ${TARGETS.length}`}
          />
          <Stat label="PENDING" value={`${pending.length}`} />
          <Stat
            label="REGIONS"
            value={`${Object.keys(REGIONS).length}`}
            sub="active"
          />
          <Stat
            label="PROGRESS"
            value={`${Math.round((live.length / TARGETS.length) * 100)}%`}
          />
        </div>

        <Section title="REGION BREAKDOWN">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
              gap: 8,
            }}
          >
            {(Object.keys(REGIONS) as RegionKey[]).map((k) => (
              <div
                key={k}
                style={{
                  border: "1px solid #2a2622",
                  padding: "8px 10px",
                }}
              >
                <div style={{ opacity: 0.55, fontSize: 10 }}>
                  {REGIONS[k].name}
                </div>
                <div style={{ fontSize: 18, fontWeight: 500 }}>
                  {regionCounts[k]}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="STORES">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: 4,
            }}
          >
            {TARGETS.map((t) => {
              const r = byId.get(t.id);
              const ok = !!r;
              return (
                <div
                  key={t.id}
                  style={{
                    padding: "6px 10px",
                    borderLeft: `3px solid ${ok ? "#7fb069" : "#3a342d"}`,
                    background: ok ? "#15171280" : "#1a1815",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      opacity: 0.55,
                      fontSize: 10,
                      minWidth: 28,
                    }}
                  >
                    {t.id}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {t.name}
                  </span>
                  {r && (
                    <span style={{ opacity: 0.5, fontSize: 10 }}>
                      {REGIONS[r.region].name}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 10,
                      color: ok ? "#a3c585" : "#5a5045",
                      minWidth: 56,
                      textAlign: "right",
                    }}
                  >
                    {ok ? "● LIVE" : "○ pending"}
                  </span>
                </div>
              );
            })}
          </div>
        </Section>

        <div
          style={{
            marginTop: 24,
            opacity: 0.4,
            fontSize: 10,
            textAlign: "center",
          }}
        >
          shows deployed state · /progress · noindex
        </div>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #2a2622",
        padding: "12px 14px",
      }}
    >
      <div style={{ opacity: 0.5, fontSize: 10, letterSpacing: 1 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <div style={{ fontSize: 26, fontWeight: 500 }}>{value}</div>
        {sub && <div style={{ opacity: 0.5, fontSize: 11 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          opacity: 0.5,
          fontSize: 10,
          letterSpacing: 2,
          marginBottom: 10,
        }}
      >
        ◎ {title}
      </div>
      {children}
    </div>
  );
}
