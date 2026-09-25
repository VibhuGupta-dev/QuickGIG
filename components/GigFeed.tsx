'use client';

import React, { useState, useMemo } from 'react';
import { Gig, GigCategory } from '../types/gig';
import { GigCard } from './GigCard';
import { RadarScanner } from './RadarScanner';
import { 
  Search, 
  MapPin, 
  Compass, 
  Radar, 
  LayoutGrid, 
  ArrowUpDown
} from 'lucide-react';

interface GigFeedProps {
  gigs: Gig[];
  radiusKm: number;
  setRadiusKm: (radius: number) => void;
  onSelectGig: (gig: Gig) => void;
  onOpenPitch: (gig: Gig) => void;
  selectedGigId?: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const GigFeed: React.FC<GigFeedProps> = ({
  gigs,
  radiusKm,
  setRadiusKm,
  onSelectGig,
  onOpenPitch,
  selectedGigId,
  searchQuery,
  setSearchQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GigCategory>('All');
  const [sortBy, setSortBy] = useState<'match' | 'distance' | 'pay' | 'urgent'>('match');
  const [viewMode, setViewMode] = useState<'grid' | 'radar' | 'split'>('split');

  const categories: GigCategory[] = [
    'All',
    'Delivery',
    'Moving',
    'Tutoring',
    'Tech Help',
    'Home Care',
    'Event Assist',
    'Pet Care'
  ];

  // Filtering & Sorting
  const filteredGigs = useMemo(() => {
    return gigs
      .filter((gig) => {
        // Distance check
        if (gig.distanceKm > radiusKm) return false;

        // Category check
        if (selectedCategory !== 'All' && gig.category !== selectedCategory) return false;

        // Search check
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = gig.title.toLowerCase().includes(q);
          const matchesDesc = gig.description.toLowerCase().includes(q);
          const matchesLoc = gig.locationName.toLowerCase().includes(q);
          const matchesTag = gig.aiTags.some(t => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesTag) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match') return b.aiMatchScore - a.aiMatchScore;
        if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
        if (sortBy === 'pay') return b.payment - a.payment;
        if (sortBy === 'urgent') {
          const rank = { Immediate: 3, Today: 2, Flexible: 1 };
          return rank[b.urgency] - rank[a.urgency];
        }
        return 0;
      });
  }, [gigs, radiusKm, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Controls Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-white/[0.08] mb-8 space-y-4">
        
        {/* Row 1: Search, Radius Slider, View Mode */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by task, location, skills (e.g. 'chemistry', 'bike', 'laptop')..."
              className="w-full bg-[#0d121f] text-xs sm:text-sm text-slate-200 placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-2xl border border-white/10 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Interactive Radius Slider */}
          <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-800 min-w-[280px]">
            <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>Search Radius</span>
                <span className="text-white font-bold">{radiusKm} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          {/* Sort Dropdown & View Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center bg-slate-900/80 rounded-2xl border border-slate-800 px-3 py-2 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'match' | 'distance' | 'pay' | 'urgent')}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="match">AI Match %</option>
                <option value="distance">Nearest First</option>
                <option value="pay">Highest Pay (₹)</option>
                <option value="urgent">Most Urgent</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="hidden sm:flex items-center p-1 rounded-2xl bg-slate-900/80 border border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'split'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Radar + Grid Split"
              >
                <Compass className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('radar')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'radar'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Full Radar View"
              >
                <Radar className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Row 2: Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                    : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] border border-white/[0.06]'
                }`}
              >
                {cat === 'All' ? '⚡ All Categories' : cat}
              </button>
            );
          })}
        </div>

      </div>

      {/* Main Content Area based on View Mode */}
      {viewMode === 'radar' && (
        <div className="mb-8">
          <RadarScanner
            gigs={filteredGigs}
            radiusKm={radiusKm}
            onSelectGig={onSelectGig}
            selectedGigId={selectedGigId}
          />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Radar Scanner Column */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="sticky top-24">
              <RadarScanner
                gigs={filteredGigs}
                radiusKm={radiusKm}
                onSelectGig={onSelectGig}
                selectedGigId={selectedGigId}
              />
            </div>
          </div>

          {/* Cards Column */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
              <span>Showing {filteredGigs.length} micro-gigs within {radiusKm} km</span>
              <span className="text-cyan-400">SRMCEM / Lucknow Campus Area</span>
            </div>

            {filteredGigs.length === 0 ? (
              <div className="glass-panel rounded-3xl p-12 text-center border border-white/[0.08]">
                <Radar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-white">No Gigs Found in Radius</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Try expanding your search radius slider (e.g. 10 km) or selecting &quot;All Categories&quot;.
                </p>
                <button
                  onClick={() => {
                    setRadiusKm(15);
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 hover:bg-indigo-900/60 transition-all"
                >
                  Reset Filters (15 km)
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredGigs.map((gig) => (
                  <GigCard
                    key={gig.id}
                    gig={gig}
                    onSelect={onSelectGig}
                    onOpenPitch={onOpenPitch}
                    isSelected={selectedGigId === gig.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'grid' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
            <span>Showing {filteredGigs.length} micro-gigs within {radiusKm} km</span>
            <span className="text-cyan-400">SRMCEM / Lucknow Campus Area</span>
          </div>

          {filteredGigs.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-white/[0.08]">
              <Radar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">No Gigs Found in Radius</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Try expanding your search radius slider (e.g. 10 km) or selecting &quot;All Categories&quot;.
              </p>
              <button
                onClick={() => {
                  setRadiusKm(15);
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 hover:bg-indigo-900/60 transition-all"
              >
                Reset Filters (15 km)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGigs.map((gig) => (
                <GigCard
                  key={gig.id}
                  gig={gig}
                  onSelect={onSelectGig}
                  onOpenPitch={onOpenPitch}
                  isSelected={selectedGigId === gig.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
