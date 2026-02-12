/**
 * SEC-006：安全的 JSON-LD 結構化資料 script
 * 僅接受物件，內部以 JSON.stringify 輸出，禁止使用者輸入或原始 HTML
 */

export interface SafeJsonLdScriptProps {
  /** 結構化資料物件（將以 JSON.stringify 輸出，不得含使用者可控內容） */
  data: object
}

export function SafeJsonLdScript({ data }: SafeJsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
