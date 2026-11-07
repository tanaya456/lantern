"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { MeshBasicMaterial } from "three";
import type { LiveEvent } from "@/lib/live";

const EXPLORE = new Set(["PHL", "NZL", "USA"]);

interface CountryFeature {
  properties: { iso3: string; name: string };
}

// Soft, translucent discs: where many overlap they build up into a red/orange heat glow.
function glow(w: number) {
  const c = w > 0.75 ? "220,38,38" : w > 0.5 ? "239,90,48" : w > 0.3 ? "249,140,60" : "251,191,90";
  return `rgba(${c},${0.12 + w * 0.22})`;
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

  // Camera distance that makes the globe exactly fill the box: top-to-bottom (or side-to-side on narrow screens).
  // The globe camera has a 50° vertical field of view; a sphere fills it when sin(halfAngle) = radius / distance.
  const fitAltitude = (w: number, h: number) => {
    const half = (25 * Math.PI) / 180;
    const halfX = Math.atan(Math.tan(half) * (w / h));
    return 1 / Math.sin(Math.min(half, halfX)) - 1 + 0.01;
  };

  useEffect(() => {
    const g = globe.current;
    if (!g || !size.w || !size.h) return;
    const p = g.pointOfView();
    g.pointOfView({ lat: p.lat, lng: p.lng, altitude: fitAltitude(size.w, size.h) }, 0);
  }, [size]);

  // Start facing Asia and the Philippines, then spin slowly toward New Zealand and the US.
  const onReady = () => {
    const g = globe.current;
    if (!g) return;
    g.pointOfView({ lat: 12, lng: 140, altitude: fitAltitude(size.w, size.h) }, 0);
    const c = g.controls();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    c.autoRotate = !reduce;
    c.autoRotateSpeed = 0.35;
    c.enableZoom = false;
    c.addEventListener("start", () => (c.autoRotate = false));
  };

  const ocean = useMemo(() => new MeshBasicMaterial({ color: "#eef6fb" }), []);
  // Tiny height offsets stop overlapping discs from flickering/striping.
  const heatData = useMemo(() => heat.map(([lat, lng, weight], i) => ({ lat, lng, weight, alt: 0.0015 + (i % 11) * 0.0006 })), [heat]);
  const rings = useMemo(() => events.filter((e) => e.alert === "Red").map((e) => ({ lat: e.lat, lng: e.lon })), [events]);

  return (
    <div ref={wrap} className="h-full w-full cursor-grab active:cursor-grabbing" aria-label="Spinning globe of current disaster activity">
      <Globe
        ref={globe}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere
        atmosphereColor="#ffffff"
        atmosphereAltitude={0.08}
        showGraticules
        globeMaterial={ocean}
        onGlobeReady={onReady}
        polygonsData={countries}
        polygonAltitude={(d) => ((d as CountryFeature).properties.iso3 === hover ? 0.012 : 0.003)}
        polygonCapColor={(d) => {
          const iso = (d as CountryFeature).properties.iso3;
          return EXPLORE.has(iso) ? (iso === hover ? "#7f9878" : "#a9bba1") : "#dfe7d6";
        }}
        polygonSideColor={() => "rgba(0,0,0,0)"}
        polygonStrokeColor={() => "#6f8b74"}
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
        pointsData={heatData}
        pointLat="lat"
        pointLng="lng"
        pointAltitude="alt"
        pointRadius={(d) => 0.7 + (d as { weight: number }).weight * 1.1}
        pointColor={(d) => glow((d as { weight: number }).weight)}
        pointResolution={16}
        pointsMerge={true}
        pointsTransitionDuration={0}
        ringsData={rings}
        ringColor={() => (t: number) => `rgba(185,28,28,${1 - t})`}
        ringMaxRadius={4}
        ringPropagationSpeed={2}
        ringRepeatPeriod={1400}
      />
    </div>
  );
}
