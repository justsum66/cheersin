/**
 * 遮蔽敏感字串（如 API key）用於 log 或 debug 輸出；不輸出完整 key。
 * @param key 原始字串，undefined 或空視為未設定
 * @param head 顯示前幾字元，預設 8
 * @param tail 顯示後幾字元，預設 4
 */
export function maskKey(key: string | undefined, head = 8, tail = 4): string {
  if (!key || key.length === 0) return 'NOT SET'
  if (key.length < head + tail) return '***'
  return key.substring(0, head) + '...' + key.substring(key.length - tail)
}
