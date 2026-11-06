"use client";

import { UI_LANGS, useLang, type UiLang } from "@/lib/i18n";

export default function LanguageToggle() {
  const { lang, setLang, t } = useLang();
  return (
    <label className="relative flex min-h-10 items-center gap-1.5 rounded-full border border-stone-300 bg-surface pl-3 pr-2 text-sm text-stone-800 hover:border-stone-400">
      <svg viewBox="0 0 20 20" className="h-4 w-4 text-stone-600" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="7.5" />
        <path d="M2.5 10h15M10 2.5c2 2.2 3 4.7 3 7.5s-1 5.3-3 7.5c-2-2.2-3-4.7-3-7.5s1-5.3 3-7.5z" />
      </svg>
      <span className="sr-only">{t("nav.language")}</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as UiLang)}
        className="cursor-pointer appearance-none bg-transparent pr-4 outline-none"
      >
        {UI_LANGS.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 text-[10px] text-stone-500" aria-hidden>▼</span>
    </label>
  );
}
