-- ============================================
-- 在 Supabase Dashboard > SQL Editor 貼上整份執行
-- 當 CLI link 權限不足時使用（帳號無 project 存取權限時）
-- 依序：41 profiles → 42–47 表 → 48 RLS → 50 Realtime
-- ============================================

-- 41. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  zodiac TEXT,
  mbti TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'zodiac') THEN
    ALTER TABLE public.profiles ADD COLUMN zodiac TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'mbti') THEN
    ALTER TABLE public.profiles ADD COLUMN mbti TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'subscription_tier') THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_tier TEXT DEFAULT 'free';
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_subscription_tier_check CHECK (subscription_tier IN ('free', 'basic', 'premium'));
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);

-- 42. GAME_ROOMS
CREATE TABLE IF NOT EXISTS public.game_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}'
);
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

-- 43. GAME_ROOM_PLAYERS（含 order_index 供 API 排序）
CREATE TABLE IF NOT EXISTS public.game_room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
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

-- 43b. GAME_STATES（房間內遊戲狀態，API /api/games/rooms/[slug]/game-state 使用）
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

-- 44. GAME_SESSIONS
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.game_rooms(id) ON DELETE SET NULL,
  game_type TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  results JSONB DEFAULT '{}'
);
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

-- 45. USER_ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON public.user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON public.user_achievements(unlocked_at DESC);
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- 46. QUIZ_RESULTS
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  zodiac TEXT,
  answers JSONB DEFAULT '{}',
  soul_wine TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quiz_results' AND column_name = 'zodiac') THEN
    ALTER TABLE public.quiz_results ADD COLUMN zodiac TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quiz_results' AND column_name = 'answers') THEN
    ALTER TABLE public.quiz_results ADD COLUMN answers JSONB DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quiz_results' AND column_name = 'soul_wine') THEN
    ALTER TABLE public.quiz_results ADD COLUMN soul_wine TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quiz_results' AND column_name = 'created_at') THEN
    ALTER TABLE public.quiz_results ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_created ON public.quiz_results(created_at DESC);

-- 47. CHAT_HISTORY (補 messages, context)；chat_conversations 可選
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_history') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chat_history' AND column_name = 'messages') THEN
      ALTER TABLE public.chat_history ADD COLUMN messages JSONB DEFAULT '[]';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chat_history' AND column_name = 'context') THEN
      ALTER TABLE public.chat_history ADD COLUMN context TEXT;
    END IF;
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated ON public.chat_conversations(updated_at DESC);
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- 47b. 知識庫管理後台用表（/admin/knowledge）
CREATE TABLE IF NOT EXISTS public.knowledge_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  course_id TEXT NOT NULL,
  chapter TEXT NOT NULL,
  content TEXT NOT NULL,
  vector_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_course ON public.knowledge_docs(course_id);
ALTER TABLE public.knowledge_docs ENABLE ROW LEVEL SECURITY;

-- 48. RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read game_rooms" ON public.game_rooms;
CREATE POLICY "Anyone can read game_rooms" ON public.game_rooms FOR SELECT USING (true);
DROP POLICY IF EXISTS "Host can update game_rooms" ON public.game_rooms;
CREATE POLICY "Host can update game_rooms" ON public.game_rooms FOR UPDATE USING (auth.uid() = host_id);
DROP POLICY IF EXISTS "Authenticated can create game_rooms" ON public.game_rooms;
CREATE POLICY "Authenticated can create game_rooms" ON public.game_rooms FOR INSERT WITH CHECK (auth.uid() = host_id OR host_id IS NULL);
DROP POLICY IF EXISTS "Host can delete game_rooms" ON public.game_rooms;
CREATE POLICY "Host can delete game_rooms" ON public.game_rooms FOR DELETE USING (auth.uid() = host_id);

DROP POLICY IF EXISTS "Anyone can read game_room_players" ON public.game_room_players;
CREATE POLICY "Anyone can read game_room_players" ON public.game_room_players FOR SELECT USING (true);
DROP POLICY IF EXISTS "Host or self can insert game_room_players" ON public.game_room_players;
CREATE POLICY "Host or self can insert game_room_players" ON public.game_room_players FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.game_rooms r WHERE r.id = room_id AND (r.host_id = auth.uid() OR r.host_id IS NULL)) OR auth.uid() = user_id
);
DROP POLICY IF EXISTS "Host or self can update game_room_players" ON public.game_room_players;
CREATE POLICY "Host or self can update game_room_players" ON public.game_room_players FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.game_rooms r WHERE r.id = room_id AND r.host_id = auth.uid()) OR auth.uid() = user_id
);
DROP POLICY IF EXISTS "Host can delete game_room_players" ON public.game_room_players;
CREATE POLICY "Host can delete game_room_players" ON public.game_room_players FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.game_rooms r WHERE r.id = room_id AND r.host_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can manage own achievements" ON public.user_achievements;
CREATE POLICY "Users can manage own achievements" ON public.user_achievements FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own chat_conversations" ON public.chat_conversations;
CREATE POLICY "Users can manage own chat_conversations" ON public.chat_conversations FOR ALL USING (auth.uid() = user_id);

-- 50. Realtime
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
    NULL;
END $$;
