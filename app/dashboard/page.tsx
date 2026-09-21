"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, LogOut, LayoutDashboard, Briefcase, Search, Menu, X, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session, status } = useSession();
  
  // Two main areas: 'find' (Find Work) and 'provide' (Post Work)
  const [viewMode, setViewMode] = useState<'find' | 'provide'>('find');
  
  // Sub-tabs for 'find' view
  const [findTab, setFindTab] = useState<'nearby' | 'applications' | 'all'>('nearby');
  
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{lng: number, lat: number} | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  const fetchNearby = () => {
    if (!location) return;
    setLoading(true);
    fetch(`/api/gigs/nearby?lng=${location.lng}&lat=${location.lat}&radius=10`)
      .then(res => res.json())
      .then(data => {
        setGigs(data);
        setLoading(false);
      });
  };

  const fetchAllGigs = () => {
    setLoading(true);
    fetch(`/api/gigs/all`)
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
        // applications have gigId populated
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
                (pos) => setLocation({ lng: pos.coords.longitude, lat: pos.coords.latitude }),
                () => alert("Location is required to find nearby gigs")
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
  }, [status, viewMode, findTab, location]);

  if (status === "loading") return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 font-medium relative">
      {/* Sidebar Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" /> QuickGig
          </h2>
          <button onClick={() => setIsMenuOpen(false)} className="text-gray-500 hover:text-black p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">Find Work</div>
          <button 
            onClick={() => { setViewMode('find'); setFindTab('nearby'); setIsMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${viewMode === 'find' && findTab === 'nearby' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Search className="w-4 h-4" /> Nearby Gigs
          </button>
          <button 
            onClick={() => { setViewMode('find'); setFindTab('all'); setIsMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${viewMode === 'find' && findTab === 'all' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> All Gigs
          </button>
          <button 
            onClick={() => { setViewMode('find'); setFindTab('applications'); setIsMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${viewMode === 'find' && findTab === 'applications' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Briefcase className="w-4 h-4" /> My Applications
          </button>

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">Post Work</div>
          <button 
            onClick={() => { setViewMode('provide'); setIsMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${viewMode === 'provide' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Plus className="w-4 h-4" /> My Posted Gigs
          </button>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <button onClick={() => signOut()} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMenuOpen(true)} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-black">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-black hidden sm:block">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
          <UserIcon className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-bold text-gray-800">{session.user?.name || 'User'}</span>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center pt-2">
          <h2 className="text-xl font-bold text-gray-900">
            {viewMode === 'find' && findTab === 'nearby' && 'Nearby Gigs'}
            {viewMode === 'find' && findTab === 'all' && 'All Gigs'}
            {viewMode === 'find' && findTab === 'applications' && 'My Applications'}
            {viewMode === 'provide' && 'My Posted Gigs'}
          </h2>
          {viewMode === 'provide' && (
            <Link href="/dashboard/add-gig" className="flex items-center text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors shadow-sm">
              <Plus className="w-4 h-4 mr-1" /> Post New Gig
            </Link>
          )}
        </div>

        {/* Gigs List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center p-12 text-gray-500">Loading gigs...</div>
          ) : gigs.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-3xl border border-gray-100 text-gray-500 shadow-sm">
              <p>No gigs found here.</p>
              {viewMode === 'provide' && <p className="text-sm mt-2">Click "Post New Gig" to get started!</p>}
            </div>
          ) : (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            gigs.map((gig: any) => (
              <Link href={`/dashboard/gig/${gig._id}`} key={gig._id} className="block bg-white p-5 rounded-3xl border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{gig.title}</h3>
                  <div className="flex flex-col items-end gap-2">
                    <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md font-semibold border border-gray-200 whitespace-nowrap">
                      {gig.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-md font-semibold ${gig.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {gig.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">{gig.description}</p>
                
                <div className="flex justify-between items-end pt-4 mt-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Pay</span>
                    <span className="font-bold text-black text-lg">₹{gig.payment}</span>
                    {gig.isNegotiable && <span className="text-xs text-blue-500 font-semibold mt-0.5">Negotiable</span>}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center text-xs text-gray-400 font-semibold gap-2">
                      {viewMode === 'find' && (findTab === 'nearby' || findTab === 'all') && gig.postedBy?.name && (
                        <span>By {gig.postedBy.name}</span>
                      )}
                      <span>{new Date(gig.createdAt).toLocaleDateString()}</span>
                    </div>
                    {gig.applicationStatus && (
                      <div className="flex items-center gap-2 mt-1">
                        {gig.proposedPrice && <span className="text-xs text-gray-500">Proposed: ₹{gig.proposedPrice}</span>}
                        <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs font-bold">App: {gig.applicationStatus}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        
        {/* Mobile floating action button for Provide mode */}
        {viewMode === 'provide' && (
          <Link href="/dashboard/add-gig" className="sm:hidden fixed bottom-6 right-6 flex items-center justify-center w-14 h-14 bg-black text-white rounded-full shadow-xl hover:bg-gray-800 transition-colors">
            <Plus className="w-6 h-6" />
          </Link>
        )}
      </main>
    </div>
  );
}
