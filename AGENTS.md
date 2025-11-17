# FlightChat — Aviation Command Console

A comprehensive flight operations platform with AI assistance, weather intelligence, and real-time aviation data. Built with Next.js 15, React 19, and Supabase.

## Core Commands

• **Type-check**: `npx tsc --noEmit`
• **Lint**: `npm run lint`
• **Run tests**: `npm run test`
• **Watch tests**: `npm run test:watch`
• **Coverage**: `npm run test:coverage`
• **Dev server**: `npm run dev` (starts on port 3000 with Turbopack)
• **Build**: `npm run build --turbo`
• **Production**: `npm run start`
• **Airport data import**: `npm run import:ourairports` (requires Supabase connection)
• **Airport data dry-run**: `npm run import:ourairports:dry`
• **Check airport cache**: `npm run check:airport-cache`

## Project Structure

```
flightchat/
├── app/                          # Next.js App Router pages
│   ├── (app)/                    # Authenticated app routes
│   │   ├── airports/             # Airport search & details
│   │   ├── chat-enhanced/        # Enhanced AI chat interface
│   │   ├── compliance/           # Compliance tools & calculators
│   │   ├── flights/              # Flight management
│   │   ├── logotest/             # Operator logo testing
│   │   ├── settings/             # User settings
│   │   └── weather/              # Weather intelligence
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── api/                      # API routes
│   │   ├── chat/                 # AI chat endpoints
│   │   └── intel/                # Intelligence & research endpoints
│   └── globals.css               # Global styles & design tokens
│
├── components/                   # React components
│   ├── avion/                    # Avion Design Language components
│   │   └── chat/                 # Chat-specific components
│   ├── chat-enhanced/            # Enhanced chat UI
│   ├── compliance/               # Compliance & regulatory components
│   ├── flights/                  # Flight-related components
│   │   └── wizard/               # Flight creation wizard
│   ├── layout/                   # Layout components (header, sidebar)
│   ├── mission-control/          # Mission control dashboard
│   ├── onboarding/               # User onboarding flow
│   ├── ui/                       # Reusable UI primitives (shadcn/ui)
│   └── weather/                  # Weather visualization components
│
├── lib/                          # Business logic & utilities
│   ├── ai/                       # AI/LLM integration
│   │   └── chat/                 # Chat-specific AI logic
│   ├── airports/                 # Airport data & search
│   ├── chat/                     # Chat service layer
│   ├── compliance/               # Compliance calculations
│   │   └── calculators/          # Specific calculators (crew duty, etc.)
│   ├── gemini/                   # Google Gemini integration
│   ├── intel/                    # Intelligence & research services
│   ├── supabase/                 # Supabase client & types
│   └── utils/                    # Shared utilities
│
├── hooks/                        # React hooks
├── store/                        # Zustand state management
├── types/                        # TypeScript type definitions
├── data/                         # Static data files
├── supabase/                     # Supabase configuration
│   └── migrations/               # Database migrations
└── scripts/                      # Build & deployment scripts
```

## Development Patterns & Conventions

### TypeScript
• **Strict mode enabled** — No implicit any, null checks enforced
• **Explicit types preferred** — Avoid type inference for public APIs
• **Zod for runtime validation** — All external data (API responses, user input) must be validated
• **Path aliases**: Use `@/components`, `@/lib`, `@/types`, `@/store`, `@/data` imports

### React & Next.js
• **Server Components by default** — Use `"use client"` only when necessary (hooks, event handlers, browser APIs)
• **App Router conventions** — `page.tsx` for routes, `layout.tsx` for layouts, `route.ts` for API endpoints
• **Parallel data fetching** — Fetch data at the highest level possible, pass as props
• **Error boundaries** — Use `error.tsx` and `not-found.tsx` for error handling
• **Metadata exports** — Every page should export `metadata` or `generateMetadata`

### Styling (Avion Design Language)
• **Design system defined in `aviondesignlanguage.md`** — Read this first
• **Ceramic material** (#F4F4F4) for light mode, **Tungsten** (#1A1A1A) for dark mode
• **Safety Orange** (#F04E30) ONLY for active states, critical alerts, and primary CTAs
• **Typography**: Inter (UI), JetBrains Mono (data/metrics)
• **Shadows for elevation**, not decoration — Use `box-shadow` to indicate physical depth
• **150-300ms animations** — Fast, purposeful, never bouncy
• **Tailwind utilities preferred** — Avoid custom CSS unless absolutely necessary
• **Component variants**: Use `class-variance-authority` (CVA) for component variations

### Component Architecture
• **Atomic design** — Build from primitives in `components/ui/` upward
• **Colocation** — Keep component-specific logic, types, and tests together
• **Single responsibility** — Each component does one thing well
• **Props over context** — Use React Context sparingly (theme, auth only)
• **Controlled components** — Forms use react-hook-form with Zod resolvers

### State Management
• **Zustand for global state** — See `store/` directory
• **React Query for server state** — All API calls use `@tanstack/react-query`
• **Local state for UI** — Don't lift state unnecessarily
• **Persistence**: Use `persist` middleware for preferences (favorites, recent items, panel states)

### AI Integration
• **Vercel AI SDK** — Primary interface for LLM interactions
• **Google Gemini** — Main AI provider (via `@ai-sdk/google` and `@ai-sdk/google-vertex`)
• **Streaming responses** — All chat interfaces use streaming
• **Tool calling** — Tools defined in `lib/gemini/tool-executor.ts`, follow existing patterns
• **Prompts in `lib/gemini/prompts.ts`** — System prompts, personas, and instructions
• **Context awareness** — Pass flight, weather, and airport data to AI for relevant responses

### Database (Supabase)
• **Supabase client in `lib/supabase/`** — Server and client instances
• **Row Level Security (RLS)** — All tables must have RLS policies
• **Migrations in `supabase/migrations/`** — Never modify database schema directly
• **Types generated** — Run `supabase gen types typescript --local > lib/supabase/types.ts`
• **Real-time subscriptions** — Use Supabase real-time for live updates (chat, flight status)

### Testing
• **Vitest** for unit tests — `.test.ts` or `.test.tsx` files colocated with source
• **Test data factories** — Create reusable test data generators
• **Mock external APIs** — Never hit real APIs in tests
• **Coverage threshold**: Aim for 70%+ on business logic, 50%+ overall
• **Run before commit**: `npm run test` must pass before pushing

### Aviation Domain
• **ICAO/IATA codes** — Airport identifiers (ICAO 4-letter preferred)
• **METAR/TAF** — Raw aviation weather formats
• **Flight levels** — Altitude in hundreds of feet (FL350 = 35,000 ft)
• **UTC/Zulu time** — All timestamps in UTC, display in user's timezone
• **Risk levels**: Low (green), Moderate (amber), High (red)
• **Crew duty regulations** — Follow FAA Part 117 for duty time calculations

## Git Workflow

1. **Branch from `main`** — Use descriptive names: `feature/<slug>` or `fix/<slug>`
2. **Commit conventions** — Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
3. **Run tests & lint** — `npm run test && npm run lint` before committing
4. **No force-push to `main`** — Use `--force-with-lease` on feature branches only
5. **PR requires** — Tests passing, no lint errors, type-check passing
6. **Review checklist**:
   - [ ] Tests added/updated
   - [ ] Types updated if API changed
   - [ ] Design system followed (Avion guidelines)
   - [ ] No console.logs in production code
   - [ ] Environment variables documented

## Evidence Required for Every PR

• **Tests pass**: `npm run test` shows all green
• **No type errors**: `npx tsc --noEmit` succeeds
• **Lint clean**: `npm run lint` reports no issues
• **Proof artifact**:
  - Bug fix → Failing test added first, now passes
  - Feature → New tests or screenshots demonstrating behavior
  - Refactor → Tests unchanged, all still pass
• **One-paragraph description** — Explain intent & root cause
• **No secrets or API keys** — Check diff before committing

## Security & Sensitive Data

• **Environment variables** — Never commit `.env.local`, use `.env.example` for templates
• **API keys** — Store in Supabase Vault or Vercel Environment Variables
• **User data** — All PII must be protected by RLS
• **Authentication** — Use Supabase Auth, never roll your own
• **Rate limiting** — API routes must implement rate limiting
• **CORS** — Restrict API access to known origins

## External Services & Dependencies

• **Supabase** — Database, auth, storage (requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
• **Google Gemini** — AI chat (requires `GOOGLE_GENERATIVE_AI_API_KEY` or Vertex AI credentials)
• **OurAirports** — Airport data source (CSV import scripts in `scripts/`)
• **MapLibre GL** — Map rendering (no API key required)
• **Deck.gl** — 3D visualization overlays

## Common Gotchas

• **Turbopack caching** — If dev server acts weird, delete `.next/` and restart
• **Supabase types** — Regenerate after schema changes: `supabase gen types typescript --local`
• **Airport search** — Uses cached data for performance, rebuild cache if data changes
• **AI streaming** — Must use `StreamingTextResponse` in API routes for proper streaming
• **Time zones** — Always store UTC, convert to local for display using `date-fns`
• **Map performance** — Use clustering for large datasets, see `lib/airports/useAirportClusterer.ts`
• **Console logs** — Automatically removed in production builds via Next.js config
• **React 19** — Uses new `react-jsx` transform, some legacy patterns may not work

## Domain-Specific Vocabulary

• **METAR** — Aviation weather observation format (e.g., "KJFK 121251Z 09014KT 10SM FEW250")
• **TAF** — Terminal Aerodrome Forecast (24-30 hour weather forecast)
• **NOTAM** — Notice to Airmen (temporary flight restrictions or airport info)
• **FBO** — Fixed Base Operator (airport services provider)
• **Runway designators** — Magnetic heading divided by 10 (Runway 09 = 090° magnetic)
• **Flight levels** — Altitude at standard pressure (FL350 = 35,000 ft MSL)
• **ICAO codes** — 4-letter airport codes (KJFK, EGLL, LFPG)
• **IATA codes** — 3-letter airport codes (JFK, LHR, CDG)
• **CG** — Center of Gravity (weight & balance)
• **MEL** — Minimum Equipment List (allowed deferrals)

## Performance Optimization

• **Route caching** — Next.js automatically caches static routes
• **React Query cache** — Set appropriate `staleTime` and `cacheTime`
• **Airport clustering** — Use `supercluster` for map markers (see `lib/airports/useAirportClusterer.ts`)
• **Image optimization** — Use Next.js `<Image>` component, store in Supabase Storage
• **Code splitting** — Use dynamic imports for large components: `const Map = dynamic(() => import('./Map'))`
• **Font optimization** — Geist font loaded via `next/font`
• **Bundle analysis** — Run `npm run build` and check output size warnings

## AI Chat Architecture

• **Conversation service** — `lib/chat/conversation-service.ts` handles CRUD
• **Title generation** — `lib/chat/conversation-title.ts` auto-generates titles from messages
• **Streaming** — All chat responses use Server-Sent Events (SSE)
• **Tool execution** — Tools defined in `lib/gemini/tool-executor.ts`, called by AI
• **Context injection** — Flight data, weather, and user preferences passed to AI
• **Message persistence** — Stored in Supabase `chat_messages` table
• **Optimistic updates** — UI updates immediately, reconciled on response

## Quick Start for New Features

1. **Read design system** — `aviondesignlanguage.md` for visual patterns
2. **Check existing patterns** — Similar features already built? Reuse components
3. **Define types** — Add to `types/` or inline if single-use
4. **Build UI components** — Start with `components/ui/` primitives
5. **Add business logic** — Create service in `lib/` (pure functions preferred)
6. **Connect to data** — Use React Query for API calls, Zustand for client state
7. **Add tests** — Colocate `.test.ts` files with source
8. **Update documentation** — Add to this file if it changes core patterns

## When Things Go Wrong

• **Build fails** — Check `next build` output, usually TypeScript errors
• **Tests fail** — Run `npm run test:watch` for instant feedback
• **Supabase errors** — Check RLS policies, verify environment variables
• **AI not responding** — Check API key, verify streaming response format
• **Map not loading** — Check MapLibre version compatibility, verify container has height
• **Type errors** — Regenerate Supabase types, check Zod schemas match

## Philosophy in Practice

**Avion Design Language** — "Less, but better."
• Every element justifies its existence
• Function creates beauty, not decoration
• Typography creates hierarchy naturally
• Color conveys meaning, not decoration
• Motion provides meaning, not entertainment

**Code Philosophy**
• Clarity over cleverness
• Explicit over implicit
• Composition over inheritance
• Pure functions over stateful logic
• Testing gives confidence to refactor

---

Built with obsessive attention to what matters.
