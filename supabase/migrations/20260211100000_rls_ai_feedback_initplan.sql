-- SEC-002 / Advisors: ai_feedback RLS 使用 auth.jwt() 改為 (select ...) 以 InitPlan 執行，避免每行重算
DROP POLICY IF EXISTS "Allow insert for feedback API" ON public.ai_feedback;
CREATE POLICY "Allow insert for feedback API"
ON public.ai_feedback FOR INSERT
TO public
WITH CHECK (
  coalesce((select auth.jwt()->>'role'), 'anon') IN ('anon', 'authenticated')
);
