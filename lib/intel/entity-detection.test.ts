import { describe, it, expect } from 'vitest';
import { detectEntityFromQuery, extractIcaoCandidates } from './entity-detection';

describe('entity detection', () => {
  it('detects ICAO codes inside queries', () => {
    const result = detectEntityFromQuery('What is the FBO situation at LSZS right now?');
    expect(result.entityType).toBe('airport');
    expect(result.entityIdGuess).toBe('LSZS');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('detects operator keywords', () => {
    const result = detectEntityFromQuery('Give me the latest fleet breakdown for VistaJet');
    expect(result.entityType).toBe('operator');
    expect(result.entityIdGuess).toBe('vistajet');
  });

  it('detects additional operator like AirX Charter', () => {
    const result = detectEntityFromQuery('Tell me about AirX Charter as an operator');
    expect(result.entityType).toBe('operator');
    expect(result.entityIdGuess).toBe('airx-charter');
  });

  it('ignores common four-letter stopwords', () => {
    const candidates = extractIcaoCandidates('THIS request should not create bogus ICAO codes');
    expect(candidates).toHaveLength(0);
  });
});
