import type { 
  Calculator, 
  EASACalculationInput, 
  DutyCalculationResult, 
  ComplianceStatus,
  RegulatoryLimits 
} from './types';

// EASA EU-OPS Flight Time Limitations
const EASA_LIMITS: RegulatoryLimits = {
  maxFlightDutyPeriod: 13, // Base FDP for single pilot
  requiredRest: 11, // Minimum local night rest
  weekly: 60,
  monthly: 100,
  quarterly: 900,
  annual: 900,
};

/**
 * Get maximum Flight Duty Period based on reporting time and number of sectors
 * EASA has complex rules where FDP is reduced for:
 * - Early morning starts (reduce FDP)
 * - Multiple sectors (reduce FDP)
 * - Acclimatization status
 */
function getMaxFDP(
  reportingTime: Date, 
  sectorCount: number = 1,
  crewSize: 1 | 2
): number {
  const hour = reportingTime.getHours();
  
  // Base FDP depends on crew size and reporting time
  // For simplicity, using base values - full implementation would use detailed tables
  let baseFDP = crewSize === 1 ? 10 : 13;
  
  // Early morning penalty (02:00-04:59 window)
  if (hour >= 2 && hour < 5) {
    baseFDP -= 2; // Significant reduction for night operations
  } else if (hour >= 5 && hour < 6) {
    baseFDP -= 1; // Moderate reduction for early starts
  }
  
  // Sector count reduction (more takeoffs/landings = more fatigue)
  if (sectorCount >= 4) {
    baseFDP -= 2;
  } else if (sectorCount === 3) {
    baseFDP -= 1;
  }
  
  return Math.max(baseFDP, crewSize === 1 ? 8 : 10); // Minimum limits
}

/**
 * EASA EU-OPS Crew Duty Calculator
 * Based on EU Regulation 83/2014, EASA FTL
 */
export const easaCalculator: Calculator = {
  framework: 'easa-eu-ops',
  name: 'EASA EU-OPS FTL',
  jurisdiction: 'European Union',
  limits: EASA_LIMITS,

  calculate(input: EASACalculationInput): DutyCalculationResult {
    const { 
      recentFlights, 
      proposedFlightHours, 
      crewSize,
      acclimatizationStatus = 'home-base',
      sectorCount = 1,
      reportingTime
    } = input;

    const now = new Date();
    const reportTime = reportingTime ? new Date(reportingTime) : now;
    
    // Get maximum FDP based on reporting time and sectors
    const maxFDP = getMaxFDP(reportTime, sectorCount, crewSize);
    
    // Calculate hours flown in the last 24 hours (for comparison)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    let hoursUsed24 = 0;
    recentFlights.forEach(flight => {
      const flightDate = new Date(flight.date);
      if (flightDate >= twentyFourHoursAgo) {
        hoursUsed24 += flight.hours;
      }
    });

    // Calculate total with proposed flight
    const totalWithProposed = hoursUsed24 + proposedFlightHours;
    const hoursRemaining = maxFDP - hoursUsed24;

    // Determine compliance status
    let status: ComplianceStatus;
    let message: string;
    const suggestions: string[] = [];

    if (totalWithProposed <= maxFDP) {
      if (totalWithProposed >= maxFDP * 0.9) {
        status = 'marginal';
        message = `Legal but marginal. Crew will have ${totalWithProposed.toFixed(1)} of ${maxFDP} hours maximum FDP. Minimal buffer for delays.`;
        suggestions.push('Consider schedule padding for potential delays');
        suggestions.push('Ensure crew has adequate rest before duty period');
        if (crewSize === 1 && maxFDP < 12) {
          suggestions.push('Consider two-pilot crew for extended FDP limits');
        }
      } else {
        status = 'legal';
        message = `✓ Legal under EASA FTL. Crew will have ${totalWithProposed.toFixed(1)} of ${maxFDP} hours maximum FDP. ${hoursRemaining.toFixed(1)} hours remaining margin.`;
        if (totalWithProposed >= maxFDP * 0.75) {
          suggestions.push('Monitor for delays that could approach FDP limit');
        }
      }
    } else {
      status = 'illegal';
      const overage = totalWithProposed - maxFDP;
      message = `✕ Illegal under EASA FTL. Proposed flight would result in ${totalWithProposed.toFixed(1)} hours, exceeding ${maxFDP}-hour FDP limit by ${overage.toFixed(1)} hours.`;

      // Provide solutions
      if (crewSize === 1) {
        const maxTwoPilot = getMaxFDP(reportTime, sectorCount, 2);
        if (totalWithProposed <= maxTwoPilot) {
          suggestions.push(`Use two-pilot crew (allows ${maxTwoPilot} hours FDP, making this legal)`);
        }
      }
      
      if (sectorCount > 1) {
        suggestions.push('Reduce number of sectors/legs to increase maximum FDP');
      }
      
      suggestions.push('Delay reporting time to avoid early morning FDP penalty');
      suggestions.push('Split duty into multiple days with minimum 11-hour local night rest');
      suggestions.push('Consider if disruption was unforeseeable for discretion application');
    }

    // Add acclimatization notes
    if (acclimatizationStatus === 'unknown') {
      suggestions.push('⚠️ Unknown acclimatization status - apply most restrictive FDP limits');
    } else if (acclimatizationStatus === 'away') {
      suggestions.push('Crew operating away from home base - ensure adequate rest and acclimatization');
    }

    return {
      status,
      framework: 'easa-eu-ops',
      hoursUsed24,
      hoursRemaining24: Math.max(0, hoursRemaining),
      message,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      regulationReference: 'EU Regulation 83/2014, EASA Part-ORO FTL',
      calculationDetails: [
        { label: 'Crew Configuration', value: crewSize === 1 ? 'Single Pilot' : 'Multi-Crew' },
        { label: 'Maximum FDP', value: `${maxFDP} hours` },
        { label: 'Sector Count', value: `${sectorCount}` },
        { label: 'Acclimatization', value: acclimatizationStatus.replace('-', ' ').toUpperCase() },
        { label: 'Hours Used', value: `${hoursUsed24.toFixed(1)} hours` },
        { label: 'Proposed Flight', value: `${proposedFlightHours.toFixed(1)} hours` },
        { label: 'Total FDP', value: `${totalWithProposed.toFixed(1)} hours` },
        { label: 'Minimum Rest', value: `${EASA_LIMITS.requiredRest} hours local night` },
      ],
    };
  },

  formatDutyHours(hours: number): string {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  }
};
