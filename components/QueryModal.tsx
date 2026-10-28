"use client";

import React, { useState, useEffect, useRef } from "react";

export type SpaceType =
  | "listening_cafe"
  | "senior_bistro"
  | "boutique_retail"
  | "hotel_lobby";

interface QueryModalProps {
  isOpen: boolean;
  loading: boolean;
  naturalPrompt: string;
  setNaturalPrompt: (v: string) => void;
  locationQuery: string;
  setLocationQuery: (v: string) => void;
  spaceType: SpaceType;
  setSpaceType: (v: SpaceType) => void;
  seedNames: string;
  setSeedNames: (v: string) => void;
  vibeKeywords: string;
  setVibeKeywords: (v: string) => void;
  onClose: () => void;
  onRunNatural: (e: React.FormEvent<HTMLFormElement>) => void;
  onRunCustom: (e: React.FormEvent<HTMLFormElement>) => void;
}

interface LocationSuggestion {
  place_id: number;
  display_name: string;
}

const SEED_PRESETS: Record<SpaceType, string[]> = {
  listening_cafe: [
    "Peter Cat Recording Co.",
    "Khruangbin",
    "Sade",
    "Boiler Room",
    "Blue Note",
  ],
  boutique_retail: [
    "Sabyasachi",
    "Acne Studios",
    "Studio Mumbai",
    "Comme des Garçons",
    "Aesop",
  ],
  senior_bistro: [
    "Alice Waters",
    "Ottolenghi",
    "Slow Food",
    "Kinfolk",
    "Norah Jones",
  ],
  hotel_lobby: [
    "Geoffrey Bawa",
    "Aman",
    "Soho House",
    "Anoushka Shankar",
    "Bottega Veneta",
  ],
};

const VIBE_PRESETS: Record<SpaceType, string[]> = {
  listening_cafe: [
    "warm analog",
    "acoustic baffling",
    "mid-century",
    "dim low-lux",
    "brutalist laterite",
  ],
  boutique_retail: [
    "editorial",
    "minimalist concrete",
    "curated gallery",
    "striking high-CRI",
    "monolithic",
  ],
  senior_bistro: [
    "sunlit accessible",
    "acoustic dampening",
    "calm botanical",
    "warm terracotta",
    "organic",
  ],
  hotel_lobby: [
    "tropical modernism",
    "barefoot luxury",
    "vernacular timber",
    "open courtyards",
    "intimate",
  ],
};

export default function QueryModal({
  isOpen,
  loading,
  naturalPrompt,
  setNaturalPrompt,
  locationQuery,
  setLocationQuery,
  spaceType,
  setSpaceType,
  seedNames,
  setSeedNames,
  vibeKeywords,
  setVibeKeywords,
  onClose,
  onRunNatural,
  onRunCustom,
}: QueryModalProps) {
  const [activeTab, setActiveTab] = useState<"natural" | "parameters">(
    "natural",
  );

  const [rawSuggestions, setRawSuggestions] = useState<LocationSuggestion[]>(
    [],
  );
  const [isSearchingLocation, setIsSearchingLocation] =
    useState<boolean>(false);
  const [isDropdownDismissed, setIsDropdownDismissed] =
    useState<boolean>(false);
  const locationWrapperRef = useRef<HTMLDivElement>(null);

  // Derived state to avoid synchronous setState inside useEffect
  const hasValidQuery = Boolean(
    locationQuery && locationQuery.trim().length >= 3,
  );
  const locationSuggestions = hasValidQuery ? rawSuggestions : [];
  const showLocationDropdown =
    !isDropdownDismissed && locationSuggestions.length > 0;

  // Debounced address search (pure asynchronous execution)
  useEffect(() => {
    if (!locationQuery || locationQuery.trim().length < 3) {
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsSearchingLocation(true);
      try {
        const sanitizedQuery = locationQuery.trim().replace(/[^\w\s,.-]/gi, "");
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            sanitizedQuery,
          )}&limit=5&addressdetails=1`,
          {
            signal: controller.signal,
            headers: {
              "Accept-Language": "en",
            },
          },
        );
        if (res.ok) {
          const data = (await res.json()) as LocationSuggestion[];
          setRawSuggestions(data);
          setIsDropdownDismissed(false);
        }
      } catch (err: unknown) {
        if ((err as Error).name !== "AbortError") {
          setRawSuggestions([]);
        }
      } finally {
        setIsSearchingLocation(false);
      }
    }, 350);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [locationQuery]);

  // Click outside to dismiss dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        locationWrapperRef.current &&
        !locationWrapperRef.current.contains(e.target as Node)
      ) {
        setIsDropdownDismissed(true);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleAddSeed = (seed: string) => {
    const current = seedNames
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!current.includes(seed)) {
      setSeedNames([...current, seed].join(", "));
    }
  };

  const handleAddVibe = (vibe: string) => {
    const current = vibeKeywords
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!current.includes(vibe)) {
      setVibeKeywords([...current, vibe].join(", "));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* MODAL HEADER & TABS */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Synthesize Spatial Blueprint
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Query Qloo&apos;s 250M+ entity graph across cultural seeds and
                urban geohashes
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("natural")}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "natural"
                  ? "bg-white text-blue-600 font-bold shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Natural Language Agent
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("parameters")}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "parameters"
                  ? "bg-white text-blue-600 font-bold shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
          Structured Parameters
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {activeTab === "natural" ? (
            <form onSubmit={onRunNatural} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 space-y-2">
                <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5 pb-1 uppercase tracking-wide">
               What to include for high quality synthesis:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-blue-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-500 font-bold">✓</span>
                    <span>
                      <strong>Location:</strong> Neighborhood & city
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-500 font-bold">✓</span>
                    <span>
                      <strong>Space Scale:</strong> Square footage & format
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-500 font-bold">✓</span>
                    <span>
                      <strong>Cultural Seeds:</strong> 2–3 artists/brands
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-500 font-bold">✓</span>
                    <span>
                      <strong>Sensory Vibe:</strong> Architectural lighting &
                      materials
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Natural Language Prompt
                </label>
                <textarea
                  value={naturalPrompt}
                  onChange={(e) => setNaturalPrompt(e.target.value)}
                  disabled={loading}
                  rows={4}
                  placeholder="e.g. Architect a 2,800 sq ft hi-fi listening sanctuary in Fontainhas, Panaji, Goa for fans of Peter Cat Recording Co. and Sabyasachi, fusing Indo-Portuguese laterite stone with warm 2700K acoustic baffling..."
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white resize-none transition leading-relaxed disabled:opacity-60"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Query Blueprints:
                </span>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setNaturalPrompt(
                        "Architect a 2,800 sq ft hi-fi listening sanctuary and luxury showroom in Fontainhas, Panaji, Goa for fans of Peter Cat Recording Co. and Sabyasachi, fusing Indo-Portuguese laterite with brutalist acoustic baffling.",
                      )
                    }
                    className="text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 text-[11px] text-slate-600 hover:text-blue-700 transition truncate cursor-pointer"
                  >
                    🌴 <strong>Goa Hi-Fi Sanctuary:</strong> Fontainhas • Peter
                    Cat Recording Co. • Sabyasachi
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNaturalPrompt(
                        "Design a 1,800 sq ft editorial apparel showroom in SoHo, New York for followers of Frank Ocean, Acne Studios, and Kinfolk, calibrated to 3000K minimalist high-CRI lighting.",
                      )
                    }
                    className="text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 text-[11px] text-slate-600 hover:text-blue-700 transition truncate cursor-pointer"
                  >
                    🗽 <strong>SoHo Editorial Showroom:</strong> SoHo, NYC •
                    Frank Ocean • Acne Studios
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !naturalPrompt.trim()}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading && (
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                )}
                <span>
                  {loading
                    ? "Extracting Entities & Querying Qloo..."
                    : "Run Agent Query"}
                </span>
              </button>
            </form>
          ) : (
            <form onSubmit={onRunCustom} className="space-y-4">
            
              <div ref={locationWrapperRef} className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-slate-700 font-bold">
                    Target Location
                  </label>
                  {isSearchingLocation && (
                    <span className="text-[10px] text-blue-600 flex items-center gap-1 font-medium">
                      <span className="h-2 w-2 rounded-full border border-blue-600 border-t-transparent animate-spin" />
                      Searching maps...
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={locationQuery}
                    disabled={loading}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    onFocus={() => setIsDropdownDismissed(false)}
                    placeholder="Search city, neighborhood, or street..."
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-8 pr-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                  <span className="absolute left-2.5 top-3 text-slate-400 text-xs">
                    📍
                  </span>
                </div>

                {showLocationDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
                    {locationSuggestions.map((item) => (
                      <button
                        key={item.place_id}
                        type="button"
                        onClick={() => {
                          const parts = item.display_name.split(",");
                          const shortName =
                            parts.length >= 2
                              ? `${parts[0].trim()}, ${parts[1].trim()}`
                              : item.display_name;
                          setLocationQuery(shortName);
                          setIsDropdownDismissed(true);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-blue-50 text-[11px] text-slate-700 hover:text-blue-900 transition flex items-center gap-2 cursor-pointer"
                      >
                        <span className="text-slate-400">🗺️</span>
                        <span className="truncate">{item.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">
                  Space Type
                </label>
                <select
                  value={spaceType}
                  disabled={loading}
                  onChange={(e) => setSpaceType(e.target.value as SpaceType)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
                >
                  <option value="listening_cafe">
                    ☕ Listening Café & Bar
                  </option>
                  <option value="boutique_retail">
                    🛍️ Boutique Retail & Showroom
                  </option>
                  <option value="hotel_lobby">🏨 Boutique Hotel Lobby</option>
                  <option value="senior_bistro">
                    🧓 Senior-Safe Accessible Bistro
                  </option>
                </select>
              </div>

              {/* CULTURAL SEEDS */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-slate-700 font-bold">
                    Cultural Seeds
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Comma-separated
                  </span>
                </div>
                <input
                  type="text"
                  value={seedNames}
                  disabled={loading}
                  onChange={(e) => setSeedNames(e.target.value)}
                  placeholder="e.g. Sabyasachi, Peter Cat Recording Co., Studio Mumbai"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-medium">
                    Suggestions:
                  </span>
                  {SEED_PRESETS[spaceType].map((seed, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAddSeed(seed)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 text-[10px] font-medium text-slate-600 hover:text-blue-700 border border-slate-200 transition cursor-pointer"
                    >
                      + {seed}
                    </button>
                  ))}
                </div>
              </div>

              {/* VIBE KEYWORDS */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-slate-700 font-bold">
                    Vibe & Architectural Keywords
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Aesthetic tags
                  </span>
                </div>
                <input
                  type="text"
                  value={vibeKeywords}
                  disabled={loading}
                  onChange={(e) => setVibeKeywords(e.target.value)}
                  placeholder="e.g. brutalist, warm laterite, analog acoustic"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-medium">
                    Suggestions:
                  </span>
                  {VIBE_PRESETS[spaceType].map((vibe, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAddVibe(vibe)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 text-[10px] font-medium text-slate-600 hover:text-blue-700 border border-slate-200 transition cursor-pointer"
                    >
                      + {vibe}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !locationQuery.trim() || !seedNames.trim()}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading && (
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                )}
                <span>
                  {loading
                    ? "Resolving Parameters..."
                    : "Generate Grounded Blueprint"}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
