import type { Regulation, CrewDutyLimits, BriefingItem, OperationalScenario } from '@/types/compliance';

// Part 135 Crew Duty Limits
export const CREW_DUTY_LIMITS: CrewDutyLimits = {
  singlePilot24Hour: 8,
  twoPilot24Hour: 10,
  quarterlyLimit: 500,
  consecutiveQuarterLimit: 800,
  annualLimit: 1400,
  requiredRest: 10,
};

// Regulations Database
export const regulations: Regulation[] = [
  {
    id: 'far-135-267',
    title: 'Flight Time Limitations and Rest Requirements',
    category: 'crew-duty',
    reference: '14 CFR § 135.267',
    summary: 'Establishes maximum flight time and minimum rest requirements for unscheduled one- and two-pilot crews under Part 135 operations.',
    fullText: `§ 135.267 Flight time limitations and rest requirements: Unscheduled one- and two-pilot crews.

(a) No certificate holder may assign any flight crewmember, and no flight crewmember may accept an assignment, for flight time as a member of a one- or two-pilot crew if that crewmember's total flight time in all commercial flying will exceed—
(1) 500 hours in any calendar quarter.
(2) 800 hours in any two consecutive calendar quarters.
(3) 1,400 hours in any calendar year.

(b) Except as provided in paragraph (c) of this section, during any 24 consecutive hours the total flight time of the assigned flight when added to any other commercial flying by that flight crewmember may not exceed—
(1) 8 hours for a flight crew consisting of one pilot; or
(2) 10 hours for a flight crew consisting of two pilots qualified under this part for the operation being conducted.

(c) A flight crewmember's flight time may exceed the flight time limits of paragraph (b) of this section if the assigned flight time occurs during a regularly assigned duty period of no more than 14 hours and—
(1) If this duty period is immediately preceded by and followed by a required rest period of at least 10 consecutive hours of rest;
(2) If flight time is assigned during this period, that total flight time when added to any other commercial flying by the flight crewmember may not exceed—
(i) 8 hours for a flight crew consisting of one pilot; or
(ii) 10 hours for a flight crew consisting of two pilots; and
(3) If the combined duty and rest periods equal 24 hours.

(d) Each assignment under paragraph (b) of this section must provide for at least 10 consecutive hours of rest during the 24-hour period that precedes the planned completion time of the assignment.`,
    plainEnglish: `This regulation limits how much pilots can fly to prevent fatigue:

**Quarterly/Annual Limits:**
- Maximum 500 hours in any 3-month period
- Maximum 800 hours in any 6-month period  
- Maximum 1,400 hours in any year

**Daily Limits (in any 24-hour period):**
- Single pilot: Maximum 8 hours flight time
- Two pilots: Maximum 10 hours flight time

**Rest Requirements:**
- Pilots must have 10 consecutive hours of rest before their next assignment
- The duty period (when they're working) can be up to 14 hours, but flight time still can't exceed the 8/10 hour limits

**Exception for Delays:**
- If a flight is delayed due to weather or mechanical issues that couldn't be foreseen, exceeding these limits may be acceptable—but only if the delay was truly unforeseeable.`,
    keyPoints: [
      'Single pilot: 8 hours max flight time in 24 hours',
      'Two pilots: 10 hours max flight time in 24 hours',
      '10 consecutive hours rest required between assignments',
      'Quarterly limit: 500 hours',
      'Annual limit: 1,400 hours',
      'Weather delays may allow exceptions, but must be documented',
    ],
    examples: [
      'Pilot flew 6 hours yesterday and 3 hours today = 9 hours in rolling 24-hour period. Cannot fly another leg until enough time passes to bring 24-hour total under 8 hours (single pilot).',
      'Two-pilot crew completes an 8-hour transatlantic flight. They can legally fly a 2-hour positioning leg if still within the same 24-hour period, but would be at their 10-hour limit.',
      'Pilot was scheduled for 7-hour flight but weather delay extended actual flight time to 9 hours. Likely permissible as unforeseeable circumstance, but must document the delay.',
    ],
    relatedRegulations: ['14 CFR § 135.265', '14 CFR § 135.269'],
    lastUpdated: '2024-01-01',
    officialSourceUrl: 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-G/part-135/subpart-F/section-135.267',
  },
  {
    id: 'far-135-117',
    title: 'Passenger Briefing Requirements',
    category: 'passenger-briefing',
    reference: '14 CFR § 135.117',
    summary: 'Specifies what information must be provided to passengers before each takeoff.',
    fullText: `§ 135.117 Briefing of passengers before flight.

(a) Before each takeoff each pilot in command of an aircraft carrying passengers shall ensure that all passengers have been orally briefed on—
(1) Smoking. Each passenger shall be briefed on when, where, and under what conditions smoking is prohibited. This briefing shall include a statement, as appropriate, that the Federal Aviation Regulations require passenger compliance with lighted passenger information signs and no smoking placards, prohibit smoking while on the lavatory, and require compliance with crewmember instructions with regard to these items.
(2) Use of safety belts and shoulder harnesses. Each passenger shall be briefed on when, where, and under what conditions it is necessary to have his or her safety belt and, if installed, his or her shoulder harness fastened about him or her. This briefing shall include a statement, as appropriate, that Federal Aviation Regulations require passenger compliance with the lighted passenger sign and/or crewmember instructions with regard to these items.
(3) Location and means for opening the passenger entry door and emergency exits.
(4) Location of survival equipment.
(5) Ditching procedures and the use of flotation equipment required under § 135.167, for a flight over water.
(6) The normal and emergency use of oxygen equipment installed on the aircraft.

(b) The oral briefing required by paragraph (a) of this section shall be given by the pilot in command or a member of the crew. It shall be supplemented by printed cards for the use of each passenger containing information pertaining to the items listed in paragraph (a) and containing pictorial depictions of emergency exit operation.`,
    plainEnglish: `Before every takeoff, the pilot or crew must brief passengers on these safety items:

1. **Smoking rules** - Where and when smoking is not allowed (including lavatories)
2. **Seatbelts** - When they must be fastened and how to comply with seatbelt signs
3. **Emergency exits** - Where they are and how to open them
4. **Survival equipment** - Where it's located on the aircraft
5. **Ditching procedures** - (For overwater flights) How to use flotation equipment
6. **Oxygen equipment** - How to use oxygen masks if installed

The briefing must be given orally (spoken) and supplemented with safety cards showing diagrams.`,
    keyPoints: [
      'Required before EVERY takeoff (not just first leg)',
      'Must be delivered orally by pilot or crew member',
      'Must be supplemented with printed safety cards',
      'Covers: smoking, seatbelts, exits, survival gear, ditching, oxygen',
      'Ditching procedures required for overwater flights',
      'Passengers must be told to comply with crew instructions',
    ],
    examples: [
      'Multi-leg charter: Briefing must be repeated at each departure point, even if same passengers.',
      'Overwater flight from Miami to Bahamas: Must include ditching procedures and flotation equipment location.',
      'High-altitude flight: Must brief on oxygen equipment use, even if not planning to need it.',
    ],
    relatedRegulations: ['14 CFR § 135.127', '14 CFR § 91.519'],
    lastUpdated: '2024-01-01',
    officialSourceUrl: 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-G/part-135/subpart-B/section-135.117',
  },
];

// Passenger Briefing Items (Checklist)
export const briefingItems: BriefingItem[] = [
  {
    id: 'briefing-smoking',
    title: 'Smoking Prohibition',
    regulationRef: 'FAR 135.117(a)(1)',
    description: 'Inform passengers when, where, and under what conditions smoking is prohibited.',
    requiredFor: 'all',
    sampleScript: 'Federal regulations prohibit smoking at all times on this aircraft, including in the lavatory. Please comply with all no-smoking placards and crew instructions.',
  },
  {
    id: 'briefing-seatbelts',
    title: 'Safety Belt and Shoulder Harness Use',
    regulationRef: 'FAR 135.117(a)(2)',
    description: 'Explain when and how to use safety belts and shoulder harnesses.',
    requiredFor: 'all',
    sampleScript: 'Please keep your seatbelt fastened while seated. Federal regulations require you to comply with the illuminated seatbelt sign and all crew instructions regarding seatbelt use.',
  },
  {
    id: 'briefing-exits',
    title: 'Emergency Exit Locations and Operation',
    regulationRef: 'FAR 135.117(a)(3)',
    description: 'Show passengers where emergency exits are located and how to open them.',
    requiredFor: 'all',
    sampleScript: 'Your nearest emergency exit is [location]. To open, [specific instructions for aircraft type]. Please review the safety card in your seat pocket for additional details.',
  },
  {
    id: 'briefing-survival',
    title: 'Survival Equipment Location',
    regulationRef: 'FAR 135.117(a)(4)',
    description: 'Inform passengers where survival equipment is stored.',
    requiredFor: 'all',
    sampleScript: 'Emergency survival equipment, including first aid kit and fire extinguisher, is located [specific location]. Life vests are located [specific location].',
  },
  {
    id: 'briefing-ditching',
    title: 'Ditching Procedures and Flotation Equipment',
    regulationRef: 'FAR 135.117(a)(5)',
    description: 'Explain ditching procedures and how to use life vests for overwater flights.',
    requiredFor: 'overwater',
    sampleScript: 'In the unlikely event of a water landing, life vests are located [location]. Do not inflate until exiting the aircraft. Please review the safety card for detailed instructions.',
  },
  {
    id: 'briefing-oxygen',
    title: 'Oxygen Equipment Use',
    regulationRef: 'FAR 135.117(a)(6)',
    description: 'Demonstrate how to use oxygen masks if depressurization occurs.',
    requiredFor: 'pressurized',
    sampleScript: 'In the event of cabin depressurization, oxygen masks will drop automatically. Pull the mask toward you, place it over your nose and mouth, and breathe normally. Secure your own mask before assisting others.',
  },
  {
    id: 'briefing-ped',
    title: 'Personal Electronic Devices (PED)',
    regulationRef: 'Advisory Circular 91.21-1',
    description: 'Inform passengers of PED usage policies and lithium battery restrictions.',
    requiredFor: 'all',
    sampleScript: 'Personal electronic devices may be used in airplane mode once we reach cruise altitude. Large lithium battery packs must be carried in the cabin, not checked baggage. Please power off devices during taxi, takeoff, and landing.',
  },
];

// Common Operational Scenarios
export const operationalScenarios: OperationalScenario[] = [
  {
    id: 'scenario-same-day-turnaround',
    title: 'Same-Day Return Flight',
    question: 'Client wants pilot to fly NYC to LA and back to NYC same day. Is this legal?',
    problem: 'The round trip would be approximately 10-11 hours of flight time. For a single-pilot operation, this exceeds the 8-hour limit in a 24-hour period.',
    relevantRegulations: ['14 CFR § 135.267'],
    solution: 'Two options: (1) Use a two-pilot crew, which allows 10 hours in 24 hours, making this legal but tight. (2) Split into two days with proper rest period. A single pilot cannot legally complete this mission same-day.',
    prevention: 'When quoting clients, always check total flight time for round trips. For anything over 7 hours total flight time, recommend two-pilot crew or overnight positioning.',
    tags: ['crew-duty', 'same-day', 'turnaround'],
  },
  {
    id: 'scenario-weather-delay',
    title: 'Weather Delay Extending Duty Time',
    question: 'Pilot was scheduled for 7-hour flight but weather delays extended it to 9 hours. Is this a violation?',
    problem: 'The flight exceeded the 8-hour single-pilot limit due to unforeseeable circumstances (weather).',
    relevantRegulations: ['14 CFR § 135.267'],
    solution: 'FAA recognizes unforeseeable delays (weather, ATC, mechanical) as acceptable reasons for exceeding limits. Document the delay cause and actual vs. planned flight time. File a report if questioned.',
    prevention: 'When weather is questionable, brief client that actual flight time may exceed planned time. Consider two-pilot crew for weather-sensitive routes. Always document delays.',
    tags: ['crew-duty', 'weather', 'delays'],
  },
  {
    id: 'scenario-unplanned-fuel-stop',
    title: 'Adding Fuel Stop in Foreign Country',
    question: 'Client wants to add unplanned fuel stop in Morocco tomorrow. What permits do we need?',
    problem: 'Morocco requires 72-hour advance notice for overflight permits. A fuel stop counts as both overflight and landing.',
    relevantRegulations: ['Country-specific'],
    solution: 'Cannot legally operate tomorrow. Morocco requires: (1) Overflight permit (72hr notice), (2) Landing permit (if not already authorized), (3) Handling agent coordination. Earliest feasible date is 4 days from now.',
    prevention: 'When planning international routes, check permit requirements for all countries along the route plus alternates. Build in permit lead times. Maintain list of pre-approved countries.',
    tags: ['permits', 'international', 'fuel-stop'],
  },
  {
    id: 'scenario-lithium-batteries',
    title: 'Passenger Wants to Bring Large Battery Pack',
    question: 'Passenger asks about bringing 50,000 mAh power bank. Is this allowed?',
    problem: 'Large lithium batteries are restricted due to fire risk. FAA limits passenger batteries to 100 watt-hours (Wh) in carry-on.',
    relevantRegulations: ['49 CFR § 175.10', 'Advisory Circular 91.21-1'],
    solution: 'Calculate watt-hours: 50,000 mAh = 50 Ah. If 3.7V (typical), that\'s 185 Wh - EXCEEDS limit. Battery is prohibited unless airline/operator grants special approval. Most charter operators prohibit >100 Wh batteries.',
    prevention: 'Include battery restrictions in pre-flight passenger information packet. Ask passengers about large electronics before flight day. Provide guidance on acceptable battery sizes.',
    tags: ['passenger-briefing', 'batteries', 'safety'],
  },
];
