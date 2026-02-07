-- ============================================
-- 44. GAME_SESSIONS 表：id, room_id, game_type, started_at, ended_at, results (jsonb)
-- 與既有 game_sessions 相容：補 room_id, started_at, ended_at, results
-- ============================================

-- 若表不存在則建立（新專案）
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.game_rooms(id) ON DELETE SET NULL,
  game_type TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  results JSONB DEFAULT '{}'
);

-- 既有表補欄位（game_rooms 需先存在）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'game_rooms') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'game_sessions') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'game_sessions' AND column_name = 'room_id') THEN
      ALTER TABLE public.game_sessions ADD COLUMN room_id UUID REFERENCES public.game_rooms(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'game_sessions' AND column_name = 'started_at') THEN
      ALTER TABLE public.game_sessions ADD COLUMN started_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'game_sessions' AND column_name = 'ended_at') THEN
      ALTER TABLE public.game_sessions ADD COLUMN ended_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'game_sessions' AND column_name = 'results') THEN
      ALTER TABLE public.game_sessions ADD COLUMN results JSONB DEFAULT '{}';
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_game_sessions_room ON public.game_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_type ON public.game_sessions(game_type);
CREATE INDEX IF NOT EXISTS idx_game_sessions_started ON public.game_sessions(started_at DESC);
