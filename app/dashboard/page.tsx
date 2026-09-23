"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Plus, LogOut, Briefcase, Search, X, MapPin, Sparkles, AlertCircle,
  Heart, MessageCircle, User as UserIcon, Bell, Zap, ChevronDown, Settings
} from "lucide-react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["All", "Errand", "Cleaning", "Tutoring", "Moving Help", "Pet Care", "Handyman", "Other"];

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

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

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
      <main className="max-w-3xl mx-auto px-4 pt-6 pb-24 space-y-6">

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
          <h2 className="text-base font-black text-white">
            {viewMode === 'find' && findTab === 'nearby' && '📍 Available Nearby'}
            {viewMode === 'find' && findTab === 'all' && '🌐 All Open Gigs'}
            {viewMode === 'find' && findTab === 'applications' && '📋 Your Applications'}
            {viewMode === 'provide' && '✍️ Your Posted Gigs'}
          </h2>
          {viewMode === 'provide' && (
            <Link href="/dashboard/add-gig" className="flex items-center text-xs font-bold bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">
              <Plus className="w-3.5 h-3.5 mr-1" /> Post Gig
            </Link>
          )}
        </div>

        {/* Gigs List */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-36 bg-gray-900 rounded-3xl animate-pulse border border-gray-800" />
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            gigs.map((gig: any) => (
              <Link
                href={`/dashboard/gig/${gig._id}`}
                key={gig._id}
                className="block bg-gray-950 p-5 rounded-[2rem] border border-gray-800 hover:border-gray-600 hover:bg-gray-900 transition-all group relative"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="bg-gray-800 text-gray-300 text-[11px] px-2.5 py-1 rounded-md font-bold tracking-wide">
                        {gig.category}
                      </span>
                      {gig.isNegotiable && (
                        <span className="bg-gray-800 text-gray-500 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider border border-gray-700">
                          Negotiable
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-white text-lg leading-tight group-hover:text-gray-300 transition-colors truncate">{gig.title}</h3>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-2xl font-black text-white">₹{gig.payment}</span>
                    {/* Wishlist heart on card */}
                    <button
                      onClick={(e) => toggleWishlist(gig._id, e)}
                      className="p-1.5 rounded-full hover:bg-gray-800 transition-colors"
                    >
                      <Heart className={`w-4 h-4 transition-colors ${wishlistIds.includes(gig._id) ? 'text-red-400 fill-red-400' : 'text-gray-600 hover:text-red-400'}`} />
                    </button>
                  </div>
                </div>

                {gig.address && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{gig.address}</span>
                  </div>
                )}

                <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">{gig.description}</p>

                <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-800">
                  <div>
                    {viewMode === 'find' && (findTab === 'nearby' || findTab === 'all') && gig.postedBy?.name && (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-[9px] font-bold text-gray-400">
                          {gig.postedBy.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-gray-600">{gig.postedBy.name}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    {gig.applicationStatus ? (
                      <div className="flex items-center gap-2">
                        {gig.proposedPrice && <span className="text-xs font-bold text-gray-600">₹{gig.proposedPrice}</span>}
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${gig.applicationStatus === 'Accepted' ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-gray-800 text-gray-500'}`}>
                          {gig.applicationStatus}
                        </span>
                      </div>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${gig.status === 'Open' ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-gray-800 text-gray-500'}`}>
                        {gig.status}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))
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
