"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Plus, LogOut, Briefcase, Search, X, MapPin, Sparkles, AlertCircle,
  Heart, MessageCircle, User as UserIcon, Bell, Zap, ChevronDown, Settings,
  ChevronLeft, ChevronRight
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

  const handleLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationQuery.trim()) return;
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationQuery)}&format=json`);
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

  if (status === "loading") return <div className="min-h-screen bg-black flex justify-center items-center text-gray-400 font-bold">Loading...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-black font-medium">

      {/* ─── LOCATION MODAL ─── */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Set Your Location</h3>
              <button onClick={() => setShowLocationModal(false)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleLocationSearch} className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Enter city, area..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm placeholder:text-gray-600 outline-none focus:border-gray-500"
                  value={locationQuery}
                  onChange={e => setLocationQuery(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isGeocoding || !locationQuery.trim()}
                className="bg-white text-black px-4 rounded-xl text-sm font-bold hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 transition-colors"
              >
                {isGeocoding ? "..." : "Search"}
              </button>
            </form>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <div className="h-px bg-gray-800 flex-1" /><span>OR</span><div className="h-px bg-gray-800 flex-1" />
            </div>
            <button
              onClick={handleDetectLocation}
              disabled={isGeocoding}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <MapPin className="w-4 h-4" /> {isGeocoding ? "Detecting..." : "Use GPS Location"}
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          NAVBAR
      ───────────────────────────────────────────── */}
      <header className="bg-black border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">

          {/* 1. Logo */}
          <Link href="/dashboard" className="flex items-center gap-1.5 shrink-0 mr-2">
            <Zap className="w-5 h-5 text-white fill-white" />
            <span className="font-black text-lg text-white tracking-tight">QuickGig</span>
          </Link>

          {/* 2. Location Pill */}
          <button
            onClick={() => setShowLocationModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-gray-900 border border-gray-700 hover:border-gray-500 transition-colors group shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
            <span className="text-xs font-semibold text-gray-300 max-w-[100px] truncate">
              {addressName || "Set Location"}
            </span>
            <ChevronDown className="w-3 h-3 text-gray-600" />
          </button>

          {/* 3. Search Bar — grows to fill space */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              placeholder="Search gigs..."
              className="w-full pl-9 pr-4 py-2 rounded-full bg-gray-900 border border-gray-700 text-white text-sm placeholder:text-gray-600 outline-none focus:border-gray-500 transition-colors"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 4. Wishlist */}
          <button
            onClick={() => { setViewMode('find'); setFindTab('applications'); }}
            className="relative p-2 rounded-full hover:bg-gray-900 transition-colors group shrink-0"
            title="Wishlist"
          >
            <Heart className={`w-5 h-5 transition-colors ${wishlistIds.length > 0 ? 'text-red-400 fill-red-400' : 'text-gray-400 group-hover:text-white'}`} />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {wishlistIds.length}
              </span>
            )}
          </button>

          {/* 5. Chats */}
          <Link
            href="/dashboard/gig"
            className="relative p-2 rounded-full hover:bg-gray-900 transition-colors group shrink-0"
            title="Chats"
          >
            <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </Link>

          {/* 6. Profile Dropdown */}
          <div className="relative shrink-0" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(v => !v)}
              className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-gray-900 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center">
                <span className="text-xs font-black text-white">
                  {session.user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-500 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-12 w-52 bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-800">
                  <p className="text-sm font-bold text-white">{session.user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                </div>
                <div className="p-2 space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors font-semibold text-left">
                    <UserIcon className="w-4 h-4" /> Profile
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors font-semibold text-left">
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <div className="h-px bg-gray-800 my-1" />
                  <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-950 transition-colors font-semibold text-left"
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
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> Gig
          </Link>

          {/* 8. Notifications Bell */}
          <button
            className="relative p-2 rounded-full hover:bg-gray-900 transition-colors group shrink-0"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            {/* Notification dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-black"></span>
          </button>

        </div>

        {/* ── Mobile Location Bar ── */}
        <div className="sm:hidden px-4 pb-3 flex gap-2">
          <button
            onClick={() => setShowLocationModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 border border-gray-700 text-xs font-semibold text-gray-300"
          >
            <MapPin className="w-3 h-3 text-gray-500" />
            {addressName || "Set Location"}
            <ChevronDown className="w-3 h-3 text-gray-600" />
          </button>
          <Link
            href="/dashboard/add-gig"
            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold"
          >
            <Plus className="w-3 h-3" /> Gig
          </Link>
        </div>
      </header>

      {/* ─── CATEGORY TABS ─── */}
      <div className="bg-black border-b border-gray-800 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto hide-scrollbar">
          {/* View mode tabs */}
          <button
            onClick={() => { setViewMode('find'); setFindTab('nearby'); }}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${viewMode === 'find' && findTab === 'nearby' ? 'bg-white text-black' : 'bg-gray-900 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-500'}`}
          >
            📍 Nearby
          </button>
          <button
            onClick={() => { setViewMode('find'); setFindTab('all'); }}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${viewMode === 'find' && findTab === 'all' ? 'bg-white text-black' : 'bg-gray-900 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-500'}`}
          >
            🌐 All Gigs
          </button>
          <button
            onClick={() => { setViewMode('find'); setFindTab('applications'); }}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${viewMode === 'find' && findTab === 'applications' ? 'bg-white text-black' : 'bg-gray-900 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-500'}`}
          >
            📋 Applications
          </button>
          <button
            onClick={() => setViewMode('provide')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${viewMode === 'provide' ? 'bg-white text-black' : 'bg-gray-900 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-500'}`}
          >
            ✍️ My Gigs
          </button>

          {/* Divider */}
          <div className="w-px bg-gray-800 shrink-0 mx-1" />

          {/* Category pills — only in find mode */}
          {(viewMode === 'find' && (findTab === 'nearby' || findTab === 'all')) && CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${selectedCategory === cat ? 'bg-white text-black' : 'bg-gray-900 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-500'}`}
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
          <h1 className="text-2xl font-black text-white tracking-tight">
            Hi, {session.user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {viewMode === 'find' ? "Find work near you" : "Manage your posted gigs"}
          </p>
        </div>

        {/* List Header */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-black text-white">
              {viewMode === 'find' && findTab === 'nearby' && '📍 Available Nearby'}
              {viewMode === 'find' && findTab === 'all' && '🌐 All Open Gigs'}
              {viewMode === 'find' && findTab === 'applications' && '📋 Your Applications'}
              {viewMode === 'provide' && '✍️ Your Posted Gigs'}
            </h2>
            {gigs.length > 0 && (
              <span className="text-xs font-semibold text-gray-500 bg-gray-900 px-2.5 py-0.5 rounded-full border border-gray-700">
                {gigs.length} total
              </span>
            )}
          </div>
          {viewMode === 'provide' && (
            <Link href="/dashboard/add-gig" className="flex items-center text-xs font-bold bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">
              <Plus className="w-3.5 h-3.5 mr-1" /> Post Gig
            </Link>
          )}
        </div>

        {/* Gigs Grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-52 bg-gray-900 rounded-2xl animate-pulse border border-gray-800" />
              ))}
            </div>
          ) : gigs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-950 rounded-[2rem] border border-dashed border-gray-800">
              <div className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-7 h-7 text-gray-600" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">No gigs found</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                {viewMode === 'provide'
                  ? "You haven't posted any gigs yet."
                  : "No gigs match your criteria. Try changing location or category."}
              </p>
              {viewMode === 'provide' && (
                <Link href="/dashboard/add-gig" className="mt-5 flex items-center text-sm font-bold bg-white text-black px-5 py-2.5 rounded-full hover:bg-gray-200 transition-colors">
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
                    className="flex flex-col bg-gray-950 rounded-2xl border border-gray-800 hover:border-gray-600 hover:bg-gray-900 transition-all group overflow-hidden"
                  >
                    {/* ── Card Image ── */}
                    <div className="relative h-32 bg-gray-900 overflow-hidden">
                      {gig.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={gig.image}
                          alt={gig.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        /* Dummy SVG placeholder — category themed */
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                          <svg viewBox="0 0 120 80" className="w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
                            <rect width="120" height="80" fill="#111827"/>
                            {/* Sky gradient */}
                            <rect width="120" height="50" fill="url(#sky)"/>
                            <defs>
                              <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#1e293b"/>
                                <stop offset="100%" stopColor="#0f172a"/>
                              </linearGradient>
                            </defs>
                            {/* Ground */}
                            <rect y="55" width="120" height="25" fill="#1f2937"/>
                            {/* Building shapes */}
                            <rect x="10" y="30" width="18" height="30" rx="1" fill="#374151"/>
                            <rect x="14" y="34" width="4" height="5" fill="#4b5563"/>
                            <rect x="20" y="34" width="4" height="5" fill="#4b5563"/>
                            <rect x="14" y="42" width="4" height="5" fill="#4b5563"/>
                            <rect x="20" y="42" width="4" height="5" fill="#4b5563"/>
                            <rect x="35" y="20" width="22" height="40" rx="1" fill="#374151"/>
                            <rect x="39" y="24" width="5" height="6" fill="#4b5563"/>
                            <rect x="47" y="24" width="5" height="6" fill="#6b7280"/>
                            <rect x="39" y="34" width="5" height="6" fill="#4b5563"/>
                            <rect x="47" y="34" width="5" height="6" fill="#4b5563"/>
                            <rect x="39" y="44" width="5" height="6" fill="#6b7280"/>
                            <rect x="47" y="44" width="5" height="6" fill="#4b5563"/>
                            <rect x="65" y="35" width="16" height="25" rx="1" fill="#374151"/>
                            <rect x="68" y="38" width="4" height="5" fill="#4b5563"/>
                            <rect x="74" y="38" width="4" height="5" fill="#6b7280"/>
                            <rect x="68" y="46" width="4" height="5" fill="#4b5563"/>
                            <rect x="74" y="46" width="4" height="5" fill="#4b5563"/>
                            <rect x="90" y="28" width="20" height="32" rx="1" fill="#374151"/>
                            <rect x="94" y="32" width="5" height="6" fill="#6b7280"/>
                            <rect x="101" y="32" width="5" height="6" fill="#4b5563"/>
                            <rect x="94" y="42" width="5" height="6" fill="#4b5563"/>
                            <rect x="101" y="42" width="5" height="6" fill="#6b7280"/>
                            {/* Moon */}
                            <circle cx="100" cy="12" r="6" fill="#1e293b"/>
                            <circle cx="103" cy="10" r="5" fill="#0f172a"/>
                            {/* Stars */}
                            <circle cx="20" cy="8" r="0.8" fill="#6b7280"/>
                            <circle cx="50" cy="5" r="0.8" fill="#6b7280"/>
                            <circle cx="70" cy="10" r="0.8" fill="#6b7280"/>
                            <circle cx="30" cy="15" r="0.8" fill="#4b5563"/>
                            {/* Category label */}
                            <rect x="5" y="62" width="40" height="12" rx="3" fill="#374151"/>
                            <text x="25" y="71" textAnchor="middle" fontSize="5" fill="#9ca3af" fontFamily="sans-serif" fontWeight="bold">
                              {gig.category?.toUpperCase()}
                            </text>
                          </svg>
                        </div>
                      )}
                      {/* Negotiable badge on image */}
                      {gig.isNegotiable && (
                        <span className="absolute top-2 left-2 bg-black/70 text-gray-300 text-[9px] px-1.5 py-0.5 rounded font-bold backdrop-blur-sm">
                          Negotiable
                        </span>
                      )}
                    </div>
                    {/* Card Top */}
                    <div className="flex items-center justify-between px-3 pt-3 pb-1">
                      <span className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded font-bold tracking-wide truncate max-w-[80px]">
                        {gig.category}
                      </span>
                      <button
                        onClick={(e) => toggleWishlist(gig._id, e)}
                        className="p-1 rounded-full hover:bg-gray-800 transition-colors shrink-0"
                      >
                        <Heart className={`w-3.5 h-3.5 transition-colors ${wishlistIds.includes(gig._id) ? 'text-red-400 fill-red-400' : 'text-gray-600 hover:text-red-400'}`} />
                      </button>
                    </div>

                    {/* Card Body */}
                    <div className="px-3 pb-2 flex-1 flex flex-col gap-1.5">
                      <h3 className="font-black text-white text-sm leading-snug group-hover:text-gray-300 transition-colors line-clamp-2">
                        {gig.title}
                      </h3>
                      {gig.address && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-600 font-semibold">
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{gig.address}</span>
                        </div>
                      )}
                      <p className="text-[11px] text-gray-500 line-clamp-3 leading-relaxed flex-1">
                        {gig.description}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="px-3 pb-3 pt-2 border-t border-gray-800 flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-base font-black text-white">₹{gig.payment}</span>
                        {gig.isNegotiable && (
                          <p className="text-[9px] text-gray-600 font-bold">Negotiable</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {gig.applicationStatus ? (
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            gig.applicationStatus === 'Accepted'
                              ? 'bg-green-950 text-green-400 border border-green-800'
                              : 'bg-gray-800 text-gray-500'
                          }`}>
                            {gig.applicationStatus}
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            gig.status === 'Open'
                              ? 'bg-green-950 text-green-400 border border-green-800'
                              : 'bg-gray-800 text-gray-500'
                          }`}>
                            {gig.status}
                          </span>
                        )}
                        {viewMode === 'find' && (findTab === 'nearby' || findTab === 'all') && gig.postedBy?.name && (
                          <span className="text-[9px] font-semibold text-gray-700 truncate max-w-[60px]">
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
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <p className="text-xs text-gray-500 font-semibold">
                    Showing{' '}
                    <span className="text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, gigs.length)}</span>
                    {' '}of{' '}
                    <span className="text-white">{gigs.length}</span> gigs
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-900 border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                          <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-600 text-sm">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setCurrentPage(p as number)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                              currentPage === p
                                ? 'bg-white text-black'
                                : 'bg-gray-900 border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-900 border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex items-center justify-around px-4 py-3 z-40">
        <button onClick={() => { setViewMode('find'); setFindTab('nearby'); }} className={`flex flex-col items-center gap-1 ${viewMode === 'find' ? 'text-white' : 'text-gray-600'}`}>
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-bold">Explore</span>
        </button>
        <button onClick={() => { setViewMode('find'); setFindTab('applications'); }} className={`flex flex-col items-center gap-1 ${findTab === 'applications' && viewMode === 'find' ? 'text-white' : 'text-gray-600'}`}>
          <Briefcase className="w-5 h-5" />
          <span className="text-[10px] font-bold">Applied</span>
        </button>
        <Link href="/dashboard/add-gig" className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center -mt-5 shadow-xl">
            <Plus className="w-5 h-5 text-black" />
          </div>
          <span className="text-[10px] font-bold text-gray-600 mt-0.5">Post</span>
        </Link>
        <button onClick={() => setViewMode('provide')} className={`flex flex-col items-center gap-1 ${viewMode === 'provide' ? 'text-white' : 'text-gray-600'}`}>
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold">My Gigs</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-600 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 right-0 w-2 h-2 bg-red-500 rounded-full border border-black" />
          <span className="text-[10px] font-bold">Alerts</span>
        </button>
      </div>
    </div>
  );
}
