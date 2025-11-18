# FlightChat Frontend References

## TypeScript Types

### Core Types
- `types/profile.ts` - User profile and authentication types
- `types/compliance.ts` - Compliance and regulatory types
- `types/weather.ts` - Weather data and forecast types
- `lib/supabase/types.ts` - Auto-generated Supabase database types

### API Types
- `lib/validation/auth.ts` - Authentication request/response validation
- `lib/validation/flight.ts` - Flight data validation schemas
- `lib/weather/risk/types.ts` - Weather risk assessment types

## API Modules

### Chat API
- `app/api/chat/route.ts` - Main chat endpoint
- `lib/chat/conversation-service.ts` - Chat business logic
- `lib/ai/chat/request-utils.ts` - AI request utilities

### Weather API
- `app/api/weather/awc/route.ts` - Aviation Weather Center API
- `lib/weather/awcService.ts` - Weather service layer
- `lib/weather/weatherCache.ts` - Weather caching logic

### Intel/Research API
- `app/api/intel/process/route.ts` - Intelligence processing
- `lib/intel/fetch-intel.ts` - Research data fetching
- `lib/intel/schema.ts` - Intelligence data schemas

## Route Structure

### Main Application Routes
- `app/(app)/chat-enhanced/page.tsx` - Enhanced AI chat
- `app/(app)/weather/[icao]/page.tsx` - Airport weather details
- `app/(app)/flights/` - Flight management pages
- `app/(app)/compliance/` - Compliance tools
- `app/(app)/airports/` - Airport search and details

### Authentication Routes
- `app/(auth)/login/page.tsx` - Login page
- `app/(auth)/signup/page.tsx` - Signup page

## Component Libraries

### Avion Design System
- `components/avion/` - Custom aviation-themed components
- `aviondesignlanguage.md` - Design system specification

### UI Primitives
- `components/ui/` - shadcn/ui components (Button, Input, Card, etc.)
- `lib/utils.ts` - Utility functions including cn() for className merging

## State Management

### Global State
- `store/index.ts` - Zustand store configuration
- `lib/store.ts` - Additional store utilities

### Server State
- `lib/tanstack/queryKeys.ts` - React Query key definitions
- `lib/tanstack/hooks/` - Custom React Query hooks

## Testing Patterns

### Test Configuration
- `package.json` - Vitest test scripts and configuration
- Component tests colocated with `.test.tsx` files
- Service Logic tests with `.test.ts` files

### Test Utilities
- `lib/time/format.test.ts` - Example of utility testing
- `lib/airports/useAirportClusterer.test.ts` - Complex hook testing

## Existing Patterns

### Data Fetching
- Use `@tanstack/react-query` for all API calls
- Implement proper error boundaries and loading states
- Follow the existing query key patterns in `lib/tanstack/queryKeys.ts`

### Authentication
- Supabase Auth for user management
- Profile data via `hooks/useProfile.ts`
- Row Level Security (RLS) on all database tables

### Styling Conventions
- Tailwind CSS for styling
- CVA (class-variance-authority) for component variants
- Dark/light theme support via CSS custom properties
