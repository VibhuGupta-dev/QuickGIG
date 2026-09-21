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
      // Mark as read
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
      interval = setInterval(fetchMessages, 3000); // Poll every 3s
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
    setNewMessage(""); // optimistic clear

    await fetch(`/api/chat/${params.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, receiverId }),
    });
    fetchMessages(); // refresh instantly
  };

  if (loading || status === "loading") return <div className="p-8 text-center">Loading...</div>;
  if (!gig) return <div className="p-8 text-center">Gig not found.</div>;

  // @ts-expect-error session.user lacks id
  const isPoster = session?.user?.id === (gig.postedBy?._id || gig.postedBy);

  return (
    <div className="min-h-screen bg-gray-50 font-medium pb-20">
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
          {gig.application && (
             <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm flex justify-between items-center">
                <div>
                  <span className="font-bold text-gray-700">Assigned Worker: </span>
                  <span className="text-gray-900">{gig.application.workerId.name}</span>
                </div>
                {gig.application.proposedPrice && (
                  <span className="text-blue-600 font-bold">Proposed: ₹{gig.application.proposedPrice}</span>
                )}
             </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Actions</h3>
          
          {!isPoster && gig.status === 'Open' && (
            <div className="space-y-3">
              {gig.isNegotiable && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Your Proposed Price (₹)</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-900 focus:ring-2 focus:ring-black sm:text-sm"
                    placeholder={`e.g. ${gig.payment}`}
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank to accept original price.</p>
                </div>
              )}
              <button 
                onClick={handleAccept}
                disabled={actionLoading}
                className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors"
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

        {/* Chat Section */}
        {gig.status !== 'Open' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="bg-gray-900 p-4 text-white font-bold">
              Chat {isPoster ? `with ${gig.application?.workerId.name}` : `with ${gig.postedBy?.name}`}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 text-sm mt-10">Say hi to start the conversation!</div>
              ) : (
                messages.map((msg) => {
                  // @ts-expect-error session.user lacks id
                  const isMine = msg.senderId === session?.user?.id;
                  return (
                    <div key={msg._id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMine ? 'bg-black text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-black rounded-tl-sm'}`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] text-gray-400">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMine && (
                          msg.isRead ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-black"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="bg-black text-white p-2 w-10 h-10 rounded-full flex items-center justify-center disabled:bg-gray-300 hover:bg-gray-800 transition-colors"
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
