# AI Integration - Quick Start Guide

## 🎯 What You Can Test Right Now

### FlightDeckClassic Pattern - AI Instrument Drawer ✅

**Access**: Navigate to `/sidebar-header-test` → Select "Flight Deck Classic" tab

**Try This**:
1. **Open AI Panel**: Click the Sparkles (⭐) button in the header OR press `⌘J` (Mac) / `Ctrl+J` (Windows)
2. **Watch Animation**: The drawer slides in from the right with smooth spring physics
3. **See Corner Brackets**: Safety Orange brackets frame the AI panel
4. **Check LED Status**: Green dot in header = AI ready
5. **Type a Message**: Enter any question in the input field
6. **Send**: Click Send button or press `⌘Enter`
7. **Watch Thinking**: LED turns amber, 3 bars animate, status cycles
8. **Get Response**: AI message appears with "AVION AI v1.5" label
9. **Context Badge**: See current section ("Dashboard") + data point count
10. **Close**: Click X or press `⌘J` again

### Visual Features to Notice

#### 🎨 Design Language Compliance
- **Material**: Tungsten (#2A2A2A) matches sidebar perfectly
- **Corners**: Sharp 2px max radius (no rounded bubbles)
- **Brackets**: Safety Orange 2px borders on all 4 corners
- **LED**: 8px dot, emerald → amber → emerald
- **Typography**: 
  - Labels: JetBrains Mono, 10px, uppercase, wide tracking
  - Messages: Inter, 14px, proper line height
  - Version chip: Mono, 9px, Info Blue background

#### 🎭 Animation Details
- **Open/Close**: Spring physics (stiffness: 400, damping: 30)
- **Thinking Bars**: Wave pattern, 500ms per bar
- **LED Pulse**: 1.5s cycle during thinking
- **Content Reflow**: Main area smoothly adjusts width

#### 💬 Message Styling
- **User Messages**: 
  - Right-aligned
  - Max 80% width
  - Tungsten background (#2A2A2A)
  - Zinc-200 text
- **AI Messages**:
  - Left-aligned
  - Full width
  - Info Blue 2px left border
  - "AVION AI" label with version

---

## 🔧 Implementation Details

### Shared Components Created
All components are in `components/test/sidebar-header/shared/`:

```typescript
import { ThinkingIndicator } from './shared/ThinkingIndicator';
import { LEDStatus } from './shared/LEDStatus';
import { AIInput } from './shared/AIInput';
import { ContextBadge } from './shared/ContextBadge';
import { AIMessage } from './shared/AIMessage';
```

### State Management Pattern
```typescript
const [aiOpen, setAiOpen] = useState(false);
const [aiInput, setAiInput] = useState('');
const [aiMessages, setAiMessages] = useState<Message[]>([]);
const [aiStatus, setAiStatus] = useState<'ready' | 'thinking' | 'streaming' | 'error'>('ready');
```

### Keyboard Shortcut Implementation
```typescript
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
```

---

## 📐 Design Specifications

### Panel Dimensions
- **Width**: 320px (FlightDeckClassic)
- **Height**: Full viewport (minus header)
- **Padding**: 16px (p-4)
- **Border**: 1px solid #333

### Corner Brackets
```css
border-l-2 border-t-2 border-[#F04E30]  /* Top-left */
border-r-2 border-t-2 border-[#F04E30]  /* Top-right */
border-l-2 border-b-2 border-[#F04E30]  /* Bottom-left */
border-r-2 border-b-2 border-[#F04E30]  /* Bottom-right */
```
- **Size**: 16px (4×4 Tailwind)
- **Position**: Absolute, pointer-events-none
- **Color**: Safety Orange (#F04E30)
- **Width**: 2px

### LED Status
```typescript
{
  ready: { color: '#10b981', animate: false },      // Emerald
  thinking: { color: '#f59e0b', animate: true },    // Amber, pulsing
  streaming: { color: '#2563eb', animate: true },   // Info Blue, pulsing
  error: { color: '#F04E30', animate: false },      // Safety Orange
}
```

### Thinking Indicator
- **Bars**: 3 vertical bars, 8px width
- **Heights**: Animate 8px → 24px → 8px
- **Timing**: 1.5s per full cycle, 0.5s delay between bars
- **Labels**: "Parsing..." → "Querying..." → "Synthesizing..."
- **Cycle**: Changes every 1.5s

---

## 🎹 Keyboard Shortcuts

| Shortcut | Action | Status |
|----------|--------|--------|
| `⌘J` or `Ctrl+J` | Toggle AI panel | ✅ Working |
| `⌘Enter` or `Ctrl+Enter` | Send message | ✅ Working |
| `ESC` | Close AI panel | ⏳ Add next |
| `/clear` | Clear conversation | ⏳ Add next |
| `/new` | New conversation | ⏳ Add next |

---

## 🐛 Known Limitations (Current Demo)

1. **Simulated Responses**: AI responses are demo text, not real AI
2. **No Persistence**: Messages clear on page refresh
3. **Single Pattern**: Only FlightDeckClassic has AI integration
4. **No Conversation History**: No save/load functionality
5. **No Context Data**: Context badge shows counts, but doesn't pass data to AI

---

## 🚀 Coming Soon

### Other Patterns (Documented, Ready to Implement)

#### InstrumentRail - "Data Feed Panel"
- 360px full-height panel
- Vertical LED strip
- Status pill in main header
- Scanline effect

#### MissionControlSplit - "Co-Pilot Mode Toggle"
- Sidebar transforms Nav ↔ AI
- Crossfade animation
- Toggle button at top
- No additional space needed

#### AdaptiveMissionControl - "Dual-State"
- **Expanded**: AI section in sidebar → modal
- **Collapsed**: Sparkles icon → floating panel
- Adapts to sidebar state

---

## 💡 Design Philosophy in Action

### Before: Generic Chat Widget
```
┌─────────────────┐
│ 💬 Chat         │
│ [Messages]      │
│ [Input]         │
└─────────────────┘
```

### After: Instrument Panel
```
┌─ AI CO-PILOT ──────┐  ← Mono label
│ ● Ready            │  ← LED status
├────────────────────┤
│ [Messages]         │  ← Proper hierarchy
│  User → right      │
│  AI ← left         │
├────────────────────┤
│ CONTEXT: Dashboard │  ← Data awareness
├────────────────────┤
│ [Input] [Send]     │  ← Safety Orange CTA
└────────────────────┘
     ┃ ┃
   Corner Brackets (Safety Orange)
```

---

## 📸 Visual Checklist

When testing, verify these design elements:

### Materials & Colors
- [ ] Tungsten background (#2A2A2A)
- [ ] Safety Orange corner brackets (#F04E30)
- [ ] Info Blue message border (#2563eb)
- [ ] Emerald LED when ready (#10b981)
- [ ] Amber LED when thinking (#f59e0b)

### Typography
- [ ] Labels in JetBrains Mono, uppercase
- [ ] Messages in Inter, readable
- [ ] "AVION AI" label visible
- [ ] Version chip "v1.5" in small mono

### Animation
- [ ] Drawer slides smoothly (not jerky)
- [ ] Content reflows without jump
- [ ] Thinking bars wave naturally
- [ ] LED pulses during thinking

### Interaction
- [ ] ⌘J toggles panel
- [ ] Sparkles button changes color
- [ ] Send button disabled when empty
- [ ] Send button Safety Orange when ready
- [ ] Thinking disables input

---

## 🎓 Learning Resources

- **Design Language**: See `AVION_DESIGN_LANGUAGE_v1.5.md` for full specs
- **Implementation Guide**: See `AI_CHAT_INTEGRATION_IMPLEMENTATION.md` for other patterns
- **Summary**: See `AI_INTEGRATION_SUMMARY.md` for overview

---

**Ready to Test**: Navigate to `/sidebar-header-test` → "Flight Deck Classic" → Click ⭐ or press `⌘J`

**Questions to Explore**:
1. Does the drawer animation feel natural?
2. Are the corner brackets noticeable but not distracting?
3. Does the LED status communicate clearly?
4. Is the typing → thinking → response flow intuitive?
5. Does the instrument metaphor feel appropriate for aviation software?

---

**Created**: November 14, 2025  
**Status**: FlightDeckClassic ready for testing  
**Feedback**: Test and report on UX, motion, visual consistency
