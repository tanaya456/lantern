"use client";

import { useState } from "react";
import type { LangOption } from "@/lib/countries";
import { useT } from "@/lib/i18n";
import type { Language, PlanResult } from "@/lib/types";

export default function AlertBanner({
  alert,
  initialLang,
  languages,
  onClose,
}: {
  alert: PlanResult["alert"];
  initialLang: Language;
  languages: LangOption[];
  onClose: () => void;
}) {
  const t = useT();
  const options = languages.filter((l) => alert.now_message[l.code]);
  const [lang, setLang] = useState<Language>(alert.now_message[initialLang] ? initialLang : "en");
  const current = options.find((o) => o.code === lang);
  return (
    <div role="alert" className="animate-[slidein_.35s_ease-out] border-b-4 border-clay-700 bg-clay-600 text-white shadow-lg">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-100">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-surface" />
            {t("alert.sim")} · {alert.event}
          </div>
          <div className="mt-0.5 text-sm text-red-100">{alert.headline}</div>
          <div className="mt-2 text-xl font-bold sm:text-2xl">
            {lang === "en" ? "What to do NOW: " : ""}
            {alert.now_message[lang]}
          </div>
          {current && !current.verified && (
            <div className="mt-1 text-xs text-red-100">{t("alert.draft")}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-white/40 text-sm" role="group" aria-label={t("alert.lang")}>
            {options.map((l) => (
              <button
                key={l.code}
                aria-pressed={lang === l.code}
                onClick={() => setLang(l.code)}
                className={`min-h-11 px-3 ${lang === l.code ? "bg-surface text-red-800" : "hover:bg-surface/10"}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="min-h-11 rounded-lg px-3 text-sm hover:bg-surface/10">{t("alert.dismiss")}</button>
        </div>
      </div>
    </div>
  );
}
