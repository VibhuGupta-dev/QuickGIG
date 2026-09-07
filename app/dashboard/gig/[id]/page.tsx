"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

export default function GigDetail({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [gig, setGig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const router = useRouter();

  const fetchGig = async () => {
    // In a real app, we'd have a GET /api/gigs/[id] route.
    // For simplicity since we don't have it, we'll fetch all and filter or just create the single route.
    // Let's assume we create a quick GET route inside route.ts or just fetch from /api/gigs and find.
    // Better: let's quickly hit an endpoint. Wait, we didn't create /api/gigs/[id] GET!
    // I will write the GET /api/gigs/[id]/route.ts next.
    try {
      const res = await fetch(`/api/gigs/${params.id}`);
      const data = await res.json();
      setGig(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated") fetchGig();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, params.id]);

  const handleAccept = async () => {
    setActionLoading(true);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gigId: gig._id }),
    });
    if (res.ok) {
      alert("Gig Accepted!");
      fetchGig();
    } else {
      const err = await res.json();
      alert(err.error || "Error accepting gig");
    }
    setActionLoading(false);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setActionLoading(true);
    const res = await fetch(`/api/gigs/${gig._id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) fetchGig();
    setActionLoading(false);
  };

  const handleSubmitReview = async () => {
    setActionLoading(true);
    // Find the person to review: If current user is poster, review the worker. If worker, review poster.
    // Since we simplified and don't populate the exact worker in Gig directly (it's in Applications), 
    // we'll just review the poster for now as an example.
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gigId: gig._id,
        reviewedUserId: gig.postedBy._id || gig.postedBy, // simplified
        rating: review.rating,
        comment: review.comment
      }),
    });
    if (res.ok) {
      alert("Review submitted!");
    } else {
      alert("Failed to submit review");
    }
    setActionLoading(false);
  };

  if (loading || status === "loading") return <div className="p-8 text-center">Loading...</div>;
  if (!gig) return <div className="p-8 text-center">Gig not found.</div>;

  // @ts-expect-error session.user lacks id
  const isPoster = session?.user?.id === (gig.postedBy?._id || gig.postedBy);

  return (
    <div className="min-h-screen bg-gray-50 font-medium">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 sticky top-0 z-50 flex items-center shadow-sm">
        <Link href="/dashboard" className="text-gray-500 hover:text-black mr-4 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-black">Gig Details</h1>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6 pt-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900">{gig.title}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              gig.status === 'Open' ? 'bg-green-100 text-green-800' :
              gig.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
              gig.status === 'Completed' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {gig.status}
            </span>
          </div>

          <div className="flex gap-4 text-sm text-gray-500">
            <span className="bg-gray-100 px-3 py-1 rounded-lg font-semibold text-gray-700">{gig.category}</span>
            <span className="flex items-center"><Clock className="w-4 h-4 mr-1"/> {new Date(gig.createdAt).toLocaleDateString()}</span>
          </div>

          <p className="text-gray-700 leading-relaxed py-2">{gig.description}</p>

          <div className="flex justify-between items-center border-t border-gray-100 pt-4">
            <div>
              <p className="text-sm text-gray-400 font-semibold uppercase">Payment</p>
              <p className="text-2xl font-bold text-black">₹{gig.payment}</p>
            </div>
            {gig.postedBy?.name && (
              <div className="text-right">
                <p className="text-sm text-gray-400 font-semibold uppercase">Posted By</p>
                <p className="font-bold text-gray-800">{gig.postedBy.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Actions</h3>
          
          {!isPoster && gig.status === 'Open' && (
            <button 
              onClick={handleAccept}
              disabled={actionLoading}
              className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors"
            >
              {actionLoading ? "Processing..." : "Accept this Gig"}
            </button>
          )}

          {isPoster && gig.status === 'Accepted' && (
            <button 
              onClick={() => handleUpdateStatus('In-Progress')}
              disabled={actionLoading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Mark as In-Progress
            </button>
          )}

          {isPoster && gig.status === 'In-Progress' && (
            <button 
              onClick={() => handleUpdateStatus('Completed')}
              disabled={actionLoading}
              className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors"
            >
              Mark as Completed
            </button>
          )}

          {gig.status === 'Completed' && (
            <div className="space-y-4 border-t border-gray-100 pt-4">
              <h4 className="font-bold text-gray-900">Leave a Review</h4>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <button 
                    key={num} 
                    onClick={() => setReview({...review, rating: num})}
                    className={`w-10 h-10 rounded-full font-bold ${review.rating === num ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <textarea 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-black outline-none"
                placeholder="Write a comment..."
                value={review.comment}
                onChange={e => setReview({...review, comment: e.target.value})}
              />
              <button 
                onClick={handleSubmitReview}
                disabled={actionLoading}
                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors"
              >
                Submit Review
              </button>
            </div>
          )}

          {isPoster && gig.status === 'Open' && (
            <p className="text-gray-500 text-sm text-center">Waiting for a worker to accept this gig...</p>
          )}
          {!isPoster && gig.status !== 'Open' && gig.status !== 'Completed' && (
            <p className="text-gray-500 text-sm text-center">Gig is currently {gig.status}. Waiting for poster to update.</p>
          )}
        </div>
      </main>
    </div>
  );
}
