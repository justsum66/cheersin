# TEST-005：TypeScript any 計劃

## 目標

逐步消除專案中的 `any` 型別，提升型別安全。

## 策略

1. **tsconfig**：`strict: true` 已啟用；`noImplicitAny` 可選啟用以強制顯式型別
2. **優先順序**：API route 回應、lib 函數參數與回傳值、React 元件 props
3. **取代方案**：
   - `unknown` + 型別守衛（type guard）
   - 泛型 `<T>` 取代 `any`
   - 明確的 interface/type 定義

## 檢查指令

```bash
# 找出 any 使用處
rg ":\s*any\b|as any" src --type ts
```

## 現況

- API 回應多使用 `NextResponse.json()`，型別由 Zod schema 推斷
- 部分動態資料（如 `record<string, unknown>`）使用 `unknown` 較安全
- React 元件 props 建議明確定義 interface

## 更新日期

2025-02-12
