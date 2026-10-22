import type { SVGProps } from "react";
import { IconBed, IconPin } from "../common/Icons";
import { IconCar, IconDining, IconWifi, IconCircleCheck, IconTrain, IconCalendar } from "../search/VkIcons";

/**
 * 店の紹介の「設備・サービス」の列(8 つまでのアイコンが横に並ぶ)と、アクセスの行・右上の箱が使う線のアイコン。
 * 線の太さ・色は common/Icons.tsx と同じ(24 角・線幅 1.4・currentColor)。common/ には足さず、店の紹介の中だけで持つ。
 * 当てはまる絵が無い設備は出さない(丸にチェックだけの「何か」は並べない)。キー → 絵は FAC に 1 か所。
 */
type P = SVGProps<SVGSVGElement>;
const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const S = (p: P, children: React.ReactNode) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...line} {...p}>
    {children}
  </svg>
);

const Parking = (p: P) =>
  S(p, <>
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <path d="M10 16.5V8h3.1a2.6 2.6 0 0 1 0 5.2H10" />
  </>);
const Cafe = (p: P) =>
  S(p, <>
    <path d="M5 9.5h11v4.2A4.3 4.3 0 0 1 11.7 18h-2.4A4.3 4.3 0 0 1 5 13.7z" />
    <path d="M16 10.5h1.6a2.2 2.2 0 0 1 0 4.4H15.6M8 3.8c-.9 1 .9 1.9 0 2.9M11.6 3.8c-.9 1 .9 1.9 0 2.9" />
    <path d="M4.5 20.4h12" />
  </>);
const Shop = (p: P) =>
  S(p, <>
    <path d="M5.5 8.5h13l-.9 11h-11.2z" />
    <path d="M9 11V7.6a3 3 0 0 1 6 0V11" />
  </>);
const Grill = (p: P) =>
  S(p, <>
    <path d="M4 9.5h16a8 8 0 0 1-16 0z" />
    <path d="M8 17.6 6.4 21M16 17.6 17.6 21M10 6.2c-.8.9.8 1.7 0 2.6M14 6.2c-.8.9.8 1.7 0 2.6" />
  </>);
const Bath = (p: P) =>
  S(p, <>
    <path d="M3.5 12.5h17v1.4a4.6 4.6 0 0 1-4.6 4.6H8.1a4.6 4.6 0 0 1-4.6-4.6z" />
    <path d="M6.6 12.5V6.8A2.3 2.3 0 0 1 8.9 4.5h.6M7.2 18.5 6.4 20.6M16.8 18.5l.8 2.1" />
  </>);
const Shower = (p: P) =>
  S(p, <>
    <path d="M6 20.5V8.2A3.7 3.7 0 0 1 9.7 4.5h2.8" />
    <path d="M12.5 4.5a5.7 5.7 0 0 1 5.7 5.7h-8.4a5.7 5.7 0 0 1 2.7-5.7z" />
    <path d="M11.2 13.2v1.4M14 13.2v1.4M16.8 13.2v1.4M12.6 16.6v1.4M15.4 16.6v1.4" />
  </>);
const Kitchen = (p: P) =>
  S(p, <>
    <rect x="4" y="3.8" width="16" height="16.4" rx="1.6" />
    <path d="M4 9.2h16" />
    <circle cx="9" cy="14.8" r="2.2" />
    <circle cx="15.4" cy="14.8" r="2.2" />
    <path d="M8 6.5h.01M11 6.5h.01" />
  </>);
const Sink = (p: P) =>
  S(p, <>
    <path d="M7 11V6.4A2.4 2.4 0 0 1 9.4 4h3.2a2.4 2.4 0 0 1 2.4 2.4V7" />
    <path d="M15 7h2.2M4 11.5h16v2.2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
    <path d="M10 8.8v1" />
  </>);
const Laundry = (p: P) =>
  S(p, <>
    <rect x="4.5" y="3.5" width="15" height="17" rx="2" />
    <path d="M4.5 8h15M8 5.8h.01M11 5.8h.01" />
    <circle cx="12" cy="14" r="3.7" />
    <path d="M9.6 14.4c1 .9 1.9-.8 2.9.1s1.6.3 2.1-.4" />
  </>);
const Fridge = (p: P) =>
  S(p, <>
    <rect x="6" y="3.5" width="12" height="17" rx="1.8" />
    <path d="M6 10.4h12M9 6.6v1.8M9 12.8v2.8" />
  </>);
const Aircon = (p: P) =>
  S(p, <>
    <rect x="3.5" y="5" width="17" height="6.2" rx="1.6" />
    <path d="M7 8h6M7.5 14.4c-.4 1.3.6 2 .2 3.3M12 14.4c-.4 1.3.6 2 .2 3.3M16.5 14.4c-.4 1.3.6 2 .2 3.3" />
  </>);
const Dryer = (p: P) =>
  S(p, <>
    <path d="M4 9.4a3.6 3.6 0 0 1 3.6-3.6H15l5 2.2v3.6l-5 2.2H7.6A3.6 3.6 0 0 1 4 10.2z" />
    <path d="M10.4 13.8 9 20h3l.8-5.4" />
  </>);
const Toilet = (p: P) =>
  S(p, <>
    <path d="M7 3.8h10v5H7zM5 8.8h14c0 4.2-2.4 6.6-5.2 7v2.4h2.4M8.6 18.2H12" />
  </>);
const Mirror = (p: P) =>
  S(p, <>
    <ellipse cx="12" cy="9.6" rx="5.2" ry="6.2" />
    <path d="M12 15.8v4.6M8.6 20.4h6.8M9.6 8c.3-1.3 1.2-2 2.4-2.1" />
  </>);
const Pool = (p: P) =>
  S(p, <>
    <path d="M8 15V6.6a2.2 2.2 0 0 1 4.4 0M15 15V6.6a2.2 2.2 0 0 1 4.4 0M8 9.6h7M8 12.4h7" />
    <path d="M3 18.2c1.5-1.4 3-1.4 4.5 0s3 1.4 4.5 0 3-1.4 4.5 0 3 1.4 4.5 0" />
  </>);
const Tennis = (p: P) =>
  S(p, <>
    <ellipse cx="9.4" cy="9.4" rx="5.4" ry="6" transform="rotate(-40 9.4 9.4)" />
    <path d="m13.2 14 5.2 5.4M6.4 6.2l5.8 6.4" />
    <circle cx="18" cy="6.2" r="1.7" />
  </>);
const Billiards = (p: P) =>
  S(p, <>
    <path d="M12 4 20 19.5H4z" />
    <circle cx="12" cy="13.6" r="1.8" />
    <path d="M12 8.8v.01M9.6 15.4v.01" />
  </>);
const Flame = (p: P) =>
  S(p, <>
    <path d="M12 3.6c.6 3.2 5 5 5 9.6a5 5 0 0 1-10 0c0-2 .9-3.2 1.9-4.2.3 1.2.8 1.8 1.5 2 .1-2.9.4-5.2 1.6-7.4z" />
    <path d="M10.2 16.2a1.9 1.9 0 0 0 3.6 0c0-1-.8-1.5-1.8-2.6-.9 1-1.8 1.6-1.8 2.6z" />
  </>);
const Zabuton = (p: P) =>
  S(p, <>
    <path d="M3.5 12.2 12 8l8.5 4.2L12 16.4z" />
    <path d="M3.5 12.2v3L12 19.4l8.5-4.2v-3" />
  </>);
const Meeting = (p: P) =>
  S(p, <>
    <path d="M4 11h16M6 11v8M18 11v8M8.4 11l-1-4.4h9.2l-1 4.4" />
    <path d="M9.5 4.2h5" />
  </>);
const Fence = (p: P) =>
  S(p, <>
    <path d="M4 20.4V8.6l2-2.2 2 2.2v11.8M10 20.4V8.6l2-2.2 2 2.2v11.8M16 20.4V8.6l2-2.2 2 2.2v11.8M3 12.4h18M3 16.8h18" />
  </>);
const Tent = (p: P) =>
  S(p, <>
    <path d="M2.8 19.6 12 4.6l9.2 15z" />
    <path d="M12 4.6v15M12 19.6l-3.4-5.4M12 19.6l3.4-5.4" />
  </>);
const Hammock = (p: P) =>
  S(p, <>
    <path d="M3 5.4v13.2M21 5.4v13.2M3 8.4c3 8.4 15 8.4 18 0" />
    <path d="M6.4 11.4l1.2-1.8M17.6 11.4l-1.2-1.8" />
  </>);
const NoSmoke = (p: P) =>
  S(p, <>
    <circle cx="12" cy="12" r="8.4" />
    <path d="m6.1 17.9 11.8-11.8M8.4 13.4h5.6M16.4 13.4h.01" />
  </>);
const Plug = (p: P) =>
  S(p, <>
    <path d="M9 3.6v4.2M15 3.6v4.2M6.6 7.8h10.8v3.4a5.4 5.4 0 0 1-10.8 0zM12 16.6v3.8" />
  </>);
const Dish = (p: P) =>
  S(p, <>
    <path d="M3.5 14h17a8.5 8.5 0 0 1-17 0z" />
    <path d="M12 5.4v3.4M4.4 17.2h15.2" />
  </>);
const Users = (p: P) =>
  S(p, <>
    <circle cx="9" cy="8.4" r="3" />
    <path d="M3.4 19.2c.4-3.4 2.6-5.2 5.6-5.2s5.2 1.8 5.6 5.2" />
    <circle cx="17" cy="9.2" r="2.4" />
    <path d="M16.4 14.2c2.3.1 3.8 1.5 4.2 4.2" />
  </>);
const Clock = (p: P) =>
  S(p, <>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 7.2V12l3.2 2" />
  </>);
const Globe = (p: P) =>
  S(p, <>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M3.8 12h16.4M12 3.6c2.6 2.4 3.8 5.2 3.8 8.4s-1.2 6-3.8 8.4c-2.6-2.4-3.8-5.2-3.8-8.4S9.4 6 12 3.6z" />
  </>);
const Dogwash = (p: P) =>
  S(p, <>
    <path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM8 12V7.4A2.4 2.4 0 0 1 10.4 5H14" />
    <path d="M14 5v2.2M8.4 3.2l.01.01M11.6 2.4l.01.01" />
  </>);
const Bag = (p: P) =>
  S(p, <>
    <path d="M6 7.5h12l1 12.5H5z" />
    <path d="M9 10.5V6.8a3 3 0 0 1 6 0v3.7" />
  </>);

const Paw = (p: P) =>
  S(p, <>
    <ellipse cx="7" cy="10" rx="1.7" ry="2.2" />
    <ellipse cx="11" cy="6.6" rx="1.7" ry="2.2" />
    <ellipse cx="15.2" cy="6.8" rx="1.7" ry="2.2" />
    <ellipse cx="18.4" cy="10.6" rx="1.7" ry="2.2" />
    <path d="M8.2 17c0-2.6 2.2-4.6 4.4-4.6 2.4 0 4.2 2 4.2 4.2 0 2-1.6 2.6-3.4 2.4-1.2-.1-1.5-.5-2.3-.5-.9 0-1.4.5-2.4.4-.6-.1-.5-1-.5-1.9z" />
  </>);
const Onsen = (p: P) =>
  S(p, <>
    <path d="M8 3.6c-1.4 1.4 1.4 2.8 0 4.2M12 3.6c-1.4 1.4 1.4 2.8 0 4.2M16 3.6c-1.4 1.4 1.4 2.8 0 4.2" />
    <path d="M3.5 12.5h17c0 4.2-2.6 7-6.4 7H9.9c-3.8 0-6.4-2.8-6.4-7z" />
  </>);
const Phone = (p: P) =>
  S(p, <>
    <path d="M6.2 3.8h3l1.4 4-2 1.3a11 11 0 0 0 5.3 5.3l1.3-2 4 1.4v3a1.8 1.8 0 0 1-2 1.8C10.8 18.6 5.4 13.2 4.4 5.8a1.8 1.8 0 0 1 1.8-2z" />
  </>);

export type FacKey =
  | "wifi" | "parking" | "dining" | "cafe" | "shop" | "bbq" | "paw" | "onsen" | "bath" | "shower" | "kitchen" | "sink" | "laundry" | "fridge"
  | "aircon" | "dryer" | "toilet" | "mirror" | "pool" | "tennis" | "billiards" | "flame" | "zabuton" | "meeting" | "fence" | "tent" | "hammock"
  | "nosmoke" | "plug" | "dish" | "bed" | "users" | "dogwash" | "bag" | "locker" | "clock" | "calendar";

const FAC: Record<FacKey, (p: P) => React.ReactElement> = {
  wifi: IconWifi, parking: Parking, dining: IconDining, cafe: Cafe, shop: Shop, bbq: Grill, paw: Paw, onsen: Onsen, bath: Bath, shower: Shower,
  kitchen: Kitchen, sink: Sink, laundry: Laundry, fridge: Fridge, aircon: Aircon, dryer: Dryer, toilet: Toilet, mirror: Mirror, pool: Pool, tennis: Tennis,
  billiards: Billiards, flame: Flame, zabuton: Zabuton, meeting: Meeting, fence: Fence, tent: Tent, hammock: Hammock, nosmoke: NoSmoke, plug: Plug,
  dish: Dish, bed: IconBed, users: Users, dogwash: Dogwash, bag: Bag, locker: Bag, clock: Clock, calendar: IconCalendar,
};

export function FacIcon({ k, ...p }: { k: FacKey } & P) {
  const I = FAC[k] ?? IconCircleCheck;
  return <I {...p} />;
}

/** アクセスの行・右上の箱のアイコン */
export type RowIcon = "car" | "train" | "pin" | "clock" | "web" | "calendar" | "bed" | "users" | "dish" | "paw" | "phone";
const ROW: Record<RowIcon, (p: P) => React.ReactElement> = { car: IconCar, train: IconTrain, pin: IconPin, clock: Clock, web: Globe, calendar: IconCalendar, bed: IconBed, users: Users, dish: Dish, paw: Paw, phone: Phone };
export function RowIconEl({ k, ...p }: { k: RowIcon } & P) {
  const I = ROW[k] ?? IconPin;
  return <I {...p} />;
}
