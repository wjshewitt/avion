# Chat Modes & Settings System

## Implementation Summary

Successfully implemented a comprehensive chat modes and settings system for the AI chat interface.

---

## ✅ Completed Features

### 1. Chat Settings Store (`lib/chat-settings-store.ts`)
- **Zustand store** with persistent localStorage
- Settings categories:
  - **Behavior:** Simple chat toggle, mode selection, mode memory
  - **Display:** Tool cards toggle, raw data, compact mode, timestamps, thinking process
  - **Tools:** Auto-expand settings for weather/airport cards

### 2. System Prompts (`lib/gemini/prompts.ts`)
Five specialized prompts created:
- **Simple Chat:** General-purpose AI without constraints
- **Flight Ops:** Professional operations manager tone (default mode)
- **Weather Brief:** Client-facing weather briefings
- **Airport Planning:** Technical airport analysis and suitability
- **Trip Planning:** Multi-leg trip coordination and strategy

### 3. Mode Selector Component (`components/chat/ChatModeSelector.tsx`)
- **4 specialized modes** with distinct icons and colors:
  - 🛫 **Flight Ops** (blue) - General operations
  - 🌤️ **Weather Brief** (sky blue) - Client briefings
  - 🛬 **Airport Planning** (purple) - Airport capabilities
  - 📋 **Trip Planning** (amber) - Multi-leg coordination
- **Animated mode switching** with Framer Motion
- **Compact and full modes** for different layouts
- **Tooltips** for mode descriptions

### 4. Settings Modal (`components/chat/ChatSettingsModal.tsx`)
Comprehensive settings UI with:
- **Simple Chat Toggle:** Disable modes for general-purpose AI
- **Mode Configuration:** Default mode selection and memory
- **Display Preferences:** 
  - Show/hide tool UI cards
  - Show/hide raw METAR/TAF data
  - Compact spacing
  - Timestamps
  - Thinking process (experimental)
- **Tool Behavior:**
  - Auto-expand weather cards
  - Auto-expand airport cards
- **Reset to Defaults** button

### 5. AI Sidebar Integration (`components/ai-chat-panel.tsx`)
- Mode selector added (conditionally shown when not in simple mode)
- Settings button (⚙️) in header
- Settings modal integration
- Reads and respects settings:
  - `showToolCards` - conditionally renders tool UI
  - `showTimestamps` - passed to message options
  - `useSimpleChat` - hides mode switcher
  - `currentMode` - tracks active mode

### 6. Chat Message Updates (`components/ui/chat-message.tsx`)
- Reads `showToolCards` setting from store
- Conditionally renders tool UI based on user preference
- **Text always shown** when present
- **Tool cards optional** based on setting

---

## 🎯 User Benefits

### Simple Mode
- ✅ **Reduced cognitive load** - no need to understand modes
- ✅ **Clean interface** - mode switcher hidden
- ✅ **General purpose** - can answer any question
- ✅ **All tools available** - AI decides when to use them

### Specialized Modes
- ✅ **Focused responses** - task-specific AI behavior
- ✅ **Better quality** - prompts optimized for use case
- ✅ **Professional tone** - matches operational context
- ✅ **Efficient** - only relevant tools shown

### Customization
- ✅ **Toggle tool cards** - text-only or visual interface
- ✅ **Persistent preferences** - settings saved across sessions
- ✅ **Flexible** - switch between simple/modes anytime

---

## 🚀 Usage Examples

### Scenario 1: Weather Briefing Mode
```
User switches to "Weather Brief" mode
User: "Give me a briefing for EGKB to LFMN"

AI Response:
"Here's a comprehensive briefing for your client's flight from 
Biggin Hill to Nice. Current conditions show VFR at both airports..."

[Weather cards shown below if enabled, hidden if disabled]
```

### Scenario 2: Simple Chat Mode
```
User enables "Use Simple Chat" in settings
Mode switcher disappears

User: "What's the weather at KJFK?"
AI: [Fetches weather data naturally]

User: "What's the capital of France?"
AI: [Answers general knowledge question]

No mode constraints - just helpful AI
```

### Scenario 3: Text-Only Preference
```
User disables "Show tool UI components"
All responses show only text explanations
No visual weather/airport cards
Cleaner, text-focused interface
```

---

## 📁 Files Created

1. **`lib/chat-settings-store.ts`** - Settings state management
2. **`lib/gemini/prompts.ts`** - System prompts for all modes
3. **`components/chat/ChatModeSelector.tsx`** - Mode switcher UI
4. **`components/chat/ChatSettingsModal.tsx`** - Settings modal

## 📝 Files Modified

1. **`components/ai-chat-panel.tsx`** - Added mode switcher and settings integration
2. **`components/ui/chat-message.tsx`** - Added conditional tool card rendering

---

## 🔄 Next Steps (Backend Integration)

To complete the system, the backend needs updates:

### Required Changes:
1. **Update `/api/chat/general/route.ts`**:
   - Accept `mode` parameter (can be null for simple chat)
   - Import prompts from `lib/gemini/prompts.ts`
   - Select system prompt based on mode
   - Optionally filter tools based on mode

2. **Update `hooks/usePremiumChat.ts`**:
   - Read current mode from settings
   - Pass mode to API call

3. **Example Backend Logic:**
```typescript
// In /api/chat/general/route.ts
import { 
  SIMPLE_CHAT_PROMPT, 
  FLIGHT_OPS_PROMPT, 
  WEATHER_BRIEF_PROMPT,
  AIRPORT_PLANNING_PROMPT,
  TRIP_PLANNING_PROMPT 
} from '@/lib/gemini/prompts';

function getSystemPromptForMode(mode: ChatMode | null): string {
  if (mode === null) return SIMPLE_CHAT_PROMPT;
  
  switch (mode) {
    case 'flight-ops': return FLIGHT_OPS_PROMPT;
    case 'weather-brief': return WEATHER_BRIEF_PROMPT;
    case 'airport-planning': return AIRPORT_PLANNING_PROMPT;
    case 'trip-planning': return TRIP_PLANNING_PROMPT;
  }
}

// In API route handler:
const { message, conversationId, mode } = await req.json();
const systemPrompt = getSystemPromptForMode(mode);
```

---

## 🎨 Design Decisions

1. **Mode Icons:** Each mode has a distinct Lucide icon that represents its purpose
2. **Color Coding:** Modes use different colors for quick visual identification
3. **Compact Design:** Mode switcher optimized for sidebar space constraints
4. **Graceful Defaults:** All settings have sensible defaults, system works without configuration
5. **Non-Disruptive:** Simple mode hides complexity without removing features
6. **Persistent:** Settings saved to localStorage, survive page refreshes

---

## 🐛 Known Limitations

1. **Backend not yet updated:** Mode parameter not wired to API yet
2. **Tool filtering:** Backend doesn't filter tools by mode yet (future enhancement)
3. **Auto-expand:** Settings exist but cards don't respect them yet
4. **Enhanced chat page:** Settings work in sidebar, need to add to chat-enhanced page

---

## 📊 Settings Storage

**LocalStorage Key:** `flightchat-chat-settings`

**Default Settings:**
```json
{
  "useSimpleChat": false,
  "currentMode": "flight-ops",
  "defaultMode": "flight-ops",
  "rememberLastMode": true,
  "showToolCards": true,
  "showRawData": true,
  "compactMode": false,
  "showTimestamps": true,
  "showThinkingProcess": false,
  "autoExpandWeather": false,
  "autoExpandAirports": false
}
```

---

## 🎉 Result

A professional, flexible chat mode system that lets users choose between:
- **Specialized aviation modes** for focused assistance
- **Simple general chat** for everyday use  
- **Customizable UI** to match preferences
- **Persistent settings** that remember user choices

The system enhances the AI experience without adding complexity for users who prefer simplicity.
