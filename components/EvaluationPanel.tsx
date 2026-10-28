"use client";

import React from "react";

interface EvaluationPanelProps {
  comparisonMode: "qloo" | "generic";
  setComparisonMode: (mode: "qloo" | "generic") => void;
  currentRegion: string;
  oppScoreVal: string;
  commercialROI?: Record<string, unknown>;
  comparisonToggle?: Record<string, unknown>;
  topCompetitorSaturation?: number;
}

export default function EvaluationPanel({
  comparisonMode,
  setComparisonMode,
  currentRegion,
  oppScoreVal,
  commercialROI,
  comparisonToggle,
  topCompetitorSaturation,
}: EvaluationPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Evaluation Mode Toggle Bar */}
      <div className="rounded-xl bg-blue-50/60 border border-blue-200 p-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-blue-900 uppercase tracking-wide block">
            Evaluation Mode
          </span>
          <p className="text-[11px] text-blue-700">
            Compare ungrounded AI hallucination vs. Qloo spatial grounding
          </p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-blue-200 shadow-2xs">
          <button
            onClick={() => setComparisonMode("qloo")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
              comparisonMode === "qloo"
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🛡️ Qloo Agent
          </button>
          <button
            onClick={() => setComparisonMode("generic")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
              comparisonMode === "generic"
                ? "bg-amber-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ⚠️ Generic LLM
          </button>
        </div>
      </div>

      {comparisonMode === "generic" ? (
        <div className="rounded-xl bg-white border border-amber-300 p-6 flex-1 flex flex-col shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Ungrounded LLM Baseline
            </h3>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex-1 overflow-y-auto text-xs text-slate-700 whitespace-pre-line font-mono">
            {String(comparisonToggle?.genericLlmOutput ?? "Loading baseline...")}
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-white border border-slate-200 p-6 flex-1 flex flex-col justify-between shadow-2xs gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Commercial Arbitrage & ROI Telemetry
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Target Region:{" "}
                <span className="font-semibold text-slate-800">
                  {currentRegion}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {typeof topCompetitorSaturation === "number" && (
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  Saturation: {Math.round(topCompetitorSaturation * 100)}%
                </span>
              )}
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                Opportunity Score: {oppScoreVal}
              </span>
            </div>
          </div>

          {/* Enterprise Financial ROI Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Foot Traffic Lift
              </span>
              <span className="text-base font-bold text-emerald-600">
                {String(commercialROI?.projectedFootTrafficLift ?? "+1.77x")}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Ad Spend Saved
              </span>
              <span className="text-base font-bold text-blue-600">
                {String(
                  commercialROI?.estimatedCacReductionPercent ??
                    "43% lower paid local ad spend",
                )}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Match Readiness
              </span>
              <span className="text-base font-bold text-violet-600">
                {String(commercialROI?.sponsorMatchReadiness ?? "99/100")}
              </span>
            </div>
          </div>

          {typeof comparisonToggle?.whyQlooWins === "string" && (
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950">
              <strong className="font-bold text-emerald-800 block mb-0.5">
                Why Qloo Wins:
              </strong>
              {comparisonToggle.whyQlooWins}
            </div>
          )}
        </div>
      )}
    </div>
  );
}