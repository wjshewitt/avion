# Dynamic AI Chat Components

Real-time, animated components for AI chat interfaces. All components feature live updates, smooth animations, and production-ready code.

## 🎯 Overview

7 new dynamic components with animations and real-time tracking:
1. **LiveTokenCounter** - Real-time token usage with animations
2. **StreamingVisualizer** - Streaming speed and throughput metrics
3. **ContextWindowMeter** - Circular progress for context usage
4. **ToolExecutionProgress** - Multi-step execution tracker
5. **TypewriterMessage** - Typewriter/streaming text effects
6. **MessageDiffViewer** - Compare message versions
7. **LiveCostTracker** - Real-time cost calculation

## 📍 Location

**Demo Page:** `/ai-test-components` (tabs: "Live Metrics" & "Animations")  
**Components:** `components/chat/`

---

## 🔧 Components

### 1. LiveTokenCounter

**File:** `components/chat/LiveTokenCounter.tsx`

Real-time token counting with visual feedback and warnings.

**Features:**
- ✅ Animated counter with smooth transitions
- ✅ Progress bar with color-coded thresholds
- ✅ Input/output/cached token breakdown
- ✅ Delta tracking with trend indicators
- ✅ Warning alerts at 90% capacity
- ✅ Streaming pulse animation

**Usage:**
```tsx
import { LiveTokenCounter, useTokenCounter } from '@/components/chat/LiveTokenCounter';

// With hook
const { inputTokens, outputTokens, addInput, addOutput, reset } = useTokenCounter();

<LiveTokenCounter
  inputTokens={inputTokens}
  outputTokens={outputTokens}
  isStreaming={isGenerating}
  showBreakdown
  maxTokens={32768}
/>

// On new user message
addInput(estimateTokens(userMessage));

// On assistant response chunk
addOutput(chunk.tokens);
```

**Props:**
```typescript
interface LiveTokenCounterProps {
  inputTokens: number;
  outputTokens: number;
  isStreaming?: boolean;
  showBreakdown?: boolean;
  maxTokens?: number;
}
```

---

### 2. StreamingVisualizer

**File:** `components/chat/StreamingVisualizer.tsx`

Visualizes streaming speed, throughput, and real-time performance.

**Features:**
- ✅ Live tokens/second calculation
- ✅ Duration timer
- ✅ Throughput waveform visualization
- ✅ Chunk-by-chunk tracking
- ✅ Current content preview
- ✅ Compact mode for inline display

**Usage:**
```tsx
import { StreamingVisualizer, useStreamingTracker } from '@/components/chat/StreamingVisualizer';

const { chunks, isStreaming, addChunk, start, stop, reset } = useStreamingTracker();

// Start streaming
start();

// Add chunks as they arrive
onChunk((text, tokens) => {
  addChunk(text, tokens);
});

// Display visualizer
<StreamingVisualizer
  isStreaming={isStreaming}
  chunks={chunks}
  currentContent={currentText}
/>

// Stop when complete
stop();
```

**Props:**
```typescript
interface StreamingVisualizerProps {
  isStreaming: boolean;
  chunks?: StreamChunk[];
  currentContent?: string;
  compact?: boolean;
}

interface StreamChunk {
  timestamp: number;
  content: string;
  tokens: number;
}
```

---

### 3. ContextWindowMeter

**File:** `components/chat/ContextWindowMeter.tsx`

Circular progress meter showing context window usage by type.

**Features:**
- ✅ Circular SVG progress visualization
- ✅ Color-coded by message type
- ✅ Breakdown by system/user/assistant/tool
- ✅ Warning at 80%+ usage
- ✅ Compact version for headers
- ✅ Smooth animations

**Usage:**
```tsx
import { ContextWindowMeter, ContextWindowMeterCompact } from '@/components/chat/ContextWindowMeter';

// Full version
<ContextWindowMeter
  items={[
    { type: 'system', tokens: 450, label: 'System prompt' },
    { type: 'user', tokens: 2340, label: 'User messages' },
    { type: 'assistant', tokens: 3840, label: 'Assistant responses' },
    { type: 'tool', tokens: 890, label: 'Tool outputs' },
  ]}
  maxTokens={32768}
  showBreakdown
/>

// Compact for header
<ContextWindowMeterCompact used={7520} max={32768} />
```

---

### 4. ToolExecutionProgress

**File:** `components/chat/ToolExecutionProgress.tsx`

Multi-step progress tracker for tool executions with live timers.

**Features:**
- ✅ Step-by-step progress visualization
- ✅ Live elapsed time for running steps
- ✅ Duration display for completed steps
- ✅ Error state with messages
- ✅ Overall progress bar
- ✅ Total duration summary

**Usage:**
```tsx
import { ToolExecutionProgress, useToolExecutionTracker } from '@/components/chat/ToolExecutionProgress';

const { steps, addStep, startStep, completeStep, failStep, reset } = useToolExecutionTracker();

// Add steps
const step1 = addStep('Validating input');
const step2 = addStep('Fetching data');
const step3 = addStep('Processing results');

// Execute steps
startStep(step1);
// ... do work ...
completeStep(step1);

startStep(step2);
// ... error occurs ...
failStep(step2, 'Network timeout');

// Display progress
<ToolExecutionProgress
  toolName="get_airport_weather"
  steps={steps}
/>
```

---

### 5. TypewriterMessage

**File:** `components/chat/TypewriterMessage.tsx`

Typewriter and streaming text effects for messages.

**Features:**
- ✅ Character-by-character typewriter
- ✅ Word-by-word animation
- ✅ Chunk-based streaming
- ✅ Animated cursor
- ✅ Configurable speed
- ✅ onComplete callback

**Usage:**
```tsx
import { 
  TypewriterMessage, 
  StreamingMessage, 
  WordByWordMessage 
} from '@/components/chat/TypewriterMessage';

// Character-by-character
<TypewriterMessage
  content="Your message text here..."
  speed={50}  // characters per second
  showCursor
  onComplete={() => console.log('Done')}
/>

// Word-by-word (more dramatic)
<WordByWordMessage
  content="Your message text here..."
  wordsPerSecond={10}
  onComplete={() => console.log('Done')}
/>

// Chunk-based (matches real streaming)
<StreamingMessage
  chunks={['Hello ', 'world ', 'from ', 'AI!']}
  delay={50}  // ms between chunks
  onComplete={() => console.log('Done')}
/>
```

---

### 6. MessageDiffViewer

**File:** `components/chat/MessageDiffViewer.tsx`

Compare original and modified messages with visual diff.

**Features:**
- ✅ Inline diff view
- ✅ Split side-by-side view
- ✅ Color-coded additions/deletions
- ✅ Statistics (additions, deletions, unchanged)
- ✅ Compact diff indicator
- ✅ Word-level diffing

**Usage:**
```tsx
import { MessageDiffViewer, DiffIndicator } from '@/components/chat/MessageDiffViewer';

// Inline view (default)
<MessageDiffViewer
  original="The weather is acceptable."
  modified="The weather conditions are excellent with VFR flight category."
  mode="inline"
/>

// Split view
<MessageDiffViewer
  original={originalMessage}
  modified={regeneratedMessage}
  mode="split"
/>

// Compact indicator
<DiffIndicator
  original={originalMessage}
  modified={regeneratedMessage}
/>
```

---

### 7. LiveCostTracker

**File:** `components/chat/LiveCostTracker.tsx`

Real-time cost tracking with projections and alerts.

**Features:**
- ✅ Animated cost display
- ✅ Input/output/cached/tool breakdown
- ✅ Daily and monthly projections
- ✅ Savings from caching display
- ✅ High usage warnings
- ✅ Model-specific pricing

**Usage:**
```tsx
import { LiveCostTracker, useCostTracker } from '@/components/chat/LiveCostTracker';

const { breakdown, addInput, addOutput, addCached, addToolCall, reset } = useCostTracker('gemini-2.5-flash');

// Track usage
addInput(1250);
addOutput(3840);
addCached(850);
addToolCall();

// Display tracker
<LiveCostTracker
  breakdown={breakdown}
  model="gemini-2.5-flash"
  showProjection
/>

// Compact version
<LiveCostTracker
  breakdown={breakdown}
  model="gemini-2.5-flash"
  compact
/>
```

**Pricing:**
```typescript
const MODEL_PRICING = {
  'gemini-2.5-flash': { input: 0.075, output: 0.30, cached: 0.01875 },
  'gemini-2.5-pro': { input: 1.25, output: 5.00, cached: 0.3125 },
  // ... per 1M tokens
};
```

---

## 🚀 Integration Examples

### Adding to Chat Interface

```tsx
import { LiveTokenCounter } from '@/components/chat/LiveTokenCounter';
import { StreamingVisualizer } from '@/components/chat/StreamingVisualizer';
import { ToolExecutionProgress } from '@/components/chat/ToolExecutionProgress';

export function ChatInterface() {
  const { messages, isStreaming } = usePremiumChat();
  
  return (
    <div className="flex flex-col h-full">
      {/* Header with metrics */}
      <div className="border-b p-4 flex gap-4">
        <LiveTokenCounter
          inputTokens={totalInputTokens}
          outputTokens={totalOutputTokens}
          isStreaming={isStreaming}
        />
        <ContextWindowMeterCompact used={totalTokens} />
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.map(msg => (
          <Message key={msg.id} message={msg} />
        ))}
        
        {/* Show streaming visualizer while generating */}
        {isStreaming && (
          <StreamingVisualizer
            isStreaming
            chunks={streamChunks}
            currentContent={currentText}
          />
        )}
      </div>
    </div>
  );
}
```

### Tracking Tool Execution

```tsx
const { steps, addStep, startStep, completeStep, reset } = useToolExecutionTracker();

async function executeToolCall(toolName: string, input: any) {
  const validationStep = addStep('Validating input');
  const fetchStep = addStep('Fetching data');
  const processStep = addStep('Processing results');
  
  try {
    startStep(validationStep);
    await validateInput(input);
    completeStep(validationStep);
    
    startStep(fetchStep);
    const data = await fetchData(input);
    completeStep(fetchStep);
    
    startStep(processStep);
    const result = await processData(data);
    completeStep(processStep);
    
    return result;
  } catch (error) {
    failStep(fetchStep, error.message);
  }
}

// In JSX
<ToolExecutionProgress toolName={toolName} steps={steps} />
```

---

## 🎨 Styling

All components use design tokens and adapt to your theme:
- Color-coded status (green/amber/red)
- Smooth animations (300-500ms)
- Pulse effects for live updates
- Progress bars with transitions
- Accessible ARIA labels

---

## 📊 Performance

All components are optimized:
- `useMemo` for expensive calculations
- `useCallback` for stable functions
- `useRef` for interval management
- Debounced updates where appropriate
- Minimal re-renders

---

## 🧪 Testing

Visit `/ai-test-components` with tabs:
- **Live Metrics** - All real-time tracking components
- **Animations** - Typewriter effects and diff viewers

Each tab includes:
- Interactive demos
- "Simulate" buttons for testing
- Live state management
- Feature lists

---

## 📦 Files Created

```
components/chat/
├── LiveTokenCounter.tsx           # 160 lines - Token tracking
├── StreamingVisualizer.tsx        # 200 lines - Streaming metrics
├── ContextWindowMeter.tsx         # 190 lines - Context progress
├── ToolExecutionProgress.tsx      # 210 lines - Tool steps
├── TypewriterMessage.tsx          # 120 lines - Text animations
├── MessageDiffViewer.tsx          # 220 lines - Message comparison
└── LiveCostTracker.tsx            # 250 lines - Cost tracking

Total: ~1,350 lines of new dynamic components
```

---

## 🔄 Next Steps

1. **Integrate trackers** into usePremiumChat hook
2. **Add telemetry** - send metrics to analytics
3. **Persist preferences** - save which metrics users view
4. **Add export** - download metrics as CSV/JSON
5. **Create dashboard** - aggregate view of all metrics

---

Built for **Avion Flight Operations Platform**  
Framework: Next.js 16 + React + TypeScript  
All components production-ready ✅
