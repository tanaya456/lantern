"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export interface AddressHit {
  label: string;
  line1: string;
  line2: string;
  lat: number;
  lon: number;
}

// US address search with suggestions (Photon / OpenStreetMap via /api/geocode).
export default function AddressSearch({ onPick, busy }: { onPick: (a: AddressHit) => void; busy?: boolean }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<AddressHit[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (q.trim().length < 3) return;
    const id = setTimeout(() => {
      fetch(`/api/geocode?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => {
          setHits(d.results ?? []);
          setOpen(true);
        })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(id);
  }, [q]);

  return (
    <div className="relative w-full max-w-xl">
      <label htmlFor="addr-search" className="sr-only">Search a US address</label>
      <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 shadow-sm focus-within:border-sage-600">
        <Search className="h-5 w-5 text-stone-500" aria-hidden />
        <input
          id="addr-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => hits.length && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && hits[0]) {
              setOpen(false);
              onPick(hits[0]);
            }
          }}
          placeholder="Search any US address"
          autoComplete="off"
          className="min-h-12 flex-1 bg-transparent text-stone-900 outline-none"
        />
        {busy && <span className="text-xs text-stone-500">Checking risks…</span>}
      </div>
      {open && hits.length > 0 && (
        <ul className="absolute z-[1100] mt-1 w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-lg" role="listbox">
          {hits.map((h) => (
            <li key={h.label}>
              <button
                role="option"
                aria-selected={false}
                onClick={() => {
                  setOpen(false);
                  setQ(h.label);
                  onPick(h);
                }}
                className="w-full px-4 py-2.5 text-left hover:bg-sage-50"
              >
                <div className="text-sm font-medium text-stone-900">{h.line1}</div>
                <div className="text-xs text-stone-500">{h.line2}</div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
