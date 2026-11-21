"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Supercluster from "supercluster";
import { useCallback, useEffect, useRef } from "react";

export type MapSite = {
  code: string;
  name: string;
  locality: string;
  lat: number;
  lng: number;
  reach: number;
};

export type Bounds = { north: number; south: number; east: number; west: number };

type Props = {
  sites: MapSite[];
  selected: readonly string[];
  active: string | null;
  onActive: (code: string | null) => void;
  onBounds: (b: Bounds, zoom: number) => void;
  /** bump to re-fit the map around every site */
  fitKey: number;
  /** pan to this site when it changes */
  focus: string | null;
};

type PointProps = { code: string; name: string; locality: string; reach: number };

const PIN = (color: string, ring: string) =>
  `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg"><path d="M15 39C15 39 28 24.5 28 14.5A13 13 0 0 0 2 14.5C2 24.5 15 39 15 39Z" fill="${color}" stroke="${ring}" stroke-width="2"/><circle cx="15" cy="14.5" r="5" fill="#fff"/></svg>`;

function pinIcon(state: "default" | "selected" | "active") {
  const svg = state === "active" ? PIN("#0f0f0f", "#fff") : state === "selected" ? PIN("#16E17A", "#0f5132") : PIN("#e5484d", "#fff");
  return L.divIcon({ html: svg, className: "loky-pin", iconSize: [30, 40], iconAnchor: [15, 39] });
}

function clusterIcon(count: number, names: string[]) {
  const size = count >= 20 ? 54 : count >= 10 ? 48 : 42;
  return L.divIcon({
    html: `<div class="loky-cluster" style="width:${size}px;height:${size}px"><b>${count}</b><span>${names.length} site${names.length === 1 ? "" : "s"}</span></div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/** Thin imperative wrapper around Leaflet + supercluster. Everything else (panel, cards) is React. */
export function LeafletMap({ sites, selected, active, onActive, onBounds, fitKey, focus }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const index = useRef<Supercluster<PointProps> | null>(null);
  const latest = useRef({ selected, active, onActive, onBounds });
  useEffect(() => {
    latest.current = { selected, active, onActive, onBounds };
  });

  const draw = useCallback(() => {
    const m = map.current;
    const idx = index.current;
    const g = layer.current;
    if (!m || !idx || !g || !m.getContainer().isConnected) return;
    g.clearLayers();
    const b = m.getBounds();
    const zoom = Math.round(m.getZoom());
    const clusters = idx.getClusters([b.getWest() - 0.2, b.getSouth() - 0.2, b.getEast() + 0.2, b.getNorth() + 0.2], zoom);
    for (const c of clusters) {
      const [lng, lat] = c.geometry.coordinates;
      const props = c.properties as PointProps | { cluster: true; cluster_id: number; point_count: number };
      if ("cluster" in props && props.cluster) {
        const id = props.cluster_id;
        const leaves = idx.getLeaves(id, 50);
        const names = leaves.map((l) => l.properties.name);
        const mk = L.marker([lat, lng], { icon: clusterIcon(props.point_count, names) });
        mk.bindTooltip(
          `<div class="loky-tip"><b>${names.length} sites</b><ul>${names.slice(0, 6).map((n) => `<li>${n}</li>`).join("")}${names.length > 6 ? `<li>+${names.length - 6} more</li>` : ""}</ul><i>Click to zoom in</i></div>`,
          { direction: "top", offset: [0, -24], opacity: 1 },
        );
        mk.on("click", () => m.setView([lat, lng], Math.min(idx.getClusterExpansionZoom(id), 18), { animate: true }));
        mk.addTo(g);
      } else {
        const p = c.properties as PointProps;
        const state = latest.current.active === p.code ? "active" : latest.current.selected.includes(p.code) ? "selected" : "default";
        const mk = L.marker([lat, lng], { icon: pinIcon(state), zIndexOffset: state === "active" ? 1000 : 0 });
        mk.bindTooltip(`<div class="loky-tip"><b>${p.name}</b><span>${p.locality}</span></div>`, { direction: "top", offset: [0, -36], opacity: 1 });
        mk.on("click", () => latest.current.onActive(p.code));
        mk.addTo(g);
      }
    }
  }, []);

  // create the map once
  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { zoomControl: false, attributionControl: true, scrollWheelZoom: true });
    L.control.zoom({ position: "bottomright" }).addTo(m);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    m.setView([25.6093, 85.1376], 12);
    const emit = () => {
      const b = m.getBounds();
      latest.current.onBounds({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() }, m.getZoom());
      draw();
    };
    m.on("moveend zoomend", emit);
    m.on("click", () => latest.current.onActive(null));
    map.current = m;
    // first paint after layout settles (cleared on unmount so a StrictMode re-mount cannot touch a removed map)
    const timer = setTimeout(() => {
      m.invalidateSize();
      emit();
    }, 0);
    return () => {
      clearTimeout(timer);
      m.off();
      m.remove();
      map.current = null;
      layer.current = null;
    };
  }, [draw]);

  // rebuild the cluster index when the data changes
  useEffect(() => {
    const idx = new Supercluster<PointProps>({ radius: 70, maxZoom: 17, map: (p) => ({ ...p }) });
    idx.load(
      sites.map((s) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [s.lng, s.lat] },
        properties: { code: s.code, name: s.name, locality: s.locality, reach: s.reach },
      })),
    );
    index.current = idx;
    draw();
  }, [sites, draw]);

  // redraw markers when selection / active changes
  useEffect(() => {
    draw();
  }, [selected, active, draw]);

  // fit to every site
  useEffect(() => {
    const m = map.current;
    if (!m || !sites.length) return;
    const b = L.latLngBounds(sites.map((s) => [s.lat, s.lng] as [number, number]));
    m.fitBounds(b.pad(0.15), { maxZoom: 14 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, sites.length]);

  // pan to a focused site
  useEffect(() => {
    const m = map.current;
    const s = sites.find((x) => x.code === focus);
    if (!m || !s) return;
    m.setView([s.lat, s.lng], Math.max(m.getZoom(), 15), { animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  return <div ref={el} className="h-full w-full" data-testid="leaflet-map" />;
}
