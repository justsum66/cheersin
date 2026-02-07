-- ============================================
-- 知識庫管理後台用表：knowledge_docs
-- 管理員新增/編輯/刪除後會同步到 Pinecone
-- ============================================

CREATE TABLE IF NOT EXISTS public.knowledge_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  course_id TEXT NOT NULL,
  chapter TEXT NOT NULL,
  content TEXT NOT NULL,
  vector_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_docs_course ON public.knowledge_docs(course_id);
ALTER TABLE public.knowledge_docs ENABLE ROW LEVEL SECURITY;
-- 無 policy = 僅 service_role（API 後台）可存取
