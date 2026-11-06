"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Polygon, Popup, TileLayer, Tooltip } from "react-leaflet";
import { useT } from "@/lib/i18n";
import type { Persona } from "@/lib/types";

import { placeColor } from "./MapLegend";

export default function RiskMap({ persona }: { persona: Persona }) {
  const t = useT();
  return (
    <MapContainer
      key={persona.id}
      center={[persona.lat, persona.lon]}
      zoom={13}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polygon positions={persona.overlay.points} pathOptions={{ color: persona.overlay.color, fillOpacity: 0.25, weight: 1 }}>
        <Tooltip sticky>{persona.overlay.label}</Tooltip>
      </Polygon>
      {persona.places.map((p) => (
        <CircleMarker
          key={p.name}
          center={[p.lat, p.lon]}
          radius={9}
          pathOptions={{ color: "white", weight: 2, fillColor: placeColor[p.type], fillOpacity: 1 }}
        >
          <Popup>
            <strong>{t(`map.${p.type}`)}</strong>
            <br />
            {p.name}
          </Popup>
        </CircleMarker>
      ))}
      <CircleMarker
        center={[persona.lat, persona.lon]}
        radius={11}
        pathOptions={{ color: "white", weight: 3, fillColor: "#0f172a", fillOpacity: 1 }}
      >
        <Tooltip permanent direction="top" offset={[0, -10]}>{t("map.home")}</Tooltip>
      </CircleMarker>
    </MapContainer>
  );
}
