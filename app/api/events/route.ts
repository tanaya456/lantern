import { fetchJson, readCache } from "@/lib/fetchJson";
import type { AlertLevel, EventsResponse, LiveEvent } from "@/lib/live";

const GDACS =
  "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventlist=EQ;TC;FL;VO;DR;WF&alertlevel=Orange;Red";
const USGS = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";
const USGS_MONTH = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson";

interface GeoFeature {
  id?: string;
  geometry: { coordinates: number[] };
  properties: Record<string, unknown>;
}
interface FC {
  features: GeoFeature[];
}

const DAY = 86_400_000;

export async function GET() {
  const [g, u, um] = await Promise.all([fetchJson<FC>(GDACS), fetchJson<FC>(USGS), fetchJson<FC>(USGS_MONTH, 10000)]);

  if (!g && !u) {
    const cache = await readCache<EventsResponse>("events-cache.json");
    if (cache) return Response.json({ ...cache, cached: true });
    return Response.json({ updated: new Date().toISOString(), cached: true, events: [], heat: [] });
  }

  const now = Date.now();
  const events: LiveEvent[] = [];

  for (const f of g?.features ?? []) {
    const p = f.properties as Record<string, string>;
    const to = Date.parse(p.todate ?? p.fromdate);
    if (p.iscurrent !== "true" && now - to > 14 * DAY) continue; // only ongoing or recent
    const affected = String(p.affectedcountries ?? "");
    const iso3 = Array.from(affected.matchAll(/'iso3': '([A-Z]{3})'/g)).map((m) => m[1]);
    events.push({
      id: `gdacs-${p.eventtype}-${p.eventid}`,
      type: p.eventtype as LiveEvent["type"],
      title: String(p.name).replace(/\s+/g, " ").slice(0, 90),
      countries: String(p.country ?? ""),
      iso3: iso3.length ? iso3 : [p.iso3].filter(Boolean),
      alert: p.alertlevel as AlertLevel,
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      date: p.fromdate,
      source: "GDACS",
      url: `https://www.gdacs.org/report.aspx?eventtype=${p.eventtype}&eventid=${p.eventid}`,
    });
  }

  for (const f of u?.features ?? []) {
    const p = f.properties as { mag: number; place: string; time: number; url: string };
    if (p.mag < 5.5) continue;
    events.push({
      id: `usgs-${f.id}`,
      type: "EQ",
      title: `M${p.mag.toFixed(1)} earthquake: ${p.place}`,
      countries: p.place.split(", ").pop() ?? "",
      iso3: [],
      alert: p.mag >= 7 ? "Red" : p.mag >= 6 ? "Orange" : "Green",
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      date: new Date(p.time).toISOString(),
      source: "USGS",
      url: p.url,
    });
  }

  events.sort((a, b) => (a.alert === b.alert ? b.date.localeCompare(a.date) : a.alert === "Red" ? -1 : b.alert === "Red" ? 1 : 0));

  // Heat map points [lat, lon, weight]: every GDACS Orange/Red event this year + USGS M2.5+ quakes this month.
  const W = { Red: 1, Orange: 0.7, Green: 0.4 } as const;
  const heat: [number, number, number][] = [
    ...(g?.features ?? []).map((f) => {
      const p = f.properties as Record<string, string>;
      return [f.geometry.coordinates[1], f.geometry.coordinates[0], W[p.alertlevel as keyof typeof W] ?? 0.5] as [number, number, number];
    }),
    ...(um?.features ?? []).map((f) => {
      const mag = Number((f.properties as { mag: number }).mag) || 2.5;
      return [f.geometry.coordinates[1], f.geometry.coordinates[0], Math.min(1, (mag - 2) / 5)] as [number, number, number];
    }),
  ].map(([a, b, w]) => [Math.round(a * 100) / 100, Math.round(b * 100) / 100, Math.round(w * 100) / 100]);

  const body: EventsResponse = { updated: new Date().toISOString(), cached: false, events, heat };
  return Response.json(body);
}
