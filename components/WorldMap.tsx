"use client";

import "leaflet/dist/leaflet.css";
import type { Feature, FeatureCollection } from "geojson";
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, Tooltip, ZoomControl } from "react-leaflet";
import outlines from "@/data/countries.geojson.json";
import { ALERT_COLOR, EVENT_LABEL, type LiveEvent } from "@/lib/live";
import HeatOverlay from "./HeatOverlay";

// Pacific-centred world view: move the Americas east of 180° so the Philippines,
// New Zealand and the US all appear on one map without wrapping.
const shiftLon = (lon: number) => (lon < -30 ? lon + 360 : lon);
type Coords = number[] | Coords[];
const shiftCoords = (c: Coords): Coords =>
  typeof c[0] === "number" ? [shiftLon(c[0] as number), c[1] as number] : (c as Coords[]).map(shiftCoords);
const PACIFIC_OUTLINES = {
  ...(outlines as FeatureCollection),
  features: (outlines as FeatureCollection).features.map((f) => ({
    ...f,
    geometry: { ...f.geometry, coordinates: shiftCoords((f.geometry as unknown as { coordinates: Coords }).coordinates) },
  })),
} as FeatureCollection;

export default function WorldMap({
  center,
  zoom,
  events,
  activeIso,
  pacific = false,
  zoomPosition = "topleft",
  heat = [],
  onCountryClick,
}: {
  heat?: [number, number, number][];
  pacific?: boolean;
  zoomPosition?: "topleft" | "topright" | "bottomleft" | "bottomright";
  center: [number, number];
  zoom: number;
  events: LiveEvent[];
  activeIso?: string;
  onCountryClick?: (iso3: string) => void;
}) {
  return (
    <MapContainer
      key={`${center.join(",")}-${zoom}`}
      center={center}
      zoom={zoom}
      minZoom={2}
      scrollWheelZoom={false}
      zoomControl={false}
      className="h-full w-full"
      aria-label="Map of disaster risk"
    >
      <ZoomControl position={zoomPosition} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <HeatOverlay points={heat} shift={pacific} />
      <GeoJSON
        key={activeIso ?? "all"}
        data={pacific ? PACIFIC_OUTLINES : (outlines as FeatureCollection)}
        style={(f?: Feature) => ({
          color: "#4e6653",
          weight: f?.properties?.iso3 === activeIso ? 3 : 1.5,
          fillColor: "#8fa487",
          fillOpacity: activeIso && f?.properties?.iso3 !== activeIso ? 0.08 : 0.3,
        })}
        onEachFeature={(f, layer) => {
          layer.bindTooltip(`${f.properties.name}: click to explore`, { sticky: true });
          layer.on("click", () => onCountryClick?.(f.properties.iso3));
        }}
      />
      {events.map((e) => (
        <CircleMarker
          key={e.id}
          center={[e.lat, pacific ? shiftLon(e.lon) : e.lon]}
          radius={e.alert === "Red" ? 9 : 6}
          pathOptions={{ color: "white", weight: 1.5, fillColor: ALERT_COLOR[e.alert], fillOpacity: 0.9 }}
        >
          <Tooltip>{e.title}</Tooltip>
          <Popup>
            <strong>{EVENT_LABEL[e.type]}</strong> · {e.alert} alert
            <br />
            {e.title}
            <br />
            <a href={e.url} target="_blank" rel="noreferrer">Source: {e.source}</a>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
