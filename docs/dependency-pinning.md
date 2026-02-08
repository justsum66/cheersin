# P2-360：依賴固定 (Dependency Pinning)

為降低因依賴自動升級引入的風險，建議：

- **package.json**：核心依賴可考慮使用精確版本（無 `^` / `~`），或鎖定次要版本（如 `^15.5.0` 僅允許 patch 升級）。
- **package-lock.json**：已納入版控，CI 與部署應使用 `npm ci` 以鎖定依賴樹。
- **定期更新**：建立每週或每雙週執行 `npm update` 與完整測試的流程，並用 `npm audit` 掃描已知漏洞。

本專案目前使用 `^` 以取得 patch/minor 更新，並以 lockfile 鎖定實際安裝版本。
