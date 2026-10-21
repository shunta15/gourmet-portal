import { IconArrow } from "../common/Icons";
import { IcCalendar, IcMail } from "./ShopIcons";

/** スマホだけ:予約・問い合わせを下に固定する細い帯 */
export default function MobileBar() {
  return (
    <div className="sp-mbar" role="region" aria-label="予約・お問い合わせ">
      <a href="#access" className="sp-mbar-b sp-mbar-b--main pt-press">
        <IcCalendar aria-hidden="true" />
        空席確認・予約する
      </a>
      <a href="#access" className="sp-mbar-b sp-mbar-b--sub pt-press">
        <IcMail aria-hidden="true" />
        お問い合わせ
      </a>
    </div>
  );
}
