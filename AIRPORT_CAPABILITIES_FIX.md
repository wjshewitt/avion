# Airport Capabilities Tool Fix - check_type Mismatch

## Issue

The `get_airport_capabilities` tool was failing to return runway data when called with `check_type: 'runway_length'`, resulting in empty responses with:
```
{
  hasRunways: false,
  runwayCount: undefined
}
```

## Root Cause

**Schema/Implementation Mismatch** for the `check_type` parameter:

### Tool Schema Definition
**Location**: `app/api/chat/general/route.ts` and `lib/chat/messages.ts`
```typescript
check_type: 'ils_availability' | 'runway_length' | 'navigation_aids' | 'all'
```

### Implementation Handlers
**Location**: `lib/gemini/tool-executor.ts`
- Original implementation only handled: `'all'`, `'runway_analysis'`, `'ils_availability'`, `'aircraft_suitability'`
- Missing handlers for: `'runway_length'`, `'navigation_aids'`

When Gemini called the tool with `check_type: 'runway_length'` (a valid schema value), the condition in the implementation failed:
```typescript
// Old condition - didn't handle 'runway_length'
if (check_type === 'all' || check_type === 'runway_analysis') {
```

This caused the runway data block to be skipped entirely, returning empty/undefined runway information.

## Fix Applied

Updated `lib/gemini/tool-executor.ts` to properly handle all schema-defined `check_type` values:

### 1. Runway Analysis Condition
```typescript
// Before:
if (check_type === 'all' || check_type === 'runway_analysis') {

// After:
if (check_type === 'all' || check_type === 'runway_length' || check_type === 'runway_analysis') {
```

### 2. Navigation/ILS Condition
```typescript
// Before:
if (check_type === 'all' || check_type === 'ils_availability') {

// After:
if (check_type === 'all' || check_type === 'ils_availability' || check_type === 'navigation_aids') {
```

## Impact

✅ **Fixed**: Tool now returns proper runway data for all valid `check_type` values
✅ **No Breaking Changes**: All existing functionality preserved
✅ **Full Schema Coverage**: All schema-defined check types now work correctly

## Testing

When the tool is called with `check_type: 'runway_length'` for KJFK:
- **Before**: `hasRunways: false, runwayCount: undefined`
- **After**: Returns full runway data including count, lengths, surface types, etc.

## Related Files

- `lib/gemini/tool-executor.ts` - Implementation fixed
- `app/api/chat/general/route.ts` - Tool schema definition
- `lib/chat/messages.ts` - Type definitions
