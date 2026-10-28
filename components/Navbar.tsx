"use client";

import Image from "next/image";
import React from "react";

interface NavbarProps {
  loading: boolean;
  activePreset: string | null;
  onOpenModal: () => void;
  onRunPreset: (presetKey: string) => void;
}

export default function Navbar({
  loading,
  activePreset,
  onOpenModal,
  onRunPreset,
}: NavbarProps) {
  const presets = [
    { key: "tokyo_listening_cafe", label: "☕ Tokyo Café" },
    { key: "austin_senior_bistro", label: "🧓 Senior Bistro" },
    { key: "brooklyn_hotel_lobby", label: "🏨 Brooklyn Hotel" },
  ];

  return (
    <header className="border-b border-slate-200 bg-white px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
      <div className="flex items-center space-x-3">
       <Image
            src="/logo.png"
            alt="Qloo Logo"
            width={40}
            height={40}
          />
        <div>
          <h1 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Locale Aura
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              Qloo Graph v2
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Spatial Intelligence & Retail Arbitrage
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenModal}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs transition shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>Synthesizing...</span>
            </>
          ) : (
            <>
              
              <span>Configure Query & Parameters</span>
            </>
          )}
        </button>

        <div className="h-6 w-px bg-slate-200 hidden md:block" />

        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Presets:</span>
          {presets.map((p) => {
            const isThisLoading = loading && activePreset === p.key;
            return (
              <button
                key={p.key}
                onClick={() => onRunPreset(p.key)}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 text-xs font-semibold text-slate-700 transition border border-slate-200 shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                {isThisLoading && (
                  <span className="h-3 w-3 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                )}
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}