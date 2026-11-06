// These types are the contract between the UI and the data source.
// Today: lib/mockData.ts fills them. Later: Claude returns exactly this JSON shape
// (structured output), so the UI does not change when we go live.

export type HazardId =
  | "flood"
  | "wildfire"
  | "earthquake"
  | "hurricane"
  | "tsunami"
  | "winter_storm"
  | "extreme_heat"
  | "typhoon"
  | "storm_surge"
  | "landslide"
  | "volcano"
  | "tornado"
  | "storm"
  | "drought"
  | "cold";

export type Level = "Very High" | "High" | "Moderate" | "Low";

export type Language = string; // ISO code, e.g. "en", "es", "fil", "mi"

export interface Household {
  members: string[]; // e.g. ["Kids", "Elder"]
  mobility: boolean; // limited mobility in household
  car: boolean;
  pets: boolean;
  home: "Apartment (ground floor)" | "Apartment (upper floor)" | "House" | "Mobile home" | "Informal / light housing";
  language: Language;
}

export interface Hazard {
  id: HazardId;
  name: string;
  level: Level;
  score: number; // 0-100, used for ranking + bar
  explanation: string; // one plain-language sentence
  source: string;
}

export interface GoBagItem {
  item: string;
  why: string;
}

export interface HazardPlan {
  hazardId: HazardId;
  response: "evacuate" | "shelter";
  trigger_point: string;
  go_bag: { grab_5_min: GoBagItem[]; grab_30_min: GoBagItem[] };
  evacuation?: {
    when_to_leave: string;
    primary_route: string;
    backup_route: string;
    destinations: string[];
  };
  shelter_in_place?: string[];
}

export interface Coverage {
  type: string;
  status: "covered" | "gap" | "unknown";
  note: string;
}

export interface PlanResult {
  risk_summary: string;
  hazards: Hazard[];
  plans: HazardPlan[];
  easy_to_forget: string[]; // items standard checklists often miss
  recovery: {
    coverage: Coverage[];
    documents: string[];
    first_72h: string[];
    first_30d: string[];
  };
  alert: {
    event: string;
    headline: string;
    now_message: Record<string, string>;
  };
}

export type PlaceType = "shelter" | "high_ground" | "meeting_point" | "hospital";

export interface Place {
  name: string;
  type: PlaceType;
  lat: number;
  lon: number;
}

export interface Persona {
  id: string;
  country: string; // ISO3
  label: string;
  tagline: string;
  address: string;
  lat: number;
  lon: number;
  household: Household;
  overlay: { label: string; color: string; points: [number, number][] };
  places: Place[];
  result: PlanResult;
}
