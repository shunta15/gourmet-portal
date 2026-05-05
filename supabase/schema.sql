-- ============================================================
-- マチノワ CMS スキーマ
-- ============================================================

-- 店舗テーブル
CREATE TABLE IF NOT EXISTS restaurants (
  id            TEXT PRIMARY KEY,          -- "r01", "r02", ...
  name          TEXT NOT NULL,
  cuisine       TEXT NOT NULL DEFAULT '',
  area          TEXT NOT NULL DEFAULT '',
  region        TEXT NOT NULL DEFAULT '',
  shape         TEXT NOT NULL DEFAULT 'square',
  image         TEXT NOT NULL DEFAULT '',
  hero_images   TEXT[] NOT NULL DEFAULT '{}',
  gallery       TEXT[] NOT NULL DEFAULT '{}',
  "desc"        TEXT NOT NULL DEFAULT '',
  address       TEXT NOT NULL DEFAULT '',
  hours         TEXT NOT NULL DEFAULT '',
  closed        TEXT NOT NULL DEFAULT '',
  seats         TEXT NOT NULL DEFAULT '',
  nearest       TEXT NOT NULL DEFAULT '',
  phone         TEXT,
  budget        TEXT,
  rating        TEXT,
  reservation_url TEXT,
  source_label  TEXT,
  source_url    TEXT,
  tags          TEXT[] NOT NULL DEFAULT '{}',
  highlights    TEXT[] NOT NULL DEFAULT '{}',
  body          TEXT[] NOT NULL DEFAULT '{}',
  published     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 特集記事テーブル
CREATE TABLE IF NOT EXISTS feature_articles (
  id            TEXT PRIMARY KEY,          -- "feature-hiroshima-5", ...
  no            TEXT NOT NULL DEFAULT '',
  tag           TEXT NOT NULL DEFAULT '',
  kicker        TEXT NOT NULL DEFAULT '',
  title         TEXT NOT NULL DEFAULT '',
  title_html    TEXT NOT NULL DEFAULT '',
  subtitle      TEXT NOT NULL DEFAULT '',
  lede          TEXT NOT NULL DEFAULT '',
  date          TEXT NOT NULL DEFAULT '',
  reading       TEXT NOT NULL DEFAULT '',
  author        TEXT NOT NULL DEFAULT 'マチノワ編集部',
  hero_image    TEXT NOT NULL DEFAULT '',
  published     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 特集記事のランキングアイテム
CREATE TABLE IF NOT EXISTS feature_ranking_items (
  id            BIGSERIAL PRIMARY KEY,
  article_id    TEXT NOT NULL REFERENCES feature_articles(id) ON DELETE CASCADE,
  rank          TEXT NOT NULL DEFAULT '',
  rank_num      INTEGER NOT NULL DEFAULT 1,
  restaurant_id TEXT REFERENCES restaurants(id) ON DELETE SET NULL,
  name          TEXT NOT NULL DEFAULT '',
  cuisine       TEXT NOT NULL DEFAULT '',
  images        TEXT[] NOT NULL DEFAULT '{}',
  catch         TEXT NOT NULL DEFAULT '',
  "desc"        TEXT NOT NULL DEFAULT '',
  address       TEXT NOT NULL DEFAULT '',
  nearest       TEXT NOT NULL DEFAULT '',
  hours         TEXT NOT NULL DEFAULT '',
  closed        TEXT NOT NULL DEFAULT '',
  budget        TEXT NOT NULL DEFAULT '',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 特集記事のリンク（related articles 等）
CREATE TABLE IF NOT EXISTS feature_links (
  id            BIGSERIAL PRIMARY KEY,
  article_id    TEXT NOT NULL REFERENCES feature_articles(id) ON DELETE CASCADE,
  label         TEXT NOT NULL DEFAULT '',
  href          TEXT NOT NULL DEFAULT '',
  sort_order    INTEGER NOT NULL DEFAULT 0
);

-- FEATURES カード（トップ/一覧ページのサムネイル）
CREATE TABLE IF NOT EXISTS feature_cards (
  id            TEXT PRIMARY KEY,          -- feature_articles.id と同一
  no            TEXT NOT NULL DEFAULT '',
  tag           TEXT NOT NULL DEFAULT '',
  kicker        TEXT NOT NULL DEFAULT '',
  title         TEXT NOT NULL DEFAULT '',
  sub           TEXT NOT NULL DEFAULT '',
  image         TEXT NOT NULL DEFAULT '',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (id) REFERENCES feature_articles(id) ON DELETE CASCADE
);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER feature_articles_updated_at
  BEFORE UPDATE ON feature_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS（Row Level Security）
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_ranking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_cards ENABLE ROW LEVEL SECURITY;

-- 公開読み取りポリシー（公開側のサイトから読める）
CREATE POLICY "public read restaurants" ON restaurants FOR SELECT USING (published = true);
CREATE POLICY "public read features" ON feature_articles FOR SELECT USING (published = true);
CREATE POLICY "public read ranking" ON feature_ranking_items FOR SELECT USING (true);
CREATE POLICY "public read links" ON feature_links FOR SELECT USING (true);
CREATE POLICY "public read cards" ON feature_cards FOR SELECT USING (true);

-- 管理者フル権限ポリシー（認証済みユーザー）
CREATE POLICY "admin all restaurants" ON restaurants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin all features" ON feature_articles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin all ranking" ON feature_ranking_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin all links" ON feature_links FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin all cards" ON feature_cards FOR ALL USING (auth.role() = 'authenticated');

-- インデックス
CREATE INDEX IF NOT EXISTS idx_restaurants_region ON restaurants(region);
CREATE INDEX IF NOT EXISTS idx_restaurants_published ON restaurants(published);
CREATE INDEX IF NOT EXISTS idx_feature_ranking_article ON feature_ranking_items(article_id);
CREATE INDEX IF NOT EXISTS idx_feature_cards_sort ON feature_cards(sort_order);
