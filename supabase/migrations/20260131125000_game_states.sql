-- ============================================
-- game_states 表：房間內遊戲狀態（API game-state 使用）
-- ============================================

CREATE TABLE IF NOT EXISTS public.game_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, game_id)
);

CREATE INDEX IF NOT EXISTS idx_game_states_room_game ON public.game_states(room_id, game_id);
ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;
