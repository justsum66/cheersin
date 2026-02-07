-- ============================================
-- 48. RLS：profiles 只能讀取自己的資料；game_rooms 房主可修改，其他人只讀
-- ============================================

-- PROFILES：僅能讀取與更新自己的資料
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- INSERT 由 trigger handle_new_user 以 SECURITY DEFINER 處理
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- GAME_ROOMS：房主 (host_id) 可修改，其他人可讀（知道 slug 即可讀）
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read game_rooms" ON public.game_rooms;
CREATE POLICY "Anyone can read game_rooms" ON public.game_rooms
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Host can update game_rooms" ON public.game_rooms;
CREATE POLICY "Host can update game_rooms" ON public.game_rooms
  FOR UPDATE USING (auth.uid() = host_id);

DROP POLICY IF EXISTS "Authenticated can create game_rooms" ON public.game_rooms;
CREATE POLICY "Authenticated can create game_rooms" ON public.game_rooms
  FOR INSERT WITH CHECK (auth.uid() = host_id OR host_id IS NULL);

DROP POLICY IF EXISTS "Host can delete game_rooms" ON public.game_rooms;
CREATE POLICY "Host can delete game_rooms" ON public.game_rooms
  FOR DELETE USING (auth.uid() = host_id);

-- GAME_ROOM_PLAYERS：房間成員可讀；房主可寫
DROP POLICY IF EXISTS "Anyone can read game_room_players" ON public.game_room_players;
CREATE POLICY "Anyone can read game_room_players" ON public.game_room_players
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Host or self can insert game_room_players" ON public.game_room_players;
CREATE POLICY "Host or self can insert game_room_players" ON public.game_room_players
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.game_rooms r WHERE r.id = room_id AND (r.host_id = auth.uid() OR r.host_id IS NULL))
    OR auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Host or self can update game_room_players" ON public.game_room_players;
CREATE POLICY "Host or self can update game_room_players" ON public.game_room_players
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.game_rooms r WHERE r.id = room_id AND r.host_id = auth.uid())
    OR auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Host can delete game_room_players" ON public.game_room_players;
CREATE POLICY "Host can delete game_room_players" ON public.game_room_players
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.game_rooms r WHERE r.id = room_id AND r.host_id = auth.uid())
  );

-- USER_ACHIEVEMENTS：僅能讀寫自己的
DROP POLICY IF EXISTS "Users can manage own achievements" ON public.user_achievements;
CREATE POLICY "Users can manage own achievements" ON public.user_achievements
  FOR ALL USING (auth.uid() = user_id);

-- CHAT_CONVERSATIONS：僅能讀寫自己的
DROP POLICY IF EXISTS "Users can manage own chat_conversations" ON public.chat_conversations;
CREATE POLICY "Users can manage own chat_conversations" ON public.chat_conversations
  FOR ALL USING (auth.uid() = user_id);
