// Shapes returned by our own API routes (/api/events, /api/country/[iso]).

export type AlertLevel = "Red" | "Orange" | "Green";

export interface LiveEvent {
  id: string;
  type: "EQ" | "TC" | "FL" | "VO" | "DR" | "WF";
  title: string;
  countries: string;
  iso3: string[];
  alert: AlertLevel;
  lat: number;
  lon: number;
  date: string;
  source: "GDACS" | "USGS";
  url: string;
}

export interface EventsResponse {
  updated: string;
  cached: boolean;
  events: LiveEvent[];
  heat?: [number, number, number][];
}

export interface CountryHazard {
  code: string;
  name: string;
  level: "High" | "Medium" | "Low" | "Very low";
}

export interface CountryResponse {
  iso: string;
  updated: string;
  cached: boolean;
  hazards: CountryHazard[];
  femaleHeaded: { value: number; year: string } | null;
  volcanoes?: { name: string; level: number; activity: string }[];
}

export interface EmdatYear {
  year: number;
  affected: number;
  deaths: number;
  events: number;
  byType: Record<string, number>; // affected by disaster type
}

export interface EmdatProfile {
  iso: string;
  asOf: string;
  since: number;
  totals: { affected: number; deaths: number; events: number };
  years: EmdatYear[];
  topTypes: string[];
}

export const EVENT_LABEL: Record<LiveEvent["type"], string> = {
  EQ: "Earthquake",
  TC: "Tropical cyclone",
  FL: "Flood",
  VO: "Volcano",
  DR: "Drought",
  WF: "Wildfire",
};

export const ALERT_COLOR = { Red: "#b91c1c", Orange: "#ea580c", Green: "#16a34a" } as const;
