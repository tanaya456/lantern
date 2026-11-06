// Turns real risk data for a US address (/api/address) + household answers into a plan.
// Rule-based starter plan; Claude will replace the text generation later using the same PlanResult shape.

import { DOCS, FIRST30, FIRST72 } from "./mockData";
import type { GoBagItem, Hazard, HazardId, HazardPlan, Household, Level, Persona, Place, PlanResult } from "./types";

export interface NearbyPlace {
  name: string;
  kind: "shelter" | "school" | "hospital" | "meeting_point";
  lat: number;
  lon: number;
  km: number;
}

export interface AddressRisk {
  lat: number;
  lon: number;
  county: string | null;
  overall: { score: number; rating: string } | null;
  hazards: { code: string; score: number; rating: string }[];
  floodZone: string | null;
  alerts: { event: string; headline: string; severity: string }[];
  places: NearbyPlace[];
  sources: { nri: boolean; flood: boolean; nws: boolean; osm: boolean };
}

type Group = "water" | "wind" | "heat" | "fire" | "quake" | "winter" | "tsunami";

const HZ: Record<string, { id: HazardId; name: string; group: Group }> = {
  IFLD: { id: "flood", name: "River flooding", group: "water" },
  CFLD: { id: "storm_surge", name: "Coastal flooding", group: "water" },
  HRCN: { id: "hurricane", name: "Hurricane", group: "water" },
  TRND: { id: "tornado", name: "Tornado", group: "wind" },
  SWND: { id: "storm", name: "Strong wind", group: "wind" },
  HAIL: { id: "storm", name: "Hail", group: "wind" },
  LTNG: { id: "storm", name: "Lightning", group: "wind" },
  WFIR: { id: "wildfire", name: "Wildfire", group: "fire" },
  ERQK: { id: "earthquake", name: "Earthquake", group: "quake" },
  LNDS: { id: "landslide", name: "Landslide", group: "quake" },
  HWAV: { id: "extreme_heat", name: "Heat wave", group: "heat" },
  DRGT: { id: "drought", name: "Drought", group: "heat" },
  CWAV: { id: "cold", name: "Cold wave", group: "winter" },
  WNTW: { id: "winter_storm", name: "Winter storm", group: "winter" },
  ISTM: { id: "winter_storm", name: "Ice storm", group: "winter" },
  TSUN: { id: "tsunami", name: "Tsunami", group: "tsunami" },
};

const level = (rating: string): Level =>
  rating === "Very High" ? "Very High" : rating === "Relatively High" ? "High" : rating === "Relatively Moderate" ? "Moderate" : "Low";

const isFloodZone = (z: string | null) => !!z && /^(A|V)/.test(z);

function who(h: Household) {
  const parts = [] as string[];
  if (h.members.includes("Baby")) parts.push("a baby");
  if (h.members.includes("Kids")) parts.push("kids");
  if (h.members.includes("Elder")) parts.push("an older relative");
  if (h.mobility) parts.push("someone who needs help moving");
  if (h.pets) parts.push("pets");
  return parts.length ? parts.join(", ").replace(/, ([^,]*)$/, " and $1") : "";
}

function baseBag(h: Household): GoBagItem[] {
  const b: GoBagItem[] = [
    { item: "Phones, chargers and a power bank", why: "Alerts and calling for help" },
    { item: "IDs, insurance papers and cash (in a zip bag)", why: "Needed for shelters, aid and claims" },
    { item: "Medicines for 1 week + a written list", why: "Pharmacies may close" },
  ];
  if (h.members.includes("Baby")) b.push({ item: "Diapers, wipes, formula or feeding supplies (3 days)", why: "Shelters often run short" });
  if (h.members.includes("Kids")) b.push({ item: "Snacks and a comfort item for each child", why: "Helps kids cope away from home" });
  if (h.pets) b.push({ item: "Pet carrier, leash, food and vet records", why: "Many shelters require a carrier" });
  if (h.mobility) b.push({ item: "Mobility aid, spare batteries and chargers", why: "Hard to replace quickly" });
  return b;
}

function nearest(places: NearbyPlace[], kinds: NearbyPlace["kind"][]) {
  return places.filter((p) => kinds.includes(p.kind));
}

function planFor(group: Group, hz: Hazard, r: AddressRisk, h: Household): HazardPlan {
  const people = who(h);
  const extra = people ? ` With ${people}, give yourself extra time.` : "";
  const noCar = !h.car ? " Without a car, line up a ride or transit option now." : "";
  const safe = nearest(r.places, ["shelter", "school"]);
  const dest = safe.slice(0, 2).map((p) => `${p.name} (${p.km} km)`);
  const destinations = dest.length ? dest : ["Your county's official shelter (check local news or call 211)"];
  const primary = safe[0]
    ? `Go to ${safe[0].name}, ${safe[0].km} km away. Check the route on the map and confirm it is open as a shelter.`
    : "Follow your county's evacuation route to the nearest official shelter.";
  const backup = safe[1] ? `If roads are blocked, try ${safe[1].name} or call 911.` : "If roads are blocked, call 911 or 211 for help getting out.";
  const bag = baseBag(h);

  switch (group) {
    case "water":
      return {
        hazardId: hz.id,
        response: "evacuate",
        trigger_point:
          (isFloodZone(r.floodZone) ? `Your address is in FEMA flood zone ${r.floodZone}, so water can rise fast. ` : "") +
          `Leave at the Flood Watch or any evacuation order, not when water is at the door.${noCar}${extra}`,
        go_bag: {
          grab_5_min: bag,
          grab_30_min: [
            { item: "Water and ready-to-eat food for 3 days", why: "Stores and taps may be out" },
            { item: "Change of clothes and sturdy shoes", why: "Flood water ruins clothing" },
            { item: "Move valuables and papers up high", why: "Lower floors flood first" },
          ],
        },
        evacuation: { when_to_leave: "At a Flood Watch or evacuation order, earlier if streets start to flood.", primary_route: primary, backup_route: backup, destinations },
      };
    case "fire":
      return {
        hazardId: hz.id,
        response: "evacuate",
        trigger_point: `Leave at the evacuation Warning, not the Order. Smoke and traffic build fast.${noCar}${extra}`,
        go_bag: {
          grab_5_min: [...bag, { item: "N95 masks for everyone", why: "Smoke harms lungs" }],
          grab_30_min: [
            { item: "Close windows and doors; move furniture away from them", why: "Slows fire spreading inside" },
            { item: "Photo walkthrough of your home", why: "Proof for insurance claims" },
          ],
        },
        evacuation: { when_to_leave: "At an evacuation Warning, or as soon as you see smoke nearby.", primary_route: primary, backup_route: backup, destinations },
      };
    case "tsunami":
      return {
        hazardId: hz.id,
        response: "evacuate",
        trigger_point: "A long or strong earthquake IS your warning. Walk to high ground right away; don't wait for an alert.",
        go_bag: { grab_5_min: bag.slice(0, 3), grab_30_min: [{ item: "Nothing. Don't stay to pack.", why: "Waves can arrive in minutes" }] },
        evacuation: { when_to_leave: "Immediately after strong shaking or any Tsunami Warning.", primary_route: "Walk inland and uphill; don't drive.", backup_route: "Go to the 3rd floor or higher of a sturdy building.", destinations },
      };
    case "wind":
      return {
        hazardId: hz.id,
        response: "shelter",
        trigger_point: `At a Tornado or Severe Thunderstorm Warning, go to your safe spot right away.${h.home === "Mobile home" ? " A mobile home is not safe: leave for a sturdy building at the Watch." : ""}${extra}`,
        go_bag: { grab_5_min: bag, grab_30_min: [{ item: "Helmets and sturdy shoes in your safe spot", why: "Protects from flying debris" }] },
        shelter_in_place: [
          "Go to the lowest floor, in a small interior room with no windows.",
          "Cover your head and neck; use mattresses or blankets.",
          "Stay there until the warning ends.",
        ],
      };
    case "heat":
      return {
        hazardId: hz.id,
        response: "shelter",
        trigger_point: `When a Heat Advisory is issued, keep cool and check on anyone at higher risk.${people ? ` That includes ${people}.` : ""}`,
        go_bag: { grab_5_min: bag.slice(0, 3), grab_30_min: [{ item: "Extra water and electrolyte drinks", why: "Dehydration happens fast" }] },
        shelter_in_place: [
          "Stay in the coolest room; close blinds during the day.",
          "If you have no AC, go to a cooling center or library in the afternoon.",
          "Never leave anyone or any pet in a parked car.",
        ],
      };
    case "winter":
      return {
        hazardId: hz.id,
        response: "shelter",
        trigger_point: `When a Winter Storm Warning is issued, stock up and stay off the roads.${extra}`,
        go_bag: { grab_5_min: bag.slice(0, 3), grab_30_min: [{ item: "Blankets, warm layers and a flashlight", why: "Power may go out" }] },
        shelter_in_place: [
          "Keep 7 days of medicine, food and water.",
          "Never use a generator, grill or stove to heat indoors (carbon monoxide).",
          "Arrange a daily check-in call with a neighbor.",
        ],
      };
    case "quake":
    default:
      return {
        hazardId: hz.id,
        response: "shelter",
        trigger_point: "When shaking starts: Drop, Cover, Hold On. Don't run outside during shaking.",
        go_bag: { grab_5_min: [...bag.slice(0, 3), { item: "Shoes and a flashlight by the bed", why: "Broken glass in the dark" }], grab_30_min: [{ item: "Water: 1 gallon per person per day for 3 days", why: "Water lines may break" }] },
        shelter_in_place: [
          "Drop, Cover, Hold On; protect your head and neck.",
          "After shaking stops, check for gas leaks and injuries.",
          "Strap tall furniture and the water heater to the wall now.",
        ],
      };
  }
}

const ALERT: Record<Group, { event: string; en: (s: string) => string; es: (s: string) => string }> = {
  water: { event: "Flash Flood Warning", en: (s) => `Leave now. Go to ${s}. Don't walk or drive through water.`, es: (s) => `Salga ahora. Vaya a ${s}. No camine ni maneje por el agua.` },
  fire: { event: "Evacuation Warning", en: (s) => `Leave now. Take your medicines and masks. Go to ${s}.`, es: (s) => `Salga ahora. Lleve sus medicamentos y mascarillas. Vaya a ${s}.` },
  tsunami: { event: "Tsunami Warning", en: () => "Walk inland and uphill now. Don't drive. Don't go to the beach.", es: () => "Camine tierra adentro y cuesta arriba ahora. No maneje. No vaya a la playa." },
  wind: { event: "Tornado Warning", en: () => "Go to your safe room now: lowest floor, no windows. Cover your head.", es: () => "Vaya a su cuarto seguro ahora: piso más bajo, sin ventanas. Cúbrase la cabeza." },
  heat: { event: "Excessive Heat Warning", en: () => "Stay in a cool place now. Drink water. Check on neighbors and older relatives.", es: () => "Quédese en un lugar fresco. Tome agua. Revise a vecinos y familiares mayores." },
  winter: { event: "Winter Storm Warning", en: () => "Stay home and off the roads. Never heat with a grill or generator indoors.", es: () => "Quédese en casa y fuera de las calles. No use parrillas ni generadores adentro." },
  quake: { event: "Earthquake", en: () => "Drop, cover and hold on. When shaking stops, check for gas leaks and injuries.", es: () => "Agáchese, cúbrase y sujétese. Cuando pare, revise fugas de gas y heridos." },
};

export function buildAddressPersona(r: AddressRisk, label: string, h: Household): Persona {
  const ranked = r.hazards.filter((x) => HZ[x.code]).slice(0, 5);
  const hazards: Hazard[] = ranked.map((x) => {
    const m = HZ[x.code];
    const flood = m.group === "water" && x.code === "IFLD" && r.floodZone ? ` Your address is in FEMA flood zone ${r.floodZone}${isFloodZone(r.floodZone) ? " (high risk)" : ""}.` : "";
    return {
      id: m.id,
      name: m.name,
      level: level(x.rating),
      score: Math.round(x.score),
      explanation: `FEMA rates your census tract "${x.rating}" for ${m.name.toLowerCase()} (${Math.round(x.score)}/100).${flood}`,
      source: x.code === "IFLD" ? "FEMA National Risk Index + NFHL" : "FEMA National Risk Index",
    } as Hazard;
  });

  // One plan per distinct hazard group, top two.
  const groups: { g: Group; hz: Hazard }[] = [];
  ranked.forEach((x, i) => {
    const g = HZ[x.code].group;
    if (!groups.some((y) => y.g === g) && groups.length < 2) groups.push({ g, hz: hazards[i] });
  });
  if (!groups.length) groups.push({ g: "quake", hz: { id: "earthquake", name: "Earthquake", level: "Low", score: 0, explanation: "", source: "" } });
  const plans = groups.map(({ g, hz }) => planFor(g, hz, r, h));

  const top = hazards[0];
  const shelter = nearest(r.places, ["shelter", "school"])[0]?.name ?? "the nearest official shelter";
  const a = ALERT[groups[0].g];

  const coverage: PlanResult["recovery"]["coverage"] = [
    { type: h.home.startsWith("Apartment") ? "Renters insurance" : "Homeowners insurance", status: "unknown", note: "Do you have it? Check what it covers and how much." },
  ];
  if (isFloodZone(r.floodZone) || groups.some((x) => x.g === "water"))
    coverage.push({ type: "Flood insurance", status: "gap", note: "Standard policies exclude flood. NFIP cover usually starts 30 days after you buy it." });
  if (r.hazards.some((x) => x.code === "ERQK" && x.score >= 60))
    coverage.push({ type: "Earthquake coverage", status: "gap", note: "Usually a separate policy or add-on." });
  coverage.push({ type: "Temporary housing (loss of use)", status: "unknown", note: "Ask how many months of hotel or rent are covered." });

  const easy = [
    "Glasses, hearing aids and spare batteries.",
    "A printed list of important phone numbers.",
    "A hygiene kit: toothbrushes, wipes, period products, diapers if needed.",
  ];
  if (h.pets) easy.push("Your pet's vaccination records; many shelters ask for them.");
  if (h.mobility) easy.push("Register with your county's access and functional needs list for help evacuating.");
  if (!h.car) easy.push("Save numbers for 211 and local transit; ask a neighbor to be your ride.");

  const places: Place[] = [
    ...nearest(r.places, ["shelter", "school"]).slice(0, 3).map((p) => ({ name: `${p.name} (possible shelter)`, type: "shelter" as const, lat: p.lat, lon: p.lon })),
    ...nearest(r.places, ["hospital"]).slice(0, 2).map((p) => ({ name: p.name, type: "hospital" as const, lat: p.lat, lon: p.lon })),
    ...nearest(r.places, ["meeting_point"]).slice(0, 1).map((p) => ({ name: p.name, type: "meeting_point" as const, lat: p.lat, lon: p.lon })),
  ];

  const result: PlanResult = {
    risk_summary:
      (top ? `${top.name} is your biggest risk. ` : "") +
      (r.overall ? `FEMA rates your area "${r.overall.rating}" for natural hazard risk overall.` : "Risk data was limited for this address.") +
      (r.alerts.length ? ` Active now: ${r.alerts.map((x) => x.event).join(", ")}.` : ""),
    hazards,
    plans,
    easy_to_forget: easy,
    recovery: { coverage, documents: DOCS, first_72h: FIRST72, first_30d: FIRST30 },
    alert: {
      event: r.alerts[0]?.event ?? a.event,
      headline: r.alerts[0]?.headline ?? `NWS: ${a.event} for ${r.county ?? "your area"} (simulated)`,
      now_message: { en: a.en(shelter), es: a.es(shelter) },
    },
  };

  return {
    id: "address",
    country: "USA",
    label: top?.name ?? "Your plan",
    tagline: r.county ?? "",
    address: label,
    lat: r.lat,
    lon: r.lon,
    household: h,
    overlay: { label: "FEMA risk by census tract", color: "#dc2626", points: [] },
    places,
    result,
  };
}

export const DEFAULT_HOUSEHOLD: Household = { members: ["Just me"], mobility: false, car: true, pets: false, home: "House", language: "en" };
