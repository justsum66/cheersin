-- ============================================
-- 46. QUIZ_RESULTS 表：id, user_id, zodiac, answers (jsonb), soul_wine, created_at
-- 補齊欄位與既有 schema 相容
-- ============================================

CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  zodiac TEXT,
  answers JSONB DEFAULT '{}',
  soul_wine TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 既有表補欄位
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
