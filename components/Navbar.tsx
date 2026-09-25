'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, Plus, ShieldCheck, Zap, Compass, Bot } from 'lucide-react';

interface NavbarProps {
  activeTab: 'explore' | 'post' | 'copilot' | 'trust';
  setActiveTab: (tab: 'explore' | 'post' | 'copilot' | 'trust') => void;
  onOpenPostModal: () => void;
  radiusKm: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenPostModal,
  radiusKm,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#07090e]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo and Live Status */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setActiveTab('explore')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
              <div className="w-full h-full bg-[#0d121f] rounded-[11px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  QuickGig
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  AI 2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Hyper-Local Task Intelligence
              </p>
            </div>
          </div>

          {/* AI Radar pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>AI Radar Live</span>
            <span className="text-emerald-500/60">•</span>
            <span className="text-slate-300 font-sans">{radiusKm}km Radius</span>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.08]">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'explore'
                ? 'bg-indigo-600/30 text-white border border-indigo-500/40 shadow-sm shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Live Gig Radar
          </button>

          <button
            onClick={() => setActiveTab('copilot')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'copilot'
                ? 'bg-indigo-600/30 text-white border border-indigo-500/40 shadow-sm shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            AI Matchmaker
          </button>

          <button
            onClick={() => setActiveTab('trust')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'trust'
                ? 'bg-indigo-600/30 text-white border border-indigo-500/40 shadow-sm shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Trust & Safety
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/auth/login"
            className="hidden md:inline-flex text-xs font-semibold text-slate-300 hover:text-white px-2 py-1.5 transition-colors"
          >
            Log in
          </Link>

          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-white px-3 py-1.5 rounded-xl border border-white/10 transition-all shadow-sm"
          >
            Dashboard
          </Link>

          <button
            onClick={onOpenPostModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-md shadow-indigo-500/25 border border-indigo-400/30 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span className="hidden sm:inline">AI Post Gig</span>
            <span className="sm:hidden">Post</span>
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* User Profile Pill */}
          <Link href="/dashboard" className="flex items-center gap-2 pl-1 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px]">
              <div className="w-full h-full rounded-full bg-[#0d121f] flex items-center justify-center text-xs font-semibold text-cyan-300">
                VG
              </div>
            </div>
          </Link>
        </div>

      </div>
    </header>
  );
};
