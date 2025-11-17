import { describe, expect, it } from 'vitest';
import { buildSystemPrompt, determineThinkingBudget } from './prompt-resolver';

describe('buildSystemPrompt', () => {
  it('includes context prefix when page context provided', () => {
    const prompt = buildSystemPrompt({
      mode: 'weather-brief',
      pageContext: { type: 'weather', icao: 'KJFK' },
    });

    expect(prompt).toContain('weather page for KJFK');
    expect(prompt.length).toBeGreaterThan(100);
  });

  it('falls back to default prompt when no context', () => {
    const prompt = buildSystemPrompt({ mode: null, pageContext: null });
    expect(prompt.length).toBeGreaterThan(0);
  });
});

describe('determineThinkingBudget', () => {
  it('returns high budget for deep briefing generation', () => {
    expect(determineThinkingBudget('Please generate the final briefing', 'deep-briefing')).toBe(16_384);
  });

  it('returns zero for simple fact queries', () => {
    expect(determineThinkingBudget('What is the METAR for EGLL', null)).toBe(0);
  });

  it('returns analysis budget for risk questions', () => {
    expect(determineThinkingBudget('Can you analyze risk factors', 'flight-ops')).toBe(8_192);
  });
});
