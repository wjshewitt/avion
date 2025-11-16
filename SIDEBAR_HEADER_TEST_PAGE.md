# Sidebar & Header Design System Test Page

## Overview
A comprehensive test page showcasing 4 production-ready navigation patterns following Avion Design Language v1.5. Access the page at `/sidebar-header-test`.

**Note:** The test page hides the standard application header and sidebar to provide an unobstructed view of each design pattern. The layout automatically detects when you're on `/sidebar-header-test` and renders the page in full-screen mode.

## Design Patterns Implemented

### Standard Designs

#### 1. Flight Deck Classic
**Location:** `/components/test/sidebar-header/FlightDeckClassic.tsx`

**Material:** Tungsten sidebar + Ceramic main area

**Key Features:**
- Fixed 240px tungsten sidebar with full-height panel
- Logo with corner brackets at top
- Navigation items with LED status dots (emerald/amber/orange)
- Active state: Safety Orange 3px left border
- Ceramic header (64px) with groove-inset search
- System status LED, UTC clock, alerts count
- User profile chip

**Use Case:** Traditional enterprise applications requiring persistent navigation with clear visual hierarchy.

---

#### 2. Instrument Rail
**Location:** `/components/test/sidebar-header/InstrumentRail.tsx`

**Material:** Compressed tungsten rail + Full-width header

**Key Features:**
- Ultra-narrow 56px tungsten rail (icon-only navigation)
- Corner bracket frames per navigation item
- Tooltip labels on hover (ceramic cards)
- Vertical LED strip indicating active section
- Dominant 80px tungsten header spanning full width
- Horizontal navigation tabs in header
- 32px sub-header with breadcrumb navigation
- Integrated search with Safety Orange focus state

**Use Case:** Data-dense applications requiring maximum horizontal viewport space (dashboards, analytics, maps).

---

#### 3. Mission Control Split
**Location:** `/components/test/sidebar-header/MissionControlSplit.tsx`

**Material:** Dual-panel ceramic system

**Key Features:**
- Minimal 48px ceramic top bar
- 200px ceramic side panel with segmented groups
- Navigation organized into collapsible sections (Operations, Information, Tools)
- Each group in groove-inset container
- Numeric indicators in tabular mono
- Profile section at bottom with avatar and details
- Groove-inset search at top of sidebar

**Use Case:** Applications with grouped navigation categories, lighter aesthetic preferred over dark tungsten.

---

#### 4. Adaptive Mission Control
**Location:** `/components/test/sidebar-header/AdaptiveMissionControl.tsx`

**Material:** Pure ceramic system

**Key Features:**
- **Dual State Design:** Toggles between expanded (200px) and collapsed (56px) sidebar
- **Keyboard Shortcut:** `⌘B` / `Ctrl+B` to toggle
- **State Persistence:** Remembers expanded/collapsed preference in localStorage
- **Smooth Animations:** Spring physics transitions (stiffness: 400, damping: 30)

**Expanded State (200px):**
- Minimal 48px ceramic top bar (logo, system status, user controls)
- Full-width sidebar with:
  - Groove-inset search at top
  - Segmented navigation groups (Operations, Information, Tools)
  - Each group in groove container with mono labels
  - Active items: white background with ceramic elevation shadow
  - Numeric count badges in tabular mono
  - Profile section at bottom with avatar, name, email
  - "Collapse" button with ChevronLeft icon

**Collapsed State (56px):**
- Same 48px ceramic top bar (unchanged)
- Ultra-narrow sidebar with:
  - Icon-only navigation buttons
  - LED status dots (emerald/amber/orange) on each icon
  - Corner bracket frames on active item (Safety Orange)
  - Hover tooltips (ceramic cards with labels)
  - Profile avatar only at bottom
  - ChevronRight icon button to expand

**Innovation:** Combines Mission Control Split's organized ceramic aesthetic with Instrument Rail's space-saving capability. Best of both worlds in one adaptive interface.

**Use Case:** Applications requiring both detailed navigation exploration and maximum content viewport. Users can switch modes based on current task focus.

---

## Technical Implementation

### File Structure
```
app/(app)/
  ├── layout.tsx                  # Modified to hide chrome on test pages
  └── sidebar-header-test/
      └── page.tsx                # Main container with tab selector

components/test/sidebar-header/
  ├── FlightDeckClassic.tsx       # Standard Design 1
  ├── InstrumentRail.tsx          # Standard Design 2
  ├── MissionControlSplit.tsx     # Standard Design 3
  └── AdaptiveMissionControl.tsx  # Standard Design 4
```

### Design Selector
- Tungsten background (#2A2A2A)
- Horizontal tab rail with 4 tabs
- Active tab: Safety Orange 3px underline
- Smooth transitions between designs using Framer Motion
- "ALL STANDARD DESIGNS" indicator in top right

### Shared Principles Applied

1. **Material Consistency**
   - No mixing ceramic and tungsten within single components
   - Groove effects for inset controls
   - Elevation shadows for raised elements

2. **Typography**
   - Inter for human-readable text
   - JetBrains Mono for codes, data, labels
   - Tabular figures for all numeric displays
   - 10px mono uppercase labels with wide tracking

3. **Signal Colors**
   - Safety Orange (#F04E30): Active states, CTAs, critical alerts
   - Info Blue (#2563EB): Secondary information, telemetry
   - Emerald (#10b981): Nominal status
   - Amber (#f59e0b): Caution status

4. **Motion**
   - Spring physics for mechanical interactions
   - 200-300ms transitions for state changes
   - Slide-fade for appearing/disappearing elements
   - Respect for user's motion preferences

5. **Sharp Geometry**
   - Maximum 2px border-radius (rounded-sm)
   - Corner brackets for framing
   - LED-style status indicators

### Keyboard Shortcuts

#### Global
- `⌘K` / `Ctrl+K` - Focus search input (where applicable)

#### Adaptive Mission Control
- `⌘B` / `Ctrl+B` - Toggle sidebar expanded/collapsed
- Click toggle button at bottom of sidebar
- Hover over icons in collapsed mode for tooltips
- State persists across page reloads

## Demo Content

Each design includes:
- Interactive navigation state management
- Working search inputs
- Sample metric cards
- Status indicators
- User profile information
- Live UTC time display
- Alert/notification counts

## Performance Considerations

- All animations use `transform` and `opacity` for GPU acceleration
- Framer Motion's `layoutId` for smooth tab transitions
- `AnimatePresence` for enter/exit animations
- Conditional rendering minimizes DOM nodes
- Random demo values generated client-side only to prevent hydration mismatches
- Layout conditional rendering avoids unnecessary chrome on test pages

## Accessibility

- Semantic HTML throughout
- ARIA labels on icon-only buttons
- Keyboard navigation support
- Focus indicators visible
- Sufficient color contrast (WCAG AA minimum)
- Motion can be reduced via system preferences

## Future Enhancements

1. **Responsive Adaptations**
   - Mobile breakpoints for each design
   - Touch-optimized interactions
   - Auto-collapse on smaller screens

2. **Keyboard Navigation**
   - Arrow key navigation through menu items
   - Tab order optimization
   - Shortcut keys for each nav section

3. **Enhanced State Management**
   - Remember last selected design preference
   - Sync sidebar state across browser tabs
   - Custom color theme overrides

4. **Analytics Integration**
   - Track time spent in each design pattern
   - Measure navigation efficiency metrics
   - User preference data collection

## Design Language Compliance

All designs strictly follow Avion Design Language v1.5:
- ✅ Material physics (ceramic/tungsten)
- ✅ Typography hierarchy (Inter/JetBrains Mono)
- ✅ Signal color discipline
- ✅ Sharp geometry (2px max radius)
- ✅ LED status indicators
- ✅ Instrument-first philosophy
- ✅ Purposeful motion only
- ✅ Accessible color contrast

---

**Created:** November 14, 2025  
**Last Updated:** November 14, 2025  
**Design Language Version:** Avion v1.5  
**Component Count:** 4 production-ready navigation patterns  
**Lines of Code:** ~1,500 per component (6,000+ total)
