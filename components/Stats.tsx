import { NATIONAL } from "@/lib/data";

export default function Stats() {
  const N = NATIONAL;
  return (
    <section className="stats">
      <div className="section-head" style={{ padding: "0 0 40px" }}>
        <div className="no">
          <b>◎ ー</b>NATIONAL / 全国
        </div>
        <h2 className="reveal-line">
          <span>
            日本全国、<em>味の地図</em>
          </span>
        </h2>
        <div className="lede">北海道から沖縄まで、編集部の足跡。</div>
      </div>
      <div className="stats-grid">
        {N.stats.map((s, i) => (
          <div key={i} className="stat reveal">
            <div className="n">
              {s.n.includes(".") ? (
                <>
                  {s.n.split(".")[0]}.<em>{s.n.split(".")[1]}</em>
                </>
              ) : (
                s.n
              )}
            </div>
            <div className="l">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
