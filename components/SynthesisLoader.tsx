"use client";

import React, { useEffect, useState } from "react";

const PIPELINE_STAGES = [
  "STAGE 1: Resolving cultural seeds & vibe adjectives into canonical Qloo URNs...",
  "STAGE 2: Querying Qloo urn:heatmap & urn:tag for street-level geohash density...",
  "STAGE 3: Hopping cross-domain graph across Brands, Audio Artists & 500m Venues...",
  "STAGE 4: Translating Qloo taste weights into Kelvin, Lux, CRI & acoustic NRC...",
  "STAGE 5: Synthesizing grounded executive brief & co-marketing outreach...",
];

export default function SynthesisLoader() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev < PIPELINE_STAGES.length - 1 ? prev + 1 : prev));
    }, 1100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
              <div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Synthesizing Qloo Spatial Graph
              </h3>
             
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            LIVE TELEMETRY
          </span>
        </div>

        <div className="space-y-2.5">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isDone = idx < stepIndex;
            const isCurrent = idx === stepIndex;
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-3 transition-all ${
                  isCurrent
                    ? "bg-blue-50/70 border-blue-300 text-blue-950 font-semibold shadow-2xs"
                    : isDone
                      ? "bg-emerald-50/40 border-emerald-200 text-emerald-800"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                <span className="text-sm">
                  {isDone ? "✅" : isCurrent ? "⏳" : "⏺"}
                </span>
                <span className="truncate">{stage}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}