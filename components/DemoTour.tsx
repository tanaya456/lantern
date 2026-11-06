"use client";

import { useT, type StrKey } from "@/lib/i18n";

export const TOUR_STEPS = 6;

export default function DemoTour({ step, onNext, onPrev, onClose }: { step: number; onNext: () => void; onPrev: () => void; onClose: () => void }) {
  const t = useT();
  const s = { title: t(`tour.${step}.t` as StrKey), text: t(`tour.${step}.x` as StrKey) };
  return (
    <div className="fixed bottom-4 right-4 z-[2000] w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-line bg-surface p-5 shadow-2xl print:hidden" role="dialog" aria-label={t("nav.tour")}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-sage-800">{t("tour.label")} · {step + 1} {t("tour.of")} {TOUR_STEPS}</span>
        <button onClick={onClose} className="min-h-9 rounded-lg px-2 text-sm text-stone-500 hover:text-stone-900" aria-label={t("tour.close")}>✕</button>
      </div>
      <h2 className="mt-1 text-lg font-semibold text-stone-900">{s.title}</h2>
      <p className="mt-1 text-sm text-stone-700">{s.text}</p>
      <div className="mt-3 flex gap-1" aria-hidden>
        {Array.from({ length: TOUR_STEPS }, (_, i) => <i key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-sage-700" : "bg-stone-200"}`} />)}
      </div>
      <div className="mt-4 flex justify-between">
        <button onClick={onPrev} disabled={step === 0} className="min-h-11 rounded-xl px-4 text-sm text-stone-700 disabled:opacity-40">{t("tour.back")}</button>
        <button onClick={step === TOUR_STEPS - 1 ? onClose : onNext} className="min-h-11 rounded-xl bg-sage-700 px-5 text-sm font-semibold text-white hover:bg-sage-800">
          {step === TOUR_STEPS - 1 ? t("tour.finish") : t("tour.next")}
        </button>
      </div>
    </div>
  );
}
