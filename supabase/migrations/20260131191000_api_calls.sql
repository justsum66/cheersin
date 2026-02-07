-- ============================================
-- API 使用記錄（96/99）：Token 追蹤、每日呼叫量、Dashboard 持久化
-- ============================================

CREATE TABLE IF NOT EXISTS public.api_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  endpoint TEXT NOT NULL,
  model TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_api_calls_timestamp ON public.api_calls(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_calls_endpoint ON public.api_calls(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_calls_model ON public.api_calls(model);

ALTER TABLE public.api_calls ENABLE ROW LEVEL SECURITY;

-- 僅 service role 可寫入/讀取（Dashboard 與 API 後端使用）
CREATE POLICY "Service role full access api_calls"
  ON public.api_calls FOR ALL
  USING (true)
  WITH CHECK (true);
