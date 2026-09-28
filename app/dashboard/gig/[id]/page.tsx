"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Send, Check, CheckCheck, MapPin, Star, AlertCircle, CheckCircle2 } from "lucide-react";

export default function GigDetail({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [gig, setGig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [proposedPrice, setProposedPrice] = useState("");

  // Chat state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const fetchGig = async () => {
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

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat/${params.id}`);
      const data = await res.json();
      setMessages(data);
      await fetch(`/api/chat/${params.id}/read`, { method: "PATCH" });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated") fetchGig();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, params.id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gig && gig.status !== 'Open') {
      fetchMessages();
      interval = setInterval(fetchMessages, 3000);
    }
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gig]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAccept = async () => {
    setActionLoading(true);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gigId: gig._id,
        proposedPrice: proposedPrice ? Number(proposedPrice) : undefined
      }),
    });
    if (res.ok) {
      alert("Gig Accepted!");
      fetchGig();
    } else {
      const err = await res.json();
      if (res.status === 403 && err.error.includes("verification required")) {
        alert("You need to verify your Student ID first. Redirecting to verification page...");
        router.push("/dashboard/verify");
      } else {
        alert(err.error || "Error accepting gig");
      }
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
    if (res.ok) {
      if (newStatus === 'Completed') {
        // Auto-trigger cleanup after marking completed
        fetch('/api/gigs/cleanup', { method: 'POST' }).catch(() => {});
        fetchGig();
      } else {
        fetchGig();
      }
    }
    setActionLoading(false);
  };

  const handleSubmitReview = async () => {
    setActionLoading(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gigId: gig._id,
        reviewedUserId: gig.postedBy._id || gig.postedBy,
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !gig.application) return;

    // @ts-expect-error session.user lacks id
    const isPoster = session?.user?.id === (gig.postedBy?._id || gig.postedBy);
    const receiverId = isPoster
      ? (gig.application.workerId?._id || gig.application.workerId)
      : (gig.postedBy?._id || gig.postedBy);

    const content = newMessage;
    setNewMessage("");

    await fetch(`/api/chat/${params.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, receiverId }),
    });
    fetchMessages();
  };

  if (loading || status === "loading") return (
    <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center">
      <div className="text-[#8f8d86] text-sm">Loading gig details...</div>
    </div>
  );
  if (!gig) return (
    <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center">
      <div className="text-[#8f8d86] text-sm">Gig not found.</div>
    </div>
  );

  // @ts-expect-error session.user lacks id
  const isPoster = session?.user?.id === (gig.postedBy?._id || gig.postedBy);

  const statusColors: Record<string, string> = {
    Open: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Accepted: "bg-blue-50 text-blue-700 border border-blue-200",
    "In-Progress": "bg-amber-50 text-amber-700 border border-amber-200",
    Completed: "bg-slate-100 text-[#475569] border border-[#e2e8f0]",
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] pb-20 selection:bg-[#2563eb] selection:text-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#e2e8f0] px-4 py-3 sticky top-0 z-50 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-[#94a3b8] hover:text-[#0f172a] transition-colors p-1.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-semibold text-[#0f172a]">Gig Details</h1>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-4 pt-6">

        {/* Gig Info Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 space-y-4 shadow-sm">
          {gig.image && (
            <div className="w-full h-56 md:h-72 rounded-xl overflow-hidden bg-slate-50 border border-[#e2e8f0]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gig.image}
                alt={gig.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex justify-between items-start gap-3">
            <h2 className="text-xl font-bold text-[#0f172a] leading-snug">{gig.title}</h2>
            <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[gig.status] || statusColors["Completed"]}`}>
              {gig.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <span className="bg-slate-100 text-[#475569] px-3 py-1 rounded-full text-xs font-medium">
              {gig.category}
            </span>
            <span className="flex items-center gap-1 text-[#94a3b8] text-xs">
              <Clock className="w-3.5 h-3.5" />
              {new Date(gig.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            {(gig.address || (gig.location?.coordinates && `${gig.location.coordinates[1]?.toFixed(4)}, ${gig.location.coordinates[0]?.toFixed(4)}`)) && (
              <span className="flex items-center gap-1 text-[#94a3b8] text-xs">
                <MapPin className="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
                <span>{gig.address || `${gig.location.coordinates[1]?.toFixed(4)}, ${gig.location.coordinates[0]?.toFixed(4)}`}</span>
              </span>
            )}
          </div>

          <p className="text-[#475569] text-sm leading-relaxed">{gig.description}</p>

          {/* Deadline row */}
          {gig.expiresAt && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-[#e2e8f0]">
                <Clock className="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
                <span className="text-xs text-[#475569] font-medium">Deadline:</span>
                <span className="text-xs text-[#0f172a] font-semibold">
                  {new Date(gig.expiresAt).toLocaleString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit"
                  })}
                </span>
              </div>
              {new Date(gig.expiresAt) < new Date() && gig.status !== 'Completed' && (
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Deadline passed
                </span>
              )}
            </div>
          )}

          <div className="flex justify-between items-center border-t border-[#e2e8f0] pt-4">
            <div>
              <p className="text-xs text-[#94a3b8] font-medium uppercase tracking-wide mb-0.5">Payment</p>
              <p className="text-2xl font-bold text-[#2563eb]">₹{gig.payment}</p>
              {gig.isNegotiable && (
                <p className="text-xs text-[#94a3b8] mt-0.5">Negotiable</p>
              )}
            </div>
            {gig.postedBy?.name && (
              <div className="text-right">
                <p className="text-xs text-[#94a3b8] font-medium uppercase tracking-wide mb-0.5">Posted by</p>
                <p className="font-semibold text-[#0f172a] text-sm">{gig.postedBy.name}</p>
              </div>
            )}
          </div>

          {gig.application && (
            <div className="bg-slate-50 px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm flex justify-between items-center">
              <div>
                <span className="text-[#94a3b8] text-xs font-medium uppercase tracking-wide">Assigned to</span>
                <p className="font-semibold text-[#0f172a] mt-0.5">{gig.application.workerId.name}</p>
              </div>
              {gig.application.proposedPrice && (
                <div className="text-right">
                  <span className="text-[#94a3b8] text-xs font-medium uppercase tracking-wide">Proposed</span>
                  <p className="font-bold text-[#2563eb] mt-0.5">₹{gig.application.proposedPrice}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-semibold text-[#0f172a] uppercase tracking-wide">Actions</h3>

          {!isPoster && gig.status === 'Open' && (
            <div className="space-y-3">
              {gig.isNegotiable && (
                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-1.5">
                    Your Proposed Price (₹)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-[#e2e8f0] bg-slate-50 py-2.5 px-3 text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] text-sm transition-colors"
                    placeholder={`e.g. ${gig.payment}`}
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                  />
                  <p className="text-xs text-[#94a3b8] mt-1">Leave blank to accept the original price.</p>
                </div>
              )}
              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className="w-full bg-[#2563eb] text-white font-semibold py-3 rounded-xl hover:bg-[#1d4ed8] transition-colors disabled:opacity-60 text-sm shadow-sm"
              >
                {actionLoading ? "Processing..." : "Accept this Gig"}
              </button>
            </div>
          )}

          {isPoster && gig.status === 'Accepted' && (
            <button
              onClick={() => handleUpdateStatus('In-Progress')}
              disabled={actionLoading}
              className="w-full bg-[#0f172a] text-white font-semibold py-3 rounded-xl hover:bg-[#1e293b] transition-colors disabled:opacity-60 text-sm shadow-sm"
            >
              {actionLoading ? "Updating..." : "Mark as In-Progress"}
            </button>
          )}

          {isPoster && gig.status === 'In-Progress' && (
            <button
              onClick={() => handleUpdateStatus('Completed')}
              disabled={actionLoading}
              className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60 text-sm shadow-sm flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {actionLoading ? "Updating..." : "Mark as Completed"}
            </button>
          )}

          {gig.status === 'Completed' && (
            <div className="space-y-4 border-t border-[#e2e8f0] pt-4">
              <h4 className="font-semibold text-[#0f172a] text-sm">Leave a Review</h4>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => setReview({...review, rating: num})}
                    className={`w-10 h-10 rounded-full text-sm font-semibold transition-colors flex items-center justify-center ${
                      review.rating >= num
                        ? 'bg-[#2563eb] text-white'
                        : 'bg-slate-100 text-[#94a3b8] hover:bg-slate-200'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${review.rating >= num ? 'fill-white' : ''}`} />
                  </button>
                ))}
              </div>
              <textarea
                className="w-full border border-[#e2e8f0] bg-slate-50 text-[#0f172a] rounded-xl p-3 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] placeholder:text-[#94a3b8] text-sm transition-colors resize-none"
                placeholder="Share your experience..."
                rows={3}
                value={review.comment}
                onChange={e => setReview({...review, comment: e.target.value})}
              />
              <button
                onClick={handleSubmitReview}
                disabled={actionLoading}
                className="w-full bg-[#2563eb] text-white font-semibold py-3 rounded-xl hover:bg-[#1d4ed8] transition-colors disabled:opacity-60 text-sm shadow-sm"
              >
                {actionLoading ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          )}

          {isPoster && gig.status === 'Open' && (
            <p className="text-[#94a3b8] text-sm text-center py-2">
              Waiting for a worker to accept this gig...
            </p>
          )}
          {!isPoster && gig.status !== 'Open' && gig.status !== 'Completed' && (
            <p className="text-[#94a3b8] text-sm text-center py-2">
              Gig is currently <span className="font-medium text-[#475569]">{gig.status}</span>. Waiting for the poster to update.
            </p>
          )}
        </div>

        {/* Chat Section */}
        {gig.status !== 'Open' && (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden flex flex-col h-[420px] shadow-sm">
            {/* Chat Header */}
            <div className="bg-slate-50 border-b border-[#e2e8f0] px-5 py-3">
              <p className="font-semibold text-[#0f172a] text-sm">
                Chat {isPoster ? `with ${gig.application?.workerId.name}` : `with ${gig.postedBy?.name}`}
              </p>
              <p className="text-xs text-[#94a3b8] mt-0.5">Messages are refreshed every few seconds</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3 text-[#2563eb]">
                    <Send className="w-4 h-4" />
                  </div>
                  <p className="text-[#94a3b8] text-sm">No messages yet.</p>
                  <p className="text-[#94a3b8] text-xs mt-1">Say hi to start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  // @ts-expect-error session.user lacks id
                  const isMine = msg.senderId === session?.user?.id;
                  return (
                    <div key={msg._id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                        isMine
                          ? 'bg-[#2563eb] text-white rounded-tr-sm'
                          : 'bg-white border border-[#e2e8f0] text-[#0f172a] rounded-tl-sm shadow-xs'
                      }`}>
                        <p>{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] text-[#94a3b8]">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMine && (
                          msg.isRead
                            ? <CheckCheck className="w-3 h-3 text-[#2563eb]" />
                            : <Check className="w-3 h-3 text-[#94a3b8]" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#e2e8f0] flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 border border-[#e2e8f0] bg-slate-50 text-[#0f172a] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] placeholder:text-[#94a3b8] transition-colors"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-[#2563eb] text-white p-2 w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-40 hover:bg-[#1d4ed8] transition-colors shrink-0 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
