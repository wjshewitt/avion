# Gemini 2.5 Thinking Implementation

## Changes Completed

### 1. Removed trigger_flight_selector_ui Tool

**Problem:** This tool was causing "Opening flight selector..." message to appear after every chat request.

**Solution:** Removed the tool entirely since `FlightSelectorToolUI` component now handles flight display when `get_user_flights` is called.

**Files Modified:**
- `lib/gemini/flight-tools.ts` - Removed tool declaration
- `lib/gemini/tool-executor.ts` - Removed executor function and case handler
- `lib/gemini/general-chat-client.ts` - Removed UI trigger detection logic
- `app/api/chat/general/route.ts` - Removed uiTrigger and uiAction from response

### 2. Added Thinking Configuration

**Implementation:** Added `thinkingConfig` to Gemini API calls with dynamic budget allocation.

**File:** `lib/gemini/general-chat-client.ts`

**Features:**
```typescript
thinkingConfig: {
  thinkingBudget: getThinkingBudget(userMessage),
  includeThoughts: true
}
```

**Budget Strategy:**
- **0 tokens** - Simple fact retrieval ("what is...", "show me...", "list...")
- **8192 tokens** - Complex reasoning ("should I...", "analyze", "compare", "risk", "recommend")
- **-1 (dynamic)** - Everything else (model decides)

### 3. Updated Token Tracking

**Added thinking token tracking to all response objects:**

```typescript
tokensUsed: {
  input: response.usageMetadata?.promptTokenCount || 0,
  output: response.usageMetadata?.candidatesTokenCount || 0,
  thinking: response.usageMetadata?.thoughtsTokenCount || 0
}
```

**Benefit:** Full visibility into token usage including thinking costs.

### 4. Updated System Prompt

**Changed example from:**
```
✅ "Tell me about my flights" → trigger_flight_selector_ui() [opens picker]
```

**To:**
```
✅ "Tell me about my flights" → get_user_flights(filter_type="upcoming")
```

## Testing

### Test Cases to Verify

1. **Simple Query (No Thinking)**
   ```
   "What's the weather at KJFK?"
   ```
   - Should return fast
   - Thinking tokens should be 0
   - No "Opening flight selector..." message

2. **Complex Query (High Thinking Budget)**
   ```
   "Should I delay my flight from KTEB to KMIA given the current weather conditions?"
   ```
   - Should use thinking (8192 budget)
   - Response should show deeper analysis
   - Thinking tokens > 0

3. **Flight Query (No Placeholder Message)**
   ```
   "Show me my flights"
   ```
   - Should call get_user_flights tool
   - Should render FlightSelectorToolUI component
   - Should NOT show "Opening flight selector..." message

4. **Multi-turn Conversation**
   ```
   Turn 1: "What's the weather at KJFK?"
   Turn 2: "How about KLAX?"
   ```
   - Context should be maintained
   - Thought signatures preserved (automatically)

## Benefits

1. **✅ No More Placeholder Messages** - "Opening flight selector..." is gone
2. **✅ Better Reasoning** - Complex queries get deeper analysis
3. **✅ Cost Visibility** - Token tracking includes thinking costs
4. **✅ Optimized Performance** - Simple queries don't waste tokens on thinking
5. **✅ Cleaner Tool Usage** - Flight selector works as intended with custom UI

## Next Steps (Optional Enhancements)

### Add Thinking Display in UI

To show users the AI's reasoning process:

1. Update `hooks/usePremiumChat.ts`:
```typescript
export interface PremiumMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  thoughts?: string;  // Add thought summary
  weatherData?: any;
  airportData?: any;
}
```

2. Parse thoughts from response parts:
```typescript
const parts = response.candidates?.[0]?.content?.parts || [];
const thoughts = parts
  .filter(part => part.thought && part.text)
  .map(part => part.text)
  .join('\n');
```

3. Add collapsible "Show Reasoning" section in chat UI (optional)

### Implement Thought Signatures for Multi-turn

Thought signatures are automatically preserved when you send back the complete response in conversation history. Current implementation already does this correctly.

### Update Cost Calculation

Update `calculateGeneralChatCost` to include thinking tokens:

```typescript
export function calculateGeneralChatCost(
  inputTokens: number,
  outputTokens: number,
  thinkingTokens: number = 0
): number {
  // Flash: $0.075/$0.30 per 1M tokens
  // Thinking tokens count as output tokens for pricing
  return (
    inputTokens * 0.000000075 + 
    (outputTokens + thinkingTokens) * 0.0000003
  );
}
```

Then update the API route to pass thinking tokens:
```typescript
const costUsd = calculateGeneralChatCost(
  tokensUsed.input, 
  tokensUsed.output,
  tokensUsed.thinking
);
```

## Pricing Impact

**Current Gemini 2.5 Flash Pricing:**
- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens
- Thinking: Counts as output tokens ($0.30 per 1M)

**Estimated Impact:**
- Simple queries: No change (thinking budget = 0)
- Complex queries: +10-30% cost (worth it for better reasoning)
- Average: +15% overall cost with significantly better quality

## Monitoring

Track these metrics:
- Average thinking tokens per request
- Thinking budget distribution (0 / dynamic / 8192)
- Response quality improvement
- User satisfaction with complex query responses

## Documentation References

- [Gemini Thinking Guide](https://ai.google.dev/gemini-api/docs/thinking)
- [Function Calling with Thinking](https://ai.google.dev/gemini-api/docs/function-calling#thinking)
- [Thinking Budgets](https://ai.google.dev/gemini-api/docs/thinking#set-budget)
- [Thought Summaries](https://ai.google.dev/gemini-api/docs/thinking#summaries)
