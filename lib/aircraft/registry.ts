const prefixCountryPairs: Array<{ pattern: string; country: string }> = [
  { pattern: '9H', country: 'MT' },
  { pattern: 'A6', country: 'AE' },
  { pattern: 'A7', country: 'QA' },
  { pattern: 'CFA', country: 'CA' },
  { pattern: 'CF', country: 'CA' },
  { pattern: 'CG', country: 'CA' },
  { pattern: 'CI', country: 'CA' },
  { pattern: 'CS', country: 'PT' },
  { pattern: 'CSL', country: 'PT' },
  { pattern: 'CSN', country: 'PT' },
  { pattern: 'CSZ', country: 'PT' },
  { pattern: 'CSO', country: 'PT' },
  { pattern: 'D', country: 'DE' },
  { pattern: 'EC', country: 'ES' },
  { pattern: 'EI', country: 'IE' },
  { pattern: 'ES', country: 'FI' },
  { pattern: 'F', country: 'FR' },
  { pattern: 'G', country: 'GB' },
  { pattern: 'HB', country: 'CH' },
  { pattern: 'HZ', country: 'SA' },
  { pattern: 'I', country: 'IT' },
  { pattern: 'LX', country: 'LU' },
  { pattern: 'N', country: 'US' },
  { pattern: 'OE', country: 'AT' },
  { pattern: 'OO', country: 'BE' },
  { pattern: 'OK', country: 'CZ' },
  { pattern: 'OY', country: 'DK' },
  { pattern: 'P4', country: 'NL' },
  { pattern: 'PH', country: 'NL' },
  { pattern: 'PP', country: 'BR' },
  { pattern: 'PR', country: 'BR' },
  { pattern: 'PS', country: 'BR' },
  { pattern: 'PT', country: 'BR' },
  { pattern: 'TF', country: 'IS' },
  { pattern: 'VH', country: 'AU' },
  { pattern: 'VT', country: 'IN' },
  { pattern: 'ZK', country: 'NZ' }
].sort((a, b) => b.pattern.length - a.pattern.length);

const sanitize = (value: string) => value.replace(/[^A-Z0-9]/gi, '').toUpperCase();

export function normalizeTailNumber(raw?: string | null): string | null {
  if (!raw) return null;
  const normalized = raw.trim().toUpperCase();
  const cleaned = normalized.replace(/[^A-Z0-9-]/g, '').replace(/--+/g, '-');
  return cleaned.length ? cleaned : null;
}

export function inferRegistryCountryCode(tailNumber?: string | null): string | null {
  if (!tailNumber) return null;
  const normalized = sanitize(tailNumber);
  if (!normalized) return null;

  const match = prefixCountryPairs.find(({ pattern }) => normalized.startsWith(pattern));
  return match?.country ?? null;
}

export function describeRegistry(tailNumber?: string | null): {
  tail: string | null;
  registryCountryCode: string | null;
} {
  const tail = normalizeTailNumber(tailNumber);
  const registryCountryCode = inferRegistryCountryCode(tail ?? undefined);
  return { tail, registryCountryCode };
}
