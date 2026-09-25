'use client';

import React from 'react';
import { Gig } from '../types/gig';
import { Navigation, Sparkles } from 'lucide-react';

interface RadarScannerProps {
  gigs: Gig[];
  radiusKm: number;
  onSelectGig: (gig: Gig) => void;
  selectedGigId?: string;
}

export const RadarScanner: React.FC<RadarScannerProps> = ({
  gigs,
  radiusKm,
  onSelectGig,
  selectedGigId,
}) => {
  // Compute positions inside a 360-degree radial space based on gig id & distance
  const getCoordinates = (gig: Gig, index: number) => {
    // Generate deterministic angles for visual scattering
    const angle = (index * 53) % 360;
    const rad = (angle * Math.PI) / 180;
    // Map distance relative to selected radius (max 85% to stay within circle)
    const ratio = Math.min(gig.distanceKm / Math.max(radiusKm, 1), 0.9);
    const radiusPx = ratio * 135; // radar radius is ~160px

    const x = Math.cos(rad) * radiusPx;
    const y = Math.sin(rad) * radiusPx;

    return { x, y, angle };
  };

  return (
    <div className="relative glass-panel rounded-3xl p-6 border border-white/[0.08] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-radial from-indigo-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Autonomous Proximity Radar
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/20">
              Live Geo-Spatial
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time active odd-jobs within {radiusKm} km radius
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
          <Navigation className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>SRMCEM Central • 26.89° N, 81.01° E</span>
        </div>
      </div>

      {/* The Visual Circular Radar */}
      <div className="relative flex items-center justify-center my-4 py-6">
        <div className="relative w-[340px] h-[340px] rounded-full border border-indigo-500/20 bg-[#090d18]/80 flex items-center justify-center overflow-hidden shadow-2xl shadow-indigo-950/60">
          
          {/* Concentric rings */}
          <div className="absolute w-[260px] h-[260px] rounded-full border border-indigo-500/15 border-dashed" />
          <div className="absolute w-[180px] h-[180px] rounded-full border border-indigo-500/15" />
          <div className="absolute w-[100px] h-[100px] rounded-full border border-indigo-500/20 border-dashed" />

          {/* Crosshairs */}
          <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
          <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent" />

          {/* Radar Sweep Beam */}
          <div 
            className="absolute inset-0 origin-center pointer-events-none"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(99, 102, 241, 0.22) 360deg)',
              animation: 'radarSweep 6s linear infinite'
            }}
          />

          {/* Center User Dot */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-cyan-400 border-2 border-[#090d18] shadow-lg shadow-cyan-400/80 animate-pulse" />
            <span className="text-[10px] font-mono text-cyan-300 font-semibold mt-1 bg-slate-900/90 px-1.5 py-0.5 rounded border border-cyan-500/30">
              You
            </span>
          </div>

          {/* Render Gig Blips */}
          {gigs.map((gig, idx) => {
            const { x, y } = getCoordinates(gig, idx);
            const isSelected = selectedGigId === gig.id;

            return (
              <div
                key={gig.id}
                onClick={() => onSelectGig(gig)}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
                className="absolute z-20 cursor-pointer group transition-transform duration-300 hover:scale-125"
                title={`${gig.title} • ₹${gig.payment}`}
              >
                {/* Ping wave */}
                <span className={`absolute -inset-1 rounded-full animate-ping opacity-60 ${
                  isSelected ? 'bg-cyan-400' : 'bg-indigo-400'
                }`} />

                {/* Dot */}
                <div className={`relative flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all ${
                  isSelected
                    ? 'bg-cyan-400 border-white shadow-lg shadow-cyan-400/90 scale-110'
                    : 'bg-indigo-600 border-[#0d121f] group-hover:bg-cyan-400'
                }`}>
                  <span className="text-[9px] font-bold text-white leading-none">
                    ₹
                  </span>
                </div>

                {/* Hover Badge */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 pointer-events-none z-30">
                  <div className="glass-panel p-2 rounded-xl text-left shadow-xl border border-indigo-500/30">
                    <p className="text-[10px] font-semibold text-white line-clamp-1">{gig.title}</p>
                    <div className="flex items-center justify-between mt-1 text-[9px]">
                      <span className="text-emerald-400 font-bold">₹{gig.payment}</span>
                      <span className="text-slate-400">{gig.distanceKm} km</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Distance Labels */}
          <div className="absolute bottom-2 right-4 text-[9px] font-mono text-slate-500">
            Outer Ring: {radiusKm} km
          </div>
          <div className="absolute top-2 left-4 text-[9px] font-mono text-indigo-400/70">
            Inner Ring: {(radiusKm * 0.3).toFixed(1)} km
          </div>
        </div>

        {/* Legend / Quick stats */}
        <div className="hidden sm:flex flex-col gap-3 ml-6">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Radar Status</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Active Scanning
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">In-Range Gigs</span>
            <span className="text-white font-bold text-base mt-0.5">{gigs.length} available</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">AI Dispatch</span>
            <span className="text-indigo-400 font-medium flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3" />
              Auto-Routing ON
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
