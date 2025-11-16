# AVION FLIGHT OS · Design Language v1.2

“Less, but better.”

This document consolidates Avion’s v1.0 manifesto with production patterns introduced in v1.2 across Atmosphere Engines, Flight Deck modules, Gemini chat components, and public marketing surfaces.

## 1. Philosophy

- Instrument, not website: UI exposes data with precision; zero decoration without purpose.
- Obvious: Affordances must read at a glance (buttons press, switches snap, LEDs indicate state).
- Quiet: UI frames data; the “painting” is flight, weather, and risk data.
- Alive: If the atmosphere moves outside, it moves inside; motion signals state, not flair.

## 2. Materials, Surfaces, Palette

### 2.1 Materials
- Ceramic (Day/Base): `#F4F4F4` — primary containers and structural tiles.
  - Shadow physics (elevation): `-2px -2px 5px rgba(255,255,255,0.8), 2px 2px 5px rgba(0,0,0,0.05)`
- Tungsten (Night/High-Contrast): `#1A1A1A` (component dark variant commonly `#2A2A2A`).
  - Shadow physics (groove): `inset 1px 1px 3px rgba(0,0,0,0.1), inset -1px -1px 3px rgba(255,255,255,0.2)`

### 2.2 Signal & Accents
- Safety Orange: `#F04E30` (strict): on/off states, critical alerts, primary CTA.
- Info Blue: `#2563EB` (marketing/telemetry only); never replaces Safety Orange for critical states.

### 2.3 Surfaces
- Ceramic tile: soft elevation, 1px subtle border.
- Tungsten panel: dense, uses grooves and inner shadows.
- Glass Panel (marketing/public pages only): frosted surface with blur and inset sheen; avoid in Flight OS unless explicitly for telemetry display.

## 3. Typography

- Inter (UI, human text). Headings use tight tracking.
- JetBrains Mono (machine data, codes, timings). Tabular figures mandatory; numbers align vertically.
- Labeling system: 10px, uppercase, `tracking-widest`, muted zinc tone; positioned at the top-left of a component/data block.

## 4. Iconography

- Lucide icon set, default stroke width `1.5`. Use subtle opacity/weight shifts on hover; never theatrical.

## 5. Layout & Card Atom

- Card atom: `p-6`, `rounded-sm`, subtle 1px border; sharp corners (no >8px radii), generous whitespace.
- Grid: 1/2/3/4 column responsive; align to consistent gutters; maintain exact baselines for labels and values.

## 6. Motion Principles

- Flow, don’t pop: numbers count up/down; entries slide/fade subtly (`y: 10 → 0`, opacity easing).
- Switches snap: spring-based transitions (stiffness ≈ 500, damping ≈ 30).
- Scanline: subtle animated gradient to imply live monitoring.
- Durations restrained; avoid bouncy overshoot on critical UI.

## 7. Atmosphere Engines (Weather)

- Window concept: weather is a viewport, not an icon.
- Generative particles: randomized origin, velocity, opacity (Rain/Snow); storms add transient flashes.
- Parallax clouds: multiple layers moving at different speeds.
- Contrast rules: Snow prefers Tungsten backgrounds; Rain uses subtle blue streaks; Stars twinkle with randomized opacity.

Components (examples):
- SunEffect (day/night disc; rotating solar ring by day, dimmed disc by night).
- RainEffect (linear downward streaks; storm mode adds flash layer).
- SnowEffect (drifting flakes with minor x-y wander).
- FogEffect (slow cross-fade gradient sweep).

## 8. Flight Deck Modules (v1.2 patterns)

- Risk Prism: stacked bar factors; thresholds → low: emerald, moderate: amber, high: Safety Orange. Tooltip on hover.
- Airport Profile: runway orientation vs wind vector overlay; mono facts (RWY, LEN, ELEV) with precise labels.
- Fuel Monitor: three groove tanks (L/C/R) with fill level animations; endurance and balance indicators in mono.
- Crew Status: role chips (PIC/SIC/FA), LED indicator glow for on-duty (emerald), resting (amber).
- Checklist: mechanical switch with spring snap; label strikes through on completion.
- Scratchpad: lined mono textarea; eraser affordance; light border top bar.

## 9. Gemini Chat Patterns

- ThinkingIndicator: 3-bar height wave; mono step label cycling (Parsing → Querying → Synthesizing).
- AIMessage: left-justified; header with product name and small version chip; typing cursor is a pulsing Safety Orange bar; content in readable `text-sm` with tight leading.
- Verified Sources: `Link` label with mono “VERIFIED SOURCES”; SourceCard tiles show title + metadata; hover shifts border to Safety Orange and elevates subtly; icon tint follows.

## 10. Theming & Tokens

Use shared tokens to guarantee consistency across Flight OS and public surfaces.

```css
:root {
  --material-ceramic: #f4f4f4;
  --material-tungsten: #1a1a1a; /* component dark variant sometimes #2a2a2a */
  --accent-safety: #F04E30;     /* critical/active */
  --accent-info: #2563eb;       /* marketing/telemetry */
}

.ceramic {
  background: var(--material-ceramic);
  box-shadow: -2px -2px 5px rgba(255,255,255,0.8), 2px 2px 5px rgba(0,0,0,0.05);
  border: 1px solid rgba(255,255,255,0.6);
}

.tungsten {
  background: #2a2a2a; /* v1.2 component dark */
  color: #e5e5e5;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.2);
  border: 1px solid #333;
}

.groove {
  box-shadow: inset 1px 1px 3px rgba(0,0,0,0.1), inset -1px -1px 3px rgba(255,255,255,0.2);
}

/* Public/marketing only */
.glass-panel {
  background: rgba(245,245,245,0.9);
  backdrop-filter: blur(12px);
  box-shadow: inset 0 0 20px rgba(255,255,255,0.8), 0 10px 20px rgba(0,0,0,0.05);
  border: 1px solid rgba(255,255,255,0.7);
}
```

Recommended defaults:
- Icon stroke: `1.5`.
- Label: `text-[10px] font-mono uppercase tracking-widest text-zinc-400`.
- Small borders: `border-zinc-200` on light, `border-zinc-700` on dark.

## 11. Accessibility & Contrast

- Maintain WCAG-compliant contrast for text and critical signals.
- Tabular numerals for all numeric columns; avoid jitter.
- Respect reduced motion: fall back to opacity-only or static states.

## 12. Do / Don’t

Do
- Use Safety Orange sparingly and meaningfully.
- Keep corners sharp (`rounded-sm` max). Maintain precise alignment and label placement.
- Prefer motion that clarifies state changes (streaming, scanning, filling).

Don’t
- Overuse gradients, glass, or shadows in Flight OS.
- Replace orange with blue for critical alerts.
- Introduce large-radius, bubbly controls.

## 13. Future Components (approved targets)

- Vertical Profile View (altitude vs terrain/weather cross-section).
- Weight & Balance CG Envelope (dynamic dot within limits).
- Synthetic Vision (stylized wireframe terrain ahead).

---

Approved for Production · Avion Design Group
