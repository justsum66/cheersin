-- ============================================
-- 43. GAME_ROOM_PLAYERS 表：id, room_id, user_id, display_name, order_index, joined_at, is_active
-- ============================================

CREATE TABLE IF NOT EXISTS public.game_room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- 既有表補欄位
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'game_room_players' AND column_name = 'user_id') THEN
    ALTER TABLE public.game_room_players ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'game_room_players' AND column_name = 'order_index') THEN
    ALTER TABLE public.game_room_players ADD COLUMN order_index INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'game_room_players' AND column_name = 'is_active') THEN
    ALTER TABLE public.game_room_players ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_game_room_players_room ON public.game_room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_game_room_players_user ON public.game_room_players(user_id);
