# Kokonutui Component Showcase - Complete Guide

## 🎯 Overview

The FlightOps Kokonutui showcase now features **50+ animation-rich UI components** organized by actual site usage context, making it easy to understand WHERE and HOW to use each component.

**Access:** `/kokonutui-test`

## 📊 Component Count by Section

- **Dashboard Components:** 7 components
- **Flights List Components:** 6 components  
- **Flight Details Components:** 7 components
- **Weather Components:** 5 components
- **Airports Components:** 3 components
- **Chat Components:** 4 components
- **Sidebar Components:** 4 components
- **Global UI Components:** 14+ components

**Total: 50+ Components**

## 🗂️ Organization Structure

### 1. Dashboard Components (`/`)
Components for the main dashboard showing KPIs, alerts, and live metrics:

- **Activity Rings** - Apple Watch style progress (flight progress, on-time rate, fuel efficiency)
- **Bento Grid** - Modern feature grid layout for quick stats
- **Metric Card** - Large KPI numbers with trend arrows
- **Stats Card** - Animated number counters for live metrics
- **Infinite Marquee** - Scrolling ticker for breaking alerts
- **Notification Toast** - Slide-in system notifications
- **Sparkline Chart** - Tiny inline charts for metric trends

### 2. Flights List Components (`/flights`)
Components for flight tables with search and filters:

- **Data Table** - Advanced sortable/filterable table
- **Search Bar** - Animated search with autocomplete suggestions
- **Tag Input** - Multi-select tags for filters (airports, routes)
- **Status Badge** - Colored pill status indicators
- **Skeleton Loader** - Loading state placeholders
- **Copy Button** - Copy flight codes/METAR data

### 3. Flight Details Components (`/flights/[id]`)
Components for individual flight detail pages:

- **Timeline** - Vertical event timeline (scheduled → departed → en route → arrived)
- **Progress Circle** - Circular progress indicator
- **Card Stack** - Stacked expandable cards
- **Card Flip** - 3D flip animation (departure/arrival toggle)
- **Expandable Card** - Accordion for risk factors/constraints
- **Smooth Drawer** - Slide-in panel for details
- **Smooth Tab** - Animated tab switcher (Overview/Weather/Aircraft)

### 4. Weather Components (`/weather`)
Components for weather visualization:

- **Liquid Glass Card** - Frosted glass effect for weather data
- **Mouse Effect Card** - Interactive cursor-following effects
- **Background Paths** - Animated SVG paths for wind patterns
- **Parallax Card** - 3D tilt effect on hover
- **Colorful Button** - Standout "Refresh Weather" CTA

### 5. Airports Components (`/airports`)
Components for airport search and details:

- **Attract Button** - Pulsing primary action CTA
- **Welcome Button** - Floating help button for new users
- **Gradient Underline** - Animated tab indicators

### 6. Chat Components (`/chat-enhanced`)
Components for AI chat interface:

- **AI Input** - Multi-mode input (ask/command/search)
- **Tweet Card** - AI response cards
- **Processing Button** - Send message with loading states
- **Beams Background** - Animated gradient background

### 7. Sidebar Components (Global Navigation)
Components for sidebars and menus:

- **Profile Dropdown** - User menu with account/settings
- **Team Selector** - Switch between airlines/teams
- **Floating Dock** - macOS-style quick actions
- **Toolbar** - Floating action toolbar

### 8. Global UI Components (All Pages)
Reusable components across the entire app:

**Buttons:**
- Gradient Button, Shadow Button, Slide Text Button
- Hold-to-Action, Fancy Button, Share Button
- Switch Button, Ripple Effect

**Loading & Effects:**
- Loader, Loading Progress
- Shape Hero, Particle Animation, Spotlight Effect
- File Upload

## 🎨 Component Features

Each component showcase card displays:

### Usage Indicators
```
📍 Used on: Dashboard • Flights • Weather
```
Colored badges showing which pages use the component

### Best For Description
```
💡 Best for: Progress tracking, KPI visualization, completion metrics
```
Clear guidance on when to use the component

### Direct Page Links
```
🔗 View Dashboard → /
🔗 View Flight Details → /flights/FL001
```
Clickable links to see components in context

### Live Aviation-Themed Examples
All demos use realistic FlightOps data:
- Flight numbers (FL123, FL456)
- Airport codes (JFK, LAX, BOS)
- Aviation metrics (altitude, speed, heading)
- Weather conditions (METAR, TAF)
- Status indicators (En Route, Delayed, Arrived)

## 🚀 Integration Guide

### How to Use a Component

1. **Find the component** in the showcase organized by page
2. **Check "Used on"** badges to see which pages it fits
3. **Read "Best for"** to understand the use case
4. **Click page links** to see it in context
5. **Copy the component** import and usage

### Example Integration

**Want to add progress tracking to dashboard?**

1. Go to `/kokonutui-test`
2. Navigate to "Dashboard Components"
3. Find "Activity Rings"
4. See it's best for: "Progress tracking, KPI visualization"
5. Import: `import ActivityRing from '@/components/kokonutui/activity-ring'`
6. Use: `<ActivityRing progress={67} color="#2563eb" label="Flight Progress" />`

## 🎯 Design System

All components follow FlightOps design standards:

### Colors
- **Primary Blue:** `#2563eb`
- **Success Green:** `#10b981`
- **Warning Amber:** `#f59e0b`
- **Error Red:** `#ef4444`

### Typography
- **Data/Codes:** Monospace fonts
- **UI Text:** Sans-serif fonts

### Animations
- **60fps** smooth animations with Framer Motion
- **Spring physics** for natural feel
- **Easing curves** for polished interactions

## 📝 Component Status

✅ **All 50+ components:**
- Fully functional
- Aviation-themed
- Responsive design
- Accessible
- Performance optimized

## 🔄 Updates

**Latest:** Refactored showcase from generic categories to site-based organization with:
- Added 20+ new components
- Reorganized by actual page usage
- Added usage indicators and page links
- Created realistic aviation examples
- Improved navigation with 8 sections

## 📚 Documentation

- **Component Props:** Check individual component files in `/components/kokonutui/`
- **Usage Examples:** Live demos at `/kokonutui-test`
- **Integration Guide:** This document
- **Technical Docs:** See `KOKONUTUI_COMPONENTS.md`

---

**Need help?** Visit the showcase at `/kokonutui-test` and explore components by clicking through the 8 sections organized by FlightOps pages.
