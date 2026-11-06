import { COUNTRIES } from "@/lib/countries";
import { fetchJson, readCache } from "@/lib/fetchJson";
import type { CountryHazard, CountryResponse } from "@/lib/live";

interface ThinkHazardRow {
  hazardtype: { mnemonic: string; hazardtype: string };
  hazardlevel: { mnemonic: "HIG" | "MED" | "LOW" | "VLO"; title: string };
}
type WorldBank = [unknown, { date: string; value: number | null }[] | null];
interface GeoNetVolc {
  features: { properties: { volcanoTitle: string; level: number; activity: string } }[];
}

const LEVEL: Record<string, CountryHazard["level"]> = { HIG: "High", MED: "Medium", LOW: "Low", VLO: "Very low" };

export async function GET(_req: Request, ctx: RouteContext<"/api/country/[iso]">) {
  const { iso } = await ctx.params;
  const c = COUNTRIES.find((x) => x.iso3 === iso.toUpperCase());
  if (!c) return Response.json({ error: "Unknown country" }, { status: 404 });

  const [th, wb, volc] = await Promise.all([
    fetchJson<ThinkHazardRow[]>(`https://thinkhazard.org/en/report/${c.thinkHazard}.json`),
    fetchJson<WorldBank>(`https://api.worldbank.org/v2/country/${c.iso3}/indicator/SP.HOU.FEMA.ZS?format=json&mrnev=1`),
    c.iso3 === "NZL" ? fetchJson<GeoNetVolc>("https://api.geonet.org.nz/volcano/val") : Promise.resolve(null),
  ]);

  if (!th) {
    const cache = await readCache<CountryResponse>(`country-cache/${c.iso3}.json`);
    if (cache) return Response.json({ ...cache, cached: true });
  }

  const wbRow = wb?.[1]?.[0];
  const body: CountryResponse = {
    iso: c.iso3,
    updated: new Date().toISOString(),
    cached: false,
    hazards: (th ?? []).map((r) => ({
      code: r.hazardtype.mnemonic,
      name: r.hazardtype.hazardtype,
      level: LEVEL[r.hazardlevel.mnemonic] ?? "Low",
    })),
    femaleHeaded: wbRow?.value != null ? { value: wbRow.value, year: wbRow.date } : null,
    volcanoes: volc?.features
      .map((f) => ({ name: f.properties.volcanoTitle, level: f.properties.level, activity: f.properties.activity }))
      .sort((a, b) => b.level - a.level),
  };
  return Response.json(body);
}
