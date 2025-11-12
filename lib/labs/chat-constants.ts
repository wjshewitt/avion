/**
 * Premium Labs Chat - Constants & Configuration
 */

export const ANIMATION_TIMINGS = {
  micro: 120,
  standard: 240,
  emphasis: 400,
} as const;

export const ANIMATION_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

export const TEXTAREA_CONFIG = {
  minHeight: 56,
  maxHeight: 200,
  placeholder: "Ask about weather, airports, or flight operations...",
} as const;

export const SUGGESTION_PROMPTS = [
  {
    id: "weather-check",
    label: "Weather Status",
    prompt: "What's the current weather situation at major European business aviation airports?",
    icon: "cloud",
  },
  {
    id: "route-analysis",
    label: "Route Analysis",
    prompt: "Analyze weather patterns between KJFK and EGLL for the next 12 hours",
    icon: "plane",
  },
  {
    id: "alternate-planning",
    label: "Alternate Planning",
    prompt: "Suggest suitable alternates for LFSB considering weather and runway length for a G650",
    icon: "map",
  },
  {
    id: "briefing-prep",
    label: "Briefing Preparation",
    prompt: "Prepare a comprehensive weather briefing for a transatlantic crossing today",
    icon: "file",
  },
] as const;

export const WELCOME_CAPABILITIES = [
  {
    title: "Weather Intelligence",
    description: "Real-time METAR/TAF analysis with risk assessment for any airport worldwide",
    icon: "cloud",
  },
  {
    title: "Route Planning",
    description: "Evaluate weather patterns, alternates, and fuel stops across complex routings",
    icon: "route",
  },
  {
    title: "Operational Briefing",
    description: "Generate comprehensive briefings for dispatch, crew, and charter clients",
    icon: "briefing",
  },
  {
    title: "Constraint Analysis",
    description: "Assess airport suitability considering weather, runway, and aircraft limitations",
    icon: "check",
  },
] as const;

export const KEYBOARD_SHORTCUTS = [
  { key: "↵", label: "Send message" },
  { key: "⇧↵", label: "New line" },
  { key: "⌘K", label: "New conversation" },
  { key: "⌘⌫", label: "Clear input" },
] as const;
