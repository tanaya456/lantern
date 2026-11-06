import { fetchJson } from "@/lib/fetchJson";
import type { AddressRisk, NearbyPlace } from "@/lib/addressRisk";

// Real risk data for one US location:
//  - FEMA National Risk Index (census tract): overall + per-hazard scores
//  - FEMA National Flood Hazard Layer: flood zone at the point
//  - NWS: active alerts at the point
//  - OpenStreetMap (Photon): nearby community centres, schools, hospitals

const NRI =
  "https://services.arcgis.com/XG15cJAlne2vxtgt/arcgis/rest/services/National_Risk_Index_Census_Tracts/FeatureServer/0/query";
const NFHL = "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query";

const HAZARD_CODES = ["IFLD", "CFLD", "HRCN", "TRND", "WFIR", "ERQK", "HWAV", "CWAV", "WNTW", "TSUN", "LNDS", "SWND", "ISTM", "HAIL", "LTNG", "DRGT", "VLCN", "AVLN"];

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const lat = Number(sp.get("lat"));
  const lon = Number(sp.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return Response.json({ error: "lat/lon required" }, { status: 400 });

  const pt = `geometry=${lon}%2C${lat}&geometryType=esriGeometryPoint&inSR=4326&returnGeometry=false&f=json`;
  const fields = ["STATE", "COUNTY", "RISK_SCORE", "RISK_RATNG", "SOVI_RATNG", "RESL_RATNG", ...HAZARD_CODES.flatMap((c) => [`${c}_RISKS`, `${c}_RISKR`])].join(",");
  // Nearby places from Photon (OpenStreetMap), biased to the address.
  const photon = (q: string, tag: string) =>
    fetchJson<{ features?: { geometry: { coordinates: [number, number] }; properties: { name?: string } }[] }>(
      `https://photon.komoot.io/api/?q=${q}&lat=${lat}&lon=${lon}&limit=8&osm_tag=amenity:${tag}`,
      7000,
    );

  const [nri, flood, nws, hosp, school, community] = await Promise.all([
    fetchJson<{ features?: { attributes: Record<string, string | number | null> }[] }>(`${NRI}?${pt}&outFields=${fields}`),
    fetchJson<{ features?: { attributes: { FLD_ZONE: string; ZONE_SUBTY?: string } }[] }>(`${NFHL}?${pt}&outFields=FLD_ZONE,ZONE_SUBTY`),
    fetchJson<{ features?: { properties: { event: string; headline: string; severity: string } }[] }>(`https://api.weather.gov/alerts/active?point=${lat.toFixed(4)},${lon.toFixed(4)}`),
    photon("hospital", "hospital"),
    photon("school", "school"),
    photon("community%20centre", "community_centre"),
  ]);

  const a = nri?.features?.[0]?.attributes;
  const hazards = a
    ? HAZARD_CODES.map((c) => ({ code: c, score: Number(a[`${c}_RISKS`] ?? 0), rating: String(a[`${c}_RISKR`] ?? "") }))
        .filter((h) => h.score > 0)
        .sort((x, y) => y.score - x.score)
    : [];

  const dist = (la: number, lo: number) => {
    const R = 6371;
    const dLa = ((la - lat) * Math.PI) / 180;
    const dLo = ((lo - lon) * Math.PI) / 180;
    const s = Math.sin(dLa / 2) ** 2 + Math.cos((lat * Math.PI) / 180) * Math.cos((la * Math.PI) / 180) * Math.sin(dLo / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  };

  const toPlaces = (fc: typeof hosp, kind: NearbyPlace["kind"]): NearbyPlace[] =>
    (fc?.features ?? [])
      .filter((f) => f.properties.name)
      .map((f) => {
        const [lo, la] = f.geometry.coordinates;
        return { name: f.properties.name!, kind, lat: la, lon: lo, km: Math.round(dist(la, lo) * 10) / 10 };
      });
  const places: NearbyPlace[] = [...toPlaces(community, "shelter"), ...toPlaces(school, "school"), ...toPlaces(hosp, "hospital")]
    .filter((p, i, all) => p.km <= 10 && all.findIndex((x) => x.name === p.name) === i)
    .sort((x, y) => x.km - y.km);

  const body: AddressRisk = {
    lat,
    lon,
    county: a ? `${a.COUNTY}, ${a.STATE}` : null,
    overall: a ? { score: Number(a.RISK_SCORE ?? 0), rating: String(a.RISK_RATNG ?? "") } : null,
    hazards,
    floodZone: flood?.features?.[0]?.attributes?.FLD_ZONE ?? null,
    alerts: (nws?.features ?? []).map((f) => ({ event: f.properties.event, headline: f.properties.headline, severity: f.properties.severity })).slice(0, 3),
    places: places.slice(0, 12),
    sources: { nri: !!a, flood: !!flood, nws: !!nws, osm: !!(hosp || school || community) },
  };
  return Response.json(body);
}
