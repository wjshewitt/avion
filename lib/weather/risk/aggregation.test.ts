import { describe, it, expect } from 'vitest';
import { aggregateRisk } from './aggregation';
import { DEFAULT_RISK_CONFIG } from './constants';
import type { WeatherRiskFactorResult, RiskModelConfig, RiskFactorName, RiskDimension } from './types';

describe('Risk Aggregation v2', () => {
  const baseFactor: WeatherRiskFactorResult = {
    name: 'surface_wind',
    score: 0,
    confidencePenalty: 0,
    severity: 'low',
    messages: [],
    sources: []
  };

  it('should respect disabled factors in config', () => {
    const factors: WeatherRiskFactorResult[] = [
      { ...baseFactor, name: 'surface_wind' as RiskFactorName, score: 90, dimension: 'weather' as RiskDimension },
      { ...baseFactor, name: 'visibility' as RiskFactorName, score: 10, dimension: 'weather' as RiskDimension }
    ];
    
    const config: RiskModelConfig = {
      ...DEFAULT_RISK_CONFIG,
      factors: {
        ...DEFAULT_RISK_CONFIG.factors,
        surface_wind: { enabled: false, weight: 1.0 }
      }
    };

    const result = aggregateRisk('TEST', 'planning', factors, 2, 1, 0, false, config);
    
    // Wind should be ignored, so score should be close to 10 (visibility)
    expect(result.score).toBeLessThan(20);
  });

  it('should increase score when weighting is increased', () => {
    const factors: WeatherRiskFactorResult[] = [
      { ...baseFactor, name: 'surface_wind' as RiskFactorName, score: 50, dimension: 'weather' as RiskDimension },
    ];

    const multiFactors: WeatherRiskFactorResult[] = [
        { ...baseFactor, name: 'surface_wind' as RiskFactorName, score: 80, dimension: 'weather' as RiskDimension }, // High score
        { ...baseFactor, name: 'visibility' as RiskFactorName, score: 20, dimension: 'weather' as RiskDimension }    // Low score
    ];

    const evenWeightResult = aggregateRisk('TEST', 'planning', multiFactors, 2, 1, 0, false, {
        ...DEFAULT_RISK_CONFIG,
        factors: { surface_wind: { enabled: true, weight: 1 }, visibility: { enabled: true, weight: 1 } }
    });
    
    const skewedResult = aggregateRisk('TEST', 'planning', multiFactors, 2, 1, 0, false, {
        ...DEFAULT_RISK_CONFIG,
        factors: { surface_wind: { enabled: true, weight: 10 }, visibility: { enabled: true, weight: 1 } }
    });

    expect(skewedResult.score).toBeGreaterThan(evenWeightResult.score!);
  });

  it('should calculate disruption metrics', () => {
    const factors: WeatherRiskFactorResult[] = [
      { ...baseFactor, name: 'precipitation' as RiskFactorName, score: 80, messages: ['Heavy Freezing Rain'], dimension: 'weather' as RiskDimension }
    ];

    const result = aggregateRisk('TEST', 'departure', factors, 2, 1, 0, false, DEFAULT_RISK_CONFIG);
    
    expect(result.disruption).toBeDefined();
    // Freezing rain should trigger high cancellation probability
    expect(result.disruption?.cancellationProbability).toBeGreaterThan(0.4);
    expect(result.disruption?.notes[0]).toContain('frozen precipitation');
  });

  it('should trigger safety rail for critical single factors', () => {
    const factors: WeatherRiskFactorResult[] = [
      { ...baseFactor, name: 'visibility' as RiskFactorName, score: 90, dimension: 'weather' as RiskDimension }, // Critical
      { ...baseFactor, name: 'temperature' as RiskFactorName, score: 10, dimension: 'weather' as RiskDimension }, // Good
      { ...baseFactor, name: 'surface_wind' as RiskFactorName, score: 10, dimension: 'weather' as RiskDimension } // Good
    ];

    // Weighted average would be around (90+10+10)/3 = 36 (Low risk)
    // But safety rail should force it to at least 60
    const result = aggregateRisk('TEST', 'arrival', factors, 2, 1, 0, false, DEFAULT_RISK_CONFIG);
    
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.tier).not.toBe('on_track');
  });
});
