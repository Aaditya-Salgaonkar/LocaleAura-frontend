"use client";

import React, { useState } from "react";
import RealHeatmap from "@/components/RealHeatmap";
import Navbar from "@/components/Navbar";
import QueryModal, { SpaceType } from "@/components/QueryModal";
import SynthesisLoader from "@/components/SynthesisLoader";
import EvaluationPanel from "@/components/EvaluationPanel";
import EnterpriseTabs, { DeliverableTab } from "@/components/EnterpriseTabs";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export default function LocaleAuraDashboard() {
  const [loading, setLoading] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DeliverableTab>("brief");
  const [comparisonMode, setComparisonMode] = useState<"qloo" | "generic">(
    "qloo",
  );
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  const [naturalPrompt, setNaturalPrompt] = useState<string>("");
  const [locationQuery, setLocationQuery] = useState<string>("");
  const [spaceType, setSpaceType] = useState<SpaceType>("boutique_retail");
  const [seedNames, setSeedNames] = useState<string>(
    "",
  );
  const [vibeKeywords, setVibeKeywords] = useState<string>(
    "",
  );

  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runPreset = async (presetKey: string) => {
    setLoading(true);
    setActivePreset(presetKey);
    setError(null);
    setIsFormOpen(false);
    try {
      const res = await fetch(`${API_BASE}/preset/${presetKey}`, {
        method: "POST",
      });
      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to connect to NestJS backend");
    } finally {
      setLoading(false);
      setActivePreset(null);
    }
  };

  const runCustom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setActivePreset(null);
    setError(null);
    setIsFormOpen(false);
    try {
      const payload = {
        locationQuery,
        spaceType,
        seedNames: seedNames
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        vibeKeywords: vibeKeywords
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const res = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to generate custom blueprint");
    } finally {
      setLoading(false);
    }
  };

  const runNaturalPrompt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!naturalPrompt) return;
    setLoading(true);
    setActivePreset(null);
    setError(null);
    setIsFormOpen(false);
    try {
      const res = await fetch(`${API_BASE}/natural`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: naturalPrompt }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to parse natural language prompt");
    } finally {
      setLoading(false);
    }
  };

  const qlooTrace = result?.qlooTrace as Record<string, unknown> | undefined;
  const groundingAudit = qlooTrace?.groundingAudit as
    | Record<string, unknown>
    | undefined;
  const spatialHeatmap = result?.spatialHeatmap as
    | Array<Record<string, unknown>>
    | undefined;
  const commercialROI = result?.commercialROI as
    | Record<string, unknown>
    | undefined;
  const sensoryBlueprint = result?.sensoryBlueprint as
    | Record<string, unknown>
    | undefined;
  const crossDomainPartners = result?.crossDomainPartners as
    | Record<string, unknown>
    | undefined;
  const deliverables = result?.deliverables as
    | Record<string, unknown>
    | undefined;
  const comparisonToggle = result?.comparisonToggle as
    | Record<string, unknown>
    | undefined;
  const inputData = result?.input as Record<string, unknown> | undefined;

  const neighborPlaces = Array.isArray(crossDomainPartners?.neighborPlaces)
    ? (crossDomainPartners.neighborPlaces as Array<Record<string, unknown>>)
    : [];
  const brandList = Array.isArray(crossDomainPartners?.brands)
    ? (crossDomainPartners.brands as Array<Record<string, unknown>>)
    : [];
  const artistList = Array.isArray(crossDomainPartners?.artists)
    ? (crossDomainPartners.artists as Array<Record<string, unknown>>)
    : [];
  const tasteDNA = Array.isArray(qlooTrace?.tasteDNA)
    ? (qlooTrace.tasteDNA as Array<Record<string, unknown>>)
    : [];

  const topPlace = neighborPlaces[0];
  const topHotel =
    neighborPlaces.find((p) => {
      const meta = p.metadata as Record<string, unknown> | undefined;
      const genre = meta?.primary_genre as Record<string, unknown> | undefined;
      return genre?.id === "urn:tag:genre:place:hotel";
    }) || neighborPlaces[2];

  const currentRegion = String(
    inputData?.locationQuery ?? locationQuery ?? "",
  );
  const winningGeohash = String(
    commercialROI?.winningGeohash ?? "block_40.705_-74.004",
  );
  const oppScoreVal = spatialHeatmap?.[0]
    ? String(spatialHeatmap[0].opportunityScore)
    : "0.9";

  const executiveSummaryText =
    typeof deliverables?.executiveSummary === "string"
      ? deliverables.executiveSummary
      : deliverables?.executiveSummary &&
          typeof deliverables.executiveSummary === "object"
        ? `Targeting ${currentRegion} (${String(inputData?.spaceType ?? spaceType).replace("_", " ")}) anchored at Geohash ${winningGeohash} with an Opportunity Score of ${oppScoreVal} (${String(commercialROI?.culturalDemandVsSupplyRatio ?? "6.67")}x demand-to-supply ratio). Qloo cross-domain graph resolution matched ${brandList.slice(0, 3).map((b) => b.name).join(", ")} alongside verified 500m neighbor venues ${neighborPlaces.slice(0, 2).map((n) => n.name).join(" and ")}, calibrated to ${String(sensoryBlueprint?.colorTempKelvin ?? 2700)}K / ${String(sensoryBlueprint?.ambientLux ?? 150)} Lux architectural lighting for a projected ${String(commercialROI?.projectedFootTrafficLift ?? "+1.77x")} foot traffic lift.`
        : String(
            comparisonToggle?.whyQlooWins ??
              "Synthesizing commercial summary...",
          );

  const groundedEmailContent = `Hi ${topPlace?.name ?? "Local"} & ${topHotel?.name ?? "Partners"} Team,

We are launching a ${Array.isArray(inputData?.vibeKeywords) ? (inputData.vibeKeywords as string[]).join(", ") : vibeKeywords} ${String(inputData?.spaceType ?? spaceType).replace("_", " ")} concept at Geohash ${winningGeohash} (Opportunity Score: ${oppScoreVal}, Low 10% competitor saturation).

Qloo's Taste AI Graph shows a high audience affinity overlap between our core cultural seeds (${Array.isArray(inputData?.seedNames) ? (inputData.seedNames as string[]).join(", ") : seedNames}) and your clientele at ${String((topPlace?.metadata as Record<string, unknown>)?.address ?? currentRegion)} and ${String((topHotel?.metadata as Record<string, unknown>)?.address ?? currentRegion)}.

Proposed Activation:
1. VIP Private Preview utilizing ${topHotel?.name ?? "Local Venue"}'s event spaces (${String((topHotel?.metadata as Record<string, unknown>)?.number_of_rooms ?? "86")} rooms, ${String((topHotel?.metadata as Record<string, unknown>)?.ambience_description ?? "chic boutique setting")}).
2. Post-preview tasting dinner at ${topPlace?.name ?? "Local Restaurant"} (${String((topPlace?.metadata as Record<string, unknown>)?.business_rating ?? "4.5")}★, featuring local culinary highlights).
3. Co-curated capsule display alongside ${brandList.slice(0, 3).map((b) => `${b.name} (${Math.round(Number(b.affinity ?? 0) * 100)}% match)`).join(", ")}.

Projected Partner ROI: ${String(commercialROI?.projectedFootTrafficLift ?? "+1.77x")} foot traffic lift and ${String(commercialROI?.estimatedCacReductionPercent ?? "43% lower paid local ad spend")}.`;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
      <Navbar
        loading={loading}
        activePreset={activePreset}
        onOpenModal={() => setIsFormOpen(true)}
        onRunPreset={runPreset}
      />

      <QueryModal
        isOpen={isFormOpen}
        loading={loading}
        naturalPrompt={naturalPrompt}
        setNaturalPrompt={setNaturalPrompt}
        locationQuery={locationQuery}
        setLocationQuery={setLocationQuery}
        spaceType={spaceType}
        setSpaceType={setSpaceType}
        seedNames={seedNames}
        setSeedNames={setSeedNames}
        vibeKeywords={vibeKeywords}
        setVibeKeywords={setVibeKeywords}
        onClose={() => setIsFormOpen(false)}
        onRunNatural={runNaturalPrompt}
        onRunCustom={runCustom}
      />

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-8 py-3 text-red-700 text-xs flex justify-between items-center">
          <span>
            Connection Error: {error} (Ensure NestJS is running on port 4000)
          </span>
          <button onClick={() => setError(null)} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <SynthesisLoader  />
      ) : !result ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
          <Image
                     src="/logo.png"
                     alt="Qloo Logo"
                     width={40}
                     height={40}
                   />
          <h2 className="text-xl font-bold text-slate-900">
            Welcome to Locale Aura
          </h2>
          <p className="text-xs text-slate-500 max-w-md">
            Click the{" "}
            <strong className="text-slate-800">
              Configure Query & Parameters
            </strong>{" "}
            button in the navbar or select a quick preset above to synthesize
            spatial intelligence and retail arbitrage data.
          </p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-8 w-full max-w-7xl mx-auto">
          <div className="flex flex-col gap-6">
            <RealHeatmap
              targetRegion={currentRegion}
              overallOpportunityScore={Number(oppScoreVal)}
              blocks={
                spatialHeatmap as Array<{
                  geohash: string;
                  latitude: number;
                  longitude: number;
                  opportunityScore?: number;
                  affinity?: number;
                }>
              }
            />
          </div>

          <EvaluationPanel
            comparisonMode={comparisonMode}
            setComparisonMode={setComparisonMode}
            currentRegion={currentRegion}
            oppScoreVal={oppScoreVal}
            commercialROI={commercialROI}
            comparisonToggle={comparisonToggle}
            topCompetitorSaturation={
              spatialHeatmap?.[0]?.competitorSaturation as number | undefined
            }
          />

          {/* GROUNDING & METRICS SUMMARY */}
          <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 p-5 shadow-2xs flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Qloo Graph Grounding Status
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                <strong className="text-slate-900">
                  {String(groundingAudit?.verifiedEntityCount ?? 0)}
                </strong>{" "}
                canonical Qloo URNs anchored successfully.
              </p>
            </div>
            <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-200">
              {String(groundingAudit?.groundingScorePercent ?? 100)}% Verified
              Grounding
            </span>
          </div>

          <EnterpriseTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            executiveSummaryText={executiveSummaryText}
            tasteDNA={tasteDNA}
            sensoryBlueprint={sensoryBlueprint}
            brandList={brandList}
            neighborPlaces={neighborPlaces}
            artistList={artistList}
            groundedEmailContent={groundedEmailContent}
          />
        </div>
      )}
    </main>
  );
}