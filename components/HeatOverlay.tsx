"use client";

import { HeatLayer } from "leaflet.heat";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

// Red/orange heat map of recent disaster activity (GDACS events + USGS quakes).
export default function HeatOverlay({ points, shift = false }: { points: [number, number, number][]; shift?: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const pts = points.map(([a, b, w]) => [a, shift && b < -30 ? b + 360 : b, w]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const layer = new (HeatLayer as any)(pts, {
      radius: 18,
      blur: 22,
      max: 1,
      minOpacity: 0.25,
      gradient: { 0.2: "#fde68a", 0.45: "#fb923c", 0.7: "#ef4444", 1: "#991b1b" },
    }).addTo(map);
    return () => {
      layer.remove();
    };
  }, [map, points, shift]);
  return null;
}
