"use client";

import dynamic from "next/dynamic";
import { COUNTRIES } from "@/lib/countries";
import { eventTitle } from "@/lib/eventTitle";
import { useT, type StrKey } from "@/lib/i18n";
import { ALERT_COLOR, type LiveEvent } from "@/lib/live";

const SpinningGlobe = dynamic(() => import("@/components/SpinningGlobe"), { ssr: false, loading: () => <MapLoading /> });

function MapLoading() {
  const t = useT();
  return <div className="flex h-full items-center justify-center text-sm text-stone-500">{t("land.loadingMap")}</div>;
}

export default function Landing({
  events,
  eventsCached,
  heat,
  onCountry,
}: {
  heat: [number, number, number][];
  events: LiveEvent[] | null;
  eventsCached: boolean;
  onCountry: (iso: string) => void;
}) {
  const t = useT();

  const countryList = (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">{t("land.choose")}</div>
      <div className="mt-2 space-y-1.5">
        {COUNTRIES.map((c) => (
          <button
            key={c.iso3}
            onClick={() => onCountry(c.iso3)}
            className="group flex min-h-12 w-full items-center justify-between rounded-xl border border-line bg-surface px-3 text-left transition hover:border-sage-700 hover:bg-sage-50"
          >
            <span>
              <span className="block font-semibold text-stone-900">{c.name}</span>
              <span className="block text-xs text-stone-600">{t(`tag.${c.iso3}` as StrKey)}</span>
            </span>
            <span className="text-sage-800 transition group-hover:translate-x-0.5" aria-hidden>→</span>
          </button>
        ))}
      </div>
    </div>
  );

  const alertList = (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">{t("land.now")}</div>
        <div className="text-[11px] text-stone-500">GDACS · USGS · {eventsCached ? t("land.cached") : t("land.live")}</div>
      </div>
      <ul className="mt-2 max-h-48 space-y-1.5 overflow-y-auto pr-1">
        {(events ?? []).slice(0, 8).map((e) => (
          <li key={e.id} className="flex gap-2 text-sm leading-snug">
            <i className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: ALERT_COLOR[e.alert] }} aria-hidden />
            <a href={e.url} target="_blank" rel="noreferrer" className="text-stone-800 hover:underline">
              <span className="sr-only">{t(`legend.${e.alert}` as StrKey)}: </span>
              {eventTitle(e, t)}
            </a>
          </li>
        ))}
        {events === null && <li className="text-sm text-stone-500">{t("land.loading")}</li>}
      </ul>
    </div>
  );

  return (
    <section className="mx-auto max-w-6xl px-4 pb-10">
      <div className="flex flex-col gap-3 pt-8 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            {t("land.h1a")} <span className="text-lantern">{t("land.h1b")}</span>
          </h1>
          <p className="mt-2 text-lg text-stone-700">{t("land.sub")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-stone-700">
          <span className="relative flex h-2.5 w-2.5" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
          </span>
          {events ? t("land.active", { n: events.length }) : t("land.checking")}
        </div>
      </div>

      <div id="map" className="relative h-[62vh] min-h-[420px] scroll-mt-4 overflow-hidden rounded-3xl border border-line bg-[radial-gradient(circle_at_50%_45%,#eef7fc_0%,#d8ebf6_55%,#c4def0_100%)] lg:h-[70vh]">
        <SpinningGlobe heat={heat} events={events ?? []} onCountryClick={onCountry} />

        <div className="pointer-events-none absolute inset-0 z-[500] hidden p-4 lg:flex lg:flex-col lg:items-start lg:justify-between">
          <div className="pointer-events-auto w-72 rounded-2xl bg-surface/95 p-4 shadow-lg backdrop-blur">{countryList}</div>
          <div className="pointer-events-auto w-80 self-end rounded-2xl bg-surface/95 p-4 shadow-lg backdrop-blur [&_ul]:max-h-32">{alertList}</div>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex flex-wrap gap-3 rounded-full bg-surface/90 px-3 py-1.5 text-[11px] text-stone-700 shadow">
          {(["Red", "Orange", "Green"] as const).map((a) => (
            <span key={a} className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: ALERT_COLOR[a] }} />{t(`legend.${a}`)}</span>
          ))}
          <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-3.5 rounded-sm bg-sage-500/40" />{t("legend.explore")}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:hidden">
        <div className="rounded-2xl border border-line bg-surface p-4">{countryList}</div>
        <div className="rounded-2xl border border-line bg-surface p-4">{alertList}</div>
      </div>

      <p className="mt-5 text-center text-sm text-stone-600">
        {t("land.howto")} <span className="text-stone-500">{t("land.promise")}</span>
      </p>
    </section>
  );
}
