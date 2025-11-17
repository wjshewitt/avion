import type { 
  Calculator, 
  TransportCanadaCalculationInput, 
  DutyCalculationResult, 
  ComplianceStatus,
  RegulatoryLimits 
} from './types';

// Transport Canada Flight and Duty Time Limits
const TC_LIMITS: RegulatoryLimits = {
  singlePilot24Hour: 8, // Single pilot
  twoPilot24Hour: 13, // Multi-crew (can be extended)
  weekly: 70, // With 4 days off in following 7 days
  biweekly: 120,
  monthly: 192, // 28-day period
  annual: 2200,
  requiredRest: 12, // At home base
};

/**
 * Transport Canada Crew Duty Calculator
 * Based on CAR 700.15-700.28, Advisory Circular AC 700-047
 */
export const transportCanadaCalculator: Calculator = {
  framework: 'transport-canada',
  name: 'Transport Canada CARs',
  jurisdiction: 'Canada',
  limits: TC_LIMITS,

  calculate(input: TransportCanadaCalculationInput): DutyCalculationResult {
    const { recentFlights, proposedFlightHours, crewSize, consecutiveDaysOff = 0 } = input;

    const now = new Date();
    
    // Calculate various time windows
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twentyEightDaysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

    // Calculate hours in different periods
    let hoursUsed24 = 0;
    let hoursUsed7Days = 0;
    let hoursUsed28Days = 0;

    recentFlights.forEach(flight => {
      const flightDate = new Date(flight.date);
      if (flightDate >= oneDayAgo) {
        hoursUsed24 += flight.hours;
      }
      if (flightDate >= sevenDaysAgo) {
        hoursUsed7Days += flight.hours;
      }
      if (flightDate >= twentyEightDaysAgo) {
        hoursUsed28Days += flight.hours;
      }
    });

    // Determine applicable 7-day limit based on days off
    const sevenDayLimit = consecutiveDaysOff >= 3 ? 60 : 70;
    
    // Get 24-hour limit
    const limit24Hour = crewSize === 1 ? TC_LIMITS.singlePilot24Hour! : TC_LIMITS.twoPilot24Hour!;

    // Calculate totals with proposed flight
    const total24 = hoursUsed24 + proposedFlightHours;
    const total7Days = hoursUsed7Days + proposedFlightHours;
    const total28Days = hoursUsed28Days + proposedFlightHours;

    // Determine compliance status
    let status: ComplianceStatus = 'legal';
    const violations: string[] = [];
    const suggestions: string[] = [];

    // Check 24-hour limit
    if (total24 > limit24Hour) {
      violations.push(`24-hour limit: ${total24.toFixed(1)}h exceeds ${limit24Hour}h by ${(total24 - limit24Hour).toFixed(1)}h`);
      status = 'illegal';
    } else if (total24 >= limit24Hour * 0.9) {
      status = status === 'legal' ? 'marginal' : status;
    }

    // Check 7-day limit
    if (total7Days > sevenDayLimit) {
      violations.push(`7-day limit: ${total7Days.toFixed(1)}h exceeds ${sevenDayLimit}h by ${(total7Days - sevenDayLimit).toFixed(1)}h`);
      status = 'illegal';
    } else if (total7Days >= sevenDayLimit * 0.9) {
      status = status === 'legal' ? 'marginal' : status;
    }

    // Check 28-day limit
    if (total28Days > TC_LIMITS.monthly!) {
      violations.push(`28-day limit: ${total28Days.toFixed(1)}h exceeds ${TC_LIMITS.monthly}h by ${(total28Days - TC_LIMITS.monthly!).toFixed(1)}h`);
      status = 'illegal';
    } else if (total28Days >= TC_LIMITS.monthly! * 0.9) {
      status = status === 'legal' ? 'marginal' : status;
    }

    // Build message
    let message: string;
    if (status === 'illegal') {
      message = `✕ Illegal under Transport Canada CARs. Violations: ${violations.join('; ')}`;
      
      // Provide solutions
      if (crewSize === 1 && total24 <= TC_LIMITS.twoPilot24Hour!) {
        suggestions.push(`Use multi-crew configuration (allows ${TC_LIMITS.twoPilot24Hour}h in 24 hours)`);
      }
      suggestions.push('Schedule mandatory rest period (12 hours at home base, 10 hours away)');
      suggestions.push('Distribute flights across more days to stay within 7-day and 28-day limits');
      if (consecutiveDaysOff < 3) {
        suggestions.push('Schedule 3 consecutive days off to qualify for 60-hour/7-day limit');
      }
    } else if (status === 'marginal') {
      message = `⚠️ Legal but marginal under Transport Canada CARs. 24h: ${total24.toFixed(1)}/${limit24Hour}h, 7-day: ${total7Days.toFixed(1)}/${sevenDayLimit}h, 28-day: ${total28Days.toFixed(1)}/${TC_LIMITS.monthly}h`;
      suggestions.push('Minimal buffer remaining - monitor for delays');
      suggestions.push('Consider crew fatigue levels beyond regulatory compliance');
    } else {
      message = `✓ Legal under Transport Canada CARs. 24h: ${total24.toFixed(1)}/${limit24Hour}h, 7-day: ${total7Days.toFixed(1)}/${sevenDayLimit}h, 28-day: ${total28Days.toFixed(1)}/${TC_LIMITS.monthly}h`;
    }

    return {
      status,
      framework: 'transport-canada',
      hoursUsed24,
      hoursRemaining24: Math.max(0, limit24Hour - hoursUsed24),
      hoursUsed7Days,
      hoursUsed28Days,
      message,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      regulationReference: 'CAR 700.15-700.28, AC 700-047',
      calculationDetails: [
        { label: 'Crew Configuration', value: crewSize === 1 ? 'Single Pilot' : 'Multi-Crew' },
        { label: '24-Hour Usage', value: `${total24.toFixed(1)}h / ${limit24Hour}h` },
        { label: '7-Day Usage', value: `${total7Days.toFixed(1)}h / ${sevenDayLimit}h` },
        { label: '28-Day Usage', value: `${total28Days.toFixed(1)}h / ${TC_LIMITS.monthly}h` },
        { label: 'Consecutive Days Off', value: `${consecutiveDaysOff} days` },
        { label: 'Required Rest (Home)', value: `${TC_LIMITS.requiredRest} hours` },
        { label: 'Required Rest (Away)', value: '10 hours' },
      ],
    };
  },

  formatDutyHours(hours: number): string {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  }
};
