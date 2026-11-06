import { fetchJson } from "@/lib/fetchJson";

// FEMA National Risk Index census tracts around a point, as GeoJSON, for the red/orange risk heat map.
const NRI =
  "https://services.arcgis.com/XG15cJAlne2vxtgt/arcgis/rest/services/National_Risk_Index_Census_Tracts/FeatureServer/0/query";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const lat = Number(sp.get("lat"));
  const lon = Number(sp.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return Response.json({ type: "FeatureCollection", features: [] });
  const d = 0.09;
  const env = `${lon - d * 1.2},${lat - d},${lon + d * 1.2},${lat + d}`;
  const url =
    `${NRI}?geometry=${env}&geometryType=esriGeometryEnvelope&inSR=4326&outSR=4326` +
    `&outFields=RISK_SCORE,RISK_RATNG&returnGeometry=true&maxAllowableOffset=0.0004&geometryPrecision=5&f=geojson`;
  const fc = await fetchJson(url, 10000);
  return Response.json(fc ?? { type: "FeatureCollection", features: [] });
}
