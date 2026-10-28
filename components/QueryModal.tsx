"use client";

import React from "react";

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
           Natural Language Agent & Parameters
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="h-7 w-7 rounded-lg bg-slate-200/60 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Natural Language Agent Form */}
          <form onSubmit={onRunNatural} className="space-y-3">
            <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              Natural Language Prompt
            </label>
            <textarea
              value={naturalPrompt}
              onChange={(e) => setNaturalPrompt(e.target.value)}
              disabled={loading}
              placeholder="e.g. Architect a 2,800 sq ft hi-fi listening sanctuary in Fontainhas, Panaji, Goa for fans of Peter Cat Recording Co. and Sabyasachi..."
              className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white h-20 resize-none transition disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !naturalPrompt.trim()}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              )}
              <span>
                {loading ? "Synthesizing Qloo Graph..." : "Run Query"}
              </span>
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-200"></div>
            <span className="shrink mx-4 text-[10px] text-slate-400 uppercase font-bold">
              Or Structured Parameters
            </span>
            <div className="grow border-t border-slate-200"></div>
          </div>

          {/* Structured Parameters Form */}
          <form onSubmit={onRunCustom} className="space-y-4">
            <div>
              <label className="block text-slate-700 mb-1 font-bold">
                Target Location
              </label>
              <input
                type="text"
                value={locationQuery}
                disabled={loading}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-bold">
                Space Type
              </label>
              <select
                value={spaceType}
                disabled={loading}
                onChange={(e) => setSpaceType(e.target.value as SpaceType)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="boutique_retail">
                  Boutique Retail & Showroom
                </option>
                <option value="listening_cafe">Listening Café & Bar</option>
                <option value="senior_bistro">
                  Senior-Safe Accessible Bistro
                </option>
                <option value="hotel_lobby">Boutique Hotel Lobby</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-bold">
                Cultural Seeds
              </label>
              <input
                type="text"
                value={seedNames}
                disabled={loading}
                onChange={(e) => setSeedNames(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-bold">
                Vibe Keywords
              </label>
              <input
                type="text"
                value={vibeKeywords}
                disabled={loading}
                onChange={(e) => setVibeKeywords(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              )}
              <span>
                {loading ? "Updating Parameters..." : "Generate Blueprint"}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}