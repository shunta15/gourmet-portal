/**
 * SEO の小さな共通部品（タイトル組み立て・絶対URL）。
 *
 * 業種の titleTemplates は 'マチノワ{brand}' と書かれているが、brand 自体が
 * 「マチノワビューティー」のように 'マチノワ' を含むため、そのまま差し込むと
 * 「マチノワマチノワビューティー」になる。ここで重複を畳んでから差し込む。
 * 件数は 0 なら出さない（SPEC: 0件なら件数を出さない）。
 */

export const SITE_URL = 'https://machinowa.tokyo';

/** パスを絶対URLにする（末尾スラッシュなし。'/' はドメインのみ） */
export function absUrl(path: string): string {
  if (path === '/' || path === '') return SITE_URL;
  return `${SITE_URL}${path.replace(/\/+$/, '')}`;
}

export interface TitleVars {
  name?: string;
  brand?: string;
  area?: string;
  category?: string;
  count?: number;
}

export function fillTitle(template: string, vars: TitleVars): string {
  let t = template;
  // 'マチノワ{brand}' で brand が既に 'マチノワ' 始まりなら、前置きの 'マチノワ' を落とす
  if (vars.brand && vars.brand.startsWith('マチノワ')) {
    t = t.replace('マチノワ{brand}', '{brand}');
  }
  // 件数: 0 または未指定なら「{count}選」ごと消す
  if (vars.count && vars.count > 0) {
    t = t.replace('{count}', String(vars.count));
  } else {
    t = t.replace('{count}選', '').replace('{count}', '');
  }
  return t
    .replace('{name}', vars.name ?? '')
    .replace('{brand}', vars.brand ?? '')
    .replace('{area}', vars.area ?? '')
    .replace('{category}', vars.category ?? '');
}
