"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Briefcase, MapPin, AlertCircle, FileText, User as UserIcon, Clock, ShieldAlert } from "lucide-react";

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = data
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((app: any) => app.gigId) // skip if gig deleted
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((app: any) => ({
            ...app.gigId,
            _id: app.gigId._id,
            applicationStatus: app.status,
            proposedPrice: app.proposedPrice,
            appliedAt: app.appliedAt,
          }));
        setGigs(mapped);
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
                {activeTab === 'postHistory'
                  ? "You haven't posted any gigs yet. Go to dashboard to post one."
                  : "You haven't accepted any gigs yet."}
              </p>
              {activeTab === 'acceptHistory' && (
                // @ts-expect-error isVerified is custom
                !session?.user?.isVerified && (
                  <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 max-w-xs text-left">
                    <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-700">Student verification required</p>
                      <p className="text-[11px] text-amber-600 mt-0.5">You must verify your Student ID to accept gigs.</p>
                      <Link href="/dashboard/verify" className="text-[11px] font-semibold text-amber-700 underline mt-1 inline-block">
                        Verify now →
                      </Link>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gigs.map((gig: any) => (
                <Link
                  href={`/dashboard/gig/${gig._id || gig.id}`}
                  key={gig._id ? gig._id.toString() : Math.random()}
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
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-[#2563eb]">₹{gig.payment}</span>
                      {gig.proposedPrice && gig.proposedPrice !== gig.payment && (
                        <span className="ml-1.5 text-[10px] text-[#94a3b8]">(Proposed: ₹{gig.proposedPrice})</span>
                      )}
                    </div>
                    {(gig.createdAt || gig.appliedAt) && (
                      <div className="flex items-center gap-1 text-[10px] text-[#94a3b8]">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>
                          {new Date(activeTab === 'acceptHistory' && gig.appliedAt ? gig.appliedAt : gig.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    )}
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
