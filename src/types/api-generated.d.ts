/** P2-296：由 OpenAPI 生成 — 執行 npx openapi-typescript api-docs/openapi.yaml -o src/types/api-generated.d.ts 可覆寫此檔 */
export interface HealthResponse {
  status: string
}
export interface SubscriptionAction {
  action: string
  planType?: string
  subscriptionId?: string
}
