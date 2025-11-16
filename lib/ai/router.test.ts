import { describe, it, expect } from 'vitest';
import { chooseGeminiModel } from './router';

describe('chooseGeminiModel', () => {
  it('defaults main surface to lite for simple queries', async () => {
    const decision = await chooseGeminiModel({
      surface: 'main',
      userMessage: 'What is the METAR for KJFK?',
      totalTokensEstimate: 200,
      hasTools: false,
      modeHint: 'casual',
    });

    expect(decision.modelName).toContain('lite');
    expect(decision.routingReason).toBe('default:main->lite');
  });

  it('routes to full when context exceeds main threshold', async () => {
    const decision = await chooseGeminiModel({
      surface: 'main',
      userMessage: 'x'.repeat(100),
      totalTokensEstimate: 10000,
      hasTools: false,
      modeHint: 'analysis',
    });

    expect(decision.modelName).not.toContain('lite');
    expect(decision.routingReason.startsWith('hard:context>')).toBe(true);
  });

  it('routes sidebar short casual queries to lite', async () => {
    const decision = await chooseGeminiModel({
      surface: 'sidebar',
      userMessage: 'Weather at EGLL?',
      totalTokensEstimate: 50,
      hasTools: true,
      modeHint: 'casual',
    });

    expect(decision.modelName).toContain('lite');
    expect(decision.routingReason).toBe('default:sidebar->lite');
  });

  it('routes high reliability requests to full', async () => {
    const decision = await chooseGeminiModel({
      surface: 'main',
      userMessage: 'Provide a full risk assessment for this flight.',
      totalTokensEstimate: 500,
      hasTools: true,
      requiresHighReliability: true,
      modeHint: 'analysis',
    });

    expect(decision.modelName).not.toContain('lite');
    expect(decision.routingReason).toBe('hard:requiresHighReliability');
  });
});
