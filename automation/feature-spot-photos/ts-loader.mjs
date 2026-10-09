// Node から lib/*.ts を読むための resolve フック(読み取り専用の解決だけ。何も書かない)。
//   - "@/xxx" を リポジトリ直下の xxx(.ts/.tsx/index.ts) に解決する
//   - 拡張子なしの相対 import を .ts/.tsx/index.ts に解決する
//   - "server-only"(Next.js の保護用の空の import)は、Node では空のモジュールにする
// 使い方: common.mjs が register する。`node --no-warnings --experimental-strip-types <スクリプト>` で動かす。
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function tryFile(p) {
  for (const c of [p, p + '.ts', p + '.tsx', p + '/index.ts']) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

export async function resolve(specifier, context, next) {
  if (specifier === 'server-only') return { url: 'data:text/javascript,export {}', format: 'module', shortCircuit: true };
  let base = null;
  if (specifier.startsWith('@/')) base = path.join(ROOT, specifier.slice(2));
  else if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL?.startsWith('file:')) {
    base = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
  }
  if (base) {
    const f = tryFile(base);
    if (f) return next(pathToFileURL(f).href, context);
  }
  return next(specifier, context);
}
