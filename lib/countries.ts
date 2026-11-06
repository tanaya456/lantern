// Countries you can click into. Add a country = add an entry here + a persona in mockData.ts
// + rerun scripts/cache-data.py.

export interface LangOption {
  code: string;
  label: string;
  verified: boolean; // false = machine/draft translation; needs native-speaker check
}

export interface Country {
  iso3: string;
  name: string;
  center: [number, number];
  zoom: number;
  thinkHazard: string; // ThinkHazard! report id (GAUL code + slug)
  languages: LangOption[];
  personaIds: string[];
  blurb: string;
}

export const COUNTRIES: Country[] = [
  {
    iso3: "PHL",
    name: "Philippines",
    center: [12.3, 122.8],
    zoom: 5,
    thinkHazard: "196-philippines",
    languages: [
      { code: "en", label: "English", verified: true },
      { code: "fil", label: "Tagalog", verified: false },
    ],
    personaIds: ["tacloban"],
    blurb: "About 20 typhoons enter Philippine waters every year, on top of earthquakes, volcanoes and floods.",
  },
  {
    iso3: "NZL",
    name: "New Zealand",
    center: [-41.0, 174.0],
    zoom: 5,
    thinkHazard: "179-new-zealand",
    languages: [
      { code: "en", label: "English", verified: true },
      { code: "mi", label: "Te Reo Māori", verified: false },
    ],
    personaIds: ["wellington"],
    blurb: "It sits on the Pacific Ring of Fire, with active faults, volcanoes and tsunami-exposed coasts.",
  },
  {
    iso3: "USA",
    name: "United States",
    center: [37.5, -100],
    zoom: 4,
    thinkHazard: "259-united-states-of-america",
    languages: [
      { code: "en", label: "English", verified: true },
      { code: "es", label: "Español", verified: false },
    ],
    personaIds: ["flood", "wildfire", "coastal"],
    blurb: "Floods, wildfires, hurricanes and earthquakes, with very different risks from one county to the next.",
  },
];

export const countryByIso = (iso: string) => COUNTRIES.find((c) => c.iso3 === iso);
