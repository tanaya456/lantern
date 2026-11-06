"use client";

import { useT, type StrKey } from "@/lib/i18n";
import type { Persona, PlaceType } from "@/lib/types";

export const placeColor: Record<PlaceType, string> = {
  shelter: "#7c3aed",
  high_ground: "#16a34a",
  meeting_point: "#d97706",
  hospital: "#db2777",
};

export const placeLabel: Record<PlaceType, string> = {
  shelter: "Shelter",
  high_ground: "High ground",
  meeting_point: "Meeting point",
  hospital: "Hospital",
};

export default function MapLegend({ persona }: { persona: Persona }) {
  const t = useT();
  const types = Array.from(new Set(persona.places.map((p) => p.type)));
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600">
      <span className="flex items-center gap-1.5"><i className="inline-block h-3 w-3 rounded-full bg-slate-900" />{t("map.home")}</span>
      <span className="flex items-center gap-1.5">
        <i className="inline-block h-3 w-4 rounded-sm opacity-60" style={{ background: persona.overlay.color }} />
        {persona.overlay.label}
      </span>
      {types.map((pt) => (
        <span key={pt} className="flex items-center gap-1.5">
          <i className="inline-block h-3 w-3 rounded-full" style={{ background: placeColor[pt] }} />
          {t(`map.${pt}` as StrKey)}
        </span>
      ))}
      <span className="text-stone-400">{t("map.sim")}</span>
    </div>
  );
}
