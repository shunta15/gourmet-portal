/**
 * 総合サイトの見せ方に関する、業種ごとの固定メタ情報（画面表示用）。
 * 件数・店名・価格などの「事実」は持たない。事実は必ず実データから計算する。
 */
import type { VerticalKey } from '@/lib/verticals/types';

export interface VerticalFace {
  /** 英字表記（ロゴ・見出しの飾り） */
  en: string;
  /** 大きく飾る一字（装飾。意味づけの断定はしない） */
  glyph: string;
  /** 暮らしの動詞（総合トップの宣言文で使う） */
  verb: string;
}

export const VERTICAL_FACE: Record<VerticalKey, VerticalFace> = {
  gourmet: { en: 'Gourmet', glyph: '食', verb: '食べる' },
  beauty: { en: 'Beauty', glyph: '美', verb: '整える' },
  bodycare: { en: 'Bodycare', glyph: '整', verb: 'ほぐす' },
  pet: { en: 'Pet', glyph: '友', verb: '連れていく' },
  leisure: { en: 'Leisure', glyph: '遊', verb: '出かける' },
  stay: { en: 'Stay', glyph: '泊', verb: '泊まる' },
};

/** 地方ブロックの表示名とローマ字 */
export const BLOCK_FACE: Record<string, { label: string; en: string }> = {
  北海道: { label: '北海道', en: 'Hokkaido' },
  東北: { label: '東北', en: 'Tohoku' },
  関東: { label: '関東', en: 'Kanto' },
  中部: { label: '中部', en: 'Chubu' },
  近畿: { label: '近畿', en: 'Kinki' },
  中国: { label: '中国', en: 'Chugoku' },
  四国: { label: '四国', en: 'Shikoku' },
  九州沖縄: { label: '九州・沖縄', en: 'Kyushu · Okinawa' },
};

/** 業種の入口で、効果効能をうたわない旨を掲載方針として示す業種 */
export const HAS_CLAIM_POLICY: ReadonlySet<VerticalKey> = new Set<VerticalKey>(['beauty', 'bodycare', 'pet']);
