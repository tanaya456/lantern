"use client";

import { useState } from "react";
import type { LangOption } from "@/lib/countries";
import { useT, type StrKey } from "@/lib/i18n";
import type { Household } from "@/lib/types";

const MEMBER_OPTIONS = ["Just me", "Kids", "Baby", "Elder", "Partner"];
const HOME_OPTIONS: Household["home"][] = ["Apartment (ground floor)", "Apartment (upper floor)", "House", "Mobile home", "Informal / light housing"];

function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`min-h-11 rounded-full border px-4 py-2 text-sm transition ${
        on ? "border-sage-700 bg-sage-700 text-white" : "border-stone-300 bg-surface text-stone-700 hover:border-sage-600"
      }`}
    >
      {children}
    </button>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line py-5 last:border-0">
      <div className="mb-3 font-medium text-stone-900">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export default function HouseholdStep({
  address,
  initial,
  languages,
  onDone,
  onBack,
}: {
  address: string;
  initial: Household;
  languages: LangOption[];
  onDone: (h: Household) => void;
  onBack: () => void;
}) {
  const t = useT();
  const [h, setH] = useState<Household>(initial);
  const toggleMember = (m: string) =>
    setH((s) => ({ ...s, members: s.members.includes(m) ? s.members.filter((x) => x !== m) : [...s.members, m] }));

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <button onClick={onBack} className="text-sm text-stone-500 hover:text-stone-800">{t("hh.back")}</button>
      <h2 className="mt-4 text-3xl font-bold text-stone-900">{t("hh.title")}</h2>
      <p className="mt-2 text-stone-600">
        {t("hh.for")} <span className="font-medium">{address}</span>. {t("hh.optional")}
      </p>

      <div className="mt-6 rounded-2xl border border-line bg-surface px-6">
        <Row label={t("hh.who")}>
          {MEMBER_OPTIONS.map((m) => (
            <Chip key={m} on={h.members.includes(m)} onClick={() => toggleMember(m)}>{t(`m.${m}` as StrKey)}</Chip>
          ))}
        </Row>
        <Row label={t("hh.mobility")}>
          <Chip on={h.mobility} onClick={() => setH({ ...h, mobility: true })}>{t("hh.yes")}</Chip>
          <Chip on={!h.mobility} onClick={() => setH({ ...h, mobility: false })}>{t("hh.no")}</Chip>
        </Row>
        <Row label={t("hh.car")}>
          <Chip on={h.car} onClick={() => setH({ ...h, car: true })}>{t("hh.yes")}</Chip>
          <Chip on={!h.car} onClick={() => setH({ ...h, car: false })}>{t("hh.no")}</Chip>
        </Row>
        <Row label={t("hh.pets")}>
          <Chip on={h.pets} onClick={() => setH({ ...h, pets: true })}>{t("hh.yes")}</Chip>
          <Chip on={!h.pets} onClick={() => setH({ ...h, pets: false })}>{t("hh.no")}</Chip>
        </Row>
        <Row label={t("hh.home")}>
          {HOME_OPTIONS.map((o) => (
            <Chip key={o} on={h.home === o} onClick={() => setH({ ...h, home: o })}>{t(`home.${o}` as StrKey)}</Chip>
          ))}
        </Row>
        <Row label={t("hh.lang")}>
          {languages.map((l) => (
            <Chip key={l.code} on={h.language === l.code} onClick={() => setH({ ...h, language: l.code })}>{l.label}</Chip>
          ))}
        </Row>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button onClick={() => onDone(initial)} className="rounded-xl px-5 py-3 text-stone-600 hover:text-stone-900">{t("hh.skip")}</button>
        <button onClick={() => onDone(h)} className="rounded-xl bg-sage-700 px-6 py-3 font-semibold text-white hover:bg-sage-800">
          {t("hh.build")}
        </button>
      </div>
    </section>
  );
}
