import FindForm from "./FindForm";
import type { CuisineCount, SceneCount } from "@/lib/portal/noren/openSearch";
import "./opensearch.css";

/**
 * 地域のページ（/region/<key>）・シーンのページ（/scene/<slug>）の上に置く「絞り込みの帯」。押すと /search?region=<key>&… などの結果へ移る（検索のページが「店をさがす」の中心）。
 * 札の件数は呼び出し側のサーバーが数えて渡す（lib/portal/noren/openSearch.ts。業種は matchesBroad、シーンは shopInScene。検索の絞り込みと同じ判定）。
 * 星・点数・口コミの件数・順位は出さない。
 */

function CuisineButtons({ cuisines }: { cuisines: CuisineCount[] }) {
  return (
    <ul className="vOs-genre vFb-genre" aria-label="業種の分類">
      {cuisines.map((c) => (
        <li key={c.key}>
          <button type="submit" name="cuisine" value={c.label} className="vOs-g" data-cursor="GO">
            <b className="vOs-g-k" aria-hidden="true">
              {c.kanji}
            </b>
            <span className="vOs-g-t">
              <span className="vOs-g-n">{c.label}</span>
              <i className="vOs-g-c">
                {c.count}
                <small>軒</small>
              </i>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** 地域のページの帯: この地域で、業種 7 札・利用シーンの札・キーワードで絞る */
export function RegionFindBand({ regionKey, regionName, cuisines, scenes }: { regionKey: string; regionName: string; cuisines: CuisineCount[]; scenes: SceneCount[] }) {
  return (
    <section className="vFb" aria-labelledby="vFb-h">
      <div className="vFb-in">
        <h2 id="vFb-h" className="vFb-h">
          {regionName}で<em>絞る。</em>
        </h2>
        <FindForm hidden={{ region: regionKey }} label={`${regionName}の店をさがす`}>
          <div className="vFb-kw">
            <div className="vI-fld">
              <label htmlFor="vFb-q">キーワード</label>
              <input id="vFb-q" name="q" type="text" enterKeyHint="search" autoComplete="off" placeholder="店名・エリア・料理名" />
            </div>
            <button type="submit" className="vI-btn" data-cursor="SEARCH">
              さがす →
            </button>
          </div>
          <p className="vFb-l">業種</p>
          <CuisineButtons cuisines={cuisines} />
          <p className="vFb-l">利用シーン</p>
          <ul className="vOs-chips" aria-label="利用シーン">
            {scenes.map((s) => (
              <li key={s.slug}>
                <button type="submit" name="scene" value={s.slug} className="vOs-chip" data-cursor="GO">
                  <span>{s.name}</span>
                  <i>
                    {s.count}
                    <small>軒</small>
                  </i>
                </button>
              </li>
            ))}
          </ul>
        </FindForm>
      </div>
    </section>
  );
}

/** シーンのページの帯: このシーンで、エリア（セレクト）・業種 7 札で絞る */
export function SceneFindBand({
  sceneSlug,
  sceneName,
  regions,
  cuisines,
}: {
  sceneSlug: string;
  sceneName: string;
  regions: { key: string; name: string; count: number }[];
  cuisines: CuisineCount[];
}) {
  return (
    <section className="vFb" aria-labelledby="vFb-h">
      <div className="vFb-in">
        <h2 id="vFb-h" className="vFb-h">
          {sceneName}で<em>絞る。</em>
        </h2>
        <FindForm hidden={{ scene: sceneSlug }} label={`${sceneName}の店をさがす`}>
          <div className="vFb-kw">
            <div className="vI-fld">
              <label htmlFor="vFb-region">エリア</label>
              <select id="vFb-region" name="region" defaultValue="">
                <option value="">すべてのエリア</option>
                {regions.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.name}（{r.count}）
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="vI-btn" data-cursor="SEARCH">
              さがす →
            </button>
          </div>
          <p className="vFb-l">業種（エリアを選んでから押すと、そのエリアの結果へ）</p>
          <CuisineButtons cuisines={cuisines} />
        </FindForm>
      </div>
    </section>
  );
}
