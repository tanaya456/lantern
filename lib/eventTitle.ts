import type { StrKey, T } from "./i18n";
import type { LiveEvent } from "./live";

// Localise the hazard label; keep the event's own name (storm names, places) as reported by GDACS / USGS.
export function eventTitle(e: LiveEvent, t: T) {
  const label = t(`ev.${e.type}` as StrKey);
  if (e.source === "USGS") {
    const [mag, place] = e.title.split(": ");
    return `${label} ${mag.replace(" earthquake", "")}: ${place ?? ""}`;
  }
  const name = e.title.replace(/^(Tropical Cyclone|Earthquake in|Flood in|Drought in|Forest fires? in|Eruption)\s*/i, "");
  return `${label}: ${name}`;
}
