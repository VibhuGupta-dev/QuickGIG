'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Zap, ShieldCheck, Clock, Coins, Compass } from 'lucide-react';

interface HeroAiSectionProps {
  onSearchOrPrompt: (query: string) => void;
  onOpenAiDrafter: (promptText: string) => void;
}

export const HeroAiSection: React.FC<HeroAiSectionProps> = ({
  onSearchOrPrompt,
  onOpenAiDrafter,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const samplePrompts = [
    { label: '🚀 Need urgent notes delivery (₹280)', query: 'Need urgent notes delivery to college gate' },
    { label: '📦 Carry 3 cartons up 3rd floor (₹450)', query: 'Help carrying 3 boxes of study material 3rd floor' },
    { label: '💻 Python tutoring practicals (₹600)', query: 'Python tutoring practicals 1 hour crash course' },
    { label: '🐕 Dog walking in park (₹350)', query: 'Dog walking evening friendly golden retriever' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onOpenAiDrafter(prompt);
    }, 400);
  };

  return (
    <div className="relative pt-10 pb-12 overflow-hidden border-b border-white/[0.06]">
      {/* Background glow orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] ai-glow-indigo pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[300px] ai-glow-purple pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[300px] ai-glow-cyan pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/[0.08] border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Next-Gen Micro-Gig Engine for Students & Local Hustlers</span>
          <span className="w-1 h-1 rounded-full bg-indigo-400" />
          <span className="text-slate-400">SRMCEM & Lucknow Hub</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Hyper-Local Micro-Gigs.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
            Instant AI Matching.
          </span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Need an odd task done nearby or have 1 hour free between classes? Describe your request in plain English or Hindi — our AI parses, prices, and dispatches in minutes.
        </p>

        {/* AI Omnibar */}
        <div className="mt-8 max-w-3xl mx-auto">
          <form 
            onSubmit={handleSubmit}
            className="relative flex items-center p-1.5 rounded-2xl bg-gradient-to-b from-white/[0.12] to-white/[0.04] p-[1px] shadow-2xl shadow-indigo-500/10 focus-within:shadow-indigo-500/25 transition-all"
          >
            <div className="relative flex items-center w-full bg-[#0d121f]/95 rounded-[15px] px-4 py-2 border border-white/[0.08]">
              <Sparkles className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0 animate-pulse" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask AI: 'Need someone to carry a study desk 2km away for ₹400'..."
                className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <div className="flex items-center gap-2 ml-2">
                <button
                  type="button"
                  onClick={() => onSearchOrPrompt(prompt)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition-all"
                >
                  <Compass className="w-3.5 h-3.5" />
                  Filter Radar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-md shadow-indigo-500/30 transition-all flex-shrink-0"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                      Parsing...
                    </span>
                  ) : (
                    <>
                      <span>Magic Draft</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Quick Suggestion Chips */}
          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap text-xs">
            <span className="text-slate-500 font-mono text-[11px] mr-1">Trending Prompts:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(p.query);
                  onOpenAiDrafter(p.query);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-200 transition-all text-[11px]"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="glass-panel p-4 rounded-2xl text-left border border-white/[0.06] hover:border-indigo-500/20 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-mono">Match Speed</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">4.2 min</div>
            <p className="text-[11px] text-slate-500 mt-1">Average acceptance time</p>
          </div>

          <div className="glass-panel p-4 rounded-2xl text-left border border-white/[0.06] hover:border-indigo-500/20 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-mono">Disbursed</span>
              <Coins className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">₹4.8L+</div>
            <p className="text-[11px] text-slate-500 mt-1">Direct student earnings</p>
          </div>

          <div className="glass-panel p-4 rounded-2xl text-left border border-white/[0.06] hover:border-indigo-500/20 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-mono">Trust Index</span>
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">99.4%</div>
            <p className="text-[11px] text-slate-500 mt-1">Zero fraud guarantee</p>
          </div>

          <div className="glass-panel p-4 rounded-2xl text-left border border-white/[0.06] hover:border-indigo-500/20 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-mono">Platform Fee</span>
              <Zap className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-cyan-300 tracking-tight">0% Cut</div>
            <p className="text-[11px] text-slate-500 mt-1">100% payout to workers</p>
          </div>
        </div>

      </div>
    </div>
  );
};
