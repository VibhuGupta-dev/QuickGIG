"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Plus, LogOut, Briefcase, Search, X, MapPin, Sparkles, AlertCircle,
  Heart, MessageCircle, User as UserIcon, Bell, Zap, ChevronDown, Settings,
  ChevronLeft, ChevronRight, Globe, FileText, Layers
} from "lucide-react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["All", "Errand", "Cleaning", "Tutoring", "Moving Help", "Pet Care", "Handyman", "Other"];
const ITEMS_PER_PAGE = 8; // 2 rows × 4 columns

export default function Dashboard() {
  const { data: session, status } = useSession();

  const [viewMode, setViewMode] = useState<'find' | 'provide'>('find');
  const [findTab, setFindTab] = useState<'nearby' | 'applications' | 'all'>('nearby');

  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lng: number; lat: number } | null>(null);
  const [addressName, setAddressName] = useState("");
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestDebounce = useRef<NodeJS.Timeout | null>(null);

  // Navbar UI state
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const profileRef = useRef<HTMLDivElement>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(gigs.length / ITEMS_PER_PAGE);
  const pagedGigs = gigs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, findTab, searchQuery, selectedCategory]);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchNearby = () => {
    if (!location) return;
    setLoading(true);
    let url = `/api/gigs/nearby?lng=${location.lng}&lat=${location.lat}&radius=10&q=${encodeURIComponent(searchQuery)}`;
    if (selectedCategory !== "All") url += `&category=${encodeURIComponent(selectedCategory)}`;
    fetch(url).then(res => res.json()).then(data => { setGigs(data); setLoading(false); });
  };

  const fetchAllGigs = () => {
    setLoading(true);
    let url = `/api/gigs/all?q=${encodeURIComponent(searchQuery)}`;
    if (selectedCategory !== "All") url += `&category=${encodeURIComponent(selectedCategory)}`;
    fetch(url).then(res => res.json()).then(data => { setGigs(data); setLoading(false); });
  };

  const fetchMyPosted = () => {
    setLoading(true);
    fetch(`/api/gigs/me`).then(res => res.json()).then(data => { setGigs(data); setLoading(false); });
  };

  const fetchMyApplications = () => {
    setLoading(true);
    fetch(`/api/applications`).then(res => res.json()).then(data => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setGigs(data.map((app: any) => ({ ...app.gigId, applicationStatus: app.status, proposedPrice: app.proposedPrice })));
      setLoading(false);
    });
  };

  useEffect(() => {
    if (status === "authenticated") {
      if (viewMode === 'find') {
        if (findTab === 'nearby') {
          if (!location) {
            if ("geolocation" in navigator) {
              navigator.geolocation.getCurrentPosition(
                async (pos) => {
                  setLocation({ lng: pos.coords.longitude, lat: pos.coords.latitude });
                  try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
                    const data = await res.json();
                    if (data?.display_name) {
                      setAddressName(data.address.city || data.address.town || data.address.village || "Current Location");
                    }
                  } catch (e) { }
                },
                () => setShowLocationModal(true)
              );
            }
          } else { fetchNearby(); }
        } else if (findTab === 'all') { fetchAllGigs(); }
        else if (findTab === 'applications') { fetchMyApplications(); }
      } else if (viewMode === 'provide') { fetchMyPosted(); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, viewMode, findTab, location, searchQuery, selectedCategory]);

  const fetchLocationSuggestions = (query: string) => {
    if (suggestDebounce.current) clearTimeout(suggestDebounce.current);
    if (!query.trim() || query.length < 2) { setLocationSuggestions([]); setShowSuggestions(false); return; }
    suggestDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setLocationSuggestions(Array.isArray(data) ? data : []);
        setShowSuggestions(true);
      } catch { /* ignore */ }
    }, 300);
  };

  const pickLocationSuggestion = (item: { lat: string; lon: string; display_name: string; address?: { city?: string; town?: string; village?: string; suburb?: string } }) => {
    setLocation({ lat: Number(item.lat), lng: Number(item.lon) });
    const shortName = item.address?.city || item.address?.town || item.address?.village || item.address?.suburb || item.display_name.split(',')[0];
    setAddressName(shortName);
    setLocationQuery(item.display_name.split(',').slice(0, 2).join(','));
    setLocationSuggestions([]);
    setShowSuggestions(false);
    setFindTab('nearby');
    setShowLocationModal(false);
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
        setLocation({ lat: Number(lat), lng: Number(lon) });
        setAddressName(display_name.split(',')[0]);
        setFindTab('nearby');
        setShowLocationModal(false);
      } else { alert("Location not found."); }
    } catch { alert("Error finding location."); }
    setIsGeocoding(false);
  };

  const handleDetectLocation = () => {
    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocation({ lng: pos.coords.longitude, lat: pos.coords.latitude });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
          const data = await res.json();
          if (data?.display_name) {
            setAddressName(data.address.city || data.address.town || data.address.village || "Current Location");
          }
        } catch (e) { }
        setIsGeocoding(false);
        setShowLocationModal(false);
      },
      () => { setIsGeocoding(false); alert("Could not get location."); }
    );
  };

  const toggleWishlist = (gigId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlistIds(prev =>
      prev.includes(gigId) ? prev.filter(id => id !== gigId) : [...prev, gigId]
    );
  };

  if (status === "loading") return <div className="min-h-screen bg-[#f8fafc] flex justify-center items-center text-[#64748b] font-medium">Loading...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans selection:bg-[#2563eb] selection:text-white">

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

      {/* ─────────────────────────────────────────────
          NAVBAR
      ───────────────────────────────────────────── */}
      <header className="bg-white/90 border-b border-[#e2e8f0] sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">

          {/* 1. Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0 mr-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center text-white shadow-sm">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <span className="font-semibold text-lg text-[#0f172a] tracking-tight">QuickGig</span>
          </Link>

          {/* 2. Location Pill */}
          <button
            onClick={() => setShowLocationModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-[#e2e8f0] hover:border-[#2563eb] transition-colors group shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-[#2563eb]" />
            <span className="text-xs font-medium text-[#475569] max-w-[120px] truncate">
              {addressName || "Set Location"}
            </span>
            <ChevronDown className="w-3 h-3 text-[#94a3b8]" />
          </button>

          {/* 3. Search Bar */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Search local tasks..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-[#e2e8f0] text-[#0f172a] text-sm placeholder-[#94a3b8] outline-none focus:border-[#2563eb] focus:bg-white transition-colors"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 4. Wishlist */}
          <button
            onClick={() => { setViewMode('find'); setFindTab('applications'); }}
            className="relative p-2 rounded-full hover:bg-slate-100 transition-colors group shrink-0"
            title="Wishlist"
          >
            <Heart className={`w-5 h-5 transition-colors ${wishlistIds.length > 0 ? 'text-[#2563eb] fill-[#2563eb]' : 'text-[#94a3b8] group-hover:text-[#0f172a]'}`} />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#2563eb] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {wishlistIds.length}
              </span>
            )}
          </button>

          {/* 5. Chats */}
          <Link
            href="/dashboard/chats"
            className="relative p-2 rounded-full hover:bg-slate-100 transition-colors group shrink-0"
            title="Chats"
          >
            <MessageCircle className="w-5 h-5 text-[#94a3b8] group-hover:text-[#0f172a] transition-colors" />
          </Link>

          {/* 6. Profile Dropdown */}
          <div className="relative shrink-0" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(v => !v)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-[#e2e8f0] flex items-center justify-center">
                <span className="text-xs font-semibold text-[#0f172a]">
                  {session.user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8] hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-12 w-52 bg-white border border-[#e2e8f0] rounded-2xl shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-[#e2e8f0] bg-slate-50">
                  <p className="text-sm font-semibold text-[#0f172a]">{session.user?.name}</p>
                  <p className="text-xs text-[#64748b] truncate">{session.user?.email}</p>
                </div>
                <div className="p-1.5 space-y-0.5">
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#475569] hover:bg-slate-50 hover:text-[#0f172a] transition-colors font-medium text-left">
                    <UserIcon className="w-4 h-4" /> Profile
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#475569] hover:bg-slate-50 hover:text-[#0f172a] transition-colors font-medium text-left">
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <div className="h-px bg-[#e2e8f0] my-1" />
                  <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium text-left"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 7. +Gig Button */}
          <Link
            href="/dashboard/add-gig"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium transition-all shadow-sm shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Post Gig
          </Link>

          {/* 8. Notifications Bell */}
          <button
            className="relative p-2 rounded-full hover:bg-slate-100 transition-colors group shrink-0"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-[#94a3b8] group-hover:text-[#0f172a] transition-colors" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2563eb] rounded-full border border-white"></span>
          </button>

        </div>

        {/* ── Mobile Location Bar ── */}
        <div className="sm:hidden px-4 pb-3 flex gap-2">
          <button
            onClick={() => setShowLocationModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-[#e2e8f0] text-xs font-medium text-[#475569]"
          >
            <MapPin className="w-3.5 h-3.5 text-[#2563eb]" />
            {addressName || "Set Location"}
            <ChevronDown className="w-3 h-3 text-[#94a3b8]" />
          </button>
          <Link
            href="/dashboard/add-gig"
            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2563eb] text-white text-xs font-medium"
          >
            <Plus className="w-3 h-3" /> Post
          </Link>
        </div>
      </header>

      {/* ─── CATEGORY TABS ─── */}
      <div className="bg-white border-b border-[#e2e8f0] sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex gap-2 overflow-x-auto hide-scrollbar">
          {/* View mode tabs */}
          <button
            onClick={() => { setViewMode('find'); setFindTab('nearby'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${viewMode === 'find' && findTab === 'nearby' ? 'bg-[#0f172a] text-white shadow-sm' : 'bg-slate-50 text-[#475569] border border-[#e2e8f0] hover:border-[#2563eb]'}`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#2563eb]" /> Nearby
          </button>
          <button
            onClick={() => { setViewMode('find'); setFindTab('all'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${viewMode === 'find' && findTab === 'all' ? 'bg-[#0f172a] text-white shadow-sm' : 'bg-slate-50 text-[#475569] border border-[#e2e8f0] hover:border-[#2563eb]'}`}
          >
            <Globe className="w-3.5 h-3.5 text-[#2563eb]" /> All Gigs
          </button>
          <button
            onClick={() => { setViewMode('find'); setFindTab('applications'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${viewMode === 'find' && findTab === 'applications' ? 'bg-[#0f172a] text-white shadow-sm' : 'bg-slate-50 text-[#475569] border border-[#e2e8f0] hover:border-[#2563eb]'}`}
          >
            <FileText className="w-3.5 h-3.5 text-[#2563eb]" /> Applications
          </button>
          <button
            onClick={() => setViewMode('provide')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${viewMode === 'provide' ? 'bg-[#0f172a] text-white shadow-sm' : 'bg-slate-50 text-[#475569] border border-[#e2e8f0] hover:border-[#2563eb]'}`}
          >
            <Layers className="w-3.5 h-3.5 text-[#2563eb]" /> My Gigs
          </button>

          {/* Divider */}
          <div className="w-px bg-[#e2e8f0] shrink-0 mx-1" />

          {/* Category pills — only in find mode */}
          {(viewMode === 'find' && (findTab === 'nearby' || findTab === 'all')) && CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${selectedCategory === cat ? 'bg-[#2563eb] text-white shadow-sm' : 'bg-slate-50 text-[#475569] border border-[#e2e8f0] hover:border-[#2563eb]'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <main className="max-w-7xl mx-auto px-4 pt-6 pb-24 space-y-6">

        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">
            Hi, {session.user?.name?.split(' ')[0]}
          </h1>
          <p className="text-[#475569] text-sm mt-0.5">
            {viewMode === 'find' ? "Find available gigs near you" : "Manage your posted micro-tasks"}
          </p>
        </div>

        {/* List Header */}
        <div className="flex justify-between items-center border-b border-[#e2e8f0] pb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-[#0f172a] flex items-center gap-1.5">
              {viewMode === 'find' && findTab === 'nearby' && (
                <><MapPin className="w-4 h-4 text-[#2563eb]" /> Available Nearby</>
              )}
              {viewMode === 'find' && findTab === 'all' && (
                <><Globe className="w-4 h-4 text-[#2563eb]" /> All Open Gigs</>
              )}
              {viewMode === 'find' && findTab === 'applications' && (
                <><FileText className="w-4 h-4 text-[#2563eb]" /> Your Applications</>
              )}
              {viewMode === 'provide' && (
                <><Layers className="w-4 h-4 text-[#2563eb]" /> Your Posted Gigs</>
              )}
            </h2>
            {gigs.length > 0 && (
              <span className="text-xs font-medium text-[#475569] bg-slate-100 px-2.5 py-0.5 rounded-full border border-[#e2e8f0]">
                {gigs.length} total
              </span>
            )}
          </div>
          {viewMode === 'provide' && (
            <Link href="/dashboard/add-gig" className="flex items-center text-xs font-medium bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-3.5 py-1.5 rounded-xl shadow-sm transition-colors">
              <Plus className="w-3.5 h-3.5 mr-1" /> Post Gig
            </Link>
          )}
        </div>

        {/* Gigs Grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-52 bg-white rounded-2xl animate-pulse border border-[#e2e8f0]" />
              ))}
            </div>
          ) : gigs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-dashed border-[#e2e8f0]">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6 text-[#94a3b8]" />
              </div>
              <h3 className="text-base font-semibold text-[#0f172a] mb-1">No gigs found</h3>
              <p className="text-[#475569] text-xs max-w-xs leading-relaxed">
                {viewMode === 'provide'
                  ? "You haven't posted any gigs yet."
                  : "No gigs match your criteria. Try adjusting location or category."}
              </p>
              {viewMode === 'provide' && (
                <Link href="/dashboard/add-gig" className="mt-4 flex items-center text-xs font-medium bg-[#0f172a] hover:bg-[#1e293b] text-white px-4 py-2 rounded-xl transition-colors">
                  <Plus className="w-4 h-4 mr-1.5" /> Post a Gig
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* 4-column grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {pagedGigs.map((gig: any) => (
                  <Link
                    href={`/dashboard/gig/${gig._id}`}
                    key={gig._id}
                    className="flex flex-col bg-white rounded-2xl border border-[#e2e8f0] hover:border-[#2563eb] hover:shadow-md transition-all group overflow-hidden"
                  >
                    {/* ── Card Image ── */}
                    <div className="relative h-32 bg-slate-50 overflow-hidden flex items-center justify-center">
                      {gig.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={gig.image}
                          alt={gig.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                          <Briefcase className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      {/* Negotiable badge on image */}
                      {gig.isNegotiable && (
                        <span className="absolute top-2 left-2 bg-white/95 text-[#475569] text-[9px] px-1.5 py-0.5 rounded font-medium backdrop-blur-sm border border-[#e2e8f0]">
                          Negotiable
                        </span>
                      )}
                    </div>
                    {/* Card Top */}
                    <div className="flex items-center justify-between px-3 pt-3 pb-1">
                      <span className="bg-slate-100 text-[#475569] text-[10px] px-2 py-0.5 rounded-md font-medium tracking-wide truncate max-w-[80px]">
                        {gig.category}
                      </span>
                      <button
                        onClick={(e) => toggleWishlist(gig._id, e)}
                        className="p-1 rounded-full hover:bg-slate-100 transition-colors shrink-0"
                      >
                        <Heart className={`w-3.5 h-3.5 transition-colors ${wishlistIds.includes(gig._id) ? 'text-[#2563eb] fill-[#2563eb]' : 'text-[#94a3b8] hover:text-[#2563eb]'}`} />
                      </button>
                    </div>

                    {/* Card Body */}
                    <div className="px-3 pb-2 flex-1 flex flex-col gap-1">
                      <h3 className="font-semibold text-[#0f172a] text-sm leading-snug group-hover:text-[#2563eb] transition-colors line-clamp-2">
                        {gig.title}
                      </h3>
                      {gig.address && (
                        <div className="flex items-center gap-1 text-[10px] text-[#94a3b8]">
                          <MapPin className="w-2.5 h-2.5 shrink-0 text-[#2563eb]" />
                          <span className="truncate">{gig.address}</span>
                        </div>
                      )}
                      <p className="text-[11px] text-[#475569] line-clamp-2 leading-relaxed flex-1 mt-0.5">
                        {gig.description}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="px-3 pb-3 pt-2 border-t border-[#e2e8f0] flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-base font-bold text-[#2563eb]">₹{gig.payment}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {gig.applicationStatus ? (
                          <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
                            gig.applicationStatus === 'Accepted'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-[#475569]'
                          }`}>
                            {gig.applicationStatus}
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
                            gig.status === 'Open'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-[#475569]'
                          }`}>
                            {gig.status}
                          </span>
                        )}
                        {viewMode === 'find' && (findTab === 'nearby' || findTab === 'all') && gig.postedBy?.name && (
                          <span className="text-[9px] text-[#94a3b8] truncate max-w-[70px]">
                            {gig.postedBy.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-[#e2e8f0]">
                  <p className="text-xs text-[#475569] font-medium">
                    Showing{' '}
                    <span className="text-[#0f172a] font-semibold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, gigs.length)}</span>
                    {' '}of{' '}
                    <span className="text-[#0f172a] font-semibold">{gigs.length}</span> gigs
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-[#e2e8f0] text-[#475569] hover:border-[#2563eb] hover:text-[#0f172a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .reduce<(number | string)[]>((acc, p, idx, arr) => {
                        if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, idx) =>
                        p === '...' ? (
                          <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-[#94a3b8] text-xs">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setCurrentPage(p as number)}
                            className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-semibold transition-colors ${
                              currentPage === p
                                ? 'bg-[#0f172a] text-white shadow-sm'
                                : 'bg-white border border-[#e2e8f0] text-[#475569] hover:border-[#2563eb]'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-[#e2e8f0] text-[#475569] hover:border-[#2563eb] hover:text-[#0f172a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#e2e8f0] flex items-center justify-around px-4 py-2.5 z-40">
        <button onClick={() => { setViewMode('find'); setFindTab('nearby'); }} className={`flex flex-col items-center gap-1 ${viewMode === 'find' ? 'text-[#2563eb]' : 'text-[#94a3b8]'}`}>
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] font-medium">Explore</span>
        </button>
        <button onClick={() => { setViewMode('find'); setFindTab('applications'); }} className={`flex flex-col items-center gap-1 ${findTab === 'applications' && viewMode === 'find' ? 'text-[#2563eb]' : 'text-[#94a3b8]'}`}>
          <Briefcase className="w-4 h-4" />
          <span className="text-[10px] font-medium">Applied</span>
        </button>
        <Link href="/dashboard/add-gig" className="flex flex-col items-center gap-1">
          <div className="w-9 h-9 bg-[#2563eb] text-white rounded-full flex items-center justify-center -mt-4 shadow-md">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-medium text-[#475569] mt-0.5">Post</span>
        </Link>
        <button onClick={() => setViewMode('provide')} className={`flex flex-col items-center gap-1 ${viewMode === 'provide' ? 'text-[#2563eb]' : 'text-[#94a3b8]'}`}>
          <UserIcon className="w-4 h-4" />
          <span className="text-[10px] font-medium">My Gigs</span>
        </button>
        <Link href="/dashboard/chats" className="flex flex-col items-center gap-1 text-[#94a3b8] hover:text-[#2563eb] transition-colors">
          <MessageCircle className="w-4 h-4" />
          <span className="text-[10px] font-medium">Chats</span>
        </Link>
      </div>
    </div>
  );
}
