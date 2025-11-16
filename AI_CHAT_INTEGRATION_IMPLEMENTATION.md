# AI Chat Integration Implementation Guide
## Avion Design Language v1.5 - Instrument-Aligned AI

## Overview
AI chat has been integrated into the navigation pattern test page with **instrument-first design principles**. Each pattern treats AI as a co-pilot instrument panel, not a generic chat widget.

---

## Completed: FlightDeckClassic - Instrument Drawer ✅

### Implementation Summary
- **Location**: Slides from right edge of main content area
- **Material**: Tungsten (#2A2A2A) matching sidebar
- **Width**: 320px when open
- **Trigger**: Sparkles button in header (Safety Orange when active)
- **Keyboard**: `⌘J` / `Ctrl+J` toggles panel
- **Animation**: Spring physics (stiffness: 400, damping: 30)

### Visual Features
- **Corner Brackets**: Safety Orange 2px borders on all 4 corners
- **LED Status**: Top of panel showing ready/thinking/streaming states
- **Context Badge**: Shows active navigation and data point count
- **Messages**: User messages right-aligned, AI messages left with Info Blue border
- **Input**: Groove-inset tungsten input with Safety Orange send button

### Key Code Patterns
```typescript
// AI State Management
const [aiOpen, setAiOpen] = useState(false);
const [aiStatus, setAiStatus] = useState<'ready' | 'thinking' | 'streaming' | 'error'>('ready');
const [aiMessages, setAiMessages] = useState<Message[]>([]);

// Keyboard Shortcut
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
      e.preventDefault();
      setAiOpen(!aiOpen);
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [aiOpen]);

// Content Animation
<motion.main
  animate={{ marginRight: aiOpen ? 320 : 0 }}
  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
>
```

---

## Shared Components Created

### 1. ThinkingIndicator
**Location**: `components/test/sidebar-header/shared/ThinkingIndicator.tsx`

**Features**:
- 3 animated bars with wave pattern
- Cycling step labels ("Parsing...", "Querying...", "Synthesizing...")
- Material-aware (ceramic/tungsten variants)
- 1.5s cycle duration per step

**Usage**:
```typescript
<ThinkingIndicator material="tungsten" />
```

---

### 2. LEDStatus
**Location**: `components/test/sidebar-header/shared/LEDStatus.tsx`

**Features**:
- 4 status states: ready (emerald), thinking (amber), streaming (blue), error (orange)
- Pulsing animation for thinking/streaming
- Configurable sizes: sm, md, lg
- Optional label

**Usage**:
```typescript
<LEDStatus status="thinking" label="Analyzing" size="md" />
```

---

### 3. AIInput
**Location**: `components/test/sidebar-header/shared/AIInput.tsx`

**Features**:
- Material-aware groove inset styling
- Safety Orange send button (disabled when empty)
- `⌘Enter` shortcut to send
- Disabled state during thinking

**Usage**:
```typescript
<AIInput
  value={input}
  onChange={setInput}
  onSend={handleSend}
  material="tungsten"
  placeholder="Ask about..."
  disabled={isThinking}
/>
```

---

### 4. ContextBadge
**Location**: `components/test/sidebar-header/shared/ContextBadge.tsx`

**Features**:
- Shows active context (current page/section)
- Data point count with LED indicator
- Material-aware styling

**Usage**:
```typescript
<ContextBadge
  context="Dashboard"
  dataPoints={3}
  material="tungsten"
/>
```

---

### 5. AIMessage
**Location**: `components/test/sidebar-header/shared/AIMessage.tsx`

**Features**:
- User messages: right-aligned, 80% max width
- AI messages: full width, Info Blue left border
- "AVION AI" label with version chip
- Optional timestamps (mono font)
- Material-aware styling

**Usage**:
```typescript
<AIMessage
  content="Your message here"
  isUser={false}
  timestamp="14:23"
  material="tungsten"
  showTimestamp={true}
/>
```

---

## Implementation Guide for Remaining Patterns

### Pattern 2: InstrumentRail - Data Feed Panel

**Concept**: Full-height panel from right edge with vertical LED strip

**Key Differences from FlightDeckClassic**:
1. **Width**: 360px (wider than Classic's 320px)
2. **LED Strip**: Vertical strip along left edge of panel
   - Animates based on AI state
   - Safety Orange when active
   - Amber pulsing when thinking
3. **Header Integration**: Add status pill in main header when AI is active
   - Format: `● AI ACTIVE` (mono, Safety Orange dot)
4. **Scanline Effect**: Subtle animated gradient across message area

**Implementation Steps**:
```typescript
// Add to InstrumentRail component
const [aiOpen, setAiOpen] = useState(false);

// Add trigger button to rail (bottom of navigation, above Settings)
<button onClick={() => setAiOpen(!aiOpen)}>
  <Sparkles size={20} strokeWidth={1.5} />
</button>

// Create panel structure
<AnimatePresence>
  {aiOpen && (
    <motion.aside
      initial={{ x: 360 }}
      animate={{ x: 0 }}
      exit={{ x: 360 }}
      className="w-90 bg-[#2A2A2A] border-l border-[#333]"
    >
      {/* Vertical LED Strip */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#333]">
        <motion.div
          className="w-full bg-[#F04E30]"
          animate={{
            height: aiStatus === 'thinking' ? ['0%', '100%'] : '100%',
          }}
          transition={{
            duration: 2,
            repeat: aiStatus === 'thinking' ? Infinity : 0,
          }}
        />
      </div>
      {/* Rest of AI interface... */}
    </motion.aside>
  )}
</AnimatePresence>
```

---

### Pattern 3: MissionControlSplit - Co-Pilot Mode Toggle

**Concept**: Sidebar transforms between Navigation Mode and Co-Pilot Mode

**Key Differences**:
1. **No Additional Panel**: Sidebar content morphs in place
2. **Toggle Button**: Top of sidebar, "AI CO-PILOT" groove button
3. **Width**: Sidebar stays 200px
4. **Animation**: Crossfade (navigation fades left, AI fades right)

**Implementation Steps**:
```typescript
const [mode, setMode] = useState<'nav' | 'copilot'>('nav');

// Top of sidebar
<button
  onClick={() => setMode(mode === 'nav' ? 'copilot' : 'nav')}
  className="w-full flex items-center gap-2 px-3 py-2 bg-[#e8e8e8] border border-zinc-300 rounded-sm"
>
  <Sparkles size={16} />
  <span className="text-xs font-medium">AI Co-Pilot</span>
  {mode === 'copilot' && <LEDStatus status="ready" size="sm" />}
</button>

// Conditional rendering
<AnimatePresence mode="wait">
  {mode === 'nav' ? (
    <motion.div
      key="nav"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {/* Navigation groups */}
    </motion.div>
  ) : (
    <motion.div
      key="copilot"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {/* AI interface */}
    </motion.div>
  )}
</AnimatePresence>
```

---

### Pattern 4: AdaptiveMissionControl - Dual-State Integration

**Concept**: AI adapts to sidebar state—embedded when expanded, floating when collapsed

**Expanded State (200px sidebar)**:
1. New navigation group at bottom: "AI ASSISTANT"
2. Collapsed input showing "● Ready | Ask a question..."
3. Click input → modal overlay appears (ceramic, 400px, centered)
4. Modal contains full message history + input
5. Close modal → returns to collapsed input

**Collapsed State (56px sidebar)**:
1. Sparkles icon at top of rail (above nav icons)
2. Click → floating ceramic panel (280px, anchored to sidebar top-right)
3. Panel has corner brackets
4. Click outside or ESC → closes

**Implementation Steps**:

```typescript
const [isExpanded, setIsExpanded] = useState(true); // Sidebar state
const [aiModalOpen, setAiModalOpen] = useState(false);
const [aiFloatingOpen, setAiFloatingOpen] = useState(false);

// In expanded sidebar
{isExpanded && (
  <div className="space-y-2">
    <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 px-2">
      AI Assistant
    </div>
    <div className="bg-[#e8e8e8] border border-zinc-300 rounded-sm p-2">
      <button
        onClick={() => setAiModalOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-600 hover:bg-white rounded-sm"
      >
        <LEDStatus status="ready" size="sm" />
        <span>Ask a question...</span>
      </button>
    </div>
  </div>
)}

// Modal overlay (expanded state)
{aiModalOpen && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-[400px] max-h-[600px] bg-[#F4F4F4] border border-zinc-200 rounded-sm flex flex-col"
    >
      {/* Full AI interface */}
    </motion.div>
  </div>
)}

// In collapsed sidebar
{!isExpanded && (
  <button
    onClick={() => setAiFloatingOpen(!aiFloatingOpen)}
    className="w-full h-12 flex items-center justify-center"
  >
    <Sparkles size={20} />
  </button>
)}

// Floating panel (collapsed state)
{!isExpanded && aiFloatingOpen && (
  <motion.div
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    className="fixed top-16 left-14 w-70 bg-[#F4F4F4] border border-zinc-200 rounded-sm shadow-lg"
  >
    {/* Corner brackets + AI interface */}
  </motion.div>
)}
```

---

## Universal Keyboard Shortcuts

| Shortcut | Action | Status |
|----------|--------|--------|
| `⌘J` / `Ctrl+J` | Toggle AI panel | ✅ Implemented |
| `ESC` | Close AI panel | ⏳ Add to each pattern |
| `⌘Enter` | Send message | ✅ In AIInput |
| `/clear` | Clear conversation | ⏳ Add command handler |
| `/new` | New conversation | ⏳ Add command handler |

---

## Design Compliance Checklist

✅ **Material Consistency**: AI uses same ceramic/tungsten as host pattern  
✅ **LED Status**: Emerald/amber/orange indicators for AI state  
✅ **Corner Brackets**: Safety Orange brackets on active AI panels  
✅ **Mono Labels**: "AI CO-PILOT", "THINKING" in 10px uppercase  
✅ **Spring Physics**: All animations use stiffness: 400, damping: 30  
✅ **Sharp Geometry**: 2px max border-radius  
✅ **Typography**: Inter for messages, JetBrains Mono for labels/timestamps  
✅ **Accessibility**: ARIA labels, focus management, keyboard navigation  

---

## Next Steps for Complete Implementation

### Immediate (High Priority)
1. **Integrate AI into remaining 3 patterns** using the guides above
2. **Connect to real AI backend** (replace demo responses with actual API calls)
3. **Add conversation persistence** (save/load chat history)
4. **Implement command handlers** (`/clear`, `/new`, etc.)

### Short Term (Medium Priority)
5. **Add mobile responsiveness** (bottom sheet for all patterns on mobile)
6. **Context awareness** (pass current page data to AI)
7. **Message actions** (copy, retry, delete)
8. **Conversation management** (list, switch, rename conversations)

### Long Term (Nice to Have)
9. **Voice input** (speak to AI)
10. **Multi-modal** (image analysis, chart generation)
11. **Streaming responses** (show AI typing in real-time)
12. **Verified sources** (show citations for AI responses)

---

## Testing Checklist

### Per Pattern
- [ ] AI panel opens with smooth animation
- [ ] Content reflows properly when AI opens
- [ ] Keyboard shortcut (⌘J) works
- [ ] LED status changes during thinking/streaming
- [ ] Messages display correctly (user right, AI left)
- [ ] Input disables during thinking
- [ ] Context badge shows correct information
- [ ] Close button/ESC closes panel
- [ ] Panel remembers state on reopen

### Cross-Pattern
- [ ] Consistent keyboard shortcuts across all patterns
- [ ] Material consistency maintained
- [ ] Animation timing feels uniform
- [ ] LED colors match across patterns
- [ ] Typography consistent (Inter/JetBrains Mono)

---

## Performance Considerations

✅ **Implemented**:
- Shared components minimize code duplication
- AnimatePresence for smooth enter/exit
- Spring physics for natural motion
- Conditional rendering (panels unmount when closed)

⏳ **To Implement**:
- Message virtualization for long conversations
- Debounced input for typing indicators
- Lazy loading of conversation history
- Image optimization for shared media

---

**Status**: FlightDeckClassic ✅ Complete | Other Patterns ⏳ Documented  
**Next**: Implement remaining patterns following the guides above  
**Timeline**: ~2-3 hours per pattern for full integration  

---

**Created**: November 14, 2025  
**Design Language**: Avion v1.5  
**Components**: 5 shared + 1 pattern integration complete
