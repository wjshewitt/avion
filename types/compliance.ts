// Compliance Intelligence Types
// Regulatory reference system for flight operations coordinators

export type RegulationCategory = 'crew-duty' | 'passenger-briefing' | 'country-requirements' | 'aircraft-operations';

export type ComplianceStatus = 'legal' | 'marginal' | 'illegal';

// Compliance Health Score (for dashboard widgets)
export interface ComplianceHealthScore {
  overall: number;
  crew: number;
  aircraft: number;
  documentation: number;
  authorization: number;
}

// Compliance Document (for document tracking)
export interface ComplianceDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  expiryDate: string | null;
  status: 'compliant' | 'current' | 'expiring' | 'expired' | 'due_soon' | 'overdue';
}

// Crew Duty Status (for monitoring)
export interface CrewDutyStatus {
  crewId: string;
  name: string;
  role: string;
  currentDutyHours: number;
  maxDutyHours: number;
  restRequired: boolean;
  restUntil: string | null;
  upcomingFlights: string[];
}

// Country Authorization (for permit tracking)
export interface CountryAuthorization {
  id: string;
  country: string;
  countryCode: string;
  regulationType: string;
  status: 'compliant' | 'expiring' | 'expired';
  expiryDate: string;
  limitations: string[];
  documents: ComplianceDocument[];
  region: string;
}

// Compliance Alert System
export interface ComplianceAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  category?: RegulationCategory;
  regulationRef?: string;
  actionRequired?: boolean;
  expiresAt?: string;
  createdAt: string;
}

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
  /** Environmental regulations including emissions standards, SAF requirements, and sustainability mandates. */
  environmentalRequirements?: {
    emissionsStandards?: string[];
    sustainableFuelRequirements?: string[];
    carbonOffsetSchemes?: string[];
    noiseStandards?: string[];
  };
  /** Security protocols and crew vetting requirements. */
  securityRequirements?: {
    crewVetting?: string[];
    passengerScreening?: string[];
    securityBriefings?: string[];
    prohibitedItems?: string[];
  };
  /** Crew licensing and medical requirements specific to the country. */
  crewRequirements?: {
    licenseRecognition?: string[];
    medicalCertificateRequirements?: string[];
    languageRequirements?: string[];
    typeRatingRequirements?: string[];
    trainingRequirements?: string[];
  };
  /** Documentation and data management requirements. */
  documentationRequirements?: {
    requiredDocuments?: string[];
    dataProtectionRules?: string[];
    recordKeepingRequirements?: string[];
    reportingObligations?: string[];
  };
  /** Recent regulatory updates and enforcement trends. */
  recentUpdates?: {
    date: string;
    description: string;
  }[];
  /** Data source and last updated timestamp for transparency. */
  dataSource?: string;
  lastUpdated?: string;
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


// New Restructured types for the redesigned compliance page
export type ComplianceSiloCategory = 'landing' | 'takeoff' | 'operator' | 'aircraft';

export interface ComplianceSilo {
  category: ComplianceSiloCategory;
  items: ComplianceSiloItem[];
}

export interface ComplianceSiloItem {
  id: string;
  title: string;
  content: string | string[];
  type: 'text' | 'list' | 'kv';
  data?: { [key: string]: string | boolean | number };
}

export interface RestructuredCountryRequirement {
  id: string;
  countryName: string;
  countryCode: string;
  region: 'Americas' | 'Europe' | 'Middle East' | 'Asia-Pacific' | 'Africa';
  summary: string;
  silos: ComplianceSilo[];
  regulatoryAuthority: {
    name: string;
    website: string;
    contactEmail?: string;
  };
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
