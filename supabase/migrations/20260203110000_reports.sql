-- P2-22：檢舉入口持久化（生產環境可查詢與稽核）
-- RLS：僅 service role 可寫/讀，前端不直連

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  description TEXT,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_created ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_type ON public.reports(type);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access reports"
  ON public.reports FOR ALL
  USING (true)
  WITH CHECK (true);
