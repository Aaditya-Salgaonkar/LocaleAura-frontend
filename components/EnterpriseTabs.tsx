"use client";

import Image from "next/image";
import React from "react";

export type DeliverableTab =
  | "brief"
  | "lighting"
  | "partners"
  | "audio"
  | "email";

interface EnterpriseTabsProps {
  activeTab: DeliverableTab;
  setActiveTab: (tab: DeliverableTab) => void;
  executiveSummaryText: string;
  tasteDNA: Array<Record<string, unknown>>;
  sensoryBlueprint?: Record<string, unknown>;
  brandList: Array<Record<string, unknown>>;
  neighborPlaces: Array<Record<string, unknown>>;
  artistList: Array<Record<string, unknown>>;
  groundedEmailContent: string;
}

export default function EnterpriseTabs({
  activeTab,
  setActiveTab,
  executiveSummaryText,
  tasteDNA,
  sensoryBlueprint,
  brandList,
  neighborPlaces,
  artistList,
  groundedEmailContent,
}: EnterpriseTabsProps) {
  const tabs: { id: DeliverableTab; label: string }[] = [
    { id: "brief", label: "Brief" },
    { id: "lighting", label: "Sensory" },
    { id: "partners", label: "Partners" },
    { id: "audio", label: "Audio" },
    { id: "email", label: "Outreach" },
  ];

  return (
    <div className="lg:col-span-2 flex flex-col rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
      <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`py-3 transition cursor-pointer ${
              activeTab === t.id
                ? "text-blue-600 border-b-2 border-blue-600 bg-white font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5 flex-1 overflow-y-auto text-xs space-y-4 max-h-125">
        {activeTab === "brief" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 mb-1">
                Executive Summary
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {executiveSummaryText}
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2">
                Taste DNA Markers
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {tasteDNA.slice(0, 10).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
                  >
                    {String(tag.name)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "lighting" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 mb-1">
                Electrical, Lighting & Acoustic Spec
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Color Temp
                  </span>
                  <span className="font-bold text-amber-600">
                    {String(sensoryBlueprint?.colorTempKelvin ?? 2700)}K
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Ambient / Task Lux
                  </span>
                  <span className="font-bold text-blue-600">
                    {String(sensoryBlueprint?.ambientLux ?? 150)} /{" "}
                    {String(sensoryBlueprint?.taskLux ?? 300)} Lux
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-medium">
                    CRI Minimum
                  </span>
                  <span className="font-bold text-emerald-600">
                    CRI {String(sensoryBlueprint?.criMinimum ?? 92)}+
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Acoustic Target
                  </span>
                  <span className="font-bold text-violet-600">
                    NRC {String(sensoryBlueprint?.acousticNrcTarget ?? 0.65)} (
                    {String(sensoryBlueprint?.maxDecibels ?? 68)} dB)
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800">Fixture BOM</h4>
                {Array.isArray(sensoryBlueprint?.fixtureRecommendations) &&
                  (sensoryBlueprint.fixtureRecommendations as string[]).map(
                    (rec, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-[11px]"
                      >
                        • {rec}
                      </div>
                    ),
                  )}
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800">
                  Material Palette
                </h4>
                {Array.isArray(sensoryBlueprint?.materialPalette) &&
                  (sensoryBlueprint.materialPalette as string[]).map(
                    (mat, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-[11px]"
                      >
                        • {mat}
                      </div>
                    ),
                  )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "partners" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Co-Brand Pop-Up Targets */}
            <div>
              <h3 className="font-bold text-slate-900 mb-2">
                🛍️ Co-Brand Pop-Up Targets
              </h3>
              <div className="space-y-2">
                {brandList.slice(0, 4).map((b, i) => {
                  const meta = b.metadata as
                    | Record<string, unknown>
                    | undefined;
                  const imgObj = meta?.image as
                    | Record<string, unknown>
                    | undefined;
                  const imgUrl = imgObj?.url ? String(imgObj.url) : null;
                  const minPrice = meta?.price_range_usd_min;
                  const maxPrice = meta?.price_range_usd_max;
                  const aesthetics = Array.isArray(meta?.aesthetic_properties)
                    ? (meta.aesthetic_properties as string[]).slice(0, 2)
                    : [];

                  return (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {imgUrl && (
                            <Image
                              width={28}
                              height={28}
                              src={imgUrl}
                              alt={String(b.name)}
                              className="w-7 h-7 rounded object-cover border border-slate-300"
                            />
                          )}
                          <span className="font-semibold text-slate-800 text-xs">
                            {String(b.name)}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {Math.round(Number(b.affinity ?? 0) * 100)}% Match
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          {minPrice && maxPrice
                            ? `$${minPrice} – $${maxPrice}`
                            : "Luxury Tier"}
                        </span>
                        <div className="flex gap-1">
                          {aesthetics.map((a, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[9px]"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 500m Neighbor Venues */}
            <div>
              <h3 className="font-bold text-slate-900 mb-2">
                📍 500m Verified Neighbor Venues
              </h3>
              <div className="space-y-2">
                {neighborPlaces.slice(0, 4).map((place, i) => {
                  const meta = place.metadata as
                    | Record<string, unknown>
                    | undefined;
                  const rating = meta?.business_rating
                    ? Number(meta.business_rating).toFixed(1)
                    : "4.5";
                  const address = meta?.address
                    ? String(meta.address)
                    : "Verified Local Address";
                  const hasEventSpace = Boolean(meta?.event_spaces);

                  return (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col gap-1.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-900 text-xs">
                          {String(place.name)}
                        </span>
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                          ★ {rating}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {address}
                      </p>
                      {hasEventSpace && (
                        <span className="inline-block text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded w-fit">
                          ✓ Verified Event Space
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "audio" && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900">
              🎧 Daypart Audio Schedule & Sonic Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {artistList.map((art, i) => {
                const meta = art.metadata as
                  | Record<string, unknown>
                  | undefined;
                const genres = Array.isArray(meta?.primary_genres)
                  ? (meta.primary_genres as string[]).slice(0, 2).join(", ")
                  : "Alternative R&B / Soul";
                const tracks = Array.isArray(meta?.notable_songs)
                  ? (meta.notable_songs as string[]).slice(0, 2).join(", ")
                  : null;
                const daypart =
                  i < 2
                    ? "Morning Ambient (10 AM - 1 PM)"
                    : i < 4
                      ? "Peak Foot-Traffic (1 PM - 5 PM)"
                      : "Evening VIP Set (5 PM - 8 PM)";

                return (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">
                        {String(art.name)}
                      </span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-medium">
                        {daypart}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      <strong>Style:</strong> {genres}
                    </p>
                    {tracks && (
                      <p className="text-[10px] text-slate-400 truncate">
                        <strong>Anchor Tracks:</strong> {tracks}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "email" && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900">
              Co-Marketing Outreach Draft
            </h3>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 whitespace-pre-line leading-relaxed h-72 overflow-y-auto">
              {groundedEmailContent}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}