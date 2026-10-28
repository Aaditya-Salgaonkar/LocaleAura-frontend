"use client";

import React, { useEffect, useState, JSX } from "react";
import "leaflet/dist/leaflet.css";

interface HeatmapBlock {
  geohash: string;
  latitude: number;
  longitude: number;
  opportunityScore?: number;
  affinity?: number;
}

interface RealHeatmapProps {
  blocks: HeatmapBlock[];
  targetRegion?: string;
  overallOpportunityScore?: number;
  tomtomApiKey?: string;
}

type MapComponentType = React.ComponentType<{
  center: [number, number];
  zoom: number;
  scrollWheelZoom: boolean;
  style: React.CSSProperties;
  children: React.ReactNode;
}>;

interface LeafletModules {
  TileLayer: React.ComponentType<{
    attribution: string;
    url: string;
    subdomains?: string[];
    maxZoom?: number;
  }>;
  Marker: React.ComponentType<{
    position: [number, number];
    icon: unknown;
    children?: React.ReactNode;
  }>;
  Popup: React.ComponentType<{ children: React.ReactNode }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  L: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useMap: any;
}

type HeatLatLngTuple = [number, number, number];

function buildThermalCorridorPoints(blocks: HeatmapBlock[]): HeatLatLngTuple[] {
  const points: HeatLatLngTuple[] = [];

  blocks.forEach((b, idx) => {
    const baseIntensity = Math.min(1.0, (b.opportunityScore ?? 0.85) * 1.15);
    points.push([b.latitude, b.longitude, baseIntensity]);

    if (idx < blocks.length - 1) {
      const next = blocks[idx + 1];
      const steps = 6;
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        const lat = b.latitude + (next.latitude - b.latitude) * t;
        const lon = b.longitude + (next.longitude - b.longitude) * t;
        const midIntensity = baseIntensity * 0.85;
        points.push([lat, lon, midIntensity]);
      }
    }
  });

  return points;
}

function HeatLayerComponent({
  blocks,
  active,
}: {
  blocks: HeatmapBlock[];
  active: boolean;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rl, setRl] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    import("react-leaflet").then((module) => {
      if (isMounted) setRl(module);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!rl) return null;
  return <HeatLayerInner blocks={blocks} active={active} useMap={rl.useMap} />;
}

function HeatLayerInner({
  blocks,
  active,
  useMap,
}: {
  blocks: HeatmapBlock[];
  active: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useMap: any;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !active) return;

    let heatLayer: unknown = null;

    import("leaflet.heat")
      .catch(() => {})
      .then(() => {
        const L =
          (
            window as unknown as {
              L?: {
                heatLayer: (
                  points: HeatLatLngTuple[],
                  options: Record<string, unknown>,
                ) => { addTo: (map: unknown) => unknown };
              };
            }
          ).L ||
          (
            globalThis as unknown as {
              L?: {
                heatLayer: (
                  points: HeatLatLngTuple[],
                  options: Record<string, unknown>,
                ) => { addTo: (map: unknown) => unknown };
              };
            }
          ).L;

        if (L && typeof L.heatLayer === "function") {
          const heatPoints = buildThermalCorridorPoints(blocks);

          heatLayer = L.heatLayer(heatPoints, {
            radius: 32,
            blur: 22,
            maxZoom: 17,
            max: 1.0,
            minOpacity: 0.45,
            gradient: {
              0.15: "#450a0a",
              0.35: "#991b1b",
              0.6: "#ef4444",
              0.8: "#f97316",
              0.92: "#facc15",
              1.0: "#ffffff",
            },
          }).addTo(map);
        }
      });

    return () => {
      if (heatLayer && map) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (map as any).removeLayer(heatLayer);
        } catch {
          // cleanup safeguard
        }
      }
    };
  }, [map, blocks, active]);

  return null;
}

export default function RealHeatmap({
  blocks,
  targetRegion = "Silver Lake, Los Angeles",
  overallOpportunityScore = 0.9,
  tomtomApiKey,
}: RealHeatmapProps): JSX.Element {
  const [MapContainerComponent, setMapContainerComponent] =
    useState<MapComponentType | null>(null);
  const [leafletModules, setLeafletModules] = useState<LeafletModules | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<"heatmap" | "pins">(
    "heatmap",
  );
  const [customKey, setCustomKey] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("TOMTOM_API_KEY") ?? "";
    }
    return "";
  });
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const activeTomTomKey =
    tomtomApiKey ||
    process.env.NEXT_PUBLIC_TOMTOM_API_KEY ||
    customKey.trim();

  useEffect(() => {
    let isMounted = true;

    async function loadLeaflet() {
      try {
        const rl = await import("react-leaflet");
        const L = await import("leaflet");
        await import("leaflet.heat");

        if (isMounted) {
          setMapContainerComponent(
            () => rl.MapContainer as unknown as MapComponentType,
          );
          setLeafletModules({
            TileLayer: rl.TileLayer as unknown as LeafletModules["TileLayer"],
            Marker: rl.Marker as unknown as LeafletModules["Marker"],
            Popup: rl.Popup as unknown as LeafletModules["Popup"],
            L,
            useMap: rl.useMap,
          });
          setIsLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load Enterprise Leaflet modules:", err);
      }
    }

    loadLeaflet();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleKeyChange = (val: string) => {
    setCustomKey(val);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("TOMTOM_API_KEY", val);
    }
  };

  if (
    !isLoaded ||
    !MapContainerComponent ||
    !leafletModules ||
    !blocks ||
    blocks.length === 0
  ) {
    return (
      <div className="h-[540px] bg-black rounded-2xl flex flex-col items-center justify-center text-xs font-mono text-amber-400 border border-neutral-800 shadow-2xl space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        <p className="tracking-widest font-semibold">
          INITIALIZING TOMTOM NIGHT TELEMETRY...
        </p>
      </div>
    );
  }

  const { TileLayer, Marker, Popup, L } = leafletModules;
  const centerLat = blocks[0]?.latitude ?? 34.0722;
  const centerLon = blocks[0]?.longitude ?? -118.2744;

  const avgOpportunity = (
    blocks.reduce((acc, b) => acc + (b.opportunityScore ?? 0.69), 0) /
    blocks.length
  ).toFixed(2);

  const tileUrl = activeTomTomKey
    ? `https://{s}.api.tomtom.com/map/1/tile/basic/night/{z}/{x}/{y}.png?key=${activeTomTomKey}&tileSize=512`
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const tileSubdomains = activeTomTomKey ? ["a", "b", "c", "d"] : ["a", "b", "c"];

  return (
    <div className="h-[540px] rounded-2xl overflow-hidden border border-neutral-800 relative z-0 shadow-2xl bg-black flex flex-col">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .leaflet-container,
            .leaflet-pane,
            .leaflet-tile-pane,
            .leaflet-tile-container {
              background-color: #050505 !important;
            }
            .tomtom-night-map .leaflet-tile-pane {
              filter: ${
                activeTomTomKey
                  ? "brightness(0.75) contrast(1.35) saturate(0.85)"
                  : "invert(100%) hue-rotate(180deg) brightness(0.22) contrast(3.2) saturate(0.15)"
              } !important;
            }
            .leaflet-heatmap-layer {
              filter: drop-shadow(0 0 14px rgba(239, 68, 68, 0.9)) drop-shadow(0 0 28px rgba(245, 158, 11, 0.6)) brightness(1.15) !important;
            }
            .leaflet-control-zoom {
              border: 1px solid #262626 !important;
              border-radius: 10px !important;
              overflow: hidden;
            }
            .leaflet-control-zoom a {
              background-color: #0a0a0a !important;
              color: #f8fafc !important;
              border-color: #262626 !important;
            }
            .leaflet-control-zoom a:hover {
              background-color: #171717 !important;
              color: #f59e0b !important;
            }
            .leaflet-popup-content-wrapper,
            .leaflet-popup-tip {
              background-color: #0a0a0a !important;
              color: #ffffff !important;
              border: 1px solid #262626 !important;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.8) !important;
            }
            .leaflet-control-attribution {
              background: rgba(0, 0, 0, 0.75) !important;
              color: #737373 !important;
              font-size: 9px !important;
            }
            .leaflet-control-attribution a {
              color: #a3a3a3 !important;
            }
          `,
        }}
      />

      {/* Top Dark Enterprise Header */}
      <div className="bg-neutral-950 border-b border-neutral-800 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 z-40">
        <div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Region:{" "}
            <span className="font-semibold text-amber-400">{targetRegion}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {showKeyInput && (
            <input
              type="password"
              value={customKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder="Paste TomTom API Key..."
              className="bg-black border border-neutral-700 focus:border-amber-500 rounded-lg px-2.5 py-1 text-xs text-white font-mono outline-none w-44"
            />
          )}

          <div className="bg-black p-1 rounded-lg flex gap-1 border border-neutral-800">
            <button
              type="button"
              onClick={() => setViewMode("heatmap")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === "heatmap"
                  ? "bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-sm font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Heatmap
            </button>
            <button
              type="button"
              onClick={() => setViewMode("pins")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === "pins"
                  ? "bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-sm font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Pins
            </button>
          </div>

          <div className="bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm">
            Opportunity Score: {overallOpportunityScore}
          </div>
        </div>
      </div>

      {/* Pitch-Black Map Viewport */}
      <div className="flex-1 w-full relative bg-black tomtom-night-map">
        <MapContainerComponent
          center={[centerLat, centerLon]}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%", backgroundColor: "#050505" }}
        >
          <TileLayer
            key={activeTomTomKey ? "tomtom-night" : "osm-dark"}
            attribution={
              activeTomTomKey
                ? "&copy; TomTom &copy; OpenStreetMap"
                : "&copy; OpenStreetMap contributors"
            }
            url={tileUrl}
            subdomains={tileSubdomains}
            maxZoom={20}
          />

          <HeatLayerComponent
            blocks={blocks}
            active={viewMode === "heatmap"}
          />

          {(viewMode === "pins") &&
            blocks.map((block, idx) => {
              const isTop = idx === 0;
              const bgCol = isTop ? "#ef4444" : "#f59e0b";
              const size = isTop ? 34 : 24;

              const customIcon = L.divIcon({
                className: "custom-sequence-pin",
                html: `<div style="background: ${bgCol}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 0 ${
                  isTop ? "20px #ef4444" : "12px #f59e0b"
                }; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: ${
                  isTop ? "11px" : "9px"
                }; font-weight: 900; letter-spacing: -0.5px;">#${idx + 1}</div>`,
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2],
              });

              return (
                <Marker
                  key={block.geohash || idx}
                  position={[block.latitude, block.longitude]}
                  icon={customIcon}
                >
                  <Popup>
                    <div className="text-xs space-y-1.5 p-1 font-sans">
                      <p className="font-bold text-amber-400">
                        Rank #{idx + 1} | {block.geohash}
                      </p>
                      <p className="text-neutral-300">
                        Opportunity Score:{" "}
                        <strong className="text-emerald-400">
                          {block.opportunityScore ?? "0.90"}
                        </strong>
                      </p>
                      <p className="text-neutral-300">
                        Taste Affinity:{" "}
                        <strong className="text-blue-400">
                          {Math.round((block.affinity ?? 0.9) * 100)}%
                        </strong>
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainerComponent>
      </div>

      {/* Bottom Dark Telemetry Footer */}
      <div className="bg-neutral-950 px-5 py-2.5 flex items-center justify-between text-[11px] font-mono text-neutral-400 z-30 border-t border-neutral-800">
        <div className="flex items-center gap-4">
          <span>
            CENTER:{" "}
            <strong className="text-neutral-200">
              {centerLat.toFixed(4)}, {centerLon.toFixed(4)}
            </strong>
          </span>
          <span className="hidden sm:inline text-neutral-700">|</span>
          <span className="hidden sm:inline">
            AVG OPPORTUNITY:{" "}
            <strong className="text-emerald-400">{avgOpportunity}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}