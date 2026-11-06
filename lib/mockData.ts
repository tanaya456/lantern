import type { Persona } from "./types";

// DEMO DATA ONLY. Hazard levels, places and plans are illustrative, not real assessments.
// Shelter / high-ground locations are SIMULATED (PRD section 8 data rules).

export const RESOURCES_AS_OF = "2026-11-06";

export interface Resource { name: string; provides: string; note: string; url: string }

const US_RESOURCES: Resource[] = [
  { name: "Homeowners or renters insurance", provides: "Repair or replacement costs, temporary housing", note: "Check exclusions and limits", url: "https://content.naic.org/consumer" },
  { name: "Flood insurance (NFIP or private)", provides: "Flood damage repair", note: "Separate policy; usually a 30-day waiting period", url: "https://www.floodsmart.gov" },
  { name: "Earthquake insurance", provides: "Quake damage repair", note: "Separate policy or endorsement", url: "https://www.earthquakeauthority.com" },
  { name: "FEMA Individual Assistance", provides: "Grants for temporary housing and essential repairs", note: "Only after a federal disaster declaration", url: "https://www.disasterassistance.gov" },
  { name: "SBA disaster loans", provides: "Low-interest loans to rebuild and replace belongings", note: "Open to homeowners and renters", url: "https://www.sba.gov/funding-programs/disaster-assistance" },
  { name: "State, local and nonprofit programs", provides: "Short-term cash, shelter, supplies", note: "Varies by region; call 211", url: "https://www.211.org" },
];

export const DOCS = [
  "Photo or video walkthrough of every room (home inventory)",
  "Insurance policy numbers and agent phone number",
  "ID, birth certificates, Social Security cards",
  "Lease or deed",
  "Medication list and prescriptions",
  "Receipts for major purchases",
  "Cloud copy + offline copy (USB or printed)",
];

export const FIRST72 = [
  "Get everyone safe; follow official instructions",
  "Photograph all damage before cleanup",
  "Open a claim with your insurer and write down the claim number",
  "Keep every receipt for hotel, food and supplies",
];

export const FIRST30 = [
  "Apply for FEMA and SBA aid if a disaster is declared",
  "Keep all claim emails and letters in one folder",
  "Get 2 or more written repair estimates",
  "Call 211 for local cash and housing help",
];

export const PERSONAS: Persona[] = [
  {
    id: "flood",
    country: "USA",
    label: "Flood",
    tagline: "Single parent, 2 kids, ground-floor apartment, no car",
    address: "Meyerland, Houston, TX (demo)",
    lat: 29.6905,
    lon: -95.46,
    household: { members: ["Kids"], mobility: false, car: false, pets: false, home: "Apartment (ground floor)", language: "es" },
    overlay: {
      label: "FEMA flood zone AE (demo)",
      color: "#2563eb",
      points: [[29.6985, -95.485], [29.6965, -95.44], [29.684, -95.437], [29.6855, -95.483]],
    },
    places: [
      { name: "Bellaire High School (simulated shelter)", type: "shelter", lat: 29.7033, lon: -95.4719 },
      { name: "Higher ground: Westbury (simulated)", type: "high_ground", lat: 29.664, lon: -95.4815 },
      { name: "Family meeting point: library", type: "meeting_point", lat: 29.6995, lon: -95.4565 },
      { name: "Hospital (simulated)", type: "hospital", lat: 29.7075, lon: -95.4425 },
    ],
    result: {
      risk_summary: "Flooding is your biggest risk. Your home is in a high-risk flood zone 300 m from Brays Bayou, on the ground floor, and you have no car.",
      hazards: [
        { id: "flood", name: "Flood", level: "Very High", score: 94, explanation: "Your apartment is inside a FEMA high-risk flood zone and on the ground floor.", source: "FEMA NFHL + NRI (demo)" },
        { id: "hurricane", name: "Hurricane", level: "High", score: 78, explanation: "Gulf hurricanes bring heavy rain that floods your area quickly.", source: "FEMA NRI (demo)" },
        { id: "extreme_heat", name: "Extreme heat", level: "High", score: 71, explanation: "Summer heat waves are common, and power often goes out after storms.", source: "FEMA NRI (demo)" },
        { id: "winter_storm", name: "Winter storm", level: "Low", score: 22, explanation: "Rare, but the 2021 freeze showed power and water can fail.", source: "FEMA NRI (demo)" },
      ],
      plans: [
        {
          hazardId: "flood",
          response: "evacuate",
          trigger_point: "Leave at the Flood WATCH, not the Warning. Without a car, you need about 45 minutes to get both kids to the shelter by bus or ride.",
          go_bag: {
            grab_5_min: [
              { item: "Phones + chargers + power bank", why: "Alerts and calling for a ride" },
              { item: "IDs, lease, insurance info (in a zip bag)", why: "Needed for aid and claims" },
              { item: "Kids' medications + 3 days of snacks", why: "Shelters may not have them" },
              { item: "Hygiene kit: toothbrushes, wipes, period products (1 week)", why: "Often missing from shelter supplies" },
            ],
            grab_30_min: [
              { item: "Change of clothes for everyone", why: "Floodwater ruins clothing" },
              { item: "Comfort item + small toy for each child", why: "Helps kids cope in a shelter" },
              { item: "Cash in small bills", why: "ATMs and cards may not work" },
              { item: "Move valuables and documents to a high shelf", why: "Ground floor floods first" },
            ],
          },
          evacuation: {
            when_to_leave: "At the Flood Watch stage, or earlier if street flooding starts.",
            primary_route: "Walk north on S Rice Ave to the bus on Bellaire Blvd, then to Bellaire High School.",
            backup_route: "Call your ride contact or 311 for transport; avoid Braeswood Blvd underpasses.",
            destinations: ["Bellaire High School (simulated shelter)", "Higher ground: Westbury", "Family meeting point: library"],
          },
        },
        {
          hazardId: "hurricane",
          response: "evacuate",
          trigger_point: "If your zone is told to evacuate, or a Category 3+ storm is forecast, go 48 hours before landfall.",
          go_bag: {
            grab_5_min: [
              { item: "Same flood go-bag", why: "Hurricane flooding is the main danger" },
              { item: "Battery radio", why: "Phones may lose signal" },
            ],
            grab_30_min: [
              { item: "Water: 1 gallon per person per day x 3", why: "Water may be unsafe after the storm" },
              { item: "Photo walkthrough of the apartment", why: "Proof of belongings for claims" },
            ],
          },
          evacuation: {
            when_to_leave: "Early, before buses stop running.",
            primary_route: "City evacuation bus from the nearest pickup point.",
            backup_route: "Stay with family outside the flood zone (plan this now).",
            destinations: ["Family outside the flood zone", "Bellaire High School (simulated shelter)"],
          },
        },
      ],
      easy_to_forget: [
        "Pack a week of hygiene supplies; shelters often run out.",
        "In a shelter, ask for a family area and keep kids within sight.",
        "Share your plan and location with one trusted contact.",
        "Ask the shelter for a quiet family area so the kids can sleep.",
      ],
      recovery: {
        coverage: [
          { type: "Renters insurance", status: "unknown", note: "Do you have it? It covers belongings, not flood." },
          { type: "Flood insurance", status: "gap", note: "Your top risk is flood. Renters policies don't cover it. NFIP renters cover starts at about $100/yr." },
          { type: "Temporary housing (loss of use)", status: "gap", note: "Ask your insurer if this is included." },
        ],
        documents: DOCS,
        first_72h: FIRST72,
        first_30d: FIRST30,
      },
      alert: {
        event: "Flash Flood Warning",
        headline: "NWS Houston: Flash Flood Warning for southwest Harris County until 11:45 PM",
        now_message: {
          en: "Leave now with the kids. Go to Bellaire High School. Don't walk or drive through water.",
          es: "Salga ahora con los niños. Vaya a Bellaire High School. No camine ni maneje por el agua.",
        },
      },
    },
  },
  {
    id: "wildfire",
    country: "USA",
    label: "Wildfire",
    tagline: "Older adult living alone, limited mobility",
    address: "Grass Valley, CA (demo)",
    lat: 39.219,
    lon: -121.061,
    household: { members: ["Just me"], mobility: true, car: true, pets: true, home: "House", language: "en" },
    overlay: {
      label: "Very high fire hazard zone (demo)",
      color: "#dc2626",
      points: [[39.24, -121.1], [39.235, -121.05], [39.205, -121.045], [39.2, -121.095]],
    },
    places: [
      { name: "Nevada County Fairgrounds (simulated shelter)", type: "shelter", lat: 39.2065, lon: -121.0745 },
      { name: "Meeting point: neighbor's driveway", type: "meeting_point", lat: 39.2205, lon: -121.0585 },
      { name: "Hospital (simulated)", type: "hospital", lat: 39.2265, lon: -121.0465 },
    ],
    result: {
      risk_summary: "Wildfire is your biggest risk. You live in a very high fire hazard zone, and limited mobility means you need extra time to leave.",
      hazards: [
        { id: "wildfire", name: "Wildfire", level: "Very High", score: 92, explanation: "Your home is in a very high fire hazard zone with dense trees nearby.", source: "USFS Wildfire Risk + FEMA NRI (demo)" },
        { id: "extreme_heat", name: "Extreme heat", level: "Moderate", score: 55, explanation: "Hot summers, and smoke days can make indoor air unsafe.", source: "FEMA NRI (demo)" },
        { id: "winter_storm", name: "Winter storm", level: "Moderate", score: 48, explanation: "Snow can cut power and block roads for days.", source: "FEMA NRI (demo)" },
        { id: "earthquake", name: "Earthquake", level: "Low", score: 25, explanation: "Lower shaking risk than the coast.", source: "USGS (demo)" },
      ],
      plans: [
        {
          hazardId: "wildfire",
          response: "evacuate",
          trigger_point: "Leave at the evacuation WARNING, not the Order. With limited mobility, you need a head start before the roads fill up.",
          go_bag: {
            grab_5_min: [
              { item: "Medications + mobility aid", why: "Hard to replace quickly" },
              { item: "N95 masks", why: "Smoke harms lungs" },
              { item: "Pet carrier, food, leash", why: "Shelters may require a carrier" },
              { item: "Phone, charger, glasses, hearing aids", why: "Needed to get alerts" },
            ],
            grab_30_min: [
              { item: "Photo walkthrough of the house", why: "Proof for the insurance claim" },
              { item: "Close windows; move furniture away from them", why: "Slows fire spread into the home" },
              { item: "Family photos and keepsakes", why: "Can't be replaced" },
            ],
          },
          evacuation: {
            when_to_leave: "At the evacuation Warning, or when you see smoke nearby.",
            primary_route: "Drive to the Nevada County Fairgrounds via McCourtney Rd.",
            backup_route: "If the road is blocked, call your neighbor (meeting point) or 911 for help leaving.",
            destinations: ["Nevada County Fairgrounds (simulated shelter)", "Meeting point: neighbor's driveway"],
          },
        },
        {
          hazardId: "winter_storm",
          response: "shelter",
          trigger_point: "When a Winter Storm Warning is issued, stock up and stay in.",
          go_bag: {
            grab_5_min: [{ item: "Flashlight + extra batteries", why: "Power outages are common" }],
            grab_30_min: [{ item: "Medications (7 days) + warm blankets", why: "Roads may close for days" }],
          },
          shelter_in_place: [
            "Keep 7 days of medications and food.",
            "Never use a generator or grill indoors (carbon monoxide).",
            "Arrange a daily check-in call with a neighbor.",
          ],
        },
      ],
      easy_to_forget: [
        "Living alone: set up a daily check-in buddy for fire season.",
        "Register with the county's access and functional needs list for help evacuating.",
        "Keep a written medication list in your bag in case you can't speak for yourself.",
      ],
      recovery: {
        coverage: [
          { type: "Homeowners insurance", status: "covered", note: "Covers fire. Check whether you have replacement cost or actual cash value." },
          { type: "Rebuild shortfall", status: "gap", note: "Estimated rebuild cost ~$480k vs a $350k dwelling limit means about a $130k gap (demo estimate)." },
          { type: "Temporary housing (loss of use)", status: "unknown", note: "Ask how many months are covered." },
        ],
        documents: DOCS,
        first_72h: FIRST72,
        first_30d: FIRST30,
      },
      alert: {
        event: "Evacuation Warning",
        headline: "Nevada County OES: Evacuation Warning for zones NEV-E094, NEV-E095",
        now_message: {
          en: "Leave now. Take your medications, your pet and your mask. Drive to the Fairgrounds.",
          es: "Salga ahora. Lleve sus medicamentos, su mascota y su mascarilla. Maneje al recinto ferial.",
        },
      },
    },
  },
  {
    id: "coastal",
    country: "USA",
    label: "Coastal",
    tagline: "Renter with a baby, tsunami and earthquake zone",
    address: "Crescent City, CA (demo)",
    lat: 41.752,
    lon: -124.196,
    household: { members: ["Baby"], mobility: false, car: true, pets: false, home: "Apartment (upper floor)", language: "en" },
    overlay: {
      label: "Tsunami hazard zone (demo)",
      color: "#0891b2",
      points: [[41.762, -124.215], [41.761, -124.185], [41.744, -124.18], [41.743, -124.212]],
    },
    places: [
      { name: "High ground: Del Norte High area (simulated)", type: "high_ground", lat: 41.7725, lon: -124.188 },
      { name: "Shelter: community center (simulated)", type: "shelter", lat: 41.7795, lon: -124.1815 },
      { name: "Hospital (simulated)", type: "hospital", lat: 41.7745, lon: -124.1955 },
    ],
    result: {
      risk_summary: "Earthquake and tsunami are your biggest risks. A strong quake here can mean a tsunami arrives in about 15 minutes.",
      hazards: [
        { id: "earthquake", name: "Earthquake", level: "Very High", score: 90, explanation: "You live near the Cascadia fault, which can cause very strong shaking.", source: "USGS Seismic Hazard (demo)" },
        { id: "tsunami", name: "Tsunami", level: "Very High", score: 88, explanation: "Your apartment is inside the tsunami hazard zone near the harbor.", source: "CA tsunami map (demo)" },
        { id: "flood", name: "Flood", level: "Moderate", score: 45, explanation: "Winter storms can flood low streets near the coast.", source: "FEMA NFHL (demo)" },
        { id: "wildfire", name: "Wildfire", level: "Low", score: 18, explanation: "Wet coastal climate keeps fire risk low.", source: "FEMA NRI (demo)" },
      ],
      plans: [
        {
          hazardId: "earthquake",
          response: "shelter",
          trigger_point: "When shaking starts: Drop, Cover, Hold On. Don't run outside during shaking.",
          go_bag: {
            grab_5_min: [
              { item: "Baby carrier (not a stroller)", why: "Roads may be cracked or blocked" },
              { item: "Formula, bottles, diapers (24 hours)", why: "Stores will be closed" },
              { item: "Sturdy shoes by the bed", why: "Broken glass" },
            ],
            grab_30_min: [
              { item: "Water: 1 gallon/person/day + extra for formula", why: "Water lines may break" },
              { item: "Copies of IDs + baby's birth certificate", why: "Needed for aid" },
            ],
          },
          shelter_in_place: [
            "Drop, Cover, Hold On, holding the baby against your chest.",
            "After shaking stops: if the quake was long or strong, go to high ground immediately (tsunami).",
            "Strap the bookshelf and TV to the wall now.",
          ],
        },
        {
          hazardId: "tsunami",
          response: "evacuate",
          trigger_point: "A long or strong earthquake IS your warning. Leave right away; don't wait for an official alert.",
          go_bag: {
            grab_5_min: [
              { item: "Baby + carrier + go-bag", why: "You have about 15 minutes" },
              { item: "Phone", why: "Text, don't call; networks get jammed" },
            ],
            grab_30_min: [{ item: "Nothing. Don't stay to pack.", why: "Leave immediately" }],
          },
          evacuation: {
            when_to_leave: "Immediately after strong shaking, or at any Tsunami Warning.",
            primary_route: "Walk inland and uphill on Pebble Beach Dr toward the high school area. Walk; don't drive.",
            backup_route: "Go to the 3rd floor or higher of a sturdy concrete building if you can't reach high ground.",
            destinations: ["High ground: Del Norte High area (simulated)", "Shelter: community center (simulated)"],
          },
        },
      ],
      easy_to_forget: [
        "Feeding the baby: pack extra water and snacks for yourself too.",
        "Formula: keep ready-to-feed bottles that don't need clean water.",
        "Diapers, wipes and baby medicine for 1 week.",
        "In a shelter, ask for a private space for feeding.",
      ],
      recovery: {
        coverage: [
          { type: "Renters insurance", status: "covered", note: "Covers belongings from fire or theft." },
          { type: "Earthquake coverage", status: "gap", note: "Renters policies exclude earthquakes. The CEA offers renters quake policies." },
          { type: "Flood / tsunami", status: "gap", note: "Tsunami damage is usually treated as flood and is not covered by renters policies." },
        ],
        documents: DOCS,
        first_72h: FIRST72,
        first_30d: FIRST30,
      },
      alert: {
        event: "Tsunami Warning",
        headline: "NWS Tsunami Warning Center: Tsunami Warning for the coast of Del Norte County",
        now_message: {
          en: "Go now with your baby. Walk uphill to the high school area. Don't go to the beach.",
          es: "Váyase ahora con su bebé. Camine cuesta arriba hacia la preparatoria. No vaya a la playa.",
        },
      },
    },
  },
];

// ---------- Global personas (Philippines, New Zealand) ----------

PERSONAS.push(
  {
    id: "tacloban",
    country: "PHL",
    label: "Typhoon",
    tagline: "Parent of 3 caring for an elder, partner working overseas, light coastal housing",
    address: "San Jose, Tacloban City, Leyte (demo)",
    lat: 11.2395,
    lon: 125.0055,
    household: { members: ["Kids", "Elder"], mobility: false, car: false, pets: false, home: "Informal / light housing", language: "fil" },
    overlay: {
      label: "Storm surge zone (demo)",
      color: "#0891b2",
      points: [[11.2475, 125.0005], [11.2475, 125.0105], [11.231, 125.0105], [11.231, 125.0005]],
    },
    places: [
      { name: "Leyte Normal University (simulated evacuation center)", type: "shelter", lat: 11.2448, lon: 124.9965 },
      { name: "High ground: upland barangay (simulated)", type: "high_ground", lat: 11.2575, lon: 124.9885 },
      { name: "Meeting point: barangay hall", type: "meeting_point", lat: 11.2415, lon: 125.0012 },
      { name: "Hospital (simulated)", type: "hospital", lat: 11.2475, lon: 125.0035 },
    ],
    result: {
      risk_summary: "Typhoons and storm surge are your biggest risks. Your light-built home is in the surge zone, and you are making decisions alone while your partner works abroad.",
      hazards: [
        { id: "typhoon", name: "Typhoon", level: "Very High", score: 95, explanation: "Eastern Visayas is hit by strong typhoons almost every year.", source: "ThinkHazard! (live) + EM-DAT" },
        { id: "storm_surge", name: "Storm surge", level: "Very High", score: 91, explanation: "Your home is a few hundred meters from the bay, where surge reached 5 m in 2013.", source: "ThinkHazard! coastal flood (live)" },
        { id: "flood", name: "Flood", level: "High", score: 76, explanation: "Heavy rain floods low streets for days.", source: "ThinkHazard! (live)" },
        { id: "earthquake", name: "Earthquake", level: "High", score: 68, explanation: "The Philippine Fault runs through Leyte.", source: "ThinkHazard! (live)" },
        { id: "landslide", name: "Landslide", level: "Moderate", score: 50, explanation: "Upland areas slide after long rain.", source: "ThinkHazard! (live)" },
      ],
      plans: [
        {
          hazardId: "typhoon",
          response: "evacuate",
          trigger_point: "Leave at PAGASA Signal No. 2 or any storm surge warning. Don't wait for Signal 4. With three kids and an elderly parent, you need daylight and time.",
          go_bag: {
            grab_5_min: [
              { item: "IDs, birth certificates, 4Ps / PhilHealth cards (in a plastic bag)", why: "Needed for relief goods and aid" },
              { item: "Phone, power bank, GCash/remittance details", why: "Family abroad can send money even if banks close" },
              { item: "Your parent's medicines (1 week)", why: "Evacuation centers may not have them" },
              { item: "Hygiene kit + spare underwear (1 week)", why: "Often missing from relief packs" },
            ],
            grab_30_min: [
              { item: "Drinking water + ready-to-eat food (3 days)", why: "Relief can take days to arrive" },
              { item: "Malong or blanket for each person", why: "For sleeping and privacy in the center" },
              { item: "Tie down the roof and move valuables up high", why: "Light roofs are the first thing lost" },
            ],
          },
          evacuation: {
            when_to_leave: "At Signal No. 2, or when the barangay calls for pre-emptive evacuation.",
            primary_route: "Walk inland on Real Street to Leyte Normal University (evacuation center).",
            backup_route: "If streets flood, go to the barangay hall's 2nd floor and call 911.",
            destinations: ["Leyte Normal University (simulated evacuation center)", "High ground: upland barangay", "Meeting point: barangay hall"],
          },
        },
        {
          hazardId: "earthquake",
          response: "shelter",
          trigger_point: "When shaking starts: Duck, Cover, Hold. Outside after it stops, away from walls and wires.",
          go_bag: {
            grab_5_min: [{ item: "Same typhoon go-bag", why: "Keep one bag ready all year" }],
            grab_30_min: [{ item: "Check for gas leaks and cracked walls", why: "Light houses can collapse in aftershocks" }],
          },
          shelter_in_place: [
            "Duck, Cover, Hold; shield the youngest child with your body.",
            "Near the coast after strong shaking? Walk to high ground right away (tsunami).",
            "Agree on the barangay hall as the family meeting point.",
          ],
        },
      ],
      easy_to_forget: [
        "Your partner is abroad: agree now who decides and who can access money if they can't be reached.",
        "Ask the evacuation center for a family space and well-lit toilets.",
        "Keep kids in sight; register every child with the camp manager.",
        "Anyone with health needs? Tell the barangay health worker on arrival.",
      ],
      recovery: {
        coverage: [
          { type: "Home insurance", status: "gap", note: "Most light-built homes are uninsured. Rebuilding relies on aid and loans." },
          { type: "SSS / Pag-IBIG calamity loan", status: "unknown", note: "Available if you or your partner are a member and your area is declared under calamity." },
          { type: "DSWD aid (AICS)", status: "covered", note: "Cash or relief for families in crisis; bring IDs." },
        ],
        documents: [
          "IDs and birth certificates for every family member",
          "4Ps, PhilHealth, SSS / Pag-IBIG numbers",
          "Photos of your house now (proof for aid)",
          "Land or rental agreement, barangay certificate",
          "Partner's employment and OFW (OWWA) details",
          "Cloud copy (phone photos) + printed copy in plastic",
        ],
        first_72h: [
          "Stay in the evacuation center until the barangay says it's safe",
          "Photograph damage before you clean up",
          "Register with DSWD / the barangay for relief and the DAFAC card",
          "Tell your partner's agency (OWWA) your family was affected",
        ],
        first_30d: [
          "Apply for DSWD assistance and an SSS / Pag-IBIG calamity loan",
          "Get a barangay certificate of damage",
          "Ask about shelter repair kits from NGOs",
          "Keep all receipts and papers in one bag",
        ],
      },
      alert: {
        event: "Typhoon Signal No. 3",
        headline: "PAGASA: Tropical Cyclone Wind Signal No. 3 raised over Leyte, storm surge warning for Tacloban (simulated)",
        now_message: {
          en: "Leave now with the kids and your parent. Walk to Leyte Normal University. Stay away from the shore.",
          fil: "Lumikas na ngayon kasama ang mga bata at ang iyong magulang. Maglakad papuntang Leyte Normal University. Lumayo sa dalampasigan.",
        },
      },
    },
  },
  {
    id: "wellington",
    country: "NZL",
    label: "Earthquake",
    tagline: "Solo parent with a toddler, renting an old hillside villa",
    address: "Newtown, Wellington (demo)",
    lat: -41.3105,
    lon: 174.779,
    household: { members: ["Kids"], mobility: false, car: false, pets: true, home: "House", language: "en" },
    overlay: {
      label: "Tsunami evacuation zone (demo)",
      color: "#0891b2",
      points: [[-41.322, 174.79], [-41.322, 174.77], [-41.345, 174.765], [-41.345, 174.8]],
    },
    places: [
      { name: "Civil Defence Centre: Newtown School (simulated)", type: "shelter", lat: -41.3125, lon: 174.7795 },
      { name: "High ground: Mount Victoria (simulated)", type: "high_ground", lat: -41.2965, lon: 174.7935 },
      { name: "Meeting point: Newtown Park", type: "meeting_point", lat: -41.3135, lon: 174.7745 },
      { name: "Hospital (simulated)", type: "hospital", lat: -41.3085, lon: 174.7795 },
    ],
    result: {
      risk_summary: "Earthquake is your biggest risk. Wellington sits on active faults, and older wooden villas can shift off their foundations.",
      hazards: [
        { id: "earthquake", name: "Earthquake", level: "Very High", score: 93, explanation: "Wellington sits on several active faults, including the Wellington Fault.", source: "ThinkHazard! (live) + GeoNet" },
        { id: "tsunami", name: "Tsunami", level: "High", score: 72, explanation: "The south coast is in a tsunami zone; your street is just outside it.", source: "ThinkHazard! (live)" },
        { id: "landslide", name: "Landslide", level: "High", score: 66, explanation: "Steep streets and heavy rain can cause slips that block roads.", source: "ThinkHazard! (live)" },
        { id: "flood", name: "Flood", level: "Moderate", score: 45, explanation: "Stormwater flooding in heavy rain.", source: "ThinkHazard! (live)" },
      ],
      plans: [
        {
          hazardId: "earthquake",
          response: "shelter",
          trigger_point: "When shaking starts: Drop, Cover, Hold. Plan to be self-sufficient for 7+ days; Wellington may be cut off.",
          go_bag: {
            grab_5_min: [
              { item: "Toddler, carrier, nappies, snacks (24 h)", why: "Roads and shops may be closed" },
              { item: "Shoes + torch by the bed", why: "Broken glass in the dark" },
              { item: "Cat carrier + food", why: "Civil Defence Centres may require carriers" },
            ],
            grab_30_min: [
              { item: "Water: 9 L per person per day x 7", why: "Wellington's water pipes may break" },
              { item: "Photos of each room + your contents list", why: "Proof for contents insurance claims" },
            ],
          },
          shelter_in_place: [
            "Drop, Cover, Hold; hold your toddler under you.",
            "Long or strong, get gone: if near the coast, walk to high ground immediately.",
            "Ask your landlord whether the villa is bolted to its foundations.",
          ],
        },
        {
          hazardId: "tsunami",
          response: "evacuate",
          trigger_point: "Long or strong shaking IS your warning. Don't wait for an official alert.",
          go_bag: {
            grab_5_min: [{ item: "Toddler + go-bag", why: "Leave right away; walk, don't drive" }],
            grab_30_min: [{ item: "Nothing. Don't stay to pack.", why: "Waves can arrive within minutes" }],
          },
          evacuation: {
            when_to_leave: "Immediately after long or strong shaking, or at any tsunami warning.",
            primary_route: "Walk north up Constable St toward Mount Victoria.",
            backup_route: "If the road is blocked by slips, go up to Newtown Park.",
            destinations: ["High ground: Mount Victoria (simulated)", "Meeting point: Newtown Park"],
          },
        },
      ],
      easy_to_forget: [
        "Solo parent: arrange a neighbour buddy who can collect your toddler from daycare if you're stuck in town.",
        "Pack hygiene supplies and pain relief for 7 days; shops may stay closed.",
        "Health questions after a quake? Call Healthline free, 24/7: 0800 611 116.",
      ],
      recovery: {
        coverage: [
          { type: "Contents insurance", status: "unknown", note: "As a renter, your landlord's insurance doesn't cover your belongings." },
          { type: "Natural Hazards Commission (NHCover)", status: "gap", note: "Only covers homes with private home insurance, so it protects your landlord, not your contents." },
          { type: "Temporary accommodation", status: "unknown", note: "Check whether your contents policy pays for somewhere to stay." },
        ],
        documents: [
          "Passport / driver licence, toddler's birth certificate",
          "Tenancy agreement and bond lodgement number",
          "Contents insurance policy number + insurer phone",
          "Photos of each room and valuable items",
          "Vaccination and medical records",
          "Cloud copy + USB copy",
        ],
        first_72h: [
          "Follow Civil Defence instructions on radio or getready.govt.nz",
          "Photograph damage before cleanup",
          "Lodge a contents claim with your insurer",
          "Tell your landlord in writing about damage",
        ],
        first_30d: [
          "Apply for MSD Civil Defence Payments if eligible",
          "Check your rights with Tenancy Services if the home is uninhabitable",
          "Keep receipts for temporary costs",
          "Get help from local Civil Defence recovery hubs",
        ],
      },
      alert: {
        event: "Tsunami Warning",
        headline: "NEMA: Tsunami warning for Wellington south coast after M7.6 earthquake (simulated)",
        now_message: {
          en: "Walk to high ground now with your toddler. Go up Constable St to Mount Victoria. Don't drive.",
          mi: "Haere ināianei ki te whenua teitei me tō tamaiti. Kaua e taraiwa.",
        },
      },
    },
  },
);

export const RESOURCES_BY_COUNTRY: Record<string, Resource[]> = {
  USA: US_RESOURCES,
  PHL: [
    { name: "DSWD Assistance (AICS)", provides: "Cash, food and relief for families in crisis", note: "Bring IDs; ask at the barangay or DSWD office", url: "https://www.dswd.gov.ph" },
    { name: "SSS Calamity Loan", provides: "Loan for SSS members in declared calamity areas", note: "Member or spouse must be eligible", url: "https://www.sss.gov.ph" },
    { name: "Pag-IBIG Calamity Loan", provides: "Loan for Pag-IBIG members after a calamity", note: "Apply within the window after declaration", url: "https://www.pagibigfund.gov.ph" },
    { name: "PhilHealth", provides: "Hospital and medical cost coverage", note: "Keep your member number", url: "https://www.philhealth.gov.ph" },
    { name: "OWWA (for OFW families)", provides: "Calamity assistance for families of overseas workers", note: "If a family member works overseas", url: "https://owwa.gov.ph" },
    { name: "NDRRMC / local MDRRMO", provides: "Warnings, evacuation and relief coordination", note: "Emergency: 911", url: "https://ndrrmc.gov.ph" },
  ],
  NZL: [
    { name: "Contents insurance", provides: "Repair or replace your belongings", note: "Renters need their own policy", url: "https://www.icnz.org.nz" },
    { name: "Natural Hazards Commission (NHCover)", provides: "Natural disaster cover for insured homes and land", note: "Only if the home has private insurance", url: "https://www.naturalhazards.govt.nz" },
    { name: "MSD Civil Defence Payments", provides: "Help with food, clothing, bedding, accommodation", note: "During a declared emergency", url: "https://www.workandincome.govt.nz" },
    { name: "Tenancy Services", provides: "Your rights if the rental is damaged", note: "Rent may reduce or end", url: "https://www.tenancy.govt.nz" },
    { name: "Get Ready (NEMA)", provides: "Official preparedness guidance", note: "Emergency: 111", url: "https://getready.govt.nz" },
    { name: "Healthline", provides: "Free health advice from nurses, any time", note: "Free 24/7: 0800 611 116", url: "https://www.healthline.govt.nz" },
  ],
};
