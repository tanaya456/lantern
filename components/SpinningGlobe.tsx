"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { MeshPhongMaterial } from "three";
import type { LiveEvent } from "@/lib/live";

const EXPLORE = new Set(["PHL", "NZL", "USA"]);

interface CountryFeature {
  properties: { iso3: string; name: string };
}

// Yellow → orange → red, transparent at the low end so the globe shows through.
function heatColor(t: number) {
  const stops: [number, number, number][] = [
    [253, 230, 138],
    [251, 146, 60],
    [239, 68, 68],
    [153, 27, 27],
  ];
  const x = Math.min(0.999, Math.max(0, t)) * (stops.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const [a, b] = [stops[i], stops[i + 1]];
  const c = a.map((v, k) => Math.round(v + (b[k] - v) * f));
  return `rgba(${c[0]},${c[1]},${c[2]},${Math.min(0.95, 0.35 + t * 0.6)})`;
}

export default function SpinningGlobe({
  heat,
  events,
  onCountryClick,
}: {
  heat: [number, number, number][];
  events: LiveEvent[];
  onCountryClick: (iso3: string) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const globe = useRef<GlobeMethods | undefined>(undefined);
  const [size, setSize] = useState({ w: 800, h: 500 });
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    fetch("/countries-110m.json")
      .then((r) => r.json())
      .then((d) => setCountries(d.features))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Start facing the Pacific (Philippines, NZ and the US all in view) and spin slowly.
  const onReady = () => {
    const g = globe.current;
    if (!g) return;
    g.pointOfView({ lat: 12, lng: 175, altitude: 1.75 }, 0);
    const c = g.controls();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    c.autoRotate = !reduce;
    c.autoRotateSpeed = 0.45;
    c.enableZoom = false;
    c.addEventListener("start", () => (c.autoRotate = false));
  };

  const ocean = useMemo(() => new MeshPhongMaterial({ color: "#a9d3ec", emissive: "#5d93b8", emissiveIntensity: 0.35, shininess: 6 }), []);
  const heatData = useMemo(() => heat.map(([lat, lng, weight]) => ({ lat, lng, weight })), [heat]);
  const rings = useMemo(() => events.filter((e) => e.alert === "Red").map((e) => ({ lat: e.lat, lng: e.lon })), [events]);

  return (
    <div ref={wrap} className="h-full w-full cursor-grab active:cursor-grabbing" aria-label="Spinning globe of current disaster activity">
      <Globe
        ref={globe}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere
        atmosphereColor="#9cc9e6"
        atmosphereAltitude={0.18}
        globeMaterial={ocean}
        onGlobeReady={onReady}
        polygonsData={countries}
        polygonAltitude={(d) => ((d as CountryFeature).properties.iso3 === hover ? 0.03 : EXPLORE.has((d as CountryFeature).properties.iso3) ? 0.015 : 0.006)}
        polygonCapColor={(d) => {
          const iso = (d as CountryFeature).properties.iso3;
          return EXPLORE.has(iso) ? (iso === hover ? "#5b7660" : "#8fa487") : "#f4f1e8";
        }}
        polygonSideColor={() => "rgba(78,102,83,0.25)"}
        polygonStrokeColor={() => "#b9c7b3"}
        polygonLabel={(d) => {
          const p = (d as CountryFeature).properties;
          return EXPLORE.has(p.iso3) ? `<b>${p.name}</b><br/>Click to explore` : p.name;
        }}
        onPolygonHover={(d) => setHover(d && EXPLORE.has((d as CountryFeature).properties.iso3) ? (d as CountryFeature).properties.iso3 : null)}
        onPolygonClick={(d) => {
          const iso = (d as CountryFeature).properties.iso3;
          if (EXPLORE.has(iso)) onCountryClick(iso);
        }}
        polygonsTransitionDuration={200}
        hexBinPointsData={heatData}
        hexBinPointLat="lat"
        hexBinPointLng="lng"
        hexBinPointWeight="weight"
        hexBinResolution={3}
        hexMargin={0.15}
        hexAltitude={(d) => Math.min(0.12, 0.004 + (d as { sumWeight: number }).sumWeight * 0.012)}
        hexTopColor={(d) => heatColor(Math.min(1, 0.25 + (d as { sumWeight: number }).sumWeight / 4))}
        hexSideColor={(d) => heatColor(Math.min(1, 0.2 + (d as { sumWeight: number }).sumWeight / 5))}
        hexBinMerge={true}
        hexTransitionDuration={0}
        ringsData={rings}
        ringColor={() => (t: number) => `rgba(185,28,28,${1 - t})`}
        ringMaxRadius={5}
        ringPropagationSpeed={2}
        ringRepeatPeriod={1400}
      />
    </div>
  );
}
