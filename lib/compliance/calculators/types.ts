// Shared types for all crew duty calculators

export type ComplianceStatus = 'legal' | 'marginal' | 'illegal';

export type RegulatoryFramework = 
  | 'faa-part-135'
  | 'easa-eu-ops'
  | 'uk-caa'
  | 'transport-canada'
  | 'casa-australia';

export type AcclimatizationStatus = 'home-base' | 'away' | 'unknown';

export interface FlightHistory {
  date: string; // ISO 8601
  hours: number;
  flightId?: string;
}

export interface BaseCalculationInput {
  framework: RegulatoryFramework;
  recentFlights: FlightHistory[];
  proposedFlightHours: number;
  crewSize: 1 | 2;
}

export interface EASACalculationInput extends BaseCalculationInput {
  framework: 'easa-eu-ops' | 'uk-caa';
  acclimatizationStatus?: AcclimatizationStatus;
  sectorCount?: number; // Number of flight sectors/legs
  reportingTime?: string; // ISO 8601 - when crew reports for duty
}

export interface TransportCanadaCalculationInput extends BaseCalculationInput {
  framework: 'transport-canada';
  consecutiveDaysOff?: number; // For 7-day period calculations
}

export interface CASACalculationInput extends BaseCalculationInput {
  framework: 'casa-australia';
  operatorHasFRMS?: boolean; // Fatigue Risk Management System
}

export type CalculationInput = 
  | BaseCalculationInput
  | EASACalculationInput
  | TransportCanadaCalculationInput
  | CASACalculationInput;

export interface DutyCalculationResult {
  status: ComplianceStatus;
  framework: RegulatoryFramework;
  hoursUsed24?: number;
  hoursRemaining24?: number;
  hoursUsed7Days?: number;
  hoursUsed28Days?: number;
  hoursUsed365Days?: number;
  message: string;
  suggestions?: string[];
  regulationReference: string;
  calculationDetails?: {
    label: string;
    value: string;
  }[];
}

export interface RegulatoryLimits {
  singlePilot24Hour?: number;
  twoPilot24Hour?: number;
  maxFlightDutyPeriod?: number; // Hours
  requiredRest?: number; // Hours
  weekly?: number;
  biweekly?: number;
  monthly?: number;
  quarterly?: number;
  consecutiveQuarterly?: number;
  annual?: number;
}

export interface Calculator {
  framework: RegulatoryFramework;
  name: string;
  jurisdiction: string;
  limits: RegulatoryLimits;
  calculate(input: CalculationInput): DutyCalculationResult;
  formatDutyHours(hours: number): string;
}
