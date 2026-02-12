-- S1: ai_feedback INSERT 僅允許 anon/authenticated（應用層 rate limit 另做）
DROP POLICY IF EXISTS "Allow insert for feedback API" ON public.ai_feedback;
CREATE POLICY "Allow insert for feedback API"
ON public.ai_feedback FOR INSERT
TO public
WITH CHECK (
  coalesce((auth.jwt()->>'role'), 'anon') IN ('anon', 'authenticated')
);

-- P15: 重複索引二擇一，保留 idx_profiles_subscription_tier，移除 idx_profiles_subscription
DROP INDEX IF EXISTS public.idx_profiles_subscription;
