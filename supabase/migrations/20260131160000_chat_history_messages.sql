-- ============================================
-- 47. CHAT_HISTORY 支援對話記憶：messages (jsonb), context
-- ============================================

-- 既有 chat_history 可能為單訊息結構，補 messages 與 context 供對話記憶
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chat_history' AND column_name = 'messages') THEN
    ALTER TABLE public.chat_history ADD COLUMN messages JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chat_history' AND column_name = 'context') THEN
    ALTER TABLE public.chat_history ADD COLUMN context TEXT;
  END IF;
END $$;

-- 若專案使用「一筆一對話」可另建 chat_conversations（可選）
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
