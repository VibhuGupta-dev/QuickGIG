"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, LogOut, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'nearby' | 'posted' | 'applications'>('nearby');
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{lng: number, lat: number} | null>(null);
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
        setGigs(data.map((app: any) => ({ ...app.gigId, applicationStatus: app.status })));
        setLoading(false);
      });
  };

  useEffect(() => {
    if (status === "authenticated") {
      if (activeTab === 'nearby') {
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
      } else if (activeTab === 'posted') {
        fetchMyPosted();
      } else if (activeTab === 'applications') {
        fetchMyApplications();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, activeTab, location]);

  if (status === "loading") return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 font-medium">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-black" />
          <h1 className="text-xl font-bold text-black">Dashboard</h1>
        </div>
        <button onClick={() => signOut()} className="text-sm font-medium text-gray-500 hover:text-black flex items-center gap-1">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            <button 
              onClick={() => setActiveTab('nearby')}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${activeTab === 'nearby' ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              Nearby Gigs
            </button>
            <button 
              onClick={() => setActiveTab('posted')}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${activeTab === 'posted' ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              My Posts
            </button>
            <button 
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${activeTab === 'applications' ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              My Applications
            </button>
          </div>
          
          <Link href="/dashboard/add-gig" className="hidden sm:flex items-center text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors shadow-sm">
            <Plus className="w-4 h-4 mr-1" /> Post Gig
          </Link>
        </div>

        <div className="space-y-4 pt-4">
          {loading ? (
            <div className="text-center p-12 text-gray-500">Loading gigs...</div>
          ) : gigs.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-3xl border border-gray-100 text-gray-500 shadow-sm">
              <p>No gigs found here.</p>
              {activeTab === 'nearby' && <p className="text-sm mt-2">Try posting one yourself!</p>}
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
                  </div>
                  <div className="flex items-center text-xs text-gray-400 font-semibold gap-2">
                    {activeTab === 'nearby' && gig.postedBy?.name && (
                      <span>By {gig.postedBy.name}</span>
                    )}
                    {gig.applicationStatus && (
                      <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md">App Status: {gig.applicationStatus}</span>
                    )}
                    <span>{new Date(gig.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        
        {/* Mobile floating action button */}
        <Link href="/dashboard/add-gig" className="sm:hidden fixed bottom-6 right-6 flex items-center justify-center w-14 h-14 bg-black text-white rounded-full shadow-xl hover:bg-gray-800 transition-colors">
          <Plus className="w-6 h-6" />
        </Link>
      </main>
    </div>
  );
}
