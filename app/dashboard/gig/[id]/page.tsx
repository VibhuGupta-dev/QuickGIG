"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Send, Check, CheckCheck } from "lucide-react";

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
    if (res.ok) fetchGig();
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
    const receiverId = isPoster ? gig.application.workerId._id : gig.postedBy._id;

    const content = newMessage;
    setNewMessage("");

    await fetch(`/api/chat/${params.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, receiverId }),
    });
    fetchMessages();
  };

  if (loading || status === "loading") return <div className="p-8 text-center text-gray-400 bg-black min-h-screen">Loading...</div>;
  if (!gig) return <div className="p-8 text-center text-gray-400 bg-black min-h-screen">Gig not found.</div>;

  // @ts-expect-error session.user lacks id
  const isPoster = session?.user?.id === (gig.postedBy?._id || gig.postedBy);

  return (
    <div className="min-h-screen bg-black font-medium pb-20">
      <header className="bg-black/80 backdrop-blur-md border-b border-gray-800 p-4 sticky top-0 z-50 flex items-center">
        <Link href="/dashboard" className="text-gray-500 hover:text-white mr-4 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-white">Gig Details</h1>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6 pt-6">
        <div className="bg-gray-950 p-6 rounded-3xl border border-gray-800 space-y-4">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-white">{gig.title}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              gig.status === 'Open' ? 'bg-green-950 text-green-400 border border-green-800' :
              gig.status === 'Accepted' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
              gig.status === 'Completed' ? 'bg-gray-800 text-gray-400' : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
            }`}>
              {gig.status}
            </span>
          </div>

          <div className="flex gap-4 text-sm text-gray-500">
            <span className="bg-gray-800 px-3 py-1 rounded-lg font-semibold text-gray-400">{gig.category}</span>
            <span className="flex items-center text-gray-600"><Clock className="w-4 h-4 mr-1"/> {new Date(gig.createdAt).toLocaleDateString()}</span>
          </div>

          <p className="text-gray-400 leading-relaxed py-2">{gig.description}</p>

          <div className="flex justify-between items-center border-t border-gray-800 pt-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">Payment</p>
              <p className="text-2xl font-bold text-white">₹{gig.payment}</p>
            </div>
            {gig.postedBy?.name && (
              <div className="text-right">
                <p className="text-sm text-gray-600 font-semibold uppercase">Posted By</p>
                <p className="font-bold text-gray-300">{gig.postedBy.name}</p>
              </div>
            )}
          </div>
          {gig.application && (
             <div className="bg-gray-900 p-3 rounded-xl border border-gray-700 text-sm flex justify-between items-center">
                <div>
                  <span className="font-bold text-gray-400">Assigned Worker: </span>
                  <span className="text-white">{gig.application.workerId.name}</span>
                </div>
                {gig.application.proposedPrice && (
                  <span className="text-gray-400 font-bold">Proposed: ₹{gig.application.proposedPrice}</span>
                )}
             </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-gray-950 p-6 rounded-3xl border border-gray-800 space-y-4">
          <h3 className="text-lg font-bold text-white">Actions</h3>
          
          {!isPoster && gig.status === 'Open' && (
            <div className="space-y-3">
              {gig.isNegotiable && (
                <div>
                  <label className="block text-sm font-semibold text-white mb-1">Your Proposed Price (₹)</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2 px-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-white sm:text-sm outline-none"
                    placeholder={`e.g. ${gig.payment}`}
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                  />
                  <p className="text-xs text-gray-600 mt-1">Leave blank to accept original price.</p>
                </div>
              )}
              <button 
                onClick={handleAccept}
                disabled={actionLoading}
                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
              >
                {actionLoading ? "Processing..." : "Accept this Gig"}
              </button>
            </div>
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
              className="w-full bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-colors"
            >
              Mark as Completed
            </button>
          )}

          {gig.status === 'Completed' && (
            <div className="space-y-4 border-t border-gray-800 pt-4">
              <h4 className="font-bold text-white">Leave a Review</h4>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <button 
                    key={num} 
                    onClick={() => setReview({...review, rating: num})}
                    className={`w-10 h-10 rounded-full font-bold transition-colors ${review.rating === num ? 'bg-white text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <textarea 
                className="w-full border border-gray-700 bg-gray-900 text-white rounded-xl p-3 focus:ring-2 focus:ring-white outline-none placeholder:text-gray-600"
                placeholder="Write a comment..."
                value={review.comment}
                onChange={e => setReview({...review, comment: e.target.value})}
              />
              <button 
                onClick={handleSubmitReview}
                disabled={actionLoading}
                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Submit Review
              </button>
            </div>
          )}

          {isPoster && gig.status === 'Open' && (
            <p className="text-gray-600 text-sm text-center">Waiting for a worker to accept this gig...</p>
          )}
          {!isPoster && gig.status !== 'Open' && gig.status !== 'Completed' && (
            <p className="text-gray-600 text-sm text-center">Gig is currently {gig.status}. Waiting for poster to update.</p>
          )}
        </div>

        {/* Chat Section */}
        {gig.status !== 'Open' && (
          <div className="bg-gray-950 rounded-3xl border border-gray-800 overflow-hidden flex flex-col h-[400px]">
            <div className="bg-gray-900 border-b border-gray-800 p-4 text-white font-bold">
              Chat {isPoster ? `with ${gig.application?.workerId.name}` : `with ${gig.postedBy?.name}`}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black">
              {messages.length === 0 ? (
                <div className="text-center text-gray-600 text-sm mt-10">Say hi to start the conversation!</div>
              ) : (
                messages.map((msg) => {
                  // @ts-expect-error session.user lacks id
                  const isMine = msg.senderId === session?.user?.id;
                  return (
                    <div key={msg._id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMine ? 'bg-white text-black rounded-tr-sm' : 'bg-gray-900 border border-gray-700 text-white rounded-tl-sm'}`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] text-gray-600">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMine && (
                          msg.isRead ? <CheckCheck className="w-3 h-3 text-blue-400" /> : <Check className="w-3 h-3 text-gray-600" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 bg-gray-950 border-t border-gray-800 flex gap-2">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="flex-1 border border-gray-700 bg-gray-900 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:border-gray-500 placeholder:text-gray-600"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="bg-white text-black p-2 w-10 h-10 rounded-full flex items-center justify-center disabled:bg-gray-700 disabled:text-gray-500 hover:bg-gray-200 transition-colors"
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
