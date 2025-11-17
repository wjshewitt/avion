import type { 
  Calculator, 
  BaseCalculationInput, 
  DutyCalculationResult, 
  ComplianceStatus,
  RegulatoryLimits 
} from './types';

// FAA Part 135 Crew Duty Limits
const FAA_LIMITS: RegulatoryLimits = {
  singlePilot24Hour: 8,
  twoPilot24Hour: 10,
  quarterly: 500,
  consecutiveQuarterly: 800,
  annual: 1400,
  requiredRest: 10,
};

/**
 * FAA Part 135 Crew Duty Calculator
 * Based on 14 CFR § 135.267
 */
export const faaCalculator: Calculator = {
  framework: 'faa-part-135',
  name: 'FAA Part 135',
  jurisdiction: 'United States',
  limits: FAA_LIMITS,

  calculate(input: BaseCalculationInput): DutyCalculationResult {
    const { recentFlights, proposedFlightHours, crewSize } = input;

    // Get the applicable limit based on crew size
    const limit24Hour = crewSize === 1 
      ? FAA_LIMITS.singlePilot24Hour! 
      : FAA_LIMITS.twoPilot24Hour!;

    // Calculate hours flown in the last 24 hours
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let hoursUsed24 = 0;
    recentFlights.forEach(flight => {
      const flightDate = new Date(flight.date);
      if (flightDate >= twentyFourHoursAgo) {
        hoursUsed24 += flight.hours;
      }
    });

    // Calculate what total would be with proposed flight
    const totalWithProposed = hoursUsed24 + proposedFlightHours;
    const hoursRemaining = limit24Hour - hoursUsed24;

    // Determine compliance status
    let status: ComplianceStatus;
    let message: string;
    const suggestions: string[] = [];

    if (totalWithProposed <= limit24Hour) {
      if (totalWithProposed >= limit24Hour * 0.9) {
        // Within 90% of limit - marginal
        status = 'marginal';
        message = `Legal but marginal. Pilot will have flown ${totalWithProposed.toFixed(1)} of ${limit24Hour} hours maximum. No buffer for delays.`;
        suggestions.push('Consider adding buffer time for potential delays');
        suggestions.push('Brief client that any weather/ATC delays could necessitate rest period');
        if (crewSize === 1) {
          suggestions.push('Consider using two-pilot crew for 2-hour additional margin');
        }
      } else {
        // Safe margin
        status = 'legal';
        message = `✓ Legal. Pilot will have flown ${totalWithProposed.toFixed(1)} of ${limit24Hour} hours maximum in 24-hour period. ${hoursRemaining.toFixed(1)} hours remaining margin.`;
        if (totalWithProposed >= limit24Hour * 0.7) {
          suggestions.push('Monitor for potential delays that could push toward limit');
        }
      }
    } else {
      // Exceeds limit
      status = 'illegal';
      const overage = totalWithProposed - limit24Hour;
      message = `✕ Illegal. Proposed flight would result in ${totalWithProposed.toFixed(1)} hours, exceeding ${limit24Hour}-hour limit by ${overage.toFixed(1)} hours.`;

      // Provide solutions
      if (crewSize === 1) {
        const neededWithTwoPilot = totalWithProposed - FAA_LIMITS.twoPilot24Hour!;
        if (neededWithTwoPilot <= 0) {
          suggestions.push(`Use two-pilot crew (allows ${FAA_LIMITS.twoPilot24Hour} hours, making this legal)`);
        }
      }

      // Calculate when pilot could legally fly again
      const oldestFlight = recentFlights
        .filter(f => new Date(f.date) >= twentyFourHoursAgo)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

      if (oldestFlight) {
        const oldestDate = new Date(oldestFlight.date);
        const hoursUntilReset = 24 - (now.getTime() - oldestDate.getTime()) / (1000 * 60 * 60);
        if (hoursUntilReset > 0) {
          suggestions.push(`Delay departure by ${Math.ceil(hoursUntilReset)} hours to reset 24-hour clock`);
        }
      }

      suggestions.push('Split into multiple days with 10-hour rest period between duty periods');
      suggestions.push('Consider if delays were unforeseeable (weather/mechanical) for exception documentation');
    }

    return {
      status,
      framework: 'faa-part-135',
      hoursUsed24,
      hoursRemaining24: Math.max(0, hoursRemaining),
      message,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      regulationReference: '14 CFR § 135.267',
      calculationDetails: [
        { label: 'Crew Configuration', value: crewSize === 1 ? 'Single Pilot' : 'Two Pilots' },
        { label: '24-Hour Limit', value: `${limit24Hour} hours` },
        { label: 'Hours Used', value: `${hoursUsed24.toFixed(1)} hours` },
        { label: 'Proposed Flight', value: `${proposedFlightHours.toFixed(1)} hours` },
        { label: 'Total', value: `${totalWithProposed.toFixed(1)} hours` },
        { label: 'Required Rest', value: `${FAA_LIMITS.requiredRest} consecutive hours` },
      ],
    };
  },

  formatDutyHours(hours: number): string {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  }
};
