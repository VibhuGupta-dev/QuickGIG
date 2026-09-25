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
    <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center">
      <div className="text-[#8f8d86] text-sm">Loading chat...</div>
    </div>
  );

  // @ts-expect-error session.user lacks id
  const currentUserId = session?.user?.id;

  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col">
      {/* Header */}
      <header className="bg-[#faf9f5]/90 backdrop-blur-md border-b border-[#e8e6df] px-4 py-3 sticky top-0 z-50 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-[#8f8d86] hover:text-[#1f1e1d] transition-colors p-1 rounded-lg hover:bg-[#f0eee6]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-[#1f1e1d]">Chat</h1>
          <p className="text-xs text-[#8f8d86]">Refreshes every 5 seconds</p>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full pb-28 pt-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-12 h-12 rounded-full bg-[#f0eee6] flex items-center justify-center mb-3">
              <Send className="w-5 h-5 text-[#cc785c]" />
            </div>
            <p className="text-[#65635e] font-medium text-sm">No messages yet</p>
            <p className="text-[#8f8d86] text-xs mt-1">Say hi to get the conversation started!</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-[#1f1e1d] text-white rounded-tr-sm'
                    : 'bg-white border border-[#e8e6df] text-[#1f1e1d] rounded-tl-sm'
                }`}>
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-white/50' : 'text-[#8f8d86]'}`}>
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8e6df] px-4 py-3 z-50">
        <form onSubmit={handleSend} className="flex gap-2 max-w-2xl mx-auto">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-[#e8e6df] bg-[#faf9f5] text-[#1f1e1d] rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#cc785c] focus:ring-1 focus:ring-[#cc785c] placeholder:text-[#8f8d86] transition-colors"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="bg-[#cc785c] text-white p-2.5 rounded-full hover:bg-[#b8694f] disabled:opacity-40 transition-colors shrink-0 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
