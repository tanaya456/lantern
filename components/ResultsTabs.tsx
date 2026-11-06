"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { Banknote, CircleCheck, FileText, HandHeart, HeartPulse, Home, Landmark, Phone, ShieldCheck, Siren, Umbrella, Users, Waves } from "lucide-react";
import MapLegend from "@/components/MapLegend";
import RiskSummary from "@/components/RiskSummary";
import { useLang, type StrKey } from "@/lib/i18n";
import { RESOURCES_AS_OF, type Resource } from "@/lib/mockData";
import type { GoBagItem, Household, Persona } from "@/lib/types";

const RiskMap = dynamic(() => import("@/components/RiskMap"), { ssr: false });

export const TABS = ["risks", "prepare", "safe", "recover"] as const;
export type Tab = (typeof TABS)[number];

const card = "rounded-2xl border border-line bg-surface p-5";
const h3 = "font-semibold text-stone-900";

function Check({ label, sub }: { label: string; sub?: string }) {
  return (
    <li className="flex gap-2.5">
      <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-sage-700" aria-label={label} />
      <div>
        <div className="text-sm text-stone-900">{label}</div>
        {sub && <div className="text-xs text-stone-500">{sub}</div>}
      </div>
    </li>
  );
}

function BagList({ title, subtitle, items }: { title: string; subtitle: string; items: GoBagItem[] }) {
  return (
    <div className="rounded-xl border border-line bg-paper/40 p-4">
      <div className={h3}>{title}</div>
      <div className="mb-3 text-xs text-stone-500">{subtitle}</div>
      <ul className="space-y-2.5">
        {items.map((i) => <Check key={i.item} label={i.item} sub={i.why} />)}
      </ul>
    </div>
  );
}

function resourceIcon(name: string) {
  const n = name.toLowerCase();
  if (/flood|nfip/.test(n)) return Waves;
  if (/earthquake|natural hazards/.test(n)) return Home;
  if (/insurance/.test(n)) return Umbrella;
  if (/loan|sba|pag-ibig|sss/.test(n)) return Landmark;
  if (/fema|dswd|aics|msd|owwa|assistance/.test(n)) return HandHeart;
  if (/health|phil/.test(n)) return HeartPulse;
  if (/ndrrmc|get ready|civil/.test(n)) return Siren;
  if (/tenancy/.test(n)) return ShieldCheck;
  if (/211|local|nonprofit/.test(n)) return Phone;
  return Users;
}

function IconTitle({ icon: Icon, children }: { icon: typeof Banknote; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 font-semibold text-stone-900">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sage-100 text-sage-800"><Icon className="h-4 w-4" aria-hidden /></span>
      {children}
    </h3>
  );
}

function MapCard({ persona }: { persona: Persona }) {
  return (
    <div className="flex h-full min-h-[320px] flex-col gap-2 print:hidden">
      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-line">
        <RiskMap persona={persona} />
      </div>
      <MapLegend persona={persona} />
    </div>
  );
}

export default function ResultsTabs({
  persona,
  household,
  resources,
  tab,
  setTab,
}: {
  persona: Persona;
  household: Household;
  resources: Resource[];
  tab: Tab;
  setTab: (t: Tab) => void;
}) {
  const { t, lang } = useLang();
  const r = persona.result;
  const [hz, setHz] = useState(0);
  const plan = r.plans[hz] ?? r.plans[0];
  const touchX = useRef<number | null>(null);
  const idx = TABS.indexOf(tab);
  const go = (d: number) => setTab(TABS[Math.min(TABS.length - 1, Math.max(0, idx + d))]);
  const nameOf = (id: string) => r.hazards.find((h) => h.id === id)?.name ?? id;

  const hazardPicker = r.plans.length > 1 && (
    <div className="flex flex-wrap items-center gap-2 print:hidden" role="group" aria-label={t("plan.title")}>
      {r.plans.map((p, i) => (
        <button
          key={p.hazardId}
          aria-pressed={i === hz}
          onClick={() => setHz(i)}
          className={`min-h-9 rounded-full border px-3 text-sm ${i === hz ? "border-sage-700 bg-sage-700 text-white" : "border-line bg-surface text-stone-700 hover:border-sage-600"}`}
        >
          {nameOf(p.hazardId)}
        </button>
      ))}
    </div>
  );

  const tags = (
    <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
      {household.members.map((m) => <span key={m} className="rounded-full bg-surface px-2 py-0.5 text-sage-800">{t(`m.${m}` as StrKey)}</span>)}
      <span className="rounded-full bg-surface px-2 py-0.5 text-sage-800">{household.car ? t("plan.hasCar") : t("plan.noCar")}</span>
      {household.mobility && <span className="rounded-full bg-surface px-2 py-0.5 text-sage-800">{t("plan.mobility")}</span>}
      {household.pets && <span className="rounded-full bg-surface px-2 py-0.5 text-sage-800">{t("plan.pets")}</span>}
      <span className="rounded-full bg-surface px-2 py-0.5 text-sage-800">{t(`home.${household.home}` as StrKey)}</span>
    </div>
  );

  const panels: Record<Tab, React.ReactNode> = {
    risks: (
      <div className="grid h-full gap-5 lg:grid-cols-5">
        <div className="lg:col-span-2 lg:overflow-y-auto">
          <RiskSummary summary={r.risk_summary} hazards={r.hazards} />
        </div>
        <div className="lg:col-span-3">{tab === "risks" && <MapCard persona={persona} />}</div>
      </div>
    ),

    prepare: (
      <div className="grid h-full gap-5 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2 lg:overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className={h3}>{t("plan.gobag")}</h3>
            {hazardPicker}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <BagList title={t("plan.g5")} subtitle={t("plan.g5sub")} items={plan.go_bag.grab_5_min} />
            <BagList title={t("plan.g30")} subtitle={t("plan.g30sub")} items={plan.go_bag.grab_30_min} />
          </div>
          <div className="rounded-xl border border-sage-200 bg-sage-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-sage-800">{t("plan.often")}</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-800">
              {r.easy_to_forget.map((w) => <li key={w}>{w}</li>)}
            </ul>
          </div>
        </div>
        <div className="space-y-4 lg:overflow-y-auto">
          <div className={card}>
            <IconTitle icon={FileText}>{t("rec.vault")}</IconTitle>
            <ul className="mt-2 space-y-2">{r.recovery.documents.map((d) => <Check key={d} label={d} />)}</ul>
          </div>
          <div className={card}>
            <IconTitle icon={ShieldCheck}>{t("rec.coverage")}</IconTitle>
            <ul className="mt-2 space-y-2">
              {r.recovery.coverage.map((c) => (
                <li key={c.type} className="text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-stone-900">{c.type}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.status === "covered" ? "bg-sage-100 text-sage-800" : c.status === "gap" ? "bg-[#f3dfd7] text-clay-700" : "bg-[#f2e8cf] text-[#7a5a17]"}`}>
                      {t(c.status === "covered" ? "rec.covered" : c.status === "gap" ? "rec.gap" : "rec.check")}
                    </span>
                  </div>
                  <p className="text-stone-600">{c.note}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    ),

    safe: (
      <div className="grid h-full gap-5 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2 lg:overflow-y-auto">
          {hazardPicker}
          <div className="rounded-xl bg-sage-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-sage-800">{t("plan.trigger")}</div>
            <p className="mt-1 text-lg font-medium leading-snug text-stone-900">{plan.trigger_point}</p>
            {tags}
          </div>
          {plan.evacuation && (
            <div className={card}>
              <h3 className={h3}>{t("plan.evac")}</h3>
              <dl className="mt-2 space-y-2 text-sm">
                <div><dt className="text-stone-500">{t("plan.when")}</dt><dd className="text-stone-900">{plan.evacuation.when_to_leave}</dd></div>
                <div><dt className="text-stone-500">{t("plan.where")}</dt><dd className="text-stone-900">{plan.evacuation.destinations.join(" · ")}</dd></div>
                <div><dt className="text-stone-500">{t("plan.primary")}</dt><dd className="text-stone-900">{plan.evacuation.primary_route}</dd></div>
                <div><dt className="text-stone-500">{t("plan.backup")}</dt><dd className="text-stone-900">{plan.evacuation.backup_route}</dd></div>
              </dl>
              <p className="mt-2 text-xs text-stone-500">{t("plan.closures")}</p>
            </div>
          )}
          {plan.shelter_in_place && (
            <div className={card}>
              <h3 className={h3}>{t("plan.shelter")}</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-800">
                {plan.shelter_in_place.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
        <div className="lg:col-span-3">{tab === "safe" && <MapCard persona={persona} />}</div>
      </div>
    ),

    recover: (
      <div className="grid h-full gap-5 lg:grid-cols-2">
        <div className="space-y-4 lg:overflow-y-auto">
          <div className={card}>
            <IconTitle icon={Siren}>{t("rec.72")}</IconTitle>
            <ul className="mt-2 space-y-2">{r.recovery.first_72h.map((s) => <Check key={s} label={s} />)}</ul>
          </div>
          <div className={card}>
            <IconTitle icon={CircleCheck}>{t("rec.30")}</IconTitle>
            <ul className="mt-2 space-y-2">{r.recovery.first_30d.map((s) => <Check key={s} label={s} />)}</ul>
          </div>
          <div className={card}>
            <IconTitle icon={Home}>{t("rec.rebuild")}</IconTitle>
            <p className="mt-1 text-sm text-stone-700">{t("rec.rebuildText")}</p>
          </div>
        </div>
        <div className="lg:overflow-y-auto">
          <div className={card}>
            <IconTitle icon={Banknote}>{t("rec.resources")}</IconTitle>
            <ul className="mt-2 divide-y divide-line">
              {resources.map((x) => (
                <li key={x.name} className="flex gap-3 py-2 text-sm">
                  {(() => {
                    const I = resourceIcon(x.name);
                    return <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage-800"><I className="h-4 w-4" aria-hidden /></span>;
                  })()}
                  <div>
                  <a href={x.url} target="_blank" rel="noreferrer" className="font-medium text-sage-800 underline-offset-2 hover:underline">{x.name}</a>
                  <div className="text-stone-700">{x.provides}</div>
                  <div className="text-xs text-stone-500">{x.note}</div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-stone-500">{t("rec.foot", { date: RESOURCES_AS_OF })}</p>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label={t("plan.title")} className="grid grid-cols-4 gap-1 rounded-2xl border border-line bg-sand p-1 print:hidden"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
      >
        {TABS.map((k, i) => (
          <button
            key={k}
            role="tab"
            id={`tab-${k}`}
            aria-selected={tab === k}
            aria-controls={`panel-${k}`}
            tabIndex={tab === k ? 0 : -1}
            onClick={() => setTab(k)}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-2 text-sm font-medium transition ${tab === k ? "bg-surface text-sage-800 shadow-sm" : "text-stone-600 hover:text-stone-900"}`}
          >
            <span className={`hidden h-5 w-5 items-center justify-center rounded-full text-[11px] sm:flex ${tab === k ? "bg-sage-700 text-white" : "bg-sand text-stone-700"}`}>{i + 1}</span>
            {t(`tab.${k}` as StrKey)}
          </button>
        ))}
      </div>

      {lang !== "en" && tab !== "risks" && (
        <p className="rounded-lg bg-[#f2e8cf] px-3 py-1.5 text-xs text-[#6b4f14] print:hidden">{t("plan.englishNote")}</p>
      )}

      <div
        className="lg:h-[calc(100vh-290px)] lg:min-h-[440px]"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {TABS.map((k) => (
          <section
            key={k}
            id={`panel-${k}`}
            role="tabpanel"
            aria-labelledby={`tab-${k}`}
            className={`h-full ${tab === k ? "block" : "hidden"} print:mb-6 print:block print:h-auto`}
          >
            <h2 className="mb-2 hidden text-lg font-semibold print:block">{t(`tab.${k}` as StrKey)}</h2>
            {panels[k]}
          </section>
        ))}
      </div>

      <div className="flex items-center justify-between print:hidden">
        <button onClick={() => go(-1)} disabled={idx === 0} className="min-h-10 rounded-xl px-3 text-sm text-stone-700 disabled:opacity-30">← {idx > 0 ? t(`tab.${TABS[idx - 1]}` as StrKey) : ""}</button>
        <span className="hidden text-xs text-stone-500 sm:block">{t("tab.hint")}</span>
        {idx < TABS.length - 1 ? (
          <button onClick={() => go(1)} className="min-h-10 rounded-xl bg-sage-700 px-4 text-sm font-medium text-white hover:bg-sage-800">
            {t(`tab.${TABS[idx + 1]}` as StrKey)} →
          </button>
        ) : (
          <span className="w-24" aria-hidden />
        )}
      </div>
    </div>
  );
}
