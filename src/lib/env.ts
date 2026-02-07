/**
 * 統一處理 .env 值：BOM/不可見字元、trim、去除前後引號
 * 避免 BOM/換行/引號導致 401 或 fetch failed
 */
export function normalizeEnv(value: string | undefined): string {
  let s = (value ?? '').replace(/\r\n/g, '\n').trim()
  if (s.length > 0 && s.charCodeAt(0) === 0xFEFF) s = s.slice(1).trim()
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).replace(/\r\n/g, '\n').trim()
  }
  return s
}

/** 回傳無尾端斜線的 URL（Supabase/Pinecone 用） */
export function normalizeUrl(value: string | undefined): string {
  return normalizeEnv(value).replace(/\/+$/, '')
}
