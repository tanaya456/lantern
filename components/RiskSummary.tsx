"use client";

import { useT, type StrKey } from "@/lib/i18n";
import type { Hazard, Level } from "@/lib/types";

export const levelStyle: Record<Level, { badge: string; bar: string }> = {
  "Very High": { badge: "bg-red-100 text-red-800", bar: "bg-red-500" },
  High: { badge: "bg-orange-100 text-orange-800", bar: "bg-orange-500" },
  Moderate: { badge: "bg-amber-100 text-amber-800", bar: "bg-amber-400" },
  Low: { badge: "bg-emerald-100 text-emerald-800", bar: "bg-emerald-500" },
};

export default function RiskSummary({ summary, hazards }: { summary: string; hazards: Hazard[] }) {
  const t = useT();
  const ranked = [...hazards].sort((a, b) => b.score - a.score);
  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-lg font-semibold text-stone-900">{t("risk.title")}</h2>
      <p className="mt-1 text-stone-700">{summary}</p>
      <ol className="mt-5 space-y-4">
        {ranked.map((h, i) => (
          <li key={h.id}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-5 text-sm font-semibold text-stone-400">{i + 1}</span>
                <span className="font-medium text-stone-900">{h.name}</span>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${levelStyle[h.level].badge}`}>{t(`lvl.${h.level}` as StrKey)}</span>
            </div>
            <div className="ml-7 mt-1.5 h-1.5 rounded-full bg-stone-100">
              <div className={`h-1.5 rounded-full ${levelStyle[h.level].bar}`} style={{ width: `${h.score}%` }} />
            </div>
            <p className="ml-7 mt-1.5 text-sm text-stone-600">{h.explanation}</p>
            <p className="ml-7 text-xs text-stone-400">{t("risk.source")}: {h.source}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
