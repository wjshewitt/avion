/**
 * Supported Countries Configuration
 *
 * This file defines the whitelist of countries that are rendered on the map.
 * Only these countries will be fetched and displayed.
 */

/**
 * Set of supported country names
 * Country names match those used in Natural Earth GeoJSON data
 */
export const SUPPORTED_COUNTRIES = new Set([
  // Americas - North America
  "United States of America",
  "Canada",
  "Mexico",
  "Guatemala",
  "Belize",
  "Honduras",
  "El Salvador",
  "Nicaragua",
  "Costa Rica",
  "Panama",
  "Cuba",
  "Jamaica",
  "Haiti",
  "Dominican Republic",
  "Bahamas",
  "Trinidad and Tobago",
  "Barbados",
  "Grenada",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Dominica",
  "Antigua and Barbuda",
  "Saint Kitts and Nevis",
  "Brazil",
  "Argentina",
  "Chile",
  "Colombia",
  "Peru",
  "Venezuela",
  "Ecuador",
  "Bolivia",
  "Paraguay",
  "Uruguay",
  "Guyana",
  "Suriname",
  "French Guiana",

  // Americas - South America
  // (included above for consolidated handling)

  // Europe - Western Europe
  "United Kingdom",
  "Ireland",
  "France",
  "Germany",
  "Netherlands",
  "Belgium",
  "Luxembourg",
  "Switzerland",
  "Austria",
  "Liechtenstein",
  "Monaco",

  // Europe - Southern Europe
  "Spain",
  "Portugal",
  "Italy",
  "Greece",
  "Malta",
  "Cyprus",
  "San Marino",
  "Vatican",
  "Andorra",
  "Albania",
  "North Macedonia",
  "Montenegro",
  "Bosnia and Herzegovina",
  "Croatia",
  "Slovenia",
  "Serbia",
  "Kosovo",

  // Europe - Northern Europe
  "Norway",
  "Sweden",
  "Finland",
  "Denmark",
  "Iceland",
  "Estonia",
  "Latvia",
  "Lithuania",

  // Europe - Eastern Europe
  "Poland",
  "Czech Republic",
  "Czechia",
  "Slovakia",
  "Hungary",
  "Romania",
  "Bulgaria",
  "Moldova",
  "Ukraine",
  "Belarus",
  "Russia",

  // Special countries
  "Israel",
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "India",
  "China",
  "Japan",
  "South Korea",
  "Taiwan",
  "Australia",
  "New Zealand",
  "South Africa",
  "Singapore",
  "Hong Kong",
]);

/**
 * Countries that can be highlighted and rendered individually
 * Only these countries need expensive country detection and individual dot rendering
 * All other countries are rendered as part of the background layer for performance
 */
export const HIGHLIGHTABLE_COUNTRIES = new Set([
  // Americas - North America
  "United States of America",
  "Canada",
  "Mexico",
  "Brazil",
  "Argentina",
  "Chile",
  "Colombia",

  // Europe - All European countries
  "United Kingdom",
  "Ireland",
  "France",
  "Germany",
  "Netherlands",
  "Belgium",
  "Luxembourg",
  "Switzerland",
  "Austria",
  "Liechtenstein",
  "Monaco",
  "Spain",
  "Portugal",
  "Italy",
  "Greece",
  "Malta",
  "Cyprus",
  "San Marino",
  "Vatican",
  "Andorra",
  "Albania",
  "North Macedonia",
  "Montenegro",
  "Bosnia and Herzegovina",
  "Croatia",
  "Slovenia",
  "Serbia",
  "Kosovo",
  "Norway",
  "Sweden",
  "Finland",
  "Denmark",
  "Iceland",
  "Estonia",
  "Latvia",
  "Lithuania",
  "Poland",
  "Czech Republic",
  "Czechia",
  "Slovakia",
  "Hungary",
  "Romania",
  "Bulgaria",
  "Moldova",
  "Ukraine",
  "Belarus",

  // Asia-Pacific - Special countries mentioned by user
  "Israel",
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "India",
  "Singapore",
  "Hong Kong",
  "Japan",
  "South Korea",
  "Taiwan",
  "Australia",
  "New Zealand",
  "China",
  "South Africa",
]);

const COUNTRY_SYNONYMS = new Map<string, string>([
  ["usa", "United States of America"],
  ["us", "United States of America"],
  ["united states", "United States of America"],
  ["united states of america", "United States of America"],
  ["america", "United States of America"],
  ["uk", "United Kingdom"],
  ["great britain", "United Kingdom"],
  ["england", "United Kingdom"],
  ["u.k.", "United Kingdom"],
  ["uae", "United Arab Emirates"],
  ["u.a.e.", "United Arab Emirates"],
  ["united arab emirates", "United Arab Emirates"],
  ["south korea", "South Korea"],
  ["korea", "South Korea"],
  ["republic of korea", "South Korea"],
  ["korea, republic of", "South Korea"],
  ["north korea", "South Korea"],
  ["peoples republic of china", "China"],
  ["prc", "China"],
  ["hong kong sar", "Hong Kong"],
  ["hong kong special administrative region", "Hong Kong"],
  ["taiwan", "Taiwan"],
  ["taiwan, province of china", "Taiwan"],
  ["czech republic", "Czechia"],
  ["czechia", "Czechia"],
  ["brasil", "Brazil"],
  ["russian federation", "Russia"],
  ["u.s.", "United States of America"],
  ["united states (usa)", "United States of America"],
  ["people's republic of china", "China"],
  ["mainland china", "China"],
  ["uae (dubai)", "United Arab Emirates"],
  ["newzealand", "New Zealand"],
  ["australia", "Australia"],
  ["new zealand", "New Zealand"],
  ["south africa", "South Africa"],
  ["israel", "Israel"],
  ["saudi arabia", "Saudi Arabia"],
  ["qatar", "Qatar"],
  ["india", "India"],
  ["japan", "Japan"],
  ["singapore", "Singapore"],
  ["brazil", "Brazil"],
  ["argentina", "Argentina"],
  ["chile", "Chile"],
  ["colombia", "Colombia"],
]);

export const canonicalizeCountryName = (input: string | null | undefined): string | null => {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  const synonym = COUNTRY_SYNONYMS.get(lower);
  if (synonym) return synonym;

  for (const country of SUPPORTED_COUNTRIES) {
    if (country.toLowerCase() === lower) {
      return country;
    }
  }

  return null;
};
