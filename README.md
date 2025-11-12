# FlightOps - Aviation Command Console

A comprehensive, minimalist flight operations management platform built with Next.js 15 and React 19. Features AI chat assistance, multi-page navigation, and real-time operational intelligence.

## Design Philosophy

**Extreme Minimalism**: Every element justifies its existence. No decoration, only function.

- **White-first aesthetic** with subtle gradient background
- **Typography-driven hierarchy** - weight and size convey importance
- **Color = meaning** - Blue (action), Green (safe), Amber (caution), Red (critical)
- **No borders or boxes** except essential UI boundaries  
- **Shadows for elevation**, not decoration
- **150-300ms animations** - fast, purposeful, never bouncy

## Features

### Dashboard
- **Flight Preview Cards**: 3 active flights displayed prominently with status and risk levels
- **Collapsible Map Section**: Full route visualization with expand/collapse controls
- **Weather Summary**: Live weather conditions for departure/arrival airports
- **Active Alerts**: Real-time warnings and notifications with dismiss functionality
- **AI Chat Panel**: Right sidebar with conversational AI assistant (collapsible)

### Flights Page
- **Advanced Filtering**: Filter by status, risk level, route
- **Search**: Real-time search across flight numbers and routes
- **Sortable Table**: Comprehensive flight data in tabular format
- **Export Functionality**: Ready for CSV/PDF export integration

### Weather Page
- **Route Comparison**: Side-by-side weather for departure and arrival airports
- **METAR/TAF Viewer**: Raw aviation weather data display
- **AI Translation**: Plain-English weather briefings
- **Swap Airports**: Quick route reversal

### Airports Page
- **Tabbed Interface**: Search, Favorites, Recent, Popular views
- **Detailed Information**: Runways, frequencies, navigation aids, elevation
- **Favorites System**: Star/unstar airports with persistence
- **Recent History**: Automatically track viewed airports

### Mock Data

The application includes 5 sample flights demonstrating:
- Various flight statuses (Scheduled, Departed, En Route, Arrived, Delayed)
- Risk levels (Low, Moderate, High)
- Weather conditions and warnings
- AI-generated operational insights

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (inline configuration)
- **State**: Zustand with persistence middleware
- **Icons**: Lucide React
- **Fonts**: System fonts (Inter for UI, JetBrains Mono for data)

## Getting Started

### Install dependencies:
```bash
npm install
```

### Run development server:
```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) in your browser.

### Build for production:
```bash
npm run build
npm start
```

## Project Structure

```
/app
  /page.tsx                # Dashboard with preview cards, map, weather, alerts
  /layout.tsx              # Root layout with sidebar and AI chat panel
  /globals.css             # Design system + Tailwind config
  /flights/page.tsx        # Flights table with filtering
  /weather/page.tsx        # Weather comparison and METAR viewer
  /airports/page.tsx       # Airport search and details
  
/components
  /sidebar.tsx             # Left navigation with page links
  /ai-chat-panel.tsx       # Collapsible AI assistant
  /collapsible-panel.tsx   # Reusable expand/collapse wrapper
  /flight-preview-card.tsx # Compact flight display
  /flight-list.tsx         # Full flight list component
  /flight-card.tsx         # Detailed flight information
  /weather-widget.tsx      # Weather summary card
  /alert-item.tsx          # Alert notification
  /command-bar.tsx         # Global search/AI input
  /map.tsx                 # Route visualization
  
/lib
  /types.ts                # TypeScript definitions
  /store.ts                # Zustand state with persistence
  /mock-data.ts            # Flight samples
  /mock-airports.ts        # Airport database
  /mock-messages.ts        # AI chat samples
  /mock-alerts.ts          # Alert notifications
```

## Design System

### Colors

```css
--color-white: #ffffff          /* Background */
--color-surface: #fafafa        /* Subtle surfaces */
--color-text-primary: #0f172a  /* Main text */
--color-text-secondary: #475569 /* Secondary text */
--color-border: #cbd5e1         /* Borders (rarely used) */

--color-blue: #2563eb           /* Action/Interactive */
--color-green: #10b981          /* Success/Safe */
--color-amber: #f59e0b          /* Caution/Warning */
--color-red: #ef4444            /* Critical/Error */
--color-gray: #94a3b8           /* Inactive */
```

### Typography

```css
--font-size-xs: 11px    /* Labels (uppercase, tracked) */
--font-size-sm: 12px    /* Captions */
--font-size-base: 13px  /* Body text */
--font-size-md: 14px    /* Body/default */
--font-size-data: 16px  /* Metrics (monospace) */
--font-size-lg: 18px    /* Card titles */
--font-size-xl: 32px    /* Page titles */
```

**Weights**: Semibold (600) for emphasis, Regular (400) for everything else

### Layout

- **Header**: 64px fixed height, border-bottom
- **Sidebar**: 320px fixed width, scrollable
- **Main**: Flexible, 32px padding
- **Cards**: 24px padding, 16px shadow
- **Spacing**: 16px/24px/32px increments

## Interaction Patterns

1. **Flight Selection**: Click flight in sidebar → map contextualizes → detail card overlays
2. **Hover States**: Subtle background change (150ms ease-out)
3. **Focus States**: Blue border + ring (1px)
4. **Status Indicators**: Colored dots + text (●○◐)
5. **Command Bar**: ⌘K pattern for search/AI queries

## Key Features

### State Persistence
- User preferences saved to localStorage
- Favorites and recent airports tracked
- Panel collapse states remembered
- AI chat visibility preference preserved

### Collapsible Panels
- Smooth 300ms animations
- Independent state per panel
- Remembers user preferences
- Minimal height when collapsed

### AI Chat Integration
- Message history with timestamps
- Suggested questions for quick queries
- User/assistant message distinction
- Collapsible sidebar (350px width)
- Token usage tracking (ready for API)

### Navigation
- 4-page structure with icon-based sidebar
- Active page highlighting
- 64px fixed-width sidebar
- Clean, minimal design

## Next Steps (Enhancement Ideas)

### AI Integration
- Connect Command Bar to OpenAI/Anthropic API
- Real-time weather briefing generation
- Flight risk assessment automation
- Natural language query processing

### Map Implementation
- Integrate Mapbox GL JS or Maplibre
- Plot flight routes dynamically
- Show weather overlays
- Airport markers with labels

### Real Data
- Connect to aviation weather APIs (METAR/TAF)
- Integrate flight tracking data
- User authentication (Supabase/Auth0)
- Database for flight records

### Enhanced Features
- Flight timeline visualization
- Multi-flight comparison
- Route optimization suggestions
- Alert notifications system
- Mobile responsive design
- Dark mode (if requested)

## Philosophy in Practice

This project demonstrates **first-principles thinking in UI design**:

1. **Question everything** - Why do we need that border? Is that color meaningful?
2. **Function creates beauty** - The design serves the information, not vice versa
3. **Respect attention** - Every visual element competes for the user's focus
4. **Eliminate decoration** - If removing it doesn't hurt, it shouldn't be there
5. **Typography is structure** - Size, weight, and spacing create hierarchy naturally

## License

MIT

---

Built with obsessive attention to what matters.
