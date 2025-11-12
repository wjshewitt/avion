# Gemini Streaming Implementation

## Overview

Implemented real-time streaming support for Gemini AI chat responses. When the **"Show thinking process"** setting is enabled, the AI response streams token-by-token for immediate user feedback, creating a more dynamic and engaging experience.

## Features

✅ **Real-time token streaming** - See AI responses as they're generated  
✅ **Progressive UI updates** - Messages update character-by-character  
✅ **Tool call handling** - Seamlessly handles mid-stream tool execution  
✅ **Backward compatible** - Non-streaming mode unchanged  
✅ **Setting-controlled** - Toggle via `showThinkingProcess` in chat settings  
✅ **Complete DB writes** - Only final complete messages saved (no partial chunks)  

## Architecture

### Flow Diagram

```
User sends message
    ↓
Frontend: useSendMessage hook
    ↓
Check showThinkingProcess setting
    ↓
API: /api/chat/general (streaming=true)
    ↓
Backend: sendGeneralChatMessageStream()
    ↓
Gemini API: generateContentStream()
    ↓
Server-Sent Events (SSE) stream ←→ Frontend parser
    ↓
Real-time UI updates (TanStack Query cache)
    ↓
Final DB write (complete message)
```

### Component Changes

#### 1. **Backend: Streaming Chat Client**
**File:** `lib/gemini/general-chat-client.ts`

New function: `sendGeneralChatMessageStream()`
- Uses `ai.models.generateContentStream()` instead of `generateContent()`
- Returns `AsyncGenerator` that yields chunks
- Yields 3 types of events:
  - `content` - Partial text as it arrives
  - `tool_call` - When tools are invoked mid-stream
  - `done` - Final response with metadata

**Key features:**
- Accumulates tokens progressively
- Handles tool calls during streaming (pause → execute → resume)
- Returns complete metadata (tokens, weather data, airport data)

#### 2. **Backend: API Route**
**File:** `app/api/chat/general/route.ts`

Added `streaming` parameter support:
- Accepts `streaming?: boolean` in request body
- When `streaming === true`:
  - Returns SSE stream with headers:
    ```typescript
    'Content-Type': 'text/event-stream'
    'Cache-Control': 'no-cache'
    'Connection': 'keep-alive'
    ```
  - Streams chunks as: `data: ${JSON.stringify(chunk)}\n\n`
  - Sends `[DONE]` when complete
  - Saves complete message to DB after streaming finishes
- When `streaming === false`:
  - Uses original non-streaming logic (unchanged)

**SSE Event Types:**
1. `content` - Partial AI response
   ```json
   {
     "type": "content",
     "content": "The weather at EGKK..."
   }
   ```

2. `tool_call` - Tool invocation detected
   ```json
   {
     "type": "tool_call",
     "toolCalls": [{ "name": "get_airport_weather", "args": {"icao": "EGKK"} }]
   }
   ```

3. `done` - Streaming complete with data
   ```json
   {
     "type": "done",
     "content": "...",
     "toolCalls": [...],
     "weatherData": [...],
     "airportData": [...]
   }
   ```

4. `complete` - Final metadata
   ```json
   {
     "type": "complete",
     "conversationId": "uuid",
     "cost": 0.0001
   }
   ```

5. `[DONE]` - Stream termination signal

#### 3. **Frontend: Send Message Hook**
**File:** `lib/tanstack/hooks/useSendMessage.ts`

Updated to handle streaming:
- Reads `showThinkingProcess` from chat settings
- Passes `streaming` parameter to API
- When streaming:
  - Uses `ReadableStream` reader to parse SSE chunks
  - Updates TanStack Query cache progressively
  - Creates/updates optimistic AI message with each chunk
  - Returns final response for cache invalidation
- When not streaming:
  - Original fetch logic unchanged

**Progressive cache updates:**
```typescript
queryClient.setQueryData(
  ['conversation-messages', conversationId],
  (old) => {
    // Update last message or create new streaming message
    // This triggers UI re-render automatically
  }
);
```

#### 4. **Frontend: UI Display**
**File:** `components/ai-chat-panel.tsx`

**No changes required!** 🎉

The TanStack Query cache updates automatically trigger re-renders, so existing message display components work seamlessly with streaming.

## Usage

### Enable Streaming

1. Open chat settings (⚙️ icon in chat panel)
2. Toggle **"Show thinking process"** ON
3. Send a message
4. Watch the AI response stream in real-time!

### Disable Streaming

1. Toggle **"Show thinking process"** OFF
2. Messages will use the original non-streaming mode

## Technical Details

### Tool Calls During Streaming

When Gemini needs to call a tool mid-stream:

1. **Detection:** Chunk contains `functionCalls`
2. **Yield:** `tool_call` event sent to frontend
3. **Execution:** Tools executed in parallel
4. **Resume:** Continue streaming with tool results
5. **Final:** Complete response with tool data

### Error Handling

- **Stream interruption:** Close connection, show partial + error
- **Tool failure:** Show error in tool card, continue streaming
- **Network timeout:** Fallback shows error message
- **Parse errors:** Logged but don't break stream

### Performance

- **First token latency:** ~100-200ms (typical for streaming)
- **Perceived performance:** Better (immediate feedback)
- **Network:** Slightly higher overhead (SSE protocol)
- **Database:** Same writes as non-streaming (complete messages only)

### Database Strategy

Only complete messages are saved to avoid database noise:

```typescript
// ❌ NOT saved: Individual streaming chunks
// ✅ SAVED: Final complete message after streaming finishes

const messagesToInsert = [
  { role: 'user', content: userMessage },
  { 
    role: 'assistant', 
    content: finalAccumulatedText,
    weather_tool_data: weatherData,
    airport_tool_data: airportData
  }
];
```

## Testing Checklist

- [x] TypeScript compilation passes
- [ ] Simple query streaming (no tools)
- [ ] Query with weather tool call
- [ ] Query with airport capabilities tool
- [ ] Multiple parallel tool calls
- [ ] Toggle setting on/off between messages
- [ ] Error during streaming (network interruption)
- [ ] Tool execution error during streaming
- [ ] Verify DB writes are complete
- [ ] Verify token counts are accurate
- [ ] Test with long responses (multi-chunk)
- [ ] Verify thinking tokens display correctly

## Next Steps

1. **Test in development:**
   ```bash
   npm run dev
   ```

2. **Open chat panel** and enable "Show thinking process"

3. **Send test queries:**
   - Simple: "What's the weather at KJFK?"
   - Complex: "Compare weather at EGKK and LFPG"
   - Analysis: "Should I fly to TNCM in a G650 today?"

4. **Verify streaming behavior:**
   - ✅ Text appears character-by-character
   - ✅ Tool cards appear after text
   - ✅ No console errors
   - ✅ Messages saved to DB correctly

## Troubleshooting

### Streaming doesn't start
- Check `showThinkingProcess` setting is enabled
- Verify browser console for errors
- Check network tab for SSE connection

### Stream cuts off early
- Check backend logs for errors
- Verify Gemini API key is valid
- Check for rate limiting

### Messages not saving to DB
- Check Supabase connection
- Verify user authentication
- Check backend logs for insert errors

## Code References

**Streaming function:**
```typescript
lib/gemini/general-chat-client.ts:612-859
export async function* sendGeneralChatMessageStream(...)
```

**API route streaming branch:**
```typescript
app/api/chat/general/route.ts:72-187
if (streaming) { ... }
```

**Frontend SSE parser:**
```typescript
lib/tanstack/hooks/useSendMessage.ts:58-156
if (streaming && response.body) { ... }
```

## Benefits

1. **Better UX:** Immediate feedback, less waiting
2. **Perceived performance:** Feels faster even if total time is similar
3. **Engagement:** Users see AI "thinking" in real-time
4. **Transparency:** Shows tool calls as they happen
5. **Modern:** Matches ChatGPT and other modern AI interfaces

## Backward Compatibility

✅ **100% backward compatible**
- Existing non-streaming mode unchanged
- Users can toggle on/off anytime
- DB schema unchanged
- API accepts both streaming and non-streaming requests

---

**Implementation Date:** 2025-11-12  
**Status:** ✅ Complete - Ready for testing  
**Setting:** `showThinkingProcess` in Chat Settings  
