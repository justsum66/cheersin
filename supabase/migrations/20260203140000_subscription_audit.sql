-- P3-60：訂閱方案變更時記錄審計 — 可查詢誰何時從 basic 改為 premium 等
CREATE TABLE IF NOT EXISTS public.subscription_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  paypal_subscription_id TEXT,
  old_status TEXT,
  new_status TEXT,
  old_tier TEXT,
  new_tier TEXT,
  event_type TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_audit_user ON public.subscription_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_audit_changed ON public.subscription_audit(changed_at DESC);

COMMENT ON TABLE public.subscription_audit IS 'P3-60: Audit log for subscription status/tier changes from webhook or API';
