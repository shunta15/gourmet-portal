-- ============================================================
-- マチノワ CMS 0002: フル機能拡張
-- 目的: 既存スキーマに以下を追加
--   - ロール / ユーザープロファイル
--   - status / publish_at / noindex / og_image / article_type
--   - 画像メタ / リビジョン / 監査ログ
--   - 予約リンク / クーポン
--   - 分析キャッシュ / CV イベント
--   - コンテンツ差分スキャン
--   - 通知 / オーナー編集申請
-- ============================================================

-- ENUM 型 ----------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'editor', 'owner', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE content_status AS ENUM ('draft', 'scheduled', 'published', 'unlisted', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1. user_profiles -------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                TEXT,
  display_name         TEXT,
  role                 user_role NOT NULL DEFAULT 'viewer',
  owned_restaurant_ids TEXT[] DEFAULT '{}',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. restaurants / feature_articles に列追加 -------------------
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS status content_status NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS publish_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

ALTER TABLE feature_articles
  ADD COLUMN IF NOT EXISTS status content_status NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS publish_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS noindex BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS og_image TEXT,
  ADD COLUMN IF NOT EXISTS article_type TEXT;

UPDATE restaurants
  SET status = CASE WHEN published THEN 'published'::content_status ELSE 'draft'::content_status END
  WHERE status IS NULL OR status = 'published';

UPDATE feature_articles
  SET status = CASE WHEN published THEN 'published'::content_status ELSE 'draft'::content_status END
  WHERE status IS NULL OR status = 'published';

-- 3. images --------------------------------------------------
CREATE TABLE IF NOT EXISTS images (
  id           BIGSERIAL PRIMARY KEY,
  storage_path TEXT NOT NULL UNIQUE,
  url          TEXT NOT NULL,
  alt          TEXT,
  width        INTEGER,
  height       INTEGER,
  size_bytes   INTEGER,
  mime_type    TEXT,
  related_type TEXT,
  related_id   TEXT,
  sort_order   INTEGER DEFAULT 0,
  uploaded_by  UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_images_related ON images(related_type, related_id);

-- 4. revisions -----------------------------------------------
CREATE TABLE IF NOT EXISTS revisions (
  id          BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id   TEXT NOT NULL,
  snapshot    JSONB NOT NULL,
  changed_by  UUID REFERENCES auth.users(id),
  change_type TEXT NOT NULL,
  change_note TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_revisions_entity ON revisions(entity_type, entity_id, created_at DESC);

-- 5. audit_log -----------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id           BIGSERIAL PRIMARY KEY,
  actor_id     UUID REFERENCES auth.users(id),
  actor_email  TEXT,
  action       TEXT NOT NULL,
  entity_type  TEXT,
  entity_id    TEXT,
  metadata     JSONB,
  ip_address   INET,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id, created_at DESC);

-- 6. coupons -------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
  id             BIGSERIAL PRIMARY KEY,
  restaurant_id  TEXT REFERENCES restaurants(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  description    TEXT,
  discount_label TEXT,
  starts_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at        TIMESTAMPTZ,
  qr_token       TEXT,
  active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. reservation_links ---------------------------------------
CREATE TABLE IF NOT EXISTS reservation_links (
  id            BIGSERIAL PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  provider      TEXT NOT NULL,
  url           TEXT NOT NULL,
  label         TEXT,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reservation_links_restaurant ON reservation_links(restaurant_id);

-- 8. analytics_cache -----------------------------------------
CREATE TABLE IF NOT EXISTS analytics_cache (
  id               BIGSERIAL PRIMARY KEY,
  entity_type      TEXT NOT NULL,
  entity_id        TEXT,
  period           TEXT NOT NULL,
  date_from        DATE NOT NULL,
  date_to          DATE NOT NULL,
  pv               INTEGER DEFAULT 0,
  unique_visitors  INTEGER DEFAULT 0,
  avg_duration_sec INTEGER DEFAULT 0,
  bounce_rate      NUMERIC(5,2),
  cv_count         INTEGER DEFAULT 0,
  source           TEXT,
  metadata         JSONB,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_analytics_entity ON analytics_cache(entity_type, entity_id, period, date_from DESC);

-- 9. cv_events -----------------------------------------------
CREATE TABLE IF NOT EXISTS cv_events (
  id          BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id   TEXT NOT NULL,
  event_type  TEXT NOT NULL,
  session_id  TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cv_events_entity ON cv_events(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cv_events_type ON cv_events(event_type, created_at DESC);

-- 10. content_scans ------------------------------------------
CREATE TABLE IF NOT EXISTS content_scans (
  id             BIGSERIAL PRIMARY KEY,
  entity_type    TEXT NOT NULL DEFAULT 'restaurant',
  entity_id      TEXT NOT NULL,
  source         TEXT NOT NULL,
  scanned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  snapshot       JSONB NOT NULL,
  diff_from_prev JSONB,
  has_changes    BOOLEAN DEFAULT FALSE,
  notified       BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_content_scans_entity ON content_scans(entity_type, entity_id, scanned_at DESC);

-- 11. notifications ------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id           BIGSERIAL PRIMARY KEY,
  recipient_id UUID REFERENCES auth.users(id),
  channel      TEXT NOT NULL,
  topic        TEXT NOT NULL,
  subject      TEXT,
  body         TEXT,
  metadata     JSONB,
  read_at      TIMESTAMPTZ,
  sent_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, read_at);

-- 12. owner_change_requests ----------------------------------
CREATE TABLE IF NOT EXISTS owner_change_requests (
  id               BIGSERIAL PRIMARY KEY,
  restaurant_id    TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  requested_by     UUID NOT NULL REFERENCES auth.users(id),
  proposed_changes JSONB NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending',
  reviewed_by      UUID REFERENCES auth.users(id),
  review_note      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at      TIMESTAMPTZ
);

-- 13. RLS ----------------------------------------------------
ALTER TABLE user_profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE images                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log              ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons                ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_links      ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache        ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_scans          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_change_requests  ENABLE ROW LEVEL SECURITY;

-- 公開読み取り
DROP POLICY IF EXISTS "public read reservation_links" ON reservation_links;
CREATE POLICY "public read reservation_links" ON reservation_links FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "public read coupons" ON coupons;
CREATE POLICY "public read coupons" ON coupons FOR SELECT
  USING (active = TRUE AND (ends_at IS NULL OR ends_at > NOW()));

DROP POLICY IF EXISTS "public insert cv" ON cv_events;
CREATE POLICY "public insert cv" ON cv_events FOR INSERT WITH CHECK (TRUE);

-- 認証ユーザーフル権限
DROP POLICY IF EXISTS "admin all images" ON images;
CREATE POLICY "admin all images" ON images FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "admin all revisions" ON revisions;
CREATE POLICY "admin all revisions" ON revisions FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "admin all audit" ON audit_log;
CREATE POLICY "admin all audit" ON audit_log FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "admin all coupons" ON coupons;
CREATE POLICY "admin all coupons" ON coupons FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "admin all reservation_links" ON reservation_links;
CREATE POLICY "admin all reservation_links" ON reservation_links FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "admin all analytics" ON analytics_cache;
CREATE POLICY "admin all analytics" ON analytics_cache FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "admin all cv" ON cv_events;
CREATE POLICY "admin all cv" ON cv_events FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "admin all scans" ON content_scans;
CREATE POLICY "admin all scans" ON content_scans FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "admin all notifications" ON notifications;
CREATE POLICY "admin all notifications" ON notifications FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "admin all owner_requests" ON owner_change_requests;
CREATE POLICY "admin all owner_requests" ON owner_change_requests FOR ALL USING (auth.role() = 'authenticated');

-- user_profiles のポリシー
DROP POLICY IF EXISTS "self read profile" ON user_profiles;
CREATE POLICY "self read profile" ON user_profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "self update profile" ON user_profiles;
CREATE POLICY "self update profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "admin all profiles" ON user_profiles;
CREATE POLICY "admin all profiles" ON user_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin')
);

-- updated_at トリガー（拡張テーブル）
DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS analytics_cache_updated_at ON analytics_cache;
CREATE TRIGGER analytics_cache_updated_at
  BEFORE UPDATE ON analytics_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
