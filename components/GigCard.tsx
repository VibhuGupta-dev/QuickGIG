'use client';

import React from 'react';
import { Gig } from '../types/gig';
import { 
  MapPin, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Star, 
  ArrowUpRight, 
  Zap,
  Package,
  Truck,
  GraduationCap,
  Laptop,
  Home,
  Calendar,
  HeartHandshake
} from 'lucide-react';

interface GigCardProps {
  gig: Gig;
  onSelect: (gig: Gig) => void;
  onOpenPitch: (gig: Gig) => void;
  isSelected?: boolean;
}

export const GigCard: React.FC<GigCardProps> = ({
  gig,
  onSelect,
  onOpenPitch,
  isSelected,
}) => {
  const getCategoryIcon = (category: Gig['category']) => {
    switch (category) {
      case 'Delivery': return <Package className="w-3.5 h-3.5" />;
      case 'Moving': return <Truck className="w-3.5 h-3.5" />;
      case 'Tutoring': return <GraduationCap className="w-3.5 h-3.5" />;
      case 'Tech Help': return <Laptop className="w-3.5 h-3.5" />;
      case 'Home Care': return <Home className="w-3.5 h-3.5" />;
      case 'Event Assist': return <Calendar className="w-3.5 h-3.5" />;
      case 'Pet Care': return <HeartHandshake className="w-3.5 h-3.5" />;
      default: return <Zap className="w-3.5 h-3.5" />;
    }
  };

  const getUrgencyBadge = (urgency: Gig['urgency']) => {
    switch (urgency) {
      case 'Immediate':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            Urgent
          </span>
        );
      case 'Today':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
            Today
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
            Flexible
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onSelect(gig)}
      className={`glass-panel glass-panel-hover rounded-2xl p-5 cursor-pointer relative transition-all ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-[#12192c]'
          : 'border-white/[0.08]'
      }`}
    >
      {/* Top Meta: Category + AI Match Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
            {getCategoryIcon(gig.category)}
            <span>{gig.category}</span>
          </span>
          {getUrgencyBadge(gig.urgency)}
        </div>

        {/* AI Match Badge */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-medium shadow-sm shadow-indigo-950">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>{gig.aiMatchScore}% Match</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-white tracking-tight line-clamp-1 group-hover:text-indigo-300 transition-colors">
        {gig.title}
      </h3>

      {/* Description */}
      <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
        {gig.description}
      </p>

      {/* Tags */}
      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
        {gig.aiTags.map((tag, i) => (
          <span
            key={i}
            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/[0.05]"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Location and Duration */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-1 text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <span className="font-medium text-slate-200">{gig.distanceKm} km</span>
          <span className="text-slate-500">•</span>
          <span className="truncate max-w-[140px] text-slate-400">{gig.locationName}</span>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{gig.duration}</span>
        </div>
      </div>

      {/* Bottom Payout & Actions */}
      <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
        {/* Payout */}
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-mono block">Instant Payout</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              ₹{gig.payment}
            </span>
            <span className="text-[10px] text-emerald-400/80 font-mono">UPI Escrow</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPitch(gig);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 transition-all hover:scale-105"
            title="Generate AI Application Pitch"
          >
            <Sparkles className="w-3 h-3 text-cyan-300" />
            <span className="hidden sm:inline">AI Pitch</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(gig);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/30"
          >
            <span>View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Poster Trust Pill */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/40 px-2.5 py-1 rounded-lg border border-slate-800/80">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-slate-300 font-medium truncate">{gig.posterName}</span>
          {gig.verifiedPoster && (
            <span title="Verified Campus Student / Poster" className="inline-flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-amber-400 flex-shrink-0">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="font-semibold">{gig.posterRating}</span>
          <span className="text-slate-500 text-[10px]">({gig.posterCompletedGigs})</span>
        </div>
      </div>

    </div>
  );
};
