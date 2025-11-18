# TypeScript Remediation Log

This log tracks incremental batches of fixes applied while driving the TypeScript build back to green.

## Batch Plan

1. **Chat & EXA Stabilization**  
   - Fix `app/(app)/chat-enhanced/page.tsx` message preview + `FlightChatMessage` usage.  
   - Normalize EXA citation typing and update structured intel mapping.  
   - Update airport cluster tests to respect typed cluster props.  
   - Align conversation-title implementation/tests with latest AI SDK signatures.
2. **Compliance Context Typing**  
   - Introduce typed Supabase helpers for jurisdictions/aircraft/airports.
3. **Intel Modules Typing**  
   - Apply typed Supabase access to ingestion + persistence layers.
4. **Zustand Store Cleanup**  
   - Define `AppState` + typed slices, remove implicit `any`.

## Batch 1 — Chat & EXA Stabilization

- [x] Update chat-enhanced page previews to avoid accessing `messages` inside callbacks.  
- [x] Normalize EXA citations + structured intel mapping.  
- [x] Update airport cluster tests for typed properties.  
- [x] Fix conversation title module + tests.

`npx tsc --noEmit` now fails solely on the remaining compliance/intel/store typing tasks (see Batch 2+ items) instead of the chat/EXA set addressed here.

Attempts to run newly created droids via `droid-run`/`factory droid run` failed (commands unavailable); revisit once runner tooling is documented.

## Batch 2 — Compliance Context Typing

- [x] Added lightweight typed Supabase table helper for the compliance context service.  
- [x] Ensured jurisdiction/operator/airport lookups return typed payloads and normalized country codes.  
- [x] Hardened aircraft record persistence with typed update/insert payloads.

_Log updates as each item completes._

## Batch 3 — Intel Modules Typing

- [x] Typed EXA intel fetchers to return structured citations without relying on `nullsLast`.  
- [x] Reworked ingestion queue + persistence layers to use typed payload builders while casting Supabase queries only at the edge (eliminating `never` inserts).  
- [x] Tightened structured intel schema (`z.record`) to satisfy Supabase column types and normalized stored values.

`npx tsc --noEmit` now only reports Zustand store typing issues (Batch 4) before validators can run.

## Batch 4 — Zustand Store Cleanup

- [x] Rebuilt `lib/store.ts` with an explicit `AppState` interface, typed `StateCreator`, and shared helpers.  
- [x] Eliminated `useAppStore.getState()` access inside state setters by leveraging the `get` argument.  
- [x] Added pin limit constant and ensured persisted slices only include relevant fields.

All validators now succeed (`npx tsc --noEmit`, `npm run lint`, `npm run test`).

