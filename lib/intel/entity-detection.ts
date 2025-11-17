const ICAO_REGEX = /\b[A-Z0-9]{4}\b/g;
const ICAO_STOPWORDS = new Set([
  'THIS',
  'THAT',
  'WITH',
  'FROM',
  'WILL',
  'HAVE',
  'YOUR',
  'NEED',
  'WHEN',
  'WHAT',
  'GOOD',
  'TIME',
  'GIVE',
  'FLEET',
  'SHOW',
  'PLEASE',
  'ICAO',
]);

const OPERATOR_KEYWORDS = [
  // Global / Pan-European brands
  { slug: 'netjets', variants: ['netjets', 'net jets'] },
  { slug: 'vistajet', variants: ['vistajet', 'vista jet'] },
  { slug: 'luxaviation', variants: ['luxaviation'] },
  { slug: 'flexjet', variants: ['flexjet', 'flex jet'] },

  // US & North America
  { slug: 'wheels-up', variants: ['wheelsup', 'wheels up'] },
  { slug: 'xo', variants: ['xo', 'xojet', 'xo jet'] },
  { slug: 'jet-linx', variants: ['jetlinx', 'jet linx'] },
  { slug: 'planesense', variants: ['planesense', 'plane sense'] },
  { slug: 'airshare', variants: ['airshare', 'air share'] },
  { slug: 'flyexclusive', variants: ['flyexclusive', 'fly exclusive'] },
  { slug: 'solairus', variants: ['solairus', 'solairus aviation'] },
  { slug: 'clay-lacy', variants: ['clay lacy'] },
  { slug: 'jet-aviation', variants: ['jet aviation'] },
  { slug: 'gama-aviation', variants: ['gama aviation'] },
  { slug: 'contour-aviation', variants: ['contour aviation'] },
  { slug: 'priester-aviation', variants: ['priester aviation'] },
  { slug: 'executive-jet-management', variants: ['executive jet management', 'ejm'] },
  { slug: 'jet-edge', variants: ['jet edge'] },
  { slug: 'nicholas-air', variants: ['nicholas air'] },
  { slug: 'grandview-aviation', variants: ['grandview aviation', 'grand view aviation'] },

  // Europe & UK
  { slug: 'air-hamburg', variants: ['air hamburg'] },
  { slug: 'globeair', variants: ['globeair', 'globe air'] },
  { slug: 'execujet', variants: ['execujet', 'execujet europe', 'execujet middle east', 'execujet asia'] },
  { slug: 'tag-aviation', variants: ['tag aviation'] },
  { slug: 'jetfly', variants: ['jetfly', 'jet fly'] },
  { slug: 'elitavia', variants: ['elitavia', "elit'avia"] },
  { slug: 'comlux', variants: ['comlux'] },
  { slug: 'london-executive-aviation', variants: ['london executive aviation'] },
  { slug: 'avcon-jet', variants: ['avcon jet'] },
  { slug: 'gainjet', variants: ['gainjet', 'gain jet'] },
  { slug: 'gestair', variants: ['gestair'] },
  { slug: 'asl-group', variants: ['asl group'] },
  { slug: 'flyinggroup', variants: ['flyinggroup', 'flying group'] },
  { slug: 'saxonair', variants: ['saxonair', 'saxon air'] },
  { slug: 'platoon-aviation', variants: ['platoon aviation'] },

  // Malta / AirX
  { slug: 'airx-charter', variants: ['airx', 'airx charter', 'air x charter'] },

  // Middle East & Africa
  { slug: 'qatar-executive', variants: ['qatar executive'] },
  { slug: 'emirates-executive', variants: ['emirates executive'] },
  { slug: 'saudia-private-aviation', variants: ['saudia private aviation'] },
  { slug: 'jetex', variants: ['jetex'] },
  { slug: 'royal-jet', variants: ['royal jet'] },
  { slug: 'empire-aviation', variants: ['empire aviation'] },
  { slug: 'nasjet', variants: ['nasjet', 'nas jet'] },
  { slug: 'dc-aviation', variants: ['dc aviation', 'dc aviation al-futtaim'] },
  { slug: 'nac', variants: ['national airways corporation', 'nac'] },
  { slug: 'absolute-aviation', variants: ['absolute aviation'] },

  // Asia-Pacific
  { slug: 'tag-aviation-asia', variants: ['tag aviation asia'] },
  { slug: 'sino-jet', variants: ['sinojet', 'sino jet'] },
  { slug: 'hk-bellawings', variants: ['hk bellawings', 'bellawings'] },
  { slug: 'deer-jet', variants: ['deer jet'] },
  { slug: 'china-minsheng-jet', variants: ['china minsheng jet', 'cmjet'] },
  { slug: 'metrojet', variants: ['metrojet'] },
  { slug: 'philjets', variants: ['philjets', 'phil jets'] },
];

export type EntityType = 'airport' | 'operator' | 'unknown';

export interface EntityDetectionResult {
  entityType: EntityType;
  entityIdGuess?: string;
  confidence: number;
}

export function detectEntityFromQuery(query: string): EntityDetectionResult {
  const text = query || '';
  const airportCandidates = extractIcaoCandidates(text);
  if (airportCandidates.length > 0) {
    return {
      entityType: 'airport',
      entityIdGuess: airportCandidates[0],
      confidence: airportCandidates.length === 1 ? 0.92 : 0.75,
    };
  }

  const normalized = text.toLowerCase();
  for (const operator of OPERATOR_KEYWORDS) {
    if (operator.variants.some((variant) => normalized.includes(variant))) {
      return {
        entityType: 'operator',
        entityIdGuess: operator.slug,
        confidence: 0.65,
      };
    }
  }

  return {
    entityType: 'unknown',
    confidence: 0,
  };
}

export function extractIcaoCandidates(text: string): string[] {
  if (!text) return [];
  const uppercaseText = text.toUpperCase();
  const matches = uppercaseText.match(ICAO_REGEX) || [];
  const results: string[] = [];

  for (const match of matches) {
    const candidate = match.toUpperCase();
    if (ICAO_STOPWORDS.has(candidate)) {
      continue;
    }
    if (!text.includes(candidate)) {
      // Only include lowercase matches if the candidate is explicitly referenced using ICAO prefix notation
      const lowerCandidate = candidate.toLowerCase();
      const containsLower = text.includes(lowerCandidate);
      if (!containsLower) {
        continue;
      }
    }
    if (!/^[A-Z0-9]{4}$/.test(candidate)) {
      continue;
    }
    if (!results.includes(candidate)) {
      results.push(candidate);
    }
  }

  return results;
}
