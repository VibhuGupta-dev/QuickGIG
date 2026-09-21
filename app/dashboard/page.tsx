"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, LogOut, LayoutDashboard, Briefcase, Search, Menu, X, User as UserIcon, MapPin, Sparkles, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["All", "Errand", "Cleaning", "Tutoring", "Moving Help", "Pet Care", "Handyman", "Other"];

export default function Dashboard() {
  const { data: session, status } = useSession();
  
  const [viewMode, setViewMode] = useState<'find' | 'provide'>('find');
  const [findTab, setFindTab] = useState<'nearby' | 'applications' | 'all'>('nearby');
  
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{lng: number, lat: number} | null>(null);
  const [addressName, setAddressName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  const fetchNearby = () => {
    if (!location) return;
    setLoading(true);
    let url = `/api/gigs/nearby?lng=${location.lng}&lat=${location.lat}&radius=10&q=${encodeURIComponent(searchQuery)}`;
    if (selectedCategory !== "All") url += `&category=${encodeURIComponent(selectedCategory)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setGigs(data);
        setLoading(false);
      });
  };

  const fetchAllGigs = () => {
    setLoading(true);
    let url = `/api/gigs/all?q=${encodeURIComponent(searchQuery)}`;
    if (selectedCategory !== "All") url += `&category=${encodeURIComponent(selectedCategory)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setGigs(data);
        setLoading(false);
      });
  };

  const fetchMyPosted = () => {
    setLoading(true);
    fetch(`/api/gigs/me`)
      .then(res => res.json())
      .then(data => {
        setGigs(data);
        setLoading(false);
      });
  };

  const fetchMyApplications = () => {
    setLoading(true);
    fetch(`/api/applications`)
      .then(res => res.json())
      .then(data => {
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
                    if (data && data.display_name) {
                      setAddressName(data.address.city || data.address.town || data.address.village || "Current Location");
                    }
                  } catch (e) {}
                },
                () => alert("Location is required to find nearby gigs. Or you can search for a custom location.")
              );
            }
          } else {
            fetchNearby();
          }
        } else if (findTab === 'all') {
          fetchAllGigs();
        } else if (findTab === 'applications') {
          fetchMyApplications();
        }
      } else if (viewMode === 'provide') {
        fetchMyPosted();
      }
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
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setLocation({ lat: Number(lat), lng: Number(lon) });
        setAddressName(display_name.split(',')[0]);
        setFindTab('nearby');
      } else {
        alert("Location not found.");
      }
    } catch (e) {
      alert("Error finding location.");
    }
    setIsGeocoding(false);
  };

  if (status === "loading") return <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center text-gray-500 font-bold">Loading...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 md:pb-8 font-medium relative">
      {/* Sidebar Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-2xl font-black text-black flex items-center gap-2 tracking-tight">
            <Sparkles className="w-6 h-6 text-blue-600" /> QuickGig
          </h2>
          <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-black p-2 rounded-full hover:bg-white shadow-sm transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 mt-4 px-2">Explore Work</div>
          <button 
            onClick={() => { setViewMode('find'); setFindTab('nearby'); setIsMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-semibold ${viewMode === 'find' && findTab === 'nearby' ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`}
          >
            <MapPin className="w-5 h-5" /> Nearby Gigs
          </button>
          <button 
            onClick={() => { setViewMode('find'); setFindTab('all'); setIsMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-semibold ${viewMode === 'find' && findTab === 'all' ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`}
          >
            <Search className="w-5 h-5" /> All Gigs
          </button>
          <button 
            onClick={() => { setViewMode('find'); setFindTab('applications'); setIsMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-semibold ${viewMode === 'find' && findTab === 'applications' ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`}
          >
            <Briefcase className="w-5 h-5" /> My Applications
          </button>

          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 mt-8 px-2">Offer Work</div>
          <button 
            onClick={() => { setViewMode('provide'); setIsMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-semibold ${viewMode === 'provide' ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`}
          >
            <Plus className="w-5 h-5" /> My Posted Gigs
          </button>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100 bg-gray-50/50">
          <button onClick={() => signOut()} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-colors shadow-sm">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-black">
              <Menu className="w-6 h-6" />
            </button>
            {/* Location Display in Header */}
            {viewMode === 'find' && (findTab === 'nearby' || findTab === 'all') && addressName && (
              <div className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1.5 rounded-full">
                <MapPin className="w-4 h-4 text-blue-600" />
                {addressName}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 rounded-full shadow-sm">
            <UserIcon className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-bold text-gray-900 pr-1">{session.user?.name?.split(' ')[0] || 'User'}</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-12 space-y-8">
        
        {/* Welcome Section */}
        <div className="pt-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Hi, {session.user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            {viewMode === 'find' ? "Ready to find some work today?" : "What do you need help with?"}
          </p>
        </div>

        {/* Search Tools for 'find' view */}
        {viewMode === 'find' && (findTab === 'nearby' || findTab === 'all') && (
          <div className="space-y-5">
            {/* Unified Search Box */}
            <div className="bg-white p-2 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border-none text-sm font-medium focus:ring-0 outline-none placeholder:text-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <form onSubmit={handleLocationSearch} className="relative flex-1 flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter city..."
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border-none text-sm font-medium focus:ring-0 outline-none placeholder:text-gray-400"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isGeocoding || !locationQuery.trim()}
                  className="bg-black text-white px-6 rounded-2xl text-sm font-bold hover:bg-gray-800 disabled:bg-gray-300 transition-all shadow-md"
                >
                  {isGeocoding ? "..." : "Go"}
                </button>
              </form>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar scroll-smooth">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat 
                      ? 'bg-black text-white shadow-md' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Header for list */}
        <div className="flex justify-between items-end pt-2 border-b border-gray-200 pb-4">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            {viewMode === 'find' && findTab === 'nearby' && 'Available Nearby'}
            {viewMode === 'find' && findTab === 'all' && 'All Open Gigs'}
            {viewMode === 'find' && findTab === 'applications' && 'Your Applications'}
            {viewMode === 'provide' && 'Your Posted Gigs'}
          </h2>
          {viewMode === 'provide' && (
            <Link href="/dashboard/add-gig" className="hidden sm:flex items-center text-sm font-bold bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
              <Plus className="w-4 h-4 mr-1.5" /> Post Gig
            </Link>
          )}
        </div>

        {/* Gigs List */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : gigs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-[2rem] border border-gray-100 shadow-sm border-dashed">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No gigs found</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                {viewMode === 'provide' 
                  ? "You haven't posted any gigs yet. Tap the button below to post your first gig!"
                  : "We couldn't find any gigs matching your criteria right now. Try changing your location or category."}
              </p>
              {viewMode === 'provide' && (
                <Link href="/dashboard/add-gig" className="mt-6 flex items-center text-sm font-bold bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-all shadow-md">
                  <Plus className="w-4 h-4 mr-2" /> Post a Gig Now
                </Link>
              )}
            </div>
          ) : (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            gigs.map((gig: any) => (
              <Link href={`/dashboard/gig/${gig._id}`} key={gig._id} className="block bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent opacity-50 rounded-bl-full pointer-events-none"></div>
                
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md font-bold tracking-wide">
                        {gig.category}
                      </span>
                      {gig.isNegotiable && (
                        <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                          Negotiable
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-gray-900 text-xl leading-tight group-hover:text-blue-600 transition-colors">{gig.title}</h3>
                  </div>
                  
                  <div className="text-right">
                    <span className="block text-2xl font-black text-black">₹{gig.payment}</span>
                  </div>
                </div>
                
                {gig.address && (
                  <p className="text-xs font-semibold text-gray-500 mt-3 flex items-center gap-1.5 bg-gray-50 inline-flex px-2 py-1 rounded-md">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> {gig.address}
                  </p>
                )}
                
                <p className="text-sm text-gray-600 mt-3 line-clamp-2 leading-relaxed font-medium">{gig.description}</p>
                
                <div className="flex justify-between items-end pt-5 mt-2 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    {viewMode === 'find' && (findTab === 'nearby' || findTab === 'all') && gig.postedBy?.name && (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-200 to-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                          {gig.postedBy.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-gray-500">{gig.postedBy.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5">
                    {gig.applicationStatus ? (
                      <div className="flex items-center gap-2">
                        {gig.proposedPrice && <span className="text-xs font-bold text-gray-400">Proposed: ₹{gig.proposedPrice}</span>}
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider ${
                          gig.applicationStatus === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'
                        }`}>
                          App: {gig.applicationStatus}
                        </span>
                      </div>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider ${gig.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {gig.status}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        
        {/* Mobile floating action button for Provide mode */}
        {viewMode === 'provide' && (
          <Link href="/dashboard/add-gig" className="sm:hidden fixed bottom-6 right-6 flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-colors hover:scale-105 transform active:scale-95">
            <Plus className="w-6 h-6" />
          </Link>
        )}
      </main>
    </div>
  );
}
