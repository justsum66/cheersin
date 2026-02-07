-- P3-56：user_achievements 防重複 — 同一用戶同一成就類型僅一筆，寫入時使用 upsert
-- 若已存在 (user_id, achievement_type) 則更新 unlocked_at/metadata，不插入重複列

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.user_achievements'::regclass
      AND conname = 'user_achievements_user_id_achievement_type_key'
  ) THEN
    ALTER TABLE public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_achievement_type_key UNIQUE (user_id, achievement_type);
  END IF;
END $$;
