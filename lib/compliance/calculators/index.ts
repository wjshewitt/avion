/**
 * Crew Duty Calculator Registry
 * Central access point for all regulatory framework calculators
 */

import type { Calculator, CalculationInput, RegulatoryFramework } from './types';
import { faaCalculator } from './faa';
import { easaCalculator } from './easa';
import { ukCAACalculator } from './uk-caa';
import { transportCanadaCalculator } from './transport-canada';
import { casaAustraliaCalculator } from './casa-australia';

// Export all calculator modules
export * from './types';
export { faaCalculator } from './faa';
export { easaCalculator } from './easa';
export { ukCAACalculator } from './uk-caa';
export { transportCanadaCalculator } from './transport-canada';
export { casaAustraliaCalculator } from './casa-australia';

// Calculator registry
const calculators: Record<RegulatoryFramework, Calculator> = {
  'faa-part-135': faaCalculator,
  'easa-eu-ops': easaCalculator,
  'uk-caa': ukCAACalculator,
  'transport-canada': transportCanadaCalculator,
  'casa-australia': casaAustraliaCalculator,
};

/**
 * Get calculator by regulatory framework
 */
export function getCalculator(framework: RegulatoryFramework): Calculator {
  const calculator = calculators[framework];
  if (!calculator) {
    throw new Error(`Unknown regulatory framework: ${framework}`);
  }
  return calculator;
}

/**
 * Calculate crew duty compliance for any regulatory framework
 */
export function calculateCrewDuty(input: CalculationInput) {
  const calculator = getCalculator(input.framework);
  return calculator.calculate(input);
}

/**
 * Get all available calculators
 */
export function getAllCalculators(): Calculator[] {
  return Object.values(calculators);
}

/**
 * Get calculator metadata for UI display
 */
export function getCalculatorInfo() {
  return Object.entries(calculators).map(([framework, calculator]) => ({
    framework: framework as RegulatoryFramework,
    name: calculator.name,
    jurisdiction: calculator.jurisdiction,
    limits: calculator.limits,
  }));
}

/**
 * Format duty hours consistently across all calculators
 */
export function formatDutyHours(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
}
