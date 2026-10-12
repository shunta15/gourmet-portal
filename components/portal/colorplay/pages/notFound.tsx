import Link from "next/link";
import Header from "../Header";
import Footer from "../Footer";
import type { CpSite } from "@/lib/portal/colorplay/site";

/** COLOR PLAY の 404(店が見つからないときなど)。検索エンジンには載せない(metadata は呼び出し側) */
export default function CpNotFound({ site }: { site: CpSite }) {
  return (
    <>
      <Header base={site.base} logoA={site.logoA} logoB={site.logoB} />
      <main id="cp-main" tabIndex={-1}>
        <section className="cp-wrap cp-nf">
          <p className="cp-script cp-nf-sc" aria-hidden="true">Not Found</p>
          <h1 className="cp-h1s">ページが見つかりません</h1>
          <p>お探しのページは、移動したか、掲載を終えた可能性があります。</p>
          <p className="cp-more"><Link href={`${site.base}/search`}>お店を探す</Link></p>
        </section>
      </main>
      <Footer site={site} />
    </>
  );
}
