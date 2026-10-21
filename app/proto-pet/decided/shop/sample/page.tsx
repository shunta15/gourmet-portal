import Shell from "@/components/portal/petproto/decided/common/Shell";
import { Breadcrumb, Hero } from "@/components/portal/petproto/decided/shop/Hero";
import { Gallery } from "@/components/portal/petproto/decided/shop/Gallery";
import { AboutInfo } from "@/components/portal/petproto/decided/shop/About";
import { Menu, Facility } from "@/components/portal/petproto/decided/shop/MenuFacility";
import { Scene, Access } from "@/components/portal/petproto/decided/shop/SceneAccess";
import { Review, Related } from "@/components/portal/petproto/decided/shop/ReviewRelated";
import ShopTabs from "@/components/portal/petproto/decided/shop/ShopTabs";
import MobileBar from "@/components/portal/petproto/decided/shop/MobileBar";
import "@/components/portal/petproto/decided/shop/shop.css";

// ペット「決定案」②店舗紹介(店舗詳細)。見本 店.webp の完全再現。店名・評価・料金・文章は仮の内容(見本の帯は layout が出す)。
export default function Page() {
  return (
    <Shell page="shop">
      <div className="sp-bg">
       <div className="sp">
        <Breadcrumb />
        <Hero />
        <Gallery />
        <div className="sp-body">
          <ShopTabs />
          <AboutInfo />
          <Menu />
          <Facility />
          <Scene />
          <Access />
          <Review />
          <Related />
        </div>
        <MobileBar />
       </div>
      </div>
    </Shell>
  );
}
