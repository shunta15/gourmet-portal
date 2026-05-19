-- ============================================================
-- 0003: Storage バケットの RLS ポリシー
-- バケット: restaurants / features  (どちらも public = true)
--   - 公開: 誰でも読み取り可
--   - 認証ユーザー: アップロード / 更新 / 削除可
-- ============================================================

-- restaurants バケット
DO $$ BEGIN
  CREATE POLICY "restaurants public read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'restaurants');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "restaurants auth write"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'restaurants' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "restaurants auth update"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'restaurants' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "restaurants auth delete"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'restaurants' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- features バケット
DO $$ BEGIN
  CREATE POLICY "features public read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'features');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "features auth write"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'features' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "features auth update"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'features' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "features auth delete"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'features' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
