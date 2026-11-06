"use client";

import { useEffect, useState } from "react";
import { eventTitle } from "@/lib/eventTitle";
import AddressSearch, { type AddressHit } from "@/components/AddressSearch";
import PastDisasters from "@/components/PastDisasters";
import type { Country } from "@/lib/countries";
import { useT, type StrKey } from "@/lib/i18n";
import { ALERT_COLOR, type CountryResponse, type EmdatProfile, type LiveEvent } from "@/lib/live";
import type { Persona } from "@/lib/types";

const LEVEL_CLS: Record<string, string> = {
  High: "bg-red-100 text-red-800",
  Medium: "bg-orange-100 text-orange-800",
  Low: "bg-amber-50 text-amber-800",
  "Very low": "bg-emerald-50 text-emerald-800",
};
const ORDER = ["High", "Medium", "Low", "Very low"];

export default function CountryView({
  country,
  personas,
  events,
  emdat,
  onPick,
  onBack,
  onAddress,
  busy,
}: {
  onAddress: (a: AddressHit) => void;
  busy: boolean;
  country: Country;
  personas: Persona[];
  events: LiveEvent[];
  emdat?: EmdatProfile;
  onPick: (p: Persona, typed?: string) => void;
  onBack: () => void;
}) {
  const t = useT();
  const [data, setData] = useState<CountryResponse | null>(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
    let live = true;
    fetch(`/api/country/${country.iso3}`)
      .then((r) => r.json())
      .then((d) => live && setData(d))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [country.iso3]);

  const hazards = [...(data?.hazards ?? [])].sort((a, b) => ORDER.indexOf(a.level) - ORDER.indexOf(b.level));

  return (
    <section className="space-y-6">
      <div>
        <button onClick={onBack} className="text-sm text-stone-600 hover:text-stone-900">{t("country.back")}</button>
        <h2 className="mt-1 text-3xl font-bold text-stone-900">{country.name}</h2>
        <p className="mt-1 max-w-2xl text-stone-700">{t(`blurb.${country.iso3}` as StrKey)}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <h3 className="font-semibold text-stone-900">{t("country.hazards")}</h3>
            {hazards.length ? (
              <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {hazards.map((h) => (
                  <li key={h.code} className="flex items-center justify-between gap-2 rounded-xl border border-line px-3 py-2">
                    <span className="text-sm text-stone-800">{h.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${LEVEL_CLS[h.level]}`}>{t(`hz.${h.level}` as StrKey)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-stone-500">{t("country.loadingHaz")}</p>
            )}
            <p className="mt-2 text-xs text-stone-500">
              {t("country.source")}:{" "}
              <a className="underline" href="https://thinkhazard.org" target="_blank" rel="noreferrer">ThinkHazard! (GFDRR)</a>
              {data?.cached ? ` · ${t("country.cachedCopy")}` : ` · ${t("land.live")}`}
            </p>
          </div>
          {emdat && <PastDisasters profile={emdat} countryName={country.name} />}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border-2 border-sage-700 bg-surface p-5">
            <h3 className="font-semibold text-stone-900">{t("country.getPlan")}</h3>
            {country.iso3 === "USA" ? (
              <div className="mt-3">
                <AddressSearch onPick={onAddress} busy={busy} />
                <p className="mt-1 text-xs text-stone-500">Real FEMA risk data, flood zone and weather alerts for any US address.</p>
              </div>
            ) : (
              <>
              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (address.trim()) onPick(personas[0], address.trim());
                }}
              >
                <label htmlFor="addr" className="sr-only">{t("country.addr")}</label>
                <input
                  id="addr"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t("country.addr")}
                  className="min-h-11 flex-1 rounded-xl border border-stone-300 px-3 outline-none focus:border-sage-700 focus:ring-2 focus:ring-sage-700/20"
                />
                <button className="min-h-11 rounded-xl bg-sage-700 px-4 font-semibold text-white hover:bg-sage-800">{t("country.go")}</button>
              </form>
              <p className="mt-1 text-xs text-stone-500">{t("country.typedNote")}</p>
              </>
            )}
            <p className="mt-4 text-sm font-medium text-stone-800">{t("country.meet")}</p>
            <div className="mt-2 space-y-2">
              {personas.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onPick(p)}
                  className="w-full rounded-xl border border-line p-3 text-left transition hover:border-sage-700 hover:bg-sage-50"
                >
                  <div className="font-semibold text-stone-900">{p.label} · {p.address.replace(" (demo)", "")}</div>
                  <div className="text-sm text-stone-600">{p.tagline}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5">
            <h3 className="font-semibold text-stone-900">{t("land.now")}</h3>
            {events.length ? (
              <ul className="mt-2 space-y-2">
                {events.slice(0, 5).map((e) => (
                  <li key={e.id} className="flex gap-2 text-sm">
                    <i className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: ALERT_COLOR[e.alert] }} aria-hidden />
                    <a href={e.url} target="_blank" rel="noreferrer" className="text-stone-800 hover:underline">{eventTitle(e, t)}</a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-stone-500">{t("country.noAlerts")}</p>
            )}
            {data?.volcanoes && (
              <>
                <h4 className="mt-4 text-sm font-semibold text-stone-900">{t("country.volcano")}</h4>
                <ul className="mt-1 grid grid-cols-2 gap-x-3 text-sm text-stone-700">
                  {data.volcanoes.slice(0, 6).map((v) => (
                    <li key={v.name}>{v.name}: <strong>{v.level}</strong></li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
