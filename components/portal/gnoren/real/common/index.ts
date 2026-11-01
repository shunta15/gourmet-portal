// 暖簾 2 本番化の共通の道具(土台担当だけが編集する。使い方は ../README.md)。
// ※ img.ts はサーバー用(lib/portal/noren/shop.ts 等を読む)なので、'use client' の部品からはこの index を import しない。
//   クライアントの部品が使えるのは types.ts・text.ts・links.ts(個別に import)。
export * from "./types";
export * from "./img";
export * from "./text";
export * from "./links";
