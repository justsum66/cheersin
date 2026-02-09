-- ============================================
-- Auth RLS Initplan: auth.uid() → (select auth.uid())
-- 每行不重算，改為每查詢計算一次。參考 supabase-advisors-fixes.md
-- ============================================

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- GAME_ROOMS
DROP POLICY IF EXISTS "Host can update game_rooms" ON public.game_rooms;
CREATE POLICY "Host can update game_rooms" ON public.game_rooms
  FOR UPDATE USING ((select auth.uid()) = host_id);

DROP POLICY IF EXISTS "Authenticated can create game_rooms" ON public.game_rooms;
CREATE POLICY "Authenticated can create game_rooms" ON public.game_rooms
  FOR INSERT WITH CHECK ((select auth.uid()) = host_id OR host_id IS NULL);

DROP POLICY IF EXISTS "Host can delete game_rooms" ON public.game_rooms;
CREATE POLICY "Host can delete game_rooms" ON public.game_rooms
  FOR DELETE USING ((select auth.uid()) = host_id);

-- GAME_ROOM_PLAYERS（子查詢內 host_id 比對也改為 select）
DROP POLICY IF EXISTS "Host or self can insert game_room_players" ON public.game_room_players;
CREATE POLICY "Host or self can insert game_room_players" ON public.game_room_players
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.game_rooms r WHERE r.id = room_id AND (r.host_id = (select auth.uid()) OR r.host_id IS NULL))
    OR (select auth.uid()) = user_id
  );

DROP POLICY IF EXISTS "Host or self can update game_room_players" ON public.game_room_players;
CREATE POLICY "Host or self can update game_room_players" ON public.game_room_players
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.game_rooms r WHERE r.id = room_id AND r.host_id = (select auth.uid()))
    OR (select auth.uid()) = user_id
  );

DROP POLICY IF EXISTS "Host can delete game_room_players" ON public.game_room_players;
CREATE POLICY "Host can delete game_room_players" ON public.game_room_players
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.game_rooms r WHERE r.id = room_id AND r.host_id = (select auth.uid()))
  );

-- USER_ACHIEVEMENTS
DROP POLICY IF EXISTS "Users can manage own achievements" ON public.user_achievements;
CREATE POLICY "Users can manage own achievements" ON public.user_achievements
  FOR ALL USING ((select auth.uid()) = user_id);

-- CHAT_CONVERSATIONS（若表存在）
DROP POLICY IF EXISTS "Users can manage own chat_conversations" ON public.chat_conversations;
CREATE POLICY "Users can manage own chat_conversations" ON public.chat_conversations
  FOR ALL USING ((select auth.uid()) = user_id);

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT USING ((select auth.uid()) = user_id);
