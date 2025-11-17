import type { RestructuredCountryRequirement } from '@/types/compliance';

export const restructuredCountryRequirements: RestructuredCountryRequirement[] = [
  {
    id: 'us',
    countryName: 'United States',
    countryCode: 'US',
    region: 'Americas',
    summary: 'FAA- and DOT-regulated market with strong TSA/CBP overlay. No general landing permit regime for most GA flights, but strict cabotage and economic authority rules for foreign charter operators.',
    silos: [
      {
        category: 'landing',
        items: [
          {
            id: 'us-landing-permit',
            title: 'Landing Permit',
            type: 'kv',
            content: 'No permit required for most private and charter operations.',
            data: {
              'Required': false,
            }
          },
          {
            id: 'us-customs-immigration',
            title: 'Customs & Immigration',
            type: 'list',
            content: [
              'eAPIS (Electronic Advance Passenger Information System) required for international arrivals',
              'CBP advance notification for international flights',
              'General aviation terminals available at major airports',
            ]
          },
          {
            id: 'us-private-ops-landing',
            title: 'Private Operations Notes',
            type: 'list',
            content: [
              'Foreign private, non-revenue flights from most ICAO states generally do not require landing permits but must comply with FAA rules, CBP inspection and TSA security programs where applicable.',
              'Electronic Advance Passenger Information System (eAPIS) filings are mandatory for international arrivals and departures.',
            ]
          }
        ]
      },
      {
        category: 'takeoff',
        items: [
          {
            id: 'us-takeoff-private-ops',
            title: 'Private Operations Notes',
            type: 'list',
            content: [
              'Electronic Advance Passenger Information System (eAPIS) filings are mandatory for international departures.',
            ]
          }
        ]
      },
      {
        category: 'operator',
        items: [
          {
            id: 'us-cabotage',
            title: 'Cabotage Rules',
            type: 'list',
            content: [
              'Foreign commercial operators generally may not carry revenue passengers solely between two US points (cabotage prohibition).',
              'Foreign private operators flying their own personnel on multi-stop business trips may conduct domestic legs provided no compensation is received for transportation.',
              'CBP and DOT can impose substantial fines and deny future access for cabotage violations.',
            ]
          },
          {
            id: 'us-charter-ops',
            title: 'Charter Operations',
            type: 'list',
            content: [
              'Foreign charter/air-taxi operators normally require DOT economic authority (foreign air carrier permit or exemption) and FAA foreign operator approvals before selling flights touching the US.',
              'Once authorised, most routes do not need per-flight landing permits but must stay within approved operations specifications.',
              'US-registered charter operators must comply with Part 135/121 duty limits, maintenance, SMS and training requirements.',
            ]
          },
          {
            id: 'us-risk-notes',
            title: 'Risk & Enforcement',
            type: 'list',
            content: [
              'US authorities are strict on cabotage, illegal charter, APIS/eAPIS non-compliance and security violations.'
            ]
          }
        ]
      },
      {
        category: 'aircraft',
        items: [
          {
            id: 'us-overflight-permit',
            title: 'Overflight Permit',
            type: 'kv',
            content: 'No permit required for domestic operations under Part 135.',
            data: {
              'Required': false,
              'Advance Notice': 'N/A',
              'Cost': 'N/A',
            }
          },
          {
            id: 'us-noise-restrictions',
            title: 'Noise Restrictions',
            type: 'list',
            content: [
              'Stage 3 or higher aircraft required at most major airports.',
              'Older non-compliant Stage 2 aircraft face restrictions or bans at many airports.'
            ]
          }
        ]
      }
    ],
    regulatoryAuthority: {
      name: 'Federal Aviation Administration (FAA)',
      website: 'https://www.faa.gov',
    },
  },
  {
    id: 'gb',
    countryName: 'United Kingdom',
    countryCode: 'GB',
    region: 'Europe',
    summary: 'Post-Brexit UK regime with UK CAA oversight. Private GA flights are relatively straightforward; charter requires UK permits and careful treatment of domestic legs.',
    silos: [
      {
        category: 'landing',
        items: [
          {
            id: 'gb-landing-permit',
            title: 'Landing Permit',
            type: 'kv',
            content: 'Landing permit is required.',
            data: {
              'Required': true,
              'Restrictions': 'Prior Permission Required (PPR) at most business aviation airports'
            }
          },
          {
            id: 'gb-customs-immigration',
            title: 'Customs & Immigration',
            type: 'list',
            content: [
              'Post-Brexit: Full customs and immigration procedures required',
              'eAPIS submission mandatory',
              'GENDEC (General Declaration) required',
              'Animal Health Certificate for pets',
            ]
          },
          {
            id: 'gb-curfews',
            title: 'Curfews',
            type: 'text',
            content: 'Many London-area airports have night restrictions 23:00-07:00 local'
          }
        ]
      },
      {
        category: 'takeoff',
        items: [
           {
            id: 'gb-curfews-takeoff',
            title: 'Curfews',
            type: 'text',
            content: 'Many London-area airports have night restrictions 23:00-07:00 local'
          }
        ]
      },
      {
        category: 'operator',
        items: [
          {
            id: 'gb-special-requirements',
            title: 'Special Requirements for Operators',
            type: 'list',
            content: [
              'Slot required at Heathrow (EGLL)',
              'Landing fees significantly higher post-Brexit',
              'Advanced booking required at most FBOs',
            ]
          },
           {
            id: 'gb-handling-agents',
            title: 'Handling Agents',
            type: 'list',
            content: ['Signature Flight Support', 'Universal Aviation', 'Harrods Aviation']
          }
        ]
      },
      {
        category: 'aircraft',
        items: [
          {
            id: 'gb-overflight-permit',
            title: 'Overflight Permit',
            type: 'kv',
            content: 'No specific permit required for overflight. Standard ICAO procedures apply.',
            data: {
              'Required': false,
            }
          },
          {
            id: 'gb-noise-restrictions',
            title: 'Noise Restrictions',
            type: 'list',
            content: [
              'London airports have strict noise quotas',
              'QC2 or quieter typically required',
            ]
          }
        ]
      }
    ],
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
    summary: 'AFAC-regulated environment with mandatory authorisations for most foreign business aviation. Documentation, especially insurance wording, is scrutinised and cabotage is tightly controlled.',
    silos: [
      {
        category: 'landing',
        items: [
          {
            id: 'mx-landing-permit',
            title: 'Landing Permit',
            type: 'list',
            content: [
              'Foreign private flights generally require an AIU (private flight authorisation) number; enforcement of multi-entry vs single-entry varies by airport.',
              'Foreign charter flights require individual landing permits for each mission and may be limited to specific city pairs.',
            ]
          },
          {
            id: 'mx-customs-immigration',
            title: 'Customs & Immigration',
            type: 'list',
            content: [
              'International arrivals must clear immigration and customs; GA typically uses FBOs at major airports.',
              'Passenger passports and, where applicable, visas must be valid for the planned stay; tourist cards/online authorisations may apply for some nationalities.',
              'Agricultural and customs inspections can be detailed; declare restricted items.',
            ]
          }
        ]
      },
      {
        category: 'takeoff',
        items: []
      },
      {
        category: 'operator',
        items: [
          {
            id: 'mx-cabotage',
            title: 'Cabotage Rules',
            type: 'list',
            content: [
              'Mexico enforces cabotage rules strictly; foreign charter operators may not freely conduct domestic point-to-point services.',
              'Even for private flights, authorities can question itineraries that resemble domestic charter and may require proof of non-revenue intent.',
            ]
          },
          {
            id: 'mx-private-ops',
            title: 'Private Operations',
            type: 'list',
            content: [
              'Since 2024, annual/multiple-entry permissions have largely been replaced by mission-specific AIU authorisations; industry best practice is to obtain a new AIU per trip.',
              'Authorities may request evidence of the relationship between passengers and aircraft owner/operator (e.g., employment letters) to confirm non-revenue status.',
            ]
          },
          {
            id: 'mx-charter-ops',
            title: 'Charter Operations',
            type: 'list',
            content: [
              'Foreign charter flights must obtain AFAC landing permits through a local handler, with typical lead time of 5–10 business days.',
               'Mexican authorities often limit foreign charter patterns, for example allowing one internal leg tightly tied to an international arrival/departure.',
              'Incomplete or inconsistent documentation can result in permit denial or last-minute restrictions to the itinerary.',
            ]
          },
          {
            id: 'mx-risk-notes',
            title: 'Risk & Enforcement',
            type: 'list',
            content: [
              'AFAC is known to detain aircraft on the ramp over documentation issues (insurance wording, permit validity, passenger mismatch).',
              'Local practice can vary from airport to airport; using a reputable Mexican handler is essential.',
            ]
          }
        ]
      },
      {
        category: 'aircraft',
        items: [
          {
            id: 'mx-overflight-permit',
            title: 'Overflight Permit',
            type: 'kv',
            content: 'Overflight permits are filed with AFAC, usually by a local handler or trip-support provider. Expect to submit registration, airworthiness, insurance, crew licences and a proposed route 48–72 hours in advance.',
            data: {
              'Required': true,
              'Advance Notice': '48 hours',
              'Validity': '5 days',
              'Estimated Cost': '$300-700 USD'
            }
          },
          {
            id: 'mx-private-ops-aircraft',
            title: 'Private Operations Notes',
            type: 'text',
            content: 'Insurance certificates must match registration, owner name, aircraft make/model and serial number exactly or permits can be rejected.'
          },
          {
            id: 'mx-noise-restrictions',
            title: 'Noise Restrictions',
            type: 'text',
            content: 'Standard ICAO noise requirements apply; check airport-specific procedures for Mexico City and resort airports.'
          }
        ]
      }
    ],
    regulatoryAuthority: {
      name: 'Agencia Federal de Aviación Civil (AFAC)',
      website: 'https://www.afac.gob.mx',
    },
  },
];
