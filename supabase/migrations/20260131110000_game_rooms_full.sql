-- ============================================
-- 42. GAME_ROOMS 表：id, slug, host_id, created_at, expires_at, settings (jsonb)
-- ============================================

CREATE TABLE IF NOT EXISTS public.game_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}'
);

-- 既有表補欄位
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'game_rooms' AND column_name = 'host_id') THEN
    ALTER TABLE public.game_rooms ADD COLUMN host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'game_rooms' AND column_name = 'settings') THEN
    ALTER TABLE public.game_rooms ADD COLUMN settings JSONB DEFAULT '{}';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_game_rooms_slug ON public.game_rooms(slug);
CREATE INDEX IF NOT EXISTS idx_game_rooms_host ON public.game_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_game_rooms_expires ON public.game_rooms(expires_at) WHERE expires_at IS NOT NULL;
