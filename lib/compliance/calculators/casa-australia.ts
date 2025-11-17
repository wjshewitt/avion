import type { 
  Calculator, 
  CASACalculationInput, 
  DutyCalculationResult, 
  ComplianceStatus,
  RegulatoryLimits 
} from './types';

// CASA Australia Basic Limits (CAO 48.1)
const CASA_LIMITS: RegulatoryLimits = {
  monthly: 100, // 28-day period for basic operations
  quarterly: 300, // 90-day period
  requiredRest: 10, // Minimum rest period
};

/**
 * CASA Australia Crew Duty Calculator
 * Based on CAO 48.1 Fatigue Management, CAAP 48-01
 * 
 * Note: Australia uses a more flexible FRMS-based approach
 * This calculator provides basic prescriptive limits
 */
export const casaAustraliaCalculator: Calculator = {
  framework: 'casa-australia',
  name: 'CASA CAO 48.1',
  jurisdiction: 'Australia',
  limits: CASA_LIMITS,

  calculate(input: CASACalculationInput): DutyCalculationResult {
    const { recentFlights, proposedFlightHours, crewSize, operatorHasFRMS = false } = input;

    const now = new Date();
    
    // Calculate various time windows
    const twentyEightDaysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    let hoursUsed28Days = 0;
    let hoursUsed90Days = 0;

    recentFlights.forEach(flight => {
      const flightDate = new Date(flight.date);
      if (flightDate >= twentyEightDaysAgo) {
        hoursUsed28Days += flight.hours;
      }
      if (flightDate >= ninetyDaysAgo) {
        hoursUsed90Days += flight.hours;
      }
    });

    // Calculate totals with proposed flight
    const total28Days = hoursUsed28Days + proposedFlightHours;
    const total90Days = hoursUsed90Days + proposedFlightHours;

    // Determine compliance status
    let status: ComplianceStatus = 'legal';
    const violations: string[] = [];
    const suggestions: string[] = [];

    // For operators with FRMS
    if (operatorHasFRMS) {
      const message = `✓ Operator has approved Fatigue Risk Management System (FRMS). Individual flight assessment required under operator's FRMS procedures.`;
      suggestions.push('Consult operator\'s FRMS procedures for specific duty limits');
      suggestions.push('Complete fatigue self-assessment before duty');
      suggestions.push('Report any fatigue concerns to operator immediately');
      
      return {
        status: 'legal',
        framework: 'casa-australia',
        hoursUsed28Days,
        message,
        suggestions,
        regulationReference: 'CAO 48.1, Operator FRMS',
        calculationDetails: [
          { label: 'Operator Status', value: 'FRMS Approved' },
          { label: '28-Day Hours', value: `${total28Days.toFixed(1)} hours` },
          { label: '90-Day Hours', value: `${total90Days.toFixed(1)} hours` },
          { label: 'Note', value: 'Operator FRMS limits apply' },
        ],
      };
    }

    // For basic prescriptive limits
    let message: string;

    // Check 28-day limit
    if (total28Days > CASA_LIMITS.monthly!) {
      violations.push(`28-day limit: ${total28Days.toFixed(1)}h exceeds ${CASA_LIMITS.monthly}h by ${(total28Days - CASA_LIMITS.monthly!).toFixed(1)}h`);
      status = 'illegal';
    } else if (total28Days >= CASA_LIMITS.monthly! * 0.9) {
      status = status === 'legal' ? 'marginal' : status;
    }

    // Check 90-day limit
    if (total90Days > CASA_LIMITS.quarterly!) {
      violations.push(`90-day limit: ${total90Days.toFixed(1)}h exceeds ${CASA_LIMITS.quarterly}h by ${(total90Days - CASA_LIMITS.quarterly!).toFixed(1)}h`);
      status = 'illegal';
    } else if (total90Days >= CASA_LIMITS.quarterly! * 0.9) {
      status = status === 'legal' ? 'marginal' : status;
    }

    // Build message
    if (status === 'illegal') {
      message = `✕ Illegal under CASA CAO 48.1 basic limits. Violations: ${violations.join('; ')}`;
      
      suggestions.push('Schedule mandatory rest period (minimum 10 hours)');
      suggestions.push('Distribute flights across more days to stay within limits');
      suggestions.push('Consider if operator should implement FRMS for greater flexibility');
      suggestions.push('Consult CASA fatigue management specialists if operations are constrained');
    } else if (status === 'marginal') {
      message = `⚠️ Legal but marginal under CASA CAO 48.1. 28-day: ${total28Days.toFixed(1)}/${CASA_LIMITS.monthly}h, 90-day: ${total90Days.toFixed(1)}/${CASA_LIMITS.quarterly}h`;
      suggestions.push('Approaching limits - ensure adequate rest and fatigue monitoring');
      suggestions.push('Complete fatigue self-assessment before each duty period');
      suggestions.push('Consider FRMS implementation for more sophisticated fatigue management');
    } else {
      message = `✓ Legal under CASA CAO 48.1 basic limits. 28-day: ${total28Days.toFixed(1)}/${CASA_LIMITS.monthly}h, 90-day: ${total90Days.toFixed(1)}/${CASA_LIMITS.quarterly}h`;
      suggestions.push('Continue monitoring duty hours and fatigue levels');
    }

    return {
      status,
      framework: 'casa-australia',
      hoursUsed28Days,
      message,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      regulationReference: 'CAO 48.1, CAAP 48-01',
      calculationDetails: [
        { label: 'Crew Configuration', value: crewSize === 1 ? 'Single Pilot' : 'Multi-Crew' },
        { label: '28-Day Usage', value: `${total28Days.toFixed(1)}h / ${CASA_LIMITS.monthly}h` },
        { label: '90-Day Usage', value: `${total90Days.toFixed(1)}h / ${CASA_LIMITS.quarterly}h` },
        { label: 'Operator FRMS', value: operatorHasFRMS ? 'Yes' : 'No' },
        { label: 'Minimum Rest', value: `${CASA_LIMITS.requiredRest} hours` },
      ],
    };
  },

  formatDutyHours(hours: number): string {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  }
};
