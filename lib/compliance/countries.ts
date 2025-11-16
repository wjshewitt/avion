import type { CountryRequirement, AirportRequirement } from '@/types/compliance';

// Country Requirements Database (Top 20 for Private Charter)
export const countryRequirements: CountryRequirement[] = [
  {
    id: 'us',
    countryName: 'United States',
    countryCode: 'US',
    region: 'Americas',
    overview:
      'FAA- and DOT-regulated market with strong TSA/CBP overlay. No general landing permit regime for most GA flights, but strict cabotage and economic authority rules for foreign charter operators.',
    overflightPermit: {
      required: false,
      advanceNoticeHours: 0,
      validityDays: 0,
      estimatedCost: 'N/A',
      applicationProcess: 'No permit required for domestic operations under Part 135.',
    },
    landingPermit: {
      required: false,
      restrictions: [],
      approvedAirports: ['All public-use airports'],
    },
    privateOpsNotes: [
      'Foreign private, non-revenue flights from most ICAO states generally do not require landing permits but must comply with FAA rules, CBP inspection and TSA security programs where applicable.',
      'Electronic Advance Passenger Information System (eAPIS) filings are mandatory for international arrivals and departures.',
      'Corporate/owner flights must avoid structures that look like “flight department companies” being compensated for carriage without proper certification.',
    ],
    charterOpsNotes: [
      'Foreign charter/air-taxi operators normally require DOT economic authority (foreign air carrier permit or exemption) and FAA foreign operator approvals before selling flights touching the US.',
      'Once authorised, most routes do not need per-flight landing permits but must stay within approved operations specifications.',
      'US-registered charter operators must comply with Part 135/121 duty limits, maintenance, SMS and training requirements.',
    ],
    cabotageNotes: [
      'Foreign commercial operators generally may not carry revenue passengers solely between two US points (cabotage prohibition).',
      'Foreign private operators flying their own personnel on multi-stop business trips may conduct domestic legs provided no compensation is received for transportation.',
      'CBP and DOT can impose substantial fines and deny future access for cabotage violations.',
    ],
    riskNotes: [
      'US authorities are strict on cabotage, illegal charter, APIS/eAPIS non-compliance and security violations.',
      'Older non-compliant Stage 2 aircraft face restrictions or bans at many airports.',
    ],
    customsImmigration: [
      'eAPIS (Electronic Advance Passenger Information System) required for international arrivals',
      'CBP advance notification for international flights',
      'General aviation terminals available at major airports',
    ],
    curfews: ['Varies by airport - check local noise abatement procedures'],
    noiseRestrictions: ['Stage 3 or higher aircraft required at most major airports'],
    specialRequirements: [],
    regulatoryAuthority: {
      name: 'Federal Aviation Administration (FAA)',
      website: 'https://www.faa.gov',
      contactEmail: undefined,
    },
  },
  {
    id: 'gb',
    countryName: 'United Kingdom',
    countryCode: 'GB',
    region: 'Europe',
    overview:
      'Post-Brexit UK regime with UK CAA oversight. Private GA flights are relatively straightforward; charter requires UK permits and careful treatment of domestic legs.',
    overflightPermit: {
      required: false,
      advanceNoticeHours: 0,
      validityDays: 0,
      estimatedCost: 'N/A',
      applicationProcess: 'No specific permit required for overflight. Standard ICAO procedures apply.',
    },
    landingPermit: {
      required: true,
      restrictions: ['Prior Permission Required (PPR) at most business aviation airports'],
      approvedAirports: ['EGLL', 'EGLF', 'EGGW', 'EGKB', 'EGKA'],
    },
    customsImmigration: [
      'Post-Brexit: Full customs and immigration procedures required',
      'eAPIS submission mandatory',
      'GENDEC (General Declaration) required',
      'Animal Health Certificate for pets',
    ],
    curfews: ['Many London-area airports have night restrictions 23:00-07:00 local'],
    noiseRestrictions: ['London airports have strict noise quotas', 'QC2 or quieter typically required'],
    specialRequirements: [
      'Slot required at Heathrow (EGLL)',
      'Landing fees significantly higher post-Brexit',
      'Advanced booking required at most FBOs',
    ],
    handlingAgents: ['Signature Flight Support', 'Universal Aviation', 'Harrods Aviation'],
    regulatoryAuthority: {
      name: 'UK Civil Aviation Authority (CAA)',
      website: 'https://www.caa.co.uk',
    },
  },
  {
    id: 'mx',
    countryName: 'Mexico',
    countryCode: 'MX',
    region: 'Americas',
    overview:
      'AFAC-regulated environment with mandatory authorisations for most foreign business aviation. Documentation, especially insurance wording, is scrutinised and cabotage is tightly controlled.',
    overflightPermit: {
      required: true,
      advanceNoticeHours: 48,
      validityDays: 5,
      estimatedCost: '$300–700 USD (via handler/trip support)',
      applicationProcess:
        'Overflight permits are filed with AFAC, usually by a local handler or trip-support provider. Expect to submit registration, airworthiness, insurance, crew licences and a proposed route 48–72 hours in advance.',
    },
    landingPermit: {
      required: true,
      restrictions: [
        'Foreign private flights generally require an AIU (private flight authorisation) number; enforcement of multi-entry vs single-entry varies by airport.',
        'Foreign charter flights require individual landing permits for each mission and may be limited to specific city pairs.',
      ],
      approvedAirports: ['Major international and business airports; check with local handler for latest list'],
    },
    privateOpsNotes: [
      'Since 2024, annual/multiple-entry permissions have largely been replaced by mission-specific AIU authorisations; industry best practice is to obtain a new AIU per trip.',
      'Insurance certificates must match registration, owner name, aircraft make/model and serial number exactly or permits can be rejected.',
      'Authorities may request evidence of the relationship between passengers and aircraft owner/operator (e.g., employment letters) to confirm non-revenue status.',
    ],
    charterOpsNotes: [
      'Foreign charter flights must obtain AFAC landing permits through a local handler, with typical lead time of 5–10 business days.',
      'Mexican authorities often limit foreign charter patterns, for example allowing one internal leg tightly tied to an international arrival/departure.',
      'Incomplete or inconsistent documentation can result in permit denial or last-minute restrictions to the itinerary.',
    ],
    cabotageNotes: [
      'Mexico enforces cabotage rules strictly; foreign charter operators may not freely conduct domestic point-to-point services.',
      'Even for private flights, authorities can question itineraries that resemble domestic charter and may require proof of non-revenue intent.',
    ],
    riskNotes: [
      'AFAC is known to detain aircraft on the ramp over documentation issues (insurance wording, permit validity, passenger mismatch).',
      'Local practice can vary from airport to airport; using a reputable Mexican handler is essential.',
    ],
    customsImmigration: [
      'International arrivals must clear immigration and customs; GA typically uses FBOs at major airports.',
      'Passenger passports and, where applicable, visas must be valid for the planned stay; tourist cards/online authorisations may apply for some nationalities.',
      'Agricultural and customs inspections can be detailed; declare restricted items.',
    ],
    curfews: ['Some resort and city airports apply night restrictions and slot controls during peak seasons.'],
    noiseRestrictions: ['Standard ICAO noise requirements apply; check airport-specific procedures for Mexico City and resort airports.'],
    specialRequirements: [
      'Local handler or trip-support provider is effectively mandatory for permits and ground coordination.',
      'Carry multiple copies of permits, insurance and passenger lists; expect ramp inspections.',
    ],
    handlingAgents: ['Universal Aviation Mexico', 'Aerocharter', 'Local AFAC-approved handlers'],
    regulatoryAuthority: {
      name: 'Agencia Federal de Aviación Civil (AFAC)',
      website: 'https://www.afac.gob.mx',
    },
  },
  {
    id: 'ma',
    countryName: 'Morocco',
    countryCode: 'MA',
    region: 'Africa',
    overflightPermit: {
      required: true,
      advanceNoticeHours: 72,
      validityDays: 30,
      estimatedCost: '$500-800 USD',
      applicationProcess: 'Submit via handling agent minimum 72 hours in advance. Include flight plan, aircraft registration, passenger manifest.',
    },
    landingPermit: {
      required: true,
      restrictions: ['Landing permit required separately from overflight', 'Commercial traffic only at approved airports'],
      approvedAirports: ['GMMN (Casablanca)', 'GMME (Rabat)', 'GMAD (Agadir)', 'GMMX (Marrakech)'],
    },
    customsImmigration: [
      'Advanced passenger manifest required 24 hours prior',
      'Crew permits required for stays >24 hours',
      'Customs inspection can be thorough',
    ],
    curfews: [],
    noiseRestrictions: [],
    specialRequirements: [
      'No operations to/from Israel without bilateral agreement',
      'French language helpful for communications',
      'Handling agent mandatory at all airports',
      'Payment often required in advance',
    ],
    handlingAgents: ['Universal Aviation Morocco', 'Aviav TM Maroc'],
    regulatoryAuthority: {
      name: 'Office National des Aéroports (ONDA)',
      website: 'https://www.onda.ma',
    },
  },
  {
    id: 'ae',
    countryName: 'United Arab Emirates',
    countryCode: 'AE',
    region: 'Middle East',
    overview:
      'High-service business-aviation hub where most foreign GA operations require advance landing permits and handling support. Domestic UAE sectors are reserved for UAE operators.',
    overflightPermit: {
      required: false,
      advanceNoticeHours: 0,
      validityDays: 0,
      estimatedCost: 'N/A',
      applicationProcess: 'Overflight permits not typically required. Standard ICAO flight plan sufficient.',
    },
    landingPermit: {
      required: true,
      restrictions: ['Landing slot required at major airports', '24-48 hour advance notice'],
      approvedAirports: ['OMDB (Dubai Int\'l)', 'OMDW (Al Maktoum)', 'OMAA (Abu Dhabi)', 'OMSJ (Sharjah)'],
    },
    customsImmigration: [
      'GAR (General Aviation Report) required',
      'Passport copies of all passengers 24hrs in advance',
      'UAE visa required for most nationalities (can be obtained on arrival for many)',
    ],
    curfews: ['Al Maktoum (OMDW): 24-hour operations', 'Dubai Int\'l (OMDB): Limited GA slots at night'],
    noiseRestrictions: ['Chapter 4 noise compliant aircraft preferred'],
    specialRequirements: [
      'Handling agent mandatory',
      'Security screening for all passengers and baggage',
      'Fuel prices competitive',
      'Excellent FBO facilities',
    ],
    handlingAgents: ['DC Aviation Al-Futtaim', 'Jetex', 'ExecuJet Middle East'],
    regulatoryAuthority: {
      name: 'General Civil Aviation Authority (GCAA)',
      website: 'https://www.gcaa.gov.ae',
    },
  },
  {
    id: 'ch',
    countryName: 'Switzerland',
    countryCode: 'CH',
    region: 'Europe',
    overflightPermit: {
      required: false,
      advanceNoticeHours: 0,
      validityDays: 0,
      estimatedCost: 'N/A',
      applicationProcess: 'No overflight permit required. Standard EUROCONTROL procedures.',
    },
    landingPermit: {
      required: true,
      restrictions: ['Slot required at LSZH (Zurich)', 'PPR at most airports'],
      approvedAirports: ['LSZH (Zurich)', 'LSGG (Geneva)', 'LSZB (Bern)', 'LSZA (Lugano)'],
    },
    customsImmigration: [
      'Schengen area - simplified procedures for EU arrivals',
      'Non-Schengen arrivals require advance notification',
      'Customs can be strict - declare all goods',
    ],
    curfews: ['Most airports: 23:00-06:00 local time', 'Exemptions rare and expensive'],
    noiseRestrictions: [
      'Very noise-sensitive country',
      'Noise-based landing fees',
      'Preferred runways for noise abatement',
    ],
    specialRequirements: [
      'Expensive landing and handling fees',
      'Multilingual operations (German, French, Italian)',
      'High service standards expected',
    ],
    handlingAgents: ['Jet Aviation', 'Swiss Port', 'PrivatPort'],
    regulatoryAuthority: {
      name: 'Federal Office of Civil Aviation (FOCA)',
      website: 'https://www.bazl.admin.ch',
    },
  },
  {
    id: 'sa',
    countryName: 'Saudi Arabia',
    countryCode: 'SA',
    region: 'Middle East',
    overflightPermit: {
      required: true,
      advanceNoticeHours: 48,
      validityDays: 7,
      estimatedCost: '$300-500 USD',
      applicationProcess: 'Submit via handling agent 48hrs minimum. No Israeli-registered aircraft permitted. Requires detailed flight plan.',
    },
    landingPermit: {
      required: true,
      restrictions: ['Very strict approval process', 'Religious and cultural sensitivity required', 'Crew visas mandatory'],
      approvedAirports: ['OERK (Riyadh)', 'OEJN (Jeddah)', 'OEDF (Dammam)'],
    },
    customsImmigration: [
      'Visa required for all crew and passengers (arrange well in advance)',
      'No alcohol permitted',
      'Conservative dress code enforced',
      'Women travelers: check current regulations',
    ],
    curfews: [],
    noiseRestrictions: [],
    specialRequirements: [
      'Absolutely no Israeli aircraft or connections',
      'Cultural sensitivity training recommended',
      'Friday prayer times: operations may be restricted',
      'Ramadan: special considerations',
      'Excellent handling services at major airports',
    ],
    handlingAgents: ['Saudi Private Aviation', 'ExecuJet Middle East', 'Universal Aviation'],
    regulatoryAuthority: {
      name: 'General Authority of Civil Aviation (GACA)',
      website: 'https://www.gaca.gov.sa',
    },
  },
  {
    id: 'fr',
    countryName: 'France',
    countryCode: 'FR',
    region: 'Europe',
    overview:
      'Major EU business-aviation market under EASA rules with strong noise and environmental policies. EU AOC operators enjoy broad rights; non-EU charters need traffic rights and careful planning.',
    overflightPermit: {
      required: false,
      advanceNoticeHours: 0,
      validityDays: 0,
      estimatedCost: 'N/A',
      applicationProcess: 'No permit required. Standard EUROCONTROL flight planning.',
    },
    landingPermit: {
      required: true,
      restrictions: ['Paris airports require advance authorization', 'Slot system at major airports'],
      approvedAirports: ['LFPB (Le Bourget)', 'LFPG (Charles de Gaulle)', 'LFPO (Orly)', 'LFMN (Nice)'],
    },
    customsImmigration: [
      'Schengen area - simplified for EU flights',
      'APISFile required for non-Schengen arrivals',
      'Excellent GA facilities at Le Bourget',
    ],
    curfews: ['Paris airports: Night restrictions apply', 'Provincial airports: Often 23:00-07:00'],
    noiseRestrictions: ['Strict noise quotas at Paris area airports', 'Chapter 4 aircraft preferred'],
    specialRequirements: [
      'French customs can be thorough',
      'VAT implications for positioning flights',
      'EU operators have preferential treatment',
      'Strike risk - always have backup plans',
    ],
    handlingAgents: ['Signature Flight Support', 'ExecuJet', 'Universal Aviation'],
    regulatoryAuthority: {
      name: 'Direction Générale de l\'Aviation Civile (DGAC)',
      website: 'https://www.ecologie.gouv.fr/aviation-civile',
    },
  },
  {
    id: 'it',
    countryName: 'Italy',
    countryCode: 'IT',
    region: 'Europe',
    overview:
      'EASA- and ENAC-regulated environment with Schengen border rules. EU operators have broad access; non-EU charter must secure traffic rights and respect domestic cabotage limitations.',
    overflightPermit: {
      required: false,
      advanceNoticeHours: 0,
      validityDays: 0,
      estimatedCost: 'N/A',
      applicationProcess:
        'No specific overflight permit required for most civil operators with traffic rights; flights are planned via EUROCONTROL.',
    },
    landingPermit: {
      required: true,
      restrictions: [
        'Non-EU commercial operators generally require ENAC traffic rights/charter permits.',
        'Slots or PPR are common at city and resort airports, especially in summer.',
      ],
      approvedAirports: ['LIRA (Rome Ciampino)', 'LIML (Milan Linate)', 'LIRF (Rome Fiumicino)', 'LIPZ (Venice)', 'LIEO (Olbia)'],
    },
    privateOpsNotes: [
      'Private non-revenue operations from Schengen and most partner states generally do not need landing permits beyond airport PPR/slot requirements.',
      'Schengen immigration is handled at first entry/last exit; domestic Italian legs between Schengen points typically avoid border formalities.',
    ],
    charterOpsNotes: [
      'EU AOC holders can usually operate commercial flights to, from and within Italy under EU air services regulation.',
      'Non-EU charter operators must obtain ENAC authorisations in line with bilateral agreements and should allow several business days for processing.',
    ],
    cabotageNotes: [
      'Non-EU charter operators cannot freely offer domestic Italian revenue flights (e.g. Rome–Milan) without specific traffic rights.',
      'Private foreign owners may fly domestic itineraries with company personnel on a non-revenue basis.',
    ],
    riskNotes: [
      'Operational risk is mainly around summer capacity constraints at leisure airports and correct classification of commercial vs private flights.',
    ],
    customsImmigration: [
      'Italy is in the Schengen area; first entry from non-Schengen involves passport control and customs inspection.',
      'Many airports offer GA handling with separate facilities for business aviation.',
    ],
    curfews: ['Noise and night restrictions at Rome Ciampino, Milan Linate and some regional airports.'],
    noiseRestrictions: ['EU noise rules apply; Chapter 3/4 aircraft accepted, but older noisy types can face restrictions or surcharges.'],
    specialRequirements: ['Summer slots and parking at Mediterranean resorts can be extremely limited—book early.'],
    handlingAgents: ['Universal Aviation Italy', 'Signature Flight Support', 'Local ENAC-approved handlers'],
    regulatoryAuthority: {
      name: 'Ente Nazionale Aviazione Civile (ENAC)',
      website: 'https://www.enac.gov.it',
    },
  },
  {
    id: 'de',
    countryName: 'Germany',
    countryCode: 'DE',
    region: 'Europe',
    overview:
      'LBA- and EASA-regulated market with stringent noise and night-curfew rules at major hubs. EU charter enjoys open access; non-EU operators need traffic rights and TCO approval.',
    overflightPermit: {
      required: false,
      advanceNoticeHours: 0,
      validityDays: 0,
      estimatedCost: 'N/A',
      applicationProcess: 'Standard EUROCONTROL overflight planning within the EU.',
    },
    landingPermit: {
      required: true,
      restrictions: [
        'Non-EU charter operators must obtain German traffic rights consistent with bilateral agreements.',
        'Slots and strict curfews apply at several major airports, including Frankfurt and Munich.',
      ],
      approvedAirports: ['EDDF (Frankfurt)', 'EDDM (Munich)', 'EDDB (Berlin)', 'EDDH (Hamburg)', 'EDDW (Bremen)'],
    },
    privateOpsNotes: [
      'Private non-revenue flights from most ICAO states are handled without special landing permits, aside from slots and airport PPR.',
      'Schengen rules apply for immigration; customs normally at first external entry point.',
    ],
    charterOpsNotes: [
      'EU AOC operators may serve Germany freely for commercial traffic.',
      'Non-EU charter operators must hold EU TCO approval and relevant traffic rights; authorisations should be requested in advance from LBA.',
    ],
    cabotageNotes: [
      'Non-EU commercial operators are generally barred from purely domestic German revenue services without explicit rights.',
      'Private foreign operators may conduct domestic business itineraries on a non-revenue basis.',
    ],
    riskNotes: [
      'Germany enforces noise, curfew and illegal-charter rules vigorously, particularly at large international airports.',
    ],
    customsImmigration: [
      'Schengen external border controls at first entry; GA terminals available at major business airports.',
    ],
    curfews: ['Strict night curfews at Frankfurt, Munich and many regional airports.'],
    noiseRestrictions: ['Noise quotas, runway preferences and surcharges at major airports; Chapter 4 aircraft preferred.'],
    specialRequirements: ['Expect extensive slot and parking management at large hubs; consider secondary airports for GA where appropriate.'],
    handlingAgents: ['Signature Flight Support', 'Jet Aviation', 'Local FBOs'],
    regulatoryAuthority: {
      name: 'Luftfahrt-Bundesamt (LBA)',
      website: 'https://www.lba.de',
    },
  },
  {
    id: 'ca',
    countryName: 'Canada',
    countryCode: 'CA',
    region: 'Americas',
    overview:
      'Transport Canada- and CTA-regulated environment with CBSA border controls. Private foreign GA is relatively straightforward; foreign charter requires licensing and has cabotage limits.',
    overflightPermit: {
      required: false,
      advanceNoticeHours: 0,
      validityDays: 0,
      estimatedCost: 'N/A',
      applicationProcess: 'Most civil operators with traffic rights overfly Canada using standard ATC flight plans and Nav Canada arrangements.',
    },
    landingPermit: {
      required: false,
      restrictions: ['Charter operators need Canadian Transportation Agency economic authority and Transport Canada approvals.'],
      approvedAirports: ['All major international and regional airports designated for GA and customs clearance'],
    },
    privateOpsNotes: [
      'Private non-revenue flights from the US and other partner states normally do not require landing permits but must comply with CBSA procedures.',
      'Advance notification through CANPASS or CBSA channels is required; provide passenger and crew details and planned arrival times.',
    ],
    charterOpsNotes: [
      'Non-Canadian operators conducting commercial services to/from Canada usually require a CTA licence and TCCA operational approvals.',
      'US operators benefit from open-skies arrangements but still must respect cabotage prohibitions.',
    ],
    cabotageNotes: [
      'Non-Canadian charter operators may not normally carry revenue passengers solely between Canadian points.',
      'Private foreign operators may operate domestic legs on non-revenue basis with owners/guests onboard.',
    ],
    riskNotes: [
      'CBSA is strict on customs declarations; CTA/TCCA can sanction unauthorised commercial operations.',
    ],
    customsImmigration: [
      'Use designated airports of entry and follow CANPASS/CBSA arrival procedures.',
      'Electronic travel authorisation (eTA) or visas required for many nationalities.',
    ],
    curfews: ['Curfew and noise rules at certain urban airports; check local AIP entries.'],
    noiseRestrictions: ['Noise abatement and preferential runway procedures at major hubs such as Toronto and Vancouver.'],
    specialRequirements: ['Winter operations require attention to de-icing and cold-weather performance planning.'],
    handlingAgents: ['Skyservice', 'Signature Flight Support', 'Local FBOs'],
    regulatoryAuthority: {
      name: 'Transport Canada Civil Aviation / Canadian Transportation Agency',
      website: 'https://tc.canada.ca',
    },
  },
  {
    id: 'au',
    countryName: 'Australia',
    countryCode: 'AU',
    region: 'Asia-Pacific',
    overview:
      'CASA-regulated environment with strong biosecurity, immigration and cabotage controls. Private access is manageable; commercial services are tightly controlled by bilateral agreements.',
    overflightPermit: {
      required: false,
      advanceNoticeHours: 0,
      validityDays: 0,
      estimatedCost: 'N/A',
      applicationProcess: 'Most overflights are conducted under bilateral rights via ATC flight plans; specific permits may be required in unusual cases.',
    },
    landingPermit: {
      required: true,
      restrictions: [
        'Commercial services by foreign operators require traffic rights and Australian approvals.',
        'Certain remote or defence-related aerodromes require additional permissions.',
      ],
      approvedAirports: ['YSSY (Sydney)', 'YMML (Melbourne)', 'YBBN (Brisbane)', 'YPAD (Adelaide)', 'YPPH (Perth)'],
    },
    privateOpsNotes: [
      'Private GA visitors must comply with Australian Border Force and Department of Agriculture biosecurity requirements.',
      'Advance passenger data and visas (or ETA) are required for most nationalities.',
    ],
    charterOpsNotes: [
      'Foreign charter operators must hold appropriate authorisations under air-services agreements and approvals from Australian regulators.',
      'Domestic carriage on foreign AOCs is highly restricted and usually prohibited absent specific permissions.',
    ],
    cabotageNotes: [
      'Foreign carriers cannot generally offer domestic Australian revenue flights between cities.',
    ],
    riskNotes: [
      'Authorities are very strict on immigration, quarantine and commercial-authority breaches.',
    ],
    customsImmigration: [
      'Expect rigorous customs, immigration and biosecurity inspections on arrival.',
      'Declare all food, plant, and animal products; fines for non-compliance can be significant.',
    ],
    curfews: ['Sydney and some other airports have night curfews and slot systems; plan arrivals/departures carefully.'],
    noiseRestrictions: ['Noise abatement procedures apply at major airports; older noisy aircraft may be constrained.'],
    specialRequirements: ['Long-range flights require careful fuel and diversion planning due to geography and sparse alternates in some regions.'],
    handlingAgents: ['ExecuJet Australia', 'Universal Aviation', 'Local FBOs'],
    regulatoryAuthority: {
      name: 'Civil Aviation Safety Authority (CASA)',
      website: 'https://www.casa.gov.au',
    },
  },
  {
    id: 'gr',
    countryName: 'Greece',
    countryCode: 'GR',
    region: 'Europe',
    overview:
      'Schengen/EASA member with heavy seasonal demand at island airports. EU operators enjoy broad rights; non-EU charter must manage permits and constrained slots/parking.',
    overflightPermit: {
      required: false,
      advanceNoticeHours: 0,
      validityDays: 0,
      estimatedCost: 'N/A',
      applicationProcess: 'Standard EUROCONTROL flight planning applies for most operators.',
    },
    landingPermit: {
      required: true,
      restrictions: [
        'Non-EU commercial operators typically require HCAA charter approvals consistent with bilateral rights.',
        'PPR, slots and parking restrictions at popular island airports, especially in summer.',
      ],
      approvedAirports: ['LGAV (Athens)', 'LGMK (Mykonos)', 'LGSR (Santorini)', 'LGIR (Heraklion)', 'LGTS (Thessaloniki)'],
    },
    privateOpsNotes: [
      'Private non-revenue flights from Schengen and allied states normally do not require landing permits beyond airport coordination.',
      'Plan well ahead for summer leisure destinations due to limited parking and congestion.',
    ],
    charterOpsNotes: [
      'EU AOC holders can serve Greece under EU air services rules.',
      'Non-EU charter must secure HCAA approvals; series or repetitive charters may be closely examined.',
    ],
    cabotageNotes: [
      'Non-EU charter operators are restricted from domestic Greek revenue services without specific rights.',
    ],
    riskNotes: [
      'Operational bottlenecks at island airports (parking, crew accommodation) can be a greater risk than regulatory surprises.',
    ],
    customsImmigration: [
      'Greece is in the Schengen area; external border control occurs at first entry.',
    ],
    curfews: ['Some island airports restrict night operations; check NOTAMs and AIP.',
    ],
    noiseRestrictions: ['Noise procedures at Athens and tourist airports; Chapter 3/4 aircraft standard.'],
    specialRequirements: ['High season may require repositioning the aircraft out of constrained island airports due to lack of parking.'],
    handlingAgents: ['Goldair Handling', 'Skyserv', 'Local FBOs'],
    regulatoryAuthority: {
      name: 'Hellenic Civil Aviation Authority (HCAA)',
      website: 'https://hcaa.gov.gr',
    },
  },
  {
    id: 'pt',
    countryName: 'Portugal',
    countryCode: 'PT',
    region: 'Europe',
    overview:
      'EASA member with Atlantic gateways and leisure traffic. EU carriers operate freely; non-EU charter must secure traffic rights through ANAC.',
    overflightPermit: {
      required: false,
      advanceNoticeHours: 0,
      validityDays: 0,
      estimatedCost: 'N/A',
      applicationProcess: 'Overflights are handled via EUROCONTROL planning; no dedicated permit for most flights.',
    },
    landingPermit: {
      required: true,
      restrictions: [
        'Non-EU commercial operators generally require ANAC approvals in line with bilateral agreements.',
        'Slots/PPR at Lisbon, Porto, Faro and Madeira, especially in summer.',
      ],
      approvedAirports: ['LPPT (Lisbon)', 'LPPR (Porto)', 'LPFR (Faro)', 'LPMA (Madeira/Funchal)'],
    },
    privateOpsNotes: [
      'Private non-revenue traffic from Schengen and partner states typically does not need landing permits, aside from slots and customs at first entry.',
    ],
    charterOpsNotes: [
      'EU AOC operators may serve Portugal freely for commercial traffic.',
      'Non-EU operators need ANAC traffic rights; allow several business days, more around peak seasons.',
    ],
    cabotageNotes: [
      'Non-EU charter operators cannot normally operate domestic revenue legs (e.g. Lisbon–Faro) without specific rights.',
    ],
    riskNotes: [
      'Operational risk is mainly around capacity constraints and weather at Madeira and other Atlantic airports.',
    ],
    customsImmigration: [
      'Portugal is in Schengen; immigration occurs at first point of entry.',
    ],
    curfews: ['Some airports have night noise restrictions and slot controls.'],
    noiseRestrictions: ['Standard EU noise rules and local procedures.',
    ],
    specialRequirements: ['Atlantic weather and crosswinds at Madeira require careful airport/crew selection.'],
    handlingAgents: ['Portway, Groundforce, local GA handlers'],
    regulatoryAuthority: {
      name: 'Autoridade Nacional da Aviação Civil (ANAC)',
      website: 'https://www.anac.pt',
    },
  },
  {
    id: 'se',
    countryName: 'Sweden',
    countryCode: 'SE',
    region: 'Europe',
    overview:
      'Transportstyrelsen- and EASA-governed market with strong environmental focus. EU operators have broad rights; non-EU charter must navigate TCO and traffic rights.',
    overflightPermit: {
      required: false,
      advanceNoticeHours: 0,
      validityDays: 0,
      estimatedCost: 'N/A',
      applicationProcess: 'Standard EUROCONTROL planning; standalone overflight permits are rarely required for civil traffic.',
    },
    landingPermit: {
      required: true,
      restrictions: [
        'Non-EU commercial operators require appropriate traffic rights and EU TCO approval.',
      ],
      approvedAirports: ['ESSA (Stockholm Arlanda)', 'ESGG (Gothenburg)', 'ESMS (Malmö)'],
    },
    privateOpsNotes: [
      'Private non-revenue flights from Schengen and partner states usually do not require landing permits; normal Schengen entry rules apply.',
      'Winter operations may involve significant de-icing and performance planning.',
    ],
    charterOpsNotes: [
      'EU AOC holders may operate commercial flights into and within Sweden under EU air services law.',
      'Non-EU charter operators must hold EU TCO approval and obtain traffic rights where required.',
    ],
    cabotageNotes: [
      'Non-EU charter operators are not allowed to operate Swedish domestic revenue services absent explicit cabotage rights.',
    ],
    riskNotes: [
      'Public and political scrutiny of business aviation emissions is relatively high; expect ongoing policy changes around sustainability.',
    ],
    customsImmigration: [
      'Schengen entry; GA typically clears through designated ports with immigration and customs presence.',
    ],
    curfews: ['Some airports have night noise restrictions; check local AIP and NOTAMs.'],
    noiseRestrictions: ['EU noise rules apply; additional local environmental constraints may evolve.'],
    specialRequirements: ['Plan for winter-weather alternates and adequate de-icing capacity during colder months.'],
    handlingAgents: ['Swedavia-affiliated handlers', 'Local GA service providers'],
    regulatoryAuthority: {
      name: 'Transportstyrelsen (Swedish Transport Agency)',
      website: 'https://transportstyrelsen.se',
    },
  },
];

// Airport-Specific Requirements
export const airportRequirements: AirportRequirement[] = [
  {
    icao: 'EGLL',
    name: 'London Heathrow',
    specialRequirements: ['Slot required - advanced booking essential', 'Very expensive landing fees', 'Limited GA parking'],
    slotRequired: true,
    priorPermissionRequired: true,
    handlingAgentMandatory: true,
    curfew: { start: '23:00', end: '06:00' },
    notes: [
      'Busiest 2-runway airport in world - delays common',
      'Prefer EGLF Farnborough or EGKB Biggin Hill for GA',
      'Security procedures very strict',
    ],
  },
  {
    icao: 'LFPG',
    name: 'Paris Charles de Gaulle',
    specialRequirements: ['Prior permission required for GA', 'Prefer LFPB Le Bourget for business aviation'],
    slotRequired: true,
    priorPermissionRequired: true,
    handlingAgentMandatory: true,
    curfew: { start: '23:30', end: '06:00' },
    notes: [
      'Le Bourget (LFPB) is primary GA airport for Paris',
      'CDG fees very high for GA aircraft',
      'Complex taxi procedures',
    ],
  },
  {
    icao: 'OMDB',
    name: 'Dubai International',
    specialRequirements: ['Handling agent mandatory', 'Security screening comprehensive'],
    slotRequired: true,
    priorPermissionRequired: true,
    handlingAgentMandatory: true,
    notes: [
      'World-class FBO facilities',
      'Very efficient operations',
      'Consider OMDW Al Maktoum for more flexibility',
      'Fuel competitive pricing',
    ],
  },
  {
    icao: 'LSZH',
    name: 'Zurich Airport',
    specialRequirements: ['Slot required', 'Very noise-sensitive'],
    slotRequired: true,
    priorPermissionRequired: true,
    handlingAgentMandatory: true,
    curfew: { start: '23:00', end: '06:00' },
    notes: [
      'Strict noise abatement procedures',
      'High landing fees',
      'Excellent service standards',
      'Night curfew strictly enforced',
    ],
  },
];
