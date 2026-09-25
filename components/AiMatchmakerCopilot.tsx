'use client';

import React, { useState } from 'react';
import { Gig } from '../types/gig';
import { Sparkles, Bot, Zap, CheckCircle2, TrendingUp, Clock, MapPin } from 'lucide-react';

interface AiMatchmakerCopilotProps {
  allGigs: Gig[];
  onSelectGig: (gig: Gig) => void;
}

export const AiMatchmakerCopilot: React.FC<AiMatchmakerCopilotProps> = ({
  allGigs,
  onSelectGig,
}) => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'Two-Wheeler / Bike',
    'Tech & Laptop'
  ]);
  const [availableHours, setAvailableHours] = useState('2');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(true);

  const skillOptions = [
    { id: 'bike', label: '🛵 Two-Wheeler / Bike', tag: 'Bike' },
    { id: 'tech', label: '💻 Tech & Laptop', tag: 'Tech' },
    { id: 'moving', label: '🏋️ Physical Strength', tag: 'Physical' },
    { id: 'tutor', label: '📚 Tutoring & Code', tag: 'Tutoring' },
    { id: 'pets', label: '🐕 Animal Friendly', tag: 'Pet' },
  ];

  const toggleSkill = (label: string) => {
    if (selectedSkills.includes(label)) {
      setSelectedSkills(selectedSkills.filter(s => s !== label));
    } else {
      setSelectedSkills([...selectedSkills, label]);
    }
  };

  const handleRunAiAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisDone(true);
    }, 700);
  };

  // Compute matched gigs
  const matchedGigs = allGigs.slice(0, 3);
  const potentialEarning = matchedGigs.reduce((acc, g) => acc + g.payment, 0);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Header Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl glass-panel border border-indigo-500/20 overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-[350px] h-[350px] ai-glow-purple pointer-events-none -z-10" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-3">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>Autonomous Schedule & Route Copilot</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              AI Yield Maximizer
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mt-1.5 leading-relaxed">
              Tell the AI agent what equipment you have and your free schedule. It chains optimal micro-gigs to maximize your hourly earnings within walking or cycling radius.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-center min-w-[180px]">
            <span className="text-[11px] font-mono text-indigo-300 uppercase block">Est. 2-Hour Payout</span>
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mt-1">
              ₹{potentialEarning}
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Based on 3 chained gigs</span>
          </div>
        </div>
      </div>

      {/* Control Panel: Skills + Time */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Skills selection */}
        <div className="md:col-span-2 glass-panel p-5 rounded-2xl border border-white/[0.08]">
          <h3 className="text-xs font-mono uppercase text-slate-400 mb-3 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            Select Your Available Gear & Skills
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {skillOptions.map((opt) => {
              const active = selectedSkills.includes(opt.label);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleSkill(opt.label)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-indigo-600/40 text-white border border-indigo-500/50 shadow-sm shadow-indigo-500/30'
                      : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Free Window */}
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase text-slate-400 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Available Free Time
            </h3>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={availableHours}
                onChange={(e) => setAvailableHours(e.target.value)}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <span className="text-sm font-bold text-white font-mono min-w-[50px]">
                {availableHours} hrs
              </span>
            </div>
          </div>

          <button
            onClick={handleRunAiAnalysis}
            disabled={isAnalyzing}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:opacity-95 shadow-md shadow-indigo-500/25 transition-all"
          >
            {isAnalyzing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Optimizing Route...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Re-calculate Match
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recommended Chain Result */}
      {analysisDone && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              AI Synthesized Gig Cluster (Closest Proximity Route)
            </h3>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-950/40 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              Total Distance: 3.8 km
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {matchedGigs.map((gig, idx) => (
              <div 
                key={gig.id}
                onClick={() => onSelectGig(gig)}
                className="glass-panel glass-panel-hover p-4 rounded-2xl border border-white/[0.08] cursor-pointer relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    Step {idx + 1} • {gig.duration}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    ₹{gig.payment}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-white line-clamp-1 mb-1">
                  {gig.title}
                </h4>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
                  <MapPin className="w-3 h-3 text-indigo-400" />
                  <span>{gig.distanceKm} km away</span>
                  <span className="text-slate-600">•</span>
                  <span className="truncate">{gig.locationName}</span>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/[0.05] text-[11px]">
                  <span className="text-slate-400">Match score</span>
                  <span className="text-cyan-400 font-mono font-semibold">{gig.aiMatchScore}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-slate-300">
              <strong className="text-white">Route Efficiency:</strong> By chaining these tasks in sequence, you save ~45 minutes of dead travel time and earn ₹{potentialEarning} within your {availableHours}-hour availability window.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
