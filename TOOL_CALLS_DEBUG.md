# Tool Calls Debug Guide

## Current Issue
Weather tool calls are not displaying in the UI. Backend is working correctly but data is not making it to the frontend components.

## Debug Steps

### 1. Check Browser Console
Look for these logs in order:

```
🔍 Processing message: { ... }
✅ Converting weather_tool_data to toolInvocations: [...]
📦 Created weather toolInvocation: { ... }
📋 Final toolInvocations for message: { ... }
🌤️ WeatherToolUI received: { ... }
🌤️ Processed weatherData: [...]
```

### 2. Expected Data Flow

**Backend (API) →**
```json
{
  "weatherData": [{
    "icao": "EGKK",
    "metar": { ... },
    "taf": { ... }
  }]
}
```

**Database (weather_tool_data) →**
```json
[{
  "icao": "EGKK",
  "metar": { ... },
  "taf": { ... }
}]
```

**ai-chat-panel.tsx (Transform) →**
```javascript
{
  state: 'result',
  toolName: 'get_airport_weather',
  result: {
    data: {
      icao: "EGKK",
      metar: { ... },
      taf: { ... }
    }
  }
}
```

**WeatherToolUI (Display) →**
- Extracts `result.data`
- Displays weather card

### 3. Common Issues

#### Issue A: `weather_tool_data` is null in database
**Check:** Database message has `weather_tool_data` field populated
**Fix:** Ensure API saves data correctly

#### Issue B: Data format mismatch
**Check:** Console logs show structure at each step
**Fix:** Adjust transformation in ai-chat-panel.tsx

#### Issue C: Timing issue - data not saved before refetch
**Check:** 500ms delay in useSendMessage before invalidate
**Fix:** Increase delay or use different invalidation strategy

#### Issue D: Empty result object
**Check:** `result: {}` in console
**Cause:** weatherItem is undefined or empty
**Fix:** Check why weather_tool_data array has empty items

### 4. Test Query
```sql
SELECT id, role, content, weather_tool_data, airport_tool_data 
FROM chat_messages 
WHERE conversation_id = 'YOUR_CONVERSATION_ID'
ORDER BY created_at DESC 
LIMIT 5;
```

### 5. Quick Fix Test
If data exists in database but not showing:
1. Clear localStorage cache: `localStorage.clear()`
2. Hard refresh: Cmd+Shift+R
3. Send new test message: "weather at KJFK"
4. Check console logs for data flow
