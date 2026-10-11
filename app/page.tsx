'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  GraduationCap, 
  X, 
  ChevronDown, 
  Zap, 
  TrendingUp, 
  Moon, 
  Sun,
  Users,
  Compass,
  DollarSign,
  ShieldAlert,
  Star
} from 'lucide-react';
import { useTheme } from './theme-provider';

export default function Home() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [promptInput, setPromptInput] = useState('');

  // Location state
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [addressName, setAddressName] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const suggestDebounce = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('userLocation');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name) setAddressName(parsed.name);
        if (parsed?.lat && parsed?.lng) setLocation({ lat: parsed.lat, lng: parsed.lng });
      }
    } catch { /* ignore */ }
  }, []);

  const fetchLocationSuggestions = (query: string) => {
    if (suggestDebounce.current) clearTimeout(suggestDebounce.current);
    if (!query.trim() || query.length < 2) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    suggestDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setLocationSuggestions(Array.isArray(data) ? data : []);
        setShowSuggestions(true);
      } catch { /* ignore */ }
    }, 300);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pickLocationSuggestion = (item: any) => {
    const lat = Number(item.lat);
    const lng = Number(item.lon);
    const shortName = item.address?.city || item.address?.town || item.address?.village || item.address?.suburb || item.display_name.split(',')[0];
    setLocation({ lat, lng });
    setAddressName(shortName);
    setLocationQuery(item.display_name.split(',').slice(0, 2).join(','));
    setLocationSuggestions([]);
    setShowSuggestions(false);
    setShowLocationModal(false);
    try {
      localStorage.setItem('userLocation', JSON.stringify({ lat, lng, name: shortName }));
    } catch { /* ignore */ }
  };

  const handleLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationQuery.trim()) return;
    setIsGeocoding(true);
    try {
      const res = await fetch(`/api/location/search?q=${encodeURIComponent(locationQuery)}`);
      const data = await res.json();
      if (data?.length > 0) {
        const { lat, lon, display_name } = data[0];
        const shortName = display_name.split(',')[0];
        setLocation({ lat: Number(lat), lng: Number(lon) });
        setAddressName(shortName);
        setShowLocationModal(false);
        try {
          localStorage.setItem('userLocation', JSON.stringify({ lat: Number(lat), lng: Number(lon), name: shortName }));
        } catch { /* ignore */ }
      } else {
        alert("Location not found.");
      }
    } catch {
      alert("Error finding location.");
    }
    setIsGeocoding(false);
  };

  const handleDetectLocation = () => {
    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ lat, lng });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          if (data?.display_name) {
            const shortName = data.address?.city || data.address?.town || data.address?.village || "Current Location";
            setAddressName(shortName);
            localStorage.setItem('userLocation', JSON.stringify({ lat, lng, name: shortName }));
          }
        } catch { /* ignore */ }
        setIsGeocoding(false);
        setShowLocationModal(false);
      },
      () => {
        setIsGeocoding(false);
        alert("Could not get GPS location.");
      }
    );
  };

  const sampleTasks = [
    {
      title: 'Deliver university lab records to Gate 2',
      location: 'Gomti Nagar, Sec 4',
      distance: '1.4 km',
      pay: '₹280',
      time: '30 mins',
      category: 'Delivery',
      urgent: true
    },
    {
      title: 'Help carry 3 boxes of study material (3rd Floor)',
      location: 'Indira Nagar, Block B',
      distance: '2.8 km',
      pay: '₹450',
      time: '45 mins',
      category: 'Moving',
      urgent: false
    },
    {
      title: 'Python Pandas practicals tutoring (1 hour)',
      location: 'SRMCEM Library Cafe',
      distance: '0.6 km',
      pay: '₹600',
      time: '1 hr',
      category: 'Tutoring',
      urgent: true
    }
  ];

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (promptInput.trim()) params.set('search', promptInput.trim());
    if (location) {
      params.set('lng', location.lng.toString());
      params.set('lat', location.lat.toString());
    }
    const query = params.toString();
    router.push(`/dashboard${query ? `?${query}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans selection:bg-[#2563eb] selection:text-white">

      {/* ─── LOCATION MODAL ─── */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-[#0f172a]">Set Your Location</h3>
              <button onClick={() => setShowLocationModal(false)} className="text-[#94a3b8] hover:text-[#0f172a]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleLocationSearch} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-[#94a3b8]" />
                  <input
                    type="text"
                    placeholder="Enter city, area, landmark..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#e2e8f0] text-[#0f172a] text-sm placeholder-[#94a3b8] outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                    value={locationQuery}
                    onChange={(e) => {
                      setLocationQuery(e.target.value);
                      fetchLocationSuggestions(e.target.value);
                    }}
                    onFocus={() => {
                      if (locationSuggestions.length > 0) setShowSuggestions(true);
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isGeocoding || !locationQuery.trim()}
                  className="bg-[#2563eb] text-white px-4 rounded-xl text-sm font-medium hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors shrink-0"
                >
                  {isGeocoding ? "..." : "Search"}
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="max-h-48 overflow-y-auto rounded-xl border border-[#e2e8f0] bg-white divide-y divide-slate-100 shadow-sm">
                  {locationSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => pickLocationSuggestion(item)}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 transition-colors flex items-start gap-2"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#2563eb] mt-0.5 shrink-0" />
                      <div className="text-xs">
                        <p className="font-medium text-[#0f172a] line-clamp-1">
                          {item.display_name.split(',')[0]}
                        </p>
                        <p className="text-[11px] text-[#64748b] line-clamp-1">
                          {item.display_name.split(',').slice(1).join(',').trim()}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </form>
            <div className="flex items-center gap-3 text-xs text-[#94a3b8]">
              <div className="h-px bg-[#e2e8f0] flex-1" /><span>OR</span><div className="h-px bg-[#e2e8f0] flex-1" />
            </div>
            <button
              onClick={handleDetectLocation}
              disabled={isGeocoding}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 border border-[#e2e8f0] text-[#0f172a] text-sm font-medium hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <MapPin className="w-4 h-4 text-[#2563eb]" /> {isGeocoding ? "Detecting..." : "Use GPS Location"}
            </button>
          </div>
        </div>
      )}
      
      {/* ─── PRODUCT NAVBAR ─── */}
      <header className="sticky top-0 z-40 border-b border-[#e2e8f0]/80 bg-white/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo with Modern Typography */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563eb] via-[#3b82f6] to-[#60a5fa] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 group-hover:shadow-blue-500/35 transition-all">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="font-display font-extrabold text-2xl tracking-tight bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#2563eb] bg-clip-text text-transparent">
                  Quick<span className="text-[#2563eb]">Gig</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
              </div>
              <span className="text-[10px] -mt-1 font-medium tracking-wider text-[#64748b] uppercase">
                Hyper-Local Tasks
              </span>
            </div>
          </Link>

          {/* Right Actions: Location + Theme Toggle + Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Set Location Pill */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-[#e2e8f0] hover:border-[#2563eb] transition-all group shrink-0"
              title="Set Location"
            >
              <MapPin className="w-3.5 h-3.5 text-[#2563eb] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-[#475569] max-w-[110px] sm:max-w-[140px] truncate">
                {addressName || "Set Location"}
              </span>
              <ChevronDown className="w-3 h-3 text-[#94a3b8]" />
            </button>

            {/* Dark/Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-[#e2e8f0] text-[#475569] hover:text-[#0f172a] transition-all"
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Night Mode"}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-500 transition-transform rotate-0 hover:rotate-90" />
              ) : (
                <Moon className="w-4 h-4 text-[#64748b] transition-transform hover:-rotate-12" />
              )}
            </button>

            <nav className="flex items-center gap-2 sm:gap-3 pl-1">
              <Link 
                href="/auth/login" 
                className="text-xs sm:text-sm font-medium text-[#475569] hover:text-[#0f172a] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
              >
                Log in
              </Link>
              <Link 
                href="/auth/register" 
                className="text-xs sm:text-sm font-semibold bg-[#0f172a] hover:bg-[#1e293b] text-white px-3.5 sm:px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow"
              >
                Get Started
              </Link>
            </nav>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-16 sm:pt-24 sm:pb-24 px-4 sm:px-6">
          {/* Subtle Glow Background Elements */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-400/10 via-indigo-400/10 to-teal-300/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-4xl mx-auto text-center">
            
            {/* Live Indicator Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 border border-blue-200/60 text-xs font-semibold text-[#2563eb] mb-6 shadow-xs backdrop-blur-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2563eb]"></span>
              </span>
              <span>Hyper-local micro-tasks within your 5km radius</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#0f172a] leading-[1.12]">
              Instant local help, <br />
              <span className="bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#06b6d4] bg-clip-text text-transparent">
                right at your doorstep.
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-5 text-base sm:text-lg text-[#475569] max-w-2xl mx-auto leading-relaxed">
              Need quick help moving boxes, urgent notes delivered, or a 1-hour tutor? Connect with verified neighbors &amp; college students in minutes.
            </p>

            {/* Search Box */}
            <div className="mt-9 max-w-2xl mx-auto">
              <form 
                onSubmit={handlePromptSubmit}
                className="bg-white border border-[#e2e8f0] hover:border-[#2563eb]/60 focus-within:border-[#2563eb] focus-within:ring-4 focus-within:ring-[#2563eb]/10 rounded-2xl p-2 sm:p-2.5 shadow-md shadow-slate-200/50 transition-all text-left"
              >
                <div className="flex items-center gap-3 px-3 py-1.5">
                  <Search className="w-5 h-5 text-[#94a3b8] flex-shrink-0" />
                  <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="What do you need help with? (e.g. 'Help moving desk 1km away')"
                    className="w-full bg-transparent text-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex-shrink-0 flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-xs sm:text-sm transition-all shadow-sm gap-1.5"
                    title="Find or Post"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Suggestion Chips */}
              <div className="mt-3.5 flex items-center justify-center gap-2 flex-wrap text-xs text-[#64748b]">
                <span className="font-medium text-[#94a3b8]">Trending:</span>
                {['Campus delivery', 'Moving help', 'Python tutor', 'Laptop setup', 'Dog walk'].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPromptInput(chip)}
                    className="px-2.5 py-1 rounded-lg bg-white/90 border border-[#e2e8f0] hover:border-[#2563eb] hover:bg-blue-50/50 text-[#475569] hover:text-[#2563eb] transition-all text-xs shadow-2xs"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link 
                href="/auth/register" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                Start Earning Nearby <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/dashboard/add-gig" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#0f172a] border border-[#e2e8f0] px-8 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-xs hover:-translate-y-0.5 active:translate-y-0"
              >
                Post a Task (Free)
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-14 pt-8 border-t border-[#e2e8f0]/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="font-display text-2xl font-bold text-[#0f172a]">100%</p>
                <p className="text-xs text-[#64748b]">Direct Cash/UPI Pay</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-[#2563eb]">&lt; 15 mins</p>
                <p className="text-xs text-[#64748b]">Average Response Time</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-[#0f172a]">0% Fee</p>
                <p className="text-xs text-[#64748b]">Free for Students</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-[#2563eb]">Verified</p>
                <p className="text-xs text-[#64748b]">Student ID Verification</p>
              </div>
            </div>

          </div>
        </section>

        {/* Live Tasks Preview */}
        <section className="py-14 px-4 sm:px-6 border-t border-[#e2e8f0] bg-white">
          <div className="max-w-5xl mx-auto">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563eb] uppercase tracking-wider mb-1">
                  <Compass className="w-3.5 h-3.5" />
                  Live Local Board
                </div>
                <h2 className="font-display text-2xl font-bold text-[#0f172a]">Nearby sample tasks</h2>
                <p className="text-xs text-[#64748b] mt-0.5">Active micro-gigs posted around Lucknow campus &amp; nearby colonies</p>
              </div>
              <Link 
                href="/dashboard" 
                className="text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8] flex items-center gap-1.5 self-start sm:self-auto bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 hover:border-blue-200 transition-colors"
              >
                <span>Explore all on Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {sampleTasks.map((task, idx) => (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#2563eb] hover:shadow-lg hover:shadow-blue-500/5 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-[#e2e8f0] text-[#475569] font-medium text-[11px] shadow-2xs">
                        {task.category}
                      </span>
                      <div className="text-right">
                        <span className="font-display font-extrabold text-[#2563eb] text-base">
                          {task.pay}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-semibold text-sm text-[#0f172a] leading-snug line-clamp-2 group-hover:text-[#2563eb] transition-colors">
                      {task.title}
                    </h3>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#e2e8f0] flex items-center justify-between text-xs text-[#475569]">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#2563eb]" />
                      <span className="font-medium text-[#0f172a]">{task.distance}</span>
                      <span className="text-[#94a3b8]">({task.location.split(',')[0]})</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#64748b]">
                      <Clock className="w-3.5 h-3.5 text-[#94a3b8]" />
                      <span>{task.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* How It Works (3 Steps) */}
        <section className="py-20 px-4 sm:px-6 border-t border-[#e2e8f0]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14 space-y-2">
              <span className="text-xs font-semibold text-[#2563eb] uppercase tracking-wider">Simple &amp; Transparent</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0f172a] tracking-tight">
                How QuickGig Works
              </h2>
              <p className="text-sm text-[#475569] max-w-md mx-auto">
                No middleman commissions. Connect directly with people in your neighbourhood.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="relative bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563eb] flex items-center justify-center font-display font-bold text-lg mb-4 border border-blue-100">
                  1
                </div>
                <h3 className="font-semibold text-base text-[#0f172a] mb-2">Post or Find Task</h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Post what you need with your budget, or browse gigs open within walking distance of you.
                </p>
              </div>

              <div className="relative bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563eb] flex items-center justify-center font-display font-bold text-lg mb-4 border border-blue-100">
                  2
                </div>
                <h3 className="font-semibold text-base text-[#0f172a] mb-2">Accept &amp; Chat</h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Worker accepts gig or proposes price. Live in-app chat opens instantly to coordinate details.
                </p>
              </div>

              <div className="relative bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563eb] flex items-center justify-center font-display font-bold text-lg mb-4 border border-blue-100">
                  3
                </div>
                <h3 className="font-semibold text-base text-[#0f172a] mb-2">Complete &amp; Get Paid</h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Task done! Receive payment directly via cash/UPI and build mutual trust ratings.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why QuickGig (3 Clean Cards) */}
        <section className="py-20 px-4 sm:px-6 border-t border-[#e2e8f0] bg-white">
          <div className="max-w-5xl mx-auto">
            
            <div className="text-center mb-14 space-y-2">
              <span className="text-xs font-semibold text-[#2563eb] uppercase tracking-wider">Features</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0f172a] tracking-tight">
                Why Students &amp; Locals Love QuickGig
              </h2>
              <p className="text-sm text-[#475569]">
                Engineered specifically for hyper-local micro-tasks, speed, and safety.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-[#f8fafc] p-6 rounded-2xl border border-[#e2e8f0] shadow-xs hover:shadow-md transition-all flex flex-col">
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 text-[#2563eb]">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-base text-[#0f172a] mb-2">
                  Location First
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Discover tasks strictly within a few kilometers of your exact location. No wasting time or fuel traveling across town.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#f8fafc] p-6 rounded-2xl border border-[#e2e8f0] shadow-xs hover:shadow-md transition-all flex flex-col">
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 text-[#2563eb]">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-base text-[#0f172a] mb-2">
                  Flexible Micro-Work
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Pick up 20-45 minute quick jobs between university lectures or in evening free hours. Complete control over your time.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#f8fafc] p-6 rounded-2xl border border-[#e2e8f0] shadow-xs hover:shadow-md transition-all flex flex-col">
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 text-[#2563eb]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-base text-[#0f172a] mb-2">
                  Verified Campus Network
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Student ID card verification and community reviews ensure every person taking gigs is genuine and trusted.
                </p>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Modern Clean Footer */}
      <footer className="border-t border-[#e2e8f0] bg-white py-10 px-4 sm:px-6 text-xs text-[#475569]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#2563eb] flex items-center justify-center text-white">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display font-bold text-sm text-[#0f172a]">Quick<span className="text-[#2563eb]">Gig</span></span>
              <span className="text-[#94a3b8] text-[11px]">• Hyper-local micro-gig platform</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#64748b]">
            <Link href="/auth/login" className="hover:text-[#0f172a] transition-colors">Login</Link>
            <Link href="/auth/register" className="hover:text-[#0f172a] transition-colors">Register</Link>
            <Link href="/dashboard" className="hover:text-[#0f172a] transition-colors">Dashboard</Link>
          </div>

          <div className="flex items-center gap-1.5 text-center sm:text-right text-[11px] text-[#94a3b8]">
            <GraduationCap className="w-3.5 h-3.5 text-[#2563eb]" />
            <span>Capstone Project • SRMCEM Lucknow</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
