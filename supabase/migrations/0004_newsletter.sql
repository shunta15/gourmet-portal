-- ============================================================
-- 0004: ニュースレター購読
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  email          TEXT PRIMARY KEY,
  subscribed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  source         TEXT DEFAULT 'site_footer'
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public insert subscribers" ON newsletter_subscribers;
CREATE POLICY "public insert subscribers"
  ON newsletter_subscribers FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "auth read subscribers" ON newsletter_subscribers;
CREATE POLICY "auth read subscribers"
  ON newsletter_subscribers FOR SELECT
  USING (auth.role() = 'authenticated');
