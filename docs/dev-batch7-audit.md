# DEV Batch 7 審計（DEV-013～018）

對應計畫「下一批 70 任務」Batch 7。

## DEV-013：重大 API 變更有遷移或版本說明

- **作法**：重大 API 變更時，於 `api-docs/` 或 `docs/` 撰寫遷移說明或版本差異；OpenAPI 更新時註明 breaking changes。
- **驗收**：可選；有變更時補文件。

## DEV-014：分支策略與 PR 檢查一致

- **作法**：main/master 保護、PR 需通過 CI（lint、test、build、E2E）；分支命名可約定 `feat/`、`fix/`、`docs/`。見 CONTRIBUTING.md 與 `.github/workflows/ci.yml`。
- **驗收**：可選；與 GitHub 設定一致。

## DEV-015：預覽環境與生產環境變數分離

- **作法**：`.env.example` 列出必要變數並註明預覽/生產差異；Vercel 或部署平台使用不同 env（如 `NEXT_PUBLIC_*`、`SUPABASE_URL` 預覽 vs 生產）。
- **驗收**：可選；文件化分離要點。

## DEV-016：日誌等級與輪轉策略（若適用）

- **作法**：若使用自訂 logger，文件化等級（error/warn/info/debug）與輪轉策略；Vercel/serverless 多為集中式日誌，無輪轉則註明。
- **驗收**：可選。

## DEV-017：監控告警閾值文件

- **作法**：Sentry、Uptime、Web Vitals 等閾值（如 LCP &lt; 2.5s、錯誤率 &lt; 1%）可於 docs 或 PERF/A11Y 審計文件註明。
- **驗收**：可選。

## DEV-018：災難復原與備份要點

- **作法**：資料庫備份頻率、RTO/RPO 目標、還原步驟可於 docs 簡要列出；Supabase 等 managed 服務依其 SLA。
- **驗收**：可選。

---

**關鍵檔案**：`api-docs/openapi.yaml`、`CONTRIBUTING.md`、`.env.example`、`.github/workflows/ci.yml`、logger 設定、`docs/performance-audit.md`。
