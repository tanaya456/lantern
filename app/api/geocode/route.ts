import { fetchJson } from "@/lib/fetchJson";

// US address autocomplete via Photon (OpenStreetMap data, built for search-as-you-type).
interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: Record<string, string | undefined>;
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 3) return Response.json({ results: [] });

  const url =
    `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lang=en` +
    `&bbox=-170,17,-64,72&lat=39&lon=-98`;
  const data = await fetchJson<{ features: PhotonFeature[] }>(url, 6000);

  const results = (data?.features ?? [])
    .filter((f) => f.properties.countrycode === "US")
    .map((f) => {
      const p = f.properties;
      const line1 = [p.housenumber, p.street ?? p.name].filter(Boolean).join(" ") || p.name || p.city || "";
      const line2 = [p.city ?? p.district ?? p.county, p.state, p.postcode].filter(Boolean).join(", ");
      return { label: [line1, line2].filter(Boolean).join(", "), line1, line2, lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0] };
    })
    .filter((r, i, all) => r.label && all.findIndex((x) => x.label === r.label) === i)
    .slice(0, 6);

  return Response.json({ results });
}
