# Phase 3 Stage 2 Migration Guide

## Overview
This document provides guidance for migrating existing code to use the new unified hooks and managers created in Phase 3 Stage 2.

## New Hooks Available

### 1. `usePersistentStorage` - Unified Storage Management
**Replaces**: Manual localStorage/sessionStorage operations
**Features**: 
- Type safety with automatic serialization
- Validation and fallback support
- Debouncing and quota monitoring
- Built-in error handling

```typescript
// Before (manual implementation)
const [value, setValue] = useState(initialValue)
useEffect(() => {
  try {
    const raw = localStorage.getItem('key')
    if (raw) setValue(JSON.parse(raw))
  } catch { /* ignore */ }
}, [])

// After (using usePersistentStorage)
const [value, setValue] = usePersistentStorage('key', initialValue, {
  validate: (data): data is MyType => {/* validation logic */},
  debounceMs: 100
})
```

### 2. `useDataLoader` - Generic Data Loading
**Replaces**: Manual data fetching with useEffect
**Features**:
- Built-in caching with staleness control
- Automatic retry with exponential backoff
- Auto-refetch on window focus/reconnect
- Loading/error states management

```typescript
// Before (manual implementation)
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/data')
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [])

// After (using useDataLoader)
const { data, isLoading, error, refetch } = useDataLoader(
  () => fetch('/api/data').then(res => res.json()),
  [],
  {
    cache: true,
    maxRetries: 3,
    staleTime: 5 * 60 * 1000
  }
)
```

### 3. `useTimerManager` - Unified Timer Management
**Replaces**: Manual setInterval/setTimeout cleanup
**Features**:
- Automatic cleanup of timers
- Multiple timer types (interval, timeout, countdown)
- Pause/resume functionality
- Persistence support

```typescript
// Before (manual implementation)
const [seconds, setSeconds] = useState(10)
const intervalRef = useRef(null)

useEffect(() => {
  intervalRef.current = setInterval(() => {
    setSeconds(prev => {
      if (prev <= 1) {
        clearInterval(intervalRef.current)
        return 0
      }
      return prev - 1
    })
  }, 1000)
  
  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }
}, [])

// After (using useTimerManager)
const timerManager = useTimerManager()
const { seconds, isRunning, start, pause, reset } = useCountdownTimer(10)
```

### 4. `useSubscriptionManager` - Generic Subscription Pattern
**Replaces**: Manual subscription cleanup
**Features**:
- Automatic subscription management
- Auto-reconnect on failure
- Event buffering
- WebSocket support

```typescript
// Before (manual implementation)
const [data, setData] = useState(null)
const [error, setError] = useState(null)

useEffect(() => {
  const subscription = someService.subscribe(setData)
  return () => subscription.unsubscribe()
}, [])

// After (using useSubscriptionManager)
const { data, error, isLoading, subscribe, unsubscribe } = useSubscriptionManager(
  (callback) => someService.subscribe(callback),
  {
    autoResubscribe: true,
    maxRetries: 3
  }
)
```

## Migration Steps

### 1. Storage Migration
Files to update:
- `src/hooks/useLocalStorage.ts` (already migrated)
- `src/components/learn/hooks/useLearnProgress.ts` (already migrated)
- `src/hooks/useGamePersistence.ts` (planned)
- `src/components/games/GamesPageClient.tsx` (planned)
- `src/hooks/useProfileData.ts` (planned)
- `src/lib/i18n/advanced-i18n.tsx` (planned)

### 2. Data Loading Migration
Files to update:
- Game components with manual data fetching
- Profile data loading components
- Any components with useEffect + fetch patterns

### 3. Timer Migration
Files to update:
- Game components with countdown timers
- Components with interval-based updates
- Animation timing logic

### 4. Subscription Migration
Files to update:
- WebSocket connections
- Real-time data subscriptions
- Event-based components

## Migration Priority

### High Priority (Immediate)
1. `useLocalStorage.ts` - Already migrated, provides backward compatibility
2. `useLearnProgress.ts` - Already migrated with validation
3. Game timer components - Can use `useGameTimer` or `useTimerManager`

### Medium Priority (Next)
1. `useGamePersistence.ts` - Critical for game state management
2. `GamesPageClient.tsx` - Multiple localStorage patterns
3. Profile data hooks - Multiple storage operations

### Low Priority (Later)
1. Tournament hooks - Less critical
2. Sound management hooks - Already partially using storage
3. Analytics and tracking components

## Best Practices for Migration

### 1. Use Validation
Always provide validation functions when migrating to `usePersistentStorage`:
```typescript
const [data, setData] = usePersistentStorage('key', initialValue, {
  validate: (data): data is MyType => {
    return data && typeof data === 'object' && 'requiredField' in data
  },
  fallbackValue: defaultValue
})
```

### 2. Handle Backward Compatibility
For existing localStorage keys, ensure the new hooks can handle:
- Invalid/corrupted data
- Missing keys
- Data type changes

### 3. Test Thoroughly
- Check data persistence across page reloads
- Verify error handling
- Test edge cases (quota exceeded, private browsing)

### 4. Monitor Performance
- Use the built-in quota monitoring
- Check bundle size impact
- Verify no memory leaks

## Testing Strategy

### Unit Tests
```bash
npm run test:hooks
# Tests for:
# - usePersistentStorage
# - useDataLoader
# - useTimerManager
# - useSubscriptionManager
# - useGameShared extended hooks
```

### Integration Tests
- Test hooks in combination
- Verify migration from old to new patterns
- Check persistence behavior

### E2E Tests
- Verify existing functionality unchanged
- Test data loading scenarios
- Check real-time updates

## Rollback Plan

If issues are discovered:
1. Revert individual file migrations
2. Use the backward-compatible `useLocalStorage` wrapper
3. Fall back to manual implementations where needed

## Next Steps

1. Complete remaining high-priority migrations
2. Write comprehensive unit tests
3. Run E2E test suite
4. Update documentation
5. Create examples and best practices guide

The migration framework is now in place and ready for systematic rollout across the codebase.