# Lantern (formerly Safe Harbor): Spec

> Enter an address. See your climate risk through a gender and recovery-capacity lens. Get a personal emergency plan, matched funding programs, and insurance guidance, built on real public data and Claude.

## 1. Problem

Generic disaster alerts say "a flood is coming." They don't say what *you* should do, given your home, your people, and your constraints. And after the disaster, the hardest part (paying to recover) is left to the household.

**Hypothesis:** women are more affected by climate disasters. The research suggests the drivers are household structure and income, with gender as the lens that shows who carries those burdens:
- A 2024 FAO study covered 100k+ households in 24 low- and middle-income countries. It found that rural **female-headed households lost 8% more income in heat waves and 3% more in floods** than male-headed households.
- In flood-hit informal settlements in Accra, female-headed households were less able to prepare, cope, and recover. The causes were care responsibilities, larger families, lower employment, and limited access to resources.
- In Mexico, female-headed households relied mostly on family and friends to rebuild, while male-headed households used a wider and more effective set of recovery strategies.

So the model measures **income, single-earner status, caregiving load, and access to credit and insurance**, and treats gender as the lens. That makes it both more defensible and more accurate.

**Insurance pressure:** per Treasury data, homeowners in the top 20% of climate-risk ZIP codes pay about 82% more in premiums and face the highest nonrenewal rates. First Street projects premiums rising about 29% by 2055, and links each 1% premium increase to roughly a 1.05% rise in foreclosures.

*(The stats come from the team's research notes; verify each one against its source before putting it on pitch slides.)*

## 2. Positioning: what already exists and how we differ

| Existing tool | What it does | Gap |
|---|---|---|
| **CalEnviroScreen 5.0** (CA, OEHHA) | Tract score = pollution burden × population vulnerability. The top 25% of tracts are designated disadvantaged (SB 535), which unlocks Greenhouse Gas Reduction Fund money | CA only; pollution-focused; no household view; no "now what" |
| **FEMA National Risk Index** | Tract/county score = expected annual loss × social vulnerability ÷ community resilience | No gender or caregiving lens; not actionable for one household |
| **First Street** (now MSCI) | Address-level 1–10 hazard scores on real estate sites, used by insurers | Scores can push premiums up and home values down (Florida sued them); owners can't correct their score |

**Our difference isn't the risk score.** It's (1) the gender and recovery-capacity lens and (2) the "now what" step: a personal plan, funding she likely qualifies for, and insurance protection.

## 3. Core ideas

1. **Personal trigger point:** everyone gets the same alert, but each person needs to act at a different time. A single mom with no car and a basement unit has to leave hours before a neighbor with a truck.
2. **Recovery-capacity score:** combine place-based hazard (FEMA NRI, flood zone) with tract-level demographics (female-headed households, poverty, single-earner homes) and her own optional answers.
3. **Now what:** match her to existing programs (we don't fund anyone ourselves) and give insurance steps she can take before a disaster.
4. **Privacy as a feature:** her personal answers stay in her browser session and are never stored or sold. We show *her* the risk to help her, not to price her. This answers the First Street critique directly.

## 4. Demo persona

**Maria**: a single mom in a garden-level apartment in a flood zone in a California tract with a high CalEnviroScreen score. She speaks Spanish, has no car, a 4-year-old, and her mother, who has diabetes and needs refrigerated insulin. She rents, has no renters or flood insurance, and is the only earner in the household.

## 5. User flow

1. **Landing:** address input and a **"Try demo address"** button.
2. **Optional details** (chips/toggles, all skippable):
   - Household: infants/kids, elders, pets, pregnant/breastfeeding; single earner
   - Mobility needs; medications (flag refrigeration-dependent)
   - Car access; rent vs. own; insurance held (homeowners/renters/flood/none)
   - Housing type: basement, ground floor, upper floor, mobile home
   - Preferred language; DV-aware mode (discreet plan, no specific locations shared)
3. **Results dashboard** (tabs or cards):
   - **Risk:** map (home pin, FEMA flood-zone overlay, shelters and hospitals), flood zone, elevation, NRI hazard rating, active NWS alerts, and a **recovery-capacity** rating with a plain-language explanation of why
   - **Plan:** trigger point, staged action plan, and a go-bag split into 5-minute and 30-minute items
   - **Funding:** programs she likely qualifies for, each with why, what to prepare, and a link
   - **Insurance:** what her current coverage does and doesn't cover (e.g. "standard renters and homeowners policies exclude flood"), NFIP options, and documentation steps to take now (photo inventory, cloud copies of policies)
4. **"Simulate Flash Flood Warning"** button: sends a synthetic escalated alert, Claude re-plans, and a **"What to do NOW"** banner appears in her language.

## 6. Data sources (free public APIs) and fallback

| Need | Source |
|---|---|
| Geocode + census tract | US Census Geocoder: `https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress?address=...&benchmark=Public_AR_Current&vintage=Current_Current&format=json` (returns lat/lon + tract GEOID). Nominatim as a fallback |
| Tract demographics | Census ACS API `api.census.gov`: female-headed households (B11001), poverty (B17001), language isolation (C16002) |
| Hazard + social vulnerability | FEMA National Risk Index, tract level (ArcGIS feature service or the downloadable CSV, pre-filtered to the demo state). *Verify the endpoint during the build* |
| Pollution burden (CA) | CalEnviroScreen 5.0 tract scores (OEHHA download, pre-filtered to a small JSON) |
| Active alerts | NWS: `https://api.weather.gov/alerts/active?point={lat},{lon}` |
| Flood zone | FEMA NFHL: `https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query` (point → `FLD_ZONE`) + map overlay |
| Elevation | USGS EPQS: `https://epqs.nationalmap.gov/v1/json?x={lon}&y={lat}&units=Meters` |
| Shelters / hospitals | Overpass API (OSM) within ~3 km |
| Funding programs | `data/programs.json`: curated list with eligibility rules (FEMA Individual Assistance, SBA disaster loans, FEMA Flood Mitigation Assistance, NFIP, state programs such as CA GGRF-funded resilience grants for SB 535 communities, local 211) |
| **Fallback** | `data/demo.json`: cached responses for the demo address, so the demo never depends on venue Wi-Fi |

All calls run in parallel with about a 5 s timeout. If a source fails, the app uses cached or empty data and keeps going.

## 7. Claude integration

- Server route `POST /api/plan`, `@anthropic-ai/sdk`
- Model `claude-opus-5-5`, adaptive thinking, effort `low`; structured output via `output_config.format`; server-side refusal fallbacks enabled
- API key only in `.env.local` (`ANTHROPIC_API_KEY`), never sent to the browser
- **Input:** profile, tract demographics, NRI, CalEnviroScreen, flood zone, elevation, alerts, nearby places, program list, optional simulated alert
- **Output JSON:**
  - `risk_level` + `risk_summary`; `recovery_capacity` (`low | medium | high`) + `why[]`
  - `trigger_point`
  - `action_plan`: Now / At Watch / At Warning / After
  - `go_bag.grab_in_5_min[]`, `go_bag.grab_in_30_min[]` (each with a reason)
  - `women_specific[]`: menstrual, pregnancy, infant, shelter safety, DV-aware
  - `shelter_recommendation`
  - `funding_matches[]`: `{program, why_eligible, documents_needed, link}`, selected **only** from `programs.json` (no invented programs)
  - `insurance[]`: coverage gaps + actions
  - `now_message`: in her preferred language
- Estimated cost is about 2–3¢ per plan

## 8. Stack and structure

Next.js (App Router), TypeScript, Tailwind, react-leaflet (`dynamic(..., { ssr: false })`), esri-leaflet for the FEMA overlay.

```
app/page.tsx              landing + details form
app/results/page.tsx      dashboard: Risk / Plan / Funding / Insurance
app/api/hazard/route.ts   geocode + census + NRI + CES + NWS + FEMA + USGS + Overpass
app/api/plan/route.ts     Claude call
components/RiskMap.tsx, RiskCard.tsx, PlanView.tsx, GoBag.tsx,
           FundingList.tsx, InsuranceCard.tsx, AlertBanner.tsx
lib/prompt.ts             system prompt
data/demo.json, data/programs.json, data/nri_ca.json, data/ces5_ca.json
.env.local                ANTHROPIC_API_KEY=...   (gitignored)
```

## 9. Two-hour timeline

| Time | Work |
|---|---|
| 0:00–0:15 | Scaffold, deps, API key; pre-filter NRI/CES data for the demo area |
| 0:15–0:45 | `/api/hazard` + map + risk card |
| 0:45–1:15 | `/api/plan` + prompt + schema; `programs.json` |
| 1:15–1:40 | Dashboard tabs (Plan / Funding / Insurance), Simulate Warning, language banner |
| 1:40–2:00 | Cache demo data, offline test, rehearse pitch |

If time runs short, cut in this order: CalEnviroScreen layer → Census ACS demographics (use NRI social vulnerability instead) → Insurance tab (fold it into the plan).

## 10. Out of scope (MVP)

- Global coverage (see Vision)
- Acting as a funder or submitting applications. We match and prepare; she applies through the official program
- Premium predictions or any score shared with insurers or lenders
- Live flooded-road routing (unreliable and a safety risk)
- SMS delivery, accounts, saved plans

## 11. Vision (post-hackathon)

- **Global:** fine-grained gender data is thin in most of the world (Myanmar's post-disaster assessment lacked age- and sex-disaggregated data across sectors). Expand one region at a time, starting with California → US → partner countries with good survey data (DHS, FAO).
- **Who pays:** the target households are unlikely to pay. Likely customers are governments (directing resilience money), philanthropies, CDFIs/lenders, or insurers offering mitigation discounts. The choice shapes the product, and it's the first question a climate VC will ask.
- **Threshold insight:** the CalEnviroScreen top-25% cutoff decides where billions of dollars go. A household-level lens could show women in *just-below-cutoff* tracts who are missed by tract-level designations.
- **Score fairness:** let users see and contest the inputs to their score. This is the fix for the First Street critique.

## 12. Pitch (3 min)

1. Hook: female-headed households lose more and recover slower
2. Existing scores price risk; Lantern helps you act on it
3. Maria: enter her address and details → Risk, Plan, Funding, Insurance
4. Click **Simulate Flash Flood Warning** → the plan updates and a Spanish "what to do now" banner appears
5. Close: same alert, a personal plan, and a path to recovery

## 13. Safety and trust

- The UI always shows: *"Follow instructions from local emergency officials. This plan supplements them; it does not replace them."* If an evacuation order is active, the app tells her to call 911.
- Funding and insurance results are informational, not financial or legal advice, and link to official sources.
- Personal answers are not stored.
