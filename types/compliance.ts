// Compliance Intelligence Types
// Regulatory reference system for flight operations coordinators

export type RegulationCategory = 'crew-duty' | 'passenger-briefing' | 'country-requirements' | 'aircraft-operations';

export type ComplianceStatus = 'legal' | 'marginal' | 'illegal';

// Crew Duty Regulations
export interface CrewDutyLimits {
  singlePilot24Hour: number; // 8 hours
  twoPilot24Hour: number; // 10 hours
  quarterlyLimit: number; // 500 hours
  consecutiveQuarterLimit: number; // 800 hours
  annualLimit: number; // 1,400 hours
  requiredRest: number; // 10 consecutive hours
}

export interface DutyCalculationInput {
  recentFlights: {
    date: string;
    hours: number;
  }[];
  proposedFlightHours: number;
  crewSize: 1 | 2;
}

export interface DutyCalculationResult {
  status: ComplianceStatus;
  hoursUsed24: number;
  hoursRemaining24: number;
  message: string;
  suggestions?: string[];
}

// Country & Airport Requirements
export interface CountryRequirement {
  id: string;
  countryName: string;
  countryCode: string; // ISO 2-letter
  region: 'Americas' | 'Europe' | 'Middle East' | 'Asia-Pacific' | 'Africa';
  /**
   * High-level narrative overview of this country's business-aviation regulatory posture
   * (private vs charter, permits, cabotage). Intended for operator-facing UI, not legal text.
   */
  overview?: string;
  overflightPermit: {
    required: boolean;
    advanceNoticeHours: number;
    validityDays: number;
    estimatedCost: string;
    applicationProcess: string;
  };
  landingPermit: {
    required: boolean;
    restrictions: string[];
    approvedAirports: string[];
  };
  /** Operator-facing notes for private/non-revenue operations (Part 91-style). */
  privateOpsNotes?: string[];
  /** Operator-facing notes for charter/commercial operations (Part 135-style). */
  charterOpsNotes?: string[];
  /** Bullet points describing cabotage stance and domestic-leg rules. */
  cabotageNotes?: string[];
  /** Any notable risk/enforcement posture notes (e.g. strict on cabotage, documentation). */
  riskNotes?: string[];
  customsImmigration: string[];
  curfews: string[];
  noiseRestrictions: string[];
  specialRequirements: string[];
  handlingAgents?: string[];
  regulatoryAuthority: {
    name: string;
    website: string;
    contactEmail?: string;
  };
}

export interface AirportRequirement {
  icao: string;
  name: string;
  specialRequirements: string[];
  slotRequired: boolean;
  priorPermissionRequired: boolean;
  handlingAgentMandatory: boolean;
  curfew?: { start: string; end: string };
  notes: string[];
}

// Passenger Briefing Requirements
export interface BriefingItem {
  id: string;
  title: string;
  regulationRef: string; // e.g., "FAR 135.117(a)(1)"
  description: string;
  requiredFor: 'all' | 'overwater' | 'pressurized' | 'extended-overwater';
  sampleScript: string;
}

export interface PassengerBriefingChecklist {
  flightId?: string;
  aircraftType: string;
  date: string;
  items: {
    itemId: string;
    checked: boolean;
    notes?: string;
  }[];
  conductedBy: string;
  passengerAcknowledgment?: {
    signed: boolean;
    signatureUrl?: string;
    timestamp: string;
  };
}

// Aircraft Operational Classifications
export interface AircraftCategory {
  category: 'light-jet' | 'midsize-jet' | 'heavy-jet' | 'turboprop';
  typicalPassengerLimit: string;
  rangeConsiderations: string[];
  certificationRequirements: {
    rvsm: boolean;
    etops: boolean;
    catII: boolean;
    catIII: boolean;
  };
  commonQuestions: {
    question: string;
    answer: string;
    regulationRef?: string;
  }[];
}

// Regulation Database
export interface Regulation {
  id: string;
  title: string;
  category: RegulationCategory;
  reference: string; // e.g., "14 CFR 135.267"
  summary: string;
  fullText: string;
  plainEnglish: string;
  keyPoints: string[];
  examples: string[];
  relatedRegulations: string[];
  lastUpdated: string;
  officialSourceUrl: string;
}

// Common Scenarios
export interface OperationalScenario {
  id: string;
  title: string;
  question: string;
  problem: string;
  relevantRegulations: string[];
  solution: string;
  prevention: string;
  tags: string[];
}

// Search & Bookmarks
export interface SearchResult {
  type: 'regulation' | 'country' | 'scenario' | 'briefing-item';
  id: string;
  title: string;
  summary: string;
  url: string;
  relevanceScore: number;
}

export interface UserBookmark {
  userId: string;
  itemType: 'regulation' | 'country' | 'scenario';
  itemId: string;
  note?: string;
  createdAt: string;
}

export interface RecentSearch {
  query: string;
  timestamp: string;
  resultCount: number;
}
