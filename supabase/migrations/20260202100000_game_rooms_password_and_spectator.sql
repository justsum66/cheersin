-- ============================================
-- A1-12: game_rooms 房間密碼（4 位數字，存 hash）
-- A1-13: game_room_players 觀戰模式 is_spectator
-- ============================================

-- 房間密碼：存 SHA256 hash，前端只送 4 位數字
ALTER TABLE public.game_rooms
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

COMMENT ON COLUMN public.game_rooms.password_hash IS 'A1-12: 4 位數密碼的 SHA256 hash，NULL 表示無密碼';

-- 觀戰者：不佔玩家名額，僅可讀遊戲狀態
ALTER TABLE public.game_room_players
  ADD COLUMN IF NOT EXISTS is_spectator BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.game_room_players.is_spectator IS 'A1-13: 是否為觀戰者（不參與遊戲）';
