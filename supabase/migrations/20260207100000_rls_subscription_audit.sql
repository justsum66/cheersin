-- P0-012：subscription_audit 啟用 RLS + 拒絕政策
-- 僅後端（service_role）可寫入/讀取；anon、authenticated 無法存取，避免審計資料外洩。

ALTER TABLE public.subscription_audit ENABLE ROW LEVEL SECURITY;

-- 不建立任何 PERMISSIVE 政策 → anon / authenticated 無法 SELECT/INSERT/UPDATE/DELETE
-- service_role 會繞過 RLS，故 API/Webhook 使用 service_role 可正常寫入審計紀錄。
COMMENT ON TABLE public.subscription_audit IS 'P3-60: Audit log for subscription status/tier changes from webhook or API. P0-012: RLS enabled, only service_role can access.';
