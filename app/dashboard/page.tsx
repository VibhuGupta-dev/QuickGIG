"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, LogOut, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [gigs, setGigs] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/gigs")
        .then(res => res.json())
        .then(data => setGigs(data));
    }
  }, [status]);

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
          <h2 className="text-lg font-semibold text-gray-900">Nearby Gigs</h2>
          <Link href="/dashboard/add-gig" className="flex items-center text-sm font-medium bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
            <Plus className="w-4 h-4 mr-1" /> Post Gig
          </Link>
        </div>

        <div className="space-y-4">
          {gigs.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-2xl border border-gray-100 text-gray-500 shadow-sm">
              <p>No gigs available right now.</p>
              <p className="text-sm mt-1">Be the first to post a task!</p>
            </div>
          ) : (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            gigs.map((gig: any) => (
              <div key={gig._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col space-y-3 transition-shadow hover:shadow-md">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{gig.title}</h3>
                  <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md font-medium border border-gray-200 whitespace-nowrap ml-2">
                    {gig.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{gig.description}</p>
                <div className="flex justify-between items-end pt-3 border-t border-gray-50 mt-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Payment</span>
                    <span className="font-bold text-black text-lg">₹{gig.payment}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {new Date(gig.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
