export interface CityCoordinate {
  lat: number;
  lng: number;
}

interface CityEntry {
  name: string;
  lat: number;
  lng: number;
  aliases?: string[];
}

const CITY_ENTRIES: CityEntry[] = [
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194, aliases: ['SF'] },
  { name: 'Palo Alto', lat: 37.4419, lng: -122.143 },
  { name: 'Menlo Park', lat: 37.45296, lng: -122.18172 },
  { name: 'Mountain View', lat: 37.3861, lng: -122.0839 },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, aliases: ['LA'] },
  { name: 'Seattle', lat: 47.6062, lng: -122.3321 },
  { name: 'Portland', lat: 45.5152, lng: -122.6784 },
  { name: 'Vancouver', lat: 49.2827, lng: -123.1207 },
  { name: 'Toronto', lat: 43.65107, lng: -79.347015 },
  { name: 'Montreal', lat: 45.5017, lng: -73.5673 },
  { name: 'Boston', lat: 42.3601, lng: -71.0589 },
  { name: 'New York', lat: 40.7128, lng: -74.006, aliases: ['NYC', 'New York City'] },
  { name: 'Washington', lat: 38.9072, lng: -77.0369, aliases: ['Washington DC', 'DC'] },
  { name: 'Miami', lat: 25.7617, lng: -80.1918 },
  { name: 'Austin', lat: 30.2672, lng: -97.7431 },
  { name: 'Dallas', lat: 32.7767, lng: -96.797 },
  { name: 'Houston', lat: 29.7604, lng: -95.3698 },
  { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
  { name: 'Denver', lat: 39.7392, lng: -104.9903 },
  { name: 'Atlanta', lat: 33.749, lng: -84.388 },
  { name: 'Salt Lake City', lat: 40.7608, lng: -111.891 },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Edinburgh', lat: 55.9533, lng: -3.1883 },
  { name: 'Dublin', lat: 53.3498, lng: -6.2603 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Berlin', lat: 52.52, lng: 13.405 },
  { name: 'Munich', lat: 48.1351, lng: 11.582 },
  { name: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
  { name: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
  { name: 'Brussels', lat: 50.8503, lng: 4.3517 },
  { name: 'Zurich', lat: 47.3769, lng: 8.5417 },
  { name: 'Geneva', lat: 46.2044, lng: 6.1432 },
  { name: 'Luxembourg', lat: 49.6116, lng: 6.13 },
  { name: 'Stockholm', lat: 59.3293, lng: 18.0686 },
  { name: 'Copenhagen', lat: 55.6761, lng: 12.5683 },
  { name: 'Oslo', lat: 59.9139, lng: 10.7522 },
  { name: 'Helsinki', lat: 60.1699, lng: 24.9384 },
  { name: 'Madrid', lat: 40.4168, lng: -3.7038 },
  { name: 'Barcelona', lat: 41.3851, lng: 2.1734 },
  { name: 'Lisbon', lat: 38.7223, lng: -9.1393 },
  { name: 'Milan', lat: 45.4642, lng: 9.19 },
  { name: 'Rome', lat: 41.9028, lng: 12.4964 },
  { name: 'Tel Aviv', lat: 32.0853, lng: 34.7818 },
  { name: 'Jerusalem', lat: 31.7683, lng: 35.2137 },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { name: 'Abu Dhabi', lat: 24.4539, lng: 54.3773 },
  { name: 'Riyadh', lat: 24.7136, lng: 46.6753 },
  { name: 'Doha', lat: 25.2854, lng: 51.531 },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777, aliases: ['Bombay'] },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, aliases: ['Bangalore'] },
  { name: 'New Delhi', lat: 28.6139, lng: 77.209 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { name: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
  { name: 'Shanghai', lat: 31.2304, lng: 121.4737 },
  { name: 'Beijing', lat: 39.9042, lng: 116.4074 },
  { name: 'Shenzhen', lat: 22.5431, lng: 114.0579 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'Osaka', lat: 34.6937, lng: 135.5023 },
  { name: 'Seoul', lat: 37.5665, lng: 126.978 },
  { name: 'Busan', lat: 35.1796, lng: 129.0756 },
  { name: 'Taipei', lat: 25.033, lng: 121.5654, aliases: ['Taipei City'] },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'Melbourne', lat: -37.8136, lng: 144.9631 },
  { name: 'Brisbane', lat: -27.4698, lng: 153.0251 },
  { name: 'Auckland', lat: -36.8485, lng: 174.7633 },
  { name: 'Johannesburg', lat: -26.2041, lng: 28.0473 },
  { name: 'Cape Town', lat: -33.9249, lng: 18.4241 },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333, aliases: ['Sao Paulo'] },
  { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
  { name: 'Mexico City', lat: 19.4326, lng: -99.1332 },
  { name: 'Bogotá', lat: 4.711, lng: -74.0721, aliases: ['Bogota'] },
  { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816 },
  { name: 'Santiago', lat: -33.4489, lng: -70.6693 },
  { name: 'Lagos', lat: 6.5244, lng: 3.3792 },
  { name: 'Nairobi', lat: -1.2921, lng: 36.8219 },
];

const CITY_MAP = new Map<string, CityCoordinate>();

const normalizeName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ');

CITY_ENTRIES.forEach(({ name, lat, lng, aliases }) => {
  const normalized = normalizeName(name);
  CITY_MAP.set(normalized, { lat, lng });
  if (aliases) {
    aliases.forEach((alias) => {
      CITY_MAP.set(normalizeName(alias), { lat, lng });
    });
  }
});

const COUNTRY_FALLBACK_CITY: Record<string, string> = {
  'United States of America': 'San Francisco',
  'Canada': 'Toronto',
  'United Kingdom': 'London',
  'Ireland': 'Dublin',
  'France': 'Paris',
  'Germany': 'Berlin',
  'Netherlands': 'Amsterdam',
  'Belgium': 'Brussels',
  'Switzerland': 'Zurich',
  'Spain': 'Madrid',
  'Portugal': 'Lisbon',
  'Italy': 'Milan',
  'Israel': 'Tel Aviv',
  'United Arab Emirates': 'Dubai',
  'Saudi Arabia': 'Riyadh',
  'Qatar': 'Doha',
  'India': 'Bengaluru',
  'Singapore': 'Singapore',
  'Hong Kong': 'Hong Kong',
  'China': 'Shanghai',
  'Japan': 'Tokyo',
  'South Korea': 'Seoul',
  'Taiwan': 'Taipei',
  'Australia': 'Sydney',
  'New Zealand': 'Auckland',
  'Brazil': 'São Paulo',
  'Argentina': 'Buenos Aires',
  'Chile': 'Santiago',
  'Mexico': 'Mexico City',
  'Colombia': 'Bogotá',
  'South Africa': 'Cape Town',
  'Kenya': 'Nairobi',
  'Nigeria': 'Lagos',
};

export const resolveCityCoordinates = (input: string): CityCoordinate | null => {
  if (!input) return null;
  const normalized = normalizeName(input.split(',')[0]);
  return CITY_MAP.get(normalized) ?? null;
};

export const fallbackCityForCountry = (country: string): string | null => {
  if (!country) return null;
  return COUNTRY_FALLBACK_CITY[country] ?? null;
};

export const availableCities = () => Array.from(new Set(CITY_MAP.keys()));
