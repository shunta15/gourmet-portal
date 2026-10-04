/**
 * 店のリンク（電話・地図・予約・公式サイト・SNS）をボタンの一覧に直す純関数。サーバー・クライアントのどちらからも使える（データを読まない）。
 *
 * 守ること:
 *  - 値がある項目だけボタンにする。値を推測で作らない・無い値を補わない。
 *  - SNS のリンクは https?:// の URL だけ。ホストが SNS のものと合わないものは、別の SNS として出さず落とす
 *    （例: instagram の欄に X の URL が入っていたら X のボタンにする。どの SNS でもない URL は出さない）。
 *  - 例外は instagram の欄の「ユーザー名だけ」（@name / name）。欄の名前そのものが Instagram なので、
 *    https://www.instagram.com/name/ に直す（見つかった値の書き方を整えるだけ。ユーザー名は変えない）。
 *  - 外部リンクは rel="noopener noreferrer" target="_blank"（描画側）。
 */

export type SocialKind = "instagram" | "tiktok" | "x" | "facebook" | "line" | "website";

/** 店データの SNS の欄（どれも任意） */
export type ShopSocial = Partial<Record<SocialKind, string | undefined>>;

export type LinkKind = "phone" | "map" | "reserve" | SocialKind;

export interface ShopLink {
  kind: LinkKind;
  label: string;
  href: string;
  /** 別タブで開く外部リンクか（tel: は false） */
  external: boolean;
}

export const SOCIAL_LABEL: Record<SocialKind, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  x: "X",
  facebook: "Facebook",
  line: "LINE",
  website: "公式サイト",
};

/** ボタンを並べる順 */
export const SOCIAL_ORDER: SocialKind[] = ["website", "instagram", "tiktok", "x", "facebook", "line"];

const HOSTS: Record<Exclude<SocialKind, "website">, RegExp> = {
  instagram: /^(www\.|m\.)?(instagram\.com|instagr\.am)$/,
  tiktok: /^(www\.|m\.|vm\.|vt\.)?tiktok\.com$/,
  x: /^(www\.|mobile\.)?(x\.com|twitter\.com)$/,
  facebook: /^(www\.|m\.|ja-jp\.)?(facebook\.com|fb\.com|fb\.me)$/,
  line: /^((page|line)\.)?line\.me$|^lin\.ee$/,
};

const HANDLE = /^@?[A-Za-z0-9._]{1,30}$/;

function parseHttp(raw: string): URL | null {
  if (!/^https?:\/\//i.test(raw)) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (u.username || u.password) return null;
    return u;
  } catch {
    return null;
  }
}

function kindOfHost(host: string): Exclude<SocialKind, "website"> | null {
  const h = host.toLowerCase();
  for (const k of Object.keys(HOSTS) as (keyof typeof HOSTS)[]) {
    if (HOSTS[k].test(h)) return k;
  }
  return null;
}

/**
 * 欄 field に入っていた値 raw が、どの種類のリンクとして出せるか。出せなければ null。
 * ホストが SNS のものならその SNS（欄とずれていても、実際のホストの種類にそろえる）。
 * どの SNS でもない http(s) の URL は、website の欄のときだけ公式サイトとして出す。
 */
export function classifySocial(field: SocialKind, raw: string | undefined | null): { kind: SocialKind; href: string } | null {
  const v = (raw ?? "").trim();
  if (!v) return null;
  const u = parseHttp(v);
  if (u) {
    const k = kindOfHost(u.hostname);
    if (k) return { kind: k, href: v };
    return field === "website" ? { kind: "website", href: v } : null;
  }
  if (field === "instagram" && HANDLE.test(v)) {
    return { kind: "instagram", href: `https://www.instagram.com/${v.replace(/^@/, "")}/` };
  }
  return null;
}

/** 店の SNS の欄から、出せるリンクだけを SOCIAL_ORDER の順に返す。同じ種類は先に見つかった1つ */
export function socialLinks(social: ShopSocial): ShopLink[] {
  const found = new Map<SocialKind, string>();
  // 欄の名前どおりの値を先に採る（instagram の欄の X の URL が、x の欄の値を押しのけないように）
  const fields = Object.keys(SOCIAL_LABEL) as SocialKind[];
  for (const pass of [0, 1]) {
    for (const f of fields) {
      const c = classifySocial(f, social[f]);
      if (!c) continue;
      const own = c.kind === f;
      if ((pass === 0) !== own) continue;
      if (!found.has(c.kind)) found.set(c.kind, c.href);
    }
  }
  return SOCIAL_ORDER.filter((k) => found.has(k)).map((k) => ({
    kind: k,
    label: SOCIAL_LABEL[k],
    href: found.get(k)!,
    external: true,
  }));
}

/** tel: のリンクに使える電話番号（数字と + だけ）。取れなければ null */
export function telHref(phone: string | undefined | null): string | null {
  const digits = (phone ?? "").replace(/[^\d+]/g, "");
  return digits.length >= 6 ? `tel:${digits}` : null;
}

/** http(s) の URL だけを通す（予約ページなど）。それ以外は null */
export function httpUrl(raw: string | undefined | null): string | null {
  const v = (raw ?? "").trim();
  return parseHttp(v) ? v : null;
}

export interface ShopLinkInput extends ShopSocial {
  phone?: string;
  /** 地図のリンク（呼び出し側で決める。Google マップの実URL優先） */
  mapUrl?: string;
  reservationUrl?: string;
}

/**
 * 電話・地図・予約・公式サイト・SNS を、この順のボタン一覧にする。
 * 値が無い項目は出さない。電話は番号が読めたときだけ。
 */
export function shopLinks(input: ShopLinkInput): ShopLink[] {
  const out: ShopLink[] = [];
  const tel = telHref(input.phone);
  if (tel) out.push({ kind: "phone", label: "電話する", href: tel, external: false });
  const map = httpUrl(input.mapUrl);
  if (map) out.push({ kind: "map", label: "地図を開く", href: map, external: true });
  const res = httpUrl(input.reservationUrl);
  if (res) out.push({ kind: "reserve", label: "予約する", href: res, external: true });
  out.push(...socialLinks(input));
  return out;
}
