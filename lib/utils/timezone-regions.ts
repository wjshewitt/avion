export interface TimezoneRegion {
  id: string;
  label: string;
  offset: string; // ISO 8601 offset
  countries: string[];
  bounds: {
    minLon: number;
    maxLon: number;
    minLat: number;
    maxLat: number;
  };
}

// Coarse-grained regions that cover major operating time zones.
// Bounds are intentionally approximate and only need to be good enough
// for onboarding-caliber selection.
export const TIMEZONE_REGIONS: TimezoneRegion[] = [
  {
    id: "UTC",
    label: "UTC (Zulu)",
    offset: "+00:00",
    countries: [],
    bounds: {
      // Mid‑Atlantic band where UTC is primary; avoids overlapping London.
      minLon: -30,
      maxLon: -10,
      minLat: -40,
      maxLat: 40,
    },
  },
  {
    id: "Europe/London",
    label: "London (BST)",
    offset: "+01:00",
    countries: ["United Kingdom", "Ireland"],
    bounds: {
      minLon: -10,
      maxLon: 5,
      minLat: 45,
      maxLat: 60,
    },
  },
  {
    id: "Europe/Berlin",
    label: "Central Europe (CET)",
    offset: "+01:00",
    countries: [
      "France",
      "Germany",
      "Netherlands",
      "Belgium",
      "Switzerland",
      "Austria",
      "Spain",
      "Italy",
    ],
    bounds: {
      minLon: 5,
      maxLon: 20,
      minLat: 42,
      maxLat: 58,
    },
  },
  {
    id: "America/Los_Angeles",
    label: "Los Angeles (PST)",
    offset: "-08:00",
    countries: ["United States of America", "Canada"],
    bounds: {
      minLon: -140,
      maxLon: -110,
      minLat: 25,
      maxLat: 60,
    },
  },
  {
    id: "America/Denver",
    label: "Mountain (MST)",
    offset: "-07:00",
    countries: ["United States of America", "Canada"],
    bounds: {
      minLon: -120,
      maxLon: -100,
      minLat: 25,
      maxLat: 60,
    },
  },
  {
    id: "America/Chicago",
    label: "Central (CST)",
    offset: "-06:00",
    countries: ["United States of America", "Canada", "Mexico"],
    bounds: {
      minLon: -100,
      maxLon: -85,
      minLat: 20,
      maxLat: 55,
    },
  },
  {
    id: "America/New_York",
    label: "New York (EST)",
    offset: "-05:00",
    countries: ["United States of America", "Canada"],
    bounds: {
      minLon: -85,
      maxLon: -60,
      minLat: 25,
      maxLat: 55,
    },
  },
  {
    id: "America/Sao_Paulo",
    label: "São Paulo (BRT)",
    offset: "-03:00",
    countries: ["Brazil", "Argentina", "Chile"],
    bounds: {
      minLon: -75,
      maxLon: -35,
      minLat: -40,
      maxLat: 10,
    },
  },
  {
    id: "Asia/Dubai",
    label: "Dubai (GST)",
    offset: "+04:00",
    countries: ["United Arab Emirates", "Saudi Arabia", "Qatar", "Israel"],
    bounds: {
      minLon: 35,
      maxLon: 65,
      minLat: 10,
      maxLat: 35,
    },
  },
  {
    id: "Asia/Kolkata",
    label: "India (IST)",
    offset: "+05:30",
    countries: ["India"],
    bounds: {
      minLon: 68,
      maxLon: 90,
      minLat: 5,
      maxLat: 30,
    },
  },
  {
    id: "Asia/Singapore",
    label: "Singapore (SGT)",
    offset: "+08:00",
    countries: ["Singapore", "Hong Kong", "China"],
    bounds: {
      minLon: 95,
      maxLon: 120,
      minLat: -10,
      maxLat: 25,
    },
  },
  {
    id: "Asia/Tokyo",
    label: "Tokyo (JST)",
    offset: "+09:00",
    countries: ["Japan", "South Korea"],
    bounds: {
      minLon: 120,
      maxLon: 150,
      minLat: 25,
      maxLat: 50,
    },
  },
  {
    id: "Australia/Sydney",
    label: "Sydney (AEST)",
    offset: "+10:00",
    countries: ["Australia", "New Zealand"],
    bounds: {
      minLon: 135,
      maxLon: 170,
      minLat: -50,
      maxLat: -10,
    },
  },
];

export const PRIMARY_TIMEZONE_IDS: string[] = [
  "UTC",
  "Europe/London",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export const PRIMARY_TIMEZONE_REGIONS: TimezoneRegion[] = PRIMARY_TIMEZONE_IDS
  .map((id) => TIMEZONE_REGIONS.find((region) => region.id === id))
  .filter((region): region is TimezoneRegion => Boolean(region));

export const resolveTimezoneFromCoords = (lon: number, lat: number): TimezoneRegion | null => {
  for (const region of TIMEZONE_REGIONS) {
    const { minLon, maxLon, minLat, maxLat } = region.bounds;
    if (lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat) {
      return region;
    }
  }
  return null;
};

export const resolveTimezoneByIdOrLabel = (value: string | null | undefined): TimezoneRegion | null => {
  if (!value) return null;
  for (const region of TIMEZONE_REGIONS) {
    if (region.id === value || region.label === value) {
      return region;
    }
  }
  return null;
};
