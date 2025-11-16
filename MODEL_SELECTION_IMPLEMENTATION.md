# Model Selection Implementation

## Summary
Added user-selectable AI model options to the chat system, allowing users to choose between Auto (router), Flash Lite, and Flash models.

## Changes Made

### 1. Chat Settings Store (`lib/chat-settings-store.ts`)
- Added `ModelSelection` type: `'auto' | 'flash-lite' | 'flash'`
- Added `selectedModel` state (default: `'auto'`)
- Added `setSelectedModel` action
- Persisted model selection in local storage

### 2. AI Settings Panel (`components/ai-drawer/AISettingsPanel.tsx`)
- Added model selector dropdown in "Chat Behavior" section
- Three options with emojis:
  - ⚡ **Auto (Router)** - Automatically routes to best model for each request
  - 🪶 **Flash Lite** - Faster responses, lower cost, good for simple queries
  - 💎 **Flash** - Best quality, reasoning, and complex task handling
- Added descriptive help text that updates based on selection
- Positioned above mode selector for prominence

### 3. Chat API Route (`app/api/chat/general/route.ts`)
- Updated `ChatRequestBody` interface to accept `selectedModel`
- Implemented model selection logic:
  - `flash-lite`: Forces use of Flash Lite model
  - `flash`: Forces use of Flash model
  - `auto`: Uses intelligent router (existing behavior)
- Logs routing reason for debugging

### 4. Premium Chat Hook (`hooks/usePremiumChat.ts`)
- Added `selectedModel` from `useChatSettings()`
- Passed `selectedModel` to API in request body
- Updated transport dependencies to react to model changes

## User Experience

1. **Access Settings**: Click settings icon in AI sidebar
2. **Select Model**: Choose from dropdown in "Chat Behavior" section
3. **Save**: Click "Save Settings" button
4. **Use**: All subsequent chat messages use the selected model
5. **Indication**: Model selection is persistent across sessions

## Model Behavior

### Auto (Router) - Default
- Intelligently selects between Flash Lite and Flash based on:
  - Query complexity
  - Token count estimates
  - Chat mode (e.g., Deep Briefing always uses Flash)
  - Surface (sidebar vs main)
  - Reliability requirements

### Flash Lite
- Faster response times
- Lower operational cost
- Optimized for:
  - Simple weather queries
  - Quick airport lookups
  - Basic flight information
  - Casual conversation

### Flash
- Maximum quality responses
- Extended thinking capability (if enabled)
- Best for:
  - Complex analysis
  - Multi-step reasoning
  - Deep briefing generation
  - High-stakes operations planning

## Technical Notes

- Model selection overrides router logic when set to specific model
- Auto mode preserves existing intelligent routing behavior
- Settings persist in localStorage via Zustand
- Changes take effect immediately on save
- Compatible with both Vertex AI and Gemini API providers

## Avion Design Compliance

✓ Tungsten material with proper shadows  
✓ Mono uppercase labels (10px, widest tracking)  
✓ Inter font for UI text, JetBrains Mono for labels  
✓ Safety Orange accent for Save button  
✓ Zinc color palette for text hierarchy  
✓ Sharp corners (rounded-sm, 2px)  
✓ Proper spacing and alignment

## Testing Checklist

- [ ] Model selector appears in AI Settings
- [ ] Dropdown shows all three options with emojis
- [ ] Help text updates based on selection
- [ ] Settings persist after page reload
- [ ] Flash Lite selection uses lite model
- [ ] Flash selection uses full model
- [ ] Auto mode uses router logic
- [ ] Console logs show correct routing reason
- [ ] Works in both sidebar and main chat surfaces
- [ ] Compatible with all chat modes
