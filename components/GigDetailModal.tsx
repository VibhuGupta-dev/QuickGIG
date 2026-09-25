'use client';

import React, { useState } from 'react';
import { Gig } from '../types/gig';
import { 
  X, 
  MapPin, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Star, 
  Send, 
  CheckCircle2, 
  Copy,
  Zap
} from 'lucide-react';

interface GigDetailModalProps {
  gig: Gig | null;
  isOpen: boolean;
  onClose: () => void;
  onApplySuccess: (gigId: string) => void;
}

export const GigDetailModal: React.FC<GigDetailModalProps> = ({
  gig,
  isOpen,
  onClose,
  onApplySuccess,
}) => {
  const [pitch, setPitch] = useState('');
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !gig) return null;

  const handleGeneratePitch = async () => {
    setIsGeneratingPitch(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_pitch',
          gigData: gig,
        }),
      });
      const data = await res.json();
      if (data.success && data.pitch) {
        setPitch(data.pitch);
      } else {
        setPitch(`Hi ${gig.posterName}! I am nearby in ${gig.locationName} and can help with "${gig.title}". I have a verified student ID, am ready right now, and will ensure this is done carefully!`);
      }
    } catch {
      setPitch(`Hi ${gig.posterName}! I am nearby in ${gig.locationName} and can help with "${gig.title}". I have a verified student ID, am ready right now, and will ensure this is done carefully!`);
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitApplication = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setApplied(true);
      onApplySuccess(gig.id);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl shadow-indigo-950/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {gig.category}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {gig.aiMatchScore}% Profile Match
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
          {gig.title}
        </h2>

        {/* Key Attributes Bar */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Distance</span>
            <div className="flex items-center gap-1 text-slate-200 font-semibold mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>{gig.distanceKm} km away</span>
            </div>
            <span className="text-[10px] text-slate-400 truncate block mt-0.5">{gig.locationName}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Est. Time</span>
            <div className="flex items-center gap-1 text-slate-200 font-semibold mt-0.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{gig.duration}</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Urgency: {gig.urgency}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Guaranteed Pay</span>
            <div className="text-emerald-400 font-bold text-base mt-0.5">
              ₹{gig.payment}
            </div>
            <span className="text-[10px] text-emerald-500/80 block">UPI Instant Lock</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Safety Index</span>
            <div className="flex items-center gap-1 text-cyan-300 font-semibold mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>{gig.safetyScore}/100</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">AI Trust Verified</span>
          </div>
        </div>

        {/* Poster Info Card */}
        <div className="mt-5 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1px]">
              <div className="w-full h-full bg-[#0d121f] rounded-full flex items-center justify-center font-bold text-sm text-cyan-300">
                {gig.posterName.charAt(0)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-white">{gig.posterName}</span>
                {gig.verifiedPoster && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    Verified Poster
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Posted {gig.postedAt} • {gig.posterCompletedGigs} gigs successfully completed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-amber-400 font-semibold text-sm bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>{gig.posterRating}</span>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-5">
          <h4 className="text-xs uppercase font-mono text-slate-400 mb-2">Gig Brief & Scope</h4>
          <p className="text-sm text-slate-300 leading-relaxed bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.06]">
            {gig.description}
          </p>
        </div>

        {/* Requirements Checklist */}
        <div className="mt-5">
          <h4 className="text-xs uppercase font-mono text-slate-400 mb-2">Requirements & Safety Checklist</h4>
          <div className="space-y-2">
            {gig.requirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{req}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-xs text-cyan-300/90">
              <Zap className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span>Identity verification required prior to gig commencement.</span>
            </div>
          </div>
        </div>

        {/* AI Pitch Generator Section */}
        <div className="mt-6 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-white">AI QuickPitch Assistant</span>
              <span className="text-[10px] text-indigo-300 font-mono">1-Click Tailored Note</span>
            </div>

            <button
              type="button"
              onClick={handleGeneratePitch}
              disabled={isGeneratingPitch}
              className="text-xs font-medium text-cyan-300 hover:text-cyan-200 bg-cyan-950/50 hover:bg-cyan-900/60 px-2.5 py-1 rounded-lg border border-cyan-500/30 flex items-center gap-1 transition-all"
            >
              {isGeneratingPitch ? (
                <>
                  <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  Draft with AI
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="Click 'Draft with AI' or write a short note for the poster..."
              className="w-full bg-[#0d121f] text-xs text-slate-200 placeholder-slate-500 p-3 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500 resize-none"
            />
            {pitch && (
              <button
                type="button"
                onClick={handleCopyPitch}
                className="absolute bottom-3 right-3 p-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-slate-400 hover:text-white text-[10px] flex items-center gap-1 px-1.5 transition-all"
                title="Copy Pitch"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
          >
            Close
          </button>

          {applied ? (
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Application Submitted! Poster Notified.</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSubmitApplication}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Locking Escrow & Sending...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Accept & Claim Task (₹{gig.payment})</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
