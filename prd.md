# PRD: Address-to-Action Emergency Preparedness

Working title. Women in AI Claude Hackathon, climate track.

## 1. Overview
A web app where a user enters her address and gets (1) the disaster risks that actually apply to that location, ranked, and (2) a personalized plan for each: what to pack, when to leave, where to go, and which route to take. Geospatial hazard data supplies the facts; Claude turns them into plain-language, household-specific guidance.

**One-line pitch:** Enter your address. Know your risks. Know exactly what to do.

## 2. Problem
Most people know disasters exist but not which ones threaten their home, and generic checklists ignore their situation. Women are disproportionately affected in disasters, are more often the primary caregivers for children and elders, and have needs that standard checklists skip (menstrual and maternal health supplies, childcare, safety in shelters). Risk data exists in a dozen government portals, none of which tell you what to do.

## 3. Goals and Non-Goals
**Goals**
- Convert an address into a clear, ranked list of local hazards within seconds.
- Generate a tailored preparedness plan: go-bag, evacuation routes and destinations, and trigger points.
- Make guidance usable by non-experts: plain language, optional multilingual output.

**Non-goals (for the hackathon and v1)**
- Replacing official emergency alerts or evacuation orders.
- Real-time turn-by-turn navigation during an event.
- Coverage outside the US (noted as a roadmap item).

## 4. Users
**Primary:** A woman, 25 to 55, living in a hazard-exposed area, who is responsible for others (children, elders, pets) and has never made an emergency plan.

**Example personas for the demo**
- Single parent with two kids in a flood-zone apartment, no car.
- Older woman living alone in a wildfire-prone area with limited mobility.
- Renter in a coastal tsunami zone with a baby.

## 5. User Flow
1. Enter address (autocomplete, or "use my location").
2. See risk summary: hazards ranked by severity for that location (wildfire, flood, earthquake, hurricane, tsunami, winter storm, extreme heat), each with a level and a one-sentence plain-language explanation.
3. Optional household questions (about 5, skippable): who lives with you, mobility needs, car access, pets, home type or floor level, language.
4. Get the plan for each top risk:
   - Go-bag checklist, split into "grab in 5 minutes" and "if you have 30".
   - Evacuation plan: when to leave, primary and backup route, and destinations (shelters, high ground, family meeting point).
   - Shelter-in-place guidance where evacuation is not the right response (e.g. earthquake).
   - Recovery and rebuild readiness: which resources she can access (insurance, aid, loans) and whether she could afford to rebuild if the worst happens (see 6.1).
5. Save or share: printable one-page plan and shareable link.

## 6. Functional Requirements

| # | Requirement | Priority |
|---|---|---|
| F1 | Geocode an address to coordinates and census tract | P0 |
| F2 | Retrieve hazard risk by location from open data sources (see section 8) | P0 |
| F3 | Display ranked hazard list with severity and plain-language explanation | P0 |
| F4 | Map view showing the address, hazard overlay (e.g. flood zone), nearby shelters and high ground | P0 |
| F5 | Claude-generated go-bag checklist per hazard, tailored to household answers | P0 |
| F6 | Claude-generated evacuation guidance: trigger points, routes, destinations | P0 |
| F7 | Household profile questions that adjust the plan | P1 |
| F8 | Printable one-page plan (PDF) | P1 |
| F9 | Multilingual output (e.g. Spanish, Mandarin) | P1 |
| F10 | Simulated alert mode: trigger a mock NWS alert and show the "what to do now" message | P1 (great for demo) |
| F11 | Vulnerability layer (CDC SVI) to flag higher-need areas | P2 |
| F12 | Live alert subscription via SMS or WhatsApp | P2 |
| F13 | Insurance readiness check: confirm coverage types (homeowners or renters, flood, earthquake) against the user's top hazards and flag likely gaps | P1 |
| F14 | Document vault checklist: home inventory photos, receipts, policy numbers, ID, deed or lease, with a one-page export | P1 |
| F15 | Recovery guide: claim steps, links to disaster aid and loan programs, and a first-72-hours and first-30-days checklist | P1 |
| F16 | Rebuild shortfall estimate: compare a rough rebuild cost with the user's coverage limits and show the gap | P2 |

### 6.1 Recovery and Rebuild Readiness
This feature helps a user check, before a disaster, that she could afford and document a rebuild, and then walks her through claims and aid afterward. It gives general information only, not insurance or legal advice.

**Before a disaster: readiness check**
- **Coverage check:** Does she have homeowners or renters insurance, and separate flood or earthquake coverage where her top hazards call for it? Standard homeowners policies commonly exclude flood and earthquake, so these are the gaps to flag first.
- **Shortfall estimate:** Compare a rough rebuild cost with her coverage limits and deductibles, and show the gap.
- **Document vault:** A checklist for a photo or video home inventory, receipts, policy numbers and agent contact, ID, and deed or lease, stored in the cloud and as an offline copy.
- **Questions for her insurer:** Replacement cost versus actual cash value, temporary housing (loss of use) coverage, and hazard-specific deductibles.

**After a disaster: claims and aid guide**
1. **First 72 hours:** Get safe, photograph damage before cleanup, open a claim with the insurer, and keep receipts for temporary expenses.
2. **First 30 days:** Apply for aid, track claim correspondence in one place, and get repair estimates.
3. **Rebuild:** Match available funds to the repair plan and flag what is still uncovered.

**Resources she can access**

| Resource | What it can provide | Note |
|---|---|---|
| Homeowners or renters insurance | Repair or replacement costs, temporary housing | Check exclusions and limits |
| Flood insurance (federal NFIP or private) | Flood damage repair | Separate policy, usually with a waiting period before it starts |
| Earthquake insurance | Quake damage repair | Separate policy or endorsement |
| FEMA Individual Assistance | Grants for temporary housing and essential repairs | Only after a federal disaster declaration; not a substitute for insurance |
| SBA disaster loans | Low-interest loans for rebuilding and replacing belongings | Open to homeowners and renters |
| State, local, and nonprofit programs | Short-term cash, shelter, and supplies | Varies by region; verify before showing |

**Claude's role:** Explain policy language in plain terms when the user pastes her policy, build the personalized checklists, and draft claim documentation. **Guardrail:** Claude states what a policy covers only from the text the user provides, and always points her to her insurer or agent to confirm.

**Data note:** Program terms change, so link each resource to its official page and show an as-of date. For the hackathon demo, use a curated, pre-verified resource list.

## 7. How Claude Is Used
Claude is the reasoning and communication layer, not the source of hazard facts.
- **Inputs to Claude:** structured hazard data for the address, household profile, nearby resource list (from OSM), and the user's language.
- **Outputs from Claude:** ranked, plain-language risk explanation; personalized checklists; evacuation guidance; translated alert text.
- **Guardrails:**
  - Claude must only cite risks present in the retrieved data. No invented hazards or distances.
  - Always include a disclaimer to follow official local authorities.
  - Structured output (JSON) for checklists and routes so the UI renders consistently.
  - Flag uncertainty when data is missing or stale.
- **Safety-sensitive content:** go-bag lists include medication and documents handling guidance at a general level only, with no medical advice beyond "ask your clinician".

## 8. Data Sources

| Need | Source |
|---|---|
| Multi-hazard baseline (wildfire, flood, earthquake, hurricane, tsunami, more) | FEMA National Risk Index |
| Flood zones | FEMA National Flood Hazard Layer |
| Real-time alerts | NWS alerts API (api.weather.gov) |
| Earthquake hazard and live events | USGS Seismic Hazard APIs and earthquake feeds |
| Wildfire | USFS Wildfire Risk to Communities, NASA FIRMS, NIFC |
| Tsunami zones | NOAA / state tsunami hazard maps |
| Shelters, hospitals, roads, high ground | OpenStreetMap (Overpass API) |
| Household context (optional) | Census / ACS, CDC SVI |

**Data rules:** Cache all data for demo addresses ahead of time. Keep a licenses and attribution slide (OSM requires credit). Label any simulated shelter data clearly.

## 9. Success Metrics
**Hackathon (demo)**
- Address to full plan in under 60 seconds.
- Correct risk ranking for 3 demo addresses in different hazard regions.
- Judges can see the "before vs. after": generic checklist versus personalized plan.

**Product (post-hackathon)**
- % of users who complete a plan and download or share it.
- Plan relevance rating (thumbs up or down per section).
- Number of users who report taking one concrete action (packing a bag, picking a meeting point).

## 10. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| LLM hallucinates a hazard or route | Ground Claude in retrieved data only; structured outputs; show data source next to each claim |
| API outage or rate limit during demo | Pre-cache data for demo addresses; offline fallback |
| Users treat the plan as official guidance | Prominent disclaimer; link to local emergency management |
| Address privacy | Don't store addresses by default; process per session |
| Uneven data coverage by region | Show "limited data" state rather than guessing |

## 11. Hackathon Scope and Plan
**Must ship (MVP):** F1 to F6 for the US, with 3 pre-cached demo addresses (e.g. flood, wildfire, earthquake or tsunami).

**Stretch:** F7, F8, F10 (simulated alert is the best demo moment).

**Suggested split**
- Data and geo: geocoding, FEMA NRI and NFHL lookups, OSM shelters.
- Claude and prompts: plan generation, structured output, multilingual.
- Frontend: address input, risk cards, map, plan view.
- Pitch and design: persona story, demo script, licenses slide.

**Demo script (3 minutes):** Persona intro, enter address, risk cards appear, map shows flood zone and shelters, plan generates, trigger simulated alert, show a translated "what to do now" message.

## 12. Open Questions
- Which 3 demo addresses best show range (e.g. flood, wildfire, coastal)?
- Do we include household questions in the MVP, or only in stretch?
- Which languages are most credible for the team to verify?
- Do we position this for individuals, or as a tool for community organizations that serve women?

## 13. Roadmap (Beyond Hackathon)
- Live alerts via SMS or WhatsApp with personalized "what to do now" messages.
- Community mode: shared plans for neighbors, shelters, and women's organizations.
- International coverage using ThinkHazard! and regional datasets.
- Check-in feature: "Are your supplies current?" reminders twice a year.
