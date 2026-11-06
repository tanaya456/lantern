"use client";

import { useT } from "@/lib/i18n";
import type { EmdatProfile } from "@/lib/live";

export const fmt = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(n >= 1e8 ? 0 : 1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : String(n);

export default function PastDisasters({ profile, countryName }: { profile: EmdatProfile; countryName: string }) {
  const t = useT();
  const w = 560;
  const h = 140;
  const pad = 36;
  const top = 16;
  const years = profile.years;
  const max = Math.max(...years.map((y) => y.affected), 1);
  const first = profile.since;
  const last = years[years.length - 1]?.year ?? first;
  const bw = (w - pad) / (last - first + 1);
  const xOf = (year: number) => pad + (year - first) * bw;
  const peak = years.reduce((a, b) => (b.affected > a.affected ? b : a), years[0]);

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <h3 className="font-semibold text-stone-900">{t("past.title", { country: countryName })}</h3>
      <p className="text-sm text-stone-600">
        {t("past.summary", { events: profile.totals.events, since: profile.since, deaths: fmt(profile.totals.deaths), affected: fmt(profile.totals.affected) })}
      </p>
      <svg viewBox={`0 ${-top} ${w} ${h + 18 + top}`} className="mt-3 w-full" role="img" aria-label={`People affected by disasters per year in ${countryName}. Peak in ${peak.year}: ${fmt(peak.affected)}.`}>
        <line x1={pad} x2={w} y1={h} y2={h} stroke="#d6d3d1" />
        <text x={pad - 4} y={10} textAnchor="end" fontSize="10" fill="#78716c">{fmt(max)}</text>
        <text x={pad - 4} y={h} textAnchor="end" fontSize="10" fill="#78716c">0</text>
        {years.map((y) => {
          const bh = (y.affected / max) * (h - 6);
          return (
            <g key={y.year}>
              <rect x={xOf(y.year) + 1} y={h - bh} width={Math.max(bw - 2, 1)} height={bh} rx={2} fill={y.year === peak.year ? "#4e6653" : "#aebfa5"}>
                <title>{`${y.year}: ${y.affected.toLocaleString()} people affected, ${y.deaths.toLocaleString()} deaths, ${y.events} events`}</title>
              </rect>
            </g>
          );
        })}
        {Array.from({ length: Math.floor((last - first) / 5) + 1 }, (_, k) => first + k * 5).map((yr) => (
          <text key={yr} x={xOf(yr) + bw / 2} y={h + 14} textAnchor="middle" fontSize="10" fill="#78716c">{yr}</text>
        ))}
        <text x={xOf(peak.year) + bw / 2} y={h - (peak.affected / max) * (h - 6) - 4} textAnchor="middle" fontSize="10" fontWeight="600" fill="#4e6653">
          {fmt(peak.affected)}
        </text>
      </svg>
      <p className="mt-1 text-xs text-stone-500">
        {t("past.most")} {profile.topTypes.join(", ")}. {t("country.source")}:{" "}
        <a className="underline" href="https://www.emdat.be" target="_blank" rel="noreferrer">EM-DAT, CRED / UCLouvain</a>, {t("past.asof")} {profile.asOf}.
      </p>
    </div>
  );
}
