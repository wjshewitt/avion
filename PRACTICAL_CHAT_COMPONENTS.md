# Practical AI Chat Components

Production-ready enhancements for your existing chat interface. All components are fully typed, accessible, and ready to integrate with `usePremiumChat`.

## 🎯 Overview

Five new practical components to enhance AI chat interactions:
1. **Interactive Tool Calls** - Selectable, expandable tool executions
2. **Message Actions** - Copy, regenerate, edit, and rate messages
3. **Enhanced Thinking Block** - Your existing component (already in use)
4. **Chain of Thought** - Step-by-step reasoning visualization
5. **Inline Citations** - Source attribution for RAG implementations

## 📍 Location

**Demo Page:** `/ai-test-components`  
**Components:** `components/chat/`

## 🔧 Components

### 1. InteractiveToolCall

**File:** `components/chat/InteractiveToolCall.tsx`

Enhances tool execution display with interactive features.

**Features:**
- ✅ Checkbox selection (multi-select support)
- ✅ Expandable input/output JSON view
- ✅ Copy button for data extraction
- ✅ Export to JSON file
- ✅ Visual status: loading, completed, error
- ✅ Selection highlight with ring effect

**Usage:**
```tsx
import { InteractiveToolCall } from '@/components/chat/InteractiveToolCall';
import { getToolParts } from '@/lib/chat/messages';

const toolParts = getToolParts(message);

{toolParts.map((part) => (
  <InteractiveToolCall
    key={part.toolCallId}
    part={part}
    selectable
    onCopy={(data) => console.log('Copied:', data)}
    onExport={(data) => console.log('Exported:', data)}
  />
))}
```

**Props:**
```typescript
interface InteractiveToolCallProps {
  part: ToolUIPart;              // Tool part from message
  onCopy?: (data: any) => void;  // Copy callback
  onExport?: (data: any) => void; // Export callback
  selectable?: boolean;          // Enable checkbox
}
```

---

### 2. MessageActions

**File:** `components/chat/MessageActions.tsx`

Action bar for messages with common operations.

**Features:**
- ✅ Copy message content
- ✅ Regenerate response (assistant only)
- ✅ Edit message (user only)
- ✅ Thumbs up/down rating (assistant only)
- ✅ More options dropdown
- ✅ Compact mode for inline display

**Usage:**
```tsx
import { MessageActions } from '@/components/chat/MessageActions';

// Full mode
<MessageActions
  message={message}
  onCopy={() => copyToClipboard(getMessageText(message))}
  onRegenerate={() => regenerateMessage(message.id)}
  onRate={(rating) => rateMessage(message.id, rating)}
/>

// Compact mode
<MessageActions
  message={message}
  compact
  onCopy={() => copyToClipboard(getMessageText(message))}
  onEdit={() => setEditMode(true)}
/>
```

**Props:**
```typescript
interface MessageActionsProps {
  message: FlightChatMessage;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onEdit?: () => void;
  onRate?: (rating: 'up' | 'down') => void;
  className?: string;
  compact?: boolean;
}
```

---

### 3. ThinkingBlock (Enhanced)

**File:** `components/chat/ThinkingBlock.tsx` (already exists)

Your existing collapsible thinking block with metrics.

**Features:**
- ✅ Collapsible with smooth animation
- ✅ Streaming indicator
- ✅ Token count display
- ✅ Elapsed time tracking
- ✅ Markdown rendering
- ✅ Settings-aware visibility

**Usage:**
```tsx
import { ThinkingBlock } from '@/components/chat/ThinkingBlock';

<ThinkingBlock
  content={reasoningText}
  tokens={145}
  isStreaming={isGenerating}
  startTime={thinkingStartTime}
/>
```

---

### 4. ChainOfThought

**File:** `components/chat/ChainOfThought.tsx`

Step-by-step reasoning visualization with timeline or list view.

**Features:**
- ✅ Timeline or list view modes
- ✅ Step status: pending, active, completed
- ✅ Expandable step details
- ✅ Visual progress indicators
- ✅ Timestamp tracking
- ✅ Compact summary mode

**Usage:**
```tsx
import { ChainOfThought, useChainOfThought } from '@/components/chat/ChainOfThought';

// With pre-defined steps
const steps = [
  {
    id: '1',
    title: 'Understanding request',
    content: 'Analyzing user query...',
    status: 'completed',
    timestamp: new Date(),
  },
  // ... more steps
];

<ChainOfThought 
  steps={steps} 
  showTimeline={true} 
/>

// With dynamic hook
const { steps, addStep, completeStep, clear } = useChainOfThought();

// Add steps during processing
const stepId = addStep('Tool selection', 'Choosing appropriate tool...');
// Later...
completeStep(stepId);
```

**Props:**
```typescript
interface ChainOfThoughtProps {
  steps: ThoughtStep[];
  compact?: boolean;      // Show compact summary
  showTimeline?: boolean; // Timeline vs list view
}

interface ThoughtStep {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'active' | 'completed';
  timestamp?: Date;
}
```

---

### 5. InlineCitation

**File:** `components/chat/InlineCitation.tsx`

Source citations for RAG implementations.

**Features:**
- ✅ Inline numbered citations
- ✅ Hover preview with details
- ✅ Relevance score visualization
- ✅ External link support
- ✅ Expandable citations list
- ✅ Compact mode option

**Usage:**
```tsx
import { InlineCitation, CitationsList } from '@/components/chat/InlineCitation';

const citations: Citation[] = [
  {
    id: '1',
    title: 'KJFK METAR Report',
    source: 'Aviation Weather Center',
    url: 'https://aviationweather.gov',
    excerpt: 'KJFK 131251Z 27012KT 10SM FEW250...',
    relevance: 0.95,
  },
];

// In message content
<p>
  Current conditions at KJFK <InlineCitation citation={citations[0]} index={0} />
  show VFR conditions.
</p>

// At end of message
<CitationsList citations={citations} />
```

**Types:**
```typescript
interface Citation {
  id: string;
  title: string;
  source: string;
  url?: string;
  excerpt?: string;
  relevance?: number; // 0-1
}

interface InlineCitationProps {
  citation: Citation;
  index: number;
  compact?: boolean;
}
```

---

## 🚀 Integration Examples

### Adding to chat-message.tsx

```tsx
import { InteractiveToolCall } from '@/components/chat/InteractiveToolCall';
import { MessageActions } from '@/components/chat/MessageActions';

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  // ... other props
}) => {
  const toolParts = useMemo(() => getToolParts(message), [message]);
  
  return (
    <div>
      {/* Tool invocations */}
      {toolParts.map((part) => (
        <InteractiveToolCall
          key={part.toolCallId}
          part={part}
          selectable
        />
      ))}
      
      {/* Message content */}
      {content && (
        <div className="relative group">
          <MarkdownRenderer>{content}</MarkdownRenderer>
          
          {/* Actions appear on hover */}
          <div className="absolute -bottom-4 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <MessageActions
              message={message}
              compact
              onCopy={() => copyText(content)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
```

### Adding Chain of Thought to usePremiumChat

```tsx
export function usePremiumChat(options: UsePremiumChatOptions) {
  const { steps, addStep, completeStep, clear } = useChainOfThought();
  
  // Track reasoning steps
  useEffect(() => {
    if (status === 'submitted') {
      clear();
      addStep('Analyzing request', 'Processing user input...');
    }
  }, [status]);
  
  return {
    // ... existing returns
    reasoningSteps: steps,
  };
}
```

---

## 📖 Best Practices

### Interactive Tool Calls
- Use `selectable` prop when you need multi-select (e.g., bulk export)
- Provide `onCopy` and `onExport` callbacks for user feedback
- Consider showing selected count in UI footer

### Message Actions
- Use `compact` mode for inline display (hover states)
- Use full mode for always-visible actions
- Implement `onRegenerate` with confirmation for long responses
- Track ratings in database for feedback analysis

### Chain of Thought
- Use timeline view for sequential processes
- Use list view for non-linear reasoning
- Clear steps between conversations
- Consider persisting steps for conversation history

### Citations
- Always provide `url` when available
- Use `relevance` score to show confidence
- Group citations at message end for readability
- Use compact mode in dense text paragraphs

---

## 🎨 Styling

All components use your existing design tokens:
- `border-border`, `bg-card`, `text-foreground`
- `text-muted-foreground`, `bg-muted`
- `text-primary`, `bg-primary`
- `text-destructive`, `bg-destructive`

They automatically adapt to your theme (light/dark mode).

---

## 🧪 Testing

Visit `/ai-test-components` to see all components in action with interactive demos and feature lists.

Each tab shows:
- Component examples
- Different variants/modes
- Feature list
- Usage patterns

---

## 📦 Files Created

```
components/chat/
├── InteractiveToolCall.tsx    # New - Selectable tool calls
├── MessageActions.tsx          # New - Message action bar
├── ChainOfThought.tsx          # New - Reasoning steps
├── InlineCitation.tsx          # New - Source citations
└── ThinkingBlock.tsx           # Existing - Already in use

app/(app)/ai-test-components/
└── page.tsx                    # Updated - Component showcase

components/ai-test/
└── mock-data.ts                # Mock messages for demos
```

---

## 🔄 Next Steps

1. **Test in your chat:** Add components to existing chat interface
2. **Connect callbacks:** Wire up regenerate, edit, rating functions
3. **Add persistence:** Save tool selections, ratings to database
4. **Customize styling:** Adjust colors/spacing to match your brand
5. **Add analytics:** Track which features users interact with

---

Built for **Avion Flight Operations Platform**  
Framework: Next.js 16 + React + TypeScript  
Ready for production deployment ✅
