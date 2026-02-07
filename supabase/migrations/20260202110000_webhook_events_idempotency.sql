-- EXPERT_60 P1: PayPal Webhook 冪等 — 以 event_id 去重，重複則 return 200 不重複寫入
-- Table: 記錄已處理的 webhook event id，用於冪等檢查
CREATE TABLE IF NOT EXISTS public.webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.webhook_events IS 'PayPal webhook 冪等：已處理的 event id，重複送達時不重複寫入';
