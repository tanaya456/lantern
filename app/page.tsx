"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import AlertBanner from "@/components/AlertBanner";
import CountryView from "@/components/CountryView";
import DemoTour from "@/components/DemoTour";
import HouseholdStep from "@/components/HouseholdStep";
import ResultsTabs, { type Tab } from "@/components/ResultsTabs";
import Landing from "@/components/Landing";
import LanguageToggle from "@/components/LanguageToggle";
import Logo from "@/components/Logo";
import emNZL from "@/data/emdat/NZL.json";
import emPHL from "@/data/emdat/PHL.json";
import emUSA from "@/data/emdat/USA.json";
import { countryByIso, type Country } from "@/lib/countries";
import type { AddressHit } from "@/components/AddressSearch";
import { buildAddressPersona, DEFAULT_HOUSEHOLD, type AddressRisk } from "@/lib/addressRisk";
import { LangProvider, useLang } from "@/lib/i18n";
import type { EmdatProfile, LiveEvent } from "@/lib/live";
import { PERSONAS, RESOURCES_BY_COUNTRY } from "@/lib/mockData";
import type { Household, Persona } from "@/lib/types";

function Loading() {
  const { t } = useLang();
  return <div className="flex h-full items-center justify-center text-sm text-stone-500">{t("land.loadingMap")}</div>;
}
const WorldMap = dynamic(() => import("@/components/WorldMap"), { ssr: false, loading: Loading });

const EMDAT: Record<string, EmdatProfile> = { PHL: emPHL, NZL: emNZL, USA: emUSA } as unknown as Record<string, EmdatProfile>;

type Step = "world" | "country" | "household" | "results";

const eventsFor = (c: Country, events: LiveEvent[]) =>
  events.filter((e) => e.iso3.includes(c.iso3) || e.countries.includes(c.name) || e.title.includes(c.name));

export default function Page() {
  return (
    <LangProvider>
      <Home />
    </LangProvider>
  );
}

function Home() {
  const { t, lang } = useLang();
  const [step, setStep] = useState<Step>("world");
  const [country, setCountry] = useState<Country | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [address, setAddress] = useState("");
  const [household, setHousehold] = useState<Household | null>(null);
  const [alertOn, setAlertOn] = useState(false);
  const [events, setEvents] = useState<LiveEvent[] | null>(null);
  const [eventsCached, setEventsCached] = useState(false);
  const [heat, setHeat] = useState<[number, number, number][]>([]);
  const [addr, setAddr] = useState<{ risk: AddressRisk; label: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [tour, setTour] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>("risks");

  // Deep links for presenting: ?c=PHL (country) · ?p=tacloban (plan) · ?p=tacloban&alert=1
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const p = PERSONAS.find((x) => x.id === q.get("p"));
    const c = countryByIso(q.get("c") ?? p?.country ?? "");
    /* eslint-disable react-hooks/set-state-in-effect -- one-time init from the URL */
    if (c) {
      setCountry(c);
      setStep("country");
    }
    if (p) {
      setPersona(p);
      setAddress(p.address);
      setHousehold(p.household);
      setStep("results");
      setAlertOn(q.get("alert") === "1");
      if (q.get("alert") === "1") setTab("safe");
      const qt = q.get("tab") as Tab | null;
      if (qt) setTab(qt);
    }
    if (q.get("tour") === "1") {
      setTour(0);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.events);
        setEventsCached(d.cached);
        setHeat(d.heat ?? []);
      })
      .catch(() => setEvents([]));
  }, []);

  const top = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const toMap = () => setTimeout(() => document.getElementById("map")?.scrollIntoView({ behavior: "smooth" }), 50);

  const openCountry = (iso: string) => {
    const c = countryByIso(iso);
    if (!c) return;
    setCountry(c);
    setAlertOn(false);
    setStep("country");
    top();
  };

  // Start the household language from the site language when that country offers it.
  const householdFor = (p: Persona): Household => {
    const langs = countryByIso(p.country)?.languages ?? [];
    return langs.some((l) => l.code === lang) && lang !== "en" ? { ...p.household, language: lang } : p.household;
  };

  const pickPersona = (p: Persona, typed?: string) => {
    setAddr(null);
    setPersona(p);
    setAddress(typed ?? p.address);
    setHousehold(householdFor(p));
    setStep("household");
    top();
  };

  // Real US address: fetch FEMA/NWS/OSM data, then go to the household questions.
  const pickAddress = async (a: AddressHit) => {
    setBusy(true);
    try {
      const risk: AddressRisk = await fetch(`/api/address?lat=${a.lat}&lon=${a.lon}`).then((r) => r.json());
      const h = { ...DEFAULT_HOUSEHOLD, language: lang === "es" ? "es" : "en" };
      setAddr({ risk, label: a.label });
      setCountry(countryByIso("USA")!);
      setPersona(buildAddressPersona(risk, a.label, h));
      setAddress(a.label);
      setHousehold(h);
      setAlertOn(false);
      setStep("household");
      top();
    } finally {
      setBusy(false);
    }
  };

  const goWorld = () => {
    setStep("world");
    setAlertOn(false);
    top();
  };

  // Each tour step puts the app in the right state, so anyone can present it the same way.
  const applyTour = (i: number) => {
    setTour(i);
    const tac = PERSONAS.find((p) => p.id === "tacloban")!;
    if (i === 0) goWorld();
    if (i === 1) {
      setStep("world");
      setAlertOn(false);
      toMap();
    }
    if (i === 2) openCountry("PHL");
    if (i === 3) {
      setCountry(countryByIso("PHL")!);
      setAlertOn(false);
      pickPersona(tac);
    }
    if (i === 4) {
      setCountry(countryByIso("PHL")!);
      setPersona(tac);
      setAddress(tac.address);
      setHousehold(householdFor(tac));
      setAlertOn(false);
      setTab("risks");
      setStep("results");
      top();
    }
    if (i === 5) {
      setAlertOn(true);
      setTab("safe");
      top();
    }
  };

  const activeCountry = persona ? countryByIso(persona.country) : country;

  return (
    <div className="min-h-screen bg-paper">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[3000] focus:rounded focus:bg-surface focus:px-3 focus:py-2">
        {t("nav.skip")}
      </a>
      <header className="border-b border-line bg-sand print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <button onClick={goWorld} aria-label={t("nav.home")}>
            <Logo />
          </button>
          <div className="flex items-center gap-2">
            <LanguageToggle />
          </div>
        </div>
      </header>

      <div id="main">
        {step === "world" && (
          <Landing events={events} eventsCached={eventsCached} heat={heat} onCountry={openCountry} />
        )}

        {step === "country" && country && (
          <main className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-6 h-[260px] overflow-hidden rounded-2xl border border-line bg-surface">
              <WorldMap center={country.center} zoom={country.zoom} events={eventsFor(country, events ?? [])} activeIso={country.iso3} heat={heat} onCountryClick={openCountry} />
            </div>
            <CountryView
              country={country}
              personas={PERSONAS.filter((p) => p.country === country.iso3)}
              events={eventsFor(country, events ?? [])}
              emdat={EMDAT[country.iso3]}
              onPick={pickPersona}
              onBack={goWorld}
              onAddress={pickAddress}
              busy={busy}
            />
          </main>
        )}

        {step === "household" && persona && household && activeCountry && (
          <HouseholdStep
            key={persona.id}
            address={address}
            initial={household}
            languages={activeCountry.languages}
            onBack={() => openCountry(persona.country)}
            onDone={(h) => {
              setHousehold(h);
              if (addr) setPersona(buildAddressPersona(addr.risk, addr.label, h));
              setTab("risks");
              setStep("results");
              top();
            }}
          />
        )}

        {step === "results" && persona && household && activeCountry && (
          <>
            {alertOn && (
              <div className="sticky top-0 z-[1000]">
                <AlertBanner
                  key={persona.id}
                  alert={persona.result.alert}
                  initialLang={household.language}
                  languages={activeCountry.languages}
                  onClose={() => setAlertOn(false)}
                />
              </div>
            )}
            <main className="mx-auto max-w-6xl space-y-4 px-4 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <button onClick={() => openCountry(persona.country)} className="text-sm text-stone-600 hover:text-stone-900 print:hidden">← {activeCountry.name}</button>
                  <p className="text-sm text-stone-600">{t("res.planFor")}</p>
                  <h1 className="text-2xl font-bold text-stone-900">{address}</h1>
                </div>
                <div className="flex gap-2 print:hidden">
                  <button onClick={() => window.print()} className="min-h-11 rounded-xl border border-stone-300 bg-surface px-4 text-sm font-medium text-stone-800 hover:bg-stone-100">
                    {t("res.print")}
                  </button>
                  <button
                    onClick={() => {
                      setAlertOn(true);
                      setTab("safe");
                      top();
                    }}
                    className="min-h-11 rounded-xl bg-clay-600 px-4 text-sm font-semibold text-white hover:bg-clay-700"
                  >
                    {t("res.simulate")}
                  </button>
                </div>
              </div>

              <ResultsTabs
                persona={persona}
                household={household}
                resources={RESOURCES_BY_COUNTRY[persona.country] ?? []}
                tab={tab}
                setTab={setTab}
              />

              <p className="rounded-xl border border-line bg-surface p-4 text-center text-sm text-stone-700">
                {t("res.disclaimer")}
              </p>
            </main>
          </>
        )}
      </div>

      {tour !== null && (
        <DemoTour step={tour} onNext={() => applyTour(tour + 1)} onPrev={() => applyTour(Math.max(0, tour - 1))} onClose={() => setTour(null)} />
      )}

      <footer className="pb-8 text-center text-xs text-stone-500 print:hidden">
        {t("footer.data")} {t("footer.demo")}
      </footer>
    </div>
  );
}
