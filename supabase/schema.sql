-- ============================================
-- 🍷 CHEERSIN DATABASE SCHEMA
-- Supabase PostgreSQL Database
-- Version: 1.0.0
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 👤 PROFILES TABLE
-- Extended user profile information
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  
  -- Subscription
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium')),
  
  -- Quiz Results
  zodiac_sign TEXT,
  mbti_type TEXT,
  soul_wine TEXT,
  quiz_completed_at TIMESTAMPTZ,
  
  -- Preferences
  preferred_wine_types TEXT[], -- ['red', 'white', 'sake', 'whisky', 'beer']
  taste_preferences JSONB DEFAULT '{}',
  
  -- Gamification
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges TEXT[] DEFAULT '{}',
  
  -- Metadata
  locale TEXT DEFAULT 'zh-TW',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 💳 SUBSCRIPTIONS TABLE
-- PayPal subscription management
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- PayPal Info
  paypal_subscription_id TEXT UNIQUE,
  paypal_plan_id TEXT,
  
  -- Plan Details
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'basic', 'premium')),
  price_amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'TWD',
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'suspended', 'expired', 'pending')),
  
  -- Dates
  started_at TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 💰 PAYMENTS TABLE
-- Payment history tracking
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  subscription_id UUID REFERENCES subscriptions(id),
  user_id UUID REFERENCES profiles(id),
  
  -- PayPal Info
  paypal_subscription_id TEXT,
  paypal_transaction_id TEXT UNIQUE,
  
  -- Payment Details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'TWD',
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed', 'refunded')),
  
  -- Dates
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ❌ PAYMENT FAILURES TABLE
-- Track failed payment attempts
-- ============================================
CREATE TABLE IF NOT EXISTS payment_failures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paypal_subscription_id TEXT,
  user_id UUID REFERENCES profiles(id),
  reason TEXT,
  failed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 🎯 QUIZ RESULTS TABLE
-- Store quiz attempts and results
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Anonymous tracking
  session_id TEXT,
  
  -- Quiz Data
  quiz_type TEXT NOT NULL, -- 'soul_wine', 'taste_profile', 'wine_match'
  zodiac_sign TEXT,
  mbti_type TEXT,
  answers JSONB DEFAULT '{}',
  
  -- Results
  result_wine TEXT,
  result_category TEXT,
  result_description TEXT,
  compatibility_score INTEGER,
  
  -- Metadata
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 🎮 GAME SESSIONS TABLE
-- Track game plays and scores
-- ============================================
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Game Info
  game_type TEXT NOT NULL, -- 'truth_or_dare', 'wheel', 'trivia'
  players_count INTEGER DEFAULT 1,
  
  -- Results
  score INTEGER DEFAULT 0,
  rounds_played INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  
  -- Metadata
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 💬 CHAT HISTORY TABLE
-- AI assistant conversations
-- ============================================
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Message Data
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- Context
  wine_context TEXT, -- Related wine being discussed
  intent TEXT, -- Detected user intent
  
  -- Metadata
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 📚 LEARNING PROGRESS TABLE
-- Course completion tracking
-- ============================================
CREATE TABLE IF NOT EXISTS learning_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Course Info
  course_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  
  -- Progress
  is_completed BOOLEAN DEFAULT FALSE,
  progress_percent INTEGER DEFAULT 0,
  quiz_score INTEGER,
  
  -- Metadata
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  UNIQUE(user_id, course_id, lesson_id)
);

-- ============================================
-- 🍾 WINE FAVORITES TABLE
-- User's saved wines
-- ============================================
CREATE TABLE IF NOT EXISTS wine_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Wine Info
  wine_name TEXT NOT NULL,
  wine_type TEXT, -- 'red', 'white', 'sparkling', 'sake', 'whisky', 'beer'
  wine_region TEXT,
  wine_image_url TEXT,
  
  -- User Notes
  personal_rating INTEGER CHECK (personal_rating >= 1 AND personal_rating <= 5),
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, wine_name)
);

-- ============================================
-- 🎮 GAME ROOMS TABLE
-- Party game rooms for invite / share link
-- ============================================
CREATE TABLE IF NOT EXISTS game_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- ============================================
-- 🎮 GAME ROOM PLAYERS TABLE
-- Players in a room (display name only, no auth)
-- ============================================
CREATE TABLE IF NOT EXISTS game_room_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 🎮 GAME ROOM STATES TABLE
-- Per-room per-game state (e.g. up-down-stairs: floor, currentPlayer, goingUp)
-- ============================================
CREATE TABLE IF NOT EXISTS game_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, game_id)
);

CREATE INDEX IF NOT EXISTS idx_game_states_room_game ON game_states(room_id, game_id);

-- RLS
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_game_rooms_slug ON game_rooms(slug);
CREATE INDEX IF NOT EXISTS idx_game_room_players_room ON game_room_players(room_id);

-- RLS: no policies = only service role (API) can access; anon has no access.
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_room_players ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 📊 ANALYTICS EVENTS TABLE
-- User behavior tracking
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  session_id TEXT,
  
  -- Event Info
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  
  -- Context
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 🔧 INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_zodiac ON profiles(zodiac_sign);

-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paypal ON subscriptions(paypal_subscription_id);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription ON payments(subscription_id);

-- Quiz Results
CREATE INDEX IF NOT EXISTS idx_quiz_user ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_type ON quiz_results(quiz_type);

-- Game Sessions
CREATE INDEX IF NOT EXISTS idx_game_user ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_type ON game_sessions(game_type);

-- Chat History
CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_history(created_at DESC);

-- Learning Progress
CREATE INDEX IF NOT EXISTS idx_learning_user ON learning_progress(user_id);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at DESC);

-- ============================================
-- 🔐 ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_favorites ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Subscriptions: Users can view own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Payments: Users can view own payments
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);

-- Quiz Results: Users can CRUD own results
CREATE POLICY "Users can manage own quiz results" ON quiz_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anonymous quiz results" ON quiz_results FOR INSERT WITH CHECK (user_id IS NULL);

-- Game Sessions: Users can CRUD own sessions
CREATE POLICY "Users can manage own game sessions" ON game_sessions FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Chat History: Users can CRUD own chats
CREATE POLICY "Users can manage own chats" ON chat_history FOR ALL USING (auth.uid() = user_id);

-- Learning Progress: Users can CRUD own progress
CREATE POLICY "Users can manage own progress" ON learning_progress FOR ALL USING (auth.uid() = user_id);

-- Wine Favorites: Users can CRUD own favorites
CREATE POLICY "Users can manage own favorites" ON wine_favorites FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 🎯 FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add points and level up
CREATE OR REPLACE FUNCTION add_user_points(
  p_user_id UUID,
  p_points INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_new_total INTEGER;
  v_new_level INTEGER;
BEGIN
  UPDATE profiles
  SET total_points = total_points + p_points
  WHERE id = p_user_id
  RETURNING total_points INTO v_new_total;
  
  -- Calculate level (every 100 points = 1 level)
  v_new_level := GREATEST(1, v_new_total / 100 + 1);
  
  UPDATE profiles
  SET level = v_new_level
  WHERE id = p_user_id AND level < v_new_level;
  
  RETURN v_new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 🎉 INITIAL DATA
-- ============================================

-- You can add initial data here if needed
-- INSERT INTO ... 

-- ============================================
-- ✅ SCHEMA COMPLETE
-- Run this SQL in Supabase SQL Editor
-- ============================================
