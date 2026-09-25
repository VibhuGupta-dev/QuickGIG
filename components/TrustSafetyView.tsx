'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  CheckCircle, 
  Cpu, 
  Sparkles 
} from 'lucide-react';

export const TrustSafetyView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Hero Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl glass-panel border border-emerald-500/20 overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-[400px] h-[300px] ai-glow-cyan pointer-events-none -z-10" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>CSE Cyber Security Architecture</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          AI Trust & Cryptographic Verification Layer
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl mt-2 leading-relaxed">
          QuickGig replaces anonymous, unsafe social media classifieds with a multi-layered trust scoring model, instantaneous geo-fenced escrow, and campus ID verification.
        </p>
      </div>

      {/* Trust Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Pillar 1 */}
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] hover:border-indigo-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
            <UserCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            Campus ID & Aadhaar Sync
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Every gig poster and student worker is verified against their registered university roll number or government identity token before first dispatch.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Zero Fake Profiles</span>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] hover:border-emerald-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
            <Lock className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            Geo-Fenced Smart Escrow
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Gig payment is locked into an automated escrow upon gig acceptance. Funds disburse straight to UPI only when both parties tap task complete within 100m radius.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>100% Payout Assurance</span>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] hover:border-cyan-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            AI Fraud & Anomaly Guard
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Real-time heuristic analysis scans gig descriptions for suspicious patterns, unrealistic payments, or high-risk tasks, flagging them for human admin moderation.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Sub-second Safety Triage</span>
          </div>
        </div>

      </div>

      {/* Trust Score Breakdown Demo */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08]">
        <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider mb-6 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Live Community Trust Index (SRMCEM Lucknow Node)
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-300">Identity Verification Completeness</span>
              <span className="text-emerald-400 font-mono">99.8%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full" style={{ width: '99.8%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-300">On-Time Task Fulfillment Rate</span>
              <span className="text-indigo-400 font-mono">98.4%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" style={{ width: '98.4%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-300">Dispute & Chargeback Free Operations</span>
              <span className="text-cyan-400 font-mono">99.4%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" style={{ width: '99.4%' }} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
