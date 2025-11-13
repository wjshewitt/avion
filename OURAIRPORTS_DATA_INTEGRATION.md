# Proposal: OurAirports.com Data Integration

## 1. Objective

To significantly enrich the application's current airport data by fetching and integrating multiple comprehensive datasets from [OurAirports.com](https://ourairports.com/data/). This will provide a richer, more detailed data foundation for features related to flight planning, airport information, and navigation.

## 2. Current State & Problem

- The primary airport data source, `data/airports.json`, is minimal, containing only `code`, `lat`, `lon`, and `name`.
- The existing `data/ourairports-airports.csv` file is a corrupted HTML error page, not a valid data file.
- The application lacks detailed information about runways, communication frequencies, and navaids, which are crucial for advanced aviation features.

## 3. Available Datasets from OurAirports

OurAirports provides several valuable datasets, updated nightly and released into the public domain. The key files for our purposes are:

- `airports.csv`: The core dataset with detailed information for over 75,000 airports.
- `runways.csv`: Detailed runway information, including dimensions, surface type, and lighting.
- `airport-frequencies.csv`: Communication frequencies for airports (e.g., TOWER, ATIS, UNICOM).
- `navaids.csv`: Worldwide navigation aids (e.g., VOR, NDB, DME).
- `countries.csv`: Country information to decode country codes.
- `regions.csv`: Regional information to decode region codes.

## 4. Proposed Integration Strategy

We will create a data ingestion script to download, process, and merge these datasets into a single, enriched JSON file. This ensures a repeatable and maintainable process.

### Data Source

Instead of direct web downloads which can be unreliable (as evidenced by our broken CSV), we will fetch the data from the official, version-controlled GitHub repository: `https://github.com/davidmegginson/ourairports-data`.

### Data Processing Script

A new script, `scripts/import-our-airports-data.ts`, will be created to orchestrate the entire process.

### Integration Logic

1.  **Base Data**: The script will start with `airports.csv`. This will serve as our foundational data, replacing the current `airports.json`.
2.  **Data Enrichment**: The script will then process `runways.csv`, `airport-frequencies.csv`, and `navaids.csv`.
3.  **Linking**: Data from the enrichment files will be linked to the base airport data using the `airport_ident` column (the ICAO code), which is present in all relevant files.
4.  **Output**: The final, merged data will be written to a new file: `data/airports-enhanced.json`. This file will contain a comprehensive object for each airport.

### Proposed Enriched Data Structure

Each airport object in `data/airports-enhanced.json` will be expanded to include arrays for its associated runways, frequencies, and nearby navaids.

```json
// Example of a new, enriched airport object
{
  "id": 2434,
  "ident": "KLAX",
  "type": "large_airport",
  "name": "Los Angeles International Airport",
  "latitude_deg": 33.94250107,
  "longitude_deg": -118.4079971,
  "elevation_ft": 125,
  "continent": "NA",
  "iso_country": "US",
  "iso_region": "US-CA",
  "municipality": "Los Angeles",
  "scheduled_service": "yes",
  "gps_code": "KLAX",
  "iata_code": "LAX",
  "local_code": "LAX",
  "home_link": "https://www.flylax.com/",
  "wikipedia_link": "https://en.wikipedia.org/wiki/Los_Angeles_International_Airport",
  "keywords": "LA, Tom Bradley",
  "runways": [
    {
      "id": 237348,
      "airport_ref": 2434,
      "airport_ident": "KLAX",
      "length_ft": 10885,
      "width_ft": 150,
      "surface": "ASP",
      "le_ident": "06L",
      "he_ident": "24R",
      ...
    },
    ...
  ],
  "frequencies": [
    {
      "id": 63697,
      "airport_ref": 2434,
      "airport_ident": "KLAX",
      "type": "APP",
      "description": "SOCAL APP",
      "frequency_mhz": 124.3,
      ...
    },
    ...
  ],
  "navaids": [
    {
      "id": 90233,
      "filename": "Los_Angeles_VOR-DME_US",
      "ident": "LAX",
      "name": "Los Angeles",
      "type": "VOR-DME",
      "frequency_khz": 113600,
      "latitude_deg": 33.94569969,
      "longitude_deg": -118.4260025,
      ...
    },
    ...
  ]
}
```

## 5. Actionable Steps

1.  **Create Script File**: Create a new file at `scripts/import-our-airports-data.ts`.
2.  **Install Dependencies**: Add `papaparse` for robust CSV parsing (`npm install papaparse @types/papaparse`).
3.  **Implement Downloader**: In the script, create a function to download the raw CSV content from the GitHub repository URLs.
4.  **Process Base Data**: Parse `airports.csv` and create a primary array of airport objects.
5.  **Process Enrichment Data**: Parse `runways.csv`, `airport-frequencies.csv`, and `navaids.csv`.
6.  **Group and Merge**: Create lookup maps from the enrichment data, keyed by `airport_ident`. Iterate through the main airport list and attach the corresponding arrays of runways, frequencies, and navaids.
7.  **Write Output File**: Serialize the final array of enriched airport objects and write it to `data/airports-enhanced.json`, overwriting the old file.
8.  **Update Application**: Refactor any code currently using `data/airports.json` to source its data from the new `data/airports-enhanced.json`.
9.  **Update `.gitignore`**: Ensure `data/airports-enhanced.json` is tracked by Git, while the downloaded raw CSVs are ignored.

```
# .gitignore
/data/*.csv
```
