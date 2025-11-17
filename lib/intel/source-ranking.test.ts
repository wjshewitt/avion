import { describe, it, expect } from 'vitest';
import { calculateSourceRank, buildIntelDedupeHash } from './source-ranking';

describe('source ranking', () => {
  it('gives higher weight to official domains', () => {
    const rank = calculateSourceRank([
      { url: 'https://www.faa.gov/airports/overview', confidence: 0.8 },
      { url: 'https://randomblog.com/post', confidence: 1 },
    ]);
    expect(rank).toBeGreaterThan(0.7);
  });

  it('produces deterministic dedupe hashes', () => {
    const hashA = buildIntelDedupeHash('airport', 'LSZS', 'fbo_overview', { text: 'Handling by Jet Aviation' });
    const hashB = buildIntelDedupeHash('airport', 'lszs', 'FBO Overview', { text: 'Handling by Jet Aviation' });
    expect(hashA).toBe(hashB);
  });
});
