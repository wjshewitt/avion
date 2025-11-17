import type { 
  Calculator, 
  EASACalculationInput, 
  DutyCalculationResult 
} from './types';
import { easaCalculator } from './easa';

/**
 * UK CAA Crew Duty Calculator
 * Post-Brexit UK continues to align with EASA FTL regulations
 * Using EASA calculator with UK-specific branding and future-proofing
 * Reference: UK CAA CAP1266, EASA FTL (UK retained law)
 */
export const ukCAACalculator: Calculator = {
  framework: 'uk-caa',
  name: 'UK CAA FTL',
  jurisdiction: 'United Kingdom',
  limits: easaCalculator.limits,

  calculate(input: EASACalculationInput): DutyCalculationResult {
    // Currently uses EASA rules - future updates can diverge
    const result = easaCalculator.calculate({
      ...input,
      framework: 'easa-eu-ops'
    });

    // Override framework identifier for UK
    return {
      ...result,
      framework: 'uk-caa',
      regulationReference: 'UK CAA CAP1266, EASA FTL (UK retained law)',
      calculationDetails: result.calculationDetails?.map(detail => {
        if (detail.label === 'Crew Configuration') {
          return detail;
        }
        return detail;
      }),
    };
  },

  formatDutyHours: easaCalculator.formatDutyHours
};
