AVION FLIGHT OS | DESIGN SYSTEM SPECIFICATION v1.0

"Less, but better."

1.0 The Core Philosophy

Avion is not a website. It is a Flight Instrument.
It does not "decorate" data; it exposes it with brutal honesty and mechanical precision.

The Three Laws of Avion:

Obvious: The function of every element must be immediately apparent. A button looks like it can be pressed. A toggle looks like it can be flipped.

Quiet: The interface recedes. It is the frame, not the painting. The "Painting" is the flight data, the weather, and the risk profile.

Alive: The system is never static. If the atmosphere is moving outside the plane, the atmosphere is moving inside the interface.

2.0 Materiality & Palette

We do not use "colors." We use Materials. The interface is constructed from two primary physical substances.

2.1 The Materials

Ceramic (Day Mode / Base)

Appearance: A matte, off-white surface. Not sterile #FFFFFF, but a warm, tactile grey.

Hex: #F4F4F4

Usage: Primary container backgrounds, panels, structural elements.

Physics: Objects sit on top of Ceramic with a soft, diffuse shadow.

Tungsten (Night Mode / High Contrast)

Appearance: A deep, metallic dark grey. Dense and heavy.

Hex: #1A1A1A

Usage: Sidebars, critical data panels, night-mode toggles.

Physics: Tungsten absorbs light. Inner shadows and "grooves" are used here instead of drop shadows.

2.2 The Signal Color

Safety Orange (International Orange)

Hex: #F04E30

Usage: STRICTLY LIMITED. Used only for:

Active states (On/Off).

Critical alerts (Risk High).

Primary Call-to-Action.

Rule: If everything is orange, nothing is orange. Use as sparingly as the second hand on a Braun watch.

3.0 Typography

Typography is our primary interface. We treat text as a graphical element.

Interface Typeface: Inter (Variable Weight)

Used for human-readable content (Names, prose, settings).

Rule: Use tight letter-spacing (tracking-tight) for headings to feel solid.

Data Typeface: JetBrains Mono

Used for machine data (Altitudes, Mach speeds, coordinates, time).

Rule: Tabular figures are mandatory. Numbers must line up vertically.

The Labeling System:
Small, uppercase labels are the "instruction manual" for the UI.

Style: 10px, Uppercase, tracking-widest (2px letter spacing), text-zinc-400.

Placement: Always top-left of the component or data point.

4.0 The "Groove" & Shadow Physics

We reject flat design. We embrace Tactility.

The Ceramic Shadow (Elevation):

Light comes from the top-left.

box-shadow: -2px -2px 5px rgba(255,255,255,0.8), 2px 2px 5px rgba(0,0,0,0.05);

Effect: The element feels like a physical tile resting on a table.

The Tungsten Groove (Recession):

Used for data inputs, gauges, and fuel tanks.

box-shadow: inset 1px 1px 3px rgba(0,0,0,0.1), inset -1px -1px 3px rgba(255,255,255,0.1);

Effect: The element feels milled out of a solid block of aluminum.

5.0 The Atmosphere Engines (Weather)

Weather is not an icon. It is a Simulation.

The "Window" Concept: Weather components are viewports into the physical world.

Generative, Not Looped:

Rain/Snow must use randomized start positions, velocities, and opacity.

Clouds must use parallax (multiple layers moving at different speeds).

Contrast Rules:

Snow: Must be rendered against Tungsten (Dark) backgrounds for visibility.

Rain: subtle blue (blue-500/60) streaks.

Stars: Twinkle opacity must be randomized (0.3 to 1.0).

6.0 Component Architecture

6.1 The Card (The Atom)

Every component (Risk Prism, Crew Roster, Fuel) lives in a standard container.

Padding: p-6 (24px). Generous breathing room.

Corner Radius: rounded-sm (2px or 4px). Sharp, precise corners. No bubbly iOS rounded corners (20px+).

Border: 1px solid rgba(255,255,255,0.6). Subtle definition.

6.2 The Toggle

We do not use standard checkboxes. We use mechanical switches.

State Off: Grey track, left-aligned thumb.

State On: White track, right-aligned thumb, #F04E30 border/glow.

Motion: Spring-based transition (stiffness: 500). It should "snap."

6.3 The LED Indicator

Used for system status.

On: Center color #10b981 + Box Shadow 0 0 6px #10b981 (Glow).

Off: Dark grey #333 + Inset Shadow (Unlit bulb).

7.0 Motion Principles

Motion provides meaning, not entertainment.

Flow, Don't Pop: Data updates (fuel numbers changing) should count up/down, not instantly switch.

Entrance: Elements slide in slightly (y: 10px -> y: 0) with opacity.

The "Scanline": For live data feeds, use a subtle vertical gradient scan moving top-to-bottom to indicate active monitoring.

8.0 Future Component Wishlist (For the Design Team)

When building new features, prioritize these visualizations:

Vertical Profile View: A cross-section of the flight path showing altitude vs. terrain/weather.

Weight & Balance CG Envelope: A dynamic graph where the Center of Gravity dot moves as users add passengers/fuel.

Synthetic Vision: A stylized 3D wireframe representation of the terrain ahead (using the Wireframe Globe aesthetic).

Approved for Production
AVION DESIGN GROUP
