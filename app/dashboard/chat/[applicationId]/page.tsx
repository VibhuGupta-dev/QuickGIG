"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";

export default function ChatPage({ params }: { params: { applicationId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${params.applicationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated") {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, params.applicationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await fetch(`/api/messages/${params.applicationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const newMessage = await res.json();
        setMessages(prev => [...prev, newMessage]);
        setText("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || status === "loading") return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <div className="text-[#94a3b8] text-sm">Loading chat...</div>
    </div>
  );

  // @ts-expect-error session.user lacks id
  const currentUserId = session?.user?.id;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col text-[#0f172a] selection:bg-[#2563eb] selection:text-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#e2e8f0] px-4 py-3 sticky top-0 z-50 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-[#94a3b8] hover:text-[#0f172a] transition-colors p-1.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-[#0f172a]">Chat</h1>
          <p className="text-xs text-[#94a3b8]">Refreshes every 5 seconds</p>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full pb-28 pt-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-3 text-[#2563eb]">
              <Send className="w-5 h-5" />
            </div>
            <p className="text-[#475569] font-medium text-sm">No messages yet</p>
            <p className="text-[#94a3b8] text-xs mt-1">Say hi to get the conversation started!</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-[#2563eb] text-white rounded-tr-sm shadow-xs'
                    : 'bg-white border border-[#e2e8f0] text-[#0f172a] rounded-tl-sm shadow-xs'
                }`}>
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-[#94a3b8]'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </main>

      {/* Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e2e8f0] px-4 py-3 z-50">
        <form onSubmit={handleSend} className="flex gap-2 max-w-2xl mx-auto">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-[#e2e8f0] bg-slate-50 text-[#0f172a] rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] placeholder:text-[#94a3b8] transition-colors"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="bg-[#2563eb] text-white p-2.5 rounded-full hover:bg-[#1d4ed8] disabled:opacity-40 transition-colors shrink-0 flex items-center justify-center shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
