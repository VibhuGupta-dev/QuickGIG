"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Briefcase, MapPin, AlertCircle, FileText, User as UserIcon } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'postHistory' | 'acceptHistory'>('postHistory');
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  const fetchPostHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gigs/me`);
      const data = await res.json();
      setGigs(Array.isArray(data) ? data : []);
    } catch {
      setGigs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAcceptHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/applications`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setGigs(data.map((app: any) => ({ ...app.gigId, applicationStatus: app.status, proposedPrice: app.proposedPrice })));
      } else {
        setGigs([]);
      }
    } catch {
      setGigs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      if (activeTab === 'postHistory') {
        fetchPostHistory();
      } else {
        fetchAcceptHistory();
      }
    }
  }, [status, activeTab]);

  const getStatusDisplay = (gig: any) => {
    // If it's the post history, we check if it's expired
    if (activeTab === 'postHistory') {
      const isExpired = new Date(gig.expiresAt) < new Date();
      if (isExpired && gig.status === 'Open') {
        return <span className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">Incomplete</span>;
      }
      return <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
        gig.status === 'Open'
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-slate-100 text-[#475569]'
      }`}>{gig.status}</span>;
    } else {
      // accept history
      return <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
        gig.applicationStatus === 'Accepted'
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-slate-100 text-[#475569]'
      }`}>{gig.applicationStatus || gig.status}</span>;
    }
  };

  if (status === "loading") return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans pb-24">
      {/* Header */}
      <header className="bg-white border-b border-[#e2e8f0] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#475569]" />
          </Link>
          <h1 className="font-semibold text-lg">My Profile</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Profile Info */}
        <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border border-[#e2e8f0]">
            <UserIcon className="w-8 h-8 text-[#94a3b8]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0f172a]">{session.user?.name}</h2>
            <p className="text-sm text-[#475569]">{session.user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#e2e8f0] pb-2">
          <button
            onClick={() => setActiveTab('postHistory')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'postHistory' ? 'bg-[#0f172a] text-white shadow-sm' : 'bg-slate-50 text-[#475569] border border-[#e2e8f0] hover:border-[#2563eb]'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Gig Post History
          </button>
          <button
            onClick={() => setActiveTab('acceptHistory')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'acceptHistory' ? 'bg-[#0f172a] text-white shadow-sm' : 'bg-slate-50 text-[#475569] border border-[#e2e8f0] hover:border-[#2563eb]'
            }`}
          >
            <FileText className="w-4 h-4" /> Gig Accept History
          </button>
        </div>

        {/* Gigs List */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-white rounded-2xl animate-pulse border border-[#e2e8f0]" />)}
            </div>
          ) : gigs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-dashed border-[#e2e8f0]">
              <AlertCircle className="w-6 h-6 text-[#94a3b8] mb-3" />
              <h3 className="text-base font-semibold text-[#0f172a] mb-1">No history found</h3>
              <p className="text-[#475569] text-xs max-w-xs">
                {activeTab === 'postHistory' ? "You haven't posted any gigs yet." : "You haven't accepted or applied to any gigs yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gigs.map((gig: any) => (
                <Link
                  href={`/dashboard/gig/${gig._id || gig.id}`}
                  key={gig._id || Math.random()}
                  className="flex flex-col bg-white rounded-2xl border border-[#e2e8f0] hover:border-[#2563eb] hover:shadow-md transition-all p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-slate-100 text-[#475569] text-[10px] px-2 py-0.5 rounded-md font-medium">
                      {gig.category}
                    </span>
                    {getStatusDisplay(gig)}
                  </div>
                  <h3 className="font-semibold text-[#0f172a] text-sm mb-1">{gig.title}</h3>
                  {gig.address && (
                    <div className="flex items-center gap-1 text-[10px] text-[#94a3b8] mb-2">
                      <MapPin className="w-2.5 h-2.5 shrink-0 text-[#2563eb]" />
                      <span className="truncate">{gig.address}</span>
                    </div>
                  )}
                  <p className="text-xs text-[#475569] line-clamp-2 mb-3 flex-1">{gig.description}</p>
                  <div className="mt-auto font-bold text-[#2563eb]">
                    ₹{gig.payment}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
