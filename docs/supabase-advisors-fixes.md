# Supabase Advisors 修復清單（31 issues need attention）

來源：Dashboard → Database → Advisors（security + performance）。  
對應任務：SB-30；部分與 SB-01～SB-05、SB-19～SB-20 重疊。

## Security（2 項）

| # | 狀態 | 表 | 說明 | Remediation |
|---|------|-----|------|-------------|
| S1 | ☑ | `ai_feedback` | RLS policy「Allow insert for feedback API」INSERT 的 WITH CHECK 為 true，等同無限制 | 已改為僅允許 anon/authenticated 角色寫入（migration: rls_ai_feedback_tighten_and_profiles_index）；應用層 rate limit 由 chat/feedback 與限流處理 |
| S2 | ☑ | `game_states` | RLS policy「Authenticated can manage game_states」ALL 的 USING/WITH CHECK 皆 true | 已收緊為：僅能存取自己為參與者或房主的房間之 game_states（migration: rls_game_states_tighten）；[doc](https://supabase.com/docs/guides/database/database-linter?lint=0024_permissive_rls_policy) |

## Performance — Auth RLS Initplan（20 項）

將 RLS 中的 `auth.uid()` 改為 `(select auth.uid())`，避免每行重算。

| # | 狀態 | 表 | Policy 名稱 |
|---|------|-----|-------------|
| P1 | ☑ | subscriptions | Users can view own subscriptions |
| P2 | ☑ | subscriptions | Users can insert own subscriptions |
| P3 | ☑ | quiz_results | Users can view own quiz results |
| P4 | ☑ | quiz_results | Users can insert own quiz results |
| P5 | ☑ | game_sessions | Users can create game sessions |
| P6 | ☑ | game_sessions | Hosts can update their game sessions |
| P7 | ☑ | learning_progress | Users can view/insert/update own progress（3 支） |
| P8 | ☑ | achievements | Users can view/insert own achievements（2 支） |
| P9 | ☑ | chat_history | Users can view/insert/update own chat history（3 支） |
| P10 | ☑ | wine_favorites | 已合併為單一「Users can manage own favorites」並改用 (select auth.uid()) |
| P11 | ☑ | push_subscriptions | Users can insert/delete/read own（3 支） |
| P12 | ☑ | chapter_progress | Users can read/insert own chapter_progress（2 支） |
| P13 | ☑ | party_dj_plans | Users can insert/select/delete own party_dj_plans（3 支） |

## Performance — 其他（9 項）

| # | 狀態 | 類型 | 說明 |
|---|------|------|------|
| P14 | ☑ | multiple_permissive_policies | wine_favorites 已合併為單一 FOR ALL 政策 |
| P15 | ☑ | duplicate_index | profiles：已 DROP idx_profiles_subscription，保留 idx_profiles_subscription_tier（migration: rls_ai_feedback_tighten_and_profiles_index） |
| P16～P22 | ☐ | unused_index | 多表未使用索引（INFO 級）；依查詢模式決定保留或 DROP，見 Dashboard；暫不變更，僅註記於本文件 |

---

## 修復順序建議

1. **Auth RLS Initplan**：一次 migration 將上述表之 `auth.uid()` 改為 `(select auth.uid())`，並合併 wine_favorites 的兩條 SELECT 政策。
2. **Security S1/S2**：依產品需求收緊 ai_feedback、game_states 的 RLS。
3. **duplicate_index / unused_index**：依查詢模式決定保留或 DROP。

完成後於本文件將對應項勾選為 ☑，並在 Dashboard 確認「issues need attention」數字下降。
