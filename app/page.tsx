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
  Briefcase,
  Zap,
  TrendingUp
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
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
      category: 'Delivery'
    },
    {
      title: 'Help carry 3 boxes of study material (3rd Floor)',
      location: 'Indira Nagar, Block B',
      distance: '2.8 km',
      pay: '₹450',
      time: '45 mins',
      category: 'Moving'
    },
    {
      title: 'Python Pandas practicals tutoring (1 hour)',
      location: 'SRMCEM Library Cafe',
      distance: '0.6 km',
      pay: '₹600',
      time: '1 hr',
      category: 'Tutoring'
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
      
      {/* Product Navbar */}
      <header className="sticky top-0 z-40 border-b border-[#e2e8f0] bg-white/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center text-white shadow-sm">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div>
              <span className="font-semibold text-lg tracking-tight text-[#0f172a]">QuickGig</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {/* Set Location Pill */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-[#e2e8f0] hover:border-[#2563eb] transition-colors group shrink-0"
              title="Set Location"
            >
              <MapPin className="w-3.5 h-3.5 text-[#2563eb]" />
              <span className="text-xs font-medium text-[#475569] max-w-[130px] truncate">
                {addressName || "Set Location"}
              </span>
              <ChevronDown className="w-3 h-3 text-[#94a3b8]" />
            </button>

            <nav className="flex items-center gap-3">
              <Link 
                href="/auth/login" 
                className="text-sm font-medium text-[#475569] hover:text-[#0f172a] transition-colors px-2 py-1"
              >
                Log in
              </Link>
              <Link 
                href="/auth/register" 
                className="text-sm font-medium bg-[#0f172a] hover:bg-[#1e293b] text-white px-4 py-2 rounded-xl transition-all shadow-sm"
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
        <section className="pt-20 pb-16 sm:pt-28 sm:pb-24 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            
            {/* Product badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-medium text-[#2563eb] mb-6">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Hyper-local micro-tasks for students & local communities</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#0f172a] leading-[1.15]">
              Find small jobs, <br />
              <span className="text-[#2563eb]">right in your neighborhood.</span>
            </h1>

            {/* Subheading */}
            <p className="mt-5 text-base sm:text-lg text-[#475569] max-w-xl mx-auto leading-relaxed">
              Need help moving furniture, tutoring, or running an errand? QuickGig connects you with verified hands nearby in minutes. Safe, transparent, and direct.
            </p>

            {/* Search Box */}
            <div className="mt-10 max-w-2xl mx-auto">
              <form 
                onSubmit={handlePromptSubmit}
                className="bg-white border border-[#e2e8f0] hover:border-[#2563eb]/60 focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#2563eb]/10 rounded-2xl p-2.5 shadow-sm transition-all text-left"
              >
                <div className="flex items-center gap-3 px-3 py-1.5">
                  <Search className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
                  <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="Describe a task or skill... (e.g. 'Help moving study table 2km away')"
                    className="w-full bg-transparent text-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white transition-all shadow-sm"
                    title="Search or Post"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Suggestion Chips */}
              <div className="mt-3 flex items-center justify-center gap-2 flex-wrap text-xs text-[#94a3b8]">
                <span>Popular:</span>
                {['Campus delivery', 'Moving help', 'Python tutor', 'Laptop setup', 'Dog walk'].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPromptInput(chip)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#e2e8f0] hover:border-[#2563eb] text-[#475569] hover:text-[#0f172a] transition-all text-xs"
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
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-7 py-3 rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow"
              >
                Start Earning <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/dashboard/add-gig" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#0f172a] border border-[#e2e8f0] px-7 py-3 rounded-xl font-medium text-sm transition-all shadow-sm"
              >
                Post a Task
              </Link>
            </div>

          </div>
        </section>

        {/* Live Tasks Preview */}
        <section className="py-12 px-4 sm:px-6 border-t border-[#e2e8f0] bg-white">
          <div className="max-w-4xl mx-auto">
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-[#0f172a]">Nearby sample tasks</h2>
                <p className="text-xs text-[#64748b]">Active opportunities in your local radius</p>
              </div>
              <Link 
                href="/dashboard" 
                className="text-xs font-medium text-[#2563eb] hover:underline flex items-center gap-1"
              >
                View all in Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sampleTasks.map((task, idx) => (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 border border-[#e2e8f0] hover:border-[#2563eb] hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-white border border-[#e2e8f0] text-[#475569] font-medium text-[11px]">
                        {task.category}
                      </span>
                      <span className="font-semibold text-[#2563eb] text-sm">
                        {task.pay}
                      </span>
                    </div>

                    <h3 className="font-medium text-sm text-[#0f172a] leading-snug line-clamp-2">
                      {task.title}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex items-center justify-between text-xs text-[#475569]">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#94a3b8]" />
                      <span>{task.distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#94a3b8]" />
                      <span>{task.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Why QuickGig (3 Clean Cards) */}
        <section className="py-20 px-4 sm:px-6 border-t border-[#e2e8f0]">
          <div className="max-w-4xl mx-auto">
            
            <div className="text-center mb-12 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a] tracking-tight">
                Why use QuickGig?
              </h2>
              <p className="text-sm text-[#475569]">
                Built for simplicity, speed, and local communities.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5 text-[#2563eb]" />
                </div>
                <h3 className="text-base font-semibold text-[#0f172a] mb-1.5">
                  Location First
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Discover tasks within a few kilometers of your exact location. No traveling across the city for a small gig.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5 text-[#2563eb]" />
                </div>
                <h3 className="text-base font-semibold text-[#0f172a] mb-1.5">
                  Quick &amp; Flexible
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Work when you want, for as long as you want. Perfect for students with fluctuating class schedules.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5 text-[#2563eb]" />
                </div>
                <h3 className="text-base font-semibold text-[#0f172a] mb-1.5">
                  Open for Everyone
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  No need to be an agency or registered business. Anyone can post a task, and anyone can complete one safely.
                </p>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Modern Clean Footer */}
      <footer className="border-t border-[#e2e8f0] bg-white py-10 px-4 sm:px-6 text-xs text-[#475569]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#2563eb] flex items-center justify-center text-white">
              <Zap className="w-3.5 h-3.5 fill-white" />
            </div>
            <span className="font-semibold text-[#0f172a]">QuickGig</span>
            <span className="text-[#94a3b8]">• Hyper-local micro-gig platform</span>
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
