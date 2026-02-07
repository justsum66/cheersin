-- ============================================
-- 50. Supabase Realtime：game_room_players 表變更時推送給所有房間成員
-- 需在 Dashboard 啟用 Realtime 並訂閱 public.game_room_players
-- ============================================

-- 啟用 game_room_players 的 Realtime 發布
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_room_players;

-- 若 publication 已存在該表會報錯，可改為：
-- 在 Supabase Dashboard > Database > Replication 中勾選 game_room_players
-- 或使用以下（若 publication 不存在則建立）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'game_room_players'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.game_room_players;
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    -- supabase_realtime publication 可能尚未建立（由 Supabase 管理）
    NULL;
END $$;
