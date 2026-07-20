// 🔧 スプレッドシート設定の単一情報源（Single Source of Truth）
// スプシ／シート／列構成が変わったら「ここだけ」直せば全スクリプトに反映される。
//
// 2026-07-07 更新: 監視シートが新構成に差し替わった
//   旧: URL=J(9) / 詰めステータス=P(15) / ステータス=U(20) / MIN_SOURCE_ROW=175
//   新: URL=K(10) / 詰めステータス=Q(16) / A列に顧客管理ID新設 / G列に店舗住所新設
//   本体データは全入れ替え（旧538行 → 新70行）。よって MIN_SOURCE_ROW は 2（全行対象）。

export const SHEET_ID =
  process.env.MACHINOWA_SHEET_ID || '1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk';

/** 本体シート（書き込みは必ずここ。行ズレ安全） */
export const BODY_SHEET = 'トスアップ元シート';
/** QUERYビュー（ユーザーが見る表示用。A:V が並び替わるので直書きは非推奨） */
export const VIEW_SHEET = '詰めOKリスト';

/** これ未満の行は対象外。新シートは全行が対象なので 2 */
export const MIN_SOURCE_ROW = Number(process.env.MACHINOWA_MIN_ROW || 2);

/**
 * 列インデックス（0始まり / A2:Z 取得時の配列添字）
 * A=顧客管理ID B=タイムスタンプ C=アポインター名 D=店舗名 E=店舗電話 F=携帯
 * G=店舗住所 H=決裁者名 I=性別 J=希望連絡先 K=URL L=業種 M=連絡希望日
 * N=連絡希望時間 O=備考 P=詰め担当者 Q=詰めステータス R=初回発信日時
 * S=詰めOK日 T=詰め備考 U=次回アクション予定日 V=最終架電日次
 * W=特集記事_済 X=特集記事_URL Y=店舗紹介_済 Z=店舗紹介_URL
 */
export const IDX = {
  ID: 0,        // 顧客管理ID（安定キー。行ズレに強い）
  NAME: 3,      // 店舗名
  ADDR: 6,      // 店舗住所（記事生成の事実ソース）
  URL: 10,      // Google Maps / GBP の URL（絶対正解）
  CATEGORY: 11, // 業種
  STATUS: 16,   // 詰めステータス（'詰めOK' で特集記事の対象）
  W: 22,        // 特集記事_済
  X: 23,        // 特集記事_URL
  Y: 24,        // 店舗紹介_済
  Z: 25,        // 店舗紹介_URL
};

/** 特集記事を作る対象のステータス値 */
export const FEATURE_TRIGGER = '詰めOK';
/** 店舗紹介を作る対象のステータス値（新シートには現状この値は存在しない＝実質無効） */
export const RESTAURANT_TRIGGER = '商談完了';

/** Sheets API が再計算中に空応答を返す事故の検知しきい値（本体の想定行数より十分小さく） */
export const MIN_ROWS_GUARD = Number(process.env.MACHINOWA_MIN_ROWS_GUARD || 30);
